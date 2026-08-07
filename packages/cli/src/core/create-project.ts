import { mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { writeVercelConfig } from '../deploy/providers/vercel.js'
import { copyTemplate, ensureEmptyDirectory, getProjectName } from './filesystem.js'
import { writeManifest } from './manifest.js'
import type { ProjectOptions } from './types.js'

const templateDirectory = resolve(dirname(fileURLToPath(import.meta.url)), '../../templates/core')

export interface CreateProjectResult {
  files: string[]
  created: boolean
}

export async function createProject(options: ProjectOptions): Promise<CreateProjectResult> {
  await ensureEmptyDirectory(options.directory)

  const variables = {
    PROJECT_NAME: options.name,
    PACKAGE_MANAGER: options.packageManager,
    THEME_COLOR: options.themeColor,
    DEFAULT_LOCALE: options.language,
    DEFAULT_DARK_MODE: String(options.darkMode)
  }

  const files = await copyTemplate(templateDirectory, options.directory, variables, options.dryRun)
  if (options.provider === 'vercel') {
    files.push(...await writeVercelConfig(options.directory, options.dryRun))
  }

  if (options.dryRun) {
    return { files, created: false }
  }

  await mkdir(options.directory, { recursive: true })
  await writeManifest(options.directory, files, options)
  return { files, created: true }
}

export function defaultProjectOptions(directory: string): ProjectOptions {
  return {
    directory: resolve(directory),
    name: getProjectName(directory),
    packageManager: 'pnpm',
    provider: 'vercel',
    themeColor: '#4f46e5',
    language: 'zh-CN',
    darkMode: true,
    dryRun: false
  }
}
