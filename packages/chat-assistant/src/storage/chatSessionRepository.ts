import {
  deserializeChatMessage,
  serializeChatMessage,
  type ChatSession,
  type PersistedChatSession,
} from '../types/chat'

const databaseName = 'fluffy-design-pro-chat-assistant'
const databaseVersion = 1
const storeName = 'sessions'

export class ChatSessionStorageError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options)
    this.name = 'ChatSessionStorageError'
  }
}

function database() {
  if (!('indexedDB' in globalThis)) {
    throw new ChatSessionStorageError('IndexedDB is unavailable in this environment.')
  }

  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(databaseName, databaseVersion)
    request.onerror = () => reject(new ChatSessionStorageError('Unable to open chat history storage.', { cause: request.error }))
    request.onupgradeneeded = () => {
      const db = request.result
      const store = db.objectStoreNames.contains(storeName)
        ? request.transaction!.objectStore(storeName)
        : db.createObjectStore(storeName, { keyPath: 'id' })
      if (!store.indexNames.contains('updatedAt')) store.createIndex('updatedAt', 'updatedAt')
    }
    request.onsuccess = () => resolve(request.result)
  })
}

function requestResult<T>(request: IDBRequest<T>) {
  return new Promise<T>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(new ChatSessionStorageError('Unable to access chat history storage.', { cause: request.error }))
  })
}

function complete(transaction: IDBTransaction) {
  return new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(new ChatSessionStorageError('Unable to save chat history.', { cause: transaction.error }))
    transaction.onabort = () => reject(new ChatSessionStorageError('Chat history save was aborted.', { cause: transaction.error }))
  })
}

function serializeSession(session: ChatSession): PersistedChatSession {
  return { ...session, messages: session.messages.map(serializeChatMessage) }
}

function deserializeSession(session: PersistedChatSession): ChatSession {
  return { ...session, messages: session.messages.map(deserializeChatMessage) }
}

export interface ChatSessionRepository {
  list(): Promise<ChatSession[]>
  put(session: ChatSession): Promise<void>
  delete(id: string): Promise<void>
}

export function createChatSessionRepository(): ChatSessionRepository {
  return {
    async list() {
      const db = await database()
      try {
        const transaction = db.transaction(storeName, 'readonly')
        const records = await requestResult(transaction.objectStore(storeName).getAll()) as PersistedChatSession[]
        return records.map(deserializeSession).sort((left, right) => right.updatedAt - left.updatedAt)
      } finally {
        db.close()
      }
    },

    async put(session) {
      const db = await database()
      try {
        const transaction = db.transaction(storeName, 'readwrite')
        transaction.objectStore(storeName).put(serializeSession(session))
        await complete(transaction)
      } finally {
        db.close()
      }
    },

    async delete(id) {
      const db = await database()
      try {
        const transaction = db.transaction(storeName, 'readwrite')
        transaction.objectStore(storeName).delete(id)
        await complete(transaction)
      } finally {
        db.close()
      }
    },
  }
}
