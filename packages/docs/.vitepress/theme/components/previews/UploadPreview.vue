<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'

const fileName = ref('尚未选择文件')
const progress = ref(0)
let timer: number | undefined

function chooseFile(event: Event) {
  const input = event.target as HTMLInputElement
  fileName.value = input.files?.[0]?.name ?? '尚未选择文件'
  progress.value = input.files?.length ? 12 : 0
  if (!input.files?.length) return
  window.clearInterval(timer)
  timer = window.setInterval(() => {
    progress.value = Math.min(progress.value + 17, 100)
    if (progress.value === 100) window.clearInterval(timer)
  }, 180)
}

onBeforeUnmount(() => window.clearInterval(timer))
</script>

<template>
  <div class="upload-preview">
    <label class="upload-drop">
      <input type="file" accept="image/*,.pdf" @change="chooseFile">
      <strong>选择文件模拟上传</strong>
      <span>支持图片或 PDF；文件不会离开当前页面</span>
    </label>
    <div class="upload-task">
      <div class="task-head"><span>{{ fileName }}</span><strong>{{ progress }}%</strong></div>
      <div class="task-track"><span :style="{ width: `${progress}%` }" /></div>
      <small>{{ progress === 100 ? '本地模拟完成' : progress ? '本地模拟上传中…' : '等待选择文件' }}</small>
    </div>
  </div>
</template>

<style scoped>
.upload-preview { display: grid; gap: 16px; }.upload-drop { align-items: center; border: 1px dashed var(--vp-c-brand-1); border-radius: 9px; cursor: pointer; display: grid; gap: 6px; justify-items: center; padding: 25px 16px; text-align: center; }.upload-drop:hover { background: var(--vp-c-brand-soft); }.upload-drop input { display: none; }.upload-drop strong { font-size: 14px; }.upload-drop span, .upload-task small { color: var(--vp-c-text-2); font-size: 12px; }.upload-task { background: var(--vp-c-bg-soft); border-radius: 7px; padding: 12px; }.task-head { display: flex; font-size: 12px; gap: 12px; justify-content: space-between; }.task-head span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }.task-head strong { color: var(--vp-c-brand-1); }.task-track { background: var(--vp-c-bg-elv); border-radius: 999px; height: 7px; margin: 9px 0 7px; overflow: hidden; }.task-track span { background: var(--vp-c-brand-1); display: block; height: 100%; transition: width .16s ease; }
</style>
