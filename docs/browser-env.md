# Browser Environment

Some webpack bundles depend on browser globals (`window`, `document`, `localStorage`, etc.). WBL provides a browser environment simulation for Node.js.

## CLI Usage

```bash
# Enable browser environment in REPL
wbl repl bundle.js --browser

# With custom URL
wbl repl bundle.js --browser https://example.com/app/

# With referrer
wbl repl bundle.js --browser https://example.com/ --referrer https://google.com/

# Fix malformed regex (for bundles with encoding issues)
wbl repl bundle.js --browser --regexp-patch "badpattern:fixedpattern"
```

## Programmatic Usage

```javascript
import { WebpackBundleLoader, setupBrowserEnv } from 'wbl';

// Setup BEFORE loading bundles
setupBrowserEnv({
  url: 'https://example.com/app/',
  referrer: 'https://example.com/',
  storageQuota: 5 * 1024 * 1024
});

// Now load bundles
const loader = new WebpackBundleLoader();
loader.loadBundle('bundle.js');
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `url` | `string` | `https://example.com/` | Simulated page URL |
| `referrer` | `string` | - | Referrer URL |
| `regexpPatches` | `Record<string, string>` | - | Fix malformed regex patterns |
| `storageQuota` | `number` | `5MB` | localStorage/sessionStorage quota |

## What's Simulated

The browser environment provides:

- `window` / `globalThis`
- `document` (via jsdom)
- `navigator`
- `location`
- `localStorage` / `sessionStorage`
- `XMLHttpRequest` / `fetch`
- `setTimeout` / `setInterval`
- `console`

## Fixing Regex Issues

Some bundles contain malformed regular expressions due to encoding issues during minification. Use `regexpPatches` to fix them:

```javascript
setupBrowserEnv({
  url: 'https://example.com/',
  regexpPatches: {
    "invalidPattern": "validPattern"
  }
});
```

Or via CLI:
```bash
wbl repl bundle.js --regexp-patch "invalid:valid"
```

## Troubleshooting

### "window is not defined"

The module depends on browser globals. Enable browser environment:

```javascript
// Before loading bundles
setupBrowserEnv({ url: 'https://example.com/' });
```

### "Invalid regular expression"

Bundle contains encoding issues. Use regex patches:

```javascript
setupBrowserEnv({
  url: 'https://example.com/',
  regexpPatches: { "badPattern": "fixedPattern" }
});
```
