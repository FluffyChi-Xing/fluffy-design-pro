import { afterEach, describe, expect, it, vi } from 'vitest'
import { readAppEnv } from '@/config/env'

describe('readAppEnv', () => {
  afterEach(() => vi.unstubAllEnvs())

  it('reads configured env keys', () => {
    vi.stubEnv('VITE_APP_TITLE', 'Console')
    vi.stubEnv('VITE_APP_ENV', 'production')
    vi.stubEnv('VITE_OSS_ENDPOINT', 'https://oss.example.com')
    vi.stubEnv('VITE_OSS_BUCKET', 'assets')
    vi.stubEnv('VITE_OSS_REGION', 'cn-hangzhou')
    vi.stubEnv('VITE_LOG_TRACE_ENDPOINT', 'https://trace.example.com')
    vi.stubEnv('VITE_LOG_TRACE_SAMPLE_RATE', '0.1')

    const env = readAppEnv()
    expect(env.title).toBe('Console')
    expect(env.env).toBe('production')
    expect(env.oss.endpoint).toBe('https://oss.example.com')
    expect(env.oss.bucket).toBe('assets')
    expect(env.oss.region).toBe('cn-hangzhou')
    expect(env.logTrace.endpoint).toBe('https://trace.example.com')
    expect(env.logTrace.sampleRate).toBe(0.1)
  })

  it('falls back to empty defaults', () => {
    const env = readAppEnv()
    expect(env.title).toBe('')
    expect(env.env).toBe('development')
    expect(env.oss.endpoint).toBe('')
    expect(env.oss.bucket).toBe('')
    expect(env.oss.region).toBe('')
    expect(env.logTrace.endpoint).toBe('')
    expect(env.logTrace.sampleRate).toBe(0)
  })
})
