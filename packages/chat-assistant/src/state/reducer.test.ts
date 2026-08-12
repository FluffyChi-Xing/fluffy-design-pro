import { describe, expect, it } from 'vitest'
import { ChatError } from '../types/chat'
import { initialChatState, reduceChatState } from './reducer'

describe('reduceChatState', () => {
  it('accumulates text then uses the canonical terminal response', () => {
    let state = reduceChatState(initialChatState, {
      type: 'submit', text: '你好', userMessageId: 'user', assistantMessageId: 'assistant', createdAt: 1,
    })
    state = reduceChatState(state, { type: 'event', event: {
      type: 'content_block.start', index: 0, block: { type: 'text', text: '' },
    } })
    state = reduceChatState(state, { type: 'event', event: {
      type: 'content_block.delta', index: 0, delta: { type: 'text_delta', text: '临时内容' },
    } })
    state = reduceChatState(state, { type: 'event', event: {
      type: 'response.completed', response: {
        id: 'resp_1', model: 'model', content: [{ type: 'text', text: '最终内容' }], finishReason: 'stop',
        usage: { inputTokens: 1, outputTokens: 2, totalTokens: 3 }, requestId: 'req_1', createdAt: 2,
      },
    } })

    expect(state.status).toBe('completed')
    expect(state.messages.at(-1)).toMatchObject({
      status: 'completed', responseId: 'resp_1', content: [{ type: 'text', text: '最终内容' }],
    })
  })

  it('preserves partial content after an aborted request', () => {
    let state = reduceChatState(initialChatState, {
      type: 'submit', text: '你好', userMessageId: 'user', assistantMessageId: 'assistant', createdAt: 1,
    })
    state = reduceChatState(state, { type: 'event', event: {
      type: 'content_block.start', index: 0, block: { type: 'text', text: '部分内容' },
    } })
    state = reduceChatState(state, { type: 'failed', error: new ChatError('cancelled', { kind: 'aborted' }) })

    expect(state.status).toBe('cancelled')
    expect(state.messages.at(-1)).toMatchObject({ status: 'cancelled', content: [{ type: 'text', text: '部分内容' }] })
  })
})
