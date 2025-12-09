<script setup>
import TibetanUnicodeConverter from "tibetan-unicode-converter";
import { computed } from "vue";
import { testGroups } from "../data/testGroups.js";

function runTest(test) {
  const converted = new TibetanUnicodeConverter(test.conversion).convert();
  return {
    ...test,
    converted,
    pass: converted === test.tibetan,
  };
}

const results = computed(() => {
  return testGroups.map((group) => {
    const tests = group.tests.map(runTest);
    const passedCount = tests.filter((t) => t.pass).length;
    return {
      ...group,
      tests,
      passedCount,
      allPassed: passedCount === tests.length,
    };
  });
});

const totalTests = computed(() =>
  results.value.reduce((sum, g) => sum + g.tests.length, 0)
);
const totalPassed = computed(() =>
  results.value.reduce((sum, g) => sum + g.passedCount, 0)
);
const percentage = computed(() =>
  ((totalPassed.value / totalTests.value) * 100).toFixed(1)
);

const textsTotal = computed(() => {
  return results.value
    .filter((g) => g.includeInPercentage)
    .reduce((sum, g) => sum + g.tests.length, 0);
});
const textsPassed = computed(() => {
  return results.value
    .filter((g) => g.includeInPercentage)
    .reduce((sum, g) => sum + g.passedCount, 0);
});
const textsPercentage = computed(() =>
  ((textsPassed.value / textsTotal.value) * 100).toFixed(1)
);

function diffChars(expected, actual) {
  const parts = [];
  let i = 0,
    j = 0;
  while (i < expected.length || j < actual.length) {
    if (expected[i] === actual[j]) {
      parts.push({ value: expected[i], added: false, removed: false });
      i++;
      j++;
    } else if (
      j < actual.length &&
      (i >= expected.length || expected.indexOf(actual[j], i) === -1)
    ) {
      parts.push({ value: actual[j], added: true, removed: false });
      j++;
    } else {
      parts.push({ value: expected[i], added: false, removed: true });
      i++;
    }
  }
  return parts;
}
</script>

<template>
  <div class="tests-container">
    <div class="header">
      <router-link to="/" class="back-link">← Back to Converter</router-link>
      <h1>Tests</h1>
      <div class="total" :class="{ success: totalPassed === totalTests }">
        Total: {{ percentage }}% ({{ totalPassed }}/{{ totalTests }})
        <span v-if="totalPassed !== totalTests">
          — Texts only: {{ textsPercentage }}% ({{ textsPassed }}/{{
            textsTotal
          }})
        </span>
      </div>
    </div>

    <div class="results">
      <div v-for="group in results" :key="group.name" class="group">
        <div class="group-header">
          <span class="group-name">{{ group.name }}</span>
          <span class="group-count"
            >{{ group.passedCount }}/{{ group.tests.length }}</span
          >
          <span class="group-status">
            <span v-if="group.allPassed" class="icon success">✓</span>
            <span v-else class="icon fail">✗</span>
          </span>
        </div>
        <div class="group-tests">
          <div
            v-for="(test, idx) in group.tests"
            :key="idx"
            class="test"
            :class="{ sentence: group.sentences }"
          >
            <span class="test-status">
              <span v-if="test.pass" class="icon success">✓</span>
              <span v-else class="icon fail">✗</span>
            </span>
            <span class="tibetan">{{ test.tibetan }}</span>
            <span v-if="!test.pass" class="diff">
              <span
                v-for="(part, pidx) in diffChars(test.tibetan, test.converted)"
                :key="pidx"
                :class="{ added: part.added, removed: part.removed }"
                >{{ part.value === " " ? "_" : part.value }}</span
              >
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tests-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  margin-bottom: 20px;
}

.back-link {
  color: #4a9eff;
  text-decoration: none;
  font-size: 14px;
}

.back-link:hover {
  text-decoration: underline;
}

h1 {
  margin: 10px 0;
  font-size: 24px;
}

.total {
  font-size: 18px;
  color: #db2828;
}

.total.success {
  color: #21ba45;
}

.group {
  background: #1a1a1a;
  border-radius: 4px;
  margin-bottom: 10px;
  overflow: hidden;
}

.group-header {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  background: #252525;
  cursor: pointer;
}

.group-name {
  flex: 1;
  font-weight: bold;
}

.group-count {
  margin-right: 15px;
  color: rgba(255, 255, 255, 0.6);
}

.group-tests {
  padding: 10px 15px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.test {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  background: #333;
  border-radius: 4px;
}

.test.sentence {
  display: flex;
  width: 100%;
}

.test-status {
  flex-shrink: 0;
}

.tibetan {
  font-family: TibetanChogyalUnicode-170221, TibetanChogyalUnicode-ID,
    TibetanChogyalUnicode, TibetanMachineUnicode, sans-serif;
  font-size: 20px;
}

.diff {
  margin-left: 10px;
  font-size: 16px;
}

.diff .added {
  color: #2185d0;
  font-weight: bold;
}

.diff .removed {
  color: #db2828;
  font-weight: bold;
}

.icon {
  font-size: 14px;
}

.icon.success {
  color: #21ba45;
}

.icon.fail {
  color: #db2828;
}
</style>
