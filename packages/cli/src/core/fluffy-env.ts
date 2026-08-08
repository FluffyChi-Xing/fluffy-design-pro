function envLine(key: string, value: string): string {
  return value ? `${key}=${value}` : `# ${key}=`
}

export function fluffyOssEnvBlock(url: string, proxy: string): string {
  return [
    '# M6 · Fluffy OSS（可选）',
    envLine('VITE_FLUFFY_OSS_BASE_URL', url),
    envLine('VITE_FLUFFY_OSS_APP_ID', ''),
    envLine('VITE_FLUFFY_OSS_SECRET', ''),
    envLine('VITE_FLUFFY_OSS_PROXY_TARGET', proxy)
  ].join('\n')
}

export function fluffyLogEnvBlock(url: string, proxy: string): string {
  return [
    '# M6 · Fluffy Log Trace（可选）',
    envLine('VITE_FLUFFY_LOG_APP_ID', ''),
    envLine('VITE_FLUFFY_LOG_BASE_URL', url),
    envLine('VITE_FLUFFY_LOG_CREDENTIAL', ''),
    envLine('VITE_FLUFFY_LOG_PROXY_TARGET', proxy)
  ].join('\n')
}
