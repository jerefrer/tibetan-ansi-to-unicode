import assert from "node:assert";
import { describe, it } from "node:test";
import JSZip from "jszip";
import TibetanUnicodeConverter, {
  convertRun,
  convertRuns,
  normalizeFontName,
  getBudaTable,
  isKnownFont,
  supportedFonts,
  rtfToRuns,
  convertRtf,
  documentXmlToRuns,
  convertDocx,
  convertDocxDocument,
  convertRtfDocument,
} from "../index.js";

describe("homoglyph / decoding fixes (default plain-text table)", () => {
  const conv = (s) => new TibetanUnicodeConverter(s).convert();
  it("µ (U+00B5) is treated like μ (U+03BC) -> ག", () =>
    assert.strictEqual(conv("µུ་རུ"), "གུ་རུ"));
  it("U+0081 -> སྤྱ (was a broken empty mapping)", () =>
    assert.strictEqual(conv("ན་རས"), "སྤྱན་རས"));
  it("œ ligature -> ཧཱུྃ", () => assert.strictEqual(conv("œ×ñ"), "ཧཱུྃ"));
  it("’ (U+2019) -> ཚྭ without breaking ཇ (U+0027)", () => {
    assert.strictEqual(conv("ལན་’འི"), "ལན་ཚྭའི");
    assert.strictEqual(conv("'"), "ཇ");
  });
});

describe("BUDA font registry", () => {
  it("covers the expected fonts", () => {
    assert.ok(supportedFonts.length > 150);
    assert.ok(isKnownFont("TibetanChogyal"));
    assert.ok(isKnownFont("ABCDEF+TibetanChogyalSkt2")); // subset prefix
    assert.ok(!isKnownFont("Arial"));
  });
  it("normalizeFontName strips subset prefix, weight, case, spaces", () => {
    assert.strictEqual(
      normalizeFontName("ABCDEF+TibetanChogyalSkt2 Bold"),
      "tibetanchogyalskt2"
    );
  });
  it("getBudaTable returns a table for known fonts only", () => {
    assert.ok(getBudaTable("TibetanChogyal"));
    assert.strictEqual(getBudaTable("Arial"), null);
  });
});

describe("font-aware conversion (BUDA tables)", () => {
  it("base consonants in the body font", () => {
    assert.strictEqual(convertRun('!"#$', "TibetanChogyal"), "ཀཁགང");
  });
  it("unknown font falls back to default body converter", () => {
    assert.strictEqual(convertRun('!"#$', "Helvetica"), "ཀཁགང");
  });
  it("reconstructs the OM MANI PADME HUM mantra across 3 fonts", () => {
    // Real run sequence extracted from a Chögyal pecha (PDF).
    const runs = [
      { text: ">ù-0-", font: "TibetanChogyal" },
      { text: "C", font: "TibetanMachineWeb" }, // -> ཎ
      { text: "Ü-ý", font: "TibetanChogyal" },
      { text: "V", font: "TibetanChogyalSkt2" }, // subjoined ྨ in context
      { text: "è-œ×ñ", font: "TibetanChogyal" },
    ];
    assert.strictEqual(convertRuns(runs), "ཨོཾ་མ་ཎི་པདྨེ་ཧཱུྃ");
  });
  it("reports unknown fonts via details", () => {
    const r = convertRuns(
      [
        { text: '!', font: "TibetanChogyal" },
        { text: "x", font: "Arial" },
      ],
      { details: true }
    );
    assert.deepStrictEqual(r.unknownFonts, ["Arial"]);
  });
});

describe("RTF parsing", () => {
  const rtf =
    "{\\rtf1{\\fonttbl{\\f0 TibetanChogyal;}}\\f0\\'21\\'22\\'23\\par}";
  it("converts via the run's font", () => {
    assert.strictEqual(convertRtf(rtf).trim(), "ཀཁག");
  });

  it("resolves Mac smart-punctuation control words to the right font byte", () => {
    // \mac doc: \ldblquote is MacRoman byte 0xD2, which in TibetanChogyal is ༄
    // (the yig-mgo head), NOT the curly quote “ -> ཞྭ.
    const macRtf =
      "{\\rtf1\\mac\\ansicpg1252{\\fonttbl{\\f0\\fcharset77 TibetanChogyal;}}" +
      "\\f0 \\ldblquote\\'c8\\'ca\\par}";
    assert.strictEqual(convertRtf(macRtf).trim(), "༄༅།");
    assert.ok(convertRtfDocument(macRtf).includes("\\u3844")); // ༄ in the output
  });
});

