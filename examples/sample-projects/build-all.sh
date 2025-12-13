#!/bin/bash
# Build all sample projects and copy bundles to the bundles directory

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BUNDLES_DIR="$SCRIPT_DIR/../bundles"

echo "📦 Building sample projects..."
echo ""

# Build utils-lib (TypeScript → Webpack 5 UMD)
echo "1. Building utils-lib..."
cd "$SCRIPT_DIR/utils-lib"
if [ ! -d "node_modules" ]; then
    echo "   Installing dependencies..."
    npm install --silent
fi
npm run build:dev --silent
cp dist/utils-lib.js "$BUNDLES_DIR/utils-lib.bundle.js"
echo "   ✅ utils-lib.bundle.js"

# Build class-app (ES6 Classes → Webpack 5)
echo "2. Building class-app..."
cd "$SCRIPT_DIR/class-app"
if [ ! -d "node_modules" ]; then
    echo "   Installing dependencies..."
    npm install --silent
fi
npm run build:dev --silent
cp dist/main.js "$BUNDLES_DIR/class-app.bundle.js"
echo "   ✅ class-app.bundle.js"

# Build sourcemap-demo (TypeScript with source maps)
echo "3. Building sourcemap-demo..."
cd "$SCRIPT_DIR/sourcemap-demo"
if [ ! -d "node_modules" ]; then
    echo "   Installing dependencies..."
    npm install --silent
fi
npm run build:dev --silent
cp dist/sourcemap-demo.js "$BUNDLES_DIR/sourcemap-demo.bundle.js"
# Copy with both names for compatibility
cp dist/sourcemap-demo.js.map "$BUNDLES_DIR/sourcemap-demo.bundle.js.map"
cp dist/sourcemap-demo.js.map "$BUNDLES_DIR/sourcemap-demo.js.map"
echo "   ✅ sourcemap-demo.bundle.js (with source map)"


echo ""
echo "📁 Bundles updated in: $BUNDLES_DIR"
echo ""
echo "✅ All sample projects built successfully!"
