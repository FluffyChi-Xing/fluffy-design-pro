---
title: 组件预览
description: 查看生成项目中的 f- 前缀组件、运行时前提与交互示例。
---

<script setup>
import ComponentPreview from '../.vitepress/theme/components/ComponentPreview.vue'
import ChartPreview from '../.vitepress/theme/components/previews/ChartPreview.vue'
import FormControlsPreview from '../.vitepress/theme/components/previews/FormControlsPreview.vue'
import IconPreview from '../.vitepress/theme/components/previews/IconPreview.vue'
import FeedbackPreview from '../.vitepress/theme/components/previews/FeedbackPreview.vue'
import EmptyPreview from '../.vitepress/theme/components/previews/EmptyPreview.vue'
import FloatingLayersPreview from '../.vitepress/theme/components/previews/FloatingLayersPreview.vue'
import RuntimeContextPreview from '../.vitepress/theme/components/previews/RuntimeContextPreview.vue'
import TreePreview from '../.vitepress/theme/components/previews/TreePreview.vue'
import TypographyPreview from '../.vitepress/theme/components/previews/TypographyPreview.vue'
import UploadPreview from '../.vitepress/theme/components/previews/UploadPreview.vue'
</script>

# 组件预览

Fluffy Design Pro 默认将组件源码随 CLI 生成到项目中，因此已有项目继续从本地路径导入，无需迁移：

```vue
<script setup lang="ts">
import { Button } from '@/components/ui/button'
</script>

<template>
  <Button variant="secondary">保存草稿</Button>
</template>
```

::: tip 预览说明
下面的交互示例由文档站独立实现，用于演示生成组件的公开行为和使用方式；它们不是从生成模板直接打包或导入的组件。实际项目中的实现以生成项目源码为准。
:::

## 基础组件

生成项目中的 `Button`、`Input`、`Textarea`、`Checkbox`、`Card` 与 `Skeleton` 位于 `@/components/ui/*`。这些组件共享应用的语义颜色、边框、焦点环与 surface token，因此会随创建项目时配置的品牌色以及 light / dark 模式自动变化。

```vue
<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
</script>

<template>
  <Input v-model="name" placeholder="输入项目名称" />
  <Checkbox v-model="enabled" />
  <Button>保存</Button>
</template>
```

仓库 playground 的 `/showcase/basic-components` 集中演示六个基础组件的按钮变体、输入值、字符计数、勾选状态、卡片与骨架屏切换，适合在调整主题或扩展组件前对照行为。它使用现有语义 token，而非页面专属颜色。

## 可选的公共 UI 包

非 Fluffy 生成项目可安装 `@fluffy-design-pro/ui` 使用相同的首批可移植组件。Vue `^3.5.0` 是 peer dependency；从显式子路径导入以保持 tree-shaking，并在应用入口加载一次预编译样式：

```bash
pnpm add @fluffy-design-pro/ui
```

```vue
<script setup lang="ts">
import { Button } from '@fluffy-design-pro/ui/button'
import { FEmpty } from '@fluffy-design-pro/ui/empty'
import '@fluffy-design-pro/ui/style.css'
</script>

<template>
  <FEmpty title="暂无项目">
    <Button>创建项目</Button>
  </FEmpty>
</template>
```

公共包首批导出 `Button`、`Input`、`Textarea`、`Checkbox`、`Card`、`Skeleton`、`FEmpty`、`FIcon`、图标注册工具和 `cn`。预编译 CSS 已包含所需 Tailwind utilities 与语义 token，宿主项目无需安装或配置 Tailwind、shadcn-vue 或 `components.json`。通过 `:root { --fluffy-brand: #6366f1; }` 可覆盖公共包的品牌色。生成项目仍应继续使用本地 `@/components/*` 与 `@/lib/*`，以保留可编辑源码及 CLI 迁移兼容性。

## 组件目录

| 分组 | 组件 | 运行时前提 |
| --- | --- | --- |
| shadcn 风格基础 | `Button`、`Input`、`Textarea`、`Checkbox`、`Card`、`Skeleton` | 生成项目从 `@/components/ui/*` 导入；外部项目从 `@fluffy-design-pro/ui/*` 子路径导入 |
| Fluffy 扩展 | `FIcon`、`FEmpty`、`FChart`、`FTree`、`FTypography` | 面向图标、空状态、图表、层级数据与统一排版 |
| 浮层 | `FPopover`、`FDropdown`、`FSheet` | 需要浏览器 DOM 定位 |
| 运行时 | `FTabs`、`FToastHost`、`FFullscreen` | 需要生成项目的 i18n、composable 或浏览器 API |
| 可选上传 | `FUpload`、`FUploadProgress` | 选择 `--fluffy-oss` 后生成，并依赖 Pinia upload store |
| 其他目录 | `FForm`、`FMarkdown` | 分别位于 `components/form`、`components/markdown` |

## Fluffy 管理端扩展

以下 `F*` 是生成项目中的管理端扩展源码；常规按钮、输入、复选框、卡片与骨架屏优先使用上述基础组件。

