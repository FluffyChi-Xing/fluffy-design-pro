<script setup lang="ts">
import { computed, ref } from 'vue'

const loading = ref(false)
const height = ref(220)
const points = [54, 76, 61, 96, 84, 112, 126]
const polyline = computed(() => points.map((value, index) => `${22 + index * 48},${150 - value}`).join(' '))

function refresh() {
  loading.value = true
  window.setTimeout(() => { loading.value = false }, 650)
}
</script>

<template>
  <div class="chart-preview">
    <div class="controls"><label>高度<input v-model.number="height" type="range" min="180" max="300"><output>{{ height }}px</output></label><button type="button" :disabled="loading" @click="refresh">{{ loading ? '刷新中…' : '模拟加载' }}</button></div>
    <div class="chart" :style="{ height: `${height}px` }"><svg viewBox="0 0 320 170" preserveAspectRatio="none" role="img" aria-label="平台流量图"><path class="grid" d="M20 30H310M20 70H310M20 110H310M20 150H310" /><polyline class="line" :points="polyline" /><circle v-for="(value, index) in points" :key="index" :cx="22 + index * 48" :cy="150 - value" r="3.5" /></svg><div v-if="loading" class="overlay">Loading…</div></div>
    <code>&lt;FChart :modules="[LineChart, GridComponent, CanvasRenderer]" :option="option" /&gt;</code>
  </div>
</template>

<style scoped>
.chart-preview { display: grid; gap: 14px; }.controls { align-items: center; display: flex; gap: 12px; }.controls label { align-items: center; color: var(--vp-c-text-2); display: flex; font-size: 12px; gap: 7px; }.controls input { accent-color: var(--vp-c-brand-1); }.controls output, code { color: var(--vp-c-text-2); font-family: var(--vp-font-family-mono); font-size: 12px; }.controls button { background: var(--vp-c-brand-1); border: 0; border-radius: 6px; color: white; cursor: pointer; font: inherit; font-size: 12px; font-weight: 600; padding: 7px 10px; }.controls button:disabled { cursor: wait; opacity: .7; }.chart { background: linear-gradient(180deg, color-mix(in srgb, var(--vp-c-brand-1) 7%, transparent), transparent); border: 1px solid var(--vp-c-border); border-radius: 8px; overflow: hidden; position: relative; }.chart svg { height: 100%; width: 100%; }.grid { fill: none; stroke: var(--vp-c-border); stroke-width: 1; }.line { fill: none; stroke: var(--vp-c-brand-1); stroke-linecap: round; stroke-linejoin: round; stroke-width: 3; }.chart circle { fill: var(--vp-c-brand-1); stroke: var(--vp-c-bg); stroke-width: 2; }.overlay { align-items: center; backdrop-filter: blur(2px); background: color-mix(in srgb, var(--vp-c-bg) 70%, transparent); color: var(--vp-c-brand-1); display: flex; font-size: 13px; font-weight: 700; inset: 0; justify-content: center; position: absolute; }
</style>
