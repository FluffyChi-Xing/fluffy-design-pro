---
title: Fluffy Design Pro
description: 用于生成 Vue 3 中后台应用的 CLI 与轻量前端基础层模板。
layout: home

hero:
  name: Fluffy Design Pro
  text: 生成开箱即用的 Vue 3 中后台应用
  tagline: 一条命令获得应用壳、路由、主题、国际化、组件与测试基础，而不是空白页面。
  image:
    src: /logo.webp
    alt: Fluffy Design Pro 品牌标识
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: 查看 GitHub
      link: https://github.com/FluffyChi-Xing/fluffy-design-pro

features:
  - title: 可运行的应用壳
    details: 生成导航栏、侧边栏、标签页、命令面板和设置面板，快速建立中后台的稳定骨架。
  - title: 轻量 f- 组件基础
    details: 提供表单、表格、图表、反馈、上传等可组合能力，不强制绑定完整 UI 框架运行时。
  - title: 主题与国际化
    details: 使用 CSS 语义 token，内置 zh-CN 与 en-US、light/dark 主题及 reduced-motion 支持。
  - title: 安全的项目演进
    details: 支持 Vue 3 + Vite 项目的认领、受管文件迁移和可控回滚，避免静默覆盖业务代码。
  - title: 可选生态集成
    details: 可按需生成 Fluffy OSS 与 Log Trace 接入；未选择时不会进入依赖图或运行时代码。
  - title: 部署配置生成
    details: 可生成 Vercel、Cloudflare Pages / Workers 或无部署平台的本地配置，不会自动登录或发布。
---

<div class="vp-doc" markdown="1">

## 从一条命令开始

```bash
npx create-fluffy-design-pro@latest my-admin
```

Fluffy Design Pro 面向管理后台、运营后台和内部工具。CLI 生成的是带有应用壳、路由组织、页面示例和基础质量设施的 Vue 3 工程，让业务开发从页面组合开始，而不是从重复搭建基础结构开始。

[查看完整使用指南](/guide/usage)

## 当前能力

- **应用体验**：导航、设置、通知、全屏、主题、语言与标签页等常见后台能力已经接入应用壳。
- **开发基础**：`f-` 前缀 UI 组件与 `useForm`、`useTable`、`useChart`、`useLoading`、`useToast` 等组合式逻辑可直接使用。
- **可维护性**：生成项目包含 CSS token、Vitest 基础和 `.fluffy/manifest.json` 受管文件清单。
- **按需选择**：部署 provider 与 Fluffy SDK 集成只在选择后生成，避免将未使用能力带入项目。

::: tip 以仓库现状为准
本文档描述已发布 CLI 的当前行为。创建、接管和迁移命令都优先保证文件边界清晰，不会替你上传项目、自动部署或写入账号 token。
:::

## 未来方向

独立发布、可由 CLI 安装的前端模板插件处于规划阶段。当前没有插件 registry、包名或安装命令；请阅读[模板插件路线图](/roadmap/template-plugins)了解明确边界。

</div>
