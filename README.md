# Fluffy Design Pro

面向 Vue 3 中后台应用的项目生成 CLI 与轻量前端基础层模板。运行一条命令即可生成一个带应用壳、路由、国际化、主题、表单、表格、图表与反馈组件的中后台工程，而非空白 Vue 页面。

```bash
npx create-fluffy-design-pro@latest my-admin
```

## 设计背景

中后台（管理/运营/内部工具）项目在脚手架阶段往往重复同一套工作量：应用壳、路由组织、菜单派生、国际化、主题与暗色、表单与表格的基础能力、以及一组统一的反馈组件。完整 UI 框架（如 Arco / Element）能加速开发，但会把整套运行时与组件样式绑定进产物，不利于按需加载与长期演进。

Fluffy Design Pro 的定位是「**可生成、可复用、可测试的中台前端基础层**」：

- **不引入完整 UI 框架**：以自研 `f-` 前缀轻量组件 + CSS 语义 token 承载视觉与状态，业务可以随时替换或扩展。
- **可复用**：表单、表格、图表、loading、toast 等能力以组件与组合式逻辑（composables）形式提供，页面只做组合。
- **可测试**：模板内置 Vitest 测试基础，生成项目即可运行单元测试。
- **可配置**：CLI 负责选择与注入配置（语言、主题色、暗色、部署 provider），模板负责运行时能力。

> 早期的概要设计（`docs/overview/design.md`）曾设想以 Tailwind CSS + shadcn-vue 作为 UI 基础。当前实现改用了更轻量的 `f-` 组件 + CSS token 方案，二者在设计目标（可按需、可组合、不绑死整套运行时）上一致，具体技术选型以仓库现状为准。

## 里程碑

| 里程碑 | 状态 | 说明 |
| --- | --- | --- |
| M1 CLI 生成闭环 | ✅ 已完成 | `create` 命令生成可运行的 Vue 3 控制台模板，含 manifest 与部署配置 |
| M2 模板基础能力 | ✅ 已完成 | 应用壳、路由、i18n、主题、`f-` UI、表单/表格/图表 composables、测试基础 |
| M3 模板 showcase 与反馈 | ✅ 已完成 | 登录、404、结果页、token 页、代码块与 markdown 预览 |
| M4 存量项目渐进迁移 | ✅ 已完成 | Vue 3 + Vite 项目的保守认领、受管文件迁移与回滚 |
| M5 部署 provider 扩展 | ✅ 已完成 | Cloudflare Pages 与 Workers 两种目标均已支持（`wrangler.jsonc` + SPA fallback），CLI 增加 `--cloudflare-target` |
| M6 Fluffy 生态集成 | ✅ 已完成 | Fluffy OSS 与 Fluffy Log Trace Browser SDK 可选集成，接入地址与开发代理可由 CLI / `.env` 配置，并含基于 `f-popover` 的上传任务监控中心（`f-upload` / `f-upload-progress`） |

## 当前已完成

### CLI（`packages/cli`）

- `create-fluffy-design-pro <directory>`：交互式向导 + 命令行参数
  - `--package-manager`（pnpm / npm / yarn）、`--provider`（vercel / cloudflare / none）、`--cloudflare-target`（pages / workers，默认 pages）、`--theme-color`、`--language`（zh-CN / en-US）、`--no-dark-mode`、`--dry-run`
  - 可选生态集成（默认不生成）：`--fluffy-oss` / `--fluffy-log` 启用 Fluffy OSS / Fluffy Log Trace SDK；`--fluffy-oss-url` / `--fluffy-log-url` 指定接入地址、`--fluffy-oss-proxy` / `--fluffy-log-proxy` 指定开发代理目标（后两者传入即隐含启用对应 SDK）
- 非空目录默认拒绝覆盖；`vercel` 为默认部署 provider，选择 `none` 时不生成部署文件；选择 `cloudflare` 时默认生成 Cloudflare Pages 静态站点配置，改用 `--cloudflare-target workers` 则生成 Workers 静态资源 + SPA fallback（`wrangler.jsonc` 按目标生成），不执行登录、上传或部署，也不写入账号、token 或 secret
- 生成 `.fluffy/manifest.json` 文件清单，记录生成结果
- 单测覆盖生成流程、manifest 与 provider 行为

### 生成模板（`packages/cli/templates/core`）

- **应用壳**：`Navbar`（右上角搜索 / 语言 / 主题 / 消息通知 / 全屏 / 账户下拉 / 设置，均可由 `appConfig.headerActions` 开关）、`SidebarNav`、`TabBar`（标签页右键仅弹菜单，不误跳转）、`CommandPalette`、`DefaultLayout`
- **路由**：模块化注册表（dashboard / external / management / showcase），新页面通过模块文件接入并自动进菜单
- **页面**：`Home`、`Projects`、`Deployments`、`Settings`、`ExternalFrame`、`Login`、`NotFound`（404 展示无效路径并引导回首页）
- **showcase 页面**：`Charts`、`Components`、`Feedback`、`Form`、`Icons`、`Result`、`Table`、`Tokens`
- **`f-` UI 基础组件**：`FButton`、`FCheckbox`、`FCode`、`FDropdown`（通用下拉菜单）、`FFormItem`、`FFullscreen`（全屏切换）、`FInput`、`FPanel`、`FPopover`（锚定浮层，用于消息通知）、`FProgress`、`FTabs`（shadcn 风格进度条 / 标签页）、`FResult`、`FSelect`、`FSheet`（右侧滑入设置面板）、`FSkeleton`、`FSpinner`、`FTextarea`、`FToastHost`、`FUpload`、`FUploadProgress`（文件上传与上传进度监控，`--fluffy-oss` 时生成）
  - `FCode`：代码块卡片，shiki 语法高亮，左上红黄绿圆点折叠代码段，右上 lang 标签与复制按钮
  - `FMarkdown`：markdown 预览，代码块复用 `FCode` 渲染（markdown-it + shiki）
