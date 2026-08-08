# create-fluffy-design-pro

一条命令生成开箱即用的 [Vue 3](https://vuejs.org/) 中后台（管理控制台）工程——自带应用壳、路由、国际化、主题、表单、表格、图表与反馈组件，而不是空白的 Vue 页面。

```bash
npx create-fluffy-design-pro@latest my-admin
```

## 特性

- **应用壳**：导航栏、侧边栏、标签页、命令面板与设置面板（`f-sheet`），已接入模块化路由注册表。
- **可复用的 `f-` 组件基础**：按钮、输入框、下拉选择、复选、多行文本、表单项、面板、加载指示、骨架屏、结果页、Toast 宿主、代码块、markdown 预览、进度条、标签页与上传组件——无需引入完整 UI 框架。
- **组合式逻辑**：`useForm`、`useTable`、`useChart`、`useLoading`、`useToast`，承载数据与反馈逻辑。
- **内置页面**：首页、项目、部署、设置、登录、404，以及图表、表单、表格、图标、结果、token、反馈等 showcase 页面。
- **国际化**：内置 `zh-CN` 与 `en-US` 双语文案。
- **主题**：CSS 语义 token，支持 light / dark 主题与 `prefers-reduced-motion`。
- **可测试**：预置 Vitest + Vue Test Utils + happy-dom，组件与组合式逻辑均附带单测。
- **部署**：支持 `vercel`、`cloudflare`（Pages / Workers）或 `none`，默认生成 `vercel.json`。
- **可选的 Fluffy 生态集成**：`--fluffy-oss` 生成 OSS SDK 集成与基于 `f-popover` 的上传任务进度监控中心；`--fluffy-log` 生成 Log Trace SDK 集成。未配置 SDK 时上传组件自动降级为本地模拟上传。
- **现有项目支持**：`adopt` 子命令识别并接管已有 Vue 3 + Vite 工程；`migrate` 子命令规划并应用受管文件的版本迁移（支持 `rollback` 回滚）。

## 用法

```bash
create-fluffy-design-pro [directory] [options]
```

| 选项 | 默认值 | 说明 |
| --- | --- | --- |
| `--package-manager <manager>` | `pnpm` | 包管理器：`pnpm`、`npm` 或 `yarn`。 |
| `--provider <provider>` | `vercel` | 部署平台：`vercel`、`cloudflare` 或 `none`。 |
| `--cloudflare-target <target>` | `pages` | Cloudflare 部署目标：`pages` 或 `workers`（配合 `--provider cloudflare`）。 |
| `--theme-color <color>` | `#4f46e5` | 六位十六进制主题色。 |
| `--language <locale>` | `zh-CN` | 默认语言：`zh-CN` 或 `en-US`。 |
| `--no-dark-mode` | – | 生成的工程不启用暗色主题。 |
| `--fluffy-oss` | – | 集成可选 Fluffy OSS SDK（生成 SDK 配置、代理与上传中心）。 |
| `--fluffy-log` | – | 集成可选 Fluffy Log Trace SDK（生成 SDK 配置与代理）。 |
| `--fluffy-oss-url <url>` | – | Fluffy OSS API 基础地址（隐含 `--fluffy-oss`）。 |
| `--fluffy-log-url <url>` | – | Fluffy Log Trace API 基础地址（隐含 `--fluffy-log`）。 |
| `--fluffy-oss-proxy <target>` | – | 开发代理目标，用于路径前缀的 OSS 基础地址（隐含 `--fluffy-oss`）。 |
| `--fluffy-log-proxy <target>` | – | 开发代理目标，用于路径前缀的 Log 基础地址（隐含 `--fluffy-log`）。 |
| `--dry-run` | – | 只展示将要生成的文件，不写入磁盘。 |

```bash
# 交互式引导
npx create-fluffy-design-pro@latest my-admin

# 全部选项
npx create-fluffy-design-pro@latest my-admin \
  --package-manager npm \
  --provider vercel \
  --theme-color #6366f1 \
  --language en-US

# 部署到 Cloudflare Workers，并集成 Fluffy OSS 上传中心
npx create-fluffy-design-pro@latest my-admin \
  --provider cloudflare \
  --cloudflare-target workers \
  --fluffy-oss-url https://oss.example.com/api

# 只预览将生成的文件
npx create-fluffy-design-pro@latest my-admin --dry-run
```

命令默认拒绝覆盖非空的目标目录。生成完成后会在新工程中写入 `.fluffy/manifest.json`，记录本次生成的文件清单，作为后续 `migrate` 的迁移基线。

### 接管现有项目

```bash
# 检测一个已有 Vue 3 + Vite 工程，列出可受管文件与冲突（只写报告，不修改项目）
npx create-fluffy-design-pro@latest adopt path/to/project

# 确认后写入 .fluffy/manifest.json
npx create-fluffy-design-pro@latest adopt path/to/project --yes
```

### 迁移受管文件

```bash
# 预览迁移计划（不写文件）
npx create-fluffy-design-pro@latest migrate path/to/project

# 审阅后应用迁移
npx create-fluffy-design-pro@latest migrate path/to/project --apply --yes

# 在受管文件未被改动的前提下回滚一次已提交的迁移
npx create-fluffy-design-pro@latest migrate rollback <transaction-id> path/to/project
```

## 生成结构

```text
my-admin/
├── src/
│   ├── components/          # f- UI 组件、上传中心、通知、设置面板、布局、导航
│   ├── composables/         # useForm、useTable、useChart、useLoading、useToast
│   ├── integrations/        # Fluffy OSS / Log Trace SDK（--fluffy-oss / --fluffy-log 时生成）
│   ├── layouts/             # DefaultLayout（含设置面板 f-sheet）
│   ├── locales/             # zh-CN / en-US
│   ├── pages/               # 应用页面与 showcase 页面
│   ├── router/              # 模块化路由注册表
│   ├── stores/              # Pinia（主题、标签页、上传任务）
│   ├── styles/              # CSS 语义 token
│   └── test/                # Vitest 测试基础
├── .fluffy/manifest.json    # 生成文件清单（adopt/migrate 的基线）
├── vercel.json              # 选择 vercel 时生成
├── wrangler.jsonc           # 选择 cloudflare 时生成
└── package.json
```

## 文档

- [项目仓库](https://github.com/FluffyChi-Xing/fluffy-design-pro)
- `docs/overview/design.md` — 产品设计概览
- `CHANGELOG.md` — 版本变更记录

## License

[MIT](https://github.com/FluffyChi-Xing/fluffy-design-pro/blob/master/LICENSE)
