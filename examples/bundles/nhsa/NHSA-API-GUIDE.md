# NHSA API 逆向工程指南

本文档说明如何从 NHSA 网站（国家医疗保障局公共服务平台）的 webpack 打包文件中发现和调用 API 方法。

## 目录

1. [概述](#概述)
2. [准备工作](#准备工作)
3. [步骤一：分析网站结构](#步骤一分析网站结构)
4. [步骤二：下载 Bundle 文件](#步骤二下载-bundle-文件)
5. [步骤三：使用 WBL 工具分析模块](#步骤三使用-wbl-工具分析模块)
6. [步骤四：发现 API 调用方法](#步骤四发现-api-调用方法)
7. [两种调用方式对比](#两种调用方式对比)

---

## 概述

NHSA 网站使用 Vue.js + Webpack 构建，所有的 API 调用逻辑都被打包在 JavaScript bundle 文件中。我们的目标是：

1. 从网站下载并分析 webpack bundle
2. 找到加密/解密模块和 API 调用模块
3. 在 Node.js 环境中复用这些模块调用 API

---

## 准备工作

### 所需工具

```bash
# 安装 WBL 工具
npm install wbl
```

### 文件结构

```
examples/
├── bundles/
│   └── nhsa/
│       ├── app.js                  # 主 bundle (~2.3MB)
│       └── ServiceSearchModule.js  # 服务搜索模块 (~2.6MB)
├── nhsa-api-demo.js     # 高级 API 调用方式
└── nhsa-api-simple.js   # 简单（底层）调用方式
```

---

## 步骤一：分析网站结构

### 1.1 打开网站开发者工具

访问 [NHSA 医疗服务项目搜索](https://fuwu.nhsa.gov.cn/nationalHallSt/#/search/medical-service)，打开 Chrome DevTools：

1. 按 `F12` 或 `Cmd+Option+I` (Mac)
2. 切换到 **Network** 标签页
3. 勾选 **Preserve log** 保留日志
4. 刷新页面

### 1.2 识别关键 Bundle 文件

在 Network 标签页中，过滤 `.js` 文件，会看到：

| 文件名 | 描述 |
|--------|------|
| `app.*.js` | 主应用 bundle，包含核心逻辑和加密模块 |
| `ServiceSearchModule.*.js` | 医疗服务搜索相关 API |

### 1.3 观察 API 请求

在 Network 中过滤 **XHR/Fetch** 请求，观察 API 调用：

```
POST /ebus/fuwu/api/nthl/api/CommQuery/queryServiceFacilities
POST /ebus/fuwu/api/nthl/api/medical/service/page
```

注意请求头中的特殊字段：
- `x-tif-signature` - 签名
- `x-tif-timestamp` - 时间戳
- `x-tif-nonce` - 随机数

---

## 步骤二：下载 Bundle 文件

### 2.1 手动下载

从浏览器的 Sources 面板或 Network 面板保存文件：

```bash
# 创建目录
mkdir -p examples/bundles/nhsa

# 下载文件（URL 会包含版本号）
curl -o examples/bundles/nhsa/app.js \
  "https://fuwu.nhsa.gov.cn/nationalHallSt/app.*.js"

curl -o examples/bundles/nhsa/ServiceSearchModule.js \
  "https://fuwu.nhsa.gov.cn/nationalHallSt/ServiceSearchModule.*.js"
```

### 2.2 验证文件

```bash
ls -la examples/bundles/nhsa/
# 预期看到两个约 2-3MB 的文件
```

---

## 步骤三：使用 WBL 工具分析模块

### 3.1 查看 Bundle 信息

```bash
# 列出所有模块
wbl list -b examples/bundles/nhsa/app.js

# 搜索加密相关模块
wbl search "encrypt" -b examples/bundles/nhsa/app.js
wbl search "SM4" -b examples/bundles/nhsa/app.js
wbl search "SM2" -b examples/bundles/nhsa/app.js
```

### 3.2 进入 REPL 交互模式

这是发现 API 最有效的方式：

```bash
wbl repl examples/bundles/nhsa/app.js examples/bundles/nhsa/ServiceSearchModule.js
```

在 REPL 中探索：

```javascript
// 列出所有模块 ID
list

// 搜索包含 "query" 的模块
search query

// 检查特定模块的导出
inspect 365c  // API 模块
inspect 7d92  // 加密模块
```

### 3.3 关键模块说明

经过分析，发现以下关键模块：

| 模块 ID | 功能 | 关键导出 |
|---------|------|----------|
| `7d92` | 加密模块 | `a()` - 加密请求, `b()` - 解密响应 |
| `365c` | API 模块 | `k.queryServiceFacilities()` 等 API 方法 |

---

## 步骤四：发现 API 调用方法

### 4.1 检查加密模块 (7d92)

```javascript
// 在 REPL 中
const encryptModule = require('7d92')

// 查看导出的方法
Object.keys(encryptModule)
// 输出: ['a', 'b', 'c', ...]

// a - 加密请求配置
// b - 解密响应数据
```

### 4.2 检查 API 模块 (365c)

```javascript
const apiModule = require('365c')

// 查看导出结构
Object.keys(apiModule)
// 输出: ['a', 'b', ..., 'k']

// k 包含所有 API 方法
Object.keys(apiModule.k)
// 输出: ['queryServiceFacilities', 'queryMedicalService', ...]
```

### 4.3 理解 API 方法签名

查看源码中的函数定义：

```javascript
// queryServiceFacilities 的实现
function(e) {
    return f.a.post("/nthl/api/CommQuery/queryServiceFacilities", e)
}
```

参数 `e` 是请求体对象：

```javascript
{
    pageNum: 1,
    pageSize: 10,
    fixedInHos: '',
    areaCode: '',
    svcFaciName: ''
}
```

---

## 两种调用方式对比

### 方式一：高级调用 (nhsa-api-demo.js)

**特点**：直接调用 bundle 中的原始 API 方法

```javascript
import { WebpackBundleLoader, setupBrowserEnv } from 'wbl';

// 1. 设置浏览器环境（必须！因为 bundle 依赖 DOM）
setupBrowserEnv({
    url: 'https://fuwu.nhsa.gov.cn/nationalHallSt/',
    referrer: 'https://fuwu.nhsa.gov.cn/',
    regexpPatches: { "['鈥橾": "\\['鈥橾" }  // 修复编码问题
});

// 2. 加载 bundles
const loader = new WebpackBundleLoader();
loader.loadBundle('examples/bundles/nhsa/app.js');
loader.loadBundle('examples/bundles/nhsa/ServiceSearchModule.js');

// 3. 获取 API 模块并调用
const apiModule = loader.require('365c');
const result = await apiModule.k.queryServiceFacilities({
    pageNum: 1,
    pageSize: 5
});
```

**优点**：
- ✅ 代码简洁，直接调用
- ✅ 自动处理加密/解密
- ✅ 无需理解底层实现

**缺点**：
- ❌ 需要设置完整浏览器环境
- ❌ Bundle 代码可能有兼容性问题

---

### 方式二：底层调用 (nhsa-api-simple.js)

**特点**：只使用加密模块，自己构造 HTTP 请求

```javascript
import https from 'https';
import { WebpackBundleLoader } from 'wbl';

// 1. 加载 bundles
const loader = new WebpackBundleLoader();
loader.loadBundle('examples/bundles/nhsa/app.js');
loader.loadBundle('examples/bundles/nhsa/ServiceSearchModule.js');

// 2. 获取加密模块
const encryptModule = loader.require('7d92');

// 3. 准备请求数据
const data = { pageNum: 1, pageSize: 10 };

// 4. 加密请求
const encrypted = encryptModule.a({
    url: '/nthl/api/CommQuery/queryServiceFacilities',
    method: 'POST',
    headers: {},
    data: data
});
// encrypted.headers 包含必要的签名头
// encrypted.data 是加密后的请求体

// 5. 发送 HTTP 请求
const response = await fetch(BASE_URL + ENDPOINT, {
    method: 'POST',
    headers: {
        ...encrypted.headers,
        'Content-Type': 'application/json'
    },
    body: encrypted.data
});

// 6. 解密响应
const json = await response.json();
const decrypted = encryptModule.b('SM4', json);
```

**优点**：
- ✅ 更轻量，不需要完整浏览器环境
- ✅ 更容易调试和理解
- ✅ 灵活控制请求细节

**缺点**：
- ❌ 需要手动处理 HTTP 请求
- ❌ 需要理解加密/解密参数

---

## 快速参考

### 模块 ID 速查表

| 模块 | 用途 | 关键方法 |
|------|------|----------|
| `7d92` | 加密/解密 | `a(config)`, `b(type, response)` |
| `365c` | API 集合 | `k.queryServiceFacilities(params)` |

### 常用 API 端点

| 端点 | 描述 |
|------|------|
| `/nthl/api/CommQuery/queryServiceFacilities` | 查询医疗服务设施 |
| `/nthl/api/medical/service/page` | 医疗服务分页查询 |
| `/nthl/api/medical/service/query` | 医疗服务详情查询 |

### 运行示例

```bash
# 构建 WBL
npm run build

# 运行简单示例
node examples/nhsa-api-simple.js

# 运行高级示例
node examples/nhsa-api-demo.js
```

---

## 总结

新人发现 API 调用方法的流程：

```
┌─────────────────┐
│  访问 NHSA 网站  │
└────────┬────────┘
         ▼
┌─────────────────┐
│  打开 DevTools   │
└────────┬────────┘
         ▼
┌─────────────────┐
│ 分析 Network 请求│
└────────┬────────┘
         ▼
┌─────────────────┐
│ 下载 Bundle 文件 │
└────────┬────────┘
         ▼
┌─────────────────┐
│ 使用 WBL 分析    │
└────────┬────────┘
         ▼
    ┌────┴────┐
    ▼         ▼
┌───────┐ ┌───────┐
│高级方式│ │底层方式│
└───┬───┘ └───┬───┘
    ▼         ▼
┌───────────────────┐ ┌───────────────────┐
│ nhsa-api-demo.js  │ │ nhsa-api-simple.js│
└───────────────────┘ └───────────────────┘
```

**关键点**：
1. 使用 `wbl search` 和 `wbl inspect` 快速定位关键模块
2. 模块 `7d92` 是加密核心，`365c` 是 API 入口
3. 根据需求选择适合的调用方式
