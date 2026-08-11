<script setup lang="ts">
import { computed, ref } from 'vue'

const selected = ref('dashboard')
const color = ref('#4f46e5')
const size = ref(24)

const icons = {
  dashboard: { label: 'dashboard', paths: ['M4 4h6v6H4z', 'M14 4h6v6h-6z', 'M4 14h6v6H4z', 'M14 14h6v6h-6z'] },
  chart: { label: 'chart-no-axes-combined', paths: ['M4 19V5', 'M4 19h16', 'm7 15 4-4 3 2 4-6'] },
  folder: { label: 'FolderOpen', paths: ['M3 7h6l2 2h10v10H3z'] },
  menu: { label: 'Menu', paths: ['M4 6h16', 'M4 12h16', 'M4 18h16'] },
  search: { label: 'Search', paths: ['M11 3a8 8 0 1 0 0 16 8 8 0 0 0 0-16z', 'm21 21-4.3-4.3'] },
  check: { label: 'Check', paths: ['M20 6 9 17l-5-5'] },
  users: { label: 'Users', paths: ['M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2', 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', 'M22 21v-2a4 4 0 0 0-3-3.87', 'M16 3.13a4 4 0 0 1 0 7.75'] },
  calendar: { label: 'calendar-days', registered: true, paths: ['M5 4h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z', 'M16 2v4', 'M8 2v4', 'M3 10h18'] }
} as const

type IconKey = keyof typeof icons

const icon = computed(() => icons[selected.value as IconKey])
const isRegistered = computed(() => icon.value.registered === true)
</script>

<template>
  <div class="icon-preview">
    <div class="controls">
      <label>名称<select v-model="selected"><option v-for="item in Object.keys(icons)" :key="item" :value="item">{{ icons[item as IconKey].label }}{{ icons[item as IconKey].registered ? '（注册）' : '' }}</option></select></label>
      <label>颜色<input v-model="color" type="color"></label>
      <label>尺寸<input v-model.number="size" type="range" min="16" max="40"><output>{{ size }}px</output></label>
    </div>
    <div class="stage">
      <svg :width="size" :height="size" viewBox="0 0 24 24" fill="none" :stroke="color" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" aria-label="图标预览" role="img"><path v-for="path in icon.paths" :key="path" :d="path" /></svg>
      <code>&lt;FIcon name="{{ icon.label }}" color="{{ color }}" :size="{{ size }}" /&gt;</code>
    </div>
    <pre v-if="isRegistered" class="register-hint">// 内置集之外的图标由应用显式注册后使用
import { CalendarDays } from 'lucide-vue-next'
import { registerIcons } from '@/lib/icons'

registerIcons({ CalendarDays })</pre>
  </div>
</template>

<style scoped>
.icon-preview { display: grid; gap: 18px; }.controls { align-items: end; display: flex; flex-wrap: wrap; gap: 12px; }.controls label { color: var(--vp-c-text-2); display: grid; font-size: 12px; gap: 5px; }.controls select, .controls input[type='range'] { accent-color: var(--vp-c-brand-1); }.controls select { background: var(--vp-c-bg-elv); border: 1px solid var(--vp-c-border); border-radius: 6px; color: var(--vp-c-text-1); padding: 5px 7px; }.controls output { color: var(--vp-c-text-1); font-family: var(--vp-font-family-mono); }.stage { align-items: center; background: var(--vp-c-bg-soft); border-radius: 8px; display: flex; gap: 16px; min-height: 116px; padding: 20px; }.stage code { color: var(--vp-c-text-2); font-size: 12px; overflow-wrap: anywhere; }.register-hint { background: var(--vp-c-bg-soft); border: 1px dashed var(--vp-c-border); border-radius: 8px; color: var(--vp-c-text-2); font-family: var(--vp-font-family-mono); font-size: 12px; line-height: 1.7; margin: 0; overflow: auto; padding: 14px 16px; }
</style>
