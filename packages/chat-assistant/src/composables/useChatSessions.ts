import { computed, onBeforeUnmount, onMounted, readonly, shallowRef, watch, type ComputedRef } from 'vue'
import {
  deriveChatSessionTitle,
  type ChatMessage,
  type ChatSession,
} from '../types/chat'
import {
  ChatSessionStorageError,
  createChatSessionRepository,
  type ChatSessionRepository,
} from '../storage/chatSessionRepository'

export interface UseChatSessionsOptions {
  messages: ComputedRef<ChatMessage[]>
  initialMessages: ChatMessage[]
  reset(messages: ChatMessage[]): void
  stop(): void
  enabled?: boolean
  repository?: ChatSessionRepository
}

function createId() {
  return `chat_${crypto.randomUUID()}`
}

function createSession(messages: ChatMessage[] = []): ChatSession {
  const timestamp = Date.now()
  return {
    id: createId(),
    title: deriveChatSessionTitle(messages),
    messages,
    createdAt: timestamp,
    updatedAt: timestamp,
  }
}

export function useChatSessions(options: UseChatSessionsOptions) {
  const persistenceEnabled = options.enabled ?? true
  const repository = options.repository ?? createChatSessionRepository()
  const sessions = shallowRef<ChatSession[]>([createSession(options.initialMessages)])
  const activeSessionId = shallowRef(sessions.value[0].id)
  const ready = shallowRef(!persistenceEnabled)
  const persistenceError = shallowRef<ChatSessionStorageError>()
  let saveFrame: number | undefined
  let pendingSave = false

  const activeSession = computed(() => sessions.value.find((session) => session.id === activeSessionId.value))

  function replaceActive(messages: ChatMessage[], persist = true) {
    const current = activeSession.value
    if (!current) return

    const session: ChatSession = {
      ...current,
      title: deriveChatSessionTitle(messages),
      messages,
      updatedAt: Date.now(),
    }
    sessions.value = [session, ...sessions.value.filter(({ id }) => id !== session.id)]
    if (persist) scheduleSave()
  }

  async function persistActive() {
    pendingSave = false
    if (!persistenceEnabled || !ready.value || !activeSession.value) return
    try {
      await repository.put(activeSession.value)
    } catch (error) {
      persistenceError.value = error instanceof ChatSessionStorageError
        ? error
        : new ChatSessionStorageError('Unable to save chat history.', { cause: error })
    }
  }

  function scheduleSave() {
    if (!persistenceEnabled || !ready.value || saveFrame !== undefined) return
    saveFrame = requestAnimationFrame(() => {
      saveFrame = undefined
      void persistActive()
    })
  }

  function flush() {
    if (saveFrame !== undefined) {
      cancelAnimationFrame(saveFrame)
      saveFrame = undefined
    }
    if (pendingSave) void persistActive()
  }

  function newChat() {
    options.stop()
    const session = createSession()
    sessions.value = [session, ...sessions.value]
    activeSessionId.value = session.id
    options.reset([])
    pendingSave = true
    scheduleSave()
  }

  function selectSession(id: string) {
    if (id === activeSessionId.value) return
    const session = sessions.value.find((candidate) => candidate.id === id)
    if (!session) return
    options.stop()
    activeSessionId.value = id
    options.reset(session.messages)
    pendingSave = true
    scheduleSave()
  }

  function clearActive() {
    options.stop()
    options.reset([])
  }

  watch(options.messages, (messages) => {
    replaceActive(messages)
    pendingSave = true
    if (!messages.some((message) => message.status === 'streaming' || message.status === 'pending')) flush()
  }, { deep: true })

  onMounted(async () => {
    if (!persistenceEnabled) return
    try {
      const restored = await repository.list()
      if (restored.length) {
        sessions.value = restored
        activeSessionId.value = restored[0].id
        options.reset(restored[0].messages)
      } else {
        pendingSave = true
      }
    } catch (error) {
      persistenceError.value = error instanceof ChatSessionStorageError
        ? error
        : new ChatSessionStorageError('Unable to load chat history.', { cause: error })
    } finally {
      ready.value = true
      if (pendingSave) scheduleSave()
    }
  })

  onBeforeUnmount(flush)

  return {
    sessions: readonly(sessions),
    activeSessionId: readonly(activeSessionId),
    activeSession,
    ready: readonly(ready),
    persistenceError: readonly(persistenceError),
    newChat,
    selectSession,
    clearActive,
  }
}
