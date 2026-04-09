# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.
- Focus on SIMPLICITY, and following Clean SOLID principles when writing code. Reusability, Clean architecture(not strictly) style, clear separation of concerns.

### Before starting work.
- Do NOT write ANY MOCK IMPLEMENTATION unless specified otherwise.
- DO NOT PLAN or WRITE any unit tests unless specified otherwise.
- Always refer to the implementation plan and task list for execution.
- If the task require external knowledge or certain package, also research to get latest knowledge (Use Task tool for research)
- Don't over plan it, always think MVP.

### While implementing
- You should update the plan as you work.
- After you complete tasks in the plan, you should update and append detailed descriptions of the changes you made.
- Always make sure that you're using structured types, never use strings directly.
- Read files FULLY to understand the FULL context.
- When fixing issues focus on SIMPLICITY, and following Clean SOLID principles.

## Repository Overview

This repository contains the Web implementation of the TavonnAI on-device AI platform. The platform provides intelligent routing between on-device (WASM) and cloud AI models to optimize for cost and privacy.

### Key Components
- **Web SDK** (`sdk/runanywhere-web/`) - TypeScript/WASM SDK for browsers via Emscripten.
- **Web Demo** (`examples/web/RunAnywhereAI/`) - Sample web app demonstrating SDK usage.
- **C++ Commons** (`sdk/runanywhere-commons/`) - Core C++ logic used by the WASM build.

## Common Development Commands

### Web SDK Development

```bash
# Navigate to Web SDK
cd sdk/runanywhere-web/

# First-time setup (installs emsdk, npm deps, builds WASM + TypeScript)
./scripts/build-web.sh --setup

# Build WASM + TypeScript (all backends, default)
./scripts/build-web.sh

# Build TypeScript only (after WASM is already built)
./scripts/build-web.sh --build-ts

# Build sherpa-onnx WASM module (TTS/VAD)
./scripts/build-web.sh --build-sherpa

# Clean all build artifacts
./scripts/build-web.sh --clean

# Direct npm commands
npm run build                 # TypeScript only (default)
npm run dev                   # TypeScript watch mode
npm run typecheck             # Type-check without emitting
npm run clean                 # Remove all build outputs
```

#### Build Output Locations
- **WASM module**: `packages/core/wasm/racommons.wasm` + `racommons.js`
- **TypeScript**: `packages/core/dist/`

### Web Example App

```bash
# Navigate to web example
cd examples/web/RunAnywhereAI/

# Install dependencies and run dev server
pnpm install
pnpm run dev
```

### Pre-commit Hooks

```bash
# Run all pre-commit checks
pre-commit run --all-files
```

## Architecture Overview

### Web SDK Architecture

The Web SDK bridges high-performance C++ logic (RACommons) to the browser via WebAssembly:

1. **WASM Layer** (`sdk/runanywhere-web/wasm/`):
   - C++ exports and Emscripten shims.
   - Integration with llama.cpp, whisper.cpp, and Sherpa-ONNX.

2. **TypeScript Core** (`sdk/runanywhere-web/packages/core/`):
   - High-level API for LLM, STT, TTS, and VAD.
   - Resource management (WASM module loading, worker orchestration).
   - Smart routing between local WASM and cloud providers.

3. **Backend Packages**:
   - `@runanywhere/llamacpp`: LLM inference.
   - `@runanywhere/onnx`: TTS and VAD.

### Performance Best Practices

1. **Worker Offloading**: Always run heavy inference in Web Workers to keep the main thread responsive.
2. **Memory Management**: Explicitly `destroy()` WASM-backed components to free up heap memory.
3. **Lazy Loading**: Only load WASM modules and AI models when they are actually needed.
4. **SharedArrayBuffer**: Use pthreads (if supported) for multi-threaded inference where possible.

## CI/CD Pipeline

GitHub Actions workflows are configured for automated testing and building:
- `web-sdk-release.yml` - Web SDK release pipeline.
