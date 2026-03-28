# AGENTS.md

## Environment Overview

This is a web-focused SDK monorepo. The active components are:

| Component | Build | Test | Lint | Notes |
|-----------|-------|------|------|-------|
| Web SDK (TypeScript) | `npm run build -w packages/core` (from `sdk/runanywhere-web/`) | N/A | `npm run typecheck -w packages/core` | `llamacpp` package has a pre-existing duplicate index signature TS error |
| TavonnAI Web App | `npm run dev` (from `examples/web/RunAnywhereAI/`) | Manual browser testing at `localhost:5173` | N/A | Full Vite app, works in demo mode without WASM |
| C++ Commons (core) | `cmake -B build ... && cmake --build build` (from `sdk/runanywhere-commons/`) | `./build/tests/test_core --run-all` (13 tests, no models needed) | N/A | Required for WASM builds. Must use `gcc`/`g++` via `CC=gcc CXX=g++` (clang lacks C++ stdlib headers) |
| C++ Commons (full backends) | `CC=gcc CXX=g++ bash scripts/build-linux.sh --shared` | Backend tests need downloaded models | N/A | Builds onnx+llamacpp. RAG backend has pre-existing zero-size array bug; use `-DRAC_BACKEND_RAG=OFF` |

### Key Gotchas

- **C++ compiler**: Default clang on this VM lacks `libc++` headers. Use `gcc`/`g++` via `-DCMAKE_C_COMPILER=gcc -DCMAKE_CXX_COMPILER=g++`.
- **pre-commit hooks**: Installed via `pre-commit install`. Requires `git config --unset-all core.hooksPath` first if `core.hooksPath` is set.

### Standard commands

See `CLAUDE.md` for comprehensive build/test/lint commands. See `CONTRIBUTING.md` for contributor setup flow.
