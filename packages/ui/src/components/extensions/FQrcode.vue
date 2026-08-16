<script setup lang="ts">
import QRCode from 'qrcode'
import { nextTick, onMounted, shallowRef, useTemplateRef, watch } from 'vue'

export type QrcodeErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H'

interface Props {
  value: string
  size?: number
  margin?: number
  errorCorrectionLevel?: QrcodeErrorCorrectionLevel
  foreground?: string
  background?: string
  ariaLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 160, margin: 4, errorCorrectionLevel: 'M', foreground: '#111827', background: '#ffffff', ariaLabel: 'QR code',
})
const emit = defineEmits<{ ready: []; error: [error: Error] }>()
const canvas = useTemplateRef<HTMLCanvasElement>('canvas')
const message = shallowRef('')

async function redraw() {
  await nextTick()
  const element = canvas.value
  if (!element) return
  const size = Math.min(2048, Math.max(32, Math.round(props.size)))
  if (!props.value.trim()) { message.value = 'QR code content is required.'; emit('error', new Error(message.value)); return }
  try {
    const qr = QRCode.create(props.value, { errorCorrectionLevel: props.errorCorrectionLevel })
    const modules = qr.modules.size
    const margin = Math.max(0, Math.floor(props.margin))
    const ratio = typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1
    element.width = size * ratio
    element.height = size * ratio
    element.style.width = `${size}px`
    element.style.height = `${size}px`
    const context = element.getContext('2d')
    if (!context) throw new Error('Canvas is unavailable.')
    context.setTransform(ratio, 0, 0, ratio, 0, 0)
    context.fillStyle = props.background
    context.fillRect(0, 0, size, size)
    const moduleSize = size / (modules + margin * 2)
    context.fillStyle = props.foreground
    qr.modules.data.forEach((dark, index) => {
      if (!dark) return
      const x = index % modules
      const y = Math.floor(index / modules)
      context.fillRect(Math.round((x + margin) * moduleSize), Math.round((y + margin) * moduleSize), Math.ceil(moduleSize), Math.ceil(moduleSize))
    })
    message.value = ''
    emit('ready')
  } catch (error) {
    message.value = error instanceof Error ? error.message : 'Unable to generate QR code.'
    emit('error', error instanceof Error ? error : new Error(message.value))
  }
}

function toDataURL(type?: string, quality?: number) { return canvas.value?.toDataURL(type, quality) ?? '' }
function toBlob(type?: string, quality?: number) { return new Promise<Blob | null>((resolve) => canvas.value?.toBlob(resolve, type, quality) ?? resolve(null)) }

onMounted(redraw)
watch(() => [props.value, props.size, props.margin, props.errorCorrectionLevel, props.foreground, props.background], redraw)
defineExpose({ redraw, toDataURL, toBlob })
</script>

<template>
  <div class="f-qrcode">
    <canvas ref="canvas" role="img" :aria-label="props.ariaLabel" />
    <p v-if="message" class="f-qrcode-error" role="status">{{ message }}</p>
  </div>
</template>

<style scoped>
.f-qrcode{display:inline-grid;gap:8px}.f-qrcode canvas{background:var(--surface);border-radius:var(--radius-sm);display:block;max-width:100%}.f-qrcode-error{color:var(--danger);font-size:12px;margin:0}
</style>
