# WBL

Webpack Bundle Loader - Load and analyze webpack bundles in Node.js.

## Install

```bash
npm install wbl
```

## Quick Start

```bash
# List modules
wbl list -b bundle.js

# Search (--api for API endpoints only)
wbl search <pattern> -b bundle.js
wbl search query --api -b bundle.js

# Inspect (--deep for source analysis)
wbl inspect <id> -b bundle.js
wbl inspect <id> --deep -b bundle.js

# Dependencies (--graph for Mermaid diagram)
wbl deps <id> -b bundle.js
wbl deps <id> --graph -b bundle.js

# Source with source map
wbl source <id> -b bundle.js --sourcemap bundle.js.map

# Interactive REPL
wbl repl bundle.js
```

## Commands

| Command | Description |
|---------|-------------|
| `list` | List modules (`--category` to filter) |
| `search` | Search by pattern (`--api` for endpoints) |
| `inspect` | View exports (`--deep` for analysis) |
| `deps` | Dependencies (`--graph` for diagram) |
| `source` | View source code (`--sourcemap` for original) |
| `call` | Call a method |
| `info` | Bundle info |
| `repl` | Interactive mode |

**Global Options:**
- `--json` - Output as JSON (for scripts)

## Programmatic API

```javascript
import { WebpackBundleLoader, ModuleAnalyzer, SourceMapResolver } from 'wbl';

// Sync loading
const loader = new WebpackBundleLoader();
loader.loadBundleSync('bundle.js');

// Or async with source map
await loader.loadBundle('bundle.js', { loadSourceMap: true });

// Get original source (if source map loaded)
const original = loader.getOriginalSource('./src/module.ts');

// Analyze modules
const analyzer = new ModuleAnalyzer(loader);
const modules = analyzer.listModules();
const exports = analyzer.analyzeExports('moduleId');

// Use extractors directly
import { extractApiEndpoints, categorizeModule } from 'wbl';
const endpoints = extractApiEndpoints(sourceCode);
const categories = categorizeModule(sourceCode);
```

## Source Map Support

Load source maps to view original TypeScript/ES6+ source:

```javascript
// Automatic loading from bundle
const resolver = new SourceMapResolver();
await resolver.loadFromBundle('bundle.js');

// Or from file
await resolver.loadFromFile('bundle.js.map');

// Get original sources
const sources = resolver.getSources();
const content = resolver.getSourceContent(sources[0]);
```

## Documentation

- [CLI Reference](docs/cli.md)
- [Programmatic API](docs/api.md)
- [Browser Environment](docs/browser-env.md)
- [Bundle Formats](docs/formats.md)

## License

MIT
