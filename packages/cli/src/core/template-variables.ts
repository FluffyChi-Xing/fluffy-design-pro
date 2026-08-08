import { fluffyLogEnvBlock, fluffyOssEnvBlock } from './fluffy-env.js'
import type { ProjectOptions } from './types.js'

const fluffyUploadImport = [
  "import UploadCenterPanel from '@/components/upload/UploadCenterPanel.vue'",
  "import { isFluffyOssConfigured } from '@/integrations/fluffy-oss'"
].join('\n')

const fluffyUploadOpen = 'const uploadCenterOpen = shallowRef(false)'

const fluffyUploadCenter = '<FPopover v-if="props.headerActions.uploadCenter && isFluffyOssConfigured()" v-model:open="uploadCenterOpen" :width="340"><template #trigger><button class="icon-button" type="button" :aria-label="$t(\'shell.uploadCenter\')"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 16V4M6 9l6-6 6 6" /><path d="M4 20h16" /></svg></button></template><UploadCenterPanel /></FPopover>'

const fluffyUploadDemo = [
  "import FUpload from '@/components/ui/FUpload.vue'",
  "import FUploadProgress from '@/components/ui/FUploadProgress.vue'",
  "import { useUploadStore } from '@/stores/upload'",
  'const uploadStore = useUploadStore()'
].join('\n')

const fluffyUploadDemoPanels = [
  '<FPanel><h2>{{ $t(\'components.upload\') }}</h2><FUpload :accept="[\'image/*\']" /></FPanel>',
  '<FPanel><h2>{{ $t(\'components.uploadProgress\') }}</h2><ul v-if="uploadStore.tasks.length" class="upload-demo-list"><li v-for="task in uploadStore.tasks" :key="task.id"><FUploadProgress :task="task" /></li></ul><div v-else class="upload-demo-empty">{{ $t(\'upload.center.empty\') }}</div></FPanel>'
].join('')

export function templateVariables(options: Omit<ProjectOptions, 'directory' | 'dryRun'>): Record<string, string> {
  return {
    PROJECT_NAME: options.name,
    PACKAGE_MANAGER: options.packageManager,
    THEME_COLOR: options.themeColor,
    DEFAULT_LOCALE: options.language,
    DEFAULT_DARK_MODE: String(options.darkMode),
    FLUFFY_OSS_DEPENDENCIES: options.fluffyOss ? ',\n    "fluffy-oss-sdk": "^0.1.1"' : '',
    FLUFFY_LOG_DEPENDENCIES: options.fluffyLog ? ',\n    "fluffy-log-trace-browser-sdk": "^0.3.1"' : '',
    FLUFFY_LOG_IMPORT: options.fluffyLog ? "import { initFluffyLog } from './integrations/fluffy-log'" : '',
    FLUFFY_LOG_INIT: options.fluffyLog ? 'initFluffyLog()' : '',
    FLUFFY_UPLOAD_IMPORT: options.fluffyOss ? fluffyUploadImport : '',
    FLUFFY_UPLOAD_OPEN: options.fluffyOss ? fluffyUploadOpen : '',
    FLUFFY_UPLOAD_CENTER: options.fluffyOss ? fluffyUploadCenter : '',
    FLUFFY_UPLOAD_HEADER_ACTION: options.fluffyOss ? 'true' : 'false',
    FLUFFY_UPLOAD_DEMO: options.fluffyOss ? fluffyUploadDemo : '',
    FLUFFY_UPLOAD_DEMO_PANELS: options.fluffyOss ? fluffyUploadDemoPanels : '',
    FLUFFY_OSS_ENV: fluffyOssEnvBlock(options.fluffyOssUrl, options.fluffyOssProxy),
    FLUFFY_LOG_ENV: fluffyLogEnvBlock(options.fluffyLogUrl, options.fluffyLogProxy)
  }
}
