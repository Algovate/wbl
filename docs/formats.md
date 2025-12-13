# Bundle Formats

WBL supports multiple webpack bundle formats from both Webpack 4 and Webpack 5.

## Supported Formats

| Format | Webpack | Detection Pattern |
|--------|---------|-------------------|
| Main Bundle | 4 | `}({` |
| Chunk | 4 | `(window.webpackJsonp` |
| IIFE | 5 | `(() => { /******/` |
| UMD | 5 | `webpackUniversalModuleDefinition` |

## Webpack 4 Main Bundle

Standard webpack 4 bundle with modules as a function argument:

```javascript
(function(modules) {
  // webpack bootstrap
  function __webpack_require__(moduleId) { ... }
})({
  "moduleId": function(module, exports, __webpack_require__) {
    // module code
  }
});
```

## Webpack 4 Chunk

Lazy-loaded chunks using `webpackJsonp`:

```javascript
(window.webpackJsonp = window.webpackJsonp || []).push([
  ["chunkId"],
  {
    "moduleId": function(module, exports, __webpack_require__) {
      // module code
    }
  }
]);
```

## Webpack 5 IIFE

Modern IIFE format:

```javascript
(() => {
  "use strict";
  var __webpack_modules__ = {
    "moduleId": (module, exports, __webpack_require__) => {
      // module code
    }
  };
  // webpack runtime
})();
```

## Webpack 5 UMD

Universal Module Definition for libraries:

```javascript
(function webpackUniversalModuleDefinition(root, factory) {
  if (typeof exports === 'object')
    module.exports = factory();
  else if (typeof define === 'function')
    define([], factory);
  else
    root["LibName"] = factory();
})(this, () => {
  // webpack bundle
});
```

## Loading Multiple Bundles

Load main bundle first, then chunks:

```javascript
const loader = new WebpackBundleLoader();
loader.loadBundle('app.main.js');     // Main bundle first
loader.loadBundle('app.chunk1.js');   // Then chunks
loader.loadBundle('app.chunk2.js');
```

## Check Bundle Format

```bash
wbl info -b bundle.js
```

Output:
```
Bundles:
  bundle.js
    Format: main (Webpack 4)
    Size: 2.5 MB
    Modules: 423
```

## Limitations

- Bundles must be valid JavaScript (not TypeScript source)
- Dynamic imports (`import()`) are not automatically resolved
- Some runtime features may require browser environment simulation
