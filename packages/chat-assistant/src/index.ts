import './style.css'

export { default as ChatAssistant } from './components/ChatAssistant.vue'
export { createGatewayTransport } from './transport/gateway'
export type { ChatTransport, GatewayTransportOptions } from './transport/gateway'
export { ChatError, deriveChatSessionTitle } from './types/chat'
export type {
  ChatMessage,
  ChatMessageRole,
  ChatMessageStatus,
  ChatSession,
  ChatState,
  PersistedChatError,
  PersistedChatMessage,
  PersistedChatSession,
} from './types/chat'
export type {
  Annotation,
  Citation,
  ContentBlock,
  ContentDelta,
  GatewayErrorPayload,
  GatewaySseEvent,
  ToolCall,
  UnifiedChatRequest,
  UnifiedChatResponse,
  UnifiedMessage,
  UnifiedTool,
  Usage,
} from './types/gateway'
