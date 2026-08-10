---
title: 快速开始
description: 使用 create-fluffy-design-pro 创建 Vue 3 中后台项目。
---

# 快速开始

Fluffy Design Pro 使用 CLI 创建带应用壳与基础能力的 Vue 3 中后台工程。

## 环境要求

- Node.js `>=20.19.0`
- 可使用 `pnpm`、`npm` 或 `yarn` 管理生成项目的依赖

## 创建项目

```bash
npx @fluffy-design-pro/cli@latest my-admin
```

命令会进入交互式向导，收集包管理器、部署 provider、主题色、语言、暗色模式和可选集成等选择。

完成后进入目标目录并安装、启动依赖：

```bash
cd my-admin
pnpm install
pnpm dev
```

如果选择了其他包管理器，请使用对应的安装与开发命令。

## 默认配置

| 选项 | 默认值 |
| --- | --- |
| 包管理器 | `pnpm` |
| 部署 provider | `vercel` |
| Cloudflare 目标 | `pages` |
| 主题色 | `#4f46e5` |
| 默认语言 | `zh-CN` |
| 暗色模式 | 已启用 |

## 先预览，再写入

使用 `--dry-run` 查看 CLI 将生成的文件而不写入磁盘：

```bash
npx @fluffy-design-pro/cli@latest my-admin --dry-run
```

目标目录非空时，CLI 默认拒绝覆盖。请先确认目录内容，或选择新的项目目录。

## 下一步

- [了解创建、接管与迁移命令](/guide/usage)
- [查看全部 CLI 选项](/reference/cli-options)
- [了解生成项目的典型结构](/reference/project-structure)
