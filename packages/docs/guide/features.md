---
title: 功能概览
description: 了解生成项目中的应用壳、组件基础、组合式逻辑、主题与国际化能力。
---

# 功能概览

生成项目包含一套面向中后台的轻量基础层。它不要求引入完整 UI 框架运行时，能力按模块组织，并通过 `f-` 前缀保持边界清晰。

## 应用壳

- 顶部导航与侧边栏
- 可折叠、可分组导航
- 标签页与历史访问
- 命令面板
- 设置面板
- 通知中心
- 全屏切换
- light / dark 主题
- zh-CN / en-US 语言切换

## UI 组件

当前组件覆盖后台项目最常见的交互。查看每个组件的分组说明与交互示例：[组件预览](/guide/components)。

- `FButton`、`FInput`、`FSelect`、`FCheckbox`、`FTextarea`
- `FFormItem`、`FPanel`、`FResult`
- `FDropdown`、`FPopover`、`FSheet`
- `FTabs`、`FProgress`、`FSkeleton`、`FSpinner`
- `FToastHost`、`FCode`、`FMarkdown`
- `FUpload`、`FUploadProgress`（选择 Fluffy OSS 后生成）

组件优先保持可组合、可测试和低运行时耦合。上传、代码块与 markdown 预览可以在不接入 Fluffy SDK 时使用；上传组件在未配置 SDK 时支持本地模拟上传。

## 组合式逻辑

生成项目提供可复用的后台场景逻辑，完整 API 请查看[组合式函数](/guide/composables)：

```ts
const { loading, withLoading } = useLoading()
const { rows, loading: tableLoading, reload } = useTable(fetchUsers)
const form = useForm(initialValues, rules)
const chart = useChart(chartElement)
```

常用能力包括：

- `useForm`：字段状态、校验与提交状态
- `useTable`：本地或请求模式的数据表格状态
- `useChart`：ECharts 生命周期管理
- `useLoading`：并发任务 loading 管理
- `useToast`：轻量反馈

## 主题与国际化

主题使用 CSS 语义 token，支持运行时切换品牌色与 dark 模式。生成配置中的 `themeColor` 会写入 `src/styles/tokens.css`；未使用该配置时，默认使用 indigo 系列。

国际化默认生成 `zh-CN` 与 `en-US`，使用 Vue I18n。语言切换位于应用设置中，业务页面可以继续扩展对应 locale 文件。

## 质量基础

生成项目包含：

- TypeScript
- Vitest + Vue Test Utils + happy-dom
- 组件与 composables 单测基础
- `.fluffy/manifest.json` 受管文件清单

CLI 仓库本身可以运行：

```bash
pnpm check
pnpm test
pnpm build
```

生成项目的具体脚本以生成后的 `package.json` 为准。
