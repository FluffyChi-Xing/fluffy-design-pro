import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { adoptProject } from '../src/core/adopt-project.js'
import { defaultProjectOptions } from '../src/core/create-project.js'

const directories: string[] = []

async function fixture(): Promise<string> {
  const directory = await mkdtemp(resolve(tmpdir(), 'fluffy-adopt-'))
  directories.push(directory)
  await writeFile(resolve(directory, 'package.json'), JSON.stringify({
    name: 'existing-app',
    dependencies: { vue: '^3.5.0' },
    devDependencies: { vite: '^6.0.0' },
    scripts: { build: 'vite build' }
  }))
  await writeFile(resolve(directory, 'vite.config.ts'), 'export default {}\n')
  await writeFile(resolve(directory, 'business.txt'), 'leave me alone\n')
  return directory
}

afterEach(async () => {
  await Promise.all(directories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })))
})

describe('adoptProject', () => {
  it('reports a Vue 3 and Vite project without writing during dry run', async () => {
    const directory = await fixture()

    const report = await adoptProject({ directory, options: defaultProjectOptions(directory), dryRun: true })

    expect(report.project.packageName).toBe('existing-app')
    expect(report.project.vueVersion).toBe('^3.5.0')
    expect(await readFile(resolve(directory, 'business.txt'), 'utf8')).toBe('leave me alone\n')
    await expect(readFile(resolve(directory, '.fluffy/manifest.json'), 'utf8')).rejects.toMatchObject({ code: 'ENOENT' })
  })

  it('writes only an adopted manifest after confirmation', async () => {
    const directory = await fixture()
    await mkdir(resolve(directory, 'src/api'), { recursive: true })
    await cp(
      resolve(import.meta.dirname, '../templates/core/src/api/base.ts'),
      resolve(directory, 'src/api/base.ts'),
    )

    await adoptProject({ directory, options: defaultProjectOptions(directory), dryRun: false })

    const manifest = JSON.parse(await readFile(resolve(directory, '.fluffy/manifest.json'), 'utf8'))
    expect(manifest.schemaVersion).toBe(2)
    expect(manifest.projectKind).toBe('adopted')
    expect(manifest.templateVersion).toBe('0.2.0')
    expect(manifest.files).toEqual(expect.arrayContaining([
      expect.objectContaining({
        path: 'src/api/base.ts',
        owner: 'generator-owned',
        templatePath: 'src/api/base.ts',
        templateVersion: '0.2.0',
      }),
    ]))
    expect(await readFile(resolve(directory, 'business.txt'), 'utf8')).toBe('leave me alone\n')
  })

  it('rejects projects without Vue 3 and Vite evidence', async () => {
    const directory = await fixture()
    await writeFile(resolve(directory, 'package.json'), JSON.stringify({ dependencies: { vue: '^2.7.0' } }))

    await expect(adoptProject({ directory, options: defaultProjectOptions(directory), dryRun: true })).rejects.toThrow('Only Vue 3 projects')
  })
})
