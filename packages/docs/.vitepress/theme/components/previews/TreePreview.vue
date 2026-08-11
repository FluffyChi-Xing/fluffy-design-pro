<script setup lang="ts">
import { computed, defineComponent, h, ref, type PropType } from 'vue'

interface Node { key: string; label: string; children?: Node[] }
const nodes: Node[] = [{ key: 'workspace', label: 'workspace', children: [{ key: 'src', label: 'src', children: [{ key: 'main', label: 'main.ts' }, { key: 'pages', label: 'pages' }] }, { key: 'package', label: 'package.json' }] }, { key: 'cms', label: 'cms', children: [{ key: 'read', label: 'content:read' }, { key: 'write', label: 'content:write' }] }]

const expanded = ref(new Set(['workspace', 'src', 'cms']))
const selected = ref<string>()
const checked = ref(new Set<string>())

function flattenTree(list: readonly Node[]): Node[] {
  return list.flatMap((node) => [node, ...flattenTree(node.children ?? [])])
}
function descendantKeys(node: Node): string[] {
  return flattenTree([node]).map((item) => item.key)
}
function toggleExpanded(key: string) {
  const next = new Set(expanded.value)
  next.has(key) ? next.delete(key) : next.add(key)
  expanded.value = next
}
function toggleChecked(key: string, value: boolean) {
  const node = flattenTree(nodes).find((item) => item.key === key)
  if (!node) return
  const next = new Set(checked.value)
  for (const item of descendantKeys(node)) value ? next.add(item) : next.delete(item)
  checked.value = next
}
function nodeState(node: Node): 'checked' | 'indeterminate' | 'unchecked' {
  const keys = descendantKeys(node)
  if (keys.length === 1) return checked.value.has(node.key) ? 'checked' : 'unchecked'
  const count = keys.filter((key) => checked.value.has(key)).length
  if (count === keys.length) return 'checked'
  if (count > 0) return 'indeterminate'
  return 'unchecked'
}

const TreeNode = defineComponent({
  name: 'TreePreviewNode',
  props: { node: { type: Object as PropType<Node>, required: true } },
  setup(props) {
    return () => {
      const node = props.node
      const hasChildren = Boolean(node.children?.length)
      const children = hasChildren && expanded.value.has(node.key)
        ? h('ul', { class: 'children' }, node.children!.map((child) => h(TreeNode, { node: child })))
        : null
      return h('li', { class: 'tree-item' }, [
        h('div', { class: ['row', { selected: selected.value === node.key }] }, [
          hasChildren
            ? h('button', { type: 'button', class: 'expander', 'aria-expanded': expanded.value.has(node.key), onClick: () => toggleExpanded(node.key) }, expanded.value.has(node.key) ? '⌄' : '›')
            : h('span', { class: 'expander' }),
          h('input', { type: 'checkbox', checked: nodeState(node) === 'checked', indeterminate: nodeState(node) === 'indeterminate', onChange: (event: Event) => toggleChecked(node.key, (event.target as HTMLInputElement).checked) }),
          h('button', { type: 'button', class: 'label', onClick: () => (selected.value = node.key) }, node.label)
        ]),
        children
      ])
    }
  }
})

const checkedLabel = computed(() => [...checked.value].join(', ') || '—')
</script>

<template>
  <div class="tree-preview">
    <ul role="tree" class="tree"><TreeNode v-for="node in nodes" :key="node.key" :node="node" /></ul>
    <output>selected: {{ selected ?? '—' }} · checked: {{ checkedLabel }}</output>
  </div>
</template>

<style scoped>
.tree-preview { display: grid; gap: 12px; }.tree, .children { list-style: none; margin: 0; padding: 0; }.children { padding-inline-start: 18px; }.row { align-items: center; border-radius: 6px; display: flex; gap: 7px; min-height: 30px; }.row.selected { background: var(--vp-c-brand-soft); }.expander { background: transparent; border: 0; color: var(--vp-c-text-2); cursor: pointer; display: inline-grid; font-size: 15px; height: 22px; place-items: center; width: 22px; }.label { background: transparent; border: 0; color: var(--vp-c-text-1); cursor: pointer; font: inherit; padding: 3px; text-align: start; }input { accent-color: var(--vp-c-brand-1); }output { background: var(--vp-c-bg-soft); border-radius: 6px; color: var(--vp-c-text-2); font-family: var(--vp-font-family-mono); font-size: 12px; padding: 9px; }
</style>
