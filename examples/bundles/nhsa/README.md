# NHSA API 发现指南

本文档帮助新人快速理解如何从 NHSA 网站的 webpack bundle 中发现和调用 API。

## 快速开始

### 1. 加载 Bundle 并探索

```bash
# 进入 REPL 模式探索模块
wbl repl bundles/nhsa/app.js bundles/nhsa/ServiceSearchModule.js
```

REPL 命令：
```
list                  # 列出所有模块
search <pattern>      # 搜索模块
inspect <id>          # 查看模块导出
require <id>          # 加载模块
```

### 2. 关键模块

| 模块 ID | 功能 | 关键导出 |
|---------|------|----------|
| `7d92` | 加密/解密 | `a()` 加密请求, `b()` 解密响应 |
| `365c` | API 方法集 | `k.queryServiceFacilities()` 等 |

### 3. 两种调用方式

#### 方式一：高级调用

使用 `365c` 模块直接调用 API（需要浏览器环境模拟）：

```javascript
import { WebpackBundleLoader, setupBrowserEnv } from 'wbl';

setupBrowserEnv({ url: 'https://fuwu.nhsa.gov.cn/nationalHallSt/' });
const loader = new WebpackBundleLoader();
loader.loadBundle('examples/bundles/nhsa/app.js');
loader.loadBundle('examples/bundles/nhsa/ServiceSearchModule.js');

const apiModule = loader.require('365c');
const result = await apiModule.k.queryServiceFacilities({ pageNum: 1, pageSize: 5 });
```

👉 完整示例: [nhsa-api-demo.js](./nhsa-api-demo.js)

#### 方式二：底层调用

使用 `7d92` 加密模块 + 自定义 HTTP 请求（更轻量）：

```javascript
import { WebpackBundleLoader } from 'wbl';
const loader = new WebpackBundleLoader();
loader.loadBundle('examples/bundles/nhsa/app.js');
loader.loadBundle('examples/bundles/nhsa/ServiceSearchModule.js');

const encryptModule = loader.require('7d92');
const encrypted = encryptModule.a({ url: ENDPOINT, method: 'POST', data: {} });
// encrypted.headers 和 encrypted.data 用于发送请求
```

👉 完整示例: [nhsa-api-simple.js](./nhsa-api-simple.js)

## 发现过程

```
网站分析 → 下载 Bundle → WBL 探索 → 找到关键模块 → 选择调用方式
```

1. **网站分析**: 打开 DevTools Network 标签，观察 API 请求
2. **下载 Bundle**: 保存 `app.*.js` 和 `ServiceSearchModule.*.js`
3. **WBL 探索**: 使用 `wbl search` 和 `wbl inspect` 分析模块
4. **找到关键模块**: `7d92` (加密) 和 `365c` (API)
5. **选择调用方式**: 根据需求选择高级或底层方式

## 运行示例

```bash
npm run build
node examples/nhsa-api-simple.js    # 底层方式
node examples/nhsa-api-demo.js      # 高级方式
```
