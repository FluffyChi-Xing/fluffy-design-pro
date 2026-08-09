# Fluffy Design Pro 文档站

本目录是基于 VitePress 的产品介绍与使用文档站。

## 本地开发

```bash
pnpm --filter @fluffy-design-pro/docs dev
pnpm --filter @fluffy-design-pro/docs build
pnpm --filter @fluffy-design-pro/docs preview
```

## 文档维护约定

- CLI 行为先核对 `packages/cli/src/` 与 `packages/cli/README.md`，再更新页面。
- 当前实现优先于早期 `docs/overview/design.md` 中的目标设计。
- 模板插件在正式发布前必须保持“规划中 / 尚未实现”表述。
- 正式部署前设置 `SITE_URL`，用于 canonical、sitemap、Open Graph 与 JSON-LD 的绝对地址。
- 部署文档必须区分“生成 provider 配置”和“执行部署”。
