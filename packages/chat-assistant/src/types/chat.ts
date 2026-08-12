import type {
  Citation,
  ContentBlock,
  GatewayErrorPayload,
  UnifiedChatResponse,
  Usage,
} from './gateway'

export type ChatMessageRole = 'user' | 'assistant'
export type ChatMessageStatus = 'pending' | 'streaming' | 'completed' | 'cancelled' | 'error'

export interface ChatMessage {
  id: string
  role: ChatMessageRole
  content: ContentBlock[]
  status: ChatMessageStatus
  createdAt: number
  responseId?: string
  model?: string
  citations?: Citation[]
  usage?: Usage
  finishReason?: UnifiedChatResponse['finishReason']
  requestId?: string
  error?: ChatError
}

export interface ChatSession {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: number
  updatedAt: number
}

export interface PersistedChatError {
  message: string
  kind: ChatError['kind']
  payload?: GatewayErrorPayload
}

export interface PersistedChatMessage extends Omit<ChatMessage, 'error'> {
  error?: PersistedChatError
}

export interface PersistedChatSession extends Omit<ChatSession, 'messages'> {
  messages: PersistedChatMessage[]
}

export interface ChatState {
  status: 'idle' | 'streaming' | 'completed' | 'cancelled' | 'error'
  messages: ChatMessage[]
  activeMessageId?: string
  responseId?: string
  metadata?: Record<string, unknown>
  error?: ChatError
}

export class ChatError extends Error {
  readonly payload?: GatewayErrorPayload
  readonly kind: 'network' | 'http' | 'protocol' | 'aborted'

  constructor(
    message: string,
    options: {
      kind: ChatError['kind']
      payload?: GatewayErrorPayload
      cause?: unknown
    },
  ) {
    super(message, { cause: options.cause })
    this.name = 'ChatError'
    this.kind = options.kind
    this.payload = options.payload
  }
}

export function deriveChatSessionTitle(messages: ChatMessage[]) {
  const firstUserText = messages
    .find((message) => message.role === 'user')
    ?.content
    .filter((block): block is Extract<ChatMessage['content'][number], { type: 'text' }> => block.type === 'text')
    .map((block) => block.text)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (!firstUserText) return '新对话'
  return firstUserText.length > 48 ? `${firstUserText.slice(0, 48)}…` : firstUserText
}

export function serializeChatMessage(message: ChatMessage): PersistedChatMessage {
  const { error, ...persisted } = message
  return {
    ...persisted,
    status: message.status === 'streaming' || message.status === 'pending' ? 'cancelled' : message.status,
    error: error ? { message: error.message, kind: error.kind, payload: error.payload } : undefined,
  }
}

export function deserializeChatMessage(message: PersistedChatMessage): ChatMessage {
  return {
    ...message,
    error: message.error ? new ChatError(message.error.message, { kind: message.error.kind, payload: message.error.payload }) : undefined,
  }
}
