
var app;
$(function() {
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
        return this.encoded.split("\n").map((line, index) => {
          return [line, new TibetanUnicodeConverter(line).convert()];
        }).flatten();
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
            <div id="tibetan" style="position: absolute; left: -9999999;"></div>
            <div class="form">
              <div id="converted">
                <div
                  v-for="(line, index) in lines"
                  :class="{
                    encoded: index % 2 == 0,
                    tibetan: index % 2 == 1,
                  }">
                  {{line}}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `
  })
})