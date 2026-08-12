import { ChatError } from '../types/chat'
import type { GatewayErrorPayload } from '../types/gateway'

export function asChatError(error: unknown): ChatError {
  if (error instanceof ChatError) return error

  if (error instanceof DOMException && error.name === 'AbortError') {
    return new ChatError('The response was cancelled.', { kind: 'aborted', cause: error })
  }

  if (error instanceof Error) {
    return new ChatError(error.message, { kind: 'network', cause: error })
  }

  return new ChatError('The chat request failed.', { kind: 'network', cause: error })
}

export function gatewayError(payload: GatewayErrorPayload, kind: 'http' | 'protocol' = 'http') {
  return new ChatError(payload.message, { kind, payload })
}
