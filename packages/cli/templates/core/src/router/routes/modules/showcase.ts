import ComponentsPage from '@/pages/showcase/ComponentsPage.vue'
import ChartsPage from '@/pages/showcase/ChartsPage.vue'
import IconsPage from '@/pages/showcase/IconsPage.vue'
import TablePage from '@/pages/showcase/TablePage.vue'
import type { RouteModule } from '@/router/types'

export default {
  routes: [
    { name: 'showcase-components', path: 'showcase/components', component: ComponentsPage, meta: { titleKey: 'navigation.components', icon: 'components', groupKey: 'navigation.showcase', order: 10 } },
    { name: 'showcase-charts', path: 'showcase/charts', component: ChartsPage, meta: { titleKey: 'navigation.charts', icon: 'chart', groupKey: 'navigation.showcase', order: 20 } },
    { name: 'showcase-icons', path: 'showcase/icons', component: IconsPage, meta: { titleKey: 'navigation.icons', icon: 'icons', groupKey: 'navigation.showcase', order: 30 } },
    { name: 'showcase-table', path: 'showcase/table', component: TablePage, meta: { titleKey: 'navigation.table', icon: 'table', groupKey: 'navigation.showcase', order: 40 } }
  ]
} satisfies RouteModule
