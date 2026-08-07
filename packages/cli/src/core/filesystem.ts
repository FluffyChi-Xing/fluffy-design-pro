import { createHash } from 'node:crypto'
import { cp, mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises'
import { basename, dirname, extname, relative, resolve } from 'node:path'

const binaryExtensions = new Set(['.ico', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.woff', '.woff2'])

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

export async function listFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = await Promise.all(entries.map(async (entry) => {
    const entryPath = resolve(directory, entry.name)
    if (entry.isDirectory()) {
      return listFiles(entryPath)
    }

    return [entryPath]
  }))

  return files.flat()
}

export function hashContent(content: string | Buffer): string {
  return createHash('sha256').update(content).digest('hex')
}

export async function copyTemplate(
  sourceDirectory: string,
  targetDirectory: string,
  variables: Record<string, string>,
  dryRun: boolean
): Promise<string[]> {
  const sourceFiles = await listFiles(sourceDirectory)
  const renderedFiles: string[] = []

  for (const sourcePath of sourceFiles) {
    const sourceRelativePath = relative(sourceDirectory, sourcePath).replaceAll('\\', '/')
    const targetRelativePath = sourceRelativePath === 'gitignore' ? '.gitignore' : sourceRelativePath
    const targetPath = resolve(targetDirectory, targetRelativePath)
    renderedFiles.push(targetRelativePath)

    if (dryRun) {
      continue
    }

    await mkdir(dirname(targetPath), { recursive: true })
    if (binaryExtensions.has(extname(sourcePath).toLowerCase())) {
      await cp(sourcePath, targetPath)
      continue
    }

    const source = await readFile(sourcePath, 'utf8')
    const rendered = Object.entries(variables).reduce(
      (content, [key, value]) => content.replaceAll(`__${key}__`, value),
      source
    )
    await writeFile(targetPath, rendered)
  }

  return renderedFiles
}

export function getProjectName(directory: string): string {
  return basename(resolve(directory))
}

export async function readGeneratedFile(directory: string, filePath: string): Promise<Buffer> {
  return readFile(resolve(directory, filePath))
}

export async function exists(path: string): Promise<boolean> {
  try {
    await stat(path)
    return true
  } catch {
    return false
  }
}
