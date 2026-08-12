<script setup lang="ts">
import { nextTick, watch, useTemplateRef } from 'vue'
import { ArrowDown } from 'lucide-vue-next'
import type { ChatMessage } from '../types/chat'
import ChatMessageItem from './ChatMessage.vue'

interface Props {
  messages: ChatMessage[]
}

const props = defineProps<Props>()
const list = useTemplateRef<HTMLElement>('list')
let follow = true

function onScroll() {
  const element = list.value
  if (!element) return
  follow = element.scrollHeight - element.scrollTop - element.clientHeight < 64
}

function scrollToBottom() {
  list.value?.scrollTo({ top: list.value.scrollHeight, behavior: 'smooth' })
}

watch(() => props.messages, async () => {
  await nextTick()
  if (follow) scrollToBottom()
}, { deep: true })
</script>

<template>
  <section ref="list" class="fca-message-list" aria-live="polite" @scroll="onScroll">
    <div v-if="!props.messages.length" class="fca-empty-state">
      <div class="fca-empty-mark">✦</div>
      <h2>你好，我是 AI 助手</h2>
      <p>告诉我你想完成什么，我会协助你梳理问题并给出下一步建议。</p>
    </div>
    <ChatMessageItem v-for="message in props.messages" :key="message.id" :message="message" />
    <button v-if="!follow" class="fca-scroll-bottom" type="button" @click="scrollToBottom">
      <ArrowDown :size="16" /> 回到底部
    </button>
  </section>
</template>
