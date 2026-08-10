---
title: CLI 选项
description: create-fluffy-design-pro 的命令、参数与默认值参考。
---

# CLI 选项

## 基本语法

```bash
create-fluffy-design-pro [command] [directory] [options]
```

`create` 是默认命令，也可以显式写出：

```bash
create-fluffy-design-pro create my-admin
```

## 创建选项

| 选项 | 默认值 | 说明 |
| --- | --- | --- |
| `--package-manager <manager>` | `pnpm` | 包管理器：`pnpm`、`npm` 或 `yarn`。 |
| `--provider <provider>` | `vercel` | 部署配置：`vercel`、`cloudflare` 或 `none`。 |
| `--cloudflare-target <target>` | `pages` | Cloudflare 目标：`pages` 或 `workers`。需配合 `--provider cloudflare`。 |
| `--theme-color <color>` | `#4f46e5` | 六位十六进制主题色。 |
| `--language <locale>` | `zh-CN` | 默认语言：`zh-CN` 或 `en-US`。 |
| `--no-dark-mode` | — | 关闭生成项目的暗色主题。 |
| `--fluffy-oss` | — | 集成 Fluffy OSS SDK 与上传任务中心。 |
| `--fluffy-log` | — | 集成 Fluffy Log Trace Browser SDK。 |
| `--fluffy-oss-url <url>` | — | Fluffy OSS API 基础地址，并隐含启用 `--fluffy-oss`。 |
| `--fluffy-log-url <url>` | — | Fluffy Log Trace API 基础地址，并隐含启用 `--fluffy-log`。 |
| `--fluffy-oss-proxy <target>` | — | OSS 开发代理目标，并隐含启用 `--fluffy-oss`。 |
| `--fluffy-log-proxy <target>` | — | Log Trace 开发代理目标，并隐含启用 `--fluffy-log`。 |
| `--dry-run` | — | 只展示将生成的文件，不写入磁盘。 |

## 接管与迁移选项

| 命令 | 选项 | 说明 |
| --- | --- | --- |
| `adopt [directory]` | `--dry-run` | 检测现有项目，不写入文件。 |
| `adopt [directory]` | `--yes` | 确认后写入 `.fluffy/manifest.json`。 |
| `migrate [directory]` | `--dry-run` | 默认行为，预览迁移计划。 |
| `migrate [directory]` | `--apply --yes` | 确认并应用可迁移的受管文件。 |
| `migrate rollback <transaction-id> [directory]` | `--yes` | 回滚指定事务。 |

## 常用组合

```bash
# 自定义主题色与英文默认语言
npx @fluffy-design-pro/cli@latest my-admin \
  --theme-color '#6366f1' \
  --language en-US

# Cloudflare Workers
npx @fluffy-design-pro/cli@latest my-admin \
  --provider cloudflare \
  --cloudflare-target workers

# 只预览生成计划
npx @fluffy-design-pro/cli@latest my-admin --dry-run
```

::: warning 安全边界
CLI 默认拒绝覆盖非空目录；`adopt` 不修改业务文件；`migrate` 只处理 manifest 中仍与基线一致的 `generator-owned` 文件。
:::
