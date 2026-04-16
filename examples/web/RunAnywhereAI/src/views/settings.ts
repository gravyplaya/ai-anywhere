/**
 * Settings Tab - Generation params, tool calling, API config, logging, about
 * Matches iOS CombinedSettingsView.
 */

let container: HTMLElement;

// Settings state
const settings = {
  temperature: 0.7,
  maxTokens: 2048,
};

export function initSettingsTab(el: HTMLElement): void {
  container = el;
  container.innerHTML = `
    <div class="toolbar">
      <div class="toolbar-title">Settings</div>
      <div class="toolbar-actions"></div>
    </div>
    <div class="settings-form">

      <!-- Generation -->
      <div class="settings-section">
        <div class="settings-section-title">Generation</div>
        <div class="setting-row">
          <span class="setting-label">Temperature</span>
          <div class="flex items-center gap-sm">
            <span class="setting-value" id="settings-temp-val">${settings.temperature.toFixed(1)}</span>
            <input type="range" id="settings-temp" min="0" max="2" step="0.1" value="${settings.temperature}">
          </div>
        </div>
        <div class="setting-row">
          <span class="setting-label">Max Tokens</span>
          <div class="flex items-center gap-sm">
            <button class="btn btn-sm" id="settings-tokens-minus">-</button>
            <span class="setting-value" id="settings-tokens-val">${settings.maxTokens}</span>
            <button class="btn btn-sm" id="settings-tokens-plus">+</button>
          </div>
        </div>
      </div>

      <!-- About -->
      <div class="settings-section">
        <div class="settings-section-title">About</div>
        <div class="setting-row">
          <span class="setting-label">SDK Version</span>
          <span class="setting-value">0.1.0</span>
        </div>
        <div class="setting-row">
          <span class="setting-label">Platform</span>
          <span class="setting-value">Web (Emscripten WASM)</span>
        </div>
      </div>

    </div>
  `;

  // Temperature slider
  const tempSlider = container.querySelector(
    "#settings-temp",
  ) as HTMLInputElement;
  const tempVal = container.querySelector("#settings-temp-val")!;
  tempSlider.addEventListener("input", () => {
    settings.temperature = parseFloat(tempSlider.value);
    tempVal.textContent = settings.temperature.toFixed(1);
    saveSettings();
  });

  // Max tokens stepper
  const tokensVal = container.querySelector("#settings-tokens-val")!;
  container
    .querySelector("#settings-tokens-minus")!
    .addEventListener("click", () => {
      settings.maxTokens = Math.max(500, settings.maxTokens - 500);
      tokensVal.textContent = String(settings.maxTokens);
      saveSettings();
    });
  container
    .querySelector("#settings-tokens-plus")!
    .addEventListener("click", () => {
      settings.maxTokens = Math.min(20000, settings.maxTokens + 500);
      tokensVal.textContent = String(settings.maxTokens);
      saveSettings();
    });

  // Load saved settings
  loadSettings();
}

function saveSettings(): void {
  try {
    localStorage.setItem("runanywhere-settings", JSON.stringify(settings));
  } catch {
    /* storage may not be available */
  }
}

function loadSettings(): void {
  try {
    const saved = localStorage.getItem("runanywhere-settings");
    if (saved) {
      Object.assign(settings, JSON.parse(saved));
      // Update UI
      (container.querySelector("#settings-temp") as HTMLInputElement).value =
        String(settings.temperature);
      container.querySelector("#settings-temp-val")!.textContent =
        settings.temperature.toFixed(1);
      container.querySelector("#settings-tokens-val")!.textContent = String(
        settings.maxTokens,
      );
    }
  } catch {
    /* storage may not be available */
  }
}

export function getSettings(): typeof settings {
  return { ...settings };
}
