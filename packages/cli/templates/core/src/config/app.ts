export interface HeaderActions {
  search: boolean
  language: boolean
  theme: boolean
  notifications: boolean
  fullscreen: boolean
  account: boolean
  settings: boolean
  uploadCenter: boolean
}

export const appConfig = {
  name: '__PROJECT_NAME__',
  defaultLocale: '__DEFAULT_LOCALE__' as const,
  defaultDarkMode: __DEFAULT_DARK_MODE__,
  showTabBar: true,
  themeColor: '__THEME_COLOR__',
  permission: {
    tokens: [] as string[],
    tokenSeparator: '|'
  },
  showNavbar: true,
  showMenu: true,
  menuWidth: 244,
  colorWeak: false,
  documentTitle: true,
  headerActions: {
    search: true,
    language: true,
    theme: true,
    notifications: true,
    fullscreen: true,
    account: true,
    settings: true,
    uploadCenter: __FLUFFY_UPLOAD_HEADER_ACTION__
  } satisfies HeaderActions
}

