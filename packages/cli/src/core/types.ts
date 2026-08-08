export type PackageManager = 'pnpm' | 'npm' | 'yarn'
export type DeployProvider = 'vercel' | 'cloudflare' | 'none'
export type CloudflareTarget = 'pages' | 'workers'

export interface ProjectOptions {
  directory: string
  name: string
  packageManager: PackageManager
  provider: DeployProvider
  cloudflareTarget: CloudflareTarget
  themeColor: string
  language: 'zh-CN' | 'en-US'
  darkMode: boolean
  fluffyOss: boolean
  fluffyLog: boolean
  fluffyOssUrl: string
  fluffyLogUrl: string
  fluffyOssProxy: string
  fluffyLogProxy: string
  dryRun: boolean
}

export type FileOwner = 'generator-owned' | 'user-owned'

export interface GeneratedFileV1 {
  path: string
  hash: string
  owner: 'generator-owned'
}

export interface ProjectManifestV1 {
  schemaVersion: 1
  cliVersion: string
  templateVersion: string
  createdAt: string
  options: Omit<ProjectOptions, 'directory' | 'dryRun'>
  files: GeneratedFileV1[]
}

export interface ManagedFile {
  path: string
  owner: FileOwner
  baselineHash: string
  templatePath?: string
  templateVersion: string
  lastTransactionId?: string
}

export interface MigrationChange {
  path: string
  operation: 'update'
  beforeHash: string
  afterHash: string
}

export interface MigrationTransaction {
  id: string
  status: 'committed' | 'rolled-back'
  createdAt: string
  completedAt: string
  backupPath: string
  changes: MigrationChange[]
}

export interface ProjectManifest {
  schemaVersion: 2
  cliVersion: string
  templateVersion: string
  createdAt: string
  adoptedAt?: string
  projectKind: 'created' | 'adopted'
  options: Omit<ProjectOptions, 'directory' | 'dryRun'>
  files: ManagedFile[]
  migrations: MigrationTransaction[]
}

export interface DetectedProject {
  directory: string
  packageName: string
  packageManager: PackageManager | 'unknown'
  vueVersion: string
  viteVersion: string
  viteConfig?: string
  git: {
    isRepository: boolean
    isClean: boolean
  }
  manifest: 'absent' | 'v1' | 'v2'
}

export interface AdoptionConflict {
  path: string
  reason: 'content-mismatch'
}

export interface AdoptionReport {
  project: DetectedProject
  managedFiles: ManagedFile[]
  conflicts: AdoptionConflict[]
}

export interface MigrationConflict {
  path: string
  reason: 'missing-managed-file' | 'modified-managed-file' | 'missing-template-file'
}

export interface PlannedMigrationChange extends MigrationChange {
  content: Buffer
}

export interface MigrationPlan {
  id: string
  changes: PlannedMigrationChange[]
  conflicts: MigrationConflict[]
  warnings: string[]
}
