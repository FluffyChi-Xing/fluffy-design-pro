<script setup lang="ts">
import { computed, ref } from 'vue'

const rows = ref(2)
const expanded = ref(false)
const type = ref<'default' | 'secondary' | 'success' | 'warning' | 'danger'>('secondary')
const text = 'Fluffy Design Pro 将 shadcn-vue 的基础组件与面向管理端的图表、图标、树和权限能力结合，同时保持生成项目源码完全可编辑。'
const paragraphStyle = computed(() => expanded.value ? undefined : { WebkitLineClamp: rows.value })
</script>

<template>
  <div class="typography-preview">
    <div class="controls"><label>颜色<select v-model="type"><option value="default">default</option><option value="secondary">secondary</option><option value="success">success</option><option value="warning">warning</option><option value="danger">danger</option></select></label><label>截断行数<input v-model.number="rows" type="range" min="1" max="4"><output>{{ rows }}</output></label></div>
    <div class="surface"><h3>语义标题 h3</h3><p class="paragraph" :class="[`type-${type}`, { clamped: !expanded }]" :style="paragraphStyle">{{ text }} {{ text }}</p><button type="button" @click="expanded = !expanded">{{ expanded ? '收起' : '展开' }}</button></div>
  </div>
</template>

<style scoped>
.typography-preview { display: grid; gap: 18px; }.controls { align-items: end; display: flex; flex-wrap: wrap; gap: 12px; }.controls label { color: var(--vp-c-text-2); display: grid; font-size: 12px; gap: 5px; }.controls select { background: var(--vp-c-bg-elv); border: 1px solid var(--vp-c-border); border-radius: 6px; color: var(--vp-c-text-1); padding: 5px 7px; }.controls input { accent-color: var(--vp-c-brand-1); }.controls output { color: var(--vp-c-text-1); font-family: var(--vp-font-family-mono); }.surface { background: var(--vp-c-bg-soft); border-radius: 8px; padding: 18px; }.surface h3 { font-size: 20px; letter-spacing: -.03em; margin: 0 0 10px; }.paragraph { line-height: 1.7; margin: 0; overflow-wrap: anywhere; }.clamped { display: -webkit-box; overflow: hidden; -webkit-box-orient: vertical; }.type-secondary { color: var(--vp-c-text-2); }.type-success { color: #15803d; }.type-warning { color: #a16207; }.type-danger { color: #b91c1c; }.surface button { background: transparent; border: 0; color: var(--vp-c-brand-1); cursor: pointer; font: inherit; font-size: 13px; margin-top: 6px; padding: 0; }.dark .type-success { color: #4ade80; }.dark .type-warning { color: #fbbf24; }.dark .type-danger { color: #f87171; }
</style>
