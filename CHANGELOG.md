---
noteId: "17c07640d77511f0a11f73f0aa0ce009"
tags: []

---

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-12-13

### Added

- **Custom Error Classes**: `BundleLoadError`, `ModuleNotFoundError`, `ModuleExecutionError`, `UnknownBundleFormatError`
- **Centralized Constants**: `BUNDLE_PATTERNS`, `REQUIRE_PATTERNS`, `BROWSER_ENV_DEFAULTS`, `CLI_CONFIG`, `LIMITS`
- **Utility Functions**: `findMatchingBrace`, `formatSize`, `truncate`, `getValuePreview`, `formatSource`
- **CLI Command Modules**: Extracted all commands to `src/bin/commands/`
- **BrowserEnv Cleanup**: `setupBrowserEnv()` now returns `{ dom, cleanup }` for proper resource management
- **RegExp Patching**: Added `regexpPatches` option to handle malformed regex patterns in bundles
- **Dependency Detection**: Added `__webpack_require__` pattern for better dependency analysis
- **Module-level Documentation**: Added JSDoc to main exports in `src/index.ts`
- **Unit Tests**: Added 47 new tests for utilities, errors, and constants (72 total)
- **Security Warning**: Added documentation about `eval()` usage in README

### Changed

- **CLI Refactoring**: Reduced `wbl.ts` from 417 to 130 lines
- **Package Exports**: Updated `main` and `types` to point to `dist/index.js`
- **Dependencies**: Moved `jsdom` from devDependencies to dependencies

### Fixed

- **Regex Pattern Reuse**: Fixed global regex state issues in dependency detection
- **Error Context**: Module execution errors now include module ID
- **Function.toString()**: Gracefully handles native/bound functions

## [0.1.0] - 2024-12-12

### Added

- Initial release
- `WebpackBundleLoader` class for loading webpack bundles
- `ModuleAnalyzer` class for analyzing modules
- `setupBrowserEnv` for JSDOM-based browser simulation
- CLI with commands: list, inspect, deps, search, source, call, info, repl
