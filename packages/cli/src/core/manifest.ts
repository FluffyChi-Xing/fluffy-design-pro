import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { hashContent, readGeneratedFile } from './filesystem.js'
import type { ProjectManifest, ProjectOptions } from './types.js'

const CLI_VERSION = '0.1.0'
const TEMPLATE_VERSION = '0.1.0'

export async function writeManifest(
  projectDirectory: string,
  files: string[],
  options: ProjectOptions
): Promise<ProjectManifest> {
  const manifest: ProjectManifest = {
    schemaVersion: 1,
    cliVersion: CLI_VERSION,
    templateVersion: TEMPLATE_VERSION,
    createdAt: new Date().toISOString(),
    options: {
      name: options.name,
      packageManager: options.packageManager,
      provider: options.provider,
      themeColor: options.themeColor,
      language: options.language,
      darkMode: options.darkMode
    },
    files: await Promise.all(files.map(async (path) => ({
      path,
      hash: hashContent(await readGeneratedFile(projectDirectory, path)),
      owner: 'generator-owned' as const
    })))
  }

  const manifestPath = resolve(projectDirectory, '.fluffy/manifest.json')
  await mkdir(dirname(manifestPath), { recursive: true })
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)
  return manifest
}
