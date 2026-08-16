<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, shallowRef, useTemplateRef, watch } from 'vue'

interface Props {
  content?: string
  image?: string
  width?: number
  height?: number
  gapX?: number
  gapY?: number
  rotate?: number
  opacity?: number
  fontSize?: number
  fontWeight?: string | number
  color?: string
  zIndex?: number
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  content: '', image: '', width: 180, height: 120, gapX: 80, gapY: 60, rotate: -22,
  opacity: .12, fontSize: 14, fontWeight: 500, color: 'var(--foreground)', zIndex: 1, disabled: false,
})

const root = useTemplateRef<HTMLElement>('root')
const overlay = useTemplateRef<HTMLElement>('overlay')
const frame = shallowRef<number | null>(null)
let observer: ResizeObserver | undefined

function finite(value: number, fallback: number) { return Number.isFinite(value) ? value : fallback }
function refresh() {
  if (frame.value !== null) cancelAnimationFrame(frame.value)
  frame.value = requestAnimationFrame(() => {
    frame.value = null
    const host = root.value
    const layer = overlay.value
    if (!host || !layer) return
    layer.replaceChildren()
    if (props.disabled || (!props.content && !props.image)) return
    const width = Math.max(1, finite(props.width, 180))
    const height = Math.max(1, finite(props.height, 120))
    const gapX = Math.max(0, finite(props.gapX, 80))
    const gapY = Math.max(0, finite(props.gapY, 60))
    const fragment = document.createDocumentFragment()
    const columns = Math.ceil(host.clientWidth / (width + gapX)) + 1
    const rows = Math.ceil(host.clientHeight / (height + gapY)) + 1
    for (let row = 0; row < rows; row += 1) for (let column = 0; column < columns; column += 1) {
      const tile = document.createElement('span')
      tile.className = 'f-watermark-tile'
      Object.assign(tile.style, { width: `${width}px`, height: `${height}px`, left: `${column * (width + gapX)}px`, top: `${row * (height + gapY)}px`, opacity: String(Math.min(1, Math.max(0, props.opacity))), transform: `rotate(${finite(props.rotate, -22)}deg)`, color: props.color, fontSize: `${Math.max(1, finite(props.fontSize, 14))}px`, fontWeight: String(props.fontWeight) })
      if (props.image) {
        const image = document.createElement('img')
        image.src = props.image
        image.alt = ''
        image.draggable = false
        image.setAttribute('aria-hidden', 'true')
        tile.append(image)
      } else tile.textContent = props.content
      fragment.append(tile)
    }
    layer.append(fragment)
  })
}

onMounted(async () => {
  await nextTick()
  refresh()
  if (typeof ResizeObserver !== 'undefined' && root.value) { observer = new ResizeObserver(refresh); observer.observe(root.value) }
})
onBeforeUnmount(() => { observer?.disconnect(); if (frame.value !== null) cancelAnimationFrame(frame.value) })
watch(() => [props.content, props.image, props.width, props.height, props.gapX, props.gapY, props.rotate, props.opacity, props.fontSize, props.fontWeight, props.color, props.zIndex, props.disabled], refresh)

defineExpose({ refresh })
</script>

<template>
  <div ref="root" class="f-watermark">
    <slot />
    <div ref="overlay" class="f-watermark-overlay" aria-hidden="true" :style="{ zIndex: props.zIndex }" />
  </div>
</template>

<style scoped>
.f-watermark{position:relative}.f-watermark-overlay{inset:0;overflow:hidden;pointer-events:none;position:absolute}.f-watermark-overlay :deep(.f-watermark-tile){align-items:center;display:flex;justify-content:center;position:absolute;text-align:center;user-select:none;white-space:pre-wrap}.f-watermark-overlay :deep(.f-watermark-tile img){max-height:100%;max-width:100%;object-fit:contain}
</style>
