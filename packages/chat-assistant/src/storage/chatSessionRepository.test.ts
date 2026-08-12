import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  ChatError,
  deserializeChatMessage,
  deriveChatSessionTitle,
  serializeChatMessage,
  type ChatSession,
} from '../types/chat'
import { createChatSessionRepository } from './chatSessionRepository'

function deleteDatabase() {
  return new Promise<void>((resolve, reject) => {
    const request = indexedDB.deleteDatabase('fluffy-design-pro-chat-assistant')
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

const message = {
  id: 'message_1',
  role: 'assistant' as const,
  content: [{ type: 'text' as const, text: 'partial' }],
  status: 'streaming' as const,
  createdAt: 1,
}

beforeEach(deleteDatabase)
afterEach(deleteDatabase)

describe('chatSessionRepository', () => {
  it('orders restored sessions and normalizes incomplete messages', async () => {
    const repository = createChatSessionRepository()
    const older: ChatSession = { id: 'older', title: '旧对话', messages: [message], createdAt: 1, updatedAt: 1 }
    const newer: ChatSession = { id: 'newer', title: '新对话', messages: [], createdAt: 2, updatedAt: 2 }
    await repository.put(older)
    await repository.put(newer)

    const sessions = await repository.list()
    expect(sessions.map((session) => session.id)).toEqual(['newer', 'older'])
    expect(sessions[1].messages[0].status).toBe('cancelled')
  })

  it('serializes ChatError fields without persisting Error internals', () => {
    const serialized = serializeChatMessage({
      ...message,
      status: 'error',
      error: new ChatError('请求失败', { kind: 'http', payload: { type: 'error', code: 'invalid_request', message: 'bad request' } }),
    })
    const restored = deserializeChatMessage(serialized)

    expect(restored.error).toBeInstanceOf(ChatError)
    expect(restored.error).toMatchObject({ message: '请求失败', kind: 'http' })
  })

  it('derives a concise title from the first user message', () => {
    expect(deriveChatSessionTitle([])).toBe('新对话')
    expect(deriveChatSessionTitle([{ ...message, role: 'user', status: 'completed', content: [{ type: 'text', text: '  帮我   梳理  工作台  ' }] }])).toBe('帮我 梳理 工作台')
  })
})
