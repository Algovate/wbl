# CLI Reference

## Global Options

```bash
wbl [--json] <command> [options]
```

| Option | Description |
|--------|-------------|
| `--json` | Output as JSON for script integration |
| `-V, --version` | Show version |
| `-h, --help` | Show help |

---

## list

List all modules in loaded bundles.

```bash
wbl list -b <bundles...> [--category <cat>]
```

| Option | Description |
|--------|-------------|
| `-b, --bundles` | Bundle files to load (required) |
| `-c, --category` | Filter by category: `crypto`, `api`, `http`, `component`, `router`, `store` |

**Examples:**
```bash
wbl list -b app.js
wbl list -b app.js --category crypto
wbl --json list -b app.js --category api
```

---

## search

Search modules by pattern in source code or API endpoints.

```bash
wbl search <pattern> -b <bundles...> [--api]
```

| Option | Description |
|--------|-------------|
| `-b, --bundles` | Bundle files to load (required) |
| `--api` | Search only in API endpoint paths |

**Examples:**
```bash
wbl search encrypt -b app.js
wbl search queryUser --api -b app.js
```

---

## inspect

Inspect module exports and metadata.

```bash
wbl inspect <moduleId> -b <bundles...> [--deep] [--verbose]
```

| Option | Description |
|--------|-------------|
| `-b, --bundles` | Bundle files to load (required) |
| `-d, --deep` | Deep source analysis (APIs, functions, categories) |
| `-v, --verbose` | Show full function source code |

**Examples:**
```bash
wbl inspect 7d92 -b app.js
wbl inspect 365c --deep -b app.js
wbl --json inspect 365c --deep -b app.js
```

---

## deps

Show module dependencies and dependents.

```bash
wbl deps <moduleId> -b <bundles...> [--graph] [--depth <n>]
```

| Option | Description |
|--------|-------------|
| `-b, --bundles` | Bundle files to load (required) |
| `-g, --graph` | Output Mermaid dependency diagram |
| `--depth <n>` | Max traversal depth for graph (default: 2) |

**Examples:**
```bash
wbl deps 7d92 -b app.js
wbl deps 365c --graph -b app.js
wbl deps 365c --graph --depth 3 -b app.js
```

---

## source

Show module source code without executing.

```bash
wbl source <moduleId> -b <bundles...> [--grep <pattern>]
```

| Option | Description |
|--------|-------------|
| `-b, --bundles` | Bundle files to load (required) |
| `-g, --grep` | Filter source lines by pattern |

**Examples:**
```bash
wbl source 7d92 -b app.js
wbl source 365c --grep queryUser -b app.js
```

---

## call

Call a module method.

```bash
wbl call <moduleId.method> -b <bundles...> [args...]
```

**Examples:**
```bash
wbl call 7d92.a '{"data":"test"}' -b app.js
```

---

## info

Show bundle information (format, size, module count).

```bash
wbl info -b <bundles...>
```

---

## repl

Interactive REPL mode for exploring bundles.

```bash
wbl repl <bundles...> [--browser [url]] [--referrer <url>] [--regexp-patch <from:to>]
```

| Option | Description |
|--------|-------------|
| `--browser [url]` | Enable browser environment simulation |
| `--referrer <url>` | Set referrer URL |
| `--regexp-patch <from:to>` | Fix malformed regex in bundles |

**REPL Commands:**
```
list [--category <cat>]     List modules
search <pattern> [--api]    Search modules
inspect <id> [--deep]       Inspect exports
deps <id> [--graph]         Show dependencies
call <id.method> [args]     Call method
require <id>                Load and return module
info                        Bundle info
help                        Show help
exit                        Exit REPL
```
