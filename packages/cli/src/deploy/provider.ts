import type { DeployProvider } from '../core/types.js'

export function assertSupportedProvider(provider: string): asserts provider is DeployProvider {
  if (provider !== 'vercel' && provider !== 'none') {
    throw new Error(`Unsupported deploy provider: ${provider}. Supported providers: vercel, none.`)
  }
}
