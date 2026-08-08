<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  value?: number
  max?: number
  showLabel?: boolean
}
const props = withDefaults(defineProps<Props>(), { value: 0, max: 100, showLabel: false })

const percent = computed(() => Math.min(100, Math.max(0, (props.value / props.max) * 100)))
</script>

<template>
  <div class="f-progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" :aria-valuenow="Math.round(percent)">
    <div class="f-progress-track"><div class="f-progress-fill" :style="{ width: `${percent}%` }" /></div>
    <span v-if="showLabel" class="f-progress-label">{{ Math.round(percent) }}%</span>
  </div>
</template>

<style scoped>
.f-progress{align-items:center;display:flex;gap:10px;width:100%}.f-progress-track{background:var(--surface-hover);border-radius:999px;flex:1;height:6px;overflow:hidden}.f-progress-fill{background:var(--primary);border-radius:999px;height:100%;transition:width 180ms ease}.f-progress-label{color:var(--muted-foreground);font-size:12px;font-variant-numeric:tabular-nums;min-width:36px;text-align:right}
</style>
