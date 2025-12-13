# Examples

## Demo Scripts

| Script | Description |
|--------|-------------|
| `demo.js` | Basic bundle loading and module analysis |
| `webpack5-demo.js` | Webpack 5 format compatibility test |

## Run Examples

```bash
npm run build
node examples/demo.js
node examples/webpack5-demo.js
```

## Sample Bundles

Test bundles for development:

```
bundles/
├── simple-math.bundle.js    # Webpack 4 main format
├── string-utils.chunk.js    # Webpack 4 chunk format
├── utils-lib.bundle.js      # Webpack 5 UMD
└── class-app.bundle.js      # Webpack 5 IIFE
```

## Build Sample Projects

Source code for sample bundles is in `sample-projects/`:

```bash
npm run build:samples
```

This builds all sample projects and copies bundles to `bundles/`.
