import { afterEach, describe, expect, it, vi } from 'vitest'

const { initMock } = vi.hoisted(() => ({ initMock: vi.fn() }))

vi.mock('fluffy-log-trace-browser-sdk', () => ({
  FluffyLog: { init: initMock }
}))

async function loadModule() {
  vi.resetModules()
  return await import('./fluffy-log')
}

describe('fluffy-log integration', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    initMock.mockClear()
  })

  it('is not configured when env keys are empty', async () => {
    const { isFluffyLogConfigured } = await loadModule()
    expect(isFluffyLogConfigured()).toBe(false)
  })

  it('does nothing when not configured', async () => {
    const { initFluffyLog } = await loadModule()
    initFluffyLog()
    expect(initMock).not.toHaveBeenCalled()
  })

  it('resolves a path prefix to an absolute api base url', async () => {
    vi.stubEnv('VITE_FLUFFY_LOG_APP_ID', 'log-app')
    vi.stubEnv('VITE_FLUFFY_LOG_BASE_URL', '/api/v1')
    vi.stubEnv('VITE_FLUFFY_LOG_CREDENTIAL', 'flt_pub_123')
    vi.stubEnv('VITE_APP_ENV', 'production')

    const { initFluffyLog } = await loadModule()
    initFluffyLog()

    expect(initMock).toHaveBeenCalledWith(expect.objectContaining({
      appId: 'log-app',
      apiBaseUrl: expect.stringContaining('/api/v1'),
      credential: 'flt_pub_123',
      environment: 'production'
    }))
  })

  it('uses a full base url as-is', async () => {
    vi.stubEnv('VITE_FLUFFY_LOG_APP_ID', 'log-app')
    vi.stubEnv('VITE_FLUFFY_LOG_BASE_URL', 'https://logs.example.com/api/v1')
    vi.stubEnv('VITE_FLUFFY_LOG_CREDENTIAL', 'flt_pub_123')

    const { initFluffyLog } = await loadModule()
    initFluffyLog()

    expect(initMock).toHaveBeenCalledWith(expect.objectContaining({
      apiBaseUrl: 'https://logs.example.com/api/v1'
    }))
  })
})
