import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import FTabs from '@/components/ui/FTabs.vue'

const items = [
  { key: 'uploading', labelKey: 'upload.tab.uploading', count: 2 },
  { key: 'done', labelKey: 'upload.tab.done' }
]

function mountTabs() {
  return mount(FTabs, {
    props: { items, modelValue: 'uploading' },
    global: { mocks: { $t: (key: string) => key } }
  })
}

describe('FTabs', () => {
  it('renders tabs with labels and counts', () => {
    const wrapper = mountTabs()
    const tabs = wrapper.findAll('button[role="tab"]')
    expect(tabs).toHaveLength(2)
    expect(tabs[0].text()).toContain('upload.tab.uploading')
    expect(tabs[0].text()).toContain('2')
  })

  it('marks the active tab', () => {
    const wrapper = mountTabs()
    expect(wrapper.find('button.f-tabs-item-active').text()).toContain('upload.tab.uploading')
  })

  it('emits update:modelValue when clicking another tab', async () => {
    const wrapper = mountTabs()
    await wrapper.findAll('button[role="tab"]')[1].trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([['done']])
  })
})
