<script setup lang="ts">
import { computed, shallowRef, watch } from 'vue'

export interface VerityAttempt {
  completedAt: number
  durationMs: number
}

type VerityState = 'idle' | 'verifying' | 'verified' | 'failed'

interface Props {
  modelValue?: boolean
  verify?: (attempt: VerityAttempt) => boolean | Promise<boolean>
  disabled?: boolean
  resetKey?: string | number
  label?: string
  verifyingLabel?: string
  verifiedLabel?: string
  failedLabel?: string
  resetLabel?: string
  ariaLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  disabled: false,
  label: 'Slide to verify',
  verifyingLabel: 'Verifying…',
  verifiedLabel: 'Verification complete',
  failedLabel: 'Verification failed. Try again.',
  resetLabel: 'Reset verification',
  ariaLabel: 'Slider verification',
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  attempt: [attempt: VerityAttempt]
  verified: [attempt: VerityAttempt]
  failed: [attempt: VerityAttempt]
  reset: []
}>()

const value = shallowRef(props.modelValue ? 100 : 0)
const state = shallowRef<VerityState>(props.modelValue ? 'verified' : 'idle')
const startedAt = shallowRef<number | null>(null)
const lastResetKey = shallowRef(props.resetKey)

const isLocked = computed(() => props.disabled || state.value === 'verifying' || state.value === 'verified')
const statusLabel = computed(() => {
  if (state.value === 'verifying') return props.verifyingLabel
  if (state.value === 'verified') return props.verifiedLabel
  if (state.value === 'failed') return props.failedLabel
  return props.label
})
const progressStyle = computed(() => ({
  '--f-verity-progress': `${value.value}%`,
  '--f-verity-handle-position': `calc(${value.value}% - ${value.value * 0.5}px)`,
}))

function restore(emitModel = true) {
  value.value = 0
  startedAt.value = null
  state.value = 'idle'
  if (emitModel && props.modelValue) emit('update:modelValue', false)
}

function reset() {
  if (props.disabled || state.value === 'verifying') return
  restore()
  emit('reset')
}

async function complete() {
  if (state.value === 'verifying' || state.value === 'verified') return

  const attempt = {
    completedAt: Date.now(),
    durationMs: startedAt.value === null ? 0 : Date.now() - startedAt.value,
  }

  state.value = 'verifying'
  emit('attempt', attempt)

  try {
    const verified = props.verify ? await props.verify(attempt) : false
    if (!verified) throw new Error('Verification rejected')

    state.value = 'verified'
    value.value = 100
    emit('update:modelValue', true)
    emit('verified', attempt)
  } catch {
    value.value = 0
    startedAt.value = null
    state.value = 'failed'
    emit('update:modelValue', false)
    emit('failed', attempt)
  }
}

function handleInput(event: Event) {
  if (isLocked.value) return

  const nextValue = Number((event.target as HTMLInputElement).value)
  if (startedAt.value === null && nextValue > 0) startedAt.value = Date.now()
  value.value = nextValue

  if (nextValue === 100) void complete()
}

watch(
  () => props.modelValue,
  (verified) => {
    if (verified) {
      value.value = 100
      state.value = 'verified'
      return
    }

    if (state.value === 'verified') restore(false)
  },
)

watch(
  () => props.resetKey,
  (resetKey) => {
    if (resetKey === lastResetKey.value) return
    lastResetKey.value = resetKey
    restore(false)
  },
)

defineExpose({ reset })
</script>

<template>
  <div class="f-verity" :class="`f-verity-${state}`" :style="progressStyle">
    <label class="f-verity-track">
      <span class="f-verity-label">{{ statusLabel }}</span>
      <span class="f-verity-handle" aria-hidden="true" />
      <input
        class="f-verity-range"
        type="range"
        min="0"
        max="100"
        step="1"
        :value="value"
        :disabled="isLocked"
        :aria-label="props.ariaLabel"
        :aria-valuetext="statusLabel"
        @input="handleInput"
      >
    </label>
    <p class="f-verity-status" aria-live="polite">{{ statusLabel }}</p>
    <button class="f-verity-reset" type="button" :disabled="props.disabled || state === 'verifying'" @click="reset">
      {{ props.resetLabel }}
    </button>
  </div>
