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
| `source` | View source code |
| `call` | Call a method |
| `info` | Bundle info |
| `repl` | Interactive mode |

**Global Options:**
- `--json` - Output as JSON (for scripts)

## Programmatic API

```javascript
import { WebpackBundleLoader, ModuleAnalyzer } from 'wbl';

const loader = new WebpackBundleLoader();
loader.loadBundle('bundle.js');

const analyzer = new ModuleAnalyzer(loader);
const modules = analyzer.listModules();
const exports = analyzer.analyzeExports('moduleId');
```

## Documentation

- [CLI Reference](docs/cli.md)
- [Programmatic API](docs/api.md)
- [Browser Environment](docs/browser-env.md)
- [Bundle Formats](docs/formats.md)

## License

MIT
