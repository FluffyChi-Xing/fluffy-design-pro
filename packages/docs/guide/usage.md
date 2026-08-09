---
title: 命令与迁移
description: 创建项目、接管现有 Vue 3 + Vite 工程，以及安全迁移受管文件。
---

# 命令与迁移

CLI 提供 `create`、`adopt` 与 `migrate` 三类命令。默认命令是 `create`。

## 创建项目

```bash
npx create-fluffy-design-pro@latest my-admin
```

也可以显式写出 `create`：

```bash
npx create-fluffy-design-pro@latest create my-admin
```

创建流程生成一个新的工程目录与 `.fluffy/manifest.json` 文件清单。CLI 默认不覆盖非空目标目录。

## 接管现有项目

`adopt` 面向已有的 **Vue 3 + Vite** 项目。它会检测技术栈、锁文件、Git 状态、manifest 与受管文件冲突。

```bash
# 只读预览，不写文件
npx create-fluffy-design-pro@latest adopt ./existing-app --dry-run

# 确认后只写入受管文件清单
npx create-fluffy-design-pro@latest adopt ./existing-app --yes
```

确认接管后，CLI 仅写入 `.fluffy/manifest.json`，不会修改业务代码、依赖或现有配置。Vue CLI、Nuxt 与非 Vue 项目不在当前支持范围内。

## 迁移受管文件

迁移默认只展示计划，不写入文件：

```bash
npx create-fluffy-design-pro@latest migrate ./existing-app
```

审阅后使用 `--apply --yes` 执行：

```bash
npx create-fluffy-design-pro@latest migrate ./existing-app --apply --yes
```

只有同时满足以下条件的文件才会被更新：

1. 文件被 manifest 标记为 `generator-owned`；
2. 当前文件内容仍与 manifest 记录的基线 hash 一致；
3. 迁移模板源可用，且没有冲突。

受管文件已被手动修改、缺失，或模板源冲突时，迁移会失败而不是静默覆盖。目标是 Git 仓库时，迁移要求工作区干净。

## 回滚迁移

成功迁移会输出事务 ID。只要迁移后的受管文件没有再次被修改，即可回滚：

```bash
npx create-fluffy-design-pro@latest migrate rollback <transaction-id> ./existing-app --yes
```

::: warning 迁移边界
迁移不会修改未知业务文件，也不自动变更依赖或根配置。它是受 manifest 边界约束的受控更新，不是无差别的项目重生成。
:::

## 继续阅读

- [部署选项](/guide/deployment)
- [可选 Fluffy 集成](/guide/integrations)
- [CLI 选项参考](/reference/cli-options)
