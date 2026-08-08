export interface AppEnv {
  title: string
  env: string
  oss: { endpoint: string; bucket: string; region: string }
  logTrace: { endpoint: string; sampleRate: number }
}

export function readAppEnv(): AppEnv {
  return {
    title: import.meta.env.VITE_APP_TITLE ?? '',
    env: import.meta.env.VITE_APP_ENV ?? 'development',
    oss: {
      endpoint: import.meta.env.VITE_OSS_ENDPOINT ?? '',
      bucket: import.meta.env.VITE_OSS_BUCKET ?? '',
      region: import.meta.env.VITE_OSS_REGION ?? ''
    },
    logTrace: {
      endpoint: import.meta.env.VITE_LOG_TRACE_ENDPOINT ?? '',
      sampleRate: Number(import.meta.env.VITE_LOG_TRACE_SAMPLE_RATE ?? 0)
    }
  }
}

export const appEnv = readAppEnv()
