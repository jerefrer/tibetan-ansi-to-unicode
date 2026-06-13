// Convert an .rtf IN PLACE: replace legacy-encoded text (in known legacy fonts)
// with Unicode emitted as \uN escapes, and repoint those runs at a Unicode
// Tibetan font added to the font table. All other control words — sizes (\fsN,
// hence big/small), bold (\b), paragraphs, colours, etc. — are passed through
// untouched, and runs in non-legacy fonts are left as-is.

import { getBudaTable, defaultSizeScale } from "../fonts.js";

// Control words that stand for a literal character (Word writes smart quotes /
// dashes this way). In legacy fonts these code points are Tibetan glyphs, so
// they must go through conversion, not be passed through as punctuation.
const RTF_SYM = {
  ldblquote: "“", rdblquote: "”", lquote: "‘", rquote: "’",
  emdash: "—", endash: "–", bullet: "•",
};

const IGNORE_DEST = new Set([
  "colortbl", "stylesheet", "info", "pict", "object", "themedata",
  "colorschememapping", "latentstyles", "datastore", "listtable",
  "listoverridetable", "rsidtbl", "generator", "filetbl",
]);

function parseFontTableRegion(rtf) {
  const at = rtf.indexOf("\\fonttbl");
  if (at < 0) return null;
  const gs = rtf.lastIndexOf("{", at);
  let depth = 0, ge = -1;
  for (let i = gs; i < rtf.length; i++) {
    if (rtf[i] === "{") depth++;
    else if (rtf[i] === "}") {
      depth--;
      if (depth === 0) { ge = i; break; }
    }
  }
  if (ge < 0) return null;
  const group = rtf.slice(gs, ge + 1);
  const fonts = {};
  let maxF = 0;
  const re = /\\f(\d+)\b[^;{}]*?(?:\\[a-z]+-?\d* ?)*\s*([^;{}]*);/gi;
  let m;
  while ((m = re.exec(group))) {
    const id = parseInt(m[1], 10);
    const name = (m[2] || "").replace(/\\[a-z]+-?\d* ?/gi, "").trim();
    if (name) fonts[id] = name;
    if (id > maxF) maxF = id;
  }
  return { gs, ge, group, fonts, maxF };
}

export function convertRtfDocument(rtf, options = {}) {
  rtf = String(rtf);
  const unicodeFont = options.unicodeFont || "Jomolhari";
  const sizeScale = options.sizeScale ?? defaultSizeScale(unicodeFont);
  const ft = parseFontTableRegion(rtf);
  if (!ft) return rtf; // not an RTF we understand

  const newF = ft.maxF + 1;
  const newEntry = `{\\f${newF}\\fnil\\fcharset0 ${unicodeFont};}`;
  const newGroup = ft.group.slice(0, -1) + newEntry + "}";
  const legacy = new Set(
    Object.keys(ft.fonts)
      .map(Number)
      .filter((id) => getBudaTable(ft.fonts[id]))
  );

  const prefix = rtf.slice(0, ft.gs) + newGroup;
  const body = rtf.slice(ft.ge + 1);

  const out = { s: prefix };
  const stack = [{ font: null, ignore: false, size: null }];
  const cur = () => stack[stack.length - 1];
  const curLegacy = () => cur().font != null && legacy.has(cur().font) && !cur().ignore;
  let buf = "";
  let bufTable = null;
  function flush() {
    if (!buf) return;
    const conv = convert(buf, bufTable);
    const sz = cur().size;
    const scaled = sizeScale !== 1 && sz;
    out.s += "\\uc1 ";
    if (scaled) out.s += "\\fs" + Math.max(1, Math.round(sz * sizeScale)) + " ";
    for (const ch of conv) out.s += "\\u" + ch.codePointAt(0) + "?";
    if (scaled) out.s += "\\fs" + sz + " ";
    buf = "";
  }
  function convert(text, table) {
    let r = "";
    for (const ch of text) {
      const u = table[ch.codePointAt(0)];
      r += u !== undefined ? u : ch;
    }
    return r;
  }

  let i = 0;
  const n = body.length;
  while (i < n) {
    const c = body[i];
    if (c === "{") {
      flush();
      stack.push({ font: cur().font, ignore: cur().ignore, size: cur().size });
      out.s += "{";
      i++;
    } else if (c === "}") {
      flush();
      out.s += "}";
      if (stack.length > 1) stack.pop();
      i++;
    } else if (c === "\\") {
      const next = body[i + 1];
      if (next === "'") {
        const hex = body.substr(i + 2, 2);
        if (curLegacy()) {
          buf += String.fromCharCode(parseInt(hex, 16));
          bufTable = getBudaTable(ft.fonts[cur().font]);
        } else out.s += body.substr(i, 4);
        i += 4;
      } else if (next === "\\" || next === "{" || next === "}") {
        if (curLegacy()) buf += next;
        else out.s += body.substr(i, 2);
        i += 2;
      } else if (/[a-zA-Z]/.test(next)) {
        let j = i + 1;
        while (j < n && /[a-zA-Z]/.test(body[j])) j++;
        const word = body.slice(i + 1, j);
        let num = "";
        if (body[j] === "-") { num += "-"; j++; }
        while (j < n && /[0-9]/.test(body[j])) { num += body[j]; j++; }
        const tok = body.slice(i, j);
        let trailing = "";
        if (body[j] === " ") { trailing = " "; j++; }
        if (word === "f" && num !== "") {
          flush();
          const fid = parseInt(num, 10);
          cur().font = fid;
          if (legacy.has(fid) && !cur().ignore) out.s += "\\f" + newF + (trailing || " ");
          else out.s += tok + trailing;
        } else if (word === "fs" && num !== "") {
          if (curLegacy()) flush();
          cur().size = parseInt(num, 10);
          out.s += tok + trailing;
        } else if (RTF_SYM[word] !== undefined) {
          if (curLegacy()) {
            buf += RTF_SYM[word];
            bufTable = getBudaTable(ft.fonts[cur().font]);
          } else out.s += tok + trailing;
        } else if (IGNORE_DEST.has(word.toLowerCase())) {
          cur().ignore = true;
          flush();
          out.s += tok + trailing;
        } else {
          if (curLegacy()) flush();
          out.s += tok + trailing;
        }
        i = j;
      } else {
        out.s += body.substr(i, 2);
        i += 2;
      }
    } else if (c === "\r" || c === "\n") {
      out.s += c;
      i++;
    } else {
      if (curLegacy()) {
        buf += c;
        bufTable = getBudaTable(ft.fonts[cur().font]);
      } else out.s += c;
      i++;
    }
  }
  flush();
  return out.s;
}
