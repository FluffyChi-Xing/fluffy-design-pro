# Changelog

本文件记录 Fluffy Design Pro 各版本的变更。格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，版本遵循 [Semantic Versioning](https://semver.org/lang/zh-CN/)。

## [0.1.1] - 2026-08-08

### Added

- CLI 包根目录新增 `README.md`，供 npm 包页面展示（安装、用法、选项、生成结构、文档链接）。

### Fixed

- 无（README 仅为 npm 包页面补齐）。

### Changed

- 无

### Security

- 无

## [0.1.0] - 2026-08-08

首次发布。`@fluffy-design-pro/cli` 提供 `create-fluffy-design-pro` 命令，可生成一个开箱即跑、带完整中后台能力的 Vue 3 控制台模板。

### Added

- **CLI**
  - `create-fluffy-design-pro <directory>` 交互式向导与命令行参数（`--package-manager`、`--provider`、`--theme-color`、`--language`、`--no-dark-mode`）
  - `--dry-run`：只展示计划生成的文件，不写入磁盘
  - 非空目录默认拒绝覆盖；`vercel`/`none` 两种部署 provider，默认生成 `vercel.json`
  - 生成 `.fluffy/manifest.json` 文件清单
- **模板：应用壳与布局**
  - Vue 3 + TypeScript + Vite 工程，`Navbar`、`SidebarNav`、`TabBar`、`CommandPalette`、`DefaultLayout`
  - 模块化路由注册表（dashboard / external / management / showcase）
  - Pinia stores（app 主题与暗色、tabs 标签页）
  - vue-i18n 中英文双语文案
  - CSS 语义 token，支持 light / dark 主题与 `prefers-reduced-motion`
- **模板：页面**
  - `Home`、`Projects`、`Deployments`、`Settings`、`ExternalFrame`、`Login`、`NotFound`
  - showcase：`Charts`、`Components`、`Feedback`、`Form`、`Icons`、`Result`、`Table`、`Tokens`
- **模板：f- UI 基础组件**
  - `FButton`、`FCheckbox`、`FFormItem`、`FInput`、`FPanel`、`FResult`、`FSelect`、`FSkeleton`、`FSpinner`、`FTextarea`、`FToastHost`
  - `FCode`：代码块卡片（shiki 高亮、红黄绿圆点折叠、lang 标签与复制按钮）
  - `FMarkdown`：markdown 预览，代码块复用 `FCode` 渲染（markdown-it + shiki）
- **模板：组合式逻辑**
  - `useLoading`（并发任务计数器）、`useTable`（本地/请求两种数据模式）、`useChart`（ECharts 生命周期）、`useForm`（轻量内置校验）、`useToast`
- **模板：质量基础设施**
  - Vitest + Vue Test Utils + happy-dom，含 `setup.ts` 对 shiki / ResizeObserver 的浏览器边界 mock
  - 组件与 composables 单测，覆盖表单、表格、图表、toast、404、FCode、FMarkdown

### Changed

- 无（首次发布）

### Deprecated

- 无

### Removed

- 无

### Fixed

- 无

### Security

- 无
