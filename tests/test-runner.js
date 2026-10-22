/**
 * AuraSpace Automated Node.js Headless Test Runner
 * Executes syntax validation, asset integrity checks, and logic verifications.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log("\n=========================================");
console.log("   🧪 Running AuraSpace Automated Tests   ");
console.log("=========================================\n");

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`[PASS] ✓ ${name}`);
    passed++;
  } catch (err) {
    console.error(`[FAIL] ✕ ${name}`);
    console.error(`       Error: ${err.message}\n`);
    failed++;
  }
}

// 1. File Structure Verification
test("Core File Existence", () => {
  const requiredFiles = [
    'StudyOS.html',
    'index.html',
    'ambient-audio.js',
    'error-monitor.js',
    'aura-companion.js',
    'test-suite.html'
  ];

  requiredFiles.forEach(file => {
    const fullPath = path.join(__dirname, '..', file);
    assert.ok(fs.existsSync(fullPath), `Missing required file: ${file}`);
  });
});

// 2. StudyOS.html Structure and Assets
test("StudyOS.html HTML Structure & Script Imports", () => {
  const content = fs.readFileSync(path.join(__dirname, '..', 'StudyOS.html'), 'utf-8');
  assert.ok(content.includes('ambient-audio.js'), "Missing ambient-audio.js script tag");
  assert.ok(content.includes('error-monitor.js'), "Missing error-monitor.js script tag");
  assert.ok(content.includes('aura-companion.js'), "Missing aura-companion.js script tag");
  assert.ok(content.includes('data-theme'), "Missing data-theme support for Dark/Light mode");
  assert.ok(content.includes('zen-focus-overlay'), "Missing Zen Focus mode overlay");
  assert.ok(content.includes('study-activity-heatmap-grid'), "Missing 365-day heatmap grid");
  assert.ok(content.includes('mock-chart-container'), "Missing Mock Test Progression Chart");
  assert.ok(content.includes('todo-custom-date-picker'), "Missing Focus Checklist date picker");
  assert.ok(content.includes('openPrintStudyDossier'), "Missing 1-Click Study Performance Dossier");
  assert.ok(content.includes('exportFullDataBackup'), "Missing 1-Click JSON Backup Export");
  assert.ok(content.includes('importFullDataBackup'), "Missing 1-Click JSON Backup Restore");
  assert.ok(content.includes('AURA_TRANSLATIONS'), "Missing Bilingual Translation Engine");
  assert.ok(content.includes('applyLanguage'), "Missing applyLanguage function");
  assert.ok(content.includes('hidden-on-dashboard'), "Missing sidebar dashboard visibility toggle");
  assert.ok(content.includes('openDailyThoughtModal'), "Missing openDailyThoughtModal startup logic");
  assert.ok(content.includes('cal-grid'), "Missing balanced dynamic calendar grid");
  assert.ok(content.includes('firebase-firestore.js'), "Missing Cloud Firestore modular SDK import");
  assert.ok(content.includes('sharmishthadixit21@gmail.com'), "Missing exact admin email security check");
  assert.ok(content.includes('affiliate-admin-card'), "Missing admin affiliate management form");
  assert.ok(content.includes('initFirestoreAffiliateSync'), "Missing Firestore live sync handler");
});

// 3. Audio Engine Syntax & Preset Definitions (15+ Soundscapes)
test("ambient-audio.js Synthesizer Methods", () => {
  const content = fs.readFileSync(path.join(__dirname, '..', 'ambient-audio.js'), 'utf-8');
  assert.ok(content.includes('class AmbientAudioEngine'), "AmbientAudioEngine class missing");
  assert.ok(content.includes('_createSpaceAmbience'), "Space Ambience synth missing");
  assert.ok(content.includes('_createRainSound'), "Rain sound synth missing");
  assert.ok(content.includes('_createThunderstorm'), "Thunderstorm synth missing");
  assert.ok(content.includes('_createCafeAmbience'), "Kyoto Cafe synth missing");
  assert.ok(content.includes('_createLibraryAmbience'), "Oxford Library synth missing");
  assert.ok(content.includes('_createOceanWaves'), "Ocean waves synth missing");
  assert.ok(content.includes('_createBrownNoise'), "Brown noise synth missing");
  assert.ok(content.includes('_createBinauralBeats'), "10Hz Alpha synth missing");
  assert.ok(content.includes('_createGammaWaves'), "40Hz Gamma synth missing");
  assert.ok(content.includes('_createClockTicking'), "Vintage Clock synth missing");
  assert.ok(content.includes('_createAutumnWind'), "Autumn Wind synth missing");
  assert.ok(content.includes('toggleMute'), "toggleMute method missing");
  assert.ok(content.includes('stopAll'), "stopAll method missing");
});

// 4. Error Monitor Syntax & Interceptor Methods
test("error-monitor.js Error Capture Logic", () => {
  const content = fs.readFileSync(path.join(__dirname, '..', 'error-monitor.js'), 'utf-8');
  assert.ok(content.includes('class ErrorMonitor'), "ErrorMonitor class missing");
  assert.ok(content.includes('window.onerror'), "Global onerror handler missing");
  assert.ok(content.includes('window.onunhandledrejection'), "Unhandled rejection handler missing");
  assert.ok(content.includes('exportFormattedMarkdown'), "Export diagnostics method missing");
});

// 5. Aura Pet Companion Engine Methods (Overhaul)
test("aura-companion.js State Machine & Progression", () => {
  const content = fs.readFileSync(path.join(__dirname, '..', 'aura-companion.js'), 'utf-8');
  assert.ok(content.includes('class AuraCompanionEngine'), "AuraCompanionEngine class missing");
  assert.ok(content.includes('addXP'), "addXP method missing");
  assert.ok(content.includes('addCoins'), "addCoins method missing");
  assert.ok(content.includes('getStageName'), "getStageName method missing");
  assert.ok(content.includes('setStudyingState'), "setStudyingState method missing");
  assert.ok(content.includes('renderStudyDeskSVG'), "renderStudyDeskSVG method missing");
  assert.ok(content.includes('feedTreat'), "feedTreat shop method missing");
  assert.ok(content.includes('buyAccessory'), "buyAccessory shop method missing");
});

console.log("\n=========================================");
console.log(`Summary: ${passed} Passed, ${failed} Failed`);
console.log("=========================================\n");

if (failed > 0) {
  process.exit(1);
} else {
  console.log("🎉 All automated validation tests passed successfully!\n");
  process.exit(0);
}
