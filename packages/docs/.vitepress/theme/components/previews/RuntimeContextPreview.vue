<script setup lang="ts">
import { computed, ref } from 'vue'

type Toast = { id: number; tone: string; message: string }
const tabs = ['概览', '活动', '设置']
const activeTab = ref('概览')
const toasts = ref<Toast[]>([])
const toastCount = ref(0)
const fullscreenState = ref(false)
const currentContent = computed(() => ({ 概览: '这里是 FTabs 的当前面板。', 活动: '这里可以放置活动时间线。', 设置: '这里可以放置页面级设置。' })[activeTab.value])

function addToast() {
  const id = ++toastCount.value
  toasts.value.push({ id, tone: 'success', message: '本地演示通知已创建' })
  window.setTimeout(() => { toasts.value = toasts.value.filter((toast) => toast.id !== id) }, 2600)
}
function dismiss(id: number) { toasts.value = toasts.value.filter((toast) => toast.id !== id) }
</script>

<template>
  <div class="runtime-preview">
    <div class="tabs" role="tablist" aria-label="页面标签">
      <button v-for="tab in tabs" :key="tab" :aria-selected="activeTab === tab" :class="{ active: activeTab === tab }" type="button" role="tab" @click="activeTab = tab">{{ tab }}</button>
    </div>
    <p class="tab-content">{{ currentContent }}</p>
    <div class="runtime-actions">
      <button class="runtime-button" type="button" @click="addToast">创建本地 Toast</button>
      <button class="runtime-button" type="button" @click="fullscreenState = !fullscreenState">{{ fullscreenState ? '退出全屏状态' : '模拟全屏状态' }}</button>
    </div>
    <div v-if="fullscreenState" class="fullscreen-note">FFullscreen 在生成项目中调用浏览器 Fullscreen API；此处只模拟状态，不接管文档窗口。</div>
    <div class="toast-host" aria-live="polite">
      <div v-for="toast in toasts" :key="toast.id" class="toast"><span>{{ toast.message }}</span><button type="button" aria-label="关闭通知" @click="dismiss(toast.id)">×</button></div>
    </div>
  </div>
</template>

<style scoped>
.runtime-preview { min-height: 190px; position: relative; }.tabs { border-bottom: 1px solid var(--vp-c-border); display: flex; gap: 18px; }.tabs button { background: transparent; border: 0; border-bottom: 2px solid transparent; color: var(--vp-c-text-2); cursor: pointer; font: inherit; font-size: 13px; margin-bottom: -1px; padding: 8px 2px; }.tabs button.active { border-color: var(--vp-c-brand-1); color: var(--vp-c-brand-1); font-weight: 700; }.tab-content { color: var(--vp-c-text-2); font-size: 13px; min-height: 24px; }.runtime-actions { display: flex; flex-wrap: wrap; gap: 10px; }.runtime-button { background: var(--vp-c-brand-soft); border: 1px solid color-mix(in srgb, var(--vp-c-brand-1) 30%, transparent); border-radius: 7px; color: var(--vp-c-brand-1); cursor: pointer; font: inherit; font-size: 13px; padding: 8px 11px; }.fullscreen-note { background: var(--vp-c-bg-soft); border-radius: 6px; color: var(--vp-c-text-2); font-size: 12px; margin-top: 12px; padding: 9px; }.toast-host { bottom: 0; display: grid; gap: 7px; position: absolute; right: 0; width: min(280px, 100%); }.toast { align-items: center; background: var(--vp-c-bg-elv); border: 1px solid #16a34a; border-radius: 7px; box-shadow: 0 8px 22px oklch(0.15 0.01 260 / .14); display: flex; font-size: 12px; gap: 8px; justify-content: space-between; padding: 9px 10px; }.toast button { background: transparent; border: 0; color: var(--vp-c-text-2); cursor: pointer; font-size: 16px; line-height: 1; }
</style>
