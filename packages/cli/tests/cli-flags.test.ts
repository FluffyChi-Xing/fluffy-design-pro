import { resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ProjectOptions } from '../src/core/types.js'
import { createCliProgram } from '../src/index.js'

const { createProjectMock } = vi.hoisted(() => ({ createProjectMock: vi.fn() }))

vi.mock('@clack/prompts', () => ({
  intro: vi.fn(),
  outro: vi.fn(),
  note: vi.fn(),
  cancel: vi.fn(),
  isCancel: () => false,
  log: { error: vi.fn() },
  spinner: () => ({ start: vi.fn(), stop: vi.fn() })
}))

vi.mock('../src/core/create-project.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../src/core/create-project.js')>()
  return { ...actual, createProject: createProjectMock }
})

const directory = resolve(tmpdir(), 'regression-app')

beforeEach(() => {
  createProjectMock.mockClear()
})

afterEach(() => {
  vi.restoreAllMocks()
})

function capturedOptions(): ProjectOptions {
  expect(createProjectMock).toHaveBeenCalledTimes(1)
  return createProjectMock.mock.calls[0][0] as ProjectOptions
}

describe('createCliProgram flag parsing', () => {
  it('honors flags via the explicit `create` subcommand', async () => {
    await createCliProgram().parseAsync([
      'node', 'cli', 'create', directory,
      '--package-manager', 'pnpm',
      '--provider', 'cloudflare',
      '--cloudflare-target', 'workers',
      '--language', 'en-US',
      '--theme-color', '#ff0000',
      '--no-dark-mode'
    ])

    const options = capturedOptions()
    expect(options.provider).toBe('cloudflare')
    expect(options.cloudflareTarget).toBe('workers')
    expect(options.language).toBe('en-US')
    expect(options.themeColor).toBe('#ff0000')
    expect(options.darkMode).toBe(false)
    expect(options.packageManager).toBe('pnpm')
  })

  it('honors flags via the default subcommand (bare directory form)', async () => {
    await createCliProgram().parseAsync([
      'node', 'cli', directory,
      '--package-manager', 'pnpm',
      '--provider', 'none',
      '--no-dark-mode'
    ])

    const options = capturedOptions()
    expect(options.provider).toBe('none')
    expect(options.darkMode).toBe(false)
  })

  it('registers create options only on the `create` subcommand', () => {
    const program = createCliProgram()
    expect(program.commands.map((command) => command.name())).toContain('create')
    expect(program.options.map((option) => option.long).filter(Boolean)).not.toContain('--provider')
  })

  it('parses Fluffy SDK flags on the `create` subcommand', async () => {
    await createCliProgram().parseAsync([
      'node', 'cli', 'create', directory,
      '--package-manager', 'pnpm',
      '--provider', 'none',
      '--fluffy-oss',
      '--fluffy-log',
      '--fluffy-oss-url', 'https://oss.example.com/api',
      '--fluffy-log-url', 'https://logs.example.com/api/v1',
      '--fluffy-oss-proxy', 'http://localhost:3100',
      '--fluffy-log-proxy', 'http://localhost:3500'
    ])

    const options = capturedOptions()
    expect(options.fluffyOss).toBe(true)
    expect(options.fluffyLog).toBe(true)
    expect(options.fluffyOssUrl).toBe('https://oss.example.com/api')
    expect(options.fluffyLogUrl).toBe('https://logs.example.com/api/v1')
    expect(options.fluffyOssProxy).toBe('http://localhost:3100')
    expect(options.fluffyLogProxy).toBe('http://localhost:3500')
  })

  it('enables an SDK when only its url flag is passed', async () => {
    await createCliProgram().parseAsync([
      'node', 'cli', 'create', directory,
      '--package-manager', 'pnpm',
      '--provider', 'none',
      '--fluffy-oss-url', 'https://oss.example.com/api'
    ])

    const options = capturedOptions()
    expect(options.fluffyOss).toBe(true)
    expect(options.fluffyLog).toBe(false)
    expect(options.fluffyOssProxy).toBe('')
  })
})
