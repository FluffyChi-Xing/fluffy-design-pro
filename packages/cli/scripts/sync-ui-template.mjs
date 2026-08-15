import { cp, readdir, readFile, stat } from 'node:fs/promises'
import { dirname, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { uiCatalog } from '../../ui/catalog.mjs'

const mode = process.argv[2]
if (mode !== 'sync' && mode !== 'check') {
  throw new Error('Usage: node scripts/sync-ui-template.mjs <sync|check>')
}

const cliDirectory = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const repositoryDirectory = resolve(cliDirectory, '..', '..')
const sourceDirectory = resolve(repositoryDirectory, 'packages/ui')
const templateDirectory = resolve(cliDirectory, 'templates/core')
const managedDirectories = [
  'src/components/ui/button',
  'src/components/ui/input',
  'src/components/ui/textarea',
  'src/components/ui/checkbox',
  'src/components/ui/card',
  'src/components/ui/skeleton',
]

function safePath(root, path) {
  if (path.startsWith('/') || path.startsWith('\\') || path.split(/[\\/]/).includes('..')) {
    throw new Error(`Unsafe catalog path: ${path}`)
  }

  const resolved = resolve(root, path)
  if (relative(root, resolved).startsWith(`..${sep}`) || relative(root, resolved) === '..') {
    throw new Error(`Catalog path escapes its root: ${path}`)
  }
  return resolved
}

function normalize(content) {
  return content.toString().replace(/\r\n/g, '\n')
}

async function listFiles(directory, prefix = '') {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const path = `${prefix}${entry.name}`
    if (entry.isDirectory()) files.push(...await listFiles(resolve(directory, entry.name), `${path}/`))
    else if (entry.isFile()) files.push(path)
  }
  return files
}

const sources = new Set()
const targets = new Set()
for (const entry of uiCatalog) {
  if (!entry || typeof entry.source !== 'string' || typeof entry.target !== 'string' || typeof entry.group !== 'string') {
    throw new Error('Invalid UI catalog entry.')
  }
  if (sources.has(entry.source) || targets.has(entry.target)) throw new Error(`Duplicate UI catalog entry: ${entry.target}`)
  sources.add(entry.source)
  targets.add(entry.target)
  await stat(safePath(sourceDirectory, entry.source))
}

for (const directory of managedDirectories) {
  const existing = await listFiles(safePath(templateDirectory, directory), `${directory}/`)
  const unmanaged = existing.filter((path) => !targets.has(path))
  if (unmanaged.length) throw new Error(`Untracked files in managed template directory ${directory}: ${unmanaged.join(', ')}`)
}

const differences = []
for (const entry of uiCatalog) {
  const source = safePath(sourceDirectory, entry.source)
  const target = safePath(templateDirectory, entry.target)
  if (mode === 'sync') {
    await cp(source, target, { force: true })
    continue
  }

  try {
    const [sourceContent, targetContent] = await Promise.all([readFile(source), readFile(target)])
    if (normalize(sourceContent) !== normalize(targetContent)) differences.push(entry.target)
  } catch {
    differences.push(entry.target)
  }
}

if (differences.length) {
  throw new Error(`UI template drift detected: ${differences.join(', ')}`)
}
