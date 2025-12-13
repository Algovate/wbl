# NHSA Bundle 分析示例

本目录包含 NHSA 网站的 webpack bundle 用于测试和研究。

## 使用方法

```bash
# 进入 REPL 模式
wbl repl app.js ServiceSearchModule.js --browser

# 或从项目根目录
wbl repl examples/bundles/nhsa/app.js --browser
```

## REPL 命令

```
list --category crypto    # 查找加密模块
search encrypt            # 搜索加密相关
inspect <id> --deep       # 深度分析模块
deps <id> --graph         # 依赖图
```

## 关键模块

通过分析发现的主要模块：

| 类型 | 说明 |
|------|------|
| 加密模块 | 包含 SM2/SM4 加密实现 |
| API 模块 | 封装网络请求方法 |
| 工具模块 | 通用工具函数 |

## 调用示例

参考 `nhsa-api-demo.js` 和 `nhsa-api-simple.js` 了解如何调用模块。

> **注意**: 需要启用浏览器环境模拟 (`setupBrowserEnv`) 才能正确加载依赖 DOM 的模块。
