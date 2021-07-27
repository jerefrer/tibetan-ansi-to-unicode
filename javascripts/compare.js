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
          >{{part.added || part.removed ? part.value.replace(/ /, '_') : part.value}}</span>
      </div>
    `
  })
  app = new Vue({
    el: '#main',
    data: {
      encoded: `
        ÉÊ Êa/-/+#-+$-ýë7Ü-<$<-{<-´¥,-·â-/6$-Ê Ê
        6ß$-7'ß#-€ç-7ná:-8è-;è<-Eë-Bè-<è0<Ê Ê
        7/9-/7Ü-U¨9-[$-/‰-´¥-0¡-9Ê Ê
        #<ë:-/-7+è/<-<ë-nÜ,-:<-0*9-dÜ,-;ë# Ê
        #<$-/7Ü-03ì+-73Ý,-/+è-/7Ü-7"ë9-:ë-&èÊ Ê
        nÜ,-:<-8ë$<-iá/-7ë+-6è9-u$-ýë7Ü-5/<Ê Ê
        =è-9ß-!-+ý:-Eë-Bè-*ë+-nè$-I:Ê Ê
        #<ë:-/-7+è/<-<ë-nÜ,-:<-0*9-dÜ,-;ë# Ê
        /!7-//<-*ß#<-\`Ü-#6ß$<-0-0"9-&è,-/67Ê Ê
        6/-#<$-{-7ië:-#)è9-7eÜ,-‡å:-ý7Ü-U¨Ê Ê
        U:-Q,-&ë<-/+#-I-/{æ+-v-0-:Ê Ê
        #<ë:-/-7+è/<-<ë-nÜ,-:<-0*9-dÜ,-;ë#
        [$-i#<-9Ü#-ý-+\`Ü:-7"ë9-#<ß0-¸¥-+# Ê
        *:-7eÜ,-F0-/5Ü7Ü-iá/-0*7-2+-¸¥-7aë:Ê Ê
        Ië:-0è+-nÜ,-:<-&#<-*ë#<-0Ü-0$7-/<Ê Ê
        /¸¥+-:<-F0-{:-#ë-7.$-0&ë#-*ë/-;ë# Ê
        %è<-ý7$-7'Ü#<-o:-8è-;è<-Eë-Bè<-<ëÊ Ê+#è7ëÊÊ
      `.replace(/^[ ]*/gm, '').trim(),
      tibetan: `
        ༄༅། །ཁྱབ་བདག་དང་པོའི་སངས་རྒྱས་ཀུན་ཏུ་བཟང་། །
        ཟུང་འཇུག་སྒྱུ་འཕྲུལ་ཡེ་ཤེས་རྡོ་རྗེ་སེམས། །
        འབར་བའི་སྐུར་སྣང་བཛྲ་ཀུ་མཱ་ར། །
        གསོལ་བ་འདེབས་སོ་ཕྲིན་ལས་མཐར་ཕྱིན་ཤོག །
        གསང་བའི་མཛོད་འཛིན་བདེ་བའི་འཁོར་ལོ་ཆེ། །
        ཕྲིན་ལས་ཡོངས་གྲུབ་འོད་ཟེར་གླང་པོའི་ཞབས། །
        ཧེ་རུ་ཀ་དཔལ་རྡོ་རྗེ་ཐོད་ཕྲེང་རྩལ། །
        གསོལ་བ་འདེབས་སོ་ཕྲིན་ལས་མཐར་ཕྱིན་ཤོག །
        བཀའ་བབས་ཐུགས་ཀྱི་གཟུངས་མ་མཁར་ཆེན་བཟའ། །
        ཟབ་གསང་རྒྱ་འགྲོལ་གཏེར་འབྱིན་སྤྲུལ་པའི་སྐུ། །
        སྐལ་ལྡན་ཆོས་བདག་རྩ་བརྒྱུད་བླ་མ་ལ། །
        གསོལ་བ་འདེབས་སོ་ཕྲིན་ལས་མཐར་ཕྱིན་ཤོག
        སྣང་གྲགས་རིག་པ་དཀྱིལ་འཁོར་གསུམ་དུ་དག །
        ཐལ་འབྱིན་རྣམ་བཞིའི་གྲུབ་མཐའ་ཚད་དུ་འཁྱོལ། །
        རྩོལ་མེད་ཕྲིན་ལས་ཆགས་ཐོགས་མི་མངའ་བས། །
        བདུད་ལས་རྣམ་རྒྱལ་གོ་འཕང་མཆོག་ཐོབ་ཤོག །
        ཅེས་པའང་འཇིགས་བྲལ་ཡེ་ཤེས་རྡོ་རྗེས་སོ། །དགེའོ།།
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