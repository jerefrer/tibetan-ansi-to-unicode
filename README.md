# tibetan-unicode-converter

A naive attempt at processing gibberish into Unicode Tibetan.

Almost all Tibetan characters should be properly transcoded but only a few
Sanskrit characters are currently handled.

Getting started
-----------

Just copy the repository locally.

Usage
-----------

### As a library

```js
new TibetanUnicodeConverter('oe×ñÎ >ë-{,-8ß:-bÜ-¹¥/-e$-020<Î').convert()
=> 'ཧཱུྃ༔ ཨོ་རྒྱན་ཡུལ་གྱི་ནུབ་བྱང་མཚམས༔'
```

### As a tool

#### `index.html`

![Demo](./docs/index-small.jpg)

* Open `index.html`
* Fill in the left box with your gibberish
* Click the *Copy to clipboard* button to copy the converted Unicode Tibetan.

Testing
-----------

![Demo](./docs/tests-small.jpg)

* Open `tests.html`
* Categories can be clicked to reveal their test cases.
* To ease debugging, clicking a tibetan case on the right side will re-run the
  test for just that particular case.

License
-----------

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
