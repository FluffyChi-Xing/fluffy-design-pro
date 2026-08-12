import { ChatError } from '../types/chat'
import type { GatewayErrorPayload, GatewaySseEvent, UnifiedChatRequest } from '../types/gateway'
import { gatewayError } from './errors'
import { decodeSseStream } from './sse'

export interface ChatTransport {
  stream(
    request: UnifiedChatRequest,
    options: { signal: AbortSignal },
  ): AsyncIterable<GatewaySseEvent>
}

export interface GatewayTransportOptions {
  endpoint: string
  headers?: HeadersInit | (() => HeadersInit | Promise<HeadersInit>)
  credentials?: RequestCredentials
  fetch?: typeof globalThis.fetch
}

async function resolveHeaders(source: GatewayTransportOptions['headers']): Promise<Headers> {
  const value = typeof source === 'function' ? await source() : source
  const headers = new Headers(value)
  headers.set('Accept', 'text/event-stream')
  headers.set('Content-Type', 'application/json')
  return headers
}

async function readGatewayError(response: Response): Promise<GatewayErrorPayload | undefined> {
  try {
    const payload = await response.json() as { error?: GatewayErrorPayload }
    return payload.error
  } catch {
    return undefined
  }
}

export function createGatewayTransport(options: GatewayTransportOptions): ChatTransport {
  const requestFetch = options.fetch ?? globalThis.fetch

  return {
    async *stream(request, { signal }) {
      let response: Response
      try {
        response = await requestFetch(options.endpoint, {
          method: 'POST',
          credentials: options.credentials,
          headers: await resolveHeaders(options.headers),
          body: JSON.stringify({ ...request, stream: true }),
          signal,
        })
      } catch (cause) {
        if (signal.aborted) throw new ChatError('The response was cancelled.', { kind: 'aborted', cause })
        throw new ChatError('Unable to start the chat request.', { kind: 'network', cause })
      }

      if (!response.ok) {
        const payload = await readGatewayError(response)
        if (payload) throw gatewayError(payload)
        throw new ChatError(`The chat request failed with status ${response.status}.`, { kind: 'http' })
      }

      if (!response.body) {
        throw new ChatError('The gateway response did not include a stream.', { kind: 'protocol' })
      }

      const contentType = response.headers.get('content-type') ?? ''
      if (!contentType.includes('text/event-stream')) {
        throw new ChatError('The gateway response is not an SSE stream.', { kind: 'protocol' })
      }

      yield* decodeSseStream(response.body)
    },
  }
}
