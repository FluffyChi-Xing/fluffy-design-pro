import { beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import UploadCenterPanel from '@/components/upload/UploadCenterPanel.vue'
import { useUploadStore, type UploadTask } from '@/stores/upload'

function makeTask(overrides: Partial<UploadTask> = {}): UploadTask {
  return { id: 't1', name: 'a.txt', size: 10, progress: 100, status: 'done', createdAt: 0, ...overrides }
}

describe('UploadCenterPanel', () => {
  beforeEach(() => setActivePinia(createPinia()))

  function mountPanel() {
    return mount(UploadCenterPanel, { global: { mocks: { $t: (key: string) => key } } })
  }

  it('shows an empty state when there are no tasks', () => {
    const wrapper = mountPanel()
    expect(wrapper.text()).toContain('upload.center.empty')
    expect(wrapper.find('.upload-center-list').exists()).toBe(false)
  })

  it('renders three tabs with task counts', () => {
    const store = useUploadStore()
    store.tasks.push(makeTask())
    const wrapper = mountPanel()
    const tabs = wrapper.findAll('button[role="tab"]')
    expect(tabs).toHaveLength(3)
    expect(tabs[1].text()).toContain('1')
  })

  it('lists the tasks of the active tab', () => {
    const store = useUploadStore()
    store.tasks.push(makeTask({ status: 'uploading', progress: 30 }))
    const wrapper = mountPanel()
    const rows = wrapper.findAll('.upload-center-list li')
    expect(rows).toHaveLength(1)
    expect(wrapper.text()).toContain('a.txt')
  })
})
