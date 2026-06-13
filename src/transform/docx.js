// Convert a .docx IN PLACE: replace each run's legacy-encoded text with Unicode
// and swap its legacy font for a Unicode Tibetan font, leaving every other piece
// of formatting (paragraph styles, run sizes — hence the big/small distinction —
// bold, colour, spacing, tables, …) exactly as it was.
//
// Only runs whose font is a known legacy font (BUDA table) are touched; any other
// run is left byte-for-byte untouched.

import { getBudaTable } from "../fonts.js";

const TARGET_XML = /^word\/(document|header\d+|footer\d+|footnotes|endnotes)\.xml$/;

function decodeEntities(s) {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&amp;/g, "&");
}
function encodeEntities(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function attr(tag, name) {
  const m = tag.match(new RegExp("\\b" + name + '="([^"]*)"'));
  return m ? m[1] : null;
}
function setAttr(tag, name, value) {
  const re = new RegExp("\\b" + name + '="[^"]*"');
  if (re.test(tag)) return tag.replace(re, `${name}="${value}"`);
  // insert before the closing of the (possibly self-closing) tag
  return tag.replace(/\s*\/?>$/, (end) => ` ${name}="${value}"` + end);
}

function convertText(text, table) {
  let out = "";
  for (const ch of text) {
    const u = table[ch.codePointAt(0)];
    out += u !== undefined ? u : ch;
  }
  return out;
}

function resolveFont(runXml, rFontsTag, fallbackFont) {
  if (rFontsTag) {
    return (
      attr(rFontsTag, "w:cs") ||
      attr(rFontsTag, "w:ascii") ||
      attr(rFontsTag, "w:hAnsi") ||
      fallbackFont
    );
  }
  return fallbackFont;
}

function processRun(runXml, unicodeFont, fallbackFont) {
  const rFontsMatch = runXml.match(/<w:rFonts\b[^>]*\/?>/);
  const font = resolveFont(runXml, rFontsMatch && rFontsMatch[0], fallbackFont);
  const table = font && getBudaTable(font);
  if (!table) return runXml; // not a legacy Tibetan run — leave untouched

  // 1) convert the text in each <w:t>
  let out = runXml.replace(
    /(<w:t\b[^>]*>)([\s\S]*?)(<\/w:t>)/g,
    (m, open, body, close) => {
      const conv = convertText(decodeEntities(body), table);
      // preserve leading/trailing spaces
      if (/^\s|\s$/.test(conv) && !/xml:space=/.test(open)) {
        open = open.replace(/>$/, ' xml:space="preserve">');
      }
      return open + encodeEntities(conv) + close;
    }
  );

  // 2) point the run at the Unicode font (ascii + hAnsi + cs)
  let newFonts;
  if (rFontsMatch) {
    newFonts = rFontsMatch[0];
    for (const a of ["w:ascii", "w:hAnsi", "w:cs"]) newFonts = setAttr(newFonts, a, unicodeFont);
    out = out.replace(rFontsMatch[0], newFonts);
  } else {
    const tag = `<w:rFonts w:ascii="${unicodeFont}" w:hAnsi="${unicodeFont}" w:cs="${unicodeFont}"/>`;
    if (/<w:rPr>/.test(out)) {
      out = out.replace(/<w:rPr>/, "<w:rPr>" + tag); // rFonts must be first in rPr
    } else {
      out = out.replace(/(<w:r\b[^>]*>)/, `$1<w:rPr>${tag}</w:rPr>`);
    }
  }
  return out;
}

function processXml(xml, unicodeFont, fallbackFont) {
  return xml.replace(/<w:r\b[^>]*>[\s\S]*?<\/w:r>/g, (run) =>
    processRun(run, unicodeFont, fallbackFont)
  );
}

// Read the document's default font (docDefaults) so runs without an explicit
// rFonts can still be converted when the default is a legacy font.
function readDefaultFont(stylesXml) {
  if (!stylesXml) return null;
  const dd = stylesXml.match(/<w:docDefaults>[\s\S]*?<\/w:docDefaults>/);
  const rf = (dd ? dd[0] : stylesXml).match(/<w:rFonts\b[^>]*\/?>/);
  if (!rf) return null;
  const f = attr(rf[0], "w:cs") || attr(rf[0], "w:ascii") || attr(rf[0], "w:hAnsi");
  return f && getBudaTable(f) ? f : null;
}

// data: ArrayBuffer | Uint8Array | Buffer of the .docx.
// Returns a Uint8Array of the converted .docx.
export async function convertDocxDocument(data, options = {}) {
  const unicodeFont = options.unicodeFont || "Jomolhari";
  const { default: JSZip } = await import("jszip");
  const zip = await JSZip.loadAsync(data);

  const stylesFile = zip.file("word/styles.xml");
  const fallbackFont = stylesFile
    ? readDefaultFont(await stylesFile.async("string"))
    : null;

  await Promise.all(
    Object.keys(zip.files)
      .filter((name) => TARGET_XML.test(name))
      .map(async (name) => {
        const xml = await zip.file(name).async("string");
        zip.file(name, processXml(xml, unicodeFont, fallbackFont));
      })
  );

  return zip.generateAsync({ type: "uint8array" });
}
