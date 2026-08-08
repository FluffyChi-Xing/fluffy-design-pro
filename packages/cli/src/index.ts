#!/usr/bin/env node
import { pathToFileURL } from 'node:url'
import * as p from '@clack/prompts'
import { Command } from 'commander'
import { adoptProject } from './core/adopt-project.js'
import { createProject, defaultProjectOptions } from './core/create-project.js'
import { migrateProject, rollbackMigration } from './core/migrate-project.js'
import { getProjectName } from './core/filesystem.js'
import type { DeployProvider, PackageManager, ProjectOptions } from './core/types.js'
import { assertCloudflareTarget, assertSupportedProvider } from './deploy/provider.js'

export function createCliProgram(): Command {
  const program = new Command()
  program.name('create-fluffy-design-pro').description('Create and migrate Fluffy Design Pro Vue admin applications')

  const createCommand = program.command('create', { isDefault: true }).description('Create a new Fluffy Design Pro Vue admin application')
  configureCreate(createCommand)

  program
    .command('adopt [directory]')
    .description('Inspect and adopt an existing Vue 3 and Vite project')
    .option('--dry-run', 'show the adoption report without writing a manifest')
    .option('--yes', 'write the manifest without an interactive confirmation')
    .action(async (directory: string | undefined, flags: Record<string, unknown>, command: Command) => {
      const commandOptions = commandFlags(flags, command)
      const selectedDirectory = resolveExistingDirectory(directory)
      const options = defaultProjectOptions(selectedDirectory)
      const dryRun = Boolean(commandOptions.dryRun)
      p.intro(dryRun ? 'Fluffy Design Pro adoption dry run' : 'Adopt a Vue 3 and Vite project')

      try {
        const report = await adoptProject({ directory: selectedDirectory, options, dryRun: true })
        p.note(formatAdoptionReport(report), 'Adoption report')
        if (dryRun) {
          p.outro('No files were written.')
          return
        }
        if (!commandOptions.yes && !await confirm('Write .fluffy/manifest.json without modifying project files?')) return
        await adoptProject({ directory: selectedDirectory, options, dryRun: false })
        p.outro('Project adopted. Only .fluffy/manifest.json was written.')
      } catch (error) {
        p.log.error(error instanceof Error ? error.message : String(error))
        process.exitCode = 1
      }
    })

  const migrateCommand = program.command('migrate [directory]').description('Plan or apply a managed-file migration')
  migrateCommand
    .option('--apply', 'apply the migration after review')
    .option('--yes', 'apply without an interactive confirmation; requires --apply')
    .action(async (directory: string | undefined, flags: Record<string, unknown>, command: Command) => {
      const commandOptions = commandFlags(flags, command)
      const selectedDirectory = resolveExistingDirectory(directory)
      try {
        const preview = await migrateProject({ directory: selectedDirectory, apply: false })
        p.intro(commandOptions.apply ? 'Apply Fluffy Design Pro migration' : 'Fluffy Design Pro migration dry run')
        p.note(formatMigrationPlan(preview.plan), 'Migration plan')
        if (!commandOptions.apply) {
          p.outro('No files were written. Re-run with --apply to migrate.')
          return
        }
        if (!commandOptions.yes && !await confirm('Apply this managed-file migration?')) return
        const result = await migrateProject({ directory: selectedDirectory, apply: true })
        if (result.plan.conflicts.length > 0) {
          throw new Error('Migration was not applied because managed-file conflicts were detected.')
        }
        p.outro(result.applied ? `Migration complete. Roll back with: migrate rollback ${result.plan.id} ${selectedDirectory}` : 'No managed file changes were needed.')
      } catch (error) {
        p.log.error(error instanceof Error ? error.message : String(error))
        process.exitCode = 1
      }
    })

  migrateCommand
    .command('rollback <transaction-id> [directory]')
    .description('Restore a committed migration when managed files are unchanged')
    .option('--yes', 'roll back without an interactive confirmation')
    .action(async (transactionId: string, directory: string | undefined, flags: Record<string, unknown>, command: Command) => {
      const commandOptions = commandFlags(flags, command)
      const selectedDirectory = resolveExistingDirectory(directory)
      try {
        p.intro('Roll back Fluffy Design Pro migration')
        if (!commandOptions.yes && !await confirm(`Restore migration ${transactionId}?`)) return
        await rollbackMigration(selectedDirectory, transactionId)
        p.outro(`Migration ${transactionId} was rolled back.`)
      } catch (error) {
        p.log.error(error instanceof Error ? error.message : String(error))
        process.exitCode = 1
      }
    })

  return program
}

