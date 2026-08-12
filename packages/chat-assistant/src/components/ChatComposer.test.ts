import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ChatComposer from './ChatComposer.vue'

describe('ChatComposer', () => {
  it('sends on Enter and keeps a newline on Shift+Enter', async () => {
    const wrapper = mount(ChatComposer)
    const textarea = wrapper.get('textarea')
    await textarea.setValue('hello')
    await textarea.trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('submit')).toEqual([['hello']])

    await textarea.setValue('line one')
    await textarea.trigger('keydown', { key: 'Enter', shiftKey: true })
    expect(wrapper.emitted('submit')).toHaveLength(1)
  })
})
