<script setup lang="ts">
import { MessageSquarePlus } from 'lucide-vue-next'
export interface ChatSessionListItem {
  id: string
  title: string
  updatedAt: number
}

interface Props {
  sessions: readonly ChatSessionListItem[]
  activeSessionId: string
  compact?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  create: []
  select: [id: string]
}>()

function formatDate(timestamp: number) {
  return new Intl.DateTimeFormat('zh-CN', { month: 'numeric', day: 'numeric' }).format(timestamp)
}
</script>

<template>
  <aside class="fca-session-list" :class="{ 'is-compact': props.compact }" aria-label="聊天记录">
    <button class="fca-new-chat-button" type="button" @click="emit('create')">
      <MessageSquarePlus :size="16" aria-hidden="true" />
      <span>新建对话</span>
    </button>
    <div class="fca-session-list-heading">聊天记录</div>
    <div class="fca-session-items" role="list">
      <button
        v-for="session in props.sessions"
        :key="session.id"
        class="fca-session-item"
        :class="{ 'is-active': session.id === props.activeSessionId }"
        type="button"
        role="listitem"
        :aria-current="session.id === props.activeSessionId ? 'page' : undefined"
        @click="emit('select', session.id)"
      >
        <span class="fca-session-title">{{ session.title }}</span>
        <span class="fca-session-date">{{ formatDate(session.updatedAt) }}</span>
      </button>
    </div>
  </aside>
</template>
