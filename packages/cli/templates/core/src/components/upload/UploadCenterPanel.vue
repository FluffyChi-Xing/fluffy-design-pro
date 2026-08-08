<script setup lang="ts">
import { computed, ref } from 'vue'
import FTabs from '@/components/ui/FTabs.vue'
import FUploadProgress from '@/components/ui/FUploadProgress.vue'
import { useUploadStore } from '@/stores/upload'

const store = useUploadStore()
const activeTab = ref('uploading')

const tabs = computed(() => [
  { key: 'uploading', labelKey: 'upload.tab.uploading', count: store.inProgress.length },
  { key: 'done', labelKey: 'upload.tab.done', count: store.completed.length },
  { key: 'failed', labelKey: 'upload.tab.failed', count: store.failed.length }
])

const visibleTasks = computed(() => {
  switch (activeTab.value) {
    case 'done': return store.completed
    case 'failed': return store.failed
    default: return store.inProgress
  }
})
</script>

<template>
  <div class="upload-center-panel">
    <header class="upload-center-header"><strong>{{ $t('upload.center.title') }}</strong><button v-if="store.completed.length" type="button" class="upload-center-action" @click="store.clearCompleted()">{{ $t('upload.center.clearCompleted') }}</button></header>
    <div class="upload-center-tabs"><FTabs v-model="activeTab" :items="tabs" /></div>
    <ul v-if="visibleTasks.length" class="upload-center-list"><li v-for="task in visibleTasks" :key="task.id"><FUploadProgress :task="task" /></li></ul>
    <div v-else class="upload-center-empty">{{ $t('upload.center.empty') }}</div>
    <footer class="upload-center-footer"><button type="button" class="upload-center-action">{{ $t('upload.center.manage') }}</button></footer>
  </div>
</template>

<style scoped>
.upload-center-panel{display:flex;flex-direction:column}.upload-center-header{align-items:center;display:flex;justify-content:space-between;padding:8px 10px 6px}.upload-center-header strong{color:var(--foreground);font-size:13px;font-weight:650}.upload-center-action{background:transparent;border:0;color:var(--primary);cursor:pointer;font-size:12px;padding:4px 6px}.upload-center-action:hover{text-decoration:underline}.upload-center-tabs{padding:0 8px}.upload-center-list{display:grid;gap:4px;list-style:none;margin:0;padding:8px 10px;max-height:280px;overflow-y:auto}.upload-center-list li{border-radius:var(--radius-sm);padding:8px 8px}.upload-center-list li:hover{background:var(--surface-hover)}.upload-center-empty{color:var(--muted-foreground);font-size:12px;padding:22px;text-align:center}.upload-center-footer{border-top:1px solid var(--border);padding:6px 8px}.upload-center-footer .upload-center-action{color:var(--muted-foreground);text-align:center;width:100%}.upload-center-footer .upload-center-action:hover{color:var(--foreground);text-decoration:none}
</style>
