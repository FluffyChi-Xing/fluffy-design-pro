---
title: 路由：自动重建
description: 了解生成项目的模块化路由注册表，以及如何通过路由模块自动重建路由表、侧边栏导航与命令面板。
---

# 路由：自动重建

生成项目把路由组织成模块化注册表：`src/router/routes/modules/` 下的每个 `.ts` 文件是一个路由模块，由 `src/router/registry.ts` 通过 `import.meta.glob('./routes/modules/*.ts')` 自动加载。

**新增或删除路由模块文件即可自动重建路由表、侧边栏导航与命令面板，无需改动 `router/index.ts`。**

## 注册方式

`RouteModule` 支持两类导出：`routes`（页面路由）与 `externalRoutes`（外链）。

```ts
// src/router/routes/modules/blog.ts
import BlogPage from '@/pages/BlogPage.vue'
import type { RouteModule } from '@/router/types'

export default {
  routes: [
    { name: 'blog-list', path: 'blog', component: BlogPage, meta: { titleKey: 'navigation.blog', icon: 'table', groupKey: 'navigation.manage', order: 10 } }
  ]
} satisfies RouteModule
```

- `name` — 路由名，供 `router.push({ name })` 与菜单跳转使用，需全局唯一；
- `path` — 相对路径，挂载在 `/` 的 `DefaultLayout` 子路由下；
- `component` — 页面组件；
- `meta` — 决定菜单、标签页与标题行为，见下。

## 新增页面三步

1. 在 `src/pages/` 新建页面组件；
2. 在 `src/router/routes/modules/` 新增（或扩展）路由模块；
3. 在 `src/locales/` 补充 `navigation.*` 文案。

## meta 字段

| 字段 | 说明 |
| --- | --- |
| `titleKey` | 菜单与浏览器标题的 i18n key；缺失时回退 `navigation.home` |
| `icon` | 菜单图标名，取值见 `src/router/types.ts` 的 `IconName`（如 `dashboard`、`table`、`external`） |
| `groupKey` | 所属导航分组，见「导航分组」 |
| `order` | 组内排序，数值小的在前 |
| `hideInMenu` | 为 `true` 时不显示在侧边栏（如登录、404、iframe 宿主） |
| `activeMenu` | 指定保持高亮的菜单项名，用于 iframe 外部页等场景 |
| `noAffix` | 为 `true` 时不固定为常驻标签页，可被关闭 |

路由进入时会用 `titleKey` 更新浏览器标题（`src/main.ts` 中的 `router.afterEach`）。

## 导航分组

侧边栏按 `meta.groupKey` 分组，分组展示顺序由 `registry.ts` 中的 `groupOrder` 定义：

```ts
const groupOrder = ['navigation.workspace', 'navigation.showcase', 'navigation.manage', 'navigation.resources']
```

组内按 `meta.order` 升序排列，`hideInMenu` 的路由不出现在菜单。分组标题同样是 i18n key（`navigation.workspace` 等）。侧边栏与命令面板共用同一份 `navigationGroups`，因此新增路由会自动出现在两处。

## 外链

不需要页面组件的外部入口通过 `externalRoutes` 声明，两种打开方式：

```ts
// src/router/routes/modules/external.ts
export default {
  externalRoutes: [
    { key: 'vue-docs', titleKey: 'navigation.vueDocs', icon: 'external', groupKey: 'navigation.resources', order: 10, url: 'https://vuejs.org/guide/introduction.html', openMode: 'new-tab' },
    { key: 'example-frame', titleKey: 'navigation.exampleFrame', icon: 'external', groupKey: 'navigation.resources', order: 20, url: 'https://example.com', openMode: 'iframe' }
  ]
} satisfies RouteModule
```

- `openMode: 'new-tab'` — 新标签打开 `url`；
- `openMode: 'iframe'` — 跳转到内置 `external-frame` 路由（`/external/:key`），在 iframe 内嵌页面；配合 `activeMenu` 让侧边栏保持高亮。

## 固定路由

除注册表自动加载的路由外，`src/router/index.ts` 还定义了少量固定路由：

| 路径 | 说明 |
| --- | --- |
| `/` | `DefaultLayout`，承载全部路由模块的子路由 |
| `/workspace` | 重定向到 `projects` |
| `/external/:key` | 外部 iframe 宿主页 |
| `/login` | 登录页（`hideInMenu`、`noAffix`） |
| `/:pathMatch(.*)*` | 404 页 |

## 与组件配合

- 菜单图标：`meta.icon` 使用 `IconName` 内置别名，由 `FIcon` 解析为对应 Lucide 图标；内置集之外的图标可通过 `registerIcons` 显式注册（见[组件预览](/guide/components)）。
- 标签页行为：`noAffix`、`activeMenu` 等 meta 由 `DefaultLayout` 消费，决定标签页是否可关闭与菜单高亮位置。
