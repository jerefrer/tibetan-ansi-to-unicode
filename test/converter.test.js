import assert from "node:assert";
import { describe, it } from "node:test";
import TibetanUnicodeConverter, { testGroups } from "../index.js";

describe("TibetanUnicodeConverter", () => {
  describe("ANSI to Unicode conversion", () => {
    for (const group of testGroups) {
      describe(group.name, () => {
        for (const test of group.tests) {
          it(`should convert "${test.conversion}" to "${test.tibetan}"`, () => {
            const converter = new TibetanUnicodeConverter(test.conversion);
            const result = converter.convert();
            assert.strictEqual(result, test.tibetan);
          });
        }
      });
    }
  });

  describe("Unicode to ANSI conversion", () => {
    it("should convert basic Tibetan text to ANSI", () => {
      const converter = new TibetanUnicodeConverter("ཀ");
      const result = converter.convertToAnsi();
      assert.strictEqual(result, "!");
    });

    it("should handle multi-line conversion", () => {
      const input = "ཧཱུྃ༔";
      const converter = new TibetanUnicodeConverter(input);
      const ansi = converter.convertToAnsi();
      assert.ok(ansi.length > 0);
    });
  });

  describe("Round-trip conversion", () => {
    const sampleTexts = [
      { ansi: "!", tibetan: "ཀ" },
      { ansi: "#è", tibetan: "གེ" },
      { ansi: "oe×ñÎ", tibetan: "ཧཱུྃ༔" },
    ];

    for (const { ansi, tibetan } of sampleTexts) {
      it(`should round-trip "${ansi}" correctly`, () => {
        const toUnicode = new TibetanUnicodeConverter(ansi).convert();
        assert.strictEqual(toUnicode, tibetan);
      });
    }
  });
});
