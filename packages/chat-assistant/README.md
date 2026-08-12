# @fluffy-design-pro/chat-assistant

适用于 Vue 3 的浮动 AI 助手组件。它提供由应用控制的 SSE 流式传输、Markdown 回答、工具调用与引用展示、可拖拽/全屏聊天窗，以及基于 IndexedDB 的浏览器本地会话历史。

## 特性

- 通过统一网关协议使用 `fetch` + `text/event-stream` 流式输出，不依赖 `EventSource`。
- 支持文本、图片、文件、工具调用与工具结果内容块，以及引用和用量信息。
- 浮动窗口默认定位于右下角，拖动始终受视口边界约束，并支持边缘吸附。
- 浮动模式提供内部历史记录面板；全屏模式提供会话侧栏与聊天内容双栏布局。
- 会话自动保存到浏览器 IndexedDB；流式中的未完成消息在恢复时会安全标记为已取消，不能被错误地续传。
- 内置 `ChatError`、响应、工具调用事件与类型化网关传输 API。

## 安装

```bash
pnpm add @fluffy-design-pro/chat-assistant
```

该包要求 `vue@^3.5.0`。如果应用的构建配置不会自动保留包的 CSS 副作用，请在应用入口显式导入样式：

```ts
import '@fluffy-design-pro/chat-assistant/style.css'
```

## 快速开始

聊天组件只负责 UI、会话与流式状态。请让浏览器请求你自己的受保护网关，而不是在前端写入上游模型提供商的长期密钥。

```vue
<script setup lang="ts">
import { ref } from 'vue'
import {
  ChatAssistant,
  createGatewayTransport,
  type UnifiedChatRequest,
} from '@fluffy-design-pro/chat-assistant'
import '@fluffy-design-pro/chat-assistant/style.css'

const open = ref(false)

const transport = createGatewayTransport({
  endpoint: '/api/ai/responses',
  // 可选：为应用网关注入短期、应用签发的认证信息。
  headers: () => ({
    Authorization: `Bearer ${getShortLivedApplicationToken()}`,
  }),
  credentials: 'same-origin',
})

const request: Omit<UnifiedChatRequest, 'messages' | 'stream'> = {
  model: 'your-model-id',
  capability: 'chat',
}
</script>

<template>
  <ChatAssistant
    v-model:open="open"
    :transport="transport"
    :request="request"
    title="AI 助手"
    @error="console.error"
  >
    <template #trigger="{ open: openAssistant }">
      <button type="button" @click="openAssistant">询问 AI</button>
    </template>
  </ChatAssistant>
</template>
```

`createGatewayTransport()` 会向 `endpoint` 发送 JSON `POST` 请求，并强制附加 `stream: true`。网关必须返回 `Content-Type: text/event-stream` 的响应流。

> 不要把模型供应商的 API key、长期访问令牌或可直接调用上游服务的凭据放进浏览器代码。将它们保存在服务端，由你的网关执行认证、授权、速率控制和审计。

## 组件 API

### Props

| Prop | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `transport` | `ChatTransport` | — | 必填。由 `createGatewayTransport()` 创建，或由应用实现的流式传输。 |
| `request` | `Omit<UnifiedChatRequest, 'messages' \| 'stream'>` | `{}` | 每个请求使用的模型、能力与生成参数。消息和 `stream` 由组件管理。 |
| `initialMessages` | `ChatMessage[]` | `[]` | 本地存储为空时创建首个会话所使用的种子消息。 |
| `title` | `string` | `AI 助手` | 窗口标题。 |
| `placeholder` | `string` | `请输入你遇到的问题…` | 输入框占位文本。 |
| `zIndex` | `number` | `1000` | 浮动窗口层级。 |
| `disabled` | `boolean` | `false` | 禁用消息提交；历史记录与会话浏览仍可使用。 |

### Models

| Model | 类型 | 说明 |
| --- | --- | --- |
| `v-model:open` | `boolean` | 控制聊天窗的打开状态。 |
| `v-model:messages` | `ChatMessage[]` | 可选。同步当前活跃会话中的消息快照。 |

### Trigger 插槽

使用命名插槽替换默认圆形触发按钮。插槽属性为 `open`、`close` 与 `toggle`：

