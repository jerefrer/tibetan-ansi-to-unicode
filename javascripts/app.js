var app;

$(function() {
  Vue.component('converted-lines', {
    props: {
      language: String,
      lines: Array
    },
    computed: {
      convertedLines: function() {
        return this.lines.map(function(line) {
          return new TibetanUnicodeConverter(line).convert();
        }).join("\n");
      },
    },
    mounted: function() {
      new Clipboard('#copy-to-clipboard');
    },
    template: `
      <div class="ui form">
        <textarea
          id="transliteration"
          class="tibetan"
          readonly=""
        >{{convertedLines}}</textarea>
      </div>
    `
  })
  app = new Vue({
    el: '#main',
    data: {
      text: `
        *Ü#-:è-&è,-ýë9-U¨-+$-5Ü$-"0<-Jë#<Ê Ê
        +0-2Ý#-&è,-ýë9-\$-v$-02,-0-+# Ê
        a/-/E:-&è,-ýë9-9è-+ë#<-0¸¥+-ý-ië:Ê Ê
        Jë#<-ý-&è,-ýë9-&ë<-U¨-0$ë,-b²9-;ë# Ê
        /{æ+-ý-#<ß0-bÜ-eÜ,-x/<-XÜ$-:-º¥#<Ê Ê
        €ç-7ná:-š-/7Ü-:0-#<$-<è0<-:-Jë#<Ê Ê
        nÜ,-:<-F0-/5Ü-T©,-bÜ<-iá/-ý-8Ü<Ê Ê
        0ß-0*7-0è+-ý7Ü-7ië-/-…ë:-/9-;ë# Ê
      `.replace(/ /g, '').trim()
    },
    computed: {
      lines: function() {
        return this.text ? this.text.split("\n") : [];
      }
    },
    template: `
      <div class="ui container">
        <div id="scrollable-area-container">
          <clipboard-button v-if="text"></clipboard-button>
          <div id="scrollable-area">
            <div class="ui form">
              <textarea v-model="text"></textarea>
            </div>
            <converted-lines
              v-bind:lines="lines"
            ></converted-lines>
          </div>
        </div>
      </div>
    `
  })
})