<script setup lang="ts">
import { computed } from 'vue'
import { MarkdownRender } from 'markstream-vue'
import { FileText, Wrench } from 'lucide-vue-next'
import type { ChatMessage as ChatMessageType } from '../types/chat'

interface Props {
  message: ChatMessageType
}

const props = defineProps<Props>()

const text = computed(() => props.message.content
  .filter((block): block is Extract<typeof block, { type: 'text' }> => block.type === 'text')
  .map((block) => block.text)
  .join('\n\n'))

function safeUrl(value: string) {
  try {
    const url = new URL(value, window.location.href)
    return ['http:', 'https:', 'mailto:'].includes(url.protocol) ? url.href : undefined
  } catch {
    return undefined
  }
}
</script>

<template>
  <article class="fca-message" :class="`fca-message-${props.message.role}`">
    <div v-if="props.message.role === 'assistant'" class="fca-message-label">AI 助手</div>
    <div class="fca-message-content">
      <template v-for="(block, index) in props.message.content" :key="`${props.message.id}-${index}`">
        <MarkdownRender
          v-if="block.type === 'text' && text"
          v-show="index === 0"
          class="fca-markdown"
          :content="text"
          :final="props.message.status !== 'streaming'"
          :html-policy="'escape'"
          :code-block-stream="props.message.status === 'streaming'"
          :render-code-blocks-as-pre="true"
        />
        <img v-else-if="block.type === 'image' && safeUrl(block.url)" class="fca-message-image" :src="safeUrl(block.url)" alt="AI 生成的图片" />
        <a v-else-if="block.type === 'file' && safeUrl(block.url)" class="fca-file-link" :href="safeUrl(block.url)" target="_blank" rel="noopener noreferrer">
          <FileText :size="16" />{{ block.name || '下载文件' }}
        </a>
        <section v-else-if="block.type === 'tool_call'" class="fca-tool-call">
          <Wrench :size="15" /><span>请求调用工具：{{ block.name }}</span>
        </section>
      </template>
      <p v-if="props.message.status === 'cancelled'" class="fca-message-status">已停止生成</p>
      <p v-if="props.message.status === 'error'" class="fca-message-status fca-message-error">{{ props.message.error?.message || '生成失败' }}</p>
    </div>
    <div v-if="props.message.citations?.length" class="fca-citations">
      <a
        v-for="citation in props.message.citations"
        :key="citation.id"
        class="fca-citation"
        :href="safeUrl(citation.source)"
        target="_blank"
        rel="noopener noreferrer"
      >{{ citation.source }}</a>
    </div>
  </article>
</template>
