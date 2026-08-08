/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE?: string
  readonly VITE_APP_ENV?: string
  readonly VITE_OSS_ENDPOINT?: string
  readonly VITE_OSS_BUCKET?: string
  readonly VITE_OSS_REGION?: string
  readonly VITE_LOG_TRACE_ENDPOINT?: string
  readonly VITE_LOG_TRACE_SAMPLE_RATE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
