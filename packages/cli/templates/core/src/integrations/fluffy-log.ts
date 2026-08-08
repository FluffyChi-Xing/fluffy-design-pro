import { FluffyLog } from 'fluffy-log-trace-browser-sdk'
import { appEnv } from '../config/env'

export function isFluffyLogConfigured(): boolean {
  return Boolean(appEnv.logTrace.appId && appEnv.logTrace.baseUrl && appEnv.logTrace.credential)
}

export function initFluffyLog(): void {
  if (!isFluffyLogConfigured()) return
  const apiBaseUrl = appEnv.logTrace.baseUrl.startsWith('/')
    ? `${window.location.origin}${appEnv.logTrace.baseUrl}`
    : appEnv.logTrace.baseUrl
  FluffyLog.init({
    appId: appEnv.logTrace.appId,
    apiBaseUrl,
    credential: appEnv.logTrace.credential,
    environment: appEnv.env,
    autoCapture: 'error',
    bufferSize: 20,
    flushInterval: 5000,
    maxRetries: 3
  })
}
