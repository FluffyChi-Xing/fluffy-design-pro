---
title: 组合式函数
description: 介绍生成项目中的 useLoading、useToast、useForm、useTable 等 Vue composables。
---

# 组合式函数

生成项目把后台常见的状态与浏览器行为放在 `src/composables`，在页面或组件中通过 `@/composables/...` 引入。它们是生成项目的本地源码，不是独立的公共 npm 包。

## 快速选择

| 需求 | 使用 |
| --- | --- |
| 管理异步 loading | `useLoading` |
| 显示成功、警告和错误反馈 | `useToast`，配合 [`FToastHost`](/guide/components) |
| 配置字段、校验和提交 | `useForm`，配合 `FForm` / `FFormItem` |
| 本地或请求模式表格 | `useTable` |
| 管理 ECharts 生命周期 | `useChart` |
| 调用浏览器全屏 | `useFullscreen`，配合 `FFullscreen` |
| 管理锚定浮层定位 | `useFloatingMenu`，被 `FPopover` / `FDropdown` / `FSheet` 使用 |

## useLoading

```ts
const { loading, run, setLoading } = useLoading()

await run(async () => {
  await saveProject()
})
```

- `loading`：只读的 loading 状态；
- `run(task)`：执行异步任务，并在任务结束后恢复状态；并发任务会统一计数；
- `setLoading(value)`：手动设置 loading。

适合页面提交、刷新和多个并行请求的统一状态。不要在模板中重复维护同一个请求的 loading。

## useToast

```ts
const { success, info, warning, error, dismiss, clear, toasts } = useToast()

success('项目已保存')
warning('还有未完成配置')
```

`toasts` 是共享的只读状态；`success`、`info`、`warning`、`error` 创建消息；`dismiss` 关闭单条消息；`clear` 清空全部消息。要让消息实际出现在界面中，需要在根组件挂载 `FToastHost`：

```vue
<FToastHost />
<RouterView />
```

## useForm

```ts
const form = useForm(
  { name: '', role: 'editor' },
  [
    { field: 'name', labelKey: 'form.name', type: 'text', required: true },
    {
      field: 'role',
      labelKey: 'form.role',
      type: 'select',
      options: [{ label: 'Editor', value: 'editor' }],
    },
  ],
)

const valid = await form.validate()
if (valid) await submit(form.values)
```

返回值包括：

- `values`：当前表单值；
- `errors`：字段错误；
- `touched`：字段是否交互过；
- `isValid`：当前表单是否有效；
- `validateField(field)`、`validate()`：校验单个字段或整个表单；
- `reset()`：恢复初始值；
- `submit(handler)`：校验通过后执行提交处理器。

字段配置使用 `FormColumn`，支持 `required`、`pattern`、同步 `validate`、`options`、`visible`、`disabled` 和 `span`。生成模板中的错误和 label 通常使用 Vue I18n key。

## useTable

```ts
const table = useTable({
  source: [
    { id: 'p-1', name: 'Console', status: 'active' },
  ],
  pageSize: 10,
})

table.setPage(2)
table.setPageSize(20)
await table.reload()
```

常用返回值：`columns`、`source`、`rows`、`total`、`loading`、`error`、`query`、`pagination`、`pageCount`、`fetch`、`reload`、`reset`、`setSource`、`setPage` 和 `setPageSize`。

`useTable` 支持本地数据源和请求数据模式。请求模式应把服务端结果归一化为 `{ rows, total }`，这样分页 UI 不需要了解后端协议。需要避免在模板中直接对原始数组重复 filter/sort，优先使用 composable 返回的派生 `rows`。

## FChart

普通图表优先使用声明式组件；`echarts` 已包含在 core 模板依赖中，`modules` 只注册实际使用的 ECharts 模块。

```vue
<FChart
  :option="trafficOption"
  :modules="[LineChart, GridComponent, TooltipComponent, CanvasRenderer]"
  height="320px"
/>
```

`FChart` 管理实例创建、option 更新、ResizeObserver 与 dispose，并通过 `ready` 事件和 exposed `resize()` / `setOption()` / `dispose()` 提供高级访问。`modules` 必须只传当前图表实际使用的 ECharts 图表、组件和 renderer；不要导入完整 ECharts 包。

## useChart

```ts
const chartElement = ref<HTMLElement | null>(null)
const chart = useChart(chartElement, {
  modules: [BarChart, GridComponent, TooltipComponent, CanvasRenderer],
  option: chartOption,
  autoresize: true,
})

chart.setOption(nextOption)
```

`useChart` 管理 ECharts 实例的创建、配置更新、resize 和 dispose。它依赖生成项目中的 `echarts/core` 与浏览器 `ResizeObserver`；不要在 SSR 或模块顶层直接创建图表实例。组件卸载时 composable 负责释放实例。

## useFullscreen

```ts
const { isFullscreen, toggleFullscreen } = useFullscreen()

await toggleFullscreen()
```

它封装浏览器 Fullscreen API，并暴露 `isFullscreen` 与 `toggleFullscreen`。调用必须发生在用户手势中；生产页面应考虑浏览器不支持或请求被拒绝的情况，并配合 [`FFullscreen`](/guide/components) 使用。

## useFloatingMenu

```ts
const open = ref(false)
const anchor = ref<HTMLElement | null>(null)
const panel = ref<HTMLElement | null>(null)
const { panelStyle, close, position } = useFloatingMenu(open, anchor, panel, 220, 8)
```

它根据锚点和面板 DOM ref 计算浮层位置，返回 `panelStyle`、`close` 和 `position`。内部处理重新定位、窗口变化、Escape 与点击外部等生命周期事件。多数业务代码应直接使用 `FPopover`、`FDropdown` 或 `FSheet`，只有需要自定义浮层时才直接使用它。

::: tip 状态最小化
composable 只保留会变化的源状态，排序、分页计数和可见性等值应通过 `computed` 派生。浏览器对象、监听器和 ResizeObserver 必须在组件生命周期内创建并清理。
:::
