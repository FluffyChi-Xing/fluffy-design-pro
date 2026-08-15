<script setup lang="ts">
import { computed, ref } from 'vue'

const status = ref<'default' | 'info' | 'success' | 'warning' | 'error'>('info')
const compact = ref(false)
const tone = computed(() => `tone-${status.value}`)
</script>

<template>
  <div class="empty-preview">
    <div class="controls"><label>状态<select v-model="status"><option value="default">default</option><option value="info">info</option><option value="success">success</option><option value="warning">warning</option><option value="error">error</option></select></label><label><input v-model="compact" type="checkbox"> compact</label></div>
    <section class="empty-state" :class="[tone, { compact }]">
      <span class="icon" aria-hidden="true">□</span>
      <h3>暂无项目</h3>
      <p>创建第一个项目后，它会出现在这里。</p>
      <button type="button">创建项目</button>
    </section>
  </div>
</template>

<style scoped>
.empty-preview { display: grid; gap: 18px; }.controls { align-items: center; display: flex; flex-wrap: wrap; gap: 12px; }.controls label { align-items: center; color: var(--vp-c-text-2); display: flex; font-size: 12px; gap: 6px; }.controls select { background: var(--vp-c-bg-elv); border: 1px solid var(--vp-c-border); border-radius: 6px; color: var(--vp-c-text-1); padding: 5px 7px; }.empty-state { align-items: center; display: grid; justify-items: center; margin-inline: auto; max-width: 400px; padding: 34px 20px; text-align: center; }.icon { align-items: center; background: color-mix(in srgb, var(--vp-c-brand-1) 12%, transparent); border-radius: 50%; color: var(--vp-c-brand-1); display: flex; font-size: 28px; height: 64px; justify-content: center; width: 64px; }.empty-state h3 { font-size: 18px; letter-spacing: -.03em; margin: 16px 0 0; }.empty-state p { color: var(--vp-c-text-2); line-height: 1.55; margin: 7px 0 0; }.empty-state button { background: var(--vp-c-brand-1); border: 0; border-radius: 6px; color: white; cursor: pointer; font: inherit; font-size: 13px; font-weight: 600; margin-top: 18px; padding: 8px 12px; }.tone-default .icon { background: var(--vp-c-bg-soft); color: var(--vp-c-text-2); }.tone-success .icon { background: color-mix(in srgb, #16a34a 15%, transparent); color: #15803d; }.tone-warning .icon { background: color-mix(in srgb, #eab308 17%, transparent); color: #a16207; }.tone-error .icon { background: color-mix(in srgb, #dc2626 15%, transparent); color: #b91c1c; }.compact { padding-block: 18px; }.compact .icon { font-size: 22px; height: 48px; width: 48px; }.compact h3 { font-size: 15px; margin-top: 11px; }.compact p { font-size: 13px; margin-top: 4px; }.compact button { margin-top: 13px; }.dark .tone-success .icon { color: #4ade80; }.dark .tone-warning .icon { color: #fbbf24; }.dark .tone-error .icon { color: #f87171; }
</style>