- **组合式逻辑**：`useLoading`（并发任务）、`useTable`（本地 / 请求两种模式）、`useChart`（ECharts 生命周期）、`useForm`（轻量内置校验：required / pattern / 同步 validator）、`useToast`
- **基础设施**：vue-i18n 中英文、CSS 语义 token + light/dark 主题、Pinia（app / tabs）、Vitest + Vue Test Utils 测试基础
- **运行时设置面板**：右上角设置齿轮 / 账户菜单打开 `SettingsPanel`（右侧 `FSheet`），可实时开关 TabBar、导航栏、菜单栏，调整菜单宽度（220 / 244 / 280），切换色弱模式与页面标题；状态仅运行时生效（seed 自 `appConfig`，不做持久化）
- **全局配置与 env 管理**：`src/config/app.ts` 通过全局变量显式配置导航栏 / 菜单 / 菜单宽度 / 色弱 / 页面标题 / 右上角操作；`src/config/env.ts` 提供类型化的 `VITE_*` 读取（含 Fluffy OSS 与 Log Trace 接入配置），`.env.example` 列出全部可用 key
- **Fluffy 生态集成（可选）**：`--fluffy-oss` / `--fluffy-log` 时生成 `src/integrations/` 下的可选集成并注入依赖——`fluffy-log.ts` 在应用入口初始化（appId / 接入地址 / credential 齐备时启用），`fluffy-oss.ts` 提供带签名认证的 `uploadToFluffyOss`；接入地址支持完整 URL 或 `/路径` 前缀，后者由 `vite.config.ts` 依据 `VITE_FLUFFY_*_PROXY_TARGET` 自动配置 `server.proxy` 转发。`--fluffy-oss` 时还生成上传中心（基于 `f-popover` 的任务进度监控，Pinia + SDK + `FProgress` / `FTabs`）：SDK 配置齐备时 header 右侧出现上传中心入口并走真实上传，未配置时 `FUpload` 模拟上传（本地进度到 100% 并提示），两组件可脱离 SDK 独立使用

## 待完成

- **存量项目渐进迁移**：当前支持 Vue 3 + Vite 项目。`adopt [dir]` 检测技术栈、锁文件、Git 状态、manifest 和模板冲突，确认后只写 `.fluffy/manifest.json`；`migrate [dir]` 默认 dry-run，仅更新已认领且 hash 未变化的 `generator-owned` 文件，`migrate [dir] --apply --yes` 执行带 staging/备份的迁移，`migrate rollback <transaction-id> [dir] --yes` 可恢复未被后续修改的文件。迁移要求 Git 工作区干净，不会覆盖未知业务文件、修改依赖或配置文件，也不支持 Vue CLI、Nuxt 和非 Vue 项目。
- **模板能力扩展**：更多业务 preset（dashboard/list 等）、请求 adapter 与权限 guard 的完整示例
- **构建优化**：当前生成模板按语言对 shiki 分包，但整体 chunk 仍有优化空间（按需加载、manualChunks）

## 存量项目迁移

```bash
# 只读检查 Vue 3 + Vite 项目，不写文件
npx create-fluffy-design-pro@latest adopt ./existing-app --dry-run

# 确认后仅写入认领 manifest
npx create-fluffy-design-pro@latest adopt ./existing-app --yes

# 默认预览可更新的受管文件
npx create-fluffy-design-pro@latest migrate ./existing-app

# 在 Git 工作区干净时执行迁移
npx create-fluffy-design-pro@latest migrate ./existing-app --apply --yes

# 使用迁移输出的事务 ID 回滚
npx create-fluffy-design-pro@latest migrate rollback <transaction-id> ./existing-app --yes
```

## 开发

```bash
pnpm install          # 安装工作区依赖
pnpm check            # CLI 类型检查
pnpm test             # CLI 单测
pnpm build            # 构建 CLI
pnpm playground       # 运行 playground（由当前模板生成的示例项目）
pnpm playground:check # playground 类型检查
pnpm playground:build # playground 生产构建
```

## 文档

- `docs/overview/design.md` — 概要设计（产品定位、能力基线、目标架构，部分内容为远期目标）
- `docs/codebase/ARCHITECTURE.md`、`docs/codebase/CONCERNS.md` — 架构与关注点记录
- `CHANGELOG.md` — 版本变更记录

## License

[MIT](LICENSE)
