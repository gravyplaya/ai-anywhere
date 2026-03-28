/**
 * Model Selection Sheet - Modal with device info + model list
 * Matches iOS ModelSelectionSheet.
 */

import { ModelManager, ModelCategory, type ModelInfo } from '../services/model-manager';
import { isOnline, getOnlineModels, onOnlineModeChange, type OnlineModelDef } from '../services/online-mode';
import { showToast, showEvictionDialog } from './dialogs';

let modalEl: HTMLElement | null = null;

let onlineModelSelectedCallback: ((modelId: string) => void) | null = null;

export function onOnlineModelSelect(cb: (modelId: string) => void): void {
  onlineModelSelectedCallback = cb;
}

// ---------------------------------------------------------------------------
// Show Modal
// ---------------------------------------------------------------------------

/**
 * Options for the model selection sheet.
 */
export interface ModelSelectionSheetOptions {
  /**
   * When true, loading a model only unloads models of the same category
   * (swap) rather than all loaded models. Use for multi-model pipelines
   * like Voice (STT + LLM + TTS).
   */
  coexist?: boolean;
}

/** Captured options for the current open sheet. */
let sheetOptions: ModelSelectionSheetOptions = {};

export function showModelSelectionSheet(modality?: ModelCategory, options?: ModelSelectionSheetOptions): void {
  if (modalEl) return;
  sheetOptions = options ?? {};

  const online = isOnline();

  let models: Array<ModelInfo | OnlineModelDef>;
  if (online) {
    models = getOnlineModels(modality);
  } else {
    const localModels = modality
      ? ModelManager.getModels().filter((m) => m.modality === modality)
      : ModelManager.getModels();
    models = localModels;
  }

  const memory = (navigator as any).deviceMemory ?? '--';
  const cores = navigator.hardwareConcurrency ?? '--';
  const browser = detectBrowser();

  modalEl = document.createElement('div');
  modalEl.className = 'modal-backdrop';
  modalEl.innerHTML = `
    <div class="modal-sheet">
      <div class="modal-handle"></div>
      <div class="modal-header">
        <h3 class="text-md font-semibold">Select Model</h3>
        <button class="btn-ghost" id="model-sheet-close">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div class="modal-body">
        ${online ? `
        <div class="online-model-badge" style="margin-bottom: var(--space-md); padding: 6px 12px;">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
          Cloud Models
        </div>` : `
        <div class="device-info">
          <div class="device-info-item">
            <div class="value">${browser}</div>
            <div class="label">Browser</div>
          </div>
          <div class="device-info-item">
            <div class="value">${memory} GB</div>
            <div class="label">Memory</div>
          </div>
          <div class="device-info-item">
            <div class="value">${cores}</div>
            <div class="label">CPU Cores</div>
          </div>
        </div>`}

        <div id="model-sheet-list"></div>
      </div>
    </div>
  `;

  document.body.appendChild(modalEl);

  modalEl.querySelector('#model-sheet-close')!.addEventListener('click', closeSheet);
  modalEl.addEventListener('click', (e) => {
    if (e.target === modalEl) closeSheet();
  });

  if (online) {
    renderOnlineModelList(models as OnlineModelDef[], modality);
  } else {
    renderModelList(models as ModelInfo[]);
  }

  if (!online) {
    const unsub = ModelManager.onChange(() => {
      const updated = modality
        ? ModelManager.getModels().filter((m) => m.modality === modality)
        : ModelManager.getModels();
      renderModelList(updated);
    });
    (modalEl as any).__unsub = unsub;
  }
}

// ---------------------------------------------------------------------------
// Close Modal
// ---------------------------------------------------------------------------

function closeSheet(): void {
  if (!modalEl) return;
  const unsub = (modalEl as any).__unsub;
  if (typeof unsub === 'function') unsub();
  modalEl.remove();
  modalEl = null;
  sheetOptions = {};
}

// ---------------------------------------------------------------------------
// Render Model List
// ---------------------------------------------------------------------------

function renderModelList(models: ModelInfo[]): void {
  const listEl = document.getElementById('model-sheet-list');
  if (!listEl) return;

  listEl.innerHTML = models
    .map((m) => {
      const actionBtn = getActionButton(m);
      const progressBar = m.status === 'downloading'
        ? `<div class="progress-bar mt-sm"><div class="progress-fill" style="width:${(m.downloadProgress ?? 0) * 100}%;"></div></div>`
        : '';

      return `
        <div class="model-row" data-model-id="${m.id}">
          <div class="model-logo">${getModelEmoji(m)}</div>
          <div class="model-info">
            <div class="model-name">${m.name}</div>
            <div class="model-meta">
              <span class="model-framework-badge">${m.framework}</span>
              ${m.memoryRequirement ? `<span class="model-size">${formatMB(m.memoryRequirement)}</span>` : ''}
            </div>
            ${progressBar}
          </div>
          ${actionBtn}
        </div>
      `;
    })
    .join('');

  // Attach action handlers
  listEl.querySelectorAll('[data-action]').forEach((btn) => {
    const action = (btn as HTMLElement).dataset.action!;
    const modelId = (btn as HTMLElement).dataset.modelId!;

    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const model = ModelManager.getModels().find((m) => m.id === modelId);

      if (action === 'download') {
        const success = await handleDownload(modelId);
        if (success) {
          // Auto-load after download completes
          const updatedModel = ModelManager.getModels().find((m) => m.id === modelId);
          if (updatedModel && updatedModel.status === 'downloaded') {
            const loadSuccess = await ModelManager.loadModel(modelId, { coexist: sheetOptions.coexist });
            if (loadSuccess) {
              showToast(`${updatedModel.name} Ready`);
              closeSheet();
            }
          }
        }
      } else if (action === 'delete') {
        if (confirm(`Are you sure you want to delete ${model?.name}?`)) {
          await ModelManager.deleteModel(modelId);
          showToast(`Deleted ${model?.name}`);
        }
      } else if (action === 'load') {
        // Check if the required backend is registered
        if (model && !ModelManager.hasLoader(model.modality)) {
          showToast(`Backend for ${model.framework} not initialized. Check console for errors.`, 'error');
          return;
        }

        const success = await ModelManager.loadModel(modelId, { coexist: sheetOptions.coexist });
        if (success) {
          showToast(`${model?.name ?? 'Model'} Ready`);
          closeSheet();
        }
      }
    });
  });
}

