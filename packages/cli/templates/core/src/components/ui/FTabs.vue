<script setup lang="ts">
interface TabItem {
  key: string
  labelKey: string
  count?: number
}

interface Props {
  items: TabItem[]
}
const props = defineProps<Props>()
const activeKey = defineModel<string>({ default: '' })
</script>

<template>
  <div class="f-tabs" role="tablist">
    <button v-for="item in props.items" :key="item.key" type="button" role="tab" class="f-tabs-item" :class="{ 'f-tabs-item-active': activeKey === item.key }" :aria-selected="activeKey === item.key" @click="activeKey = item.key">
      {{ $t(item.labelKey) }}<span v-if="item.count !== undefined" class="f-tabs-count">{{ item.count }}</span>
    </button>
  </div>
</template>

<style scoped>
.f-tabs{border-bottom:1px solid var(--border);display:flex;gap:4px}.f-tabs-item{align-items:center;background:transparent;border:0;border-bottom:2px solid transparent;color:var(--muted-foreground);cursor:pointer;display:inline-flex;font:inherit;font-size:13px;gap:6px;padding:8px 10px;transition:color 140ms ease,border-color 140ms ease}.f-tabs-item:hover{color:var(--foreground)}.f-tabs-item-active{border-bottom-color:var(--primary);color:var(--primary);font-weight:650}.f-tabs-count{align-items:center;background:var(--surface-hover);border-radius:999px;color:var(--subtle-foreground);display:inline-flex;font-size:11px;height:17px;justify-content:center;min-width:17px;padding:0 5px}
</style>
