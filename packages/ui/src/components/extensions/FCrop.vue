<script setup lang="ts">
import { computed, shallowRef, useTemplateRef } from 'vue'

export interface CropRect { x: number; y: number; width: number; height: number }
export interface CropReady { width: number; height: number }

type DragMode = 'move' | 'resize' | null

interface Props {
  src: string
  modelValue?: CropRect
  aspectRatio?: number
  minWidth?: number
  minHeight?: number
  outputWidth?: number
  outputHeight?: number
  disabled?: boolean
  alt?: string
  ariaLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: undefined,
  aspectRatio: undefined,
  minWidth: 1,
  minHeight: 1,
  outputWidth: undefined,
  outputHeight: undefined,
  disabled: false,
  alt: '',
  ariaLabel: 'Image crop area',
})

const emit = defineEmits<{
  'update:modelValue': [value: CropRect]
  ready: [value: CropReady]
  change: [value: CropRect]
  error: [error: Error]
}>()

const image = useTemplateRef<HTMLImageElement>('image')
const natural = shallowRef<CropReady | null>(null)
const crop = shallowRef<CropRect>({ x: 0, y: 0, width: 0, height: 0 })
const drag = shallowRef<{ mode: DragMode; x: number; y: number; crop: CropRect } | null>(null)

const cropStyle = computed(() => {
  const element = image.value
  const size = natural.value
  if (!element || !size || !crop.value.width) return {}
  const scale = element.clientWidth / size.width
  return {
    left: `${crop.value.x * scale}px`, top: `${crop.value.y * scale}px`,
    width: `${crop.value.width * scale}px`, height: `${crop.value.height * scale}px`,
  }
})

function normalize(next: CropRect) {
  const size = natural.value
  if (!size) return next
  const minWidth = Math.min(Math.max(1, props.minWidth), size.width)
  const minHeight = Math.min(Math.max(1, props.minHeight), size.height)
  let width = Math.max(minWidth, Math.min(next.width, size.width))
  let height = Math.max(minHeight, Math.min(next.height, size.height))
  if (props.aspectRatio && Number.isFinite(props.aspectRatio) && props.aspectRatio > 0) {
    height = width / props.aspectRatio
    if (height > size.height) { height = size.height; width = height * props.aspectRatio }
  }
  const x = Math.max(0, Math.min(next.x, size.width - width))
  const y = Math.max(0, Math.min(next.y, size.height - height))
  return { x, y, width, height }
}

function update(next: CropRect, changed = false) {
  crop.value = normalize(next)
  emit('update:modelValue', crop.value)
  if (changed) emit('change', crop.value)
}

function load() {
  const element = image.value
  if (!element) return
  natural.value = { width: element.naturalWidth, height: element.naturalHeight }
  const initial = props.modelValue ?? { x: 0, y: 0, width: element.naturalWidth, height: element.naturalHeight }
  update(initial)
  emit('ready', natural.value)
}

function start(event: PointerEvent, mode: DragMode) {
  if (props.disabled || !natural.value || !image.value) return
  const target = event.currentTarget as HTMLElement
  target.setPointerCapture?.(event.pointerId)
  drag.value = { mode, x: event.clientX, y: event.clientY, crop: { ...crop.value } }
}

function move(event: PointerEvent) {
  const active = drag.value
  const element = image.value
  if (!active || !element || !natural.value) return
  const scale = natural.value.width / element.clientWidth
  const dx = (event.clientX - active.x) * scale
  const dy = (event.clientY - active.y) * scale
  if (active.mode === 'move') update({ ...active.crop, x: active.crop.x + dx, y: active.crop.y + dy })
  if (active.mode === 'resize') update({ ...active.crop, width: active.crop.width + dx, height: active.crop.height + dy })
}

function end() {
  if (!drag.value) return
  drag.value = null
  emit('change', crop.value)
}

function keydown(event: KeyboardEvent) {
  if (props.disabled || !natural.value) return
  const step = event.shiftKey ? 10 : 1
  const delta = event.key === 'ArrowLeft' ? [-step, 0] : event.key === 'ArrowRight' ? [step, 0] : event.key === 'ArrowUp' ? [0, -step] : event.key === 'ArrowDown' ? [0, step] : null
  if (!delta) return
  event.preventDefault()
  if (event.altKey) update({ ...crop.value, width: crop.value.width + delta[0], height: crop.value.height + delta[1] }, true)
  else update({ ...crop.value, x: crop.value.x + delta[0], y: crop.value.y + delta[1] }, true)
}

function getCanvas() {
  const source = image.value
  if (!source || !natural.value) throw new Error('The image is not ready to crop.')
  const canvas = document.createElement('canvas')
  const width = props.outputWidth ?? crop.value.width
  const height = props.outputHeight ?? crop.value.height
  canvas.width = Math.max(1, Math.round(width))
  canvas.height = Math.max(1, Math.round(height))
  canvas.getContext('2d')?.drawImage(source, crop.value.x, crop.value.y, crop.value.width, crop.value.height, 0, 0, canvas.width, canvas.height)
  return canvas
}

function toBlob(type = 'image/png', quality?: number) {
  return new Promise<Blob | null>((resolve) => {
    try { getCanvas().toBlob(resolve, type, quality) } catch (error) { emit('error', error instanceof Error ? error : new Error('Unable to export crop.')); resolve(null) }
  })
}

function reset() { if (natural.value) update({ x: 0, y: 0, width: natural.value.width, height: natural.value.height }, true) }

defineExpose({ getCanvas, toBlob, reset })
</script>

<template>
  <div class="f-crop" :class="{ 'f-crop-disabled': props.disabled }">
    <div class="f-crop-stage" @pointermove="move" @pointerup="end" @pointercancel="end">
      <img ref="image" class="f-crop-image" :src="props.src" :alt="props.alt" crossorigin="anonymous" @load="load" @error="emit('error', new Error('Unable to load image.'))">
      <div v-if="natural" class="f-crop-frame" :style="cropStyle" tabindex="0" role="group" :aria-label="props.ariaLabel" :aria-valuetext="`${Math.round(crop.x)}, ${Math.round(crop.y)}, ${Math.round(crop.width)} × ${Math.round(crop.height)}`" @pointerdown="start($event, 'move')" @keydown="keydown">
        <span class="f-crop-handle" aria-hidden="true" @pointerdown.stop="start($event, 'resize')" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.f-crop{background:var(--surface-hover);border:1px solid var(--border);border-radius:var(--radius-md);overflow:hidden}.f-crop-stage{display:inline-block;line-height:0;max-width:100%;position:relative}.f-crop-image{display:block;max-width:100%;user-select:none}.f-crop-frame{border:2px solid var(--primary);box-shadow:0 0 0 9999px oklch(0.1 0 0 / .42);cursor:move;line-height:normal;outline:none;position:absolute}.f-crop-frame:focus-visible{box-shadow:0 0 0 2px var(--surface),0 0 0 4px var(--ring),0 0 0 9999px oklch(0.1 0 0 / .42)}.f-crop-handle{background:var(--surface);border:2px solid var(--primary);bottom:-7px;cursor:nwse-resize;height:14px;position:absolute;right:-7px;width:14px}.f-crop-disabled{opacity:.6}.f-crop-disabled .f-crop-frame,.f-crop-disabled .f-crop-handle{cursor:not-allowed}@media (prefers-reduced-motion:reduce){.f-crop *{transition:none}}
</style>