function configureCreate(command: Command): void {
  command
    .argument('[directory]', 'directory for the new project')
    .option('--package-manager <manager>', 'pnpm, npm, or yarn')
    .option('--provider <provider>', 'vercel, cloudflare, or none', 'vercel')
    .option('--cloudflare-target <target>', 'cloudflare pages or workers', 'pages')
    .option('--theme-color <color>', 'hex primary color', '#4f46e5')
    .option('--language <locale>', 'zh-CN or en-US', 'zh-CN')
    .option('--no-dark-mode', 'disable the generated dark theme')
    .option('--dry-run', 'show planned generated files without writing')
    .action((directory: string | undefined, flags: Record<string, unknown>, actionCommand: Command) => {
      return createAction(directory, commandFlags(flags, actionCommand))
    })
}

function commandFlags(flags: Record<string, unknown>, command?: Command): Record<string, unknown> {
  const callbackOptions = typeof flags.opts === 'function' ? flags.opts() as Record<string, unknown> : flags
  return { ...command?.parent?.opts(), ...callbackOptions, ...command?.opts() }
}

async function createAction(directory: string | undefined, flags: Record<string, unknown>): Promise<void> {
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
}

async function requestDirectory(): Promise<string> {
  const value = await p.text({
    message: 'Where should the project be created?',
    placeholder: 'my-fluffy-app',
    validate: (input) => input.trim() ? undefined : 'A directory is required.'
  })
  ensureNotCancelled(value)
  return value.trim()
}

function resolveExistingDirectory(directory: string | undefined): string {
  return directory ?? process.cwd()
}

async function resolveOptions(directory: string, flags: Record<string, unknown>): Promise<ProjectOptions> {
  const defaults = defaultProjectOptions(directory)
  const packageManager = flags.packageManager === undefined
    ? await selectPackageManager(defaults.packageManager)
    : validatePackageManager(String(flags.packageManager))
  const provider = assertProvider(String(flags.provider ?? defaults.provider))
  const cloudflareTarget = assertCloudflareTarget(String(flags.cloudflareTarget ?? defaults.cloudflareTarget))
  const language = validateLanguage(String(flags.language ?? defaults.language))
  const themeColor = validateThemeColor(String(flags.themeColor ?? defaults.themeColor))

  return {
    ...defaults,
    name: getProjectName(directory),
    packageManager,
    provider,
    cloudflareTarget,
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

async function confirm(message: string): Promise<boolean> {
  const value = await p.confirm({ message })
  ensureNotCancelled(value)
  if (!value) {
    p.cancel('Operation cancelled.')
  }
  return value
}

function ensureNotCancelled(value: string | boolean | symbol): asserts value is string | boolean {
  if (p.isCancel(value)) {
    p.cancel('Operation cancelled.')
    process.exit(0)
  }
}

function validatePackageManager(value: string): PackageManager {
  if (value === 'pnpm' || value === 'npm' || value === 'yarn') return value
  throw new Error('Package manager must be pnpm, npm, or yarn.')
}

function assertProvider(value: string): DeployProvider {
  assertSupportedProvider(value)
  return value
}

function validateLanguage(value: string): ProjectOptions['language'] {
  if (value === 'zh-CN' || value === 'en-US') return value
  throw new Error('Language must be zh-CN or en-US.')
}

function validateThemeColor(value: string): string {
  if (!/^#[0-9a-fA-F]{6}$/.test(value)) {
    throw new Error('Theme color must be a six-digit hex color, such as #4f46e5.')
  }
  return value
}

function formatAdoptionReport(report: Awaited<ReturnType<typeof adoptProject>>): string {
  const managed = report.managedFiles.map((file) => `- managed: ${file.path}`).join('\n') || '- managed: none'
  const conflicts = report.conflicts.map((conflict) => `- conflict: ${conflict.path}`).join('\n') || '- conflicts: none'
  return [
    `Vue ${report.project.vueVersion}; Vite ${report.project.viteVersion}; package manager: ${report.project.packageManager}`,
    `Git: ${report.project.git.isRepository ? (report.project.git.isClean ? 'clean' : 'dirty') : 'not detected'}`,
    managed,
    conflicts
  ].join('\n')
}

function formatMigrationPlan(plan: Awaited<ReturnType<typeof migrateProject>>['plan']): string {
  const changes = plan.changes.map((change) => `- update: ${change.path}`).join('\n') || '- changes: none'
  const conflicts = plan.conflicts.map((conflict) => `- conflict: ${conflict.path} (${conflict.reason})`).join('\n') || '- conflicts: none'
  return [changes, conflicts, ...plan.warnings.map((warning) => `- warning: ${warning}`)].join('\n')
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  createCliProgram().parseAsync().catch((error: unknown) => {
    p.log.error(error instanceof Error ? error.message : String(error))
    process.exitCode = 1
  })
}
