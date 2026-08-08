import { writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import type { CloudflareTarget } from '../../core/types.js'

export async function writeCloudflareConfig(projectDirectory: string, target: CloudflareTarget, dryRun: boolean): Promise<string[]> {
  if (dryRun) {
    return ['wrangler.jsonc']
  }

  const config = target === 'workers'
    ? {
        name: 'replace-with-your-workers-project-name',
        compatibility_date: '2026-08-01',
        assets: {
          directory: './dist',
          not_found_handling: 'single-page-application'
        }
      }
    : {
        name: 'replace-with-your-pages-project-name',
        pages_build_output_dir: './dist'
      }
  await writeFile(resolve(projectDirectory, 'wrangler.jsonc'), `${JSON.stringify(config, null, 2)}\n`)
  return ['wrangler.jsonc']
}
