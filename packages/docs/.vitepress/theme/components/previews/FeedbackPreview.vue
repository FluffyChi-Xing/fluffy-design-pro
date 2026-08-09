<script setup lang="ts">
import { computed, ref } from 'vue'

const progress = ref(64)
const codeCollapsed = ref(false)
const code = "const project = createFluffyProject({\n  themeColor: '#4f46e5'\n})"
const progressLabel = computed(() => `${progress.value}%`)
</script>

<template>
  <div class="feedback-preview">
    <div class="feedback-grid">
      <article class="surface-card">
        <div class="surface-title">FPanel</div>
        <p>面板用于承载独立的内容区块。</p>
        <div class="mini-row"><span class="spinner" aria-label="加载中" /><span>FSpinner 加载中</span></div>
      </article>
      <article class="surface-card">
        <div class="surface-title">FSkeleton</div>
        <div class="skeleton skeleton-short" /><div class="skeleton" /><div class="skeleton skeleton-medium" />
      </article>
    </div>
    <div class="result-grid">
      <div class="result result-success"><strong>成功</strong><span>项目已创建</span></div>
      <div class="result result-warning"><strong>注意</strong><span>还有 2 项配置</span></div>
      <div class="result result-error"><strong>错误</strong><span>请求暂时失败</span></div>
    </div>
    <div class="progress-area">
      <div class="progress-head"><strong>FProgress</strong><span>{{ progressLabel }}</span></div>
      <input v-model.number="progress" type="range" min="0" max="100" aria-label="进度">
      <div class="progress-track"><span :style="{ width: `${progress}%` }" /></div>
    </div>
    <div class="code-card">
      <div class="code-head"><span>FCode · ts</span><button type="button" @click="codeCollapsed = !codeCollapsed">{{ codeCollapsed ? '展开' : '折叠' }}</button></div>
      <pre v-if="!codeCollapsed"><code>{{ code }}</code></pre>
    </div>
  </div>
</template>

<style scoped>
.feedback-preview { display: grid; gap: 18px; }
.feedback-grid, .result-grid { display: grid; gap: 12px; grid-template-columns: repeat(2, minmax(0, 1fr)); }
.surface-card, .code-card, .progress-area { background: var(--vp-c-bg-elv); border: 1px solid var(--vp-c-border); border-radius: 9px; padding: 15px; }
.surface-title, .progress-head { display: flex; font-size: 13px; font-weight: 700; justify-content: space-between; }
.surface-card p, .mini-row { color: var(--vp-c-text-2); font-size: 12px; }
.mini-row { align-items: center; display: flex; gap: 8px; }
.spinner { animation: spin .8s linear infinite; border: 2px solid var(--vp-c-brand-soft); border-radius: 50%; border-top-color: var(--vp-c-brand-1); display: inline-block; height: 15px; width: 15px; }
.skeleton { background: var(--vp-c-bg-soft); border-radius: 5px; height: 14px; margin-top: 10px; }
.skeleton-short { width: 42%; }.skeleton-medium { width: 72%; }
.result { border-left: 3px solid; border-radius: 6px; display: grid; font-size: 12px; gap: 4px; padding: 11px 13px; }.result span { color: var(--vp-c-text-2); }.result-success { border-color: #16a34a; background: color-mix(in srgb, #16a34a 10%, transparent); }.result-warning { border-color: #d97706; background: color-mix(in srgb, #d97706 10%, transparent); }.result-error { border-color: #dc2626; background: color-mix(in srgb, #dc2626 10%, transparent); }
.progress-head { margin-bottom: 10px; }.progress-head span { color: var(--vp-c-brand-1); }.progress-area input { accent-color: var(--vp-c-brand-1); width: 100%; }.progress-track { background: var(--vp-c-bg-soft); border-radius: 999px; height: 8px; overflow: hidden; }.progress-track span { background: var(--vp-c-brand-1); border-radius: inherit; display: block; height: 100%; transition: width .2s ease; }
.code-head { align-items: center; color: var(--vp-c-text-2); display: flex; font-size: 12px; justify-content: space-between; }.code-head button { background: transparent; border: 0; color: var(--vp-c-brand-1); cursor: pointer; font: inherit; }.code-card pre { background: var(--vp-code-block-bg); border-radius: 6px; margin: 12px 0 0; overflow: auto; padding: 12px; }.code-card code { font-size: 12px; }
@keyframes spin { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) { .spinner { animation: none; } }
@media (max-width: 620px) { .feedback-grid, .result-grid { grid-template-columns: 1fr; } }
</style>
