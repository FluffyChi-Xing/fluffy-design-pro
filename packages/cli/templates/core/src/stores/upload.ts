import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { isFluffyOssConfigured, uploadToFluffyOss } from '@/integrations/fluffy-oss'

export type UploadTaskStatus = 'uploading' | 'done' | 'error'

export interface UploadTask {
  id: string
  name: string
  size: number
  progress: number
  status: UploadTaskStatus
  url?: string
  errorKey?: string
  file?: File
  createdAt: number
}

const SIMULATED_DURATION = 2000

let nextTaskId = 0

function createTaskId(): string {
  nextTaskId += 1
  return `upload-${Date.now()}-${nextTaskId}`
}

export const useUploadStore = defineStore('upload', () => {
  const tasks = ref<UploadTask[]>([])
  const inProgress = computed(() => tasks.value.filter((task) => task.status === 'uploading'))
  const completed = computed(() => tasks.value.filter((task) => task.status === 'done'))
  const failed = computed(() => tasks.value.filter((task) => task.status === 'error'))

  function setProgress(id: string, percent: number): void {
    const task = tasks.value.find((item) => item.id === id)
    if (task) task.progress = Math.round(Math.min(100, Math.max(0, percent)))
  }

  function completeTask(id: string, url = ''): void {
    const task = tasks.value.find((item) => item.id === id)
    if (!task) return
    task.progress = 100
    task.status = 'done'
    task.url = url
  }

  function failTask(id: string, errorKey: string): void {
    const task = tasks.value.find((item) => item.id === id)
    if (!task) return
    task.status = 'error'
    task.errorKey = errorKey
  }

  function simulateUpload(id: string): void {
    const startedAt = Date.now()
    const tick = (): void => {
      const percent = Math.min(100, Math.round(((Date.now() - startedAt) / SIMULATED_DURATION) * 100))
      setProgress(id, percent)
      if (percent < 100) window.setTimeout(tick, 120)
      else completeTask(id)
    }
    window.setTimeout(tick, 120)
  }

  function startUpload(id: string): void {
    const task = tasks.value.find((item) => item.id === id)
    if (!task?.file) return
    if (!isFluffyOssConfigured()) {
      simulateUpload(id)
      return
    }
    uploadToFluffyOss(task.file, { onProgress: (percent) => setProgress(id, percent) })
      .then((url) => completeTask(id, url))
      .catch(() => failTask(id, 'upload.error.failed'))
  }

  function enqueueUpload(file: File): UploadTask {
    const task: UploadTask = {
      id: createTaskId(),
      name: file.name,
      size: file.size,
      progress: 0,
      status: 'uploading',
      file,
      createdAt: Date.now()
    }
    tasks.value.push(task)
    startUpload(task.id)
    return task
  }

  function retryTask(id: string): void {
    const task = tasks.value.find((item) => item.id === id)
    if (!task) return
    task.progress = 0
    task.status = 'uploading'
    task.errorKey = undefined
    startUpload(id)
  }

  function removeTask(id: string): void {
    tasks.value = tasks.value.filter((item) => item.id !== id)
  }

  function clearCompleted(): void {
    tasks.value = tasks.value.filter((item) => item.status !== 'done')
  }

  return { tasks, inProgress, completed, failed, enqueueUpload, retryTask, removeTask, clearCompleted }
})
