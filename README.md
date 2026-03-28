<p align="center">
  <img src="examples/logo.svg" alt="TavonnAI Logo" width="140"/>
</p>

<h1 align="center">TavonnAI</h1>

<p align="center">
  <strong>On-device AI for the web.</strong><br/>
  Run LLMs, speech-to-text, and text-to-speech locally in the browser — private, offline, fast.
</p>

<p align="center">
  <a href="https://github.com/RunanywhereAI/runanywhere-sdks/stargazers"><img src="https://img.shields.io/github/stars/RunanywhereAI/runanywhere-sdks?style=flat-square" alt="GitHub Stars" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-Apache%202.0-blue?style=flat-square" alt="License" /></a>
  <a href="https://discord.gg/N359FBbDVd"><img src="https://img.shields.io/badge/Discord-Join-5865F2?style=flat-square&logo=discord&logoColor=white" alt="Discord" /></a>
</p>

## See It In Action

<div align="center">
<table>
  <tr>
    <td align="center" width="50%">
      <img src="docs/gifs/text-generation.gif" alt="Text Generation" width="240"/><br/><br/>
      <strong>Text Generation</strong><br/>
      <sub>LLM inference — 100% on-device</sub>
    </td>
    <td width="40"></td>
    <td align="center" width="50%">
      <img src="docs/gifs/voice-ai.gif" alt="Voice AI" width="240"/><br/><br/>
      <strong>Voice AI</strong><br/>
      <sub>STT → LLM → TTS pipeline — fully offline</sub>
    </td>
  </tr>
  <tr><td colspan="3" height="30"></td></tr>
  <tr>
    <td align="center" width="50%">
      <img src="docs/gifs/image-generation.gif" alt="Image Generation" width="240"/><br/><br/>
      <strong>Image Generation</strong><br/>
      <sub>On-device diffusion model</sub>
    </td>
    <td width="40"></td>
    <td align="center" width="50%">
      <img src="docs/gifs/visual-language-model.gif" alt="Visual Language Model" width="240"/><br/><br/>
      <strong>Visual Language Model</strong><br/>
      <sub>Vision + language understanding on-device</sub>
    </td>
  </tr>
</table>
</div>

---

## What is TavonnAI?

TavonnAI lets you add AI features to your web app that run entirely on-device:

- **LLM Chat** — Llama, Mistral, Qwen, SmolLM, and more
- **Speech-to-Text** — Whisper-powered transcription
- **Text-to-Speech** — Neural voice synthesis
- **Voice Assistant** — Full STT → LLM → TTS pipeline

No cloud. No latency. No data leaves the device.

---

## SDKs

| Platform | Status | Installation | Documentation |
|----------|--------|--------------|---------------|
| **Web** (Browser) | Beta | [npm](#web-browser) | [SDK README](sdk/runanywhere-web/) |

---

## Quick Start

### Web (Browser)

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

Full-featured demo applications demonstrating SDK capabilities:

| Platform | Source Code | Download |
|----------|-------------|----------|
| Web | [examples/web/RunAnywhereAI](examples/web/RunAnywhereAI/) | Build from source |

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
| Mistral 7B Q4 | ~4GB | 5GB | High quality |

### Speech-to-Text (Whisper via ONNX)

| Model | Size | Languages |
|-------|------|-----------|
| Whisper Tiny | ~75MB | English |
| Whisper Base | ~150MB | Multilingual |

### Text-to-Speech (Piper via ONNX)

| Voice | Size | Language |
|-------|------|----------|
| Piper US English | ~65MB | English (US) |
| Piper British English | ~65MB | English (UK) |

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
└── docs/                           # Documentation
```

---

## Requirements

| Platform | Minimum | Recommended |
|----------|---------|-------------|
| Web | Chrome 96+ / Edge 96+ | Chrome 120+ |

**Memory:** 2GB minimum, 4GB+ recommended for larger models

---

## Contributing

We welcome contributions. See our [Contributing Guide](CONTRIBUTING.md) for details.

```bash
# Clone the repo
git clone https://github.com/RunanywhereAI/runanywhere-sdks.git

# Set up the Web SDK
cd runanywhere-sdks/sdk/runanywhere-web
npm install

# Run the sample app
cd ../../examples/web/RunAnywhereAI
npm install
npm run dev
```

---

## Support

- **Discord:** [Join our community](https://discord.gg/N359FBbDVd)
- **GitHub Issues:** [Report bugs or request features](https://github.com/RunanywhereAI/runanywhere-sdks/issues)
- **Email:** founders@runanywhere.ai
- **Twitter:** [@RunanywhereAI](https://twitter.com/RunanywhereAI)

---

## License

Apache 2.0 — see [LICENSE](LICENSE) for details.
