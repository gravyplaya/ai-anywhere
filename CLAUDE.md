# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.
- Focus on SIMPLICITY, and following Clean SOLID principles when writing code. Reusability, Clean architecture(not strictly) style, clear separation of concerns.
### Before starting work.
- Do NOT write ANY MOCK IMPLEMENTATION unless specified otherwise.
- DO NOT PLAN or WRITE any unit tests unless specified otherwise.
- Always in plan mode to make a plan.
- After get the plan, make sure you Write the plan to the appropriate file as mentioned in the guide that you referred to.
- If the task require external knowledge or certain package, also research to get latest knowledge (Use Task tool for research)
- Don't over plan it, always think MVP.
- Once you write the plan, firstly ask me to review it. Do not continue until I approve the plan.
### While implementing
- You should update the plan as you work.
- After you complete tasks in the plan, you should update and append detailed descriptions of the changes you made, so following tasks can be easily hand over to other engineers.
- Always make sure that you're using structured types, never use strings directly so that we can keep things consistent and scalable and not make mistakes.
- Read files FULLY to understand the FULL context. Only use offset/limit when the file is large and you are short on context.
- When fixing issues focus on SIMPLICITY, and following Clean SOLID principles, do not add complicated logic unless necessary!
- When looking up something: It's December 2025 FYI

## Repository Overview

This repository contains SDKs for the TavonnAI on-device AI platform. The platform provides intelligent routing between on-device and cloud AI models to optimize for cost and privacy.

### SDK Implementations
- **Web SDK** (`sdk/runanywhere-web/`) - TypeScript/WASM SDK for browsers via Emscripten

### Example Applications
- **Web Demo** (`examples/web/RunAnywhereAI/`) - Sample web app demonstrating SDK usage

## Common Development Commands

### Web SDK Development

```bash
# Navigate to Web SDK
cd sdk/runanywhere-web/

# First-time setup (installs emsdk, npm deps, builds WASM + TypeScript)
./scripts/build-web.sh --setup

# Build WASM + TypeScript (all backends, default)
./scripts/build-web.sh

# Build WASM with specific backends
./scripts/build-web.sh --build-wasm --llamacpp --onnx
./scripts/build-web.sh --build-wasm --all-backends
./scripts/build-web.sh --build-wasm --llamacpp --vlm --webgpu

# Build TypeScript only (after WASM is already built)
./scripts/build-web.sh --build-ts

# Build sherpa-onnx WASM module (TTS/VAD)
./scripts/build-web.sh --build-sherpa

# Debug build with assertions
./scripts/build-web.sh --debug --llamacpp

# Clean all build artifacts
./scripts/build-web.sh --clean

# Direct npm commands (alternative)
npm run build:wasm            # WASM build (core only, no backends)
npm run build:ts              # TypeScript compilation
npm run build                 # TypeScript only (default)
npm run dev                   # TypeScript watch mode
npm run typecheck             # Type-check without emitting
npm run clean                 # Remove all build outputs
```

#### Build Output Locations

After a successful build:
- **WASM module**: `packages/core/wasm/racommons.wasm` + `racommons.js`
- **WebGPU variant**: `packages/core/wasm/racommons-webgpu.wasm` (when --webgpu is used)
- **Sherpa-ONNX**: `packages/core/wasm/sherpa/sherpa-onnx.wasm`
- **TypeScript**: `packages/core/dist/`

#### Prerequisites

- **Emscripten SDK**: v5.0.0+ (installed automatically by `--setup`)
- **CMake**: 3.22+
- **Node.js**: 18+

### Web Example App

```bash
# Navigate to web example
cd examples/web/RunAnywhereAI/

# Install dependencies and run dev server
npm install
npm run dev
```

### Pre-commit Hooks

```bash
# Run all pre-commit checks
pre-commit run --all-files
```

## Design Patterns

1. **Repository Pattern**: Data access abstraction with platform-specific implementations
2. **Service Container**: Centralized dependency injection
3. **Event Bus**: Reactive communication between components
4. **Provider Pattern**: Platform-specific service providers (STT, VAD)

## CI/CD Pipeline

GitHub Actions workflows are configured for automated testing and building:

- **Path-based triggers**: Workflows only run when relevant files change
- **Artifact uploads**: Build outputs and test results are preserved

Workflows are located in `.github/workflows/`:
- `web-sdk-release.yml` - Web SDK release

## Development Notes

- Configuration files (`dev.json`, `staging.json`, `prod.json`) are git-ignored - use example files as templates
- The SDK focuses on privacy-first, on-device AI with intelligent routing
- Cost optimization is a key feature with real-time tracking
- Pre-commit hooks are configured for code quality enforcement
