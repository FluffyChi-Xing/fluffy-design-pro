import { describe, expect, it } from 'vitest'
import { assertCloudflareTarget, assertSupportedProvider } from '../src/deploy/provider.js'

describe('assertSupportedProvider', () => {
  it.each(['vercel', 'cloudflare', 'none'])('accepts %s', (provider) => {
    expect(() => assertSupportedProvider(provider)).not.toThrow()
  })

  it.each(['workers', 'Cloudflare'])('rejects %s', (provider) => {
    expect(() => assertSupportedProvider(provider)).toThrow(
      `Unsupported deploy provider: ${provider}. Supported providers: vercel, cloudflare, none.`
    )
  })
})

describe('assertCloudflareTarget', () => {
  it.each(['pages', 'workers'])('accepts %s', (target) => {
    expect(assertCloudflareTarget(target)).toBe(target)
  })

  it.each(['unknown', 'Pages'])('rejects %s', (target) => {
    expect(() => assertCloudflareTarget(target)).toThrow(
      `Unsupported Cloudflare target: ${target}. Supported targets: pages, workers.`
    )
  })
})
