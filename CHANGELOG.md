# Changelog

本文件记录 Fluffy Design Pro 各版本的变更。格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，版本遵循 [Semantic Versioning](https://semver.org/lang/zh-CN/)。

## [0.3.0] - 2026-08-11

### Added

- **shadcn-vue 基线**：生成项目新增 `components.json`、Tailwind v4/Vite 接入、`cn()` 工具与 Button、Input、Textarea、Checkbox、Card、Skeleton、ScrollArea 等标准基础组件目录，可继续使用 shadcn-vue CLI 扩展。
- **管理端扩展**：新增 Lucide `FIcon`（名称、路由别名、颜色、尺寸与无障碍语义）、声明式 `FChart`、支持选择/级联/半选/全选的 `FTree`，以及输出语义标题/段落并支持截断展开的 `FTypography`。
- **权限指令**：新增响应式 `v-permission`，支持数组或 `|` 分隔的 token 任一匹配，并提供 `usePermission().setTokens()` 更新 UI 可见性。
- **展示与文档**：新增 Tree 展示页，并扩充图标、图表、树和排版的 VitePress 交互预览及 shadcn-vue 使用指南。
- **发布保障**：新增 CLI 包发布契约测试与 npm Trusted Publishing 发布工作流。

### Changed

- 常规 UI 的推荐导入调整为 `@/components/ui/*`；`F*` 聚焦图标、图表、树、排版、布局和运行时等 Fluffy 管理端能力。
- 主题样式增加语义滚动条 token，覆盖 Firefox 与 WebKit，并随浅色/深色主题和品牌色变化。
- 图表展示与低层 `useChart` 支持按模块注册、复用已有实例、ResizeObserver 缺失保护和安全释放。

### Fixed

- 文档中的创建命令统一为已发布的 `npx @fluffy-design-pro/cli@latest <directory>`，避免引用不存在的 npm 包。
- `FTypography` 的非受控展开状态可正确在展开与收起间切换。

### Security

- `v-permission` 仅控制前端 UI；服务端/API 仍必须独立执行授权校验。

## [0.2.0] - 2026-08-08

### Added

- **应用壳设置面板**：`DefaultLayout` 接入 `f-sheet` 设置面板（`SettingsPanel`），header 齿轮按钮可开关；配套 `useFullscreen` 全屏能力与 `NotificationsPanel` 通知面板。
- **浮层 UI 组件**：`FDropdown`（下拉菜单）、`FPopover`（气泡卡片）、`FSheet`（抽屉面板），基于新的 `useFloatingMenu` 定位组合式，均以 `v-model:open` 受控。
- **部署**：新增 `cloudflare` 部署 provider（生成 `wrangler.jsonc` 与 Pages `_redirects` 规则），`--provider` 支持 `vercel` / `cloudflare` / `none`，新增 `--cloudflare-target <pages|workers>` 选项。
- **现有项目支持**：新增 `adopt` 子命令（检测已有 Vue 3 + Vite 工程，输出受管文件与冲突报告，写入 manifest）；`migrate` 子命令（预览 / 应用受管文件的版本迁移，支持冲突检测与 `migrate rollback <transaction-id>` 回滚）；manifest 升级至 schema v2（`ManagedFile`、迁移事务、`projectKind`）。
- **可选 Fluffy 生态集成**：新增 `--fluffy-oss` / `--fluffy-log` 及其 `-url` / `-proxy` 变体；模板生成集成模块 `fluffy-oss.ts` / `fluffy-log.ts`、运行时常量 `env.ts` 与开发代理。
- **上传任务进度监控中心**：`FUpload`（文件上传框，支持拖拽与多选）、`FUploadProgress`（任务进度行）、`FProgress`（进度条）、`FTabs`（标签页），基于 `f-popover` 的 header 上传中心与 Pinia `upload` store；SDK 未配置时自动降级为本地模拟上传。
- **测试**：新增浮层组件、设置面板、全屏、上传中心、进度 / 标签页、upload store、env、app store 等模板单测，以及 CLI 集成测试。

### Fixed

- 修复 `FSheet` / `FPopover` / `FDropdown` 的 `v-model:open` 绑定：改用具名 `defineModel('open')`。此前无名模型绑定到 `modelValue`，导致设置面板、通知与上传 popover、账户下拉无法打开。

### Changed

- CLI 入口重构为 `create` / `adopt` / `migrate` 子命令结构，`create` 仍为默认命令。
- 模板新增 `.env.example`；生成工程的 `package.json` 随 SDK 集成自动补齐依赖脚本。

### Security

- 无

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
