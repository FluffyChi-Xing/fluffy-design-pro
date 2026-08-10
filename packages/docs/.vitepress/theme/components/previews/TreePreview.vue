<script setup lang="ts">
import { computed, ref } from 'vue'

interface Node { key: string; label: string; children?: Node[] }
const nodes: Node[] = [{ key: 'workspace', label: 'workspace', children: [{ key: 'src', label: 'src', children: [{ key: 'main', label: 'main.ts' }, { key: 'pages', label: 'pages' }] }, { key: 'package', label: 'package.json' }] }, { key: 'cms', label: 'cms', children: [{ key: 'read', label: 'content:read' }, { key: 'write', label: 'content:write' }] }]
const expanded = ref(new Set(['workspace', 'src', 'cms']))
const selected = ref<string>()
const checked = ref(new Set<string>())
function toggleExpanded(key: string) { const next = new Set(expanded.value); next.has(key) ? next.delete(key) : next.add(key); expanded.value = next }
function toggleChecked(key: string) { const next = new Set(checked.value); next.has(key) ? next.delete(key) : next.add(key); checked.value = next }
const checkedLabel = computed(() => [...checked.value].join(', ') || '—')
</script>

<template>
  <div class="tree-preview">
    <ul role="tree" class="tree"><template v-for="node in nodes" :key="node.key"><li class="tree-item"><div class="row" :class="{ selected: selected === node.key }"><button v-if="node.children" type="button" class="expander" :aria-expanded="expanded.has(node.key)" @click="toggleExpanded(node.key)">{{ expanded.has(node.key) ? '⌄' : '›' }}</button><span v-else class="expander" /><input type="checkbox" :checked="checked.has(node.key)" @change="toggleChecked(node.key)"><button type="button" class="label" @click="selected = node.key">{{ node.label }}</button></div><ul v-if="node.children && expanded.has(node.key)" class="children"><li v-for="child in node.children" :key="child.key"><div class="row" :class="{ selected: selected === child.key }"><button v-if="child.children" type="button" class="expander" :aria-expanded="expanded.has(child.key)" @click="toggleExpanded(child.key)">{{ expanded.has(child.key) ? '⌄' : '›' }}</button><span v-else class="expander" /><input type="checkbox" :checked="checked.has(child.key)" @change="toggleChecked(child.key)"><button type="button" class="label" @click="selected = child.key">{{ child.label }}</button></div><ul v-if="child.children && expanded.has(child.key)" class="children"><li v-for="leaf in child.children" :key="leaf.key"><div class="row" :class="{ selected: selected === leaf.key }"><span class="expander" /><input type="checkbox" :checked="checked.has(leaf.key)" @change="toggleChecked(leaf.key)"><button type="button" class="label" @click="selected = leaf.key">{{ leaf.label }}</button></div></li></ul></li></ul></li></template></ul>
    <output>selected: {{ selected ?? '—' }} · checked: {{ checkedLabel }}</output>
  </div>
</template>

<style scoped>
.tree-preview { display: grid; gap: 12px; }.tree, .children { list-style: none; margin: 0; padding: 0; }.children { padding-inline-start: 18px; }.row { align-items: center; border-radius: 6px; display: flex; gap: 7px; min-height: 30px; }.row.selected { background: var(--vp-c-brand-soft); }.expander { background: transparent; border: 0; color: var(--vp-c-text-2); cursor: pointer; display: inline-grid; font-size: 15px; height: 22px; place-items: center; width: 22px; }.label { background: transparent; border: 0; color: var(--vp-c-text-1); cursor: pointer; font: inherit; padding: 3px; text-align: start; }input { accent-color: var(--vp-c-brand-1); }output { background: var(--vp-c-bg-soft); border-radius: 6px; color: var(--vp-c-text-2); font-family: var(--vp-font-family-mono); font-size: 12px; padding: 9px; }
</style>
