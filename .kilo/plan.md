# Plan: Add Online Mode (Venice API) to Web Demo App

## Summary
Add an Online/Offline toggle to the global toolbar of the TavonnAI web app (`examples/web/RunAnywhereAI/`). When online, all inference calls route through a Vite dev server proxy to the Venice AI API, using a server-side API key from env vars. Users see cloud models in the model selector without knowing it's Venice.

## Venice API Endpoints Used
| Capability | Endpoint | Models |
|---|---|---|
| Chat LLM | `POST /api/v1/chat/completions` (SSE stream) | `llama-3.3-70b`, `qwen-2.5-72b`, `mistral-small-24b` |
| Vision | `POST /api/v1/chat/completions` (image in message) | `qwen-2.5-vl` |
| STT | `POST /api/v1/audio/transcriptions` (multipart) | `openai/whisper-large-v3` |
| TTS | `POST /api/v1/audio/speech` (JSON, returns audio bytes) | `tts-kokoro` |

## Files to Create

### 1. `src/services/online-mode.ts` — Global state + online model catalog
- Export `isOnline` reactive state (getter/setter with change callbacks)
- Export `ONLINE_MODELS` hardcoded list mirroring the `CompactModelDef` shape but for cloud models (id, name, modality category)
- Export `onOnlineModeChange(cb)` subscription
- Export `getOnlineModels(category: ModelCategory)` to filter models by category
- Online models use a `source: 'online'` flag to distinguish from local models

### 2. `src/services/venice-client.ts` — Venice API client
- `chatStream(messages, model, options)` → `ReadableStream<string>` (SSE parsing)
- `chatWithVision(messages, model, imageBase64, options)` → `ReadableStream<string>`
- `transcribe(audioBlob, model, options)` → `Promise<{ text, confidence }>`
- `synthesize(text, model, voice)` → `Promise<{ audioData: Float32Array, sampleRate }>`
- All calls go to `/api/v1/*` (proxied by Vite dev server)
- No API key in client code — proxy injects it

### 3. `src/components/online-toggle.ts` — Reusable toggle component
- Creates the Online/Offline pill toggle (same visual pattern as Tools toggle)
- Green dot icon when online, grey when offline
- Calls `online-mode.ts` setter on click
- Persists state in localStorage (`runanywhere-online`)

## Files to Modify

### 4. `vite.config.ts` — Add proxy configuration
- Add `server.proxy` entry: `'/api/v1'` → `https://api.venice.ai/api/v1`
- Inject `Authorization: Bearer ${process.env.VENICE_API_KEY}` header via `configure` hook
- Add `.env` to `envPrefix` or use `loadEnv`

### 5. `.env.example` — Document env var
- `VENICE_API_KEY=your-api-key-here`

### 6. `src/app.ts` — Add online toggle to global toolbar
- Create a header bar above the tab content that contains the Online toggle
- Import and render the `online-toggle.ts` component
- Position: fixed top-right or a small bar above tab content
- Toggle is visible from all tabs

### 7. `src/services/model-manager.ts` — Integrate online models
- Import `isOnline` from `online-mode.ts`
- When `isOnline` is true, `ModelManager.getModels()` (or a wrapper) returns online models instead of local models
- Create `getAvailableModels(category)` function that returns online or local models based on mode
- Online models don't need download/load — they're immediately "ready"

### 8. `src/views/chat.ts` — Route chat through Venice when online
- In `sendMessage()`: if `isOnline`, call `venice-client.chatStream()` instead of `TextGeneration.generateStream()`
- Skip model load check when online (no local model needed)
- Parse SSE stream and feed tokens to the same streaming bubble UI
- Hide the "model required" overlay when online
- Update toolbar model text to show online model name

### 9. `src/views/vision.ts` — Route vision through Venice when online
- If `isOnline`, call `venice-client.chatWithVision()` with base64 image
- Skip local VLM model load check

### 10. `src/views/transcribe.ts` — Route STT through Venice when online
- If `isOnline`, call `venice-client.transcribe()` with audio blob
- Convert Float32Array PCM → WAV blob for the multipart upload
- Skip local STT model load check

### 11. `src/views/speak.ts` — Route TTS through Venice when online
- If `isOnline`, call `venice-client.synthesize()` with text
- Decode returned MP3 audio bytes → Float32Array for playback
- Skip local TTS model load check

### 12. `src/views/voice.ts` — Route LLM+STT+TTS through Venice when online
- If `isOnline`, use Venice for the LLM step (and optionally STT/TTS)
- Keep the same voice pipeline UI flow

### 13. `src/components/model-selection.ts` — Show online models in selector
- When `isOnline`, render the online model catalog instead of local models
- Online models show as immediately available (no download needed)
- Filter by the active tab's model category

### 14. `src/styles/components.css` — Add online toggle styles
- `.online-toggle-pill` — same visual pattern as `.tools-toggle-pill`
- Green accent color for online state (vs blue for tools)
- `.online-dot` — small status indicator dot (green=online, grey=offline)
- `.header-bar` — container for the global online toggle

## Implementation Order
1. `.env.example` + `vite.config.ts` proxy
2. `src/services/online-mode.ts` (state management)
3. `src/services/venice-client.ts` (API client)
4. `src/components/online-toggle.ts` (UI toggle)
5. `src/styles/components.css` (toggle styles)
6. `src/app.ts` (mount toggle in global header)
7. `src/services/model-manager.ts` (online model catalog)
8. `src/components/model-selection.ts` (show online models)
9. `src/views/chat.ts` (chat integration)
10. `src/views/vision.ts` (vision integration)
11. `src/views/transcribe.ts` (STT integration)
12. `src/views/speak.ts` (TTS integration)
13. `src/views/voice.ts` (voice pipeline integration)

## Notes
- **CORS**: Handled by Vite proxy in dev. For production, a similar proxy (nginx, Cloudflare Worker) must front the app.
- **No Venice branding**: UI shows "Online" / "Offline". Model names are user-friendly (e.g., "Llama 3.3 70B", "Whisper Large V3").
- **Offline by default**: Toggle starts in offline position unless localStorage has a persisted preference.
- **Graceful degradation**: If the proxy/API is unreachable, show error toasts (existing `showToast` pattern).
- **TTS audio decoding**: Venice returns MP3 bytes. Need to decode MP3 → PCM Float32Array using Web Audio API's `decodeAudioData()`.
- **STT audio encoding**: Need to encode Float32Array PCM → WAV Blob for the multipart upload to Venice.
