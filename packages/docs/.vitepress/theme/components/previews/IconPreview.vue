<script setup lang="ts">
import { computed, ref } from 'vue'

const selected = ref('dashboard')
const color = ref('#4f46e5')
const size = ref(24)

const icons = {
  dashboard: { label: 'dashboard', paths: ['M4 4h6v6H4z', 'M14 4h6v6h-6z', 'M4 14h6v6H4z', 'M14 14h6v6h-6z'] },
  chart: { label: 'chart-no-axes-combined', paths: ['M4 19V5', 'M4 19h16', 'm7 15 4-4 3 2 4-6'] },
  folder: { label: 'FolderOpen', paths: ['M3 7h6l2 2h10v10H3z'] }
} as const

const icon = computed(() => icons[selected.value as keyof typeof icons])
</script>

<template>
  <div class="icon-preview">
    <div class="controls">
      <label>名称<select v-model="selected"><option v-for="item in Object.keys(icons)" :key="item" :value="item">{{ icons[item as keyof typeof icons].label }}</option></select></label>
      <label>颜色<input v-model="color" type="color"></label>
      <label>尺寸<input v-model.number="size" type="range" min="16" max="40"><output>{{ size }}px</output></label>
    </div>
    <div class="stage">
      <svg :width="size" :height="size" viewBox="0 0 24 24" fill="none" :stroke="color" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" aria-label="图标预览" role="img"><path v-for="path in icon.paths" :key="path" :d="path" /></svg>
      <code>&lt;FIcon name="{{ icon.label }}" color="{{ color }}" :size="{{ size }}" /&gt;</code>
    </div>
  </div>
</template>

<style scoped>
.icon-preview { display: grid; gap: 18px; }.controls { align-items: end; display: flex; flex-wrap: wrap; gap: 12px; }.controls label { color: var(--vp-c-text-2); display: grid; font-size: 12px; gap: 5px; }.controls select, .controls input[type='range'] { accent-color: var(--vp-c-brand-1); }.controls select { background: var(--vp-c-bg-elv); border: 1px solid var(--vp-c-border); border-radius: 6px; color: var(--vp-c-text-1); padding: 5px 7px; }.controls output { color: var(--vp-c-text-1); font-family: var(--vp-font-family-mono); }.stage { align-items: center; background: var(--vp-c-bg-soft); border-radius: 8px; display: flex; gap: 16px; min-height: 116px; padding: 20px; }.stage code { color: var(--vp-c-text-2); font-size: 12px; overflow-wrap: anywhere; }
</style>
