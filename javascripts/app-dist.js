"use strict";

var app;
$(function () {
  Vue.component('converted-lines', {
    props: {
      language: String,
      lines: Array
    },
    computed: {
      convertedLines: function convertedLines() {
        return this.lines.map(function (line) {
          return new Converter(line).convert();
        }).join("\n");
      }
    },
    mounted: function mounted() {
      new Clipboard('#copy-to-clipboard');
    },
    template: "\n      <div class=\"ui form\">\n        <textarea id=\"transliteration\" readonly=\"\">{{convertedLines}}</textarea>\n      </div>\n    "
  });
  app = new Vue({
    el: '#main',
    data: {
      text: "\n        *\xDC#-:\xE8-&\xE8,-\xFD\xEB9-U\xA8-+$-5\xDC$-\"0<-J\xEB#<\xCA \xCA\n        +0-2\xDD#-&\xE8,-\xFD\xEB9-$-v$-02,-0-+# \xCA\n        a/-/E:-&\xE8,-\xFD\xEB9-9\xE8-+\xEB#<-0\xB8\xA5+-\xFD-i\xEB:\xCA \xCA\n        J\xEB#<-\xFD-&\xE8,-\xFD\xEB9-&\xEB<-U\xA8-0$\xEB,-b\xB29-;\xEB# \xCA\n        /{\xE6+-\xFD-#<\xDF0-b\xDC-e\xDC,-x/<-X\xDC$-:-\xBA\xA5#<\xCA \xCA\n        \u20AC\xE7-7n\xE1:-\u0161-/7\xDC-:0-#<$-<\xE80<-:-J\xEB#<\xCA \xCA\n        n\xDC,-:<-F0-/5\xDC-T\xA9,-b\xDC<-i\xE1/-\xFD-8\xDC<\xCA \xCA\n        0\xDF-0*7-0\xE8+-\xFD7\xDC-7i\xEB-/-\u2026\xEB:-/9-;\xEB# \xCA\n      ".replace(/ /g, '').trim()
    },
    computed: {
      lines: function lines() {
        return this.text ? this.text.split("\n") : [];
      }
    },
    template: "\n      <div class=\"ui container\">\n        <div id=\"scrollable-area-container\">\n          <clipboard-button v-if=\"text\"></clipboard-button>\n          <div id=\"scrollable-area\">\n            <div class=\"ui form\">\n              <textarea v-model=\"text\"></textarea>\n            </div>\n            <converted-lines\n              v-bind:lines=\"lines\"\n            ></converted-lines>\n          </div>\n        </div>\n      </div>\n    "
  });
});