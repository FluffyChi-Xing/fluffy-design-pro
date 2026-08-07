# create-fluffy-design-pro

Scaffold a [Vue 3](https://vuejs.org/) admin console application with an app shell, router, i18n, theming, forms, tables, charts, and feedback components — ready to run instead of a blank Vue page.

```bash
npx create-fluffy-design-pro@latest my-admin
```

## Features

- **Application shell**: navbar, sidebar navigation, tab bar, and command palette wired to a modular route registry.
- **Reusable `f-` component base**: button, input, select, checkbox, textarea, form item, panel, spinner, skeleton, result, toast host, code block, and markdown preview — no full UI framework required.
- **Composables**: `useForm`, `useTable`, `useChart`, `useLoading`, and `useToast` for data and feedback logic.
- **Built-in pages**: home, projects, deployments, settings, login, 404, plus showcase pages for charts, forms, tables, icons, results, tokens, and feedback.
- **i18n**: `zh-CN` and `en-US` locales included.
- **Theming**: CSS semantic tokens with light/dark theme support and `prefers-reduced-motion`.
- **Testable**: Vitest + Vue Test Utils + happy-dom are preconfigured with tests for components and composables.
- **Deployment**: generates a `vercel.json` by default; `none` skips deployment configuration.

## Usage

```bash
create-fluffy-design-pro [directory] [options]
```

| Option | Default | Description |
| --- | --- | --- |
| `--package-manager <manager>` | `pnpm` | Package manager: `pnpm`, `npm`, or `yarn`. |
| `--provider <provider>` | `vercel` | Deployment provider: `vercel` or `none`. |
| `--theme-color <color>` | `#4f46e5` | Primary theme color as a six-digit hex value. |
| `--language <locale>` | `zh-CN` | Default locale: `zh-CN` or `en-US`. |
| `--no-dark-mode` | – | Disable the generated dark theme. |
| `--dry-run` | – | Show planned files without writing anything. |

```bash
# Interactive prompts
npx create-fluffy-design-pro@latest my-admin

# All options
npx create-fluffy-design-pro@latest my-admin \
  --package-manager npm \
  --provider vercel \
  --theme-color #6366f1 \
  --language en-US

# Inspect generated files before writing
npx create-fluffy-design-pro@latest my-admin --dry-run
```

The command refuses to overwrite a non-empty target directory. Generation records a `.fluffy/manifest.json` in the new project listing the generated files.

## What gets generated

```text
my-admin/
├── src/
│   ├── components/          # f- UI components, form, layout, navigation
│   ├── composables/         # useForm, useTable, useChart, useLoading, useToast
│   ├── layouts/             # DefaultLayout
│   ├── locales/             # zh-CN / en-US
│   ├── pages/               # app pages and showcase pages
│   ├── router/              # modular route registry
│   ├── stores/              # Pinia stores (theme, tabs)
│   ├── styles/              # CSS semantic tokens
│   └── test/                # Vitest setup
├── .fluffy/manifest.json    # generated file list
├── vercel.json              # when provider is vercel
└── package.json
```

## Documentation

- [Repository](https://github.com/FluffyChi-Xing/fluffy-design-pro)
- `docs/overview/design.md` — product design overview
- `CHANGELOG.md` — version history

## License

[MIT](https://github.com/FluffyChi-Xing/fluffy-design-pro/blob/master/LICENSE)
