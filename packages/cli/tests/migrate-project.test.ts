import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { createProject, defaultProjectOptions } from '../src/core/create-project.js'
import { migrateProject, rollbackMigration } from '../src/core/migrate-project.js'
import { readManifest, writeProjectManifest } from '../src/core/manifest.js'

const directories: string[] = []

async function generatedProject(): Promise<string> {
  const directory = await mkdtemp(resolve(tmpdir(), 'fluffy-migrate-'))
  directories.push(directory)
  await createProject({ ...defaultProjectOptions(directory), provider: 'none' })
  return directory
}

afterEach(async () => {
  await Promise.all(directories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })))
})

describe('migrateProject', () => {
  it('does not write files during the default migration preview', async () => {
    const directory = await generatedProject()
    const manifestBefore = await readFile(resolve(directory, '.fluffy/manifest.json'), 'utf8')

    const result = await migrateProject({ directory, apply: false })

    expect(result.applied).toBe(false)
    expect(result.plan.changes).toEqual([])
    expect(await readFile(resolve(directory, '.fluffy/manifest.json'), 'utf8')).toBe(manifestBefore)
  })

  it('does not flag runtime provider config as a missing-template-file conflict', async () => {
    const directory = await mkdtemp(resolve(tmpdir(), 'fluffy-migrate-'))
    directories.push(directory)
    await createProject({ ...defaultProjectOptions(directory), provider: 'vercel' })

    const result = await migrateProject({ directory, apply: false })

    const vercel = JSON.parse(await readFile(resolve(directory, '.fluffy/manifest.json'), 'utf8'))
      .files.find((file: { path: string }) => file.path === 'vercel.json')
    expect(vercel.templatePath).toBeUndefined()
    expect(result.plan.conflicts).toEqual([])
  })

  it('rejects modified generator-owned files', async () => {
    const directory = await generatedProject()
    await writeFile(resolve(directory, 'src/App.vue'), '<template>user change</template>\n')

    const result = await migrateProject({ directory, apply: false })

    expect(result.plan.conflicts).toEqual(expect.arrayContaining([
      expect.objectContaining({ path: 'src/App.vue', reason: 'modified-managed-file' })
    ]))
  })

  it('rolls back a committed managed-file update', async () => {
    const directory = await generatedProject()
    const manifest = await readManifest(directory)
    const app = manifest.files.find((file) => file.path === 'src/App.vue')
    if (!app) throw new Error('Missing App.vue manifest entry')
    app.templatePath = 'src/main.ts'
    await writeProjectManifest(directory, manifest)

    const before = await readFile(resolve(directory, 'src/App.vue'), 'utf8')
    const result = await migrateProject({ directory, apply: true })

    expect(result.applied).toBe(true)
    expect(result.plan.changes).toHaveLength(1)
    await rollbackMigration(directory, result.plan.id)
    expect(await readFile(resolve(directory, 'src/App.vue'), 'utf8')).toBe(before)
  })
})
