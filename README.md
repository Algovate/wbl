# WBL - Webpack Bundle Loader

A CLI tool for loading, analyzing, and interacting with webpack bundles.

## Features

- 📦 Load webpack bundles (main and chunk formats)
- 🔍 List and search modules
- 🔬 Inspect module exports
- 🔗 Analyze module dependencies
- 📞 Call exported methods
- 💻 Interactive REPL mode

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
import { WebpackBundleLoader, ModuleAnalyzer } from 'wbl';

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
│   ├── bin/wbl.ts              # CLI entry
│   ├── lib/
│   │   ├── WebpackBundleLoader.ts
│   │   └── ModuleAnalyzer.ts
│   └── index.ts
├── tests/
│   ├── WebpackBundleLoader.test.ts
│   └── ModuleAnalyzer.test.ts
├── assets/                     # Sample bundles
└── dist/                       # Compiled output
```

## License

MIT
