<script setup lang="ts">
import { ref } from 'vue'
import { useUploadStore } from '@/stores/upload'

interface Props {
  accept?: string[]
  multiple?: boolean
  hint?: string
}
const props = withDefaults(defineProps<Props>(), { accept: () => [], multiple: true })

const store = useUploadStore()
const dragging = ref(false)
const input = ref<HTMLInputElement | null>(null)

function openPicker() {
  input.value?.click()
}

function handleFiles(files: FileList | null) {
  if (!files) return
  for (const file of Array.from(files)) store.enqueueUpload(file)
}

function onChange(event: Event) {
  const target = event.target as HTMLInputElement
  handleFiles(target.files)
  target.value = ''
}

function onDrop(event: DragEvent) {
  dragging.value = false
  handleFiles(event.dataTransfer?.files ?? null)
}
</script>

<template>
  <div class="f-upload">
    <button type="button" class="f-upload-dropzone" :class="{ 'f-upload-dropzone-drag': dragging }" @click="openPicker" @dragenter.prevent="dragging = true" @dragleave.prevent="dragging = false" @dragover.prevent @drop.prevent="onDrop">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 16V4M6 9l6-6 6 6" /><path d="M4 20h16" /></svg>
      <span>{{ $t('upload.dropzone') }}</span>
      <small v-if="props.hint">{{ props.hint }}</small>
    </button>
    <input ref="input" type="file" class="f-upload-input" :accept="props.accept.join(',')" :multiple="props.multiple" hidden @change="onChange">
  </div>
</template>

<style scoped>
.f-upload{display:grid;gap:14px}.f-upload-dropzone{align-items:center;background:var(--surface);border:1px dashed var(--border);border-radius:var(--radius-md);color:var(--muted-foreground);cursor:pointer;display:flex;flex-direction:column;font:inherit;gap:6px;justify-content:center;min-height:132px;padding:20px;transition:background-color 140ms ease,border-color 140ms ease,color 140ms ease}.f-upload-dropzone:hover,.f-upload-dropzone-drag{background:color-mix(in srgb,var(--primary) 5%,transparent);border-color:var(--primary);color:var(--foreground)}.f-upload-dropzone svg{fill:none;height:26px;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:1.6;width:26px}.f-upload-dropzone span{font-size:13px;font-weight:600}.f-upload-dropzone small{color:var(--subtle-foreground);font-size:12px}.f-upload-input{display:none}
</style>
