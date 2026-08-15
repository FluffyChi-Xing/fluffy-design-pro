# create-fluffy-design-pro

一条命令生成开箱即用的 [Vue 3](https://vuejs.org/) 中后台（管理控制台）工程——自带应用壳、路由、国际化、主题、表单、表格、图表与反馈组件，而不是空白的 Vue 页面。

```bash
npx @fluffy-design-pro/cli@latest my-admin
```

## 特性

- **应用壳**：导航栏、侧边栏、标签页、命令面板与设置面板（`f-sheet`），已接入模块化路由注册表。
- **可组合的 UI 基础**：shadcn 风格的 `Button`、`Input`、`Textarea`、`Checkbox`、`Card`、`Skeleton`，以及 `FEmpty`、图表、树、排版、表单、反馈与上传等 Fluffy 管理端扩展——无需引入完整 UI 框架。
- **组合式逻辑**：`useForm`、`useTable`、`useChart`、`useLoading`、`useToast`，承载数据与反馈逻辑。
- **请求基础**：内置 Axios 请求实例、Bearer token 管理、ApiEnvelope 解包与统一错误类型，后端业务模块按实际接口契约添加。
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
npx @fluffy-design-pro/cli@latest my-admin

# 全部选项
npx @fluffy-design-pro/cli@latest my-admin \
  --package-manager npm \
  --provider vercel \
  --theme-color #6366f1 \
  --language en-US

# 部署到 Cloudflare Workers，并集成 Fluffy OSS 上传中心
npx @fluffy-design-pro/cli@latest my-admin \
  --provider cloudflare \
  --cloudflare-target workers \
  --fluffy-oss-url https://oss.example.com/api

# 只预览将生成的文件
npx @fluffy-design-pro/cli@latest my-admin --dry-run
```

命令默认拒绝覆盖非空的目标目录。生成完成后会在新工程中写入 `.fluffy/manifest.json`，记录本次生成的文件清单，作为后续 `migrate` 的迁移基线。

### 接管现有项目

```bash
# 检测一个已有 Vue 3 + Vite 工程，列出可受管文件与冲突（只写报告，不修改项目）
npx @fluffy-design-pro/cli@latest adopt path/to/project

# 确认后写入 .fluffy/manifest.json
npx @fluffy-design-pro/cli@latest adopt path/to/project --yes
```

### 迁移受管文件

```bash
# 预览迁移计划（不写文件）
npx @fluffy-design-pro/cli@latest migrate path/to/project

# 审阅后应用迁移
npx @fluffy-design-pro/cli@latest migrate path/to/project --apply --yes

# 在受管文件未被改动的前提下回滚一次已提交的迁移
npx @fluffy-design-pro/cli@latest migrate rollback <transaction-id> path/to/project
```

## 生成结构

```text
my-admin/
├── src/
│   ├── api/                 # Axios 请求基础、令牌与拦截器
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

## 图标扩展

生成项目预装 `lucide-vue-next`。`FIcon` 内置一组常用图标（导航、CRUD、数据图表、反馈状态、用户权限与业务场景）；内置集之外的图标由应用静态命名导入后显式注册，保持 tree-shaking：

```ts
// src/main.ts
import { CalendarDays } from 'lucide-vue-next'
import { registerIcons } from '@/lib/icons'

registerIcons({ CalendarDays })
```

```vue
<FIcon name="calendar-days" size="20" />
```

注册键支持 PascalCase 与 kebab-case 名称。禁止 `import * as Icons from 'lucide-vue-next'`，会破坏 tree-shaking。

## 使用生成的项目

### 常用命令

```bash
pnpm dev       # 启动开发服务器
pnpm check     # 类型检查（vue-tsc）
pnpm test      # 运行 Vitest 单测
pnpm build     # 类型检查并构建
pnpm preview   # 本地预览构建产物
```

生成的工程自带应用壳与 showcase 页面（侧边栏「设计系统展示」分组下），可边运行边对照示例改业务。仓库 playground 的 `/showcase/basic-components` 则集中演示 `Button`、`Input`、`Textarea`、`Checkbox`、`Card` 与 `Skeleton` 的交互状态；它们通过语义 token 自动继承当前品牌色及 light / dark 主题。

### 组件与分发方式

生成项目保留本地、可编辑的组件源码，按需显式导入，不做全局注册：

```vue
<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import FEmpty from '@/components/extensions/FEmpty.vue'
</script>

<template>
  <Card class="p-5">
    <FEmpty title="暂无项目">
      <Button>创建项目</Button>
    </FEmpty>
  </Card>
</template>
```

| 分组 | 组件 | 说明 |
| --- | --- | --- |
| shadcn 风格基础组件 | `Button`、`Input`、`Textarea`、`Checkbox`、`Card`、`Skeleton` | 位于 `@/components/ui/*`，使用统一的语义颜色、边框与焦点环 token |
| Fluffy 扩展 | `FEmpty`、`FIcon`、`FChart`、`FTree`、`FTypography` | 空状态、图标、图表、层级数据与排版能力 |
| 管理端组件 | `FFormItem`、`FResult`、`FToastHost`、`FCode`、`FMarkdown`、`FTabs`、`FDropdown`、`FPopover`、`FSheet` | 表单、反馈、浮层与运行时交互能力 |
| 可选上传 | `FUpload`、`FUploadProgress` | 选择 `--fluffy-oss` 后生成 |

模板统一声明 Tailwind、shadcn-vue 和 Axios 的版本；业务项目安装生成的 `package.json` 后无需额外补齐基础依赖或 Tailwind 配置。生成项目刻意继续使用本地 `@/components/*` 与 `@/lib/*` 源码，不引入 `@fluffy-design-pro/ui` 运行时依赖，因此既有导入路径、源码可编辑性与 CLI 迁移行为保持不变。

### 在非 Fluffy 项目中复用

公开的 `@fluffy-design-pro/ui` 面向不使用 CLI 模板的 Vue 项目。Vue `^3.5.0` 是 peer dependency；从显式子路径导入以保持 tree-shaking，并在应用入口加载一次预编译样式：

```bash
pnpm add @fluffy-design-pro/ui
```

```vue
<script setup lang="ts">
import { Button } from '@fluffy-design-pro/ui/button'
import { FEmpty } from '@fluffy-design-pro/ui/empty'
import '@fluffy-design-pro/ui/style.css'
</script>
```

该样式已包含编译后的 Tailwind utilities 与 Fluffy 语义 token，宿主项目无需安装或配置 Tailwind、shadcn-vue 或 `components.json`。可通过 CSS 变量覆盖公共包的品牌色：

```css
:root { --fluffy-brand: #6366f1; }
```

### API 基础

`@/api/base` 具名导出 `$request`、`ApiEnvelope`、`ApiError` 和 token helpers，默认导出 `{ request }`。请求实例固定使用 `/fluffy-maas` 前缀、15 秒超时；带 token 时附加 Bearer header，并只在 `{ code: 200, data }` 信封响应时返回 `data`。认证和项目模块应在后端的路由、字段和分页契约确认后再添加。

数据与业务逻辑由组合式函数承载，同样按需导入（`src/composables/`）：

- `useTable`：表格数据源，支持本地 / 请求式数据、列定义、排序、分页、loading 与错误态。
- `useForm`：表单状态，按列定义执行必填 / 正则 / 自定义校验，提供错误与提交处理。
- `useChart`：图表 option 与 resize 管理（配合 `FChart`）。
- `useLoading` / `useToast`：加载指示与 Toast 反馈。

```ts
import { useTable } from '@/composables/useTable'

const table = useTable({
  columns: [{ key: 'name', titleKey: 'table.name' }],
  data: initialRows,                 // 本地数据源
  request: async ({ page }) => ...,  // 或请求式数据源
  transform: (result) => ({ rows: result.items, total: result.count }),
  initialPageSize: 10
})
```

### 路由：自动重建

路由采用模块化注册表：`src/router/routes/modules/` 下的每个 `.ts` 文件即一个路由模块，由 `registry.ts` 通过 `import.meta.glob('./routes/modules/*.ts')` 自动加载。**新增或删除路由模块文件即可自动重建路由表与侧边栏导航，无需改动 `router/index.ts`。**

```ts
// src/router/routes/modules/blog.ts
import BlogPage from '@/pages/BlogPage.vue'
import type { RouteModule } from '@/router/types'

export default {
  routes: [
    { name: 'blog-list', path: 'blog', component: BlogPage, meta: { titleKey: 'navigation.blog', icon: 'table', groupKey: 'navigation.manage', order: 10 } }
  ]
} satisfies RouteModule
```

`meta` 字段决定导航与页面行为：

- `titleKey` — 菜单与浏览器标题的 i18n key（补充 `src/locales/` 文案）。
- `icon` — 菜单图标（`src/router/types.ts` 中 `IconName` 定义的内置图标名）。
- `groupKey` — 所属导航分组；分组展示顺序由 `registry.ts` 的 `groupOrder` 定义。
- `order` — 组内排序。
- `hideInMenu` — 为 `true` 时不显示在侧边栏（如登录页、404）。
- `activeMenu` — 指定高亮的菜单项（用于 iframe 外部页）。
- `noAffix` — 为 `true` 时不固定为常驻标签页。

外链（新标签打开或 iframe 嵌入）通过 `externalRoutes` 声明，无需页面文件：

```ts
// src/router/routes/modules/external.ts
export default {
  externalRoutes: [
    { key: 'docs', titleKey: 'navigation.docs', url: 'https://example.com/docs', openMode: 'new-tab', groupKey: 'navigation.resources', order: 10 }
  ]
} satisfies RouteModule
```

新增页面只需三步：在 `src/pages/` 新建页面组件 → 在 `src/router/routes/modules/` 新增（或扩展）路由模块 → 在 `src/locales/` 补充对应文案。

## 文档

- [项目仓库](https://github.com/FluffyChi-Xing/fluffy-design-pro)
- `docs/overview/design.md` — 产品设计概览
- `CHANGELOG.md` — 版本变更记录

## License

[MIT](https://github.com/FluffyChi-Xing/fluffy-design-pro/blob/master/LICENSE)
