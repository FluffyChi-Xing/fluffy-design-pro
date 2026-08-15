import { copyFile, mkdir, readFile, rm } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { assertNoSymlinkPath, atomicWriteFile, exists, hashContent, safeResolve, safeResolveInternal } from './filesystem.js'
import { getTemplateVersion, readManifest, writeProjectManifest } from './manifest.js'
import { createMigrationPlan } from './migration-plan.js'
import { detectVueViteProject } from './project-detection.js'
import type { MigrationPlan, MigrationTransaction } from './types.js'

export interface MigrateProjectOptions {
  directory: string
  apply: boolean
}

export interface MigrateProjectResult {
  plan: MigrationPlan
  applied: boolean
}

export async function migrateProject({ directory, apply }: MigrateProjectOptions): Promise<MigrateProjectResult> {
  const manifest = await readManifest(directory)
  const plan = await createMigrationPlan(directory, manifest)
  if (!apply || plan.changes.length === 0 || plan.conflicts.length > 0) {
    return { plan, applied: false }
  }

  const project = await detectVueViteProject(directory)
  if (project.git.isRepository && !project.git.isClean) {
    throw new Error('Migration requires a clean Git working tree.')
  }

  const backupDirectory = resolve(directory, '.fluffy/backups', plan.id)
  const stagingDirectory = resolve(directory, '.fluffy/staging', plan.id)
  const beforeManifestPath = resolve(backupDirectory, 'before-manifest.json')
  const transactionPath = resolve(backupDirectory, 'transaction.json')
  const manifestBefore = JSON.stringify(manifest, null, 2)
  const appliedChanges: MigrationPlan['changes'] = []

  await mkdir(stagingDirectory, { recursive: true })
  try {
    for (const change of plan.changes) {
      const stagedPath = safeResolveInternal(stagingDirectory, change.path)
      await atomicWriteFile(stagedPath, change.content)
      const staged = await readFile(stagedPath)
      if (hashContent(staged) !== change.afterHash) {
        throw new Error(`Staging validation failed: ${change.path}`)
      }
    }

    await mkdir(backupDirectory, { recursive: true })
    await atomicWriteFile(beforeManifestPath, `${manifestBefore}\n`)
    await atomicWriteFile(transactionPath, `${JSON.stringify({ id: plan.id, status: 'prepared', changes: plan.changes.map(withoutContent) }, null, 2)}\n`)

    for (const change of plan.changes) {
      const targetPath = safeResolve(directory, change.path)
      await assertNoSymlinkPath(directory, change.path)
      const current = await readFile(targetPath)
      if (hashContent(current) !== change.beforeHash) {
        throw new Error(`Managed file changed during migration: ${change.path}`)
      }
      const backupPath = safeResolveInternal(backupDirectory, `files/${change.path}`)
      await mkdir(dirname(backupPath), { recursive: true })
      await copyFile(targetPath, backupPath)
      await atomicWriteFile(targetPath, change.content)
      appliedChanges.push(change)
    }

    const transaction: MigrationTransaction = {
      id: plan.id,
      status: 'committed',
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      backupPath: `.fluffy/backups/${plan.id}`,
      changes: plan.changes.map(withoutContent)
    }
    manifest.templateVersion = getTemplateVersion()
    manifest.files = manifest.files.map((file) => {
      const change = plan.changes.find((item) => item.path === file.path)
      return change ? { ...file, baselineHash: change.afterHash, templateVersion: manifest.templateVersion, lastTransactionId: plan.id } : file
    })
    manifest.migrations.push(transaction)
    await writeProjectManifest(directory, manifest)
    await atomicWriteFile(transactionPath, `${JSON.stringify(transaction, null, 2)}\n`)
    return { plan, applied: true }
  } catch (error) {
    await restoreFiles(directory, backupDirectory, appliedChanges)
    if (await exists(beforeManifestPath)) {
      await atomicWriteFile(resolve(directory, '.fluffy/manifest.json'), await readFile(beforeManifestPath))
    }
    throw error
  } finally {
    await rm(stagingDirectory, { recursive: true, force: true })
  }
}

export async function rollbackMigration(directory: string, transactionId: string): Promise<void> {
  const manifest = await readManifest(directory)
  const transaction = manifest.migrations.find((item) => item.id === transactionId && item.status === 'committed')
  if (!transaction) throw new Error(`No committed migration found: ${transactionId}`)

  const backupDirectory = resolve(directory, transaction.backupPath)
  const beforeManifestPath = resolve(backupDirectory, 'before-manifest.json')
  if (!await exists(beforeManifestPath)) throw new Error(`Migration backup is missing: ${transactionId}`)

  for (const change of transaction.changes) {
    const targetPath = safeResolve(directory, change.path)
    if (!await exists(targetPath) || hashContent(await readFile(targetPath)) !== change.afterHash) {
      throw new Error(`Cannot roll back modified file: ${change.path}`)
    }
  }

  for (const change of transaction.changes) {
    const targetPath = safeResolve(directory, change.path)
    await assertNoSymlinkPath(directory, change.path)
    const backupPath = safeResolveInternal(backupDirectory, `files/${change.path}`)
    await atomicWriteFile(targetPath, await readFile(backupPath))
  }

  const beforeManifest = JSON.parse(await readFile(beforeManifestPath, 'utf8'))
  await atomicWriteFile(resolve(directory, '.fluffy/manifest.json'), `${JSON.stringify(beforeManifest, null, 2)}\n`)
}

async function restoreFiles(directory: string, backupDirectory: string, changes: MigrationPlan['changes']): Promise<void> {
  for (const change of changes.reverse()) {
    const backupPath = safeResolveInternal(backupDirectory, `files/${change.path}`)
    if (await exists(backupPath)) {
      const targetPath = safeResolve(directory, change.path)
      await assertNoSymlinkPath(directory, change.path)
      await atomicWriteFile(targetPath, await readFile(backupPath))
    }
  }
}

function withoutContent(change: MigrationPlan['changes'][number]): MigrationTransaction['changes'][number] {
  return {
    path: change.path,
    operation: change.operation,
    beforeHash: change.beforeHash,
    afterHash: change.afterHash
  }
}
