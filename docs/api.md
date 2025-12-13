# Programmatic API

## Basic Usage

```javascript
import { WebpackBundleLoader, ModuleAnalyzer, setupBrowserEnv } from 'wbl';

// Optional: enable browser environment for DOM-dependent bundles
setupBrowserEnv({ url: 'https://example.com/' });

// Load bundles
const loader = new WebpackBundleLoader();
loader.loadBundle('path/to/bundle.js');
loader.loadBundle('path/to/chunk.js');

console.log(`Loaded ${loader.totalModules} modules`);

// Analyze modules
const analyzer = new ModuleAnalyzer(loader);
```

---

## WebpackBundleLoader

### Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `loadBundle(path)` | `number` | Load bundle, returns module count |
| `require(id)` | `any` | Get module exports |
| `getModuleIds()` | `string[]` | All module IDs |
| `getModuleSource(id)` | `string` | Module source code |
| `getModuleExports(id)` | `any` | Module exports object |
| `hasModule(id)` | `boolean` | Check if module exists |

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `totalModules` | `number` | Total loaded modules |

### Example

```javascript
const loader = new WebpackBundleLoader();
loader.loadBundle('app.js');

// Get exports
const crypto = loader.require('7d92');
const result = crypto.a({ data: 'test' });

// Get source
const source = loader.getModuleSource('7d92');
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
