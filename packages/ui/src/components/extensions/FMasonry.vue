<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, shallowRef, useTemplateRef, watch } from 'vue'

export type MasonryColumns = number | Record<number, number>

interface Props {
  columns?: MasonryColumns
  gap?: string | number
  tag?: string
  ariaLabel?: string
}

const props = withDefaults(defineProps<Props>(), { columns: 1, gap: '16px', tag: 'div', ariaLabel: undefined })
const root = useTemplateRef<HTMLElement>('root')
const width = shallowRef(0)
let observer: ResizeObserver | undefined

const columnCount = computed(() => {
  if (typeof props.columns === 'number') return Math.max(1, Math.floor(props.columns))
  return Object.entries(props.columns)
    .map(([breakpoint, columns]) => [Number(breakpoint), Math.max(1, Math.floor(columns))] as const)
    .filter(([breakpoint]) => Number.isFinite(breakpoint))
    .sort(([a], [b]) => a - b)
    .reduce((current, [breakpoint, columns]) => width.value >= breakpoint ? columns : current, 1)
})
const style = computed(() => {
  const gap = typeof props.gap === 'number' ? `${props.gap}px` : props.gap
  return { columnCount: String(columnCount.value), columnGap: gap, '--f-masonry-gap': gap }
})

function refresh() { width.value = root.value?.clientWidth ?? 0 }

onMounted(() => {
  refresh()
  if (typeof ResizeObserver !== 'undefined' && root.value) { observer = new ResizeObserver(refresh); observer.observe(root.value) }
})
onBeforeUnmount(() => observer?.disconnect())
watch(() => props.columns, refresh, { deep: true })

defineExpose({ refresh })
</script>

<template>
  <component :is="props.tag" ref="root" class="f-masonry" :style="style" :aria-label="props.ariaLabel"><slot /></component>
</template>

<style scoped>
.f-masonry{width:100%}.f-masonry :deep(> *){break-inside:avoid;display:inline-block;margin:0 0 var(--f-masonry-gap,16px);width:100%}
</style>
