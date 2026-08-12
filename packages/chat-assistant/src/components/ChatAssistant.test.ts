import { defineComponent, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import type { ChatTransport } from '../transport/gateway'
import ChatAssistant from './ChatAssistant.vue'

const transport: ChatTransport = {
  async *stream() {
    yield { type: 'response.created', response: { id: 'resp_1', model: 'test', createdAt: 1 } }
    yield { type: 'response.completed', response: {
      id: 'resp_1', model: 'test', content: [{ type: 'text', text: '你好' }], finishReason: 'stop',
      usage: { inputTokens: 1, outputTokens: 1, totalTokens: 2 }, requestId: 'req_1', createdAt: 1,
    } }
  },
}

const Host = defineComponent({
  components: { ChatAssistant },
  setup() {
    const open = ref(false)
    return { open, transport }
  },
  template: `
    <ChatAssistant v-model:open="open" :transport="transport">
      <template #trigger="{ open }"><button class="trigger" @click="open">打开</button></template>
    </ChatAssistant>
  `,
})

describe('ChatAssistant', () => {
  it('is hidden initially and opens through its trigger slot', async () => {
    const wrapper = mount(Host, { attachTo: document.body })
    expect(document.body.querySelector('.fca-window')).toBeNull()

    await wrapper.get('.trigger').trigger('click')
    expect(document.body.querySelector('.fca-window')).not.toBeNull()
    expect(document.body.querySelector('[role="dialog"]')?.getAttribute('aria-modal')).toBe('false')

    await (document.body.querySelector('[aria-label="关闭助手"]') as HTMLButtonElement).click()
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.open).toBe(false)
    wrapper.unmount()
  })
})
