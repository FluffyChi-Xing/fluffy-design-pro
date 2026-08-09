---
title: 生成项目结构
description: 了解 Fluffy Design Pro 生成工程的典型目录与可选文件。
---

# 生成项目结构

以下是生成项目的典型结构。实际文件会随 Fluffy SDK 与部署 provider 的选择变化。

```text
my-admin/
├── src/
│   ├── components/          # f- UI、布局、导航、通知、设置与上传组件
│   ├── composables/         # useForm、useTable、useChart、useLoading、useToast
│   ├── integrations/        # 选择 SDK 后生成 OSS / Log Trace 集成
│   ├── layouts/             # DefaultLayout 与设置面板
│   ├── locales/             # zh-CN / en-US 文案
│   ├── pages/               # 应用页面与 showcase 页面
│   ├── router/              # 模块化路由注册表
│   ├── stores/              # Pinia app / tabs / upload 状态
│   ├── styles/              # CSS 语义 token 与全局样式
│   └── test/                # Vitest 测试基础
├── .fluffy/manifest.json    # 生成文件清单与迁移基线
├── .env.example             # 选择集成后包含对应环境变量示例
├── vercel.json              # provider=vercel 时生成
├── wrangler.jsonc           # provider=cloudflare 时生成
└── package.json
```

## manifest 的作用

`.fluffy/manifest.json` 记录 CLI 版本、模板版本、生成选择和文件清单。`adopt` 使用它建立现有项目的认领边界，`migrate` 使用文件 owner 与 hash 判断哪些内容可以安全更新。

## 可选文件

- 未选择 Fluffy OSS 或 Log Trace 时，不生成对应 `src/integrations/` 内容。
- 选择 `--provider none` 时，不生成 Vercel 或 Cloudflare provider 文件。
- 选择 Fluffy OSS 时，额外生成上传组件、上传任务中心及其状态管理。
