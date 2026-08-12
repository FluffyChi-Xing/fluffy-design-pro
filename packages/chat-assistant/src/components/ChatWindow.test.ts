import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import type { ChatSession } from '../types/chat'
import ChatWindow from './ChatWindow.vue'

const sessions: ChatSession[] = [{
  id: 'session_1',
  title: '第一条对话',
  messages: [],
  createdAt: 1,
  updatedAt: 1,
}]

function mountWindow(overrides: Partial<InstanceType<typeof ChatWindow>['$props']> = {}) {
  return mount(ChatWindow, {
    attachTo: document.body,
    props: {
      open: true,
      title: 'AI 助手',
      messages: [],
      sessions,
      activeSessionId: 'session_1',
      streaming: false,
      fullscreen: false,
      dragging: false,
      historyOpen: false,
      windowStyle: {},
      ...overrides,
    },
  })
}

describe('ChatWindow', () => {
  it('shows the floating history sheet and emits its actions', async () => {
    const wrapper = mountWindow({ historyOpen: true })
    expect(document.body.querySelector('.fca-history-sheet')).not.toBeNull()

    await (document.body.querySelector('[aria-label="新建对话"]') as HTMLButtonElement).click()
    expect(wrapper.emitted('newChat')).toHaveLength(1)

    await (document.body.querySelector('.fca-session-item') as HTMLButtonElement).click()
    expect(wrapper.emitted('selectSession')).toEqual([['session_1']])
    wrapper.unmount()
  })

  it('renders the persistent session sidebar in fullscreen mode', () => {
    const wrapper = mountWindow({ fullscreen: true })
    expect(document.body.querySelector('.fca-fullscreen-sidebar')).not.toBeNull()
    expect(document.body.querySelector('.fca-history-sheet')).toBeNull()
    expect(document.body.querySelector('.fca-chat-pane')).not.toBeNull()
    wrapper.unmount()
  })
})
