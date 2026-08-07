import { writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

export async function writeVercelConfig(projectDirectory: string, dryRun: boolean): Promise<string[]> {
  if (dryRun) {
    return ['vercel.json']
  }

  const config = {
    $schema: 'https://openapi.vercel.sh/vercel.json',
    outputDirectory: 'dist',
    rewrites: [{ source: '/(.*)', destination: '/index.html' }]
  }
  await writeFile(resolve(projectDirectory, 'vercel.json'), `${JSON.stringify(config, null, 2)}\n`)
  return ['vercel.json']
}
