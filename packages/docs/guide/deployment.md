---
title: 部署选项
description: 为生成的 Vue 3 工程选择 Vercel、Cloudflare 或无 provider 配置。
---

# 部署选项

CLI 负责生成本地部署配置，不负责登录、上传或发布。不会写入账号、token 或 secret。

## Vercel

Vercel 是默认 provider：

```bash
npx @fluffy-design-pro/cli@latest my-admin --provider vercel
```

命令会生成适合静态 SPA 的 `vercel.json`。

## Cloudflare Pages

选择 Cloudflare Pages：

```bash
npx @fluffy-design-pro/cli@latest my-admin \
  --provider cloudflare \
  --cloudflare-target pages
```

Pages 目标会生成 `wrangler.jsonc` 与 SPA fallback 所需的静态配置。

## Cloudflare Workers

选择 Workers 静态资源目标：

```bash
npx @fluffy-design-pro/cli@latest my-admin \
  --provider cloudflare \
  --cloudflare-target workers
```

Workers 目标与 Pages 使用不同的资源配置，CLI 只生成你选择的那一套。

## 不生成部署配置

如果部署配置由团队自己维护，可以选择 `none`：

```bash
npx @fluffy-design-pro/cli@latest my-admin --provider none
```

该选择不会生成 provider 根配置文件。

::: tip 配置生成不是部署
选择 provider 不会调用云平台 API，也不会自动创建项目或发布站点。生成完成后，请按照对应平台的官方流程完成登录、构建和部署。
:::
