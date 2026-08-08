import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { atomicWriteFile, assertSafeRelativePath, hashContent, readGeneratedFile } from './filesystem.js'
import type { GeneratedFileV1, ManagedFile, ProjectManifest, ProjectManifestV1, ProjectOptions } from './types.js'

const CLI_VERSION = '0.2.0'
const TEMPLATE_VERSION = '0.1.0'
const manifestRelativePath = '.fluffy/manifest.json'

export async function writeManifest(
  projectDirectory: string,
  files: string[],
  options: ProjectOptions,
  runtimeFiles: string[] = []
): Promise<ProjectManifest> {
  const manifest: ProjectManifest = {
    schemaVersion: 2,
    cliVersion: CLI_VERSION,
    templateVersion: TEMPLATE_VERSION,
    createdAt: new Date().toISOString(),
    projectKind: 'created',
    options: manifestOptions(options),
    files: await Promise.all(files.map(async (path) => managedFile(projectDirectory, path, !runtimeFiles.includes(path)))),
    migrations: []
  }

  await writeProjectManifest(projectDirectory, manifest)
  return manifest
}

export async function readManifest(projectDirectory: string): Promise<ProjectManifest> {
  const manifestPath = resolve(projectDirectory, manifestRelativePath)
  let parsed: unknown
  try {
    parsed = JSON.parse(await readFile(manifestPath, 'utf8'))
  } catch (error) {
    throw new Error(`Unable to read Fluffy manifest: ${error instanceof Error ? error.message : String(error)}`)
  }

  if (!isRecord(parsed) || typeof parsed.schemaVersion !== 'number') {
    throw new Error('Invalid Fluffy manifest.')
  }
  if (parsed.schemaVersion === 1) {
    return upgradeV1Manifest(parsed as unknown as ProjectManifestV1)
  }
  if (parsed.schemaVersion !== 2) {
    throw new Error(`Unsupported Fluffy manifest schema: ${parsed.schemaVersion}`)
  }

  validateManifest(parsed)
  return parsed as unknown as ProjectManifest
}

export async function writeProjectManifest(projectDirectory: string, manifest: ProjectManifest): Promise<void> {
  validateManifest(manifest)
  await atomicWriteFile(resolve(projectDirectory, manifestRelativePath), `${JSON.stringify(manifest, null, 2)}\n`)
}

export function createAdoptedManifest(options: ProjectOptions, files: ManagedFile[]): ProjectManifest {
  const now = new Date().toISOString()
  return {
    schemaVersion: 2,
    cliVersion: CLI_VERSION,
    templateVersion: TEMPLATE_VERSION,
    createdAt: now,
    adoptedAt: now,
    projectKind: 'adopted',
    options: manifestOptions(options),
    files,
    migrations: []
  }
}

export async function managedFile(projectDirectory: string, path: string, templateBacked = true): Promise<ManagedFile> {
  assertSafeRelativePath(path)
  const file: ManagedFile = {
    path,
    owner: 'generator-owned',
    baselineHash: hashContent(await readGeneratedFile(projectDirectory, path)),
    templateVersion: TEMPLATE_VERSION
  }
  if (templateBacked) {
    file.templatePath = path
  }
  return file
}

export function getTemplateVersion(): string {
  return TEMPLATE_VERSION
}

function manifestOptions(options: ProjectOptions): ProjectManifest['options'] {
  return {
    name: options.name,
    packageManager: options.packageManager,
    provider: options.provider,
    cloudflareTarget: options.cloudflareTarget,
    themeColor: options.themeColor,
    language: options.language,
    darkMode: options.darkMode,
    fluffyOss: options.fluffyOss,
    fluffyLog: options.fluffyLog,
    fluffyOssUrl: options.fluffyOssUrl,
    fluffyLogUrl: options.fluffyLogUrl,
    fluffyOssProxy: options.fluffyOssProxy,
    fluffyLogProxy: options.fluffyLogProxy
  }
}

function upgradeV1Manifest(manifest: ProjectManifestV1): ProjectManifest {
  if (!Array.isArray(manifest.files)) {
    throw new Error('Invalid Fluffy manifest.')
  }
  const files = manifest.files.map(upgradeV1File)
  const upgraded: ProjectManifest = {
    schemaVersion: 2,
    cliVersion: manifest.cliVersion,
    templateVersion: manifest.templateVersion,
    createdAt: manifest.createdAt,
    projectKind: 'created',
    options: manifest.options,
    files,
    migrations: []
  }
  validateManifest(upgraded)
  return upgraded
}

function upgradeV1File(file: GeneratedFileV1): ManagedFile {
  return {
    path: file.path,
    owner: file.owner,
    baselineHash: file.hash,
    templatePath: file.path,
    templateVersion: TEMPLATE_VERSION
  }
}

function validateManifest(manifest: unknown): asserts manifest is ProjectManifest {
  if (!isRecord(manifest) || manifest.schemaVersion !== 2 || !Array.isArray(manifest.files) || !Array.isArray(manifest.migrations)) {
    throw new Error('Invalid Fluffy manifest.')
  }

  const paths = new Set<string>()
  for (const file of manifest.files) {
    if (!isRecord(file) || typeof file.path !== 'string' || (file.owner !== 'generator-owned' && file.owner !== 'user-owned') || typeof file.baselineHash !== 'string' || !/^[a-f0-9]{64}$/.test(file.baselineHash) || typeof file.templateVersion !== 'string') {
      throw new Error('Invalid Fluffy manifest file entry.')
    }
    assertSafeRelativePath(file.path)
    if (paths.has(file.path)) {
      throw new Error(`Duplicate managed file path: ${file.path}`)
    }
    paths.add(file.path)
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
