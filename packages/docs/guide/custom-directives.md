---
title: 自定义指令
description: 了解当前模板的指令支持边界，以及如何在生成项目中添加应用自有指令。
---

# 自定义指令

::: warning 当前状态：没有内置自定义指令
当前 core 模板没有生成 `src/directives` 目录，也没有通过 `app.directive()` 注册任何自定义指令。`v-permission`、`v-loading`、`v-copy` 等名称都不是 Fluffy Design Pro 当前提供的 API。
:::

## 指令适合解决什么问题

Vue 指令适合处理低层 DOM 行为，例如聚焦、监听某个原生 DOM 事件或连接一个浏览器 observer。可复用 UI 应优先使用组件；包含状态、请求或业务规则的行为优先使用 composable。

指令不能替代服务端授权。即使某个按钮通过指令隐藏，真正的权限校验仍必须由服务端完成。

## 在应用中添加自己的指令

以下示例属于**应用自定义代码**，不是 CLI 生成代码。它创建一个进入页面后自动聚焦的 `v-focus`：

```ts
// src/directives/focus.ts
import type { Directive } from 'vue'

export const vFocus: Directive<HTMLElement> = {
  mounted(el) {
    el.focus()
  },
}
```

### 全局注册

如果项目中很多页面都需要它，可以在生成项目的 `main.ts` 中注册：

```ts
import { vFocus } from './directives/focus'

const app = createApp(App)
app.directive('focus', vFocus)
app.use(pinia).use(router).use(i18n).mount('#app')
```

之后可以在任意模板中使用：

```vue
<input v-focus type="search" placeholder="输入关键词" />
```

### 局部注册

如果只在一个组件中使用，可以避免改变全局应用：

```vue
<script setup lang="ts">
import type { Directive } from 'vue'

const vFocus: Directive<HTMLElement> = {
  mounted: (el) => el.focus(),
}
</script>

<template>
  <input v-focus type="text" />
</template>
```

## 事件与资源清理

如果指令添加了事件监听器、定时器或 `ResizeObserver`，必须在 `unmounted` 中清理，并把引用放在元素上或使用闭包保存：

```ts
const vTrackSize: Directive<HTMLElement> = {
  mounted(el) {
    const observer = new ResizeObserver(() => {
      el.dataset.size = `${el.offsetWidth}`
    })
    observer.observe(el)
    el.__sizeObserver = observer
  },
  unmounted(el) {
    el.__sizeObserver?.disconnect()
  },
}
```

上例中的 `__sizeObserver` 需要在项目中先扩展 HTMLElement 类型，或改用 `WeakMap<HTMLElement, ResizeObserver>` 保存实例。不要把未清理的监听器注册到长期存在的页面节点上。

## 未来兼容性

只有当某个指令实际进入 core 模板、拥有明确注册路径并完成生成项目测试后，才会在本页把它列为 Fluffy Design Pro 内置能力。当前请把所有自定义指令视为你的应用代码，并在项目内自行维护其类型、测试和升级。
