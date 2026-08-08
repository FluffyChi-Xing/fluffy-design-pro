import { createHash, randomUUID } from 'node:crypto'
import { cp, lstat, mkdir, readFile, readdir, rename, rm, stat, writeFile } from 'node:fs/promises'
import { basename, dirname, extname, isAbsolute, relative, resolve, sep } from 'node:path'

const binaryExtensions = new Set(['.ico', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.woff', '.woff2'])
const protectedPathSegments = new Set(['.git', 'node_modules'])

export async function ensureEmptyDirectory(directory: string): Promise<void> {
  try {
    const entries = await readdir(directory)
    if (entries.length > 0) {
      throw new Error(`Target directory is not empty: ${directory}`)
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return
    }

    throw error
  }
}

export async function listFiles(directory: string, ignoredDirectories = new Set<string>()): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = await Promise.all(entries.map(async (entry) => {
    const entryPath = resolve(directory, entry.name)
    if (entry.isDirectory()) {
      return ignoredDirectories.has(entry.name) ? [] : listFiles(entryPath, ignoredDirectories)
    }

    return [entryPath]
  }))

  return files.flat()
}

export function hashContent(content: string | Buffer): string {
  return createHash('sha256').update(content).digest('hex')
}

export function assertSafeRelativePath(filePath: string): void {
  if (!filePath || filePath.includes('\0') || isAbsolute(filePath) || /^[a-zA-Z]:/.test(filePath) || filePath.startsWith('\\')) {
    throw new Error(`Unsafe managed file path: ${filePath}`)
  }

  const normalized = filePath.replaceAll('\\', '/')
  const segments = normalized.split('/')
  if (segments.some((segment) => !segment || segment === '.' || segment === '..')) {
    throw new Error(`Unsafe managed file path: ${filePath}`)
  }

  if (segments.some((segment) => protectedPathSegments.has(segment)) || normalized.startsWith('.fluffy/backups/') || normalized.startsWith('.fluffy/staging/') || normalized === '.npmrc' || normalized === '.env' || normalized === '.env.local' || /\.(pem|key)$/i.test(normalized)) {
    throw new Error(`Protected managed file path: ${filePath}`)
  }
}

export function safeResolve(projectDirectory: string, filePath: string): string {
  assertSafeRelativePath(filePath)
  return resolveInside(projectDirectory, filePath)
}

export function safeResolveInternal(directory: string, filePath: string): string {
  if (!filePath || filePath.includes('\0') || isAbsolute(filePath) || /^[a-zA-Z]:/.test(filePath) || filePath.startsWith('\\')) {
    throw new Error(`Unsafe internal file path: ${filePath}`)
  }
  const normalized = filePath.replaceAll('\\', '/')
  if (normalized.split('/').some((segment) => !segment || segment === '.' || segment === '..')) {
    throw new Error(`Unsafe internal file path: ${filePath}`)
  }
  return resolveInside(directory, normalized)
}

function resolveInside(directory: string, filePath: string): string {
  const root = resolve(directory)
  const resolvedPath = resolve(root, filePath)
  const relativePath = relative(root, resolvedPath)
  if (!relativePath || relativePath === '..' || relativePath.startsWith(`..${sep}`) || isAbsolute(relativePath)) {
    throw new Error(`Unsafe file path: ${filePath}`)
  }
  return resolvedPath
}

export async function renderTemplate(
  sourceDirectory: string,
  variables: Record<string, string>
): Promise<Map<string, Buffer>> {
  const sourceFiles = await listFiles(sourceDirectory)
  const renderedFiles = new Map<string, Buffer>()

  for (const sourcePath of sourceFiles) {
    const sourceRelativePath = relative(sourceDirectory, sourcePath).replaceAll('\\', '/')
    const targetRelativePath = sourceRelativePath === 'gitignore' ? '.gitignore' : sourceRelativePath
    if (binaryExtensions.has(extname(sourcePath).toLowerCase())) {
      renderedFiles.set(targetRelativePath, await readFile(sourcePath))
      continue
    }

    const source = await readFile(sourcePath, 'utf8')
    const rendered = Object.entries(variables).reduce(
      (content, [key, value]) => content.replaceAll(`__${key}__`, value),
      source
    )
    renderedFiles.set(targetRelativePath, Buffer.from(rendered))
  }

  return renderedFiles
}

export async function copyTemplate(
  sourceDirectory: string,
  targetDirectory: string,
  variables: Record<string, string>,
  dryRun: boolean
): Promise<string[]> {
  const renderedFiles = await renderTemplate(sourceDirectory, variables)

  for (const [targetRelativePath, content] of renderedFiles) {
    if (dryRun) continue
    const targetPath = resolve(targetDirectory, targetRelativePath)
    await mkdir(dirname(targetPath), { recursive: true })
    await writeFile(targetPath, content)
  }

  return [...renderedFiles.keys()]
}

export function getProjectName(directory: string): string {
  return basename(resolve(directory))
}

export async function readGeneratedFile(directory: string, filePath: string): Promise<Buffer> {
  return readFile(safeResolve(directory, filePath))
}

export async function atomicWriteFile(targetPath: string, content: string | Buffer): Promise<void> {
  await mkdir(dirname(targetPath), { recursive: true })
  const temporaryPath = resolve(dirname(targetPath), `.${basename(targetPath)}.${randomUUID()}.tmp`)
  await writeFile(temporaryPath, content)
  await rename(temporaryPath, targetPath)
}

export async function copyFileTo(sourcePath: string, targetPath: string): Promise<void> {
  await mkdir(dirname(targetPath), { recursive: true })
  await cp(sourcePath, targetPath)
}

export async function removePath(path: string): Promise<void> {
  await rm(path, { force: true })
}

export async function assertNoSymlink(path: string): Promise<void> {
  try {
    if ((await lstat(path)).isSymbolicLink()) {
      throw new Error(`Symbolic links are not supported for managed paths: ${path}`)
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw error
    }
  }
}

export async function assertNoSymlinkPath(projectDirectory: string, filePath: string): Promise<void> {
  const root = resolve(projectDirectory)
  const targetPath = safeResolve(root, filePath)
  let current = root
  for (const segment of relative(root, targetPath).split(sep)) {
    if (!segment) continue
    current = resolve(current, segment)
    await assertNoSymlink(current)
  }
}

export async function exists(path: string): Promise<boolean> {
  try {
    await stat(path)
    return true
  } catch {
    return false
  }
}
