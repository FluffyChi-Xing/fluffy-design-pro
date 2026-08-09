<script setup lang="ts">
import { computed, ref } from 'vue'

const name = ref('Fluffy')
const notes = ref('用于中后台项目的轻量组件基础。')
const role = ref('editor')
const enabled = ref(true)
const loading = ref(false)
const formSummary = computed(() => `${name.value || '未命名'} · ${role.value} · ${enabled.value ? '已启用' : '已停用'}`)

function simulateLoading() {
  loading.value = true
  window.setTimeout(() => { loading.value = false }, 900)
}
</script>

<template>
  <div class="form-preview">
    <div class="button-row">
      <button class="button button-primary" :disabled="loading" @click="simulateLoading">
        {{ loading ? '保存中…' : '主要按钮' }}
      </button>
      <button class="button button-secondary" type="button">次要操作</button>
      <button class="button button-ghost" type="button">幽灵按钮</button>
      <button class="button button-danger" type="button">危险操作</button>
    </div>
    <div class="field-grid">
      <label class="field">
        <span class="field-label">名称 <b>*</b></span>
        <input v-model="name" class="field-control" type="text" placeholder="输入名称">
        <small class="field-help">FFormItem 可传递 id 与 describedBy。</small>
      </label>
      <label class="field">
        <span class="field-label">角色</span>
        <select v-model="role" class="field-control">
          <option value="owner">Owner</option>
          <option value="editor">Editor</option>
          <option value="viewer">Viewer</option>
        </select>
      </label>
      <label class="field field-wide">
        <span class="field-label">说明</span>
        <textarea v-model="notes" class="field-control" rows="3" />
      </label>
      <label class="checkbox-row">
        <input v-model="enabled" type="checkbox">
        启用项目
      </label>
    </div>
    <output class="summary">{{ formSummary }}</output>
  </div>
</template>

<style scoped>
.form-preview { display: grid; gap: 20px; }
.button-row { display: flex; flex-wrap: wrap; gap: 10px; }
.button { border: 1px solid transparent; border-radius: 7px; cursor: pointer; font: inherit; font-size: 13px; font-weight: 600; padding: 8px 12px; transition: background-color .16s ease, border-color .16s ease, transform .16s ease; }
.button:active { transform: scale(.98); }
.button:disabled { cursor: wait; opacity: .65; }
.button-primary { background: var(--vp-c-brand-1); color: #fff; }
.button-secondary { background: var(--vp-c-bg-elv); border-color: var(--vp-c-border); color: var(--vp-c-text-1); }
.button-ghost { background: transparent; color: var(--vp-c-brand-1); }
.button-danger { background: #dc2626; color: #fff; }
.field-grid { display: grid; gap: 16px; grid-template-columns: repeat(2, minmax(0, 1fr)); }
.field { display: grid; gap: 7px; }
.field-wide { grid-column: 1 / -1; }
.field-label { color: var(--vp-c-text-1); font-size: 13px; font-weight: 600; }
.field-label b { color: #dc2626; }
.field-control { background: var(--vp-c-bg-elv); border: 1px solid var(--vp-c-border); border-radius: 7px; color: var(--vp-c-text-1); font: inherit; font-size: 13px; padding: 8px 10px; width: 100%; }
.field-control:focus { border-color: var(--vp-c-brand-1); outline: 2px solid var(--vp-c-brand-soft); outline-offset: 1px; }
.field-help { color: var(--vp-c-text-2); font-size: 12px; }
.checkbox-row { align-items: center; color: var(--vp-c-text-1); display: flex; font-size: 13px; gap: 8px; }
.summary { background: var(--vp-c-bg-soft); border-radius: 7px; color: var(--vp-c-text-2); font-family: var(--vp-font-family-mono); font-size: 12px; padding: 10px; }
@media (max-width: 620px) { .field-grid { grid-template-columns: 1fr; } }
</style>
