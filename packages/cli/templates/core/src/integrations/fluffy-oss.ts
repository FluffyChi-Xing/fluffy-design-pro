import { FluffyOssClient } from 'fluffy-oss-sdk'
import { appEnv } from '../config/env'

let client: FluffyOssClient | null = null

export function isFluffyOssConfigured(): boolean {
  return Boolean(appEnv.oss.baseUrl && appEnv.oss.appId && appEnv.oss.secret)
}

function getClient(): FluffyOssClient {
  if (!isFluffyOssConfigured()) {
    throw new Error('Fluffy OSS is not configured. Fill VITE_FLUFFY_OSS_* in your .env file.')
  }
  client ??= new FluffyOssClient({
    baseUrl: appEnv.oss.baseUrl,
    appId: appEnv.oss.appId,
    secret: appEnv.oss.secret
  })
  return client
}

export interface FluffyUploadOptions {
  applicationId?: string
  callbackUrl?: string
  onProgress?: (percent: number) => void
}

export async function uploadToFluffyOss(file: File, options: FluffyUploadOptions = {}): Promise<string> {
  const result = await getClient().upload(file, {
    applicationId: options.applicationId,
    callbackUrl: options.callbackUrl,
    onProgress: options.onProgress ? ({ percent }) => options.onProgress?.(percent) : undefined
  })
  return result.url
}
