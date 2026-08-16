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
import { FVerity } from '@fluffy-design-pro/ui/verity'
</script>

<template>
  <FEmpty title="No projects">
    <Button>Create project</Button>
  </FEmpty>
</template>
```

The public surface includes `Button`, `Input`, `Textarea`, `Checkbox`, `Card`, `Skeleton`, `FEmpty`, `FIcon`, `FVerity`, `FCrop`, `FMasonry`, `FWatermark`, `FQrcode`, icon registration helpers, and `cn`. Vue `^3.5.0` is a peer dependency. Override the package theme with `--fluffy-brand`:

```css
:root { --fluffy-brand: #6366f1; }
```

## Verification slider

`FVerity` emits a completion attempt to its async `verify` callback. The callback must validate a server-issued, expiring challenge before allowing login or registration; a client-only slider is not a security boundary.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { FVerity, type VerityAttempt } from '@fluffy-design-pro/ui/verity'

const verified = ref(false)
async function verifyChallenge(attempt: VerityAttempt) {
  return fetch('/api/verify-challenge', {
    method: 'POST',
    body: JSON.stringify(attempt),
  }).then(response => response.ok)
}
</script>

<template>
  <FVerity v-model="verified" :verify="verifyChallenge" />
</template>
```

## Extensions

```ts
import { FCrop } from '@fluffy-design-pro/ui/crop'
import { FMasonry } from '@fluffy-design-pro/ui/masonry'
import { FWatermark } from '@fluffy-design-pro/ui/watermark'
import { FQrcode } from '@fluffy-design-pro/ui/qrcode'
```

### FCrop

`FCrop` is a controlled image cropper. Its `v-model` rectangle is measured in source-image pixels. Use the exposed `getCanvas()` or `toBlob()` methods to export the selected pixels; choose `output-width` and `output-height` when the export dimensions differ from the selection.

```vue
<script setup lang="ts">
import { ref, useTemplateRef } from 'vue'
import { FCrop } from '@fluffy-design-pro/ui/crop'

const crop = ref({ x: 40, y: 24, width: 240, height: 160 })
const cropper = useTemplateRef('cropper')
</script>

<template>
  <FCrop
    ref="cropper"
    v-model="crop"
    src="/photo.jpg"
    :aspect-ratio="3 / 2"
    alt="Product photo"
  />
</template>
```

Cross-origin images need suitable CORS headers for canvas export. Keyboard users can move the selection with arrow keys, use Shift for 10-pixel steps, and use Alt with arrows to resize it.

### FMasonry

`FMasonry` arranges direct slot children with CSS columns. `columns` accepts a fixed count or a breakpoint map, and `gap` accepts a CSS length or pixel number.

```vue
<FMasonry :columns="{ 0: 1, 640: 2, 960: 3 }" :gap="16">
  <article v-for="card in cards" :key="card.id">{{ card.title }}</article>
</FMasonry>
```

Visual ordering runs top-to-bottom within each column while DOM, keyboard, and screen-reader order remain the original source order.

### FWatermark

`FWatermark` overlays repeated text or an image on arbitrary slot content. It builds tiles with a `DocumentFragment`, and the overlay is non-interactive so it does not block the wrapped content.

```vue
<FWatermark content="Internal" :rotate="-22" :opacity="0.12">
  <section>Confidential report</section>
</FWatermark>

<FWatermark image="/brand-mark.svg" :width="120" :height="80">
  <section>Licensed asset</section>
</FWatermark>
```

A watermark is a client-side visual deterrent, not copy, download, or screenshot protection. Do not use it as a security boundary.

### FQrcode

`FQrcode` draws the supplied text on a canvas. Configure `size`, `margin`, `error-correction-level`, `foreground`, and `background`, then call exposed `toDataURL()` or `toBlob()` when an export is needed.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { FQrcode } from '@fluffy-design-pro/ui/qrcode'

const invitationUrl = ref('https://example.com/invite/abc123')
</script>

<template>
  <FQrcode
    :value="invitationUrl"
    :size="192"
    error-correction-level="Q"
    aria-label="Invitation QR code"
  />
</template>
```

`FQrcode` encodes the supplied payload exactly. Validate user-provided URLs and avoid placing secrets in codes that users can scan, save, or export.

Fluffy Design Pro generated applications deliberately keep using their editable local `@/components/*` and `@/lib/*` source files. They do not need this package.
