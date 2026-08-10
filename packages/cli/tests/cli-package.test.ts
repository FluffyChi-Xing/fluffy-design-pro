import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = resolve(import.meta.dirname, '../../..')
const docs = [
  'README.md',
  'packages/cli/README.md',
  'packages/docs/index.md',
  'packages/docs/guide/getting-started.md',
  'packages/docs/guide/usage.md',
  'packages/docs/reference/cli-options.md'
]

describe('CLI package contract', () => {
  it('uses its scoped npm package in user-facing documentation', async () => {
    const packageJson = JSON.parse(await readFile(resolve(root, 'packages/cli/package.json'), 'utf8'))
    expect(packageJson.name).toBe('@fluffy-design-pro/cli')
    expect(packageJson.bin['create-fluffy-design-pro']).toBe('./dist/index.js')
    await Promise.all(docs.map(async (file) => {
      const content = await readFile(resolve(root, file), 'utf8')
      expect(content).toContain('npx @fluffy-design-pro/cli@latest')
      expect(content).not.toContain('npx create-fluffy-design-pro@latest')
    }))
  })
})