### FIcon

`FIcon` 内置一组常用 Lucide 图标（导航、CRUD、数据图表、反馈状态、用户权限与业务场景），支持 PascalCase、kebab-case 和菜单路由别名；不动态导入整个图标库。

```vue
<FIcon name="FolderOpen" size="20" />
<FIcon name="chart-no-axes-combined" color="var(--primary)" :size="18" />
<FIcon name="dashboard" size="16" />
<FIcon name="Trash2" color="#dc2626" aria-label="删除" />
```

内置集之外的图标由应用自行从 `lucide-vue-next` 命名导入后显式注册，注册键同时支持 PascalCase 与 kebab-case 名称：

```ts
// src/main.ts
import { CalendarDays } from 'lucide-vue-next'
import { registerIcons } from '@/lib/icons'

registerIcons({ CalendarDays })
```

```vue
<FIcon name="calendar-days" size="20" />
```

务必保持静态命名导入（`import { CalendarDays }`），避免 `import * as Icons from 'lucide-vue-next'`——后者会破坏 tree-shaking，把全量图标打入客户端 bundle。

`name` 未匹配时渲染帮助图标。未提供 `aria-label` 时图标为装饰性内容；纯图标按钮仍应由按钮本身提供可访问名称。

<ComponentPreview title="FIcon 名称、颜色与尺寸" status="独立可用" description="示例仿真 FIcon 的内置常用图标集，可切换名称、颜色与尺寸；内置集之外的应用注册图标（calendar-days）附带 registerIcons 示例。">
  <IconPreview />
</ComponentPreview>

### FEmpty

`FEmpty` 用于无数据、筛选无结果等非终态状态；它与 `FResult` 的操作成功/失败反馈分开。所有文字与图标 props 都可选，因此可以只显示图标、标题或由 slot 提供操作。

```vue
<FEmpty
  icon-name="Box"
  title="暂无项目"
  desc="创建第一个项目后，它会出现在这里。"
>
  <FButton>创建项目</FButton>
</FEmpty>

<FEmpty variant="compact" status="warning" icon-name="Search" title="没有匹配的结果" />
```

`variant` 支持 `default`（默认）与 `compact`；`status` 支持 `default`、`info`（默认）、`success`、`warning`、`error`。`icon-name` 委托给 `FIcon`，未设置 `aria-label`，因此为装饰性图标；使用 `title` 传达空状态含义。默认 slot 用于创建、重试或清除筛选等恢复操作。

<ComponentPreview title="FEmpty 空状态" status="独立可用" description="切换状态与 compact 变体，预览带标题、说明和恢复操作的空状态布局。">
  <EmptyPreview />
</ComponentPreview>

### FChart

`FChart` 是 `useChart` 的声明式封装，`echarts` 已包含在 core 模板中。必须显式传入当前图表所需的 modules，保持 ECharts tree-shaking。

```vue
<FChart
  :option="trafficOption"
  :modules="[LineChart, GridComponent, TooltipComponent, CanvasRenderer]"
  height="320px"
  :loading="loading"
  @ready="onChartReady"
/>
```

它支持 `width`、`height`、`autoresize`、`theme`、`initOptions` 和 `loading`；通过 `ready` 事件及 exposed `resize()`、`setOption()`、`dispose()` 提供高级访问。

<ComponentPreview title="FChart 声明式图表" status="独立可用" description="文档站使用 SVG 模拟 option、加载状态和尺寸变化；生成项目会创建并释放真实 ECharts 实例。">
  <ChartPreview />
</ComponentPreview>

### FTree

`FTree` 适合文件层级、CMS 树与权限 token 编辑。`selectedKeys` 和 `checkedKeys` 是独立模型；勾选默认级联，`check-strictly` 关闭级联，`select-all` 提供根级全选。

```vue
<FTree
  :data="nodes"
  checkable
  selectable
  select-all
  default-expand-all
  v-model:selected-keys="selectedKeys"
  v-model:checked-keys="checkedKeys"
/>
```

节点必须使用稳定且全局唯一的 `key`。`disabled` 或 `checkable: false` 的节点不会进入级联与全选计算。

<ComponentPreview title="FTree 选择与勾选" status="独立可用" description="示例演示展开、选中与级联勾选：勾选父节点会同时选中其所有子节点，部分选中时父节点呈现半选状态。">
  <TreePreview />
</ComponentPreview>

### FTypography

`FTypography` 输出语义 HTML：`header="1"` 到 `header="6"` 对应 `h1` 到 `h6`；`paragraphy` 对应 `p`。段落可使用多行截断和可访问的展开按钮。

```vue
<FTypography :header="2">部署概览</FTypography>
<FTypography paragraphy type="secondary">
  这里是可换行的说明文字。
</FTypography>
<FTypography paragraphy :ellipsis="{ rows: 3, expandable: true }">
  很长的正文内容。
</FTypography>
```

`type` 支持 `default`、`secondary`、`success`、`warning`、`danger`；`spacing` 支持 `block`（默认）与 `none`。

