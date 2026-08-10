---
title: 权限指令
description: 使用内置 v-permission 控制前端界面元素的可见性。
---

# 权限指令

core 模板内置 `v-permission`。它根据响应式 token 集合隐藏无权限元素，适合菜单外的按钮、字段和局部操作。

::: warning 不是服务端授权
`v-permission` 只影响浏览器中的 UI。任何 API、下载、写入或敏感数据访问仍必须在服务端完成真实权限校验。
:::

## 基本用法

默认规则为“任一匹配”：当前用户只要拥有绑定列表中的一个 token，就可以看到元素。

```vue
<Button v-permission="['cms.article.read', 'cms.article.write']">
  编辑文章
</Button>
```

也可以传字符串。默认分隔符为 `|`，来自 `appConfig.permission.tokenSeparator`；它避免与常见的点分权限 token 冲突：

```ts
// src/config/app.ts
permission: {
  tokens: ['cms.article.read'],
  tokenSeparator: '|',
}
```

```vue
<Button v-permission="'cms.article.read|cms.article.write'">编辑文章</Button>
```

token 中不得包含当前分隔符。复杂 token 优先使用数组；或者把分隔符改为不会出现在 token 内的字符：

```ts
permission: { tokens: [], tokenSeparator: '|' }
```

```vue
<Button v-permission="'cms:article:read|cms:article:write'">编辑文章</Button>
```

## 更新 token

权限上下文通过 plugin 安装。登录或刷新用户资料后，在组件或业务适配层调用 `usePermission().setTokens(tokens)`；指令会立即重新评估并恢复或隐藏元素。

内置实现会恢复元素最初的 `hidden`、`aria-hidden` 和 `inert` 属性，不会覆盖业务本来设定的状态。
