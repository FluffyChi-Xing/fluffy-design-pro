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

Use the generated shadcn-vue primitives from `@/components/ui/*` for normal controls, then add components with the shadcn-vue CLI when needed. Keep `components.json`, the `@/*` aliases, and `src/lib/utils.ts` in place. Tailwind, shadcn-vue, and Axios versions are declared by this generated project, so consumers do not install or configure them separately to use the scaffold. These sources stay local and editable; generated projects intentionally do not depend on `@fluffy-design-pro/ui`.

Use Fluffy extensions for admin-specific behavior: `FIcon`, `FEmpty`, `FChart`, `FTree`, `FTypography`, the default layout, navigation, uploads, and notifications. The core shell includes router, Pinia, i18n, light/dark tokens, ECharts, and a Vercel SPA configuration when selected during generation.

## API foundation

Import the configured request instance from `@/api/base`. It uses the `/fluffy-maas` prefix, a 15-second timeout, optional Bearer token injection, and unwraps `{ code, message?, data }` envelopes when `code === 200`. Define endpoint modules only after the backend routes and request/response contracts are known.
