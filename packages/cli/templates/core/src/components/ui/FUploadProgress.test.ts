import { beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import FUploadProgress from '@/components/ui/FUploadProgress.vue'
import { useUploadStore, type UploadTask } from '@/stores/upload'

function makeTask(overrides: Partial<UploadTask> = {}): UploadTask {
  return { id: 't1', name: 'photo.png', size: 1048576, progress: 40, status: 'uploading', createdAt: 0, ...overrides }
}

describe('FUploadProgress', () => {
  beforeEach(() => setActivePinia(createPinia()))

  function mountRow(task: UploadTask) {
    return mount(FUploadProgress, { props: { task }, global: { mocks: { $t: (key: string) => key } } })
  }

  it('renders name, size, status and progress', () => {
    const wrapper = mountRow(makeTask())
    expect(wrapper.text()).toContain('photo.png')
    expect(wrapper.text()).toContain('1.0 MB')
    expect(wrapper.text()).toContain('upload.status.uploading')
    expect(wrapper.find('.f-progress-fill').attributes('style')).toContain('width: 40%')
  })

  it('removes a completed task from the store', async () => {
    const store = useUploadStore()
    const task = makeTask({ status: 'done', progress: 100 })
    store.tasks.push(task)
    const wrapper = mountRow(task)

    await wrapper.find('button').trigger('click')
    expect(store.tasks).toHaveLength(0)
  })

  it('retries a failed task', async () => {
    const store = useUploadStore()
    const task = makeTask({ status: 'error', errorKey: 'upload.error.failed' })
    store.tasks.push(task)
    const wrapper = mountRow(task)

    await wrapper.find('button').trigger('click')
    expect(store.tasks[0].status).toBe('uploading')
    expect(store.tasks[0].errorKey).toBeUndefined()
  })
})
