#!/usr/bin/env node
import * as p from '@clack/prompts'
import { Command } from 'commander'
import { createProject, defaultProjectOptions } from './core/create-project.js'
import type { DeployProvider, PackageManager, ProjectOptions } from './core/types.js'
import { assertSupportedProvider } from './deploy/provider.js'

const program = new Command()

program
  .name('create-fluffy-design-pro')
  .description('Create a Fluffy Design Pro Vue admin application')
  .argument('[directory]', 'directory for the new project')
  .option('--package-manager <manager>', 'pnpm, npm, or yarn')
  .option('--provider <provider>', 'vercel or none', 'vercel')
  .option('--theme-color <color>', 'hex primary color', '#4f46e5')
  .option('--language <locale>', 'zh-CN or en-US', 'zh-CN')
  .option('--no-dark-mode', 'disable the generated dark theme')
  .option('--dry-run', 'show planned generated files without writing')
  .action(async (directory: string | undefined, flags: Record<string, unknown>) => {
    const selectedDirectory = directory ?? await requestDirectory()
    const options = await resolveOptions(selectedDirectory, flags)

    if (options.dryRun) {
      p.intro('Fluffy Design Pro dry run')
    } else {
      p.intro('Create Fluffy Design Pro')
    }

    const spinner = p.spinner()
    spinner.start(options.dryRun ? 'Planning project files' : 'Generating project files')

    try {
      const result = await createProject(options)
      spinner.stop(`${options.dryRun ? 'Planned' : 'Generated'} ${result.files.length} files`)
      p.note(result.files.map((file) => `- ${file}`).join('\n'), options.dryRun ? 'Planned files' : 'Generated files')

      if (options.dryRun) {
        p.outro('No files were written.')
        return
      }

      p.outro(`Next steps:\n  cd ${options.directory}\n  ${options.packageManager} install\n  ${options.packageManager} dev`)
    } catch (error) {
      spinner.stop('Generation failed')
      p.log.error(error instanceof Error ? error.message : String(error))
      process.exitCode = 1
    }
  })

async function requestDirectory(): Promise<string> {
  const value = await p.text({
    message: 'Where should the project be created?',
    placeholder: 'my-fluffy-app',
    validate: (input) => input.trim() ? undefined : 'A directory is required.'
  })
  ensureNotCancelled(value)
  return value.trim()
}

async function resolveOptions(directory: string, flags: Record<string, unknown>): Promise<ProjectOptions> {
  const defaults = defaultProjectOptions(directory)
  const packageManager = flags.packageManager === undefined
    ? await selectPackageManager(defaults.packageManager)
    : validatePackageManager(String(flags.packageManager))
  const provider = assertProvider(String(flags.provider ?? defaults.provider))
  const language = validateLanguage(String(flags.language ?? defaults.language))
  const themeColor = validateThemeColor(String(flags.themeColor ?? defaults.themeColor))

  return {
    ...defaults,
    name: defaults.name,
    packageManager,
    provider,
    language,
    themeColor,
    darkMode: flags.darkMode === undefined ? defaults.darkMode : Boolean(flags.darkMode),
    dryRun: Boolean(flags.dryRun)
  }
}

async function selectPackageManager(defaultValue: PackageManager): Promise<PackageManager> {
  const value = await p.select({
    message: 'Select a package manager',
    initialValue: defaultValue,
    options: [
      { value: 'pnpm', label: 'pnpm' },
      { value: 'npm', label: 'npm' },
      { value: 'yarn', label: 'yarn' }
    ]
  })
  ensureNotCancelled(value)
  return value
}

function ensureNotCancelled(value: string | symbol): asserts value is string {
  if (p.isCancel(value)) {
    p.cancel('Operation cancelled.')
    process.exit(0)
  }
}

function validatePackageManager(value: string): PackageManager {
  if (value === 'pnpm' || value === 'npm' || value === 'yarn') {
    return value
  }
  throw new Error('Package manager must be pnpm, npm, or yarn.')
}

function assertProvider(value: string): DeployProvider {
  assertSupportedProvider(value)
  return value
}

function validateLanguage(value: string): ProjectOptions['language'] {
  if (value === 'zh-CN' || value === 'en-US') {
    return value
  }
  throw new Error('Language must be zh-CN or en-US.')
}

function validateThemeColor(value: string): string {
  if (!/^#[0-9a-fA-F]{6}$/.test(value)) {
    throw new Error('Theme color must be a six-digit hex color, such as #4f46e5.')
  }
  return value
}

program.parseAsync().catch((error: unknown) => {
  p.log.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
})
