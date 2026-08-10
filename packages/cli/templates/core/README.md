# __PROJECT_NAME__

Generated with Fluffy Design Pro: a Vue admin shell built on shadcn-vue primitives and Fluffy admin extensions.

## Commands

```bash
__PACKAGE_MANAGER__ install
__PACKAGE_MANAGER__ dev
__PACKAGE_MANAGER__ check
__PACKAGE_MANAGER__ build
```

## UI conventions

Use the generated shadcn-vue primitives from `@/components/ui/*` for normal controls, then add components with the shadcn-vue CLI when needed. Keep `components.json`, the `@/*` aliases, and `src/lib/utils.ts` in place.

Use Fluffy extensions for admin-specific behavior: `FIcon`, `FChart`, `FTree`, `FTypography`, the default layout, navigation, uploads, and notifications. The core shell includes router, Pinia, i18n, light/dark tokens, ECharts, and a Vercel SPA configuration when selected during generation.
