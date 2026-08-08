import { mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { writeCloudflareConfig } from '../deploy/providers/cloudflare.js'
import { writeVercelConfig } from '../deploy/providers/vercel.js'
import { copyTemplate, ensureEmptyDirectory, getProjectName, removePath } from './filesystem.js'
import { writeManifest } from './manifest.js'
import { templateVariables } from './template-variables.js'
import type { ProjectOptions } from './types.js'

const templateDirectory = resolve(dirname(fileURLToPath(import.meta.url)), '../../templates/core')

export interface CreateProjectResult {
  files: string[]
  created: boolean
}

export async function createProject(options: ProjectOptions): Promise<CreateProjectResult> {
  await ensureEmptyDirectory(options.directory)

  const copied = await copyTemplate(templateDirectory, options.directory, templateVariables(options), options.dryRun)
  const removed: string[] = []
  if (!options.fluffyOss) {
    removed.push('src/integrations/fluffy-oss.ts', 'src/integrations/fluffy-oss.test.ts')
    removed.push(
      'src/components/ui/FProgress.vue',
      'src/components/ui/FTabs.vue',
      'src/components/ui/FUpload.vue',
      'src/components/ui/FUploadProgress.vue',
      'src/components/upload/UploadCenterPanel.vue',
      'src/components/upload/UploadCenterPanel.test.ts',
      'src/stores/upload.ts',
      'src/components/ui/FProgress.test.ts',
      'src/components/ui/FTabs.test.ts',
      'src/components/ui/FUpload.test.ts',
      'src/components/ui/FUploadProgress.test.ts',
      'src/stores/upload.test.ts'
    )
  }
  if (!options.fluffyLog) removed.push('src/integrations/fluffy-log.ts', 'src/integrations/fluffy-log.test.ts')
  const files = copied.filter((path) => !removed.includes(path))
  if (!options.dryRun) {
    await Promise.all(removed.map((path) => removePath(resolve(options.directory, path))))
  }
  const runtimeFiles: string[] = []
  switch (options.provider) {
    case 'vercel':
      runtimeFiles.push(...await writeVercelConfig(options.directory, options.dryRun))
      break
    case 'cloudflare':
      runtimeFiles.push(...await writeCloudflareConfig(options.directory, options.cloudflareTarget, options.dryRun))
      break
    case 'none':
      break
  }
  files.push(...runtimeFiles)

  if (options.dryRun) {
    return { files, created: false }
  }

  await mkdir(options.directory, { recursive: true })
  await writeManifest(options.directory, files, options, runtimeFiles)
  return { files, created: true }
}

export function defaultProjectOptions(directory: string): ProjectOptions {
  return {
    directory: resolve(directory),
    name: getProjectName(directory),
    packageManager: 'pnpm',
    provider: 'vercel',
    cloudflareTarget: 'pages',
    themeColor: '#4f46e5',
    language: 'zh-CN',
    darkMode: true,
    fluffyOss: false,
    fluffyLog: false,
    fluffyOssUrl: '',
    fluffyLogUrl: '',
    fluffyOssProxy: '',
    fluffyLogProxy: '',
    dryRun: false
  }
}
