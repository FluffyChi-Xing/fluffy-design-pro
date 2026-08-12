import { ChatError } from '../types/chat'
import type { GatewaySseEvent } from '../types/gateway'

interface SseFrame {
  event?: string
  data?: string
  id?: string
}

const eventTypes = new Set<GatewaySseEvent['type']>([
  'response.created',
  'response.metadata',
  'content_block.start',
  'content_block.delta',
  'content_block.done',
  'response.completed',
  'response.cancelled',
  'error',
])

function parseFrame(rawFrame: string): SseFrame | undefined {
  const frame: SseFrame = {}

  for (const line of rawFrame.split(/\r?\n/)) {
    if (!line || line.startsWith(':')) continue
    const separator = line.indexOf(':')
    const field = separator === -1 ? line : line.slice(0, separator)
    const value = separator === -1 ? '' : line.slice(separator + 1).replace(/^ /, '')

    if (field === 'event') frame.event = value
    if (field === 'data') frame.data = frame.data ? `${frame.data}\n${value}` : value
    if (field === 'id') frame.id = value
  }

  return frame.data ? frame : undefined
}

function toGatewayEvent(frame: SseFrame): GatewaySseEvent {
  if (!frame.data) throw new ChatError('SSE event is missing data.', { kind: 'protocol' })

  let event: unknown
  try {
    event = JSON.parse(frame.data)
  } catch (cause) {
    throw new ChatError('SSE event contains invalid JSON.', { kind: 'protocol', cause })
  }

  if (!event || typeof event !== 'object' || !('type' in event) || typeof event.type !== 'string') {
    throw new ChatError('SSE event is missing its type.', { kind: 'protocol' })
  }

  if (!eventTypes.has(event.type as GatewaySseEvent['type'])) {
    throw new ChatError(`Unsupported SSE event type: ${event.type}`, { kind: 'protocol' })
  }

  if (frame.event && frame.event !== event.type) {
    throw new ChatError('SSE event name does not match its payload type.', { kind: 'protocol' })
  }

  return event as GatewaySseEvent
}

export async function* decodeSseStream(body: ReadableStream<Uint8Array>): AsyncGenerator<GatewaySseEvent> {
  const reader = body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      buffer += decoder.decode(value, { stream: !done })

      let boundary = buffer.search(/\r?\n\r?\n/)
      while (boundary !== -1) {
        const rawFrame = buffer.slice(0, boundary)
        const separatorLength = buffer.startsWith('\r\n\r\n', boundary) ? 4 : 2
        buffer = buffer.slice(boundary + separatorLength)
        const frame = parseFrame(rawFrame)
        if (frame) yield toGatewayEvent(frame)
        boundary = buffer.search(/\r?\n\r?\n/)
      }

      if (done) break
    }
  } catch (error) {
    if (error instanceof ChatError) throw error
    if (error instanceof DOMException && error.name === 'AbortError') throw error
    throw new ChatError('Unable to read the SSE response.', { kind: 'network', cause: error })
  } finally {
    reader.releaseLock()
  }

  if (buffer.trim()) {
    const frame = parseFrame(buffer)
    if (frame) yield toGatewayEvent(frame)
  }
}
