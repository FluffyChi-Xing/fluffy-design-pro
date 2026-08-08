import { execFile } from 'node:child_process'
import { readFile, stat } from 'node:fs/promises'
import { promisify } from 'node:util'
import { resolve } from 'node:path'
import { exists } from './filesystem.js'
import type { DetectedProject, PackageManager } from './types.js'

const execFileAsync = promisify(execFile)
const viteConfigNames = ['vite.config.ts', 'vite.config.js', 'vite.config.mts', 'vite.config.mjs']

export async function detectVueViteProject(directory: string): Promise<DetectedProject> {
  const projectDirectory = resolve(directory)
  const packagePath = resolve(projectDirectory, 'package.json')
  let packageJson: Record<string, unknown>
  try {
    packageJson = JSON.parse(await readFile(packagePath, 'utf8')) as Record<string, unknown>
  } catch {
    throw new Error(`A readable package.json is required: ${projectDirectory}`)
  }

  const dependencies = { ...asRecord(packageJson.dependencies), ...asRecord(packageJson.devDependencies) }
  const vueVersion = stringValue(dependencies.vue)
  if (!/^\D*3(?:\D|$)/.test(vueVersion)) {
    throw new Error('Only Vue 3 projects can be adopted.')
  }

  const viteVersion = stringValue(dependencies.vite)
  const scripts = asRecord(packageJson.scripts)
  const viteConfig = await firstExisting(projectDirectory, viteConfigNames)
  const hasViteScript = Object.values(scripts).some((script) => typeof script === 'string' && /\bvite(?:\s|$)/.test(script))
  if (!viteVersion || (!viteConfig && !hasViteScript)) {
    throw new Error('Only Vite projects can be adopted.')
  }

  return {
    directory: projectDirectory,
    packageName: stringValue(packageJson.name) || 'unnamed-project',
    packageManager: await detectPackageManager(projectDirectory),
    vueVersion,
    viteVersion,
    viteConfig,
    git: await detectGit(projectDirectory),
    manifest: await detectManifest(projectDirectory)
  }
}

async function detectPackageManager(directory: string): Promise<PackageManager | 'unknown'> {
  if (await exists(resolve(directory, 'pnpm-lock.yaml'))) return 'pnpm'
  if (await exists(resolve(directory, 'package-lock.json'))) return 'npm'
  if (await exists(resolve(directory, 'yarn.lock'))) return 'yarn'
  return 'unknown'
}

async function detectGit(directory: string): Promise<DetectedProject['git']> {
  if (!await exists(resolve(directory, '.git'))) {
    return { isRepository: false, isClean: true }
  }

  try {
    const { stdout } = await execFileAsync('git', ['status', '--porcelain'], { cwd: directory })
    return { isRepository: true, isClean: stdout.trim().length === 0 }
  } catch {
    return { isRepository: true, isClean: false }
  }
}

async function detectManifest(directory: string): Promise<DetectedProject['manifest']> {
  const manifestPath = resolve(directory, '.fluffy/manifest.json')
  if (!await exists(manifestPath)) return 'absent'
  try {
    const manifest = JSON.parse(await readFile(manifestPath, 'utf8')) as { schemaVersion?: unknown }
    if (manifest.schemaVersion === 1) return 'v1'
    if (manifest.schemaVersion === 2) return 'v2'
  } catch {
    // Invalid manifests are rejected by adopt before writing anything.
  }
  throw new Error('Existing Fluffy manifest is invalid or unsupported.')
}

async function firstExisting(directory: string, names: string[]): Promise<string | undefined> {
  for (const name of names) {
    const path = resolve(directory, name)
    try {
      if ((await stat(path)).isFile()) return name
    } catch {
      // Continue searching.
    }
  }
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null ? value as Record<string, unknown> : {}
}

function stringValue(value: unknown): string {
  return typeof value === 'string' ? value : ''
}
