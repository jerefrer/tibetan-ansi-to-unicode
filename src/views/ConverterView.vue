<script setup>
import TibetanUnicodeConverter from "tibetan-unicode-converter";
import { computed, onMounted, ref, watch } from "vue";

const direction = ref(localStorage.getItem("direction") || "toUnicode");
const ansiText = ref(
  localStorage.getItem("ansiText") ||
    `oe×ñÎ
>ë-{,-8ß:-bÜ-¹¥/-e$-020<Î
ýV-#è-<9-Zë$-ýë-:Î
8-02,-0&ë#-#Ü-+$ë<-iá/-/Cè<Î
ýV-7e³$-#,<-5è<-<ß-i#<Î
7"ë9-¸¥-0"7-7ië-0$-ýë<-/Uë9Î
aè+-\`Ü-Bè<-<ß-/+#-/…å/-\`Ü<Î
eÜ,-bÜ<-/x/-dÜ9-#;è#<-<ß-#<ë:Î
μ¥-9ß-ýV-<ÜKÜ-oe×ñÎ`
);
const unicodeText = ref(localStorage.getItem("unicodeText") || "");

let isConverting = false;

const inputText = computed(() => {
  return direction.value === "toUnicode" ? ansiText.value : unicodeText.value;
});

const convertedOutput = computed(() => {
  const input = inputText.value;
  if (!input) return "";
  return input
    .split("\n")
    .map((line) => {
      const converter = new TibetanUnicodeConverter(line);
      return direction.value === "toAnsi"
        ? converter.convertToAnsi()
        : converter.convert();
    })
    .join("\n");
});

watch(ansiText, (value) => {
  localStorage.setItem("ansiText", value);
  if (direction.value === "toUnicode" && !isConverting) {
    isConverting = true;
    unicodeText.value = convertedOutput.value;
    isConverting = false;
  }
});

watch(unicodeText, (value) => {
  localStorage.setItem("unicodeText", value);
  if (direction.value === "toAnsi" && !isConverting) {
    isConverting = true;
    ansiText.value = convertedOutput.value;
    isConverting = false;
  }
});

watch(direction, (value) => {
  localStorage.setItem("direction", value);
});

function toggleDirection() {
  direction.value = direction.value === "toUnicode" ? "toAnsi" : "toUnicode";
}

async function copyToClipboard() {
  const textToCopy =
    direction.value === "toUnicode" ? unicodeText.value : ansiText.value;
  try {
    await navigator.clipboard.writeText(textToCopy);
  } catch (err) {
    console.error("Failed to copy:", err);
  }
}

onMounted(() => {
  if (direction.value === "toUnicode" && ansiText.value) {
    isConverting = true;
    unicodeText.value = convertedOutput.value;
    isConverting = false;
  }
});
</script>

<template>
  <div class="container">
    <div class="converter-container">
      <button
        v-if="convertedOutput"
        class="copy-button"
        @click="copyToClipboard"
      >
        Copy to clipboard
      </button>

      <div class="panels">
        <div class="panel left-panel">
          <div class="panel-header">ANSI</div>
          <textarea
            v-model="ansiText"
            :readonly="direction === 'toAnsi'"
            :class="{ readonly: direction === 'toAnsi' }"
          ></textarea>
        </div>

        <div class="direction-arrow" @click="toggleDirection">
          <span
            :class="{
              'arrow-right': direction === 'toUnicode',
              'arrow-left': direction === 'toAnsi',
            }"
          >
            ➜
          </span>
        </div>

        <div class="panel right-panel">
          <div class="panel-header">Unicode</div>
          <textarea
            v-model="unicodeText"
            :readonly="direction === 'toUnicode'"
            :class="['tibetan', { readonly: direction === 'toUnicode' }]"
          ></textarea>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  padding: 30px;
  min-height: 100vh;
  box-sizing: border-box;
}

.converter-container {
  position: relative;
}

.copy-button {
  position: absolute;
  top: 0;
  right: 0;
  padding: 10px 15px;
  color: rgba(255, 255, 255, 0.7);
  background: #333;
  border: none;
  border-bottom-left-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  z-index: 999;
  transition: all 0.2s;
}

.copy-button:hover {
  color: rgba(255, 255, 255, 0.9);
  background: #363636;
}

.panels {
  display: flex;
  align-items: flex-start;
  max-height: calc(100vh - 60px);
  overflow-y: auto;
}

.panel {
  flex: 1;
  position: relative;
}

.panel-header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 8px 15px;
  background: rgba(0, 0, 0, 0.3);
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
  z-index: 10;
}

.direction-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  min-height: calc(100vh - 60px);
  background: #4c4c4c;
  cursor: pointer;
  transition: background 0.2s;
}

.direction-arrow:hover {
  background: #6d6d6d;
}

.direction-arrow span {
  font-size: 24px;
  color: rgba(255, 255, 255, 0.7);
  transition: transform 0.3s ease;
}

.direction-arrow:hover span {
  color: rgba(255, 255, 255, 0.9);
}

.direction-arrow .arrow-right {
  transform: rotate(0deg);
}

.direction-arrow .arrow-left {
  transform: rotate(180deg);
}

textarea {
  width: 100%;
  min-height: calc(100vh - 60px);
  margin: 0;
  padding: 45px 20px 30px;
  color: rgba(255, 255, 255, 0.9);
  background: #222;
  border: none;
  resize: none;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.5;
  box-sizing: border-box;
}

textarea:focus {
  outline: none;
}

textarea.readonly {
  background: #1a1a1a;
  color: rgba(255, 255, 255, 0.7);
}

textarea.tibetan {
  font-family: TibetanChogyalUnicode-170221, TibetanChogyalUnicode-ID,
    TibetanChogyalUnicode, TibetanMachineUnicode, sans-serif;
  font-size: 36px;
  line-height: 1.1em;
}
</style>
