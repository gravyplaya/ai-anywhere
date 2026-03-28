import { ModelCategory } from './model-manager';

export interface OnlineModelDef {
  id: string;
  name: string;
  modality: ModelCategory;
  source: 'online';
}

export const ONLINE_MODELS: OnlineModelDef[] = [
  {
    id: 'llama-3.3-70b',
    name: 'Llama 3.3 70B',
    modality: ModelCategory.Language,
    source: 'online',
  },
  {
    id: 'qwen-2.5-72b',
    name: 'Qwen 2.5 72B',
    modality: ModelCategory.Language,
    source: 'online',
  },
  {
    id: 'mistral-small-24b',
    name: 'Mistral Small 24B',
    modality: ModelCategory.Language,
    source: 'online',
  },
  {
    id: 'qwen-2.5-vl',
    name: 'Qwen 2.5 VL',
    modality: ModelCategory.Multimodal,
    source: 'online',
  },
  {
    id: 'openai/whisper-large-v3',
    name: 'Whisper Large V3',
    modality: ModelCategory.SpeechRecognition,
    source: 'online',
  },
  {
    id: 'tts-kokoro',
    name: 'Kokoro TTS',
    modality: ModelCategory.SpeechSynthesis,
    source: 'online',
  },
];

const STORAGE_KEY = 'runanywhere-online';

let _isOnline = localStorage.getItem(STORAGE_KEY) === 'true';
const _listeners: Array<(online: boolean) => void> = [];

export function isOnline(): boolean {
  return _isOnline;
}

export function setOnline(online: boolean): void {
  if (_isOnline === online) return;
  _isOnline = online;
  localStorage.setItem(STORAGE_KEY, String(online));
  for (const cb of _listeners) cb(online);
}

export function onOnlineModeChange(cb: (online: boolean) => void): () => void {
  _listeners.push(cb);
  return () => {
    const idx = _listeners.indexOf(cb);
    if (idx >= 0) _listeners.splice(idx, 1);
  };
}

export function getOnlineModels(category?: ModelCategory): OnlineModelDef[] {
  return category
    ? ONLINE_MODELS.filter(m => m.modality === category)
    : [...ONLINE_MODELS];
}