</template>

<style scoped>
.f-verity{display:grid;gap:9px;max-width:420px}.f-verity-track{align-items:center;background:var(--surface-hover);border:1px solid var(--border);border-radius:0;display:flex;height:50px;overflow:visible;position:relative}.f-verity-track::before{background:color-mix(in srgb,var(--primary) 10%,transparent);content:"";height:100%;inset:0 auto 0 0;position:absolute;transition:width .18s ease;width:var(--f-verity-progress)}.f-verity-label{color:color-mix(in srgb,var(--success) 58%,var(--foreground));font-size:15px;font-weight:500;left:50%;letter-spacing:.03em;pointer-events:none;position:absolute;text-align:center;transform:translateX(-50%);white-space:nowrap;z-index:1}.f-verity-handle{align-items:center;background:var(--surface);border:1px solid var(--border);box-shadow:var(--shadow-sm);display:flex;height:50px;justify-content:center;left:var(--f-verity-handle-position);pointer-events:none;position:absolute;top:-1px;transition:left .18s ease;width:50px;z-index:3}.f-verity-handle::before{border-right:2px solid var(--muted-foreground);border-top:2px solid var(--muted-foreground);content:"";height:9px;transform:rotate(45deg);width:9px}.f-verity-handle::after{background:var(--muted-foreground);content:"";height:2px;margin-right:3px;position:absolute;width:15px}.f-verity-range{appearance:none;background:transparent;cursor:grab;height:100%;margin:0;opacity:0;position:relative;width:100%;z-index:4}.f-verity-range:active{cursor:grabbing}.f-verity-range:focus-visible{outline:2px solid var(--ring);outline-offset:3px}.f-verity-range::-webkit-slider-thumb{appearance:none;height:50px;width:50px}.f-verity-range::-moz-range-thumb{border:0;height:50px;width:50px}.f-verity-status{clip-path:inset(50%);height:1px;margin:-1px;overflow:hidden;position:absolute;white-space:nowrap;width:1px}.f-verity-idle .f-verity-track::before{background:transparent}.f-verity-reset{background:transparent;border:0;color:var(--muted-foreground);cursor:pointer;font-size:12px;justify-self:start;padding:0;text-decoration:underline;text-underline-offset:3px}.f-verity-reset:focus-visible{border-radius:var(--radius-sm);outline:2px solid var(--ring);outline-offset:3px}.f-verity-reset:disabled{cursor:not-allowed;opacity:.55}.f-verity-verifying .f-verity-track::before{background:color-mix(in srgb,var(--primary) 13%,transparent);width:100%}.f-verity-verifying .f-verity-label{color:var(--primary)}.f-verity-verifying .f-verity-handle{left:calc(100% - 50px)}.f-verity-verified .f-verity-track{background:color-mix(in srgb,var(--success) 11%,var(--surface-hover));border-color:color-mix(in srgb,var(--success) 45%,var(--border))}.f-verity-verified .f-verity-track::before{background:transparent;width:100%}.f-verity-verified .f-verity-label{color:var(--success)}.f-verity-verified .f-verity-handle{border-color:color-mix(in srgb,var(--success) 35%,var(--border));left:calc(100% - 50px)}.f-verity-verified .f-verity-handle::before{border-color:var(--success);border-width:0 2px 2px 0;height:11px;transform:rotate(45deg) translate(-1px,-1px);width:6px}.f-verity-verified .f-verity-handle::after{display:none}.f-verity-failed .f-verity-track{background:color-mix(in srgb,var(--danger) 7%,var(--surface-hover));border-color:color-mix(in srgb,var(--danger) 42%,var(--border))}.f-verity-failed .f-verity-track::before{background:transparent;width:0}.f-verity-failed .f-verity-label{color:var(--danger)}.f-verity-range:disabled{cursor:not-allowed}.f-verity:has(.f-verity-range:disabled) .f-verity-handle{background:var(--surface-hover);box-shadow:none}@media (prefers-reduced-motion:reduce){.f-verity-track::before,.f-verity-handle{transition:none}}
</style>