<ComponentPreview title="FTypography 语义排版" status="独立可用" description="切换文字类型、截断行数并展开段落，查看 FTypography 的公开行为。">
  <TypographyPreview />
</ComponentPreview>

## 操作与输入

<ComponentPreview title="按钮、表单项与输入控件" status="独立可用" description="文档站本地预览展示生成项目中常见的表单编排与交互状态。">
  <FormControlsPreview />
</ComponentPreview>

基础组件可直接组合；需要 label、帮助文本与错误状态时，再使用 `FFormItem` 包装：

```vue
<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import FFormItem from '@/components/ui/FFormItem.vue'
</script>

<template>
  <FFormItem id="email" label="邮箱" required help="用于接收通知">
    <template #default="field">
      <Input :id="field.id" v-model="email" type="email" :aria-describedby="field.describedBy" />
    </template>
  </FFormItem>

  <Textarea v-model="description" />
  <Checkbox v-model="enabled" />
  <Button :disabled="!canSave" @click="save">保存</Button>
</template>
```

`FFormItem` 的默认 slot 会提供 `id` 与 `describedBy`，用于保持 label、help、error 和表单控件之间的可访问关联。

## 内容与反馈

<ComponentPreview title="面板、加载、结果、进度与代码块" status="独立可用" description="拖动进度滑块或折叠代码块，查看内容状态组件的基本表现。">
  <FeedbackPreview />
</ComponentPreview>

```vue
<FPanel>
  <h2>最近部署</h2>
  <FSpinner label="正在加载" />
</FPanel>

<FResult tone="success" title="部署成功" description="版本已经可以访问。">
  <FButton>打开项目</FButton>
</FResult>

<FProgress :value="progress" :max="100" show-label />
<FCode :code="source" lang="ts" />
```

`FCode` 使用生成项目中的代码高亮能力提供复制与折叠；`FMarkdown` 位于 `components/markdown`，其代码块复用 `FCode`。

## 浮层

<ComponentPreview title="Popover、Dropdown 与 Sheet" status="独立可用" description="这些浮层通过 v-model:open 受控；示例支持点击关闭和 Escape 关闭。">
  <FloatingLayersPreview />
</ComponentPreview>

```vue
<FPopover v-model:open="notificationOpen" :width="340">
  <template #trigger>
    <FButton aria-label="打开通知">通知</FButton>
  </template>
  <NotificationsPanel />
</FPopover>

<FDropdown v-model:open="menuOpen">
  <template #trigger><FButton variant="ghost">更多</FButton></template>
  <button type="button" @click="edit">编辑</button>
</FDropdown>

<FSheet v-model:open="settingsOpen" label="设置">
  <SettingsPanel />
</FSheet>
```

实际浮层组件会在生成项目中处理定位、Teleport、body 滚动和键盘关闭等运行时行为；示例只覆盖使用方式。

## 需要运行时上下文

<ComponentPreview title="Tabs、Toast 与 Fullscreen" status="需要运行时上下文" description="这里用文档站本地状态模拟运行时行为，不接入生成项目的 i18n、Toast store 或浏览器全屏窗口。">
  <RuntimeContextPreview />
</ComponentPreview>

- `FTabs` 的条目使用 `{ key, labelKey, count? }`，生成项目通过 Vue I18n 解析 `labelKey`。
- `FToastHost` 需要与 `useToast()` 配合，并挂载到应用根组件中。
- `FFullscreen` 调用浏览器 Fullscreen API，可能受到浏览器权限、用户手势或 iframe 配置限制。

```vue
<!-- App.vue：FToastHost 应位于应用根级别 -->
<FToastHost />
<RouterView />

<FTabs v-model="activeTab" :items="[
  { key: 'overview', labelKey: 'tabs.overview' },
  { key: 'activity', labelKey: 'tabs.activity', count: 3 },
]" />
```

## 可选上传

<ComponentPreview title="Upload 与 UploadProgress" status="可选集成" description="本地选择文件并模拟进度；不会上传文件，也不会调用 Fluffy OSS。">
  <UploadPreview />
</ComponentPreview>

`FUpload` 和 `FUploadProgress` 只在创建项目时选择 `--fluffy-oss` 后生成。它们使用 Pinia 的 upload store 管理任务；没有完整 OSS 配置时，生成项目的上传 UI 会降级为本地模拟上传。

```bash
npx @fluffy-design-pro/cli@latest my-admin --fluffy-oss
```

继续阅读：[Fluffy 生态集成](/guide/integrations) · [组合式函数](/guide/composables)

## 使用边界

Fluffy Design Pro 提供两条明确的使用路径：CLI 生成项目保留本地组件源码，可按业务修改；公共 `@fluffy-design-pro/ui` 包则供非 Fluffy 项目通过显式子路径复用首批组件。前者不依赖公共包，后续模板迁移会根据 `.fluffy/manifest.json` 的 owner 与 hash 判断哪些本地文件可受控更新。
