# WBL Examples

## Demo Scripts

| Script | Description |
|--------|-------------|
| `demo.js` | Comprehensive demo: bundle loading, module usage, analysis |
| `webpack5-demo.js` | Webpack 5 bundle compatibility test |
| `nhsa-api-demo.js` | NHSA API demo with browser environment |
| `nhsa-api-simple.js` | NHSA API simple implementation |

## Run Examples

```bash
npm run build
node examples/demo.js
node examples/webpack5-demo.js
```

## Bundles Directory

```
bundles/
├── simple-math.bundle.js    # Webpack 4 main format
├── string-utils.chunk.js    # Webpack 4 chunk format
├── utils-lib.bundle.js      # Webpack 5 UMD
├── class-app.bundle.js      # Webpack 5 IIFE
└── nhsa/                    # NHSA production bundles
    ├── app.js
    └── ServiceSearchModule.js
```

## Sample Projects

Source code for Webpack 5 bundles:

| Project | Type | Output |
|---------|------|--------|
| `utils-lib` | TypeScript UMD library | Various utility functions |
| `class-app` | ES6 classes | EventEmitter, Store, Models |

Build sample projects:
```bash
# Using npm script (recommended)
npm run build:samples

# Or manually
cd examples/sample-projects/utils-lib
npm install && npm run build:dev
```
