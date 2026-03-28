# Plan: Remove Non-Web Code, Keep Only Web SDK + Web Example

## Context

The monorepo currently contains SDKs and examples for Android, iOS, Flutter, React Native, Swift, Kotlin, C++ Commons, and Web. The user only needs:
- `sdk/runanywhere-web/` (TypeScript Web SDK)
- `sdk/runanywhere-commons/` (C++ core — **required** by web SDK for WASM compilation via Emscripten)
- `examples/web/RunAnywhereAI/` (web demo app)

Everything else should be safely removed.

---

## Phase 1: Remove Directories

### 1A. Remove Example Apps (non-web)

| Directory | Contents | Keep? |
|-----------|----------|-------|
| `examples/android/` | Android example app | **Remove** |
| `examples/ios/` | iOS example app | **Remove** |
| `examples/flutter/` | Flutter example app | **Remove** |
| `examples/react-native/` | React Native example app | **Remove** |
| `examples/intellij-plugin-demo/` | IntelliJ plugin demo | **Remove** |

**Commands:**
```bash
rm -rf examples/android examples/ios examples/flutter examples/react-native examples/intellij-plugin-demo
```

### 1B. Remove SDK Packages (non-web, non-commons)

| Directory | Contents | Keep? |
|-----------|----------|-------|
| `sdk/runanywhere-kotlin/` | Kotlin/Android SDK | **Remove** |
| `sdk/runanywhere-swift/` | Swift/iOS SDK | **Remove** |
| `sdk/runanywhere-flutter/` | Flutter SDK | **Remove** |
| `sdk/runanywhere-react-native/` | React Native SDK | **Remove** |

**Commands:**
```bash
rm -rf sdk/runanywhere-kotlin sdk/runanywhere-swift sdk/runanywhere-flutter sdk/runanywhere-react-native
```

### 1C. Remove Entire Playground Directory

None of the 6 Playground projects depend on or are referenced by the web SDK or web example.

| Directory | Contents | Keep? |
|-----------|----------|-------|
| `Playground/` | All playground apps (linux-voice-assistant, swift-starter-app, android-use-agent, on-device-browser-agent, openclaw-hybrid-assistant, YapRun) | **Remove** |

**Command:**
```bash
rm -rf Playground/
```

---

## Phase 2: Remove Root-Level Config Files (non-web)

These files only serve Kotlin/Gradle/Swift/JitPack builds:

| File | Purpose | Action |
|------|---------|--------|
| `build.gradle.kts` | Root Gradle build script (Kotlin SDK + Android example + IntelliJ plugin) | **Remove** |
| `settings.gradle.kts` | Gradle project settings | **Remove** |
| `gradle.properties` | Gradle/JVM properties | **Remove** |
| `gradle/` | Gradle wrapper distribution | **Remove** |
| `gradlew` | Gradle wrapper script (Unix) | **Remove** |
| `gradlew.bat` | Gradle wrapper script (Windows) | **Remove** |
| `.gradle/` | Gradle daemon cache | **Remove** |
| `Package.swift` | Swift Package Manager manifest (Swift SDK) | **Remove** |
| `Package.resolved` | SPM dependency lock file | **Remove** |
| `jitpack.yml` | JitPack/Maven Central publish config (Kotlin SDK) | **Remove** |
| `.yarnrc.yml` | Empty Yarn config | **Remove** |
| `yarn.lock` | Yarn lockfile (no root package.json that uses it) | **Remove** |
| `package-lock.json` | Empty root lockfile (no root package.json that uses it) | **Remove** |

**Command:**
```bash
rm -f build.gradle.kts settings.gradle.kts gradle.properties gradlew gradlew.bat Package.swift Package.resolved jitpack.yml .yarnrc.yml yarn.lock package-lock.json
rm -rf gradle/ .gradle/
```

---

## Phase 3: Remove Scripts (non-web)

| File | Purpose | Action |
|------|---------|--------|
| `scripts/lint-android.sh` | Android linting (references kotlin SDK, android example) | **Remove** |
| `scripts/lint-ios.sh` | iOS linting (references swift SDK, iOS example) | **Remove** |
| `scripts/release_ios_sdk.sh` | iOS SDK release (references swift SDK) | **Remove** |
| `scripts/lint-all.sh` | Calls lint-ios.sh and lint-android.sh (no web lint) | **Remove** |

**Command:**
```bash
rm -f scripts/lint-android.sh scripts/lint-ios.sh scripts/release_ios_sdk.sh scripts/lint-all.sh
```

> Note: `scripts/` directory becomes empty and should be removed too, unless `docs/` references it.

---

## Phase 4: Remove GitHub Actions Workflows (non-web)

### Keep These Workflows

| Workflow | Why Keep |
|----------|----------|
| `.github/workflows/web-sdk-release.yml` | Builds and releases the web SDK |
| `.github/workflows/backends-release.yml` | Releases commons backends (needed for web WASM) |
| `.github/workflows/commons-release.yml` | Releases commons core |
| `.github/workflows/secret-scan.yml` | Security scanning, no SDK-specific refs |

### Remove These Workflows

