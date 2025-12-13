# WBL - Webpack Bundle Loader

A CLI tool for loading, analyzing, and interacting with webpack bundles.

## Features

- 📦 Load webpack bundles (Webpack 4 & 5)
- 🔍 List and search modules
- 🔬 Inspect module exports
- 🔗 Analyze dependencies
- 📞 Call exported methods
- 💻 Interactive REPL

## Installation

```bash
npm install wbl
```

## CLI Usage

```bash
# Show bundle info
wbl info -b bundle.js

# List all modules
wbl list -b bundle.js

# Inspect module exports
wbl inspect <moduleId> -b bundle.js

# Show dependencies
wbl deps <moduleId> -b bundle.js

# Search modules
wbl search <pattern> -b bundle.js

# Call a method
wbl call <moduleId.method> [args...] -b bundle.js

# Interactive REPL
wbl repl bundle.js
```

## Programmatic API

```typescript
import { WebpackBundleLoader, ModuleAnalyzer, setupBrowserEnv } from 'wbl';

// Optional: Setup browser environment for DOM-dependent bundles
setupBrowserEnv({ url: 'https://example.com/' });

const loader = new WebpackBundleLoader();
loader.loadBundle('path/to/bundle.js');

const analyzer = new ModuleAnalyzer(loader);
const modules = analyzer.listModules();
const exports = analyzer.analyzeExports('moduleId');
const result = analyzer.callMethod('moduleId', 'methodName', [args]);
```

## Browser Environment Options

| Option | Type | Description |
|--------|------|-------------|
| `url` | string | Simulated page URL |
| `referrer` | string | Referrer URL |
| `regexpPatches` | `Record<string, string>` | Fix malformed regex patterns |
| `storageQuota` | number | localStorage/sessionStorage quota |

## Supported Bundle Formats

| Format | Version | Detection |
|--------|---------|-----------|
| Main | Webpack 4 | `}({` |
| Chunk | Webpack 4 | `(window.webpackJsonp` |
| IIFE | Webpack 5 | `(() => { /******/` |
| UMD | Webpack 5 | `webpackUniversalModuleDefinition` |

## ⚠️ Security Notice

This tool uses `eval()` internally. **Only load bundles from trusted sources.**

## License

MIT
