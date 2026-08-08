import { randomUUID } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { exists, hashContent, renderTemplate, safeResolve } from './filesystem.js'
import { getTemplateVersion } from './manifest.js'
import { templateVariables } from './template-variables.js'
import type { MigrationPlan, ProjectManifest } from './types.js'

const templateDirectory = resolve(dirname(fileURLToPath(import.meta.url)), '../../templates/core')

export async function createMigrationPlan(projectDirectory: string, manifest: ProjectManifest): Promise<MigrationPlan> {
  const template = await renderTemplate(templateDirectory, templateVariables(manifest.options))
  const changes: MigrationPlan['changes'] = []
  const conflicts: MigrationPlan['conflicts'] = []

  for (const file of manifest.files) {
    if (file.owner !== 'generator-owned') continue
    const templatePath = file.templatePath
    if (!templatePath) continue
    const desired = template.get(templatePath)
    if (!desired) {
      conflicts.push({ path: file.path, reason: 'missing-template-file' })
      continue
    }

    const targetPath = safeResolve(projectDirectory, file.path)
    if (!await exists(targetPath)) {
      conflicts.push({ path: file.path, reason: 'missing-managed-file' })
      continue
    }

    const current = await readFile(targetPath)
    const currentHash = hashContent(current)
    if (currentHash !== file.baselineHash) {
      conflicts.push({ path: file.path, reason: 'modified-managed-file' })
      continue
    }

    const desiredHash = hashContent(desired)
    if (desiredHash !== currentHash) {
      changes.push({
        path: file.path,
        operation: 'update',
        beforeHash: currentHash,
        afterHash: desiredHash,
        content: desired
      })
    }
  }

  return {
    id: randomUUID(),
    changes,
    conflicts,
    warnings: manifest.templateVersion === getTemplateVersion() ? [] : [`Updating template ${manifest.templateVersion} to ${getTemplateVersion()}.`]
  }
}
