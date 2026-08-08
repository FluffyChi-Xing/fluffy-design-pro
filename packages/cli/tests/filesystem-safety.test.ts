import { mkdtemp, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { assertNoSymlinkPath, assertSafeRelativePath, safeResolve } from '../src/core/filesystem.js'

describe('managed file path safety', () => {
  it.each(['../outside.txt', '/absolute.txt', 'C:\\outside.txt', '\\\\server\\share', '.git/config', 'node_modules/pkg/index.js', '.env', '.npmrc', 'keys/private.key'])('rejects %s', (path) => {
    expect(() => assertSafeRelativePath(path)).toThrow()
  })

  it('keeps managed paths inside the project root', () => {
    expect(safeResolve('D:/project', 'src/App.vue')).toBe('D:\\project\\src\\App.vue')
  })

  it('rejects managed paths that traverse a symbolic link', async () => {
    const project = await mkdtemp(resolve(tmpdir(), 'fluffy-symlink-project-'))
    const outside = await mkdtemp(resolve(tmpdir(), 'fluffy-symlink-outside-'))
    try {
      await symlink(outside, resolve(project, 'escape'), 'junction')
      await writeFile(resolve(project, 'escape/payload.txt'), 'keep away')

      await expect(assertNoSymlinkPath(project, 'escape/payload.txt')).rejects.toThrow('Symbolic links')
    } finally {
      await rm(project, { recursive: true, force: true })
      await rm(outside, { recursive: true, force: true })
    }
  })
})
