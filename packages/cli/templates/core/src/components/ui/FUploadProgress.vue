<script setup lang="ts">
import FProgress from '@/components/ui/FProgress.vue'
import { useUploadStore } from '@/stores/upload'
import type { UploadTask } from '@/stores/upload'

interface Props {
  task: UploadTask
}
const props = defineProps<Props>()

const store = useUploadStore()

function formatSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`
}
</script>

<template>
  <div class="f-upload-progress">
    <div class="f-upload-progress-head">
      <span class="f-upload-progress-name" :title="props.task.name">{{ props.task.name }}</span>
      <span class="f-upload-progress-meta">
        <span class="f-upload-progress-size">{{ formatSize(props.task.size) }}</span>
        <span class="f-upload-progress-status" :class="`f-upload-progress-status-${props.task.status}`">{{ $t(`upload.status.${props.task.status}`) }}</span>
      </span>
    </div>
    <FProgress :value="props.task.progress" show-label />
    <p v-if="props.task.status === 'error'" class="f-upload-progress-error">{{ $t(props.task.errorKey || 'upload.error.failed') }}</p>
    <div v-if="props.task.status === 'error' || props.task.status === 'done'" class="f-upload-progress-actions">
      <button v-if="props.task.status === 'error'" type="button" class="f-upload-progress-action" @click="store.retryTask(props.task.id)">{{ $t('upload.retry') }}</button>
      <button v-if="props.task.status === 'done'" type="button" class="f-upload-progress-action" @click="store.removeTask(props.task.id)">{{ $t('upload.remove') }}</button>
    </div>
  </div>
</template>

<style scoped>
.f-upload-progress{display:grid;gap:8px}.f-upload-progress-head{align-items:center;display:flex;gap:10px;justify-content:space-between;min-width:0}.f-upload-progress-name{color:var(--foreground);font-size:13px;font-weight:600;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.f-upload-progress-meta{align-items:center;display:flex;flex:none;gap:8px}.f-upload-progress-size{color:var(--subtle-foreground);font-size:11px}.f-upload-progress-status{font-size:11px;font-weight:600}.f-upload-progress-status-uploading{color:var(--primary)}.f-upload-progress-status-done{color:var(--success)}.f-upload-progress-status-error{color:var(--danger)}.f-upload-progress-error{color:var(--danger);font-size:12px;margin:0}.f-upload-progress-actions{display:flex;gap:8px;justify-content:flex-end}.f-upload-progress-action{background:transparent;border:0;border-radius:var(--radius-sm);color:var(--primary);cursor:pointer;font:inherit;font-size:12px;padding:3px 8px}.f-upload-progress-action:hover{background:var(--surface-hover)}
</style>
