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
