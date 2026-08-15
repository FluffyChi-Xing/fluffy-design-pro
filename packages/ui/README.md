# @fluffy-design-pro/ui

Curated Vue 3 UI primitives for applications that do not use the Fluffy Design Pro CLI template.

```bash
pnpm add @fluffy-design-pro/ui
```

Import the static package stylesheet once. It contains the compiled Tailwind utilities and Fluffy semantic tokens, so the consuming application does not install Tailwind, shadcn-vue, or configure `components.json`.

```ts
import '@fluffy-design-pro/ui/style.css'
```

Import components from their explicit subpaths for tree shaking:

```vue
<script setup lang="ts">
import { Button } from '@fluffy-design-pro/ui/button'
import { FEmpty } from '@fluffy-design-pro/ui/empty'
</script>

<template>
  <FEmpty title="No projects">
    <Button>Create project</Button>
  </FEmpty>
</template>
```

The first public surface is `Button`, `Input`, `Textarea`, `Checkbox`, `Card`, `Skeleton`, `FEmpty`, `FIcon`, icon registration helpers, and `cn`. Vue `^3.5.0` is a peer dependency. Override the package theme with `--fluffy-brand`:

```css
:root { --fluffy-brand: #6366f1; }
```

Fluffy Design Pro generated applications deliberately keep using their editable local `@/components/*` and `@/lib/*` source files. They do not need this package.
