<script setup>
import TibetanUnicodeConverter from "tibetan-unicode-converter";
import { computed, onMounted, ref, watch } from "vue";

const direction = ref(localStorage.getItem("direction") || "toUnicode");
const isDarkMode = ref(localStorage.getItem("darkMode") !== "false");
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

async function copyAnsi() {
  try {
    await navigator.clipboard.writeText(ansiText.value);
  } catch (err) {
    console.error("Failed to copy:", err);
  }
}

async function copyUnicode() {
  try {
    await navigator.clipboard.writeText(unicodeText.value);
  } catch (err) {
    console.error("Failed to copy:", err);
  }
}

function toggleDarkMode() {
  isDarkMode.value = !isDarkMode.value;
  localStorage.setItem("darkMode", isDarkMode.value);
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
  <div class="container" :class="{ 'light-mode': !isDarkMode }">
    <div class="converter-container">
      <button
        class="theme-toggle"
        @click="toggleDarkMode"
        :title="isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'"
      >
        <svg
          v-if="isDarkMode"
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
        <svg
          v-else
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      </button>

      <div class="panels">
        <div class="panel left-panel">
          <div class="panel-header">
            <span>ANSI</span>
            <button class="copy-btn" @click="copyAnsi" title="Copy ANSI">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path
                  d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
                />
              </svg>
            </button>
          </div>
          <textarea
            v-model="ansiText"
            :readonly="direction === 'toAnsi'"
            :class="{ readonly: direction === 'toAnsi' }"
          ></textarea>
        </div>

        <button
          class="swap-button"
          @click="toggleDirection"
          title="Swap direction"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            :class="{ flipped: direction === 'toAnsi' }"
          >
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>

        <div class="panel right-panel">
          <div class="panel-header">
            <span>Unicode</span>
            <button class="copy-btn" @click="copyUnicode" title="Copy Unicode">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path
                  d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
                />
              </svg>
            </button>
          </div>
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
  padding: 40px;
  padding-top: 70px;
  min-height: 100vh;
  box-sizing: border-box;
  background: #0a0a0a;
  transition: background 0.3s ease;
}

.light-mode {
  background: #f8f9fa;
}

.converter-container {
  position: relative;
  max-width: 1600px;
  margin: 0 auto;
}

.theme-toggle {
  position: absolute;
  top: -50px;
  right: 0;
  padding: 10px;
  color: rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  cursor: pointer;
  z-index: 999;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.theme-toggle:hover {
  color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.12);
  transform: scale(1.05);
}

.light-mode .theme-toggle {
  color: rgba(0, 0, 0, 0.5);
  background: rgba(0, 0, 0, 0.04);
  border-color: rgba(0, 0, 0, 0.08);
}

.light-mode .theme-toggle:hover {
  color: rgba(0, 0, 0, 0.8);
  background: rgba(0, 0, 0, 0.08);
}

.panels {
  display: flex;
  align-items: stretch;
  gap: 24px;
  min-height: calc(100vh - 140px);
}

.panel {
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
}

.panel-header {
  padding: 14px 18px;
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.5);
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  border-radius: 12px 12px 0 0;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-bottom: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.light-mode .panel-header {
  background: rgba(0, 0, 0, 0.02);
  color: rgba(0, 0, 0, 0.45);
  border-color: rgba(0, 0, 0, 0.08);
}

.copy-btn {
  padding: 6px 10px;
  color: rgba(255, 255, 255, 0.4);
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.copy-btn:hover {
  color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
}

.light-mode .copy-btn {
  color: rgba(0, 0, 0, 0.35);
  border-color: rgba(0, 0, 0, 0.1);
}

.light-mode .copy-btn:hover {
  color: rgba(0, 0, 0, 0.7);
  background: rgba(0, 0, 0, 0.05);
  border-color: rgba(0, 0, 0, 0.15);
}

.swap-button {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 52px;
  height: 52px;
  padding: 0;
  color: rgba(255, 255, 255, 0.7);
  background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.25s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  z-index: 100;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
}

.swap-button:hover {
  color: #fff;
  background: linear-gradient(135deg, #3a3a3a 0%, #2a2a2a 100%);
  transform: translate(-50%, -50%) scale(1.08);
  box-shadow: 0 6px 28px rgba(0, 0, 0, 0.5);
}

.swap-button:active {
  transform: translate(-50%, -50%) scale(0.95);
}

.swap-button svg {
  transition: transform 0.3s ease;
}

.swap-button svg.flipped {
  transform: scaleX(-1);
}

.light-mode .swap-button {
  color: rgba(0, 0, 0, 0.6);
  background: linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%);
  border-color: rgba(0, 0, 0, 0.1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.light-mode .swap-button:hover {
  color: #000;
  background: linear-gradient(135deg, #ffffff 0%, #e8e8e8 100%);
  box-shadow: 0 6px 28px rgba(0, 0, 0, 0.15);
}

textarea {
  flex: 1;
  width: 100%;
  min-height: 400px;
  margin: 0;
  padding: 24px;
  color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-top: none;
  border-radius: 0 0 12px 12px;
  resize: none;
  font-family: inherit;
  font-size: 21px;
  line-height: 39px;
  box-sizing: border-box;
  transition: all 0.2s ease;
}

textarea:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.15);
}

textarea.readonly {
  background: rgba(255, 255, 255, 0.02);
  color: rgba(255, 255, 255, 0.9);
}

.light-mode textarea {
  color: #1a1a1a;
  background: #fff;
  border-color: rgba(0, 0, 0, 0.08);
}

.light-mode textarea:focus {
  background: #fff;
  border-color: rgba(0, 0, 0, 0.15);
  box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.03);
}

.light-mode textarea.readonly {
  background: #fafafa;
  color: #1a1a1a;
}

textarea.tibetan {
  font-family: TibetanChogyalUnicode-170221, TibetanChogyalUnicode-ID,
    TibetanChogyalUnicode, TibetanMachineUnicode, sans-serif;
  font-size: 36px;
  line-height: 39px;
}
</style>
