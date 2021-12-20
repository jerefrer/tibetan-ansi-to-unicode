var app;
$(function() {
  Vue.component('tibetan-input', {
    props: ['value'],
    template: `
      <div class="ui form" style="position: relative;">
        <div v-if="!value" id="tibetan-placeholder">
          Input the tibetan here...
        </div>
        <textarea
          v-bind:value="value"
          v-on:input="$emit('input', $event.target.value)"
          spellcheck="false"
          id="tibetan"
        ></textarea>
      </div>
    `,
    mounted: function() {
      var that = this;
      $('#tibetan').autosize();
      $('#tibetan').on('paste', function(event) {
        event.preventDefault();
        var pastedData = event.originalEvent.clipboardData.getData('text/plain');
        that.$emit('paste', pastedData);
        setTimeout(function() {
          //$('#tibetan').trigger('input');
          updateHeight();
        }, 100)
      });
    }
  });
  Vue.component('converted-lines', {
    props: {
      expectedConverted: String,
      lines: Array
    },
    methods: {
      expectedLines: function() {
        return this.expectedConverted.split("\n");
      },
      emitClickPart: function(result) {
        this.$emit('click-part', result);
      }
    },
    computed: {
      convertedLines: function() {
        var that = this;
        return this.lines.map(function(line, index) {
          return {
            expected: that.expectedLines()[index],
            actual: new TibetanUnicodeConverter(line).convert().capitalize()
          }
        });
      },
    },
    template: `
      <div id="converted">
        <test-diff
          class="line"
          v-for="(line, index) in convertedLines"
          v-bind:key="index"
          v-bind:lineIndex="index"
          v-bind:expected="line.expected"
          v-bind:actual="line.actual"
          v-on:click-part="emitClickPart($event)"
        ></test-diff>
      </div>
    `
  })
  Vue.component('test-diff', {
    props: {
      lineIndex: Number,
      expected: String,
      actual: String
    },
    computed: {
      parts: function() {
        return JsDiff.diffChars(this.expected, this.actual);
      }
    },
    methods: {
      emitClickPart: function(clickedPart, clickedPartIndex) {
        var parts = this.parts;
        var updatedLine = '';
        _(parts).each(function(part, index) {
          if (clickedPart == parts[index-1] && part.added) updatedLine += part.value;
          else if (clickedPart == part && part.added) updatedLine += part.value;
          else {
            if (part.removed && !(clickedPart == part) && !(clickedPart == parts[index+1] && parts[index+1].added)) updatedLine += part.value;
            if (!part.removed && !part.added) updatedLine += part.value;
          }
        });
        this.$emit('click-part', {
          lineIndex: this.lineIndex,
          updatedLine: updatedLine
        });
      }
    },
    template: `
      <div>
        <span
          v-for="(part, partIndex) in parts"
          v-on:click="(part.added || part.removed) && emitClickPart(part, partIndex)"
          v-bind:style="[part.added ? {color: '#2185d0', 'font-weight': 'bold'} : '', part.removed ? {color: '#db2828', 'font-weight': 'bold'} : '']"
          >{{part.added || part.removed ? part.value.replace(/ /g, '_') : part.value}}</span>
      </div>
    `
  })
  app = new Vue({
    el: '#main',
    data: {
      encoded: `
        oe×ñÎ
        >ë-{,-8ß:-bÜ-¹¥/-e$-020<Î
        ýV-#è-<9-Zë$-ýë-:Î
        8-02,-0&ë#-#Ü-+$ë<-iá/-/Cè<Î
        ýV-7e³$-#,<-5è<-<ß-i#<Î
        7"ë9-¸¥-0"7-7ië-0$-ýë<-/Uë9Î
        aè+-\`Ü-Bè<-<ß-/+#-/…å/-\`Ü<Î
        eÜ,-bÜ<-/x/-dÜ9-#;è#<-<ß-#<ë:Î
        μ¥-9ß-ýV-<ÜKÜ-oe×ñÎ
      `.replace(/^[ ]*/gm, '').trim(),
      tibetan: `
        ཧཱུྃ༔
        ཨོ་རྒྱན་ཡུལ་གྱི་ནུབ་བྱང་མཚམས༔
        པདྨ་གེ་སར་སྡོང་པོ་ལ༔
        ཡ་མཚན་མཆོག་གི་དངོས་གྲུབ་བཪྙེས༔
        པདྨ་འབྱུང་གནས་ཞེས་སུ་གྲགས༔
        འཁོར་དུ་མཁའ་འགྲོ་མང་པོས་བསྐོར༔
        ཁྱེད་ཀྱི་རྗེས་སུ་བདག་བསྒྲུབ་ཀྱིས༔
        བྱིན་གྱིས་བརླབ་ཕྱིར་གཤེགས་སུ་གསོལ༔
        གུ་རུ་པདྨ་སིདྡྷི་ཧཱུྃ༔
      `.replace(/^[ ]*/gm, '').trim()
    },
    computed: {
      lines: function() {
        return this.encoded ? this.encoded.split("\n") : [];
      }
    },
    methods: {
      correctSource: function(result) {
        var lines = this.encoded.split("\n");
        lines[result.lineIndex] = result.updatedLine;
        this.encoded = lines.join("\n");
      }
    },
    template: `
      <div class="ui container compare">
        <div id="scrollable-area-container">
          <div id="scrollable-area">
            <div class="form">
              <textarea
                id="encoded"
                v-model="encoded"
                v-on:paste="encoded = $event"
              ></textarea>
            </div>
            <tibetan-input
              v-model="tibetan"
              v-on:paste="tibetan = $event"
            ></tibetan-input>
            <div class="form">
              <converted-lines
                v-bind:lines="lines"
                v-bind:expectedConverted="tibetan"
                v-on:click-part="correctSource($event)"
              ></converted-lines>
            </div>
          </div>
        </div>
      </div>
    `
  })
})