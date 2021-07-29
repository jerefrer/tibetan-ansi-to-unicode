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
        oe×ñÎ
        >ë-{,-8ß:-bÜ-¹¥/-e$-020<Î
        ýV-#è-<9-Zë$-ýë-:Î
        8-02,-0&ë#-#Ü-+$ë<-iá/-/Cè<Î
        ýV-7e³$-#,<-5è<-<ß-i#<Î
        7"ë9-¸¥-0"7-7ië-0$-ýë<-/Uë9Î
        aè+-\`Ü-Bè<-<ß-/+#-/…å/-\`Ü<Î
        eÜ,-bÜ<-/x/-dÜ9-#;è#<-<ß-#<ë:Î
        μ¥-9ß-ýV-<ÜKÜ-oe×ñÎ
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