export type Annotation =
  | { type: 'citation'; citation: { id: string; source: string; score?: number } }
  | { type: 'url'; url: string }
  | { type: 'file'; file: { id: string; name: string } }

export type ContentBlock =
  | { type: 'text'; text: string; annotations?: Annotation[] }
  | { type: 'image'; url: string; mimeType?: string }
  | { type: 'file'; url: string; mimeType?: string; name?: string }
  | { type: 'tool_call'; id: string; name: string; arguments: Record<string, unknown> }
  | { type: 'tool_result'; toolCallId: string; content: string }

export interface ToolCall {
  id: string
  name: string
  arguments: Record<string, unknown>
}

export type UnifiedMessage =
  | { role: 'system'; content: string }
  | { role: 'user'; content: string | ContentBlock[] }
  | { role: 'assistant'; content: string | ContentBlock[]; toolCalls?: ToolCall[] }
  | { role: 'tool'; toolCallId: string; content: string }

export interface UnifiedTool {
  type: 'function'
  function: {
    name: string
    description?: string
    parameters: Record<string, unknown>
  }
}

export interface UnifiedChatRequest {
  model?: string
  capability?: string
  messages: UnifiedMessage[]
  stream?: boolean
  temperature?: number
  topP?: number
  maxTokens?: number
  stop?: string[]
  presencePenalty?: number
  frequencyPenalty?: number
  system?: string
  tools?: UnifiedTool[]
  toolChoice?: 'auto' | 'none' | 'required' | { type: 'function'; name: string }
  responseFormat?:
    | { type: 'json_schema'; schema: Record<string, unknown>; strict?: boolean }
    | { type: 'json_object' }
    | { type: 'text' }
  enableIntents?: boolean
  enableRetrieval?: boolean
  metadata?: Record<string, unknown>
}

export interface Citation {
  id: string
  source: string
  excerpt?: string
  score?: number
}

export interface Usage {
  inputTokens: number
  outputTokens: number
  totalTokens: number
  currency?: string
  cost?: string
}

export interface UnifiedChatResponse {
  id: string
  model: string
  content: ContentBlock[]
  finishReason: 'stop' | 'length' | 'tool_calls' | 'content_filter' | 'error'
  usage: Usage
  citations?: Citation[]
  requestId: string
  createdAt: number
}

export interface GatewayErrorPayload {
  type: string
  code: string
  message: string
  param?: string | null
  requestId?: string
  retryAfter?: number
  limitType?: 'rpm' | 'tpm' | 'concurrency' | 'budget'
  remaining?: number
}

export interface ResponseCreatedEvent {
  type: 'response.created'
  response: Pick<UnifiedChatResponse, 'id' | 'model' | 'createdAt'>
}

export interface ResponseMetadataEvent {
  type: 'response.metadata'
  metadata: Record<string, unknown>
}

export interface ContentBlockStartEvent {
  type: 'content_block.start'
  index: number
  block: ContentBlock
}

export type ContentDelta =
  | { type: 'text_delta'; text: string }
  | { type: 'tool_call_delta'; toolCallId: string; name: string; arguments: string }

export interface ContentBlockDeltaEvent {
  type: 'content_block.delta'
  index: number
  delta: ContentDelta
}

export interface ContentBlockDoneEvent {
  type: 'content_block.done'
  index: number
  block: ContentBlock
}

export interface ResponseCompletedEvent {
  type: 'response.completed'
  response: UnifiedChatResponse
}

export interface ResponseCancelledEvent {
  type: 'response.cancelled'
  response: Pick<UnifiedChatResponse, 'id' | 'usage'>
}

export interface GatewayErrorEvent {
  type: 'error'
  error: GatewayErrorPayload
}

export type GatewaySseEvent =
  | ResponseCreatedEvent
  | ResponseMetadataEvent
  | ContentBlockStartEvent
  | ContentBlockDeltaEvent
  | ContentBlockDoneEvent
  | ResponseCompletedEvent
  | ResponseCancelledEvent
  | GatewayErrorEvent