```vue
<ChatAssistant v-model:open="open" :transport="transport">
  <template #trigger="{ toggle }">
    <button type="button" @click="toggle">AI</button>
  </template>
</ChatAssistant>
```

### Events

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `error` | `ChatError` | 网络、HTTP、协议错误或取消错误。 |
| `response` | `UnifiedChatResponse` | 收到最终 `response.completed` 响应时触发。 |
| `toolCall` | `ToolCall` | 最终响应包含工具调用内容块时，对每个调用触发一次。 |

### 暴露的方法

通过模板 ref 获取组件实例后，可以调用：

| 方法 | 说明 |
| --- | --- |
| `open()` | 打开聊天窗。 |
| `close()` | 关闭聊天窗并把焦点还给触发器。 |
| `toggle()` | 切换打开状态。 |
| `send(text)` | 提交一条用户消息。 |
| `stop()` | 中止当前流式请求。 |
| `clear()` | 清空当前会话的消息，但保留该会话历史条目。 |

## 网关传输

`createGatewayTransport(options)` 创建默认 `ChatTransport`。

| 选项 | 类型 | 说明 |
| --- | --- | --- |
| `endpoint` | `string` | 必填。应用网关的响应流地址。 |
| `headers` | `HeadersInit \| () => HeadersInit \| Promise<HeadersInit>` | 可选请求头或异步请求头工厂。组件会补充 `Accept: text/event-stream` 与 JSON Content-Type。 |
| `credentials` | `RequestCredentials` | 可选的 fetch 凭据策略。 |
| `fetch` | `typeof globalThis.fetch` | 可选 fetch 实现，适合测试或运行时适配。 |

网关请求遵循 `UnifiedChatRequest`。除 `messages` 和 `stream` 外，可配置 `model`、`capability`、采样和 token 限制、系统提示词、函数工具、结构化输出、检索/意图开关与自定义元数据。

SSE 流支持以下事件：

- `response.created`
- `response.metadata`
- `content_block.start`
- `content_block.delta`
- `content_block.done`
- `response.completed`
- `response.cancelled`
- `error`

服务端应确保事件名与 JSON 数据中的 `type` 一致，并以 `response.completed`、`response.cancelled` 或 `error` 结束一条响应。非 2xx 响应、缺少 SSE Content-Type 或畸形事件会以 `ChatError` 暴露。

## 本地会话历史

聊天会话保存在当前浏览器的 IndexedDB 数据库 `fluffy-design-pro-chat-assistant` 中，并按最近更新时间恢复。存储仅属于当前浏览器配置文件和源站；它不会在用户设备之间同步。

请根据产品的隐私、保留和清理策略决定是否启用该行为。存储不可用时，组件会保留内存中的聊天能力，并通过恢复性错误状态处理持久化失败；不会阻止用户发送消息。

## 公共导出

```ts
import {
  ChatAssistant,
  ChatError,
  createGatewayTransport,
  deriveChatSessionTitle,
} from '@fluffy-design-pro/chat-assistant'

import type {
  ChatMessage,
  ChatSession,
  ChatState,
  ChatTransport,
  GatewayTransportOptions,
  UnifiedChatRequest,
  UnifiedChatResponse,
  GatewaySseEvent,
  ContentBlock,
  ToolCall,
  Citation,
  Usage,
} from '@fluffy-design-pro/chat-assistant'
```

额外导出的类型包括 `ChatMessageRole`、`ChatMessageStatus`、`PersistedChatError`、`PersistedChatMessage`、`PersistedChatSession`、`Annotation`、`ContentDelta`、`GatewayErrorPayload`、`UnifiedMessage` 与 `UnifiedTool`。

`ChatError.kind` 为 `network`、`http`、`protocol` 或 `aborted`。若网关返回结构化错误，`ChatError.payload` 会保留其错误载荷，便于应用在自己的错误边界中呈现或记录。

## 开发

```bash
pnpm --filter @fluffy-design-pro/chat-assistant check
pnpm --filter @fluffy-design-pro/chat-assistant test
pnpm --filter @fluffy-design-pro/chat-assistant build
```

## License

[MIT](https://github.com/FluffyChi-Xing/fluffy-design-pro/blob/master/LICENSE)
