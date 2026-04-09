# AGENTS.md

## Cursor Cloud specific instructions

### Environment Overview

This repository is focused on the Web implementation of the TavonnAI on-device AI platform. The buildable services are:

| Component | Build | Test | Lint | Notes |
|-----------|-------|------|------|-------|
| Web SDK (TypeScript) | `npm run build -w packages/core` (from `sdk/runanywhere-web/`) | N/A | `npm run typecheck -w packages/core` | `llamacpp` package has a pre-existing duplicate index signature TS error |
| TavonnAI Web App | `npm run dev` (from `examples/web/RunAnywhereAI/`) | Manual browser testing at `localhost:5173` | N/A | Full Vite app, works in demo mode without WASM |
| C++ Commons (core) | `emcmake cmake -B build ...` (from `sdk/runanywhere-web/wasm/`) | N/A | N/A | Builds RACommons + platform shims to WebAssembly using Emscripten. |

### Key Gotchas

- **Emscripten SDK**: Required for building WASM. Use `./scripts/build-web.sh --setup` in `sdk/runanywhere-web/` to install and activate `emsdk`.
- **Node.js**: v18+ is required.
- **C++ compiler**: When building for WASM, use `emcmake` and `emmake`.
- **pre-commit hooks**: Installed via `pre-commit install`. Requires `git config --unset-all core.hooksPath` first if `core.hooksPath` is set.

### Web SDK Quick Start

```bash
# 1. Setup Emscripten and build WASM
cd sdk/runanywhere-web
./scripts/build-web.sh --setup

# 2. Build TypeScript packages
npm run build

# 3. Run the example web app
cd ../../examples/web/RunAnywhereAI
pnpm install
pnpm run dev
```

### Standard commands

See `CLAUDE.md` for comprehensive build/test/lint commands for the Web platform. See `CONTRIBUTING.md` for contributor setup flow.
