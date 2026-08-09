<script setup lang="ts">
defineProps<{
  title: string
  status: '独立可用' | '需要运行时上下文' | '可选集成'
  description: string
}>()
</script>

<template>
  <section class="preview">
    <header class="preview-header">
      <div>
        <p class="preview-kicker">交互预览</p>
        <h3 class="preview-title">{{ title }}</h3>
      </div>
      <span class="preview-status" :data-status="status">{{ status }}</span>
    </header>
    <p class="preview-description">{{ description }}</p>
    <div class="preview-canvas"><slot /></div>
  </section>
</template>

<style scoped>
.preview { border: 1px solid var(--vp-c-border); border-radius: 12px; margin: 24px 0; overflow: hidden; }
.preview-header { align-items: flex-start; background: var(--vp-c-bg-soft); display: flex; gap: 16px; justify-content: space-between; padding: 18px 20px 0; }
.preview-kicker { color: var(--vp-c-brand-1); font-size: 12px; font-weight: 700; letter-spacing: .08em; margin: 0; text-transform: uppercase; }
.preview-title { font-size: 16px; margin: 5px 0 0; }
.preview-status { border-radius: 999px; font-size: 12px; font-weight: 600; padding: 4px 9px; white-space: nowrap; }
.preview-status[data-status='独立可用'] { background: var(--vp-c-brand-soft); color: var(--vp-c-brand-1); }
.preview-status[data-status='需要运行时上下文'] { background: color-mix(in srgb, #d97706 13%, transparent); color: #a16207; }
.preview-status[data-status='可选集成'] { background: color-mix(in srgb, #0891b2 13%, transparent); color: #0e7490; }
.preview-description { color: var(--vp-c-text-2); font-size: 13px; margin: 8px 20px 18px; }
.preview-canvas { background: var(--vp-c-bg); border-top: 1px solid var(--vp-c-border); padding: 20px; }
.dark .preview-status[data-status='需要运行时上下文'] { color: #fbbf24; }
.dark .preview-status[data-status='可选集成'] { color: #67e8f9; }
</style>
