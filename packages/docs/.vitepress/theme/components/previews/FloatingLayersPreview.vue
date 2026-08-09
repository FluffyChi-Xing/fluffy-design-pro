<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

const activeLayer = ref<'popover' | 'dropdown' | 'sheet' | null>(null)
const sheetOpen = ref(false)

function openLayer(layer: 'popover' | 'dropdown') {
  activeLayer.value = activeLayer.value === layer ? null : layer
}

function closeAll() {
  activeLayer.value = null
  sheetOpen.value = false
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') closeAll()
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <div class="layers-preview">
    <div class="layer-actions">
      <div class="layer-anchor">
        <button class="layer-button" type="button" @click="openLayer('popover')">打开 FPopover</button>
        <div v-if="activeLayer === 'popover'" class="layer-panel popover-panel">
          <strong>通知面板</strong><span>这里是锚定在触发器附近的内容。</span>
          <button class="text-button" type="button" @click="activeLayer = null">关闭</button>
        </div>
      </div>
      <div class="layer-anchor">
        <button class="layer-button" type="button" @click="openLayer('dropdown')">打开 FDropdown</button>
        <div v-if="activeLayer === 'dropdown'" class="layer-panel dropdown-panel">
          <button type="button" @click="closeAll">编辑项目</button>
          <button type="button" @click="closeAll">复制链接</button>
          <button type="button" @click="closeAll">删除项目</button>
        </div>
      </div>
      <button class="layer-button" type="button" @click="sheetOpen = true">打开 FSheet</button>
    </div>
    <div v-if="sheetOpen" class="sheet-backdrop" @click.self="sheetOpen = false">
      <aside class="sheet" aria-label="设置面板">
        <div class="sheet-head"><strong>设置面板</strong><button class="text-button" type="button" @click="sheetOpen = false">关闭</button></div>
        <p>FSheet 适合承载右侧滑入的配置和上下文操作。</p>
      </aside>
    </div>
    <p class="layer-hint">支持 `v-model:open`；按 Escape 可关闭当前浮层。</p>
  </div>
</template>

<style scoped>
.layers-preview { min-height: 180px; position: relative; }.layer-actions { align-items: flex-start; display: flex; flex-wrap: wrap; gap: 10px; }.layer-anchor { position: relative; }.layer-button { background: var(--vp-c-bg-elv); border: 1px solid var(--vp-c-border); border-radius: 7px; color: var(--vp-c-text-1); cursor: pointer; font: inherit; font-size: 13px; padding: 8px 11px; }.layer-button:hover { border-color: var(--vp-c-brand-1); color: var(--vp-c-brand-1); }.layer-panel { background: var(--vp-c-bg-elv); border: 1px solid var(--vp-c-border); border-radius: 8px; box-shadow: 0 12px 28px oklch(0.15 0.01 260 / .14); min-width: 190px; padding: 12px; position: absolute; top: calc(100% + 8px); z-index: 2; }.popover-panel { display: grid; gap: 6px; left: 0; }.popover-panel span, .layer-hint, .sheet p { color: var(--vp-c-text-2); font-size: 12px; }.dropdown-panel { display: grid; gap: 3px; left: 0; padding: 6px; }.dropdown-panel button { background: transparent; border: 0; border-radius: 5px; color: var(--vp-c-text-1); cursor: pointer; font: inherit; font-size: 12px; padding: 7px 9px; text-align: left; }.dropdown-panel button:hover { background: var(--vp-c-brand-soft); color: var(--vp-c-brand-1); }.text-button { background: transparent; border: 0; color: var(--vp-c-brand-1); cursor: pointer; font: inherit; font-size: 12px; padding: 0; text-align: left; }.layer-hint { margin: 48px 0 0; }.sheet-backdrop { background: oklch(0.1 0 0 / .38); inset: 0; position: fixed; z-index: 10; }.sheet { background: var(--vp-c-bg-elv); border-left: 1px solid var(--vp-c-border); box-shadow: -12px 0 30px oklch(0.15 0.01 260 / .16); height: 100%; max-width: 360px; padding: 22px; position: absolute; right: 0; top: 0; width: 86vw; }.sheet-head { align-items: center; display: flex; justify-content: space-between; }.sheet p { line-height: 1.7; }
</style>
