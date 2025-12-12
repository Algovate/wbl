# WBL - Webpack Bundle Loader

A CLI tool for loading, analyzing, and interacting with webpack bundles.

## Features

- 📦 Load webpack bundles (main and chunk formats)
- 🔍 List and search modules
- 🔬 Inspect module exports
- 🔗 Analyze module dependencies
- 📞 Call exported methods
- 💻 Interactive REPL mode

## ⚠️ Security Notice

This tool uses `eval()` internally to parse and execute webpack bundle modules. **Only load bundles from trusted sources.** Loading malicious bundles could result in arbitrary code execution.

If you need to analyze untrusted bundles, consider running this tool in an isolated environment (e.g., Docker container, VM).

## Installation

```bash
npm install
npm run build
```

## Usage

### CLI Commands

```bash
# Show bundle info
wbl info -b bundle.js

# List all modules
wbl list -b bundle.js

# Inspect a module's exports
wbl inspect <moduleId> -b bundle.js

# Show module dependencies
wbl deps <moduleId> -b bundle.js

# Search modules by pattern
wbl search <pattern> -b bundle.js

# Call a module method
wbl call <moduleId.method> [args...] -b bundle.js

# Interactive REPL
wbl repl bundle.js [more-bundles...]
```

### Examples

```bash
# Load multiple bundles and show info
node dist/bin/wbl.js info -b assets/app.js assets/chunk.js

# Inspect encryption module
node dist/bin/wbl.js inspect 7d92 -b assets/app.js

# Call a utility function
node dist/bin/wbl.js call b381.parseUtf8StringToHex '"hello"' -b assets/app.js
# Result: 68656c6c6f

# Start REPL
node dist/bin/wbl.js repl assets/app.js
```

### Programmatic API

```typescript
import { WebpackBundleLoader, ModuleAnalyzer, setupBrowserEnv } from 'wbl';

// Optional: Setup browser environment for bundles that need DOM/window
setupBrowserEnv({
    url: 'https://example.com/',
    referrer: 'https://example.com/',
    regexpPatches: { "['鈥橾": "\\['鈥橾" }  // Fix malformed regex patterns
});

const loader = new WebpackBundleLoader();
loader.loadBundle('path/to/bundle.js');

const analyzer = new ModuleAnalyzer(loader);

// List modules
const modules = analyzer.listModules();

// Analyze exports
const exports = analyzer.analyzeExports('moduleId');

// Call a method
const result = analyzer.callMethod('moduleId', 'methodName', [args]);
```

### Browser Environment Options

| Option | Type | Description |
|--------|------|-------------|
| `url` | string | The URL for the simulated page |
| `referrer` | string | The referrer URL |
| `regexpPatches` | Record<string, string> | Map of broken regex patterns to fixed versions |
| `storageQuota` | number | Storage quota for localStorage/sessionStorage |
| `runScripts` | "dangerously" \| "outside-only" | Script execution mode |

## Bundle Formats

| Format | Description | Detection |
|--------|-------------|-----------|
| **main** | Entry bundle with webpack runtime | `!function(e) { ... }({ modules })` |
| **chunk** | Lazy-loaded code split chunks | `(window.webpackJsonp = ...).push(...)` |

## Development

```bash
# Build
npm run build

# Watch mode
npm run dev

# Run tests
npm run test

# Lint
npm run lint
```

## Project Structure

```
wbl/
├── src/
│   ├── bin/
│   │   ├── wbl.ts              # CLI entry point
│   │   ├── types.ts            # CLI types (CommandContext)
│   │   └── commands/           # CLI command handlers
│   │       ├── list.ts
│   │       ├── inspect.ts
│   │       ├── deps.ts
│   │       ├── search.ts
│   │       ├── source.ts
│   │       ├── call.ts
│   │       ├── info.ts
│   │       └── repl.ts
│   ├── lib/
│   │   ├── WebpackBundleLoader.ts  # Core bundle loading
│   │   ├── ModuleAnalyzer.ts       # Export/dependency analysis
│   │   ├── BrowserEnv.ts           # JSDOM-based browser simulation
│   │   ├── errors.ts               # Custom error classes
│   │   ├── constants.ts            # Bundle patterns, defaults, limits
│   │   └── utils/                  # Utility functions
│   │       ├── parsing.ts          # Brace matching
│   │       └── formatting.ts       # String formatting
│   └── index.ts                # Main exports
├── tests/
│   ├── WebpackBundleLoader.test.ts
│   └── ModuleAnalyzer.test.ts
├── examples/                   # Usage examples
├── assets/                     # Sample bundles
└── dist/                       # Compiled output
```

## License

MIT
