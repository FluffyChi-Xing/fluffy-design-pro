import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

const mocks = vi.hoisted(() => ({
  isFluffyOssConfigured: vi.fn(),
  uploadToFluffyOss: vi.fn()
}))

vi.mock('@/integrations/fluffy-oss', () => ({
  isFluffyOssConfigured: mocks.isFluffyOssConfigured,
  uploadToFluffyOss: mocks.uploadToFluffyOss
}))

import { useUploadStore } from './upload'

describe('useUploadStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  it('simulates an upload to completion when OSS is not configured', () => {
    mocks.isFluffyOssConfigured.mockReturnValue(false)
    vi.useFakeTimers()
    const store = useUploadStore()
    const task = store.enqueueUpload(new File(['a'], 'a.txt'))

    expect(task.status).toBe('uploading')
    expect(store.inProgress).toHaveLength(1)

    vi.advanceTimersByTime(2400)

    expect(task.status).toBe('done')
    expect(task.progress).toBe(100)
    expect(store.completed).toHaveLength(1)
    expect(mocks.uploadToFluffyOss).not.toHaveBeenCalled()
  })

  it('uploads through the SDK with progress when configured', async () => {
    mocks.isFluffyOssConfigured.mockReturnValue(true)
    mocks.uploadToFluffyOss.mockImplementation((_file: File, options: { onProgress?: (percent: number) => void }) => {
      options.onProgress?.(40)
      return Promise.resolve('https://cdn.example.com/photo.png')
    })
    const store = useUploadStore()
    const task = store.enqueueUpload(new File(['a'], 'photo.png'))

    expect(task.progress).toBe(40)
    await vi.waitFor(() => expect(task.status).toBe('done'))
    expect(task.progress).toBe(100)
    expect(task.url).toBe('https://cdn.example.com/photo.png')
  })

  it('marks a task as failed when the SDK upload rejects', async () => {
    mocks.isFluffyOssConfigured.mockReturnValue(true)
    mocks.uploadToFluffyOss.mockRejectedValue(new Error('boom'))
    const store = useUploadStore()
    const task = store.enqueueUpload(new File(['a'], 'broken.bin'))

    await vi.waitFor(() => expect(task.status).toBe('error'))
    expect(task.errorKey).toBe('upload.error.failed')
    expect(store.failed).toHaveLength(1)
  })

  it('retries, removes and clears tasks', async () => {
    mocks.isFluffyOssConfigured.mockReturnValue(true)
    mocks.uploadToFluffyOss.mockRejectedValue(new Error('boom'))
    const store = useUploadStore()
    const task = store.enqueueUpload(new File(['a'], 'a.bin'))
    await vi.waitFor(() => expect(task.status).toBe('error'))

    store.retryTask(task.id)
    expect(task.status).toBe('uploading')
    expect(task.errorKey).toBeUndefined()

    store.removeTask(task.id)
    expect(store.tasks).toHaveLength(0)
  })

  it('groups tasks into inProgress, completed and failed buckets', async () => {
    mocks.isFluffyOssConfigured.mockReturnValue(false)
    vi.useFakeTimers()
    const store = useUploadStore()
    const uploading = store.enqueueUpload(new File(['a'], 'active.txt'))
    vi.advanceTimersByTime(2400)
    const done = store.enqueueUpload(new File(['b'], 'done.txt'))

    expect(store.inProgress.map((item) => item.id)).toEqual([done.id])
    expect(store.completed.map((item) => item.id)).toEqual([uploading.id])
    expect(store.failed).toHaveLength(0)

    store.clearCompleted()
    expect(store.completed).toHaveLength(0)
    expect(store.tasks).toHaveLength(1)
  })
})
