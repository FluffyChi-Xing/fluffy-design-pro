import { afterEach, describe, expect, it, vi } from 'vitest'

const { uploadMock } = vi.hoisted(() => ({ uploadMock: vi.fn() }))

vi.mock('fluffy-oss-sdk', () => ({
  FluffyOssClient: vi.fn().mockImplementation(() => ({ upload: uploadMock }))
}))

async function loadModule() {
  vi.resetModules()
  return await import('./fluffy-oss')
}

describe('fluffy-oss integration', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    uploadMock.mockReset()
  })

  it('is not configured when env keys are empty', async () => {
    const { isFluffyOssConfigured } = await loadModule()
    expect(isFluffyOssConfigured()).toBe(false)
  })

  it('uploads a file and returns its url', async () => {
    vi.stubEnv('VITE_FLUFFY_OSS_BASE_URL', 'https://oss.example.com/api')
    vi.stubEnv('VITE_FLUFFY_OSS_APP_ID', 'oss-app')
    vi.stubEnv('VITE_FLUFFY_OSS_SECRET', 'sk_123')
    uploadMock.mockResolvedValue({ url: 'https://cdn.example.com/abc.png' })

    const { isFluffyOssConfigured, uploadToFluffyOss } = await loadModule()
    expect(isFluffyOssConfigured()).toBe(true)

    const url = await uploadToFluffyOss(new File(['x'], 'a.png'), { applicationId: '1' })
    expect(uploadMock).toHaveBeenCalledTimes(1)
    expect(uploadMock).toHaveBeenCalledWith(
      expect.any(File),
      expect.objectContaining({ applicationId: '1', callbackUrl: undefined, onProgress: undefined })
    )
    expect(url).toBe('https://cdn.example.com/abc.png')
  })

  it('forwards progress through the callback', async () => {
    vi.stubEnv('VITE_FLUFFY_OSS_BASE_URL', 'https://oss.example.com/api')
    vi.stubEnv('VITE_FLUFFY_OSS_APP_ID', 'oss-app')
    vi.stubEnv('VITE_FLUFFY_OSS_SECRET', 'sk_123')
    const onProgress = vi.fn()
    uploadMock.mockResolvedValue({ url: 'https://cdn.example.com/abc.png' })

    const { uploadToFluffyOss } = await loadModule()
    await uploadToFluffyOss(new File(['x'], 'a.png'), { onProgress })
    const uploadOptions = uploadMock.mock.calls[0][1]
    uploadOptions.onProgress({ percent: 50, loaded: 5, total: 10 })
    expect(onProgress).toHaveBeenCalledWith(50)
  })

  it('throws when not configured', async () => {
    const { uploadToFluffyOss } = await loadModule()
    await expect(uploadToFluffyOss(new File(['x'], 'a.png'))).rejects.toThrow('Fluffy OSS is not configured')
  })
})
