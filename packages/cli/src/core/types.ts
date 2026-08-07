export type PackageManager = 'pnpm' | 'npm' | 'yarn'
export type DeployProvider = 'vercel' | 'none'

export interface ProjectOptions {
  directory: string
  name: string
  packageManager: PackageManager
  provider: DeployProvider
  themeColor: string
  language: 'zh-CN' | 'en-US'
  darkMode: boolean
  dryRun: boolean
}

export interface GeneratedFile {
  path: string
  hash: string
  owner: 'generator-owned'
}

export interface ProjectManifest {
  schemaVersion: 1
  cliVersion: string
  templateVersion: string
  createdAt: string
  options: Omit<ProjectOptions, 'directory' | 'dryRun'>
  files: GeneratedFile[]
}
