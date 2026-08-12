<script setup lang="ts">
import { nextTick, shallowRef, useTemplateRef, watch } from 'vue'
import { SendHorizontal, Square } from 'lucide-vue-next'

export interface ChatComposerProps {
  disabled?: boolean
  streaming?: boolean
  placeholder?: string
}

const props = withDefaults(defineProps<ChatComposerProps>(), {
  placeholder: '输入你的问题…',
})

const emit = defineEmits<{
  submit: [text: string]
  stop: []
}>()

const text = shallowRef('')
const textarea = useTemplateRef<HTMLTextAreaElement>('textarea')

function resize() {
  const element = textarea.value
  if (!element) return
  element.style.height = 'auto'
  element.style.height = `${Math.min(element.scrollHeight, 160)}px`
}

function submit() {
  const value = text.value.trim()
  if (!value || props.disabled || props.streaming) return
  emit('submit', value)
  text.value = ''
  nextTick(resize)
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    submit()
  }
}

function focus() {
  textarea.value?.focus()
}

watch(text, resize)
defineExpose({ focus })
</script>

<template>
  <form class="fca-composer" @submit.prevent="submit">
    <textarea
      ref="textarea"
      v-model="text"
      class="fca-composer-input"
      :placeholder="props.placeholder"
      :disabled="props.disabled || props.streaming"
      rows="1"
      @keydown="onKeydown"
    />
    <div class="fca-composer-footer">
      <span class="fca-composer-hint">Enter 发送，Shift + Enter 换行</span>
      <button
        v-if="props.streaming"
        class="fca-icon-button fca-stop-button"
        type="button"
        aria-label="停止生成"
        title="停止生成"
        @click="emit('stop')"
      >
        <Square :size="15" fill="currentColor" />
      </button>
      <button
        v-else
        class="fca-icon-button fca-send-button"
        type="submit"
        :disabled="props.disabled || !text.trim()"
        aria-label="发送消息"
        title="发送消息"
      >
        <SendHorizontal :size="18" />
      </button>
    </div>
  </form>
</template>
