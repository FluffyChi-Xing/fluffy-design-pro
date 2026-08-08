import type { CloudflareTarget, DeployProvider } from '../core/types.js'

export function assertSupportedProvider(provider: string): asserts provider is DeployProvider {
  if (provider !== 'vercel' && provider !== 'cloudflare' && provider !== 'none') {
    throw new Error(`Unsupported deploy provider: ${provider}. Supported providers: vercel, cloudflare, none.`)
  }
}

export function assertCloudflareTarget(value: string): CloudflareTarget {
  if (value !== 'pages' && value !== 'workers') {
    throw new Error(`Unsupported Cloudflare target: ${value}. Supported targets: pages, workers.`)
  }
  return value
}