describe("DOCX parsing", () => {
  const xml =
    "<w:document><w:body>" +
    '<w:p><w:r><w:rPr><w:rFonts w:cs="TibetanChogyal"/></w:rPr><w:t>!"#</w:t></w:r></w:p>' +
    "</w:body></w:document>";
  it("reads complex-script font + text", () => {
    const runs = documentXmlToRuns(xml);
    assert.strictEqual(runs[0].font, "TibetanChogyal");
  });
  it("convertDocx round-trips a real zip", async () => {
    const zip = new JSZip();
    zip.file("word/document.xml", xml);
    const buf = await zip.generateAsync({ type: "nodebuffer" });
    assert.strictEqual((await convertDocx(buf)).trim(), "ཀཁག");
  });
});

describe("convertDocxDocument (in-place, preserves formatting)", () => {
  it("converts legacy runs, keeps sizes/bold, leaves other runs", async () => {
    const doc =
      '<w:document xmlns:w="x"><w:body><w:p>' +
      '<w:r><w:rPr><w:rFonts w:cs="TibetanChogyal"/><w:sz w:val="68"/><w:szCs w:val="68"/><w:b/></w:rPr><w:t>!"#</w:t></w:r>' +
      '<w:r><w:rPr><w:rFonts w:cs="TibetanChogyalSkt2"/><w:szCs w:val="48"/></w:rPr><w:t>V</w:t></w:r>' +
      '<w:r><w:rPr><w:rFonts w:ascii="Arial"/></w:rPr><w:t>Hello</w:t></w:r>' +
      "</w:p></w:body></w:document>";
    const zip = new JSZip();
    zip.file("word/document.xml", doc);
    const buf = await zip.generateAsync({ type: "nodebuffer" });
    // sizeScale:1 keeps sizes, so we can check pure preservation
    const out = await convertDocxDocument(buf, { unicodeFont: "Jomolhari", sizeScale: 1 });
    const xmlOut = await (await JSZip.loadAsync(out))
      .file("word/document.xml")
      .async("string");
    assert.ok(xmlOut.includes("ཀཁག")); // converted big run
    assert.ok(xmlOut.includes("དྨ")); // converted Sanskrit run
    assert.ok(xmlOut.includes('w:val="68"')); // size preserved (scale 1)
    assert.ok(xmlOut.includes("<w:b/>")); // bold preserved
    assert.ok(xmlOut.includes('w:cs="Jomolhari"')); // unicode font set
    assert.ok(xmlOut.includes(">Hello<")); // non-Tibetan run untouched
    assert.ok(xmlOut.includes('w:ascii="Arial"'));
  });

  it("scales legacy run sizes down for the Unicode font (default)", async () => {
    const doc =
      '<w:document xmlns:w="x"><w:body><w:p>' +
      '<w:r><w:rPr><w:rFonts w:cs="TibetanChogyal"/><w:sz w:val="68"/><w:szCs w:val="68"/></w:rPr><w:t>!</w:t></w:r>' +
      '<w:r><w:rPr><w:rFonts w:ascii="Arial"/><w:sz w:val="24"/></w:rPr><w:t>Hi</w:t></w:r>' +
      "</w:p></w:body></w:document>";
    const zip = new JSZip();
    zip.file("word/document.xml", doc);
    const out = await convertDocxDocument(await zip.generateAsync({ type: "nodebuffer" }), {
      unicodeFont: "Jomolhari",
    });
    const xmlOut = await (await JSZip.loadAsync(out)).file("word/document.xml").async("string");
    assert.ok(xmlOut.includes('w:val="49"')); // 68 * 0.72 -> 49 on the Tibetan run
    assert.ok(!xmlOut.includes('w:val="68"'));
    assert.ok(xmlOut.includes('w:val="24"')); // Arial run size untouched
  });
});

describe("convertRtfDocument (in-place, preserves formatting)", () => {
  it("converts legacy runs to \\u, adds font, keeps sizes and other runs", () => {
    const rtf =
      "{\\rtf1\\ansi{\\fonttbl{\\f0\\fnil TibetanChogyal;}{\\f1\\fnil Times New Roman;}}" +
      "\\f0\\fs48\\'21\\'22\\'23\\f1\\fs24 Hello\\par}";
    const out = convertRtfDocument(rtf, { unicodeFont: "Jomolhari" });
    const decoded = [...out.matchAll(/\\u(\d+)\?/g)]
      .map((m) => String.fromCodePoint(+m[1]))
      .join("");
    assert.strictEqual(decoded, "ཀཁག");
    assert.ok(/Jomolhari;/.test(out)); // font added to table
    assert.ok(out.includes("\\fs48")); // size preserved
    assert.ok(/\\f1\\fs24 Hello/.test(out)); // Times run untouched
  });
});
