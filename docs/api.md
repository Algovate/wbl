# Programmatic API

## Basic Usage

```javascript
import { WebpackBundleLoader, ModuleAnalyzer, setupBrowserEnv } from 'wbl';

// Optional: enable browser environment for DOM-dependent bundles
setupBrowserEnv({ url: 'https://example.com/' });

// Load bundles (sync)
const loader = new WebpackBundleLoader();
loader.loadBundleSync('path/to/bundle.js');
loader.loadBundleSync('path/to/chunk.js');

// Or load with source map (async)
await loader.loadBundle('path/to/bundle.js', { loadSourceMap: true });

console.log(`Loaded ${loader.totalModules} modules`);

// Analyze modules
const analyzer = new ModuleAnalyzer(loader);
```

---

## WebpackBundleLoader

### Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `loadBundleSync(path)` | `number` | Load bundle synchronously, returns module count |
| `loadBundle(path, options?)` | `Promise<number>` | Load bundle async with optional source map |
| `require(id)` | `any` | Get module exports |
| `getModuleIds()` | `string[]` | All module IDs |
| `getModuleSource(id)` | `string` | Module source code |
| `getModuleExports(id)` | `any` | Module exports object |
| `getOriginalSource(id)` | `string \| null` | Original source from source map |
| `getSourceMapResolver(name)` | `SourceMapResolver \| null` | Get resolver for bundle |
| `hasModule(id)` | `boolean` | Check if module exists |

### LoadBundleOptions

```typescript
interface LoadBundleOptions {
  loadSourceMap?: boolean;  // Auto-load source map if available
}
```

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `totalModules` | `number` | Total loaded modules |

### Example

```javascript
const loader = new WebpackBundleLoader();

// Sync loading
loader.loadBundleSync('app.js');

// Async with source map
await loader.loadBundle('bundle.js', { loadSourceMap: true });

// Get exports
const crypto = loader.require('7d92');
const result = crypto.a({ data: 'test' });

// Get source (minified)
const source = loader.getModuleSource('7d92');

// Get original source (if source map loaded)
const original = loader.getOriginalSource('./src/crypto.ts');
```

---

## ModuleAnalyzer

### Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `listModules()` | `ModuleInfo[]` | List all modules with preview |
| `analyzeExports(id)` | `ExportAnalysis` | Analyze module exports |
| `analyzeSource(id)` | `SourceAnalysis` | Deep source analysis |
| `analyzeDependencies(id)` | `DependencyAnalysis` | Get module dependencies |
| `findDependents(id)` | `DependentsAnalysis` | Find modules that depend on this |
| `searchModules(pattern)` | `SearchMatch[]` | Search by pattern |
| `callMethod(id, method, args)` | `any` | Call a module method |

### SourceAnalysis

```typescript
interface SourceAnalysis {
  moduleId: string;
  apiEndpoints: string[];    // API paths found
  httpMethods: string[];     // GET, POST, etc.
  strings: string[];         // Meaningful strings
  category: string[];        // crypto, api, http, component...
  functionNames: string[];   // Function names found
  dependencies: string[];    // Module dependencies
  sourceLength: number;
}
```

### Example

```javascript
const analyzer = new ModuleAnalyzer(loader);

// List crypto modules
const modules = analyzer.listModules();
for (const mod of modules) {
  const analysis = analyzer.analyzeSource(mod.id);
  if (analysis.category.includes('crypto')) {
    console.log(mod.id, analysis.functionNames);
  }
}

// Find API endpoints
const apiModule = analyzer.analyzeSource('365c');
console.log(apiModule.apiEndpoints);
// ['/api/user/query', '/api/data/fetch', ...]
```

---

## SourceMapResolver

Load source maps to view original source code.

```javascript
import { SourceMapResolver } from 'wbl';

const resolver = new SourceMapResolver();

// Load from file
await resolver.loadFromFile('bundle.js.map');

// Or auto-detect from bundle
await resolver.loadFromBundle('bundle.js');

// Get original sources
const sources = resolver.getSources();
// ['webpack://MyApp/./src/index.ts', ...]

// Get source content
const content = resolver.getSourceContent(sources[0]);

// Map position
const result = await resolver.mapPosition(10, 5);
console.log(result.sourcePath, result.originalPosition);

// Cleanup
resolver.destroy();
```

---

## Extractors

Standalone utilities for source code analysis:

```javascript
import {
  extractApiEndpoints,
  extractHttpMethods,
  extractMeaningfulStrings,
  categorizeModule,
  extractFunctionNames,
} from 'wbl';

const source = loader.getModuleSource('someModule');

// Find API endpoints
const endpoints = extractApiEndpoints(source);
// ['/api/user/query', '/nthl/api/data']

// Detect HTTP methods
const methods = extractHttpMethods(source);
// ['GET', 'POST']

// Categorize module
const categories = categorizeModule(source);
// ['crypto', 'http', 'api']

// Extract function names
const functions = extractFunctionNames(source);
// ['queryUser', 'fetchData', 'encrypt']
```

---

## setupBrowserEnv

Enable browser environment simulation for bundles that depend on `window`, `document`, etc.

```javascript
import { setupBrowserEnv } from 'wbl';

setupBrowserEnv({
  url: 'https://example.com/app/',
  referrer: 'https://example.com/',
  regexpPatches: {
    "['鈥橾": "\\['鈥橾"  // Fix encoding issues
  },
  storageQuota: 5 * 1024 * 1024
});
```

### Options

| Option | Type | Description |
|--------|------|-------------|
| `url` | `string` | Page URL to simulate |
| `referrer` | `string` | Referrer URL |
| `regexpPatches` | `Record<string, string>` | Fix malformed regex patterns |
| `storageQuota` | `number` | localStorage quota in bytes |

> **Note:** Call `setupBrowserEnv()` **before** loading bundles.
