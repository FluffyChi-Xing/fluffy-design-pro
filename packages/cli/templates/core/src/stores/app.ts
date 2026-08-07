import { computed, shallowRef } from 'vue'
import { defineStore } from 'pinia'
import { appConfig } from '@/config/app'

export const useAppStore = defineStore('app', () => {
  const isSidebarCollapsed = shallowRef(false)
  const isDark = shallowRef(appConfig.defaultDarkMode)
  const locale = shallowRef<'zh-CN' | 'en-US'>(appConfig.defaultLocale)
  const isTabBarVisible = shallowRef(appConfig.showTabBar)

  const documentTheme = computed(() => isDark.value ? 'dark' : 'light')

  function toggleSidebar() {
    isSidebarCollapsed.value = !isSidebarCollapsed.value
  }

  function toggleTheme() {
    isDark.value = !isDark.value
  }

  function toggleLocale() {
    locale.value = locale.value === 'zh-CN' ? 'en-US' : 'zh-CN'
  }

  function toggleTabBar() {
    isTabBarVisible.value = !isTabBarVisible.value
  }

  return { isSidebarCollapsed, isDark, locale, isTabBarVisible, documentTheme, toggleSidebar, toggleTheme, toggleLocale, toggleTabBar }
})
