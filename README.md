# tibetan-unicode-converter

A library for converting ANSI Tibetan from TibetanChogyal to Unicode and back.

Almost all Tibetan characters should be properly transcoded but only a few
Sanskrit characters are currently handled.

## Installation

```bash
npm install tibetan-unicode-converter
```

## Usage

### ANSI to Unicode

```js
import TibetanUnicodeConverter from "tibetan-unicode-converter";

const converter = new TibetanUnicodeConverter(
  "oe×ñÎ >ë-{,-8ß:-bÜ-¹¥/-e$-020<Î"
);
converter.convert();
// => 'ཧཱུྃ༔ ཨོ་རྒྱན་ཡུལ་གྱི་ནུབ་བྱང་མཚམས༔'
```

### Unicode to ANSI

```js
import TibetanUnicodeConverter from "tibetan-unicode-converter";

const converter = new TibetanUnicodeConverter("ཧཱུྃ༔");
converter.convertToAnsi();
// => 'oe×ñÎ'
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

Through the virtue coming from this work, may all beings human and
otherwise reach absolute freedom.

## License

This software is licensed under the MIT License.

Copyright Padmakara, 2021.

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
