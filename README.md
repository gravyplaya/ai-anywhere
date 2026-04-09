<p align="center">
  <img src="examples/web/RunAnywhereAI/public/logo.svg" alt="TavonnAI Logo" width="140"/>
</p>

<h1 align="center">TavonnAI Web</h1>

<p align="center">
  <strong>On-device AI for the browser.</strong><br/>
  Run LLMs, speech-to-text, and text-to-speech locally using WebAssembly and WebGPU — private, offline, fast.
</p>

<p align="center">
  <a href="https://github.com/RunanywhereAI/runanywhere-sdks/stargazers"><img src="https://img.shields.io/github/stars/RunanywhereAI/runanywhere-sdks?style=flat-square" alt="GitHub Stars" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-Apache%202.0-blue?style=flat-square" alt="License" /></a>
  <a href="https://discord.gg/N359FBbDVd"><img src="https://img.shields.io/badge/Discord-Join-5865F2?style=flat-square&logo=discord&logoColor=white" alt="Discord" /></a>
</p>

---

## What is TavonnAI Web?

TavonnAI lets you add AI features to your web applications that run entirely on the user's device:

- **LLM Chat** — Llama, Mistral, Qwen, SmolLM, and more via llama.cpp WASM
- **Speech-to-Text** — Whisper-powered transcription via ONNX
- **Text-to-Speech** — Neural voice synthesis via ONNX
- **Voice Assistant** — Full STT → LLM → TTS pipeline in the browser

No cloud. No latency. No data leaves the browser.

---

## Quick Start (Web)

```typescript
import { RunAnywhere, TextGeneration } from '@runanywhere/web';

// 1. Initialize
await RunAnywhere.initialize({ environment: 'development' });

// 2. Load a model
await TextGeneration.loadModel('/models/qwen2.5-0.5b-instruct-q4_0.gguf', 'qwen2.5-0.5b');

// 3. Generate
const result = await TextGeneration.generate('What is the capital of France?');
console.log(result.text); // "Paris is the capital of France."
```

**Install via npm:**

```bash
npm install @runanywhere/web
```

[Full documentation →](sdk/runanywhere-web/) · [Source code](sdk/runanywhere-web/)

---

## Sample Apps

| Platform | Source Code |
|----------|-------------|
| **Web** | [examples/web/RunAnywhereAI](examples/web/RunAnywhereAI/) |

---

## Playground

### [On-Device Browser Agent](Playground/on-device-browser-agent/)

A Chrome extension that automates browser tasks entirely on-device using WebLLM and WebGPU. Uses a two-agent architecture -- a Planner that breaks down goals into steps and a Navigator that interacts with page elements -- with both DOM-based and vision-based page understanding. All AI inference runs locally on your GPU after the initial model download.

---

## Features

| Feature | Web |
|---------|-----|
| LLM Text Generation | ✅ |
| Streaming | ✅ |
| Speech-to-Text | ✅ |
| Text-to-Speech | ✅ |
| Voice Assistant Pipeline | ✅ |
| Vision Language Models | ✅ |
| Model Download + Progress | ✅ |
| Structured Output (JSON) | ✅ |
| Tool Calling | ✅ |
| Embeddings | ✅ |

---

## Supported Models

### LLM (GGUF format via llama.cpp)

| Model | Size | RAM Required | Use Case |
|-------|------|--------------|----------|
| SmolLM2 360M | ~400MB | 500MB | Fast, lightweight |
| Qwen 2.5 0.5B | ~500MB | 600MB | Multilingual |
| Llama 3.2 1B | ~1GB | 1.2GB | Balanced |

---

## Repository Structure

```
runanywhere-sdks/
├── sdk/
│   ├── runanywhere-web/            # Web SDK (WebAssembly)
│   └── runanywhere-commons/        # Shared C++ core
│
├── examples/
│   └── web/RunAnywhereAI/          # Web sample app
│
├── Playground/
│   └── on-device-browser-agent/    # Chrome browser automation agent
│
└── docs/                           # Documentation
```

---

## Requirements

- **Browser**: Chrome 120+ (recommended), Edge 120+, or any modern browser with WebAssembly and WebGPU support.
- **Memory**: 2GB minimum, 4GB+ recommended for larger models.

---

## Contributing

We welcome contributions. See our [Contributing Guide](CONTRIBUTING.md) for details.

```bash
# Clone the repo
git clone https://github.com/RunanywhereAI/runanywhere-sdks.git

# Set up the Web SDK
cd runanywhere-sdks/sdk/runanywhere-web
./scripts/build-web.sh --setup

# Run the sample app
cd ../../examples/web/RunAnywhereAI
pnpm install
pnpm run dev
```

---

## Support

- **Discord:** [Join our community](https://discord.gg/N359FBbDVd)
- **GitHub Issues:** [Report bugs or request features](https://github.com/RunanywhereAI/runanywhere-sdks/issues)
- **Email:** founders@runanywhere.ai

---

## License

Apache 2.0 — see [LICENSE](LICENSE) for details.
