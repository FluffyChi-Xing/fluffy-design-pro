import {
  Bell,
  ChartNoAxesCombined,
  CheckCircle2,
  CircleHelp,
  ExternalLink,
  FileText,
  FolderOpen,
  LayoutDashboard,
  Layers,
  Menu,
  Package,
  PanelTop,
  Search,
  Settings,
  Table2,
  Trash2,
  type LucideIcon,
} from 'lucide-vue-next'

export const iconAliases = {
  dashboard: 'LayoutDashboard',
  project: 'Layers',
  deployment: 'Package',
  setting: 'Settings',
  components: 'PanelTop',
  chart: 'ChartNoAxesCombined',
  icons: 'CircleHelp',
  table: 'Table2',
  form: 'FileText',
  feedback: 'Bell',
  result: 'CheckCircle2',
  tokens: 'Layers',
  external: 'ExternalLink',
} as const

export type FluffyIconAlias = keyof typeof iconAliases

const lucideIcons = {
  Bell,
  ChartNoAxesCombined,
  CheckCircle2,
  CircleHelp,
  ExternalLink,
  FileText,
  FolderOpen,
  LayoutDashboard,
  Layers,
  Menu,
  Package,
  PanelTop,
  Search,
  Settings,
  Table2,
  Trash2,
} satisfies Record<string, LucideIcon>

function toPascalCase(name: string) {
  return name.replace(/(^|[-_\s])([a-z\d])/g, (_, __, character: string) => character.toUpperCase())
}

export function resolveIcon(name: string): LucideIcon | undefined {
  const resolvedName = name in iconAliases ? iconAliases[name as FluffyIconAlias] : toPascalCase(name)
  return lucideIcons[resolvedName as keyof typeof lucideIcons]
}
