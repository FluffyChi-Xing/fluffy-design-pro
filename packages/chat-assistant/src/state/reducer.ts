import { ChatError, type ChatMessage, type ChatState } from '../types/chat'
import type { ContentBlock, GatewaySseEvent, UnifiedChatResponse } from '../types/gateway'

export type ChatAction =
  | { type: 'submit'; text: string; userMessageId: string; assistantMessageId: string; createdAt: number }
  | { type: 'event'; event: GatewaySseEvent }
  | { type: 'failed'; error: ChatError }
  | { type: 'reset' }

export const initialChatState: ChatState = {
  status: 'idle',
  messages: [],
}

function activeAssistant(state: ChatState): ChatMessage {
  const message = state.messages.find((item) => item.id === state.activeMessageId)
  if (!message || message.role !== 'assistant') {
    throw new ChatError('Received a stream event without an active assistant message.', { kind: 'protocol' })
  }
  return message
}

function replaceMessage(state: ChatState, message: ChatMessage): ChatState {
  return {
    ...state,
    messages: state.messages.map((item) => item.id === message.id ? message : item),
  }
}

function replaceBlock(message: ChatMessage, index: number, block: ContentBlock): ChatMessage {
  const content = [...message.content]
  content[index] = block
  return { ...message, content }
}

function applyResponse(message: ChatMessage, response: UnifiedChatResponse): ChatMessage {
  return {
    ...message,
    content: response.content,
    status: 'completed',
    responseId: response.id,
    model: response.model,
    citations: response.citations,
    usage: response.usage,
    finishReason: response.finishReason,
    requestId: response.requestId,
  }
}

function terminalState(state: ChatState, status: 'completed' | 'cancelled' | 'error', message: ChatMessage): ChatState {
  return {
    ...replaceMessage(state, message),
    status,
    activeMessageId: undefined,
    responseId: undefined,
  }
}

function assertStreaming(state: ChatState) {
  if (state.status !== 'streaming') {
    throw new ChatError('Received an SSE event after the stream finished.', { kind: 'protocol' })
  }
}

export function reduceChatState(state: ChatState, action: ChatAction): ChatState {
  if (action.type === 'reset') return initialChatState

  if (action.type === 'submit') {
    if (state.status === 'streaming') throw new ChatError('A chat response is already streaming.', { kind: 'protocol' })

    const userMessage: ChatMessage = {
      id: action.userMessageId,
      role: 'user',
      content: [{ type: 'text', text: action.text }],
      status: 'completed',
      createdAt: action.createdAt,
    }
    const assistantMessage: ChatMessage = {
      id: action.assistantMessageId,
      role: 'assistant',
      content: [],
      status: 'streaming',
      createdAt: action.createdAt,
    }

    return {
      status: 'streaming',
      messages: [...state.messages, userMessage, assistantMessage],
      activeMessageId: assistantMessage.id,
    }
  }

  if (action.type === 'failed') {
    const message = activeAssistant(state)
    return terminalState(state, action.error.kind === 'aborted' ? 'cancelled' : 'error', {
      ...message,
      status: action.error.kind === 'aborted' ? 'cancelled' : 'error',
      error: action.error,
    })
  }

  assertStreaming(state)
  const { event } = action
  const message = activeAssistant(state)

  if (event.type === 'response.created') {
    return replaceMessage(state, {
      ...message,
      responseId: event.response.id,
      model: event.response.model,
    })
  }

  if (event.type === 'response.metadata') {
    return { ...state, metadata: event.metadata }
  }

  if (event.type === 'content_block.start') {
    if (message.content[event.index]) {
      throw new ChatError(`Content block ${event.index} already exists.`, { kind: 'protocol' })
    }
    return replaceMessage(state, replaceBlock(message, event.index, event.block))
  }

  if (event.type === 'content_block.delta') {
    const block = message.content[event.index]
    if (!block) throw new ChatError(`Content block ${event.index} was not started.`, { kind: 'protocol' })

    if (event.delta.type === 'text_delta') {
      if (block.type !== 'text') throw new ChatError('Received text delta for a non-text block.', { kind: 'protocol' })
      return replaceMessage(state, replaceBlock(message, event.index, {
        ...block,
        text: block.text + event.delta.text,
      }))
    }

    if (block.type !== 'tool_call') throw new ChatError('Received tool delta for a non-tool block.', { kind: 'protocol' })
    return replaceMessage(state, replaceBlock(message, event.index, {
      ...block,
      id: event.delta.toolCallId,
      name: event.delta.name,
      arguments: { __raw: `${String(block.arguments.__raw ?? '')}${event.delta.arguments}` },
    }))
  }

  if (event.type === 'content_block.done') {
    return replaceMessage(state, replaceBlock(message, event.index, event.block))
  }

  if (event.type === 'response.completed') {
    return terminalState(state, 'completed', applyResponse(message, event.response))
  }

  if (event.type === 'response.cancelled') {
    return terminalState(state, 'cancelled', {
      ...message,
      status: 'cancelled',
      responseId: event.response.id,
      usage: event.response.usage,
    })
  }

  return terminalState(state, 'error', {
    ...message,
    status: 'error',
    error: new ChatError(event.error.message, { kind: 'protocol', payload: event.error }),
  })
}
