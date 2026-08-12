<script setup lang="ts">
import { nextTick, watch, useTemplateRef } from 'vue'
import { Bot, Clock3, Maximize2, MessageSquarePlus, Minimize2, RotateCcw, X } from 'lucide-vue-next'
import type { ChatMessage } from '../types/chat'
import type { ChatSessionListItem } from './ChatSessionList.vue'
import ChatComposer from './ChatComposer.vue'
import ChatMessageList from './ChatMessageList.vue'
import ChatSessionList from './ChatSessionList.vue'

export interface ChatWindowProps {
  open: boolean
  title: string
  messages: ChatMessage[]
  sessions: readonly ChatSessionListItem[]
  activeSessionId: string
  streaming: boolean
  fullscreen: boolean
  dragging: boolean
  historyOpen: boolean
  windowStyle: Record<string, string | undefined>
  disabled?: boolean
  placeholder?: string
}

const props = defineProps<ChatWindowProps>()
const emit = defineEmits<{
  close: []
  clear: []
  newChat: []
  selectSession: [id: string]
  toggleHistory: []
  closeHistory: []
  send: [text: string]
  stop: []
  toggleFullscreen: []
  dragStart: [event: PointerEvent]
}>()

const composer = useTemplateRef<InstanceType<typeof ChatComposer>>('composer')

watch(() => props.open, async (open) => {
  if (open) {
    await nextTick()
    composer.value?.focus()
  }
})

function onKeydown(event: KeyboardEvent) {
  if (event.key !== 'Escape') return
  if (props.historyOpen && !props.fullscreen) {
    emit('closeHistory')
    return
  }
  if (props.fullscreen) emit('toggleFullscreen')
  else emit('close')
}
</script>

<template>
  <Teleport to="body">
    <section
      v-if="props.open"
      class="fca-window"
      :class="{ 'is-fullscreen': props.fullscreen, 'is-dragging': props.dragging }"
      :style="props.windowStyle"
      role="dialog"
      aria-modal="false"
      :aria-label="props.title"
      tabindex="-1"
      @keydown="onKeydown"
    >
      <template v-if="props.fullscreen">
        <ChatSessionList
          class="fca-fullscreen-sidebar"
          :sessions="props.sessions"
          :active-session-id="props.activeSessionId"
          @create="emit('newChat')"
          @select="emit('selectSession', $event)"
        />
        <main class="fca-chat-pane">
          <header class="fca-window-header fca-chat-pane-header">
            <div class="fca-window-identity">
              <Bot :size="18" aria-hidden="true" />
              <div>
                <strong>{{ props.title }}</strong>
                <span>{{ props.streaming ? '正在思考…' : '随时为你服务' }}</span>
              </div>
            </div>
            <div class="fca-window-actions">
              <button class="fca-icon-button" type="button" aria-label="清空当前对话" title="清空当前对话" :disabled="props.streaming || !props.messages.length" @click="emit('clear')"><RotateCcw :size="16" /></button>
              <button class="fca-icon-button" type="button" aria-label="退出全屏" title="退出全屏" @click="emit('toggleFullscreen')"><Minimize2 :size="16" /></button>
              <button class="fca-icon-button" type="button" aria-label="关闭助手" title="关闭助手" @click="emit('close')"><X :size="18" /></button>
            </div>
          </header>
          <ChatMessageList :messages="props.messages" />
          <ChatComposer ref="composer" :disabled="props.disabled" :streaming="props.streaming" :placeholder="props.placeholder" @submit="emit('send', $event)" @stop="emit('stop')" />
          <footer class="fca-window-footer">内容由 AI 生成，请自行判断并核实</footer>
        </main>
      </template>

      <template v-else>
        <header class="fca-window-header">
          <div class="fca-drag-handle" @pointerdown="emit('dragStart', $event)">
            <Bot :size="19" aria-hidden="true" />
            <div>
              <strong>{{ props.title }}</strong>
              <span>{{ props.streaming ? '正在思考…' : '随时为你服务' }}</span>
            </div>
          </div>
          <div class="fca-window-actions">
            <button class="fca-icon-button" type="button" aria-label="聊天记录" title="聊天记录" :aria-expanded="props.historyOpen" @click="emit('toggleHistory')"><Clock3 :size="16" /></button>
            <button class="fca-icon-button" type="button" aria-label="新建对话" title="新建对话" @click="emit('newChat')"><MessageSquarePlus :size="16" /></button>
            <button class="fca-icon-button" type="button" aria-label="清空当前对话" title="清空当前对话" :disabled="props.streaming || !props.messages.length" @click="emit('clear')"><RotateCcw :size="16" /></button>
            <button class="fca-icon-button" type="button" aria-label="全屏" title="全屏" @click="emit('toggleFullscreen')"><Maximize2 :size="16" /></button>
            <button class="fca-icon-button" type="button" aria-label="关闭助手" title="关闭助手" @click="emit('close')"><X :size="18" /></button>
          </div>
        </header>
        <ChatMessageList :messages="props.messages" />
        <ChatComposer ref="composer" :disabled="props.disabled" :streaming="props.streaming" :placeholder="props.placeholder" @submit="emit('send', $event)" @stop="emit('stop')" />
        <footer class="fca-window-footer">内容由 AI 生成，请自行判断并核实</footer>
        <div v-if="props.historyOpen" class="fca-history-sheet" role="dialog" aria-modal="false" aria-label="聊天记录">
          <ChatSessionList
            compact
            :sessions="props.sessions"
            :active-session-id="props.activeSessionId"
            @create="emit('newChat')"
            @select="emit('selectSession', $event)"
          />
        </div>
      </template>
    </section>
  </Teleport>
</template>
