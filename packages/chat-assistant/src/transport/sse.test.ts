import { describe, expect, it } from 'vitest'
import { decodeSseStream } from './sse'

function stream(chunks: string[]) {
  const encoder = new TextEncoder()
  return new ReadableStream<Uint8Array>({
    start(controller) {
      chunks.forEach((chunk) => controller.enqueue(encoder.encode(chunk)))
      controller.close()
    },
  })
}

describe('decodeSseStream', () => {
  it('decodes split frames and ignores comments', async () => {
    const events = []
    for await (const event of decodeSseStream(stream([
      ': ping\n\nid: 1\nevent: response.created\ndata: {"type":"response.created","response":{"id":"resp_1","model":"test","createdAt":1}}\n\n',
      'event: content_block.delta\r\ndata: {"type":"content_block.delta","index":0,"delta":{"type":"text_delta","text":"你',
      '好"}}\r\n\r\n',
    ]))) events.push(event)

    expect(events).toEqual([
      { type: 'response.created', response: { id: 'resp_1', model: 'test', createdAt: 1 } },
      { type: 'content_block.delta', index: 0, delta: { type: 'text_delta', text: '你好' } },
    ])
  })

  it('rejects mismatched event names', async () => {
    const events = decodeSseStream(stream([
      'event: response.created\ndata: {"type":"error","error":{"type":"x","code":"x","message":"x"}}\n\n',
    ]))
    await expect(events.next()).rejects.toThrow('does not match')
  })
})
