# tibetan-ansi-to-unicode

A library for converting ANSI Tibetan from TibetanChogyal to Unicode and back.

Almost all Tibetan characters should be properly transcoded but only a few
Sanskrit characters are currently handled.

This library is directly usable as a web app here : https://tibetan-ansi-to-unicode.vercel.app/

The repo of the web app is here : https://github.com/jerefrer/tibetan-ansi-to-unicode-app

## Installation

```bash
npm install tibetan-ansi-to-unicode
```

## Usage

### ANSI to Unicode

```js
import TibetanAnsiToUnicode from "tibetan-ansi-to-unicode";

const converter = new TibetanAnsiToUnicode("oe×ñÎ >ë-{,-8ß:-bÜ-¹¥/-e$-020<Î");
converter.convert();
// => 'ཧཱུྃ༔ ཨོ་རྒྱན་ཡུལ་གྱི་ནུབ་བྱང་མཚམས༔'
```

### Unicode to ANSI

```js
import TibetanAnsiToUnicode from "tibetan-unicode-converter";

const converter = new TibetanAnsiToUnicode("ཧཱུྃ༔");
converter.convertToAnsi();
// => 'oe×ñÎ'
```

### Font-aware conversion (Word / RTF)

Legacy Tibetan fonts reuse the same 8-bit codes for different glyphs: the body
font (TibetanChogyal) and its Sanskrit companions (TibetanChogyalSkt1..5,
TibetanMachineWeb) put _different_ stacked letters at the same byte. Plain text
loses that distinction, so a byte like `V` is ambiguous (སྒ in the body font,
དྨ in the Sanskrit font). When you convert from a **Word `.docx`** or **`.rtf`**
file, the per-run font is known and the ambiguity disappears.

```js
import { convertDocx, convertRtf, convertRuns } from "tibetan-ansi-to-unicode";

// From a .docx (Browser File/ArrayBuffer, or Node Buffer):
const unicode = await convertDocx(arrayBuffer);

// From RTF text:
const unicode2 = convertRtf(rtfString);

// Or directly from font-tagged runs (e.g. parsed from pasted HTML):
convertRuns([
  { text: "ý", font: "TibetanChogyal" },
  { text: "V", font: "TibetanChogyalSkt2" }, // -> དྨ, not སྒ
  { text: "è", font: "TibetanChogyal" },
]); // => "པདྨེ"
```

Plain-text conversion is unchanged and assumes the body TibetanChogyal font.

#### Supported fonts

Font-aware conversion is backed by BUDA's authoritative, reviewed legacy-encoding
tables ([py-tiblegenc](https://github.com/buda-base/py-tiblegenc)), covering ~194
fonts — TibetanChogyal (+Skt1–5), TibetanMachine / TibetanMachineWeb, Esams,
Ededris, Dzongkha, Classic, and many more. Sanskrit conjuncts (retroflexes,
aspirates, multi-level stacks) are handled: a per-run lookup yields atomic pieces
that concatenate into the correct cluster (validated end-to-end against a pecha at
99.95%). `supportedFonts` lists every recognised PostScript name; `isKnownFont(name)`
tests one. Unknown fonts fall back to the default body converter.

The tables in `src/buda-tables.js` are generated — re-run the importer to pick up
upstream fixes:

```bash
pip install "git+https://github.com/buda-base/py-tiblegenc"
python scripts/import-buda-tables.py
```

### Test Data

The package also exports test data that can be used for validation:

```js
import { testGroups } from "tibetan-unicode-converter";

// testGroups is an array of test groups, each containing:
// - name: string
// - tests: array of { tibetan: string, conversion: string }
// - includeInPercentage?: boolean
// - sentences?: boolean
```

## Testing

```bash
npm test
```

## Credits

A zillion thanks to:

- Tony Duff and friends for producing all these beautiful Tibetan fonts.
- The Buddhist Digital Archives (BDRC / BUDA) for the
  [py-tiblegenc](https://github.com/buda-base/py-tiblegenc) font tables that power
  the font-aware conversion, and to the upstream sources behind them — Élie Roux,
  the Trace Foundation (UTFC), Leigh Brasington (UDP), Frederick Johnson (ATTU),
  and the Padmakara Translation Committee (TibetanChogyal review).

Through the virtue coming from this work, may all beings human and
otherwise reach absolute freedom.

## License

This software is licensed under the MIT License.

The bundled font tables in `src/buda-tables.js` are derived from BUDA's
[py-tiblegenc](https://github.com/buda-base/py-tiblegenc) and are licensed under
the **Apache License 2.0** (see [`LICENSES/py-tiblegenc-Apache-2.0.txt`](LICENSES/py-tiblegenc-Apache-2.0.txt)
and [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md)).

Copyright Padmakara, 2025.

Permission is hereby granted, free of charge, to any person obtaining a
copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to permit
persons to whom the Software is furnished to do so, subject to the
following conditions:

The above copyright notice and this permission notice shall be included
in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
USE OR OTHER DEALINGS IN THE SOFTWARE.
