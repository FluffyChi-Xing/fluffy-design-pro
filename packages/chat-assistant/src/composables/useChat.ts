import { computed, onBeforeUnmount, readonly, shallowRef } from 'vue'
import { reduceChatState, initialChatState } from '../state/reducer'
import { asChatError } from '../transport/errors'
import { ChatError, type ChatMessage, type ChatState } from '../types/chat'
import type { GatewaySseEvent, UnifiedChatRequest } from '../types/gateway'
import type { ChatTransport } from '../transport/gateway'

export interface UseChatOptions {
  transport: ChatTransport
  request: Omit<UnifiedChatRequest, 'messages' | 'stream'>
  initialMessages?: ChatMessage[]
}

function createId(prefix: string) {
  return `${prefix}_${crypto.randomUUID()}`
}

function toRequestMessages(messages: ChatMessage[]): UnifiedChatRequest['messages'] {
  return messages.map((message) => ({
    role: message.role,
    content: message.content,
  })) as UnifiedChatRequest['messages']
}

export function useChat(options: UseChatOptions) {
  const initialState: ChatState = {
    ...initialChatState,
    messages: options.initialMessages ?? [],
  }
  const state = shallowRef<ChatState>(initialState)
  const controller = shallowRef<AbortController>()

  const isStreaming = computed(() => state.value.status === 'streaming')
  const messages = computed(() => state.value.messages)

  function dispatchEvent(event: GatewaySseEvent) {
    state.value = reduceChatState(state.value, { type: 'event', event })
  }

  async function send(text: string) {
    const trimmed = text.trim()
    if (!trimmed || isStreaming.value) return

    const createdAt = Date.now()
    state.value = reduceChatState(state.value, {
      type: 'submit',
      text: trimmed,
      userMessageId: createId('user'),
      assistantMessageId: createId('assistant'),
      createdAt,
    })

    const activeController = new AbortController()
    controller.value = activeController

    try {
      const request: UnifiedChatRequest = {
        ...options.request,
        messages: toRequestMessages(state.value.messages),
        stream: true,
      }

      for await (const event of options.transport.stream(request, { signal: activeController.signal })) {
        dispatchEvent(event)
      }

      if (state.value.status === 'streaming') {
        throw new ChatError('The gateway stream ended before a terminal event.', { kind: 'protocol' })
      }
    } catch (error) {
      if (state.value.status === 'streaming') {
        state.value = reduceChatState(state.value, { type: 'failed', error: asChatError(error) })
      }
    } finally {
      if (controller.value === activeController) controller.value = undefined
    }
  }

  function stop() {
    controller.value?.abort()
  }

  function clear() {
    if (isStreaming.value) stop()
    state.value = initialChatState
  }

  function reset(messages: ChatMessage[] = []) {
    if (isStreaming.value) stop()
    state.value = { ...initialChatState, messages }
  }

  onBeforeUnmount(stop)

  return {
    state: readonly(state),
    messages,
    isStreaming,
    send,
    stop,
    clear,
    reset,
  }
}
