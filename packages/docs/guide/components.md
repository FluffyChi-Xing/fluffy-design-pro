---
title: 组件预览
description: 查看生成项目中的 f- 前缀组件、运行时前提与交互示例。
---

<script setup>
import ComponentPreview from '../.vitepress/theme/components/ComponentPreview.vue'
import FormControlsPreview from '../.vitepress/theme/components/previews/FormControlsPreview.vue'
import FeedbackPreview from '../.vitepress/theme/components/previews/FeedbackPreview.vue'
import FloatingLayersPreview from '../.vitepress/theme/components/previews/FloatingLayersPreview.vue'
import RuntimeContextPreview from '../.vitepress/theme/components/previews/RuntimeContextPreview.vue'
import UploadPreview from '../.vitepress/theme/components/previews/UploadPreview.vue'
</script>

# 组件预览

Fluffy Design Pro 的组件源码会随 CLI 生成到项目中，而不是从一个独立发布的 UI npm 包导入。生成项目中的典型导入方式是：

```vue
<script setup lang="ts">
import FButton from '@/components/ui/FButton.vue'
</script>

<template>
  <FButton variant="secondary">保存草稿</FButton>
</template>
```

::: tip 预览说明
下面的交互示例由文档站独立实现，用于演示生成组件的公开行为和使用方式；它们不是从生成模板直接打包或导入的组件。实际项目中的实现以生成项目源码为准。
:::

## 组件目录

| 分组 | 组件 | 运行时前提 |
| --- | --- | --- |
| 操作与输入 | `FButton`、`FInput`、`FTextarea`、`FSelect`、`FCheckbox`、`FFormItem` | 独立可用 |
| 内容与状态 | `FPanel`、`FSpinner`、`FSkeleton`、`FResult`、`FProgress`、`FCode` | 独立可用 |
| 浮层 | `FPopover`、`FDropdown`、`FSheet` | 需要浏览器 DOM 定位 |
| 运行时 | `FTabs`、`FToastHost`、`FFullscreen` | 需要生成项目的 i18n、composable 或浏览器 API |
| 可选上传 | `FUpload`、`FUploadProgress` | 选择 `--fluffy-oss` 后生成，并依赖 Pinia upload store |
| 其他目录 | `FForm`、`FMarkdown` | 分别位于 `components/form`、`components/markdown` |

## 操作与输入

<ComponentPreview title="按钮、表单项与输入控件" status="独立可用" description="对应 FButton、FFormItem、FInput、FTextarea、FSelect 和 FCheckbox 的基本交互。">
  <FormControlsPreview />
</ComponentPreview>

常见 API：

```vue
<FButton variant="primary" :loading="saving" :disabled="!canSave" @click="save">
  保存
</FButton>

<FFormItem id="email" label="邮箱" required help="用于接收通知">
  <template #default="field">
    <FInput
      :id="field.id"
      v-model="email"
      type="email"
      :aria-describedby="field.describedBy"
    />
  </template>
</FFormItem>

<FSelect v-model="role" :options="[
  { label: 'Editor', value: 'editor' },
  { label: 'Viewer', value: 'viewer' },
]" />
<FCheckbox v-model="enabled" />
<FTextarea v-model="description" :rows="4" />
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
npx create-fluffy-design-pro@latest my-admin --fluffy-oss
```

继续阅读：[Fluffy 生态集成](/guide/integrations) · [组合式函数](/guide/composables)

## 使用边界

这些组件是生成到项目中的源码，不是当前可以直接 `npm install` 的独立组件包。你可以在生成项目中按业务修改它们；后续模板迁移会根据 `.fluffy/manifest.json` 的 owner 与 hash 判断哪些文件可受控更新。