| Workflow | Reason |
|----------|--------|
| `.github/workflows/build-all-test.yml` | Has mixed jobs; rewrite to keep only web job OR remove entirely |
| `.github/workflows/kotlin-sdk-release.yml` | Kotlin SDK release |
| `.github/workflows/swift-sdk-release.yml` | Swift SDK release |
| `.github/workflows/react-native-sdk-release.yml` | React Native SDK release |
| `.github/workflows/flutter-sdk-release.yml` | Flutter SDK release |
| `.github/workflows/publish-maven-central.yml` | Maven Central publish (Kotlin) |
| `.github/workflows/release-all.yml` | Unified release (Kotlin, Swift, Flutter, RN) |
| `.github/workflows/codeql.yml` | CodeQL analysis targets Swift SDK only |

**Decision needed on `build-all-test.yml`:** This workflow has separate jobs for each SDK. Should we:
- (A) Rewrite it to only contain the web SDK job, OR
- (B) Remove it entirely (web-sdk-release.yml already covers web builds)

**Command:**
```bash
rm -f .github/workflows/kotlin-sdk-release.yml
rm -f .github/workflows/swift-sdk-release.yml
rm -f .github/workflows/react-native-sdk-release.yml
rm -f .github/workflows/flutter-sdk-release.yml
rm -f .github/workflows/publish-maven-central.yml
rm -f .github/workflows/release-all.yml
rm -f .github/workflows/codeql.yml
# build-all-test.yml: rewrite or remove (see above decision)
```

---

## Phase 5: Update Existing Files

### 5A. `.gitignore`

**Remove lines referencing removed SDKs/examples:**
- Lines referencing `sdk/runanywhere-flutter/` (android/, ios/, *.xcframework, *.aar)
- Lines referencing `sdk/runanywhere-kotlin/` (config files, JNI libs, native libs)
- Lines referencing `sdk/runanywhere-swift/` (config files, Binaries/*.xcframework, vendor/, DevelopmentConfig.swift)
- Lines referencing `sdk/runanywhere-react-native/` (jniLibs, xcframework, prebuilt)
- Lines referencing `examples/android/` (cpp backup)
- Lines referencing `examples/intellij-plugin-demo/` (.idea/)

**Keep lines referencing:**
- `sdk/runanywhere-web/` (node_modules, dist, wasm, emsdk, package-lock.json)
- `sdk/runanywhere-commons/` (build/, dist/, third_party/)
- `examples/web/` (node_modules/)

### 5B. `CLAUDE.md`

Remove all sections about:
- Kotlin SDK build/test/lint
- Swift SDK build/test
- Android example build/test
- iOS example build/test
- React Native (mentions in commit messages)

Keep sections about:
- Web SDK build/test
- Web example (TavonnAI Web App)

### 5C. `CONTRIBUTING.md`

Remove references to:
- Kotlin SDK setup
- Swift SDK setup
- Android example
- iOS example

Keep general contribution guidelines that still apply.

### 5D. `README.md`

Remove sections about:
- iOS/Swift SDK
- Android/Kotlin SDK
- Flutter SDK
- React Native SDK
- All Playground projects
- Android/iOS/Flutter/RN examples

Keep sections about:
- Web SDK
- Web example
- General project info

### 5E. `.pre-commit-config.yaml`

Remove hooks referencing:
- `sdk/runanywhere-swift` (SwiftLint hooks)
- `examples/ios/RunAnywhereAI` (SwiftLint hooks)
- `sdk/runanywhere-android` (commented-out Android hooks)
- `examples/android/RunAnywhereAI` (commented-out Android hooks)

### 5F. `AGENTS.md`

Remove references to:
- Kotlin SDK sections
- Android example
- Linux voice assistant Playground project
- Keep web SDK, web example, commons sections

### 5G. `docs/building.md`

Remove sections about:
- Kotlin SDK build
- Android example build
- IntelliJ plugin demo build
- `examples/RunAnyWhereLora` (doesn't even exist)

### 5H. `.github/pull_request_template.md`

Remove checklist items about:
- Android/iOS/Flutter/React Native SDKs
- Android/iOS/Flutter/React Native examples
- Playground testing

Keep sections about:
- Web SDK
- Web example
- Commons

### 5I. `deployment_dokploy.md`

No changes needed — this only references web SDK and web example.

---

## Phase 6: Cleanup Empty Directories

After removal, check if these directories are now empty:
- `examples/` — should still have `web/` and `logo.svg`
- `scripts/` — will be empty, remove it
- `docs/` — keep (has `building.md` and `gifs/`)
- `.github/` — keep (still has workflows)

---

## Phase 7: Verify Web Version Still Works

After all changes:
1. `npm run build -w packages/core` from `sdk/runanywhere-web/` should still work
2. `npm run typecheck -w packages/core` from `sdk/runanywhere-web/` should still work
3. `npm run dev` from `examples/web/RunAnywhereAI/` should still work
4. No broken imports or missing dependencies

---

## Execution Order

1. Phase 1 (remove directories) — largest disk savings
2. Phase 2 (remove root configs) — clean up project root
3. Phase 3 (remove scripts) — dead scripts
4. Phase 4 (remove CI workflows) — dead CI
5. Phase 5 (update existing files) — fix broken references
6. Phase 6 (cleanup empty dirs)
7. Phase 7 (verify web still works)

## Risk Assessment

**Low risk:** All removed directories are independent from the web SDK and web example. The web SDK only depends on `runanywhere-commons` (kept). The web example only depends on pre-built WASM artifacts from the web SDK npm package.

**Key invariant preserved:** `sdk/runanywhere-commons/` is kept because the web SDK's WASM layer is compiled directly from commons' C++ source via Emscripten.
