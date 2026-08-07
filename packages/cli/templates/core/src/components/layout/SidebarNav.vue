<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { NavigationGroup, NavigationItem } from '@/router/types'

interface Props { groups: NavigationGroup[] }
interface Emits { navigate: []; openExternal: [item: NavigationItem] }

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const route = useRoute()
const router = useRouter()
const activeKey = computed(() => String(route.meta.activeMenu ?? route.name ?? ''))

function selectItem(item: NavigationItem) {
  if (item.external) {
    emit('openExternal', item)
    return
  }
  if (item.routeName) router.push({ name: item.routeName })
  emit('navigate')
}
</script>

<template>
  <nav class="sidebar-nav">
    <section v-for="group in props.groups" :key="group.key" class="nav-group">
      <p class="nav-label">{{ $t(group.titleKey) }}</p>
      <button v-for="item in group.items" :key="item.key" class="sidebar-link" :class="{ active: item.key === activeKey }" type="button" @click="selectItem(item)">
        <svg v-if="item.icon === 'dashboard'" viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/></svg>
        <svg v-else-if="item.icon === 'project'" viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 8 4.5-8 4.5-8-4.5L12 3Z"/><path d="m4 12 8 4.5 8-4.5M4 16.5 12 21l8-4.5"/></svg>
        <svg v-else-if="item.icon === 'deployment'" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
        <svg v-else-if="item.icon === 'chart'" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19V5M4 19h16M7 15l4-4 3 2 4-6"/></svg>
        <svg v-else-if="item.icon === 'table'" viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5" width="16" height="14" rx="1"/><path d="M4 10h16M9 5v14"/></svg>
        <svg v-else-if="item.icon === 'form'" viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h4"/></svg>
        <svg v-else-if="item.icon === 'feedback'" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20a8 8 0 1 0-8-8 8 8 0 0 0 8 8Z"/><path d="M9 10h.01M15 10h.01M8.5 14c2 1.5 5 1.5 7 0"/></svg>
        <svg v-else-if="item.icon === 'result'" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="m8.5 12 2.3 2.3 4.7-4.7"/></svg>
        <svg v-else-if="item.icon === 'tokens'" viewBox="0 0 24 24" aria-hidden="true"><circle cx="8" cy="8" r="3"/><circle cx="16" cy="8" r="3"/><circle cx="12" cy="16" r="3"/></svg>
        <svg v-else-if="item.icon === 'external'" viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4h6v6M20 4l-9 9"/><path d="M19 14v5H5V5h5"/></svg>
        <svg v-else viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M7 12h10M10 17h4"/></svg>
        <span>{{ $t(item.titleKey) }}</span>
      </button>
    </section>
  </nav>
</template>

<style scoped>
.sidebar-nav{display:flex;flex:1;flex-direction:column;gap:18px;padding-top:15px}.nav-group{display:grid;gap:3px}.nav-label{color:var(--subtle-foreground);display:block;font-size:10px;font-weight:700;letter-spacing:.08em;margin:0 0 7px;padding-inline:8px;text-transform:uppercase}.sidebar-link{align-items:center;background:transparent;border:0;border-radius:var(--radius-sm);color:var(--muted-foreground);cursor:pointer;display:flex;font-size:13px;gap:10px;padding:8px;text-align:start;transition:background-color 140ms ease,color 140ms ease,scale 140ms ease;width:100%}.sidebar-link:hover{background:var(--sidebar-hover);color:var(--foreground)}.sidebar-link:active{scale:.98}.sidebar-link.active{background:var(--sidebar-active);color:var(--sidebar-active-foreground);font-weight:650}.sidebar-link svg{fill:none;height:16px;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:1.65;width:16px}
</style>