// ---------------------------------------------------------------------------
// Download with Quota Check + Eviction Dialog
// ---------------------------------------------------------------------------

async function handleDownload(modelId: string): Promise<boolean> {
  const check = await ModelManager.checkDownloadFit(modelId);

  if (check.fits) {
    // Enough space — download directly
    await ModelManager.downloadModel(modelId);
    return true;
  }

  // Not enough space — show eviction dialog
  const model = ModelManager.getModels().find((m) => m.id === modelId);
  if (!model) return;

  if (check.evictionCandidates.length === 0) {
    // No candidates to evict — inform user
    showToast('Not enough storage and no models to remove', 'warning');
    return false;
  }

  const selectedIds = await showEvictionDialog(
    model.name,
    check.neededBytes,
    check.availableBytes,
    check.evictionCandidates.map((c) => ({
      id: c.id,
      name: c.name,
      sizeBytes: c.sizeBytes,
    })),
  );

  if (!selectedIds || selectedIds.length === 0) {
    showToast('Download cancelled', 'info');
    return false;
  }

  // Delete selected models, then download
  for (const id of selectedIds) {
    await ModelManager.deleteModel(id);
  }

  showToast(`Freed storage, downloading ${model.name}...`, 'info');
  await ModelManager.downloadModel(modelId);
  return true;
}

// ---------------------------------------------------------------------------
// Action Button
// ---------------------------------------------------------------------------

function getActionButton(model: ModelInfo): string {
  switch (model.status) {
    case 'registered':
      return `<button class="model-action-btn download" data-action="download" data-model-id="${model.id}">Download</button>`;
    case 'downloading':
      return `<button class="model-action-btn" disabled>${Math.round((model.downloadProgress ?? 0) * 100)}%</button>`;
    case 'downloaded': {
      const isAvailable = ModelManager.hasLoader(model.modality);
      return `
        <div class="model-actions-row">
          <button class="btn-delete" data-action="delete" data-model-id="${model.id}" title="Delete model">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
          </button>
          <button class="model-action-btn load ${!isAvailable ? 'disabled' : ''}" data-action="load" data-model-id="${model.id}">${isAvailable ? 'Load' : 'Build Required'}</button>
        </div>
      `;
    }
    case 'loading':
      return `<button class="model-action-btn" disabled>Loading...</button>`;
    case 'loaded':
      return `<button class="model-action-btn loaded">Loaded</button>`;
    case 'error':
      return `<button class="model-action-btn model-action-btn--retry" data-action="download" data-model-id="${model.id}">Retry</button>`;
    default:
      return '';
  }
}

// ---------------------------------------------------------------------------
// Online Model List (cloud models — no download needed)
// ---------------------------------------------------------------------------

function renderOnlineModelList(models: OnlineModelDef[], modality?: ModelCategory): void {
  const listEl = document.getElementById('model-sheet-list');
  if (!listEl) return;

  listEl.innerHTML = models
    .map((m) => {
      return `
        <div class="model-row" data-model-id="${m.id}">
          <div class="model-logo">${getModelEmojiForCategory(m.modality)}</div>
          <div class="model-info">
            <div class="model-name">${m.name}</div>
            <div class="model-meta">
              <span class="online-model-badge">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="10" height="10"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                Cloud
              </span>
            </div>
          </div>
          <button class="model-action-btn load" data-action="select-online" data-model-id="${m.id}">Select</button>
        </div>
      `;
    })
    .join('');

  listEl.querySelectorAll('[data-action="select-online"]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const modelId = (btn as HTMLElement).dataset.modelId!;
      const model = models.find((m) => m.id === modelId);
      showToast(`${model?.name ?? 'Model'} Selected`);
      closeSheet();
      onlineModelSelectedCallback?.(modelId);
    });
  });
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getModelEmojiForCategory(category: ModelCategory): string {
  switch (category) {
    case ModelCategory.Language: return '&#129302;';
    case ModelCategory.Multimodal: return '&#128065;';
    case ModelCategory.SpeechRecognition: return '&#127908;';
    case ModelCategory.SpeechSynthesis: return '&#128266;';
    default: return '&#129302;';
  }
}

function getModelEmoji(model: ModelInfo): string {
  return getModelEmojiForCategory(model.modality!);
}

function formatMB(bytes: number): string {
  if (bytes >= 1_000_000_000) return (bytes / 1_000_000_000).toFixed(1) + ' GB';
  return (bytes / 1_000_000).toFixed(0) + ' MB';
}

function detectBrowser(): string {
  const ua = navigator.userAgent;
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Safari')) return 'Safari';
  if (ua.includes('Edge')) return 'Edge';
  return 'Browser';
}
