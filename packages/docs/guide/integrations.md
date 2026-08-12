---
title: Fluffy 生态集成
description: 按需接入 Fluffy OSS、Fluffy Log Trace Browser SDK 与 Chat Assistant。
---

# Fluffy 生态集成

Fluffy OSS 与 Fluffy Log Trace Browser SDK 是 CLI 的可选生成集成：未选择时，生成项目不会添加对应的依赖、初始化模块、环境变量示例或开发代理。Chat Assistant 则是独立发布的 Vue 3 包，可按应用需要安装。

## Fluffy OSS

启用上传 SDK 与上传任务中心。组件的交互边界可参考[上传组件预览](/guide/components#可选上传)：

```bash
npx @fluffy-design-pro/cli@latest my-admin --fluffy-oss
```

也可以直接提供接入地址或开发代理目标；这些参数会隐含启用 OSS 集成：

```bash
npx @fluffy-design-pro/cli@latest my-admin \
  --fluffy-oss-url https://oss.example.com/api \
  --fluffy-oss-proxy http://localhost:8787
```

生成后，项目包含 OSS 集成模块、类型化环境变量读取和基于 `f-popover` 的上传任务监控中心。SDK 配置齐备时走真实上传；未配置时，`FUpload` 会使用本地模拟上传，便于先预览界面。

## Fluffy Log Trace Browser SDK

```bash
npx @fluffy-design-pro/cli@latest my-admin --fluffy-log
```

设置接入地址或开发代理：

```bash
npx @fluffy-design-pro/cli@latest my-admin \
  --fluffy-log-url https://log.example.com/api \
  --fluffy-log-proxy http://localhost:8788
```

入口会在应用启动时根据配置初始化。具体服务端地址、appId 与 credential 请由部署环境提供，不要将 secret 提交到仓库。

## Fluffy Chat Assistant

[`@fluffy-design-pro/chat-assistant`](https://www.npmjs.com/package/@fluffy-design-pro/chat-assistant) 是适用于 Vue 3 的浮动 AI 助手组件。它提供应用控制的 SSE 流式回答、Markdown、工具调用和引用展示、视口内拖拽与内部全屏布局，以及浏览器 IndexedDB 本地会话历史。

```bash
pnpm add @fluffy-design-pro/chat-assistant
```

该包要求 `vue@^3.5.0`。在应用入口显式导入样式，并将组件接到应用自己的受保护网关：

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
const transport = createGatewayTransport({ endpoint: '/api/ai/responses' })
const request: Omit<UnifiedChatRequest, 'messages' | 'stream'> = {
  model: 'your-model-id',
  capability: 'chat',
}
</script>

<template>
  <ChatAssistant v-model:open="open" :transport="transport" :request="request">
    <template #trigger="{ open: openAssistant }">
      <button type="button" @click="openAssistant">询问 AI</button>
    </template>
  </ChatAssistant>
</template>
```

`createGatewayTransport()` 会向网关发送 JSON `POST` 请求并强制 `stream: true`；网关必须返回 `Content-Type: text/event-stream` 的响应流。网关应承担认证、授权、限流、审计和上游模型调用；**不要将模型供应商的长期 API key、上游凭据或可直接访问上游服务的权限放进浏览器代码。**

完整的 props、事件、暴露方法、传输选项、SSE 事件与类型说明见 [Chat Assistant README](https://github.com/FluffyChi-Xing/fluffy-design-pro/tree/master/packages/chat-assistant#readme)。

## 配置原则

- 公开地址可以写入 `.env.example`，secret 放入本地或部署平台的 secret 管理。
- 使用路径前缀作为接入地址时，开发环境代理会根据对应的 `VITE_FLUFFY_*_PROXY_TARGET` 转发。
- Chat Assistant 的会话历史保存在当前浏览器配置文件与源站的 IndexedDB 中，不会跨设备同步；是否启用应符合项目的隐私、保留和清理策略。
- 集成选项只影响生成结果，不会让 CLI 上传项目或自动调用云端部署服务。
