<script setup lang="ts">
import { computed, nextTick, shallowRef, useTemplateRef, watch } from 'vue'
import { MessageCircle } from 'lucide-vue-next'
import { useChat } from '../composables/useChat'
import { useChatSessions } from '../composables/useChatSessions'
import { useFloatingWindow } from '../composables/useFloatingWindow'
import type { ChatMessage, ChatError } from '../types/chat'
import type { ToolCall, UnifiedChatRequest, UnifiedChatResponse } from '../types/gateway'
import type { ChatTransport } from '../transport/gateway'
import ChatWindow from './ChatWindow.vue'

interface Props {
  transport: ChatTransport
  request?: Omit<UnifiedChatRequest, 'messages' | 'stream'>
  initialMessages?: ChatMessage[]
  title?: string
  placeholder?: string
  zIndex?: number
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  request: () => ({}),
  initialMessages: () => [],
  title: 'AI 助手',
  placeholder: '请输入你遇到的问题…',
  zIndex: 1000,
})

const emit = defineEmits<{
  error: [error: ChatError]
  response: [response: UnifiedChatResponse]
  toolCall: [toolCall: ToolCall]
}>()

const open = defineModel<boolean>('open', { default: false })
const messagesModel = defineModel<ChatMessage[]>('messages')
const trigger = useTemplateRef<HTMLElement>('trigger')
const lastResponse = shallowRef<UnifiedChatResponse>()
const historyOpen = shallowRef(false)
const { state, messages, isStreaming, send, stop, reset } = useChat({
  transport: props.transport,
  request: props.request,
  initialMessages: props.initialMessages,
})
const sessions = useChatSessions({
  messages,
  initialMessages: props.initialMessages,
  reset,
  stop,
})
const floating = useFloatingWindow()

const windowStyle = computed(() => ({
  ...floating.style.value,
  zIndex: String(props.zIndex),
}))

watch(messages, (value) => {
  messagesModel.value = value
}, { deep: true })

watch(() => state.value.error, (error) => {
  if (error) emit('error', error)
})

watch(messages, (value) => {
  const current = value.at(-1)
  if (!current?.responseId || current.status !== 'completed') return
  if (lastResponse.value?.id === current.responseId) return
  const response: UnifiedChatResponse = {
    id: current.responseId,
    model: current.model ?? '',
    content: current.content,
    finishReason: current.finishReason ?? 'stop',
    usage: current.usage ?? { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
    citations: current.citations,
    requestId: current.requestId ?? '',
    createdAt: current.createdAt,
  }
  lastResponse.value = response
  emit('response', response)
  for (const block of response.content) {
    if (block.type === 'tool_call') emit('toolCall', block)
  }
}, { deep: true })

async function openAssistant() {
  open.value = true
  await nextTick()
}

function closeAssistant() {
  historyOpen.value = false
  open.value = false
  nextTick(() => trigger.value?.focus())
}

function toggle() {
  if (open.value) closeAssistant()
  else void openAssistant()
}

function clearConversation() {
  sessions.clearActive()
  lastResponse.value = undefined
}

function createConversation() {
  sessions.newChat()
  historyOpen.value = false
  lastResponse.value = undefined
}

function selectConversation(id: string) {
  sessions.selectSession(id)
  historyOpen.value = false
  lastResponse.value = undefined
}

defineExpose({
  open: openAssistant,
  close: closeAssistant,
  toggle,
  send,
  stop,
  clear: clearConversation,
})
</script>

<template>
  <span ref="trigger" class="fca-trigger-root">
    <slot name="trigger" :open="openAssistant" :close="closeAssistant" :toggle="toggle">
      <button class="fca-default-trigger" type="button" aria-label="打开 AI 助手" @click="openAssistant">
        <MessageCircle :size="23" />
      </button>
    </slot>
  </span>
  <ChatWindow
    :open="open"
    :title="props.title"
    :messages="messages"
    :sessions="sessions.sessions.value"
    :active-session-id="sessions.activeSessionId.value"
    :streaming="isStreaming"
    :fullscreen="floating.fullscreen.value"
    :dragging="floating.dragging.value"
    :history-open="historyOpen"
    :window-style="windowStyle"
    :disabled="props.disabled"
    :placeholder="props.placeholder"
    @close="closeAssistant"
    @clear="clearConversation"
    @new-chat="createConversation"
    @select-session="selectConversation"
    @toggle-history="historyOpen = !historyOpen"
    @close-history="historyOpen = false"
    @send="send"
    @stop="stop"
    @toggle-fullscreen="floating.toggleFullscreen"
    @drag-start="floating.startDrag"
  />
</template>
