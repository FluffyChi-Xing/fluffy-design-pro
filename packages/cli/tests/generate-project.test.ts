import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { createProject, defaultProjectOptions } from '../src/core/create-project.js'

const directories: string[] = []

async function temporaryDirectory(): Promise<string> {
  const directory = await mkdtemp(resolve(tmpdir(), 'fluffy-design-pro-'))
  directories.push(directory)
  return directory
}

afterEach(async () => {
  await Promise.all(directories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })))
})

describe('createProject', () => {
  it('generates a Vue project, manifest, and default Vercel configuration', async () => {
    const directory = await temporaryDirectory()
    const options = { ...defaultProjectOptions(directory), name: 'admin-console' }

    await createProject(options)

    const packageJson = await readFile(resolve(directory, 'package.json'), 'utf8')
    const manifest = JSON.parse(await readFile(resolve(directory, '.fluffy/manifest.json'), 'utf8'))
    const vercel = JSON.parse(await readFile(resolve(directory, 'vercel.json'), 'utf8'))

    expect(packageJson).toContain('"name": "admin-console"')
    expect(packageJson).toContain('"echarts"')
    expect(manifest.options.provider).toBe('vercel')
    expect(manifest.files).toEqual(expect.arrayContaining([
      expect.objectContaining({ path: 'src/components/layout/Navbar.vue' }),
      expect.objectContaining({ path: 'src/components/layout/SidebarNav.vue' }),
      expect.objectContaining({ path: 'src/components/layout/TabBar.vue' }),
      expect.objectContaining({ path: 'src/components/navigation/CommandPalette.vue' }),
      expect.objectContaining({ path: 'src/layouts/DefaultLayout.vue' }),
      expect.objectContaining({ path: 'src/router/routes/modules/showcase.ts' }),
      expect.objectContaining({ path: 'src/pages/showcase/ChartsPage.vue' }),
      expect.objectContaining({ path: 'src/pages/showcase/FormPage.vue' }),
      expect.objectContaining({ path: 'src/pages/showcase/FeedbackPage.vue' }),
      expect.objectContaining({ path: 'src/pages/showcase/TokensPage.vue' }),
      expect.objectContaining({ path: 'src/pages/LoginPage.vue' }),
      expect.objectContaining({ path: 'src/components/form/FForm.vue' }),
      expect.objectContaining({ path: 'src/components/form/FForm.test.ts' }),
      expect.objectContaining({ path: 'src/components/ui/FButton.vue' }),
      expect.objectContaining({ path: 'src/components/ui/FFormItem.vue' }),
      expect.objectContaining({ path: 'src/components/ui/FInput.vue' }),
      expect.objectContaining({ path: 'src/components/ui/FPanel.vue' }),
      expect.objectContaining({ path: 'src/components/ui/FResult.vue' }),
      expect.objectContaining({ path: 'src/components/ui/FSelect.vue' }),
      expect.objectContaining({ path: 'src/components/ui/FSkeleton.vue' }),
      expect.objectContaining({ path: 'src/components/ui/FSpinner.vue' }),
      expect.objectContaining({ path: 'src/components/ui/FTextarea.vue' }),
      expect.objectContaining({ path: 'src/components/ui/FCheckbox.vue' }),
      expect.objectContaining({ path: 'src/components/ui/FToastHost.vue' }),
      expect.objectContaining({ path: 'src/components/ui/FCode.vue' }),
      expect.objectContaining({ path: 'src/components/ui/FSheet.vue' }),
      expect.objectContaining({ path: 'src/components/ui/FDropdown.vue' }),
      expect.objectContaining({ path: 'src/components/ui/FPopover.vue' }),
      expect.objectContaining({ path: 'src/components/ui/FFullscreen.vue' }),
      expect.objectContaining({ path: 'src/components/settings/SettingsPanel.vue' }),
      expect.objectContaining({ path: 'src/components/notification/NotificationsPanel.vue' }),
      expect.objectContaining({ path: 'src/components/markdown/FMarkdown.vue' }),
      expect.objectContaining({ path: 'src/config/env.ts' }),
      expect.objectContaining({ path: 'src/composables/useTable.ts' }),
      expect.objectContaining({ path: 'src/composables/useLoading.test.ts' }),
      expect.objectContaining({ path: 'vitest.config.ts' }),
      expect.objectContaining({ path: 'src/stores/tabs.ts' })
    ]))
    expect(vercel.outputDirectory).toBe('dist')
  })

  it('plans Cloudflare Pages configuration during a dry run', async () => {
    const directory = resolve(await temporaryDirectory(), 'nested-project')
    const options = { ...defaultProjectOptions(directory), provider: 'cloudflare' as const, dryRun: true }

    const result = await createProject(options)

    expect(result.created).toBe(false)
    expect(result.files).toEqual(expect.arrayContaining(['public/_redirects', 'wrangler.jsonc']))
    await expect(readdir(directory)).rejects.toMatchObject({ code: 'ENOENT' })
  })

  it('refuses to overwrite a non-empty directory', async () => {
    const directory = await temporaryDirectory()
    await writeFile(resolve(directory, 'existing.txt'), 'keep')

    await expect(createProject(defaultProjectOptions(directory))).rejects.toThrow('Target directory is not empty')
  })

  it('generates Cloudflare Pages configuration without Vercel configuration', async () => {
    const directory = await temporaryDirectory()
    const options = { ...defaultProjectOptions(directory), provider: 'cloudflare' as const }

    await createProject(options)

    const manifest = JSON.parse(await readFile(resolve(directory, '.fluffy/manifest.json'), 'utf8'))
    const cloudflare = JSON.parse(await readFile(resolve(directory, 'wrangler.jsonc'), 'utf8'))

    expect(cloudflare.pages_build_output_dir).toBe('./dist')
    expect(manifest.options.provider).toBe('cloudflare')
    expect(manifest.options.cloudflareTarget).toBe('pages')
    expect(manifest.files).toEqual(expect.arrayContaining([
      expect.objectContaining({ path: 'public/_redirects' }),
      expect.objectContaining({ path: 'wrangler.jsonc' })
    ]))
    const wrangler = manifest.files.find((file: { path: string }) => file.path === 'wrangler.jsonc')
    expect(wrangler.templatePath).toBeUndefined()
    expect(await readFile(resolve(directory, 'public/_redirects'), 'utf8')).toBe('/* /index.html 200\n')
    await expect(readFile(resolve(directory, 'vercel.json'), 'utf8')).rejects.toMatchObject({ code: 'ENOENT' })
  })

  it('generates Cloudflare Workers configuration when targeting workers', async () => {
    const directory = await temporaryDirectory()
    const options = { ...defaultProjectOptions(directory), provider: 'cloudflare' as const, cloudflareTarget: 'workers' as const }

    await createProject(options)

    const manifest = JSON.parse(await readFile(resolve(directory, '.fluffy/manifest.json'), 'utf8'))
    const wrangler = JSON.parse(await readFile(resolve(directory, 'wrangler.jsonc'), 'utf8'))

    expect(wrangler.pages_build_output_dir).toBeUndefined()
    expect(wrangler.assets.directory).toBe('./dist')
    expect(wrangler.assets.not_found_handling).toBe('single-page-application')
    expect(manifest.options.provider).toBe('cloudflare')
    expect(manifest.options.cloudflareTarget).toBe('workers')
    expect(manifest.files).toEqual(expect.arrayContaining([
      expect.objectContaining({ path: 'wrangler.jsonc' })
    ]))
    await expect(readFile(resolve(directory, 'vercel.json'), 'utf8')).rejects.toMatchObject({ code: 'ENOENT' })
  })

  it('generates the env mechanism and app shell settings', async () => {
    const directory = await temporaryDirectory()
    await createProject({ ...defaultProjectOptions(directory), name: 'env-demo', provider: 'none' as const })

    const envExample = await readFile(resolve(directory, '.env.example'), 'utf8')
    expect(envExample).toContain('VITE_APP_TITLE=env-demo')
    expect(envExample).toContain('VITE_OSS_ENDPOINT')
    expect(envExample).toContain('VITE_LOG_TRACE_ENDPOINT')

    const envSource = await readFile(resolve(directory, 'src/config/env.ts'), 'utf8')
    expect(envSource).toContain('readAppEnv')

    const appConfigSource = await readFile(resolve(directory, 'src/config/app.ts'), 'utf8')
    expect(appConfigSource).toContain('headerActions')
    expect(appConfigSource).toContain('menuWidth')
  })

  it('omits provider root configuration when provider is none', async () => {
    const directory = await temporaryDirectory()
    const options = { ...defaultProjectOptions(directory), provider: 'none' as const }

    await createProject(options)

    await expect(readFile(resolve(directory, 'vercel.json'), 'utf8')).rejects.toMatchObject({ code: 'ENOENT' })
    await expect(readFile(resolve(directory, 'wrangler.jsonc'), 'utf8')).rejects.toMatchObject({ code: 'ENOENT' })
  })
})
