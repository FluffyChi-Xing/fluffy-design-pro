# create-fluffy-design-pro

一条命令生成开箱即用的 [Vue 3](https://vuejs.org/) 中后台（管理控制台）工程——自带应用壳、路由、国际化、主题、表单、表格、图表与反馈组件，而不是空白的 Vue 页面。

```bash
npx create-fluffy-design-pro@latest my-admin
```

## 特性

- **应用壳**：导航栏、侧边栏、标签页与命令面板，已接入模块化路由注册表。
- **可复用的 `f-` 组件基础**：按钮、输入框、下拉选择、复选、多行文本、表单项、面板、加载指示、骨架屏、结果页、Toast 宿主、代码块与 markdown 预览——无需引入完整 UI 框架。
- **组合式逻辑**：`useForm`、`useTable`、`useChart`、`useLoading`、`useToast`，承载数据与反馈逻辑。
- **内置页面**：首页、项目、部署、设置、登录、404，以及图表、表单、表格、图标、结果、token、反馈等 showcase 页面。
- **国际化**：内置 `zh-CN` 与 `en-US` 双语文案。
- **主题**：CSS 语义 token，支持 light / dark 主题与 `prefers-reduced-motion`。
- **可测试**：预置 Vitest + Vue Test Utils + happy-dom，组件与组合式逻辑均附带单测。
- **部署**：默认生成 `vercel.json`；选择 `none` 则不生成部署配置。

## 用法

```bash
create-fluffy-design-pro [directory] [options]
```

| 选项 | 默认值 | 说明 |
| --- | --- | --- |
| `--package-manager <manager>` | `pnpm` | 包管理器：`pnpm`、`npm` 或 `yarn`。 |
| `--provider <provider>` | `vercel` | 部署平台：`vercel` 或 `none`。 |
| `--theme-color <color>` | `#4f46e5` | 六位十六进制主题色。 |
| `--language <locale>` | `zh-CN` | 默认语言：`zh-CN` 或 `en-US`。 |
| `--no-dark-mode` | – | 生成的工程不启用暗色主题。 |
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

# 只预览将生成的文件
npx create-fluffy-design-pro@latest my-admin --dry-run
```

命令默认拒绝覆盖非空的目标目录。生成完成后会在新工程中写入 `.fluffy/manifest.json`，记录本次生成的文件清单。

## 生成结构

```text
my-admin/
├── src/
│   ├── components/          # f- UI 组件、表单、布局、导航
│   ├── composables/         # useForm、useTable、useChart、useLoading、useToast
│   ├── layouts/             # DefaultLayout
│   ├── locales/             # zh-CN / en-US
│   ├── pages/               # 应用页面与 showcase 页面
│   ├── router/              # 模块化路由注册表
│   ├── stores/              # Pinia（主题、标签页）
│   ├── styles/              # CSS 语义 token
│   └── test/                # Vitest 测试基础
├── .fluffy/manifest.json    # 生成文件清单
├── vercel.json              # 选择 vercel 时生成
└── package.json
```

## 文档

- [项目仓库](https://github.com/FluffyChi-Xing/fluffy-design-pro)
- `docs/overview/design.md` — 产品设计概览
- `CHANGELOG.md` — 版本变更记录

## License

[MIT](https://github.com/FluffyChi-Xing/fluffy-design-pro/blob/master/LICENSE)
