# Building the Project

## Prerequisites

- Node.js 18+
- npm or pnpm

## Web SDK

### First-time setup

```bash
cd sdk/runanywhere-web/
npm install
```

### Build

```bash
# TypeScript typecheck
npm run typecheck -w packages/core

# TypeScript build
npm run build -w packages/core

# Full build (WASM + TypeScript, requires Emscripten)
./scripts/build-web.sh --setup
./scripts/build-web.sh
```

### Output Locations

| Artifact | Path |
|----------|------|
| TypeScript | `sdk/runanywhere-web/packages/core/dist/` |
| WASM module | `sdk/runanywhere-web/packages/core/wasm/racommons.wasm` |

## Web Example App

```bash
cd examples/web/RunAnywhereAI/
npm install
npm run dev
```

Opens at `http://localhost:5173`.

## C++ Commons (for WASM builds)

The web SDK's WASM layer is compiled from `sdk/runanywhere-commons/` via Emscripten.

```bash
cd sdk/runanywhere-commons/
cmake -B build -DCMAKE_BUILD_TYPE=Release
cmake --build build
```

See `sdk/runanywhere-web/wasm/CMakeLists.txt` for WASM-specific build configuration.
