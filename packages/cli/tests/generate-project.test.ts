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
    expect(packageJson).toContain('"axios"')
    expect(packageJson).toContain('"echarts"')
    expect(packageJson).toContain('"lucide-vue-next"')
    expect(packageJson).toContain('"reka-ui"')
    expect(packageJson).toContain('"shadcn-vue"')
    expect(manifest.options.provider).toBe('vercel')
    expect(manifest.templateVersion).toBe('0.2.0')
    expect(manifest.files).toEqual(expect.arrayContaining([
      expect.objectContaining({ path: 'src/components/layout/Navbar.vue' }),
      expect.objectContaining({ path: 'src/components/layout/SidebarNav.vue' }),
      expect.objectContaining({ path: 'src/components/layout/TabBar.vue' }),
      expect.objectContaining({ path: 'src/components/navigation/CommandPalette.vue' }),
      expect.objectContaining({ path: 'src/layouts/DefaultLayout.vue' }),
      expect.objectContaining({ path: 'src/router/routes/modules/showcase.ts' }),
      expect.objectContaining({ path: 'src/pages/showcase/ChartsPage.vue' }),
      expect.objectContaining({ path: 'src/pages/showcase/TreePage.vue' }),
      expect.objectContaining({ path: 'src/components/extensions/FChart.vue' }),
      expect.objectContaining({ path: 'src/components/extensions/FEmpty.vue' }),
      expect.objectContaining({ path: 'src/components/extensions/FEmpty.test.ts' }),
      expect.objectContaining({ path: 'src/components/extensions/FIcon.vue' }),
      expect.objectContaining({ path: 'src/components/extensions/FTree.vue' }),
      expect.objectContaining({ path: 'src/components/extensions/FTypography.vue' }),
      expect.objectContaining({ path: 'src/directives/permission.ts' }),
      expect.objectContaining({ path: 'src/lib/utils.ts' }),
      expect.objectContaining({ path: 'components.json' }),
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
      expect.objectContaining({ path: 'src/api/base.ts' }),
      expect.objectContaining({ path: 'src/api/contracts.ts' }),
      expect.objectContaining({ path: 'src/api/index.ts' }),
      expect.objectContaining({ path: 'src/api/token.ts' }),
      expect.objectContaining({ path: 'src/api/token.test.ts' }),
      expect.objectContaining({ path: 'src/api/interceptors/index.ts' }),
      expect.objectContaining({ path: 'src/api/interceptors/index.test.ts' }),
      expect.objectContaining({ path: 'src/config/env.ts' }),
      expect.objectContaining({ path: 'src/composables/useTable.ts' }),
      expect.objectContaining({ path: 'src/composables/useLoading.test.ts' }),
      expect.objectContaining({ path: 'vitest.config.ts' }),
      expect.objectContaining({ path: 'src/stores/tabs.ts' })
    ]))
    expect(manifest.files).toEqual(expect.arrayContaining([
      expect.objectContaining({ path: 'src/components/ui/button/Button.vue', owner: 'generator-owned', templatePath: 'src/components/ui/button/Button.vue' }),
      expect.objectContaining({ path: 'src/components/ui/input/Input.vue', owner: 'generator-owned', templatePath: 'src/components/ui/input/Input.vue' }),
      expect.objectContaining({ path: 'src/components/ui/textarea/Textarea.vue', owner: 'generator-owned', templatePath: 'src/components/ui/textarea/Textarea.vue' }),
      expect.objectContaining({ path: 'src/components/ui/checkbox/Checkbox.vue', owner: 'generator-owned', templatePath: 'src/components/ui/checkbox/Checkbox.vue' }),
      expect.objectContaining({ path: 'src/components/ui/card/Card.vue', owner: 'generator-owned', templatePath: 'src/components/ui/card/Card.vue' }),
      expect.objectContaining({ path: 'src/components/ui/skeleton/Skeleton.vue', owner: 'generator-owned', templatePath: 'src/components/ui/skeleton/Skeleton.vue' }),
      expect.objectContaining({ path: 'src/components/extensions/FEmpty.vue', owner: 'generator-owned', templatePath: 'src/components/extensions/FEmpty.vue' }),
      expect.objectContaining({ path: 'src/components/extensions/FIcon.vue', owner: 'generator-owned', templatePath: 'src/components/extensions/FIcon.vue' }),
      expect.objectContaining({ path: 'src/lib/icons.ts', owner: 'generator-owned', templatePath: 'src/lib/icons.ts' }),
      expect.objectContaining({ path: 'src/lib/utils.ts', owner: 'generator-owned', templatePath: 'src/lib/utils.ts' }),
      expect.objectContaining({ path: 'src/styles/tokens.css', owner: 'generator-owned', templatePath: 'src/styles/tokens.css' }),
    ]))
    expect(packageJson).not.toContain('@fluffy-design-pro/ui')
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
    expect(envExample).toContain('# VITE_FLUFFY_OSS_BASE_URL=')
    expect(envExample).toContain('# VITE_FLUFFY_LOG_BASE_URL=')

    const envSource = await readFile(resolve(directory, 'src/config/env.ts'), 'utf8')
    expect(envSource).toContain('readAppEnv')
    expect(envSource).toContain('VITE_FLUFFY_OSS_BASE_URL')

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

  it('omits SDK integrations and dependencies by default', async () => {
    const directory = await temporaryDirectory()
    await createProject(defaultProjectOptions(directory))

    const packageJson = await readFile(resolve(directory, 'package.json'), 'utf8')
    expect(packageJson).not.toContain('fluffy-oss-sdk')
    expect(packageJson).not.toContain('fluffy-log-trace-browser-sdk')

    const manifest = JSON.parse(await readFile(resolve(directory, '.fluffy/manifest.json'), 'utf8'))
    const paths = manifest.files.map((file: { path: string }) => file.path)
    expect(paths).not.toEqual(expect.arrayContaining([
      'src/integrations/fluffy-oss.ts',
      'src/integrations/fluffy-oss.test.ts',
      'src/integrations/fluffy-log.ts',
      'src/integrations/fluffy-log.test.ts'
    ]))
  })

  it('generates Fluffy OSS and Log Trace integrations when enabled', async () => {
    const directory = await temporaryDirectory()
    const options = {
      ...defaultProjectOptions(directory),
      provider: 'none' as const,
      fluffyOss: true,
      fluffyLog: true,
      fluffyOssUrl: 'https://oss.example.com/api',
      fluffyLogUrl: 'https://logs.example.com/api/v1',
      fluffyOssProxy: 'http://localhost:3100',
      fluffyLogProxy: 'http://localhost:3500'
    }
    await createProject(options)

    const packageJson = await readFile(resolve(directory, 'package.json'), 'utf8')
    expect(packageJson).toContain('"fluffy-oss-sdk": "^0.1.1"')
    expect(packageJson).toContain('"fluffy-log-trace-browser-sdk": "^0.3.1"')

    const manifest = JSON.parse(await readFile(resolve(directory, '.fluffy/manifest.json'), 'utf8'))
    expect(manifest.options.fluffyOss).toBe(true)
    expect(manifest.options.fluffyLog).toBe(true)
    expect(manifest.options.fluffyOssUrl).toBe('https://oss.example.com/api')
    expect(manifest.files).toEqual(expect.arrayContaining([
      expect.objectContaining({ path: 'src/integrations/fluffy-oss.ts' }),
      expect.objectContaining({ path: 'src/integrations/fluffy-log.ts' }),
      expect.objectContaining({ path: 'src/integrations/fluffy-oss.test.ts' }),
      expect.objectContaining({ path: 'src/integrations/fluffy-log.test.ts' })
    ]))

    const envExample = await readFile(resolve(directory, '.env.example'), 'utf8')
    expect(envExample).toContain('VITE_FLUFFY_OSS_BASE_URL=https://oss.example.com/api')
    expect(envExample).toContain('VITE_FLUFFY_LOG_BASE_URL=https://logs.example.com/api/v1')
    expect(envExample).toContain('VITE_FLUFFY_OSS_PROXY_TARGET=http://localhost:3100')
    expect(envExample).toContain('VITE_FLUFFY_LOG_PROXY_TARGET=http://localhost:3500')

    const mainSource = await readFile(resolve(directory, 'src/main.ts'), 'utf8')
    expect(mainSource).toContain("import { initFluffyLog } from './integrations/fluffy-log'")
    expect(mainSource).toContain('initFluffyLog()')
  })

  it('generates only the enabled OSS integration', async () => {
    const directory = await temporaryDirectory()
    await createProject({
      ...defaultProjectOptions(directory),
      provider: 'none' as const,
      fluffyOss: true,
      fluffyOssUrl: 'https://oss.example.com/api'
    })

    const packageJson = await readFile(resolve(directory, 'package.json'), 'utf8')
    expect(packageJson).toContain('"fluffy-oss-sdk": "^0.1.1"')
    expect(packageJson).not.toContain('fluffy-log-trace-browser-sdk')

    const manifest = JSON.parse(await readFile(resolve(directory, '.fluffy/manifest.json'), 'utf8'))
    const paths = manifest.files.map((file: { path: string }) => file.path)
    expect(paths).toContain('src/integrations/fluffy-oss.ts')
    expect(paths).not.toContain('src/integrations/fluffy-log.ts')

    const envExample = await readFile(resolve(directory, '.env.example'), 'utf8')
    expect(envExample).toContain('VITE_FLUFFY_OSS_BASE_URL=https://oss.example.com/api')
    expect(envExample).toContain('# VITE_FLUFFY_LOG_BASE_URL=')
  })

  it('omits upload components and header wiring by default', async () => {
    const directory = await temporaryDirectory()
    await createProject(defaultProjectOptions(directory))

    const manifest = JSON.parse(await readFile(resolve(directory, '.fluffy/manifest.json'), 'utf8'))
    const paths = manifest.files.map((file: { path: string }) => file.path)
    expect(paths).not.toEqual(expect.arrayContaining([
      'src/components/ui/FUpload.vue',
      'src/components/ui/FUploadProgress.vue',
      'src/components/ui/FProgress.vue',
      'src/components/ui/FTabs.vue',
      'src/components/upload/UploadCenterPanel.vue',
      'src/stores/upload.ts'
    ]))

    const navbar = await readFile(resolve(directory, 'src/components/layout/Navbar.vue'), 'utf8')
    expect(navbar).not.toContain('UploadCenterPanel')
    const appSource = await readFile(resolve(directory, 'src/config/app.ts'), 'utf8')
    expect(appSource).toContain('uploadCenter: false')
    const componentsPage = await readFile(resolve(directory, 'src/pages/showcase/ComponentsPage.vue'), 'utf8')
    expect(componentsPage).not.toContain('FUpload')
  })

  it('generates upload components and header wiring when fluffy oss is enabled', async () => {
    const directory = await temporaryDirectory()
    await createProject({ ...defaultProjectOptions(directory), provider: 'none' as const, fluffyOss: true })

    const manifest = JSON.parse(await readFile(resolve(directory, '.fluffy/manifest.json'), 'utf8'))
    expect(manifest.files).toEqual(expect.arrayContaining([
      expect.objectContaining({ path: 'src/components/ui/FUpload.vue' }),
      expect.objectContaining({ path: 'src/components/ui/FUploadProgress.vue' }),
      expect.objectContaining({ path: 'src/components/ui/FProgress.vue' }),
      expect.objectContaining({ path: 'src/components/ui/FTabs.vue' }),
      expect.objectContaining({ path: 'src/components/upload/UploadCenterPanel.vue' }),
      expect.objectContaining({ path: 'src/stores/upload.ts' }),
      expect.objectContaining({ path: 'src/stores/upload.test.ts' }),
      expect.objectContaining({ path: 'src/components/ui/FUpload.test.ts' })
    ]))

    const navbar = await readFile(resolve(directory, 'src/components/layout/Navbar.vue'), 'utf8')
    expect(navbar).toContain('UploadCenterPanel')
    expect(navbar).toContain('isFluffyOssConfigured')
    const appSource = await readFile(resolve(directory, 'src/config/app.ts'), 'utf8')
    expect(appSource).toContain('uploadCenter: true')
    const componentsPage = await readFile(resolve(directory, 'src/pages/showcase/ComponentsPage.vue'), 'utf8')
    expect(componentsPage).toContain('FUpload')
  })
})
