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
| M4 存量项目渐进迁移 | ⏳ 待完成 | `adopt` 扫描认领、`migrate` 增量迁移与回滚 |
| M5 部署 provider 扩展 | ⏳ 待完成 | Cloudflare Pages/Workers provider |
| M6 Fluffy 生态集成 | ⏳ 待完成 | Fluffy OSS 与 Fluffy Log Trace Browser SDK 可选集成 |

## 当前已完成

### CLI（`packages/cli`）

- `create-fluffy-design-pro <directory>`：交互式向导 + 命令行参数
  - `--package-manager`（pnpm / npm / yarn）、`--provider`（vercel / none）、`--theme-color`、`--language`（zh-CN / en-US）、`--no-dark-mode`、`--dry-run`
- 非空目录默认拒绝覆盖；`vercel` 为默认部署 provider，选择 `none` 时不生成部署文件
- 生成 `.fluffy/manifest.json` 文件清单，记录生成结果
- 单测覆盖生成流程、manifest 与 provider 行为

### 生成模板（`packages/cli/templates/core`）

- **应用壳**：`Navbar`、`SidebarNav`、`TabBar`（标签页右键仅弹菜单，不误跳转）、`CommandPalette`、`DefaultLayout`
- **路由**：模块化注册表（dashboard / external / management / showcase），新页面通过模块文件接入并自动进菜单
- **页面**：`Home`、`Projects`、`Deployments`、`Settings`、`ExternalFrame`、`Login`、`NotFound`（404 展示无效路径并引导回首页）
- **showcase 页面**：`Charts`、`Components`、`Feedback`、`Form`、`Icons`、`Result`、`Table`、`Tokens`
- **`f-` UI 基础组件**：`FButton`、`FCheckbox`、`FCode`、`FFormItem`、`FInput`、`FPanel`、`FResult`、`FSelect`、`FSkeleton`、`FSpinner`、`FTextarea`、`FToastHost`
  - `FCode`：代码块卡片，shiki 语法高亮，左上红黄绿圆点折叠代码段，右上 lang 标签与复制按钮
  - `FMarkdown`：markdown 预览，代码块复用 `FCode` 渲染（markdown-it + shiki）
- **组合式逻辑**：`useLoading`（并发任务）、`useTable`（本地 / 请求两种模式）、`useChart`（ECharts 生命周期）、`useForm`（轻量内置校验：required / pattern / 同步 validator）、`useToast`
- **基础设施**：vue-i18n 中英文、CSS 语义 token + light/dark 主题、Pinia（app / tabs）、Vitest + Vue Test Utils 测试基础

## 待完成

- **存量项目渐进迁移**：`adopt`（技术栈检测、能力差距与冲突清单、认领 manifest）与 `migrate`（staging、冲突策略、原子替换、备份与回滚），当前仅预留命令入口
- **Cloudflare provider**：当前仅 `vercel` 与 `none`，按设计需补充 Cloudflare Pages/Workers 配置生成
- **Fluffy 生态 SDK 集成**：Fluffy OSS 与 Fluffy Log Trace Browser 的可选依赖、初始化与 adapter 尚未实现
- **模板能力扩展**：更多业务 preset（dashboard/list 等）、请求 adapter 与权限 guard 的完整示例
- **构建优化**：当前生成模板按语言对 shiki 分包，但整体 chunk 仍有优化空间（按需加载、manualChunks）

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
