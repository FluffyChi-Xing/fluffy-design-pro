import { readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { assertNoSymlinkPath, exists, hashContent, renderTemplate } from './filesystem.js'
import { createAdoptedManifest, getTemplateVersion, readManifest, writeProjectManifest } from './manifest.js'
import { detectVueViteProject } from './project-detection.js'
import type { AdoptionReport, ProjectOptions } from './types.js'

const templateDirectory = resolve(dirname(fileURLToPath(import.meta.url)), '../../templates/core')

export interface AdoptProjectOptions {
  directory: string
  options: ProjectOptions
  dryRun: boolean
}

export async function adoptProject({ directory, options, dryRun }: AdoptProjectOptions): Promise<AdoptionReport> {
  const project = await detectVueViteProject(directory)
  if (project.manifest !== 'absent') {
    await readManifest(directory)
  }

  const template = await renderTemplate(templateDirectory, templateVariables(options))
  const managedFiles: AdoptionReport['managedFiles'] = []
  const conflicts: AdoptionReport['conflicts'] = []

  for (const [path, content] of template) {
    const targetPath = resolve(directory, path)
    if (!await exists(targetPath)) continue
    const current = await readFile(targetPath)
    if (hashContent(current) === hashContent(content)) {
      managedFiles.push({
        path,
        owner: 'generator-owned',
        baselineHash: hashContent(current),
        templatePath: path,
        templateVersion: getTemplateVersion()
      })
    } else {
      conflicts.push({ path, reason: 'content-mismatch' })
    }
  }

  const report = { project, managedFiles, conflicts }
  if (!dryRun) {
    await assertNoSymlinkPath(directory, '.fluffy/manifest.json')
    await writeProjectManifest(directory, createAdoptedManifest(options, managedFiles))
  }
  return report
}

function templateVariables(options: ProjectOptions): Record<string, string> {
  return {
    PROJECT_NAME: options.name,
    PACKAGE_MANAGER: options.packageManager,
    THEME_COLOR: options.themeColor,
    DEFAULT_LOCALE: options.language,
    DEFAULT_DARK_MODE: String(options.darkMode)
  }
}
