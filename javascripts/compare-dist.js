"use strict";

var app;
$(function () {
  Vue.component('tibetan-input', {
    props: ['value'],
    template: "\n      <div class=\"ui form\" style=\"position: relative;\">\n        <div v-if=\"!value\" id=\"tibetan-placeholder\">\n          Input the tibetan here...\n        </div>\n        <textarea\n          v-bind:value=\"value\"\n          v-on:input=\"$emit('input', $event.target.value)\"\n          spellcheck=\"false\"\n          id=\"tibetan\"\n        ></textarea>\n      </div>\n    ",
    mounted: function mounted() {
      var that = this;
      $('#tibetan').autosize();
      $('#tibetan').on('paste', function (event) {
        event.preventDefault();
        var pastedData = event.originalEvent.clipboardData.getData('text/plain');
        that.$emit('paste', pastedData);
        setTimeout(function () {
          //$('#tibetan').trigger('input');
          updateHeight();
        }, 100);
      });
    }
  });
  Vue.component('converted-lines', {
    props: {
      expectedConverted: String,
      lines: Array
    },
    methods: {
      expectedLines: function expectedLines() {
        return this.expectedConverted.split("\n");
      },
      emitClickPart: function emitClickPart(result) {
        this.$emit('click-part', result);
      }
    },
    computed: {
      convertedLines: function convertedLines() {
        var that = this;
        return this.lines.map(function (line, index) {
          return {
            expected: that.expectedLines()[index],
            actual: new Converter(line).convert().capitalize()
          };
        });
      }
    },
    template: "\n      <div id=\"converted\">\n        <test-diff\n          class=\"line\"\n          v-for=\"(line, index) in convertedLines\"\n          v-bind:key=\"index\"\n          v-bind:lineIndex=\"index\"\n          v-bind:expected=\"line.expected\"\n          v-bind:actual=\"line.actual\"\n          v-on:click-part=\"emitClickPart($event)\"\n        ></test-diff>\n      </div>\n    "
  });
  Vue.component('test-diff', {
    props: {
      lineIndex: Number,
      expected: String,
      actual: String
    },
    computed: {
      parts: function parts() {
        return JsDiff.diffChars(this.expected, this.actual);
      }
    },
    methods: {
      emitClickPart: function emitClickPart(clickedPart, clickedPartIndex) {
        var parts = this.parts;
        var updatedLine = '';

        _(parts).each(function (part, index) {
          if (clickedPart == parts[index - 1] && part.added) updatedLine += part.value;else if (clickedPart == part && part.added) updatedLine += part.value;else {
            if (part.removed && !(clickedPart == part) && !(clickedPart == parts[index + 1] && parts[index + 1].added)) updatedLine += part.value;
            if (!part.removed && !part.added) updatedLine += part.value;
          }
        });

        this.$emit('click-part', {
          lineIndex: this.lineIndex,
          updatedLine: updatedLine
        });
      }
    },
    template: "\n      <div>\n        <span\n          v-for=\"(part, partIndex) in parts\"\n          v-on:click=\"(part.added || part.removed) && emitClickPart(part, partIndex)\"\n          v-bind:style=\"[part.added ? {color: '#2185d0', 'font-weight': 'bold'} : '', part.removed ? {color: '#db2828', 'font-weight': 'bold'} : '']\"\n          >{{part.added || part.removed ? part.value.replace(/ /, '_') : part.value}}</span>\n      </div>\n    "
  });
  app = new Vue({
    el: '#main',
    data: {
      encoded: "\n        \xC9\xCA \xCAa/-/+#-+$-\xFD\xEB7\xDC-<$<-{<-\xB4\xA5,-\xB7\xE2-/6$-\xCA \xCA\n        6\xDF$-7'\xDF#-\u20AC\xE7-7n\xE1:-8\xE8-;\xE8<-E\xEB-B\xE8-<\xE80<\xCA \xCA\n        7/9-/7\xDC-U\xA89-[$-/\u2030-\xB4\xA5-0\xA1-9\xCA \xCA\n        #<\xEB:-/-7+\xE8/<-<\xEB-n\xDC,-:<-0*9-d\xDC,-;\xEB# \xCA\n        #<$-/7\xDC-03\xEC+-73\xDD,-/+\xE8-/7\xDC-7\"\xEB9-:\xEB-&\xE8\xCA \xCA\n        n\xDC,-:<-8\xEB$<-i\xE1/-7\xEB+-6\xE89-u$-\xFD\xEB7\xDC-5/<\xCA \xCA\n        =\xE8-9\xDF-!-+\xFD:-E\xEB-B\xE8-*\xEB+-n\xE8$-I:\xCA \xCA\n        #<\xEB:-/-7+\xE8/<-<\xEB-n\xDC,-:<-0*9-d\xDC,-;\xEB# \xCA\n        /!7-//<-*\xDF#<-`\xDC-#6\xDF$<-0-0\"9-&\xE8,-/67\xCA \xCA\n        6/-#<$-{-7i\xEB:-#)\xE89-7e\xDC,-\u2021\xE5:-\xFD7\xDC-U\xA8\xCA \xCA\n        U:-Q,-&\xEB<-/+#-I-/{\xE6+-v-0-:\xCA \xCA\n        #<\xEB:-/-7+\xE8/<-<\xEB-n\xDC,-:<-0*9-d\xDC,-;\xEB#\n        [$-i#<-9\xDC#-\xFD-+`\xDC:-7\"\xEB9-#<\xDF0-\xB8\xA5-+# \xCA\n        *:-7e\xDC,-F0-/5\xDC7\xDC-i\xE1/-0*7-2+-\xB8\xA5-7a\xEB:\xCA \xCA\n        I\xEB:-0\xE8+-n\xDC,-:<-&#<-*\xEB#<-0\xDC-0$7-/<\xCA \xCA\n        /\xB8\xA5+-:<-F0-{:-#\xEB-7.$-0&\xEB#-*\xEB/-;\xEB# \xCA\n        %\xE8<-\xFD7$-7'\xDC#<-o:-8\xE8-;\xE8<-E\xEB-B\xE8<-<\xEB\xCA \xCA+#\xE87\xEB\xCA\xCA\n      ".replace(/^[ ]*/gm, '').trim(),
      tibetan: "\n        \u0F04\u0F05\u0F0D \u0F0D\u0F41\u0FB1\u0F56\u0F0B\u0F56\u0F51\u0F42\u0F0B\u0F51\u0F44\u0F0B\u0F54\u0F7C\u0F60\u0F72\u0F0B\u0F66\u0F44\u0F66\u0F0B\u0F62\u0F92\u0FB1\u0F66\u0F0B\u0F40\u0F74\u0F53\u0F0B\u0F4F\u0F74\u0F0B\u0F56\u0F5F\u0F44\u0F0B\u0F0D \u0F0D\n        \u0F5F\u0F74\u0F44\u0F0B\u0F60\u0F47\u0F74\u0F42\u0F0B\u0F66\u0F92\u0FB1\u0F74\u0F0B\u0F60\u0F55\u0FB2\u0F74\u0F63\u0F0B\u0F61\u0F7A\u0F0B\u0F64\u0F7A\u0F66\u0F0B\u0F62\u0FA1\u0F7C\u0F0B\u0F62\u0F97\u0F7A\u0F0B\u0F66\u0F7A\u0F58\u0F66\u0F0D \u0F0D\n        \u0F60\u0F56\u0F62\u0F0B\u0F56\u0F60\u0F72\u0F0B\u0F66\u0F90\u0F74\u0F62\u0F0B\u0F66\u0FA3\u0F44\u0F0B\u0F56\u0F5B\u0FB2\u0F0B\u0F40\u0F74\u0F0B\u0F58\u0F71\u0F0B\u0F62\u0F0D \u0F0D\n        \u0F42\u0F66\u0F7C\u0F63\u0F0B\u0F56\u0F0B\u0F60\u0F51\u0F7A\u0F56\u0F66\u0F0B\u0F66\u0F7C\u0F0B\u0F55\u0FB2\u0F72\u0F53\u0F0B\u0F63\u0F66\u0F0B\u0F58\u0F50\u0F62\u0F0B\u0F55\u0FB1\u0F72\u0F53\u0F0B\u0F64\u0F7C\u0F42 \u0F0D\n        \u0F42\u0F66\u0F44\u0F0B\u0F56\u0F60\u0F72\u0F0B\u0F58\u0F5B\u0F7C\u0F51\u0F0B\u0F60\u0F5B\u0F72\u0F53\u0F0B\u0F56\u0F51\u0F7A\u0F0B\u0F56\u0F60\u0F72\u0F0B\u0F60\u0F41\u0F7C\u0F62\u0F0B\u0F63\u0F7C\u0F0B\u0F46\u0F7A\u0F0D \u0F0D\n        \u0F55\u0FB2\u0F72\u0F53\u0F0B\u0F63\u0F66\u0F0B\u0F61\u0F7C\u0F44\u0F66\u0F0B\u0F42\u0FB2\u0F74\u0F56\u0F0B\u0F60\u0F7C\u0F51\u0F0B\u0F5F\u0F7A\u0F62\u0F0B\u0F42\u0FB3\u0F44\u0F0B\u0F54\u0F7C\u0F60\u0F72\u0F0B\u0F5E\u0F56\u0F66\u0F0D \u0F0D\n        \u0F67\u0F7A\u0F0B\u0F62\u0F74\u0F0B\u0F40\u0F0B\u0F51\u0F54\u0F63\u0F0B\u0F62\u0FA1\u0F7C\u0F0B\u0F62\u0F97\u0F7A\u0F0B\u0F50\u0F7C\u0F51\u0F0B\u0F55\u0FB2\u0F7A\u0F44\u0F0B\u0F62\u0FA9\u0F63\u0F0D \u0F0D\n        \u0F42\u0F66\u0F7C\u0F63\u0F0B\u0F56\u0F0B\u0F60\u0F51\u0F7A\u0F56\u0F66\u0F0B\u0F66\u0F7C\u0F0B\u0F55\u0FB2\u0F72\u0F53\u0F0B\u0F63\u0F66\u0F0B\u0F58\u0F50\u0F62\u0F0B\u0F55\u0FB1\u0F72\u0F53\u0F0B\u0F64\u0F7C\u0F42 \u0F0D\n        \u0F56\u0F40\u0F60\u0F0B\u0F56\u0F56\u0F66\u0F0B\u0F50\u0F74\u0F42\u0F66\u0F0B\u0F40\u0FB1\u0F72\u0F0B\u0F42\u0F5F\u0F74\u0F44\u0F66\u0F0B\u0F58\u0F0B\u0F58\u0F41\u0F62\u0F0B\u0F46\u0F7A\u0F53\u0F0B\u0F56\u0F5F\u0F60\u0F0D \u0F0D\n        \u0F5F\u0F56\u0F0B\u0F42\u0F66\u0F44\u0F0B\u0F62\u0F92\u0FB1\u0F0B\u0F60\u0F42\u0FB2\u0F7C\u0F63\u0F0B\u0F42\u0F4F\u0F7A\u0F62\u0F0B\u0F60\u0F56\u0FB1\u0F72\u0F53\u0F0B\u0F66\u0FA4\u0FB2\u0F74\u0F63\u0F0B\u0F54\u0F60\u0F72\u0F0B\u0F66\u0F90\u0F74\u0F0D \u0F0D\n        \u0F66\u0F90\u0F63\u0F0B\u0F63\u0FA1\u0F53\u0F0B\u0F46\u0F7C\u0F66\u0F0B\u0F56\u0F51\u0F42\u0F0B\u0F62\u0FA9\u0F0B\u0F56\u0F62\u0F92\u0FB1\u0F74\u0F51\u0F0B\u0F56\u0FB3\u0F0B\u0F58\u0F0B\u0F63\u0F0D \u0F0D\n        \u0F42\u0F66\u0F7C\u0F63\u0F0B\u0F56\u0F0B\u0F60\u0F51\u0F7A\u0F56\u0F66\u0F0B\u0F66\u0F7C\u0F0B\u0F55\u0FB2\u0F72\u0F53\u0F0B\u0F63\u0F66\u0F0B\u0F58\u0F50\u0F62\u0F0B\u0F55\u0FB1\u0F72\u0F53\u0F0B\u0F64\u0F7C\u0F42\n        \u0F66\u0FA3\u0F44\u0F0B\u0F42\u0FB2\u0F42\u0F66\u0F0B\u0F62\u0F72\u0F42\u0F0B\u0F54\u0F0B\u0F51\u0F40\u0FB1\u0F72\u0F63\u0F0B\u0F60\u0F41\u0F7C\u0F62\u0F0B\u0F42\u0F66\u0F74\u0F58\u0F0B\u0F51\u0F74\u0F0B\u0F51\u0F42 \u0F0D\n        \u0F50\u0F63\u0F0B\u0F60\u0F56\u0FB1\u0F72\u0F53\u0F0B\u0F62\u0FA3\u0F58\u0F0B\u0F56\u0F5E\u0F72\u0F60\u0F72\u0F0B\u0F42\u0FB2\u0F74\u0F56\u0F0B\u0F58\u0F50\u0F60\u0F0B\u0F5A\u0F51\u0F0B\u0F51\u0F74\u0F0B\u0F60\u0F41\u0FB1\u0F7C\u0F63\u0F0D \u0F0D\n        \u0F62\u0FA9\u0F7C\u0F63\u0F0B\u0F58\u0F7A\u0F51\u0F0B\u0F55\u0FB2\u0F72\u0F53\u0F0B\u0F63\u0F66\u0F0B\u0F46\u0F42\u0F66\u0F0B\u0F50\u0F7C\u0F42\u0F66\u0F0B\u0F58\u0F72\u0F0B\u0F58\u0F44\u0F60\u0F0B\u0F56\u0F66\u0F0D \u0F0D\n        \u0F56\u0F51\u0F74\u0F51\u0F0B\u0F63\u0F66\u0F0B\u0F62\u0FA3\u0F58\u0F0B\u0F62\u0F92\u0FB1\u0F63\u0F0B\u0F42\u0F7C\u0F0B\u0F60\u0F55\u0F44\u0F0B\u0F58\u0F46\u0F7C\u0F42\u0F0B\u0F50\u0F7C\u0F56\u0F0B\u0F64\u0F7C\u0F42 \u0F0D\n        \u0F45\u0F7A\u0F66\u0F0B\u0F54\u0F60\u0F44\u0F0B\u0F60\u0F47\u0F72\u0F42\u0F66\u0F0B\u0F56\u0FB2\u0F63\u0F0B\u0F61\u0F7A\u0F0B\u0F64\u0F7A\u0F66\u0F0B\u0F62\u0FA1\u0F7C\u0F0B\u0F62\u0F97\u0F7A\u0F66\u0F0B\u0F66\u0F7C\u0F0D \u0F0D\u0F51\u0F42\u0F7A\u0F60\u0F7C\u0F0D\u0F0D\n      ".replace(/^[ ]*/gm, '').trim()
    },
    computed: {
      lines: function lines() {
        return this.encoded ? this.encoded.split("\n") : [];
      }
    },
    methods: {
      correctSource: function correctSource(result) {
        var lines = this.encoded.split("\n");
        lines[result.lineIndex] = result.updatedLine;
        this.encoded = lines.join("\n");
      }
    },
    template: "\n      <div class=\"ui container compare\">\n        <div id=\"scrollable-area-container\">\n          <div id=\"scrollable-area\">\n            <div class=\"form\">\n              <textarea\n                id=\"encoded\"\n                v-model=\"encoded\"\n                v-on:paste=\"encoded = $event\"\n              ></textarea>\n            </div>\n            <tibetan-input\n              v-model=\"tibetan\"\n              v-on:paste=\"tibetan = $event\"\n            ></tibetan-input>\n            <div class=\"form\">\n              <converted-lines\n                v-bind:lines=\"lines\"\n                v-bind:expectedConverted=\"tibetan\"\n                v-on:click-part=\"correctSource($event)\"\n              ></converted-lines>\n            </div>\n          </div>\n        </div>\n      </div>\n    "
  });
});