---
title: Fluffy 生态集成
description: 按需接入 Fluffy OSS 与 Fluffy Log Trace Browser SDK。
---

# Fluffy 生态集成

Fluffy OSS 与 Fluffy Log Trace Browser SDK 都是可选集成。未选择时，生成项目不会添加对应的依赖、初始化模块、环境变量示例或开发代理。

## Fluffy OSS

启用上传 SDK 与上传任务中心。组件的交互边界可参考[上传组件预览](/guide/components#可选上传)：

```bash
npx @fluffy-design-pro/cli@latest my-admin --fluffy-oss
```

也可以直接提供接入地址或开发代理目标；这些参数会隐含启用 OSS 集成：

```bash
npx @fluffy-design-pro/cli@latest my-admin \
  --fluffy-oss-url https://oss.example.com/api \
  --fluffy-oss-proxy http://localhost:8787
```

生成后，项目包含 OSS 集成模块、类型化环境变量读取和基于 `f-popover` 的上传任务监控中心。SDK 配置齐备时走真实上传；未配置时，`FUpload` 会使用本地模拟上传，便于先预览界面。

## Fluffy Log Trace Browser SDK

```bash
npx @fluffy-design-pro/cli@latest my-admin --fluffy-log
```

设置接入地址或开发代理：

```bash
npx @fluffy-design-pro/cli@latest my-admin \
  --fluffy-log-url https://log.example.com/api \
  --fluffy-log-proxy http://localhost:8788
```

入口会在应用启动时根据配置初始化。具体服务端地址、appId 与 credential 请由部署环境提供，不要将 secret 提交到仓库。

## 配置原则

- 公开地址可以写入 `.env.example`，secret 放入本地或部署平台的 secret 管理。
- 使用路径前缀作为接入地址时，开发环境代理会根据对应的 `VITE_FLUFFY_*_PROXY_TARGET` 转发。
- 集成选项只影响生成结果，不会让 CLI 上传项目或自动调用云端部署服务。
