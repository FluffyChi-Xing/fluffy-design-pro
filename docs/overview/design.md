# Fluffy Design Pro 概要设计

> 状态：Draft 0.1。本文是目标产品设计，不代表当前仓库已有实现。当前仓库仅包含 Git 元数据、`.gitignore`、`.idea/` 与文档目录。

## 1. 产品定位

`create fluffy-design-pro` 是一个面向 Vue 中后台应用的项目生成与渐进式迁移 CLI：以 shadcn-vue 与 Tailwind CSS 为 UI 基础，吸收 Arco Design Pro Vue 的成熟应用壳、Navbar、国际化、主题、权限与路由组织方式，同时通过按需组件与样式生成获得更好的 tree shaking；既支持从零生成新项目，也支持在存量项目中认领能力并分阶段迁移到统一模板。通过交互式向导生成项目名称、品牌主题色、部署 provider 和可选 Fluffy 生态 SDK 配置。

### 1.1 目标用户

- 需要快速启动管理后台、运营后台和内部工具的前端开发者。
- 希望保留 Tailwind/shadcn 可组合性，而不被整套 UI 运行时绑定的团队。
- 需要统一接入 Fluffy OSS 与浏览器日志/链路追踪 SDK 的项目。

### 1.2 核心价值

1. 生成即可运行的中后台应用壳，而非只生成空白 Vue 页面。
2. 能力以模块和语义令牌组织，默认可 tree shake，避免全量注册。
3. CLI 负责选择与注入配置；模板负责运行时能力；可选生态 SDK 与部署 provider 不污染未选择的项目。
4. 以认领、变更计划、受控写入与回滚支持存量项目渐进迁移，而不是重新生成或无差别覆盖。
5. 视觉上形成“Fluffy”识别度：克制的中台密度、明确的层级、可配置但不廉价的品牌表达。

## 2. Arco Design Pro 能力基线

以下能力均可在 `D:\client\arco-design-pro-vue-main\arco-design-pro-vite` 中验证，属于迁移参考，不是 Fluffy 当前实现。

| 能力 | Arco 实现证据 | Fluffy 设计结论 |
|---|---|---|
| Vue 应用统一启动 | `src/main.ts:1-28` | 生成器提供单一启动入口，集中注册 router/store/i18n/directives；避免业务页面重复初始化 |
| 应用壳 | `src/layout/default-layout.vue:1-45` | 默认生成 navbar + sider/drawer + content + footer；桌面固定侧栏，窄屏抽屉化 |
| 路由模块化聚合 | `src/router/routes/index.ts:3-25` | 支持 `routes/modules/*.ts` 与外部模块目录；新页面通过模块文件接入，避免集中式巨型路由文件 |
| 路由权限 | `src/router/guard/permission.ts:9-55`、`src/hooks/permission.ts` | 路由 meta 声明权限，导航守卫统一判断；同时预留客户端菜单与服务端菜单模式 |
| 自动菜单树 | `src/components/menu/use-menu-tree.ts:11-63` | 从路由 meta 派生菜单，排序、隐藏节点和权限过滤由基础能力完成 |
| 登录与用户态 | `src/store/modules/user/index.ts:13-91`、`src/router/guard/userLoginInfo.ts` | 模板提供登录、token、用户信息、登出清理和角色切换示例；生产适配点集中在 API/adapter |
| 国际化 | `src/locale/index.ts:1-22`、`src/locale/zh-CN.ts`、`src/locale/en-US.ts` | 默认 zh-CN/en-US、fallbackLocale、localStorage 持久化；所有基础 UI 文案必须可翻译 |
| 暗色模式 | `src/store/modules/app/index.ts:31-39`、`src/hooks/themes.ts:4-12` | 主题状态集中管理；Fluffy 以 CSS 变量/语义 token 切换，不把颜色写死在业务组件 |
| 全局布局设置 | `src/config/settings.json:1-17`、`src/components/global-setting/index.vue:35-84` | 生成可配置 navbar/menu/footer/tab/menu width/colorWeak 等选项；CLI 预设初始值，运行时设置可选 |
| API 封装与 token 注入 | `src/api/interceptor.ts:1-77` | 统一 baseURL、Bearer token、业务错误码、过期会话与 toast/modal；Fluffy 需将错误协议做成可配置 adapter |
| Mock | `src/mock/index.ts`、`src/mock/user.ts` | 开发模板可选 mock 层，便于生成后立即预览；必须与真实 API 适配边界分离 |
| 图表与中台示例 | `echarts`、`vue-echarts` 依赖及 `src/components/chart/index.vue` | 以可选 preset 生成 dashboard/list/form/exception 等页面，不默认把图表依赖塞进最小模板 |
| 按需加载 | `config/plugin/arcoStyleImport.ts:1-12`、`config/plugin/arcoResolver.ts:1-18` | shadcn 组件按文件导入；Tailwind content 扫描；只生成所选能力的依赖和代码 |
| 构建优化 | `config/plugin/compress.ts`、`imagemin.ts`、`visualizer.ts`、`package.json:8-15` | 提供 build、preview、report；压缩、资源优化、包体分析做成 preset/脚本能力 |
| 类型与质量门禁 | `tsconfig.json:1-20`、`.eslintrc.js:4-70`、`.prettierrc.js`、`.stylelintrc.js`、`.husky/` | Fluffy 不复制这套分散配置；生成项目默认以 Vite 8 + Vite+ `vp` + Oxc（Oxlint/Oxfmt）统一承担开发、检查与格式化入口，并保留 TypeScript strict；版本需选择当前兼容组合 |

## 3. 目标范围与非目标

### 3.1 MVP 范围

- `npx create fluffy-design-pro@latest` 启动 CLI。
- 提供三个明确命令：`create <dir>` 生成新项目，`adopt [dir]` 扫描并认领存量项目，`migrate [dir]` 执行已确认的增量迁移；三者共享配置、模板 manifest、dry-run 和部署 provider 选项。
- 交互式收集：项目名称、目录、包管理器、主题色、语言、是否启用暗色、是否启用 mock、是否接入 Fluffy OSS、是否接入 Fluffy Log Trace Browser、deploy provider（默认 `vercel`）。
- 生成 Vue 3 + TypeScript + Vite + Tailwind CSS + shadcn-vue 基础工程。
- 生成应用壳：Arco 风格 Navbar、侧边栏/移动端抽屉、面包屑、页面容器、可选标签页、页脚、404、登录页。
- 生成基础能力：i18n、主题/暗色、路由模块、route meta 权限、Pinia stores、请求 adapter、错误边界/日志 adapter。
- 生成可选 preset：dashboard、list、form、result、exception；每个 preset 的页面和依赖可独立移除。
- 按 provider 生成部署配置；默认生成 Vercel 配置，也可选择 Cloudflare 或 `none`。
- 生成 README、环境变量示例、基础测试和能力清单。

当前初始化阶段暂不实现 Fluffy OSS、Fluffy Log Trace Browser 或其他 SDK 适配；先完成应用壳、路由、主题、i18n、基础状态和部署配置生成闭环。SDK 仍保留为后续可选 integration 层，不进入当前生成项目的依赖、import 或 env。

### 3.2 存量项目渐进迁移

- `adopt` 是只读分析加认领操作：检测项目技术栈、依赖、锁文件、Git 工作区、既有 `.fluffy/manifest.json` 和目标文件冲突；默认只写入 manifest 与迁移建议，不修改业务代码。
- `migrate` 只执行 manifest 中已声明的迁移步骤。每次迁移先输出计划，默认 `--dry-run`；确认后写入 staging，校验通过后原子替换。
- 只有被 manifest 标记为 `generator-owned` 的文件可以自动更新；业务文件、未知配置和人工拥有的文件只生成补丁或人工迁移建议。
- 默认冲突策略为 `fail`；`skip`、`backup` 必须显式选择，禁止 CLI 未经确认删除文件或覆盖未知内容。每次写入记录事务 ID，并在 `.fluffy/backups/<id>` 保留可回滚备份。
- 提供 `migrate rollback <id>` 恢复最近一次成功迁移；MVP 不做无边界 AST 重构、不上传项目内容、不自动发布。

> **实现状态（2026-08）**：M4 的当前实现刻意收窄为保守的最小范围，与上文的目标设计有出入，以仓库现状为准。`adopt` 与 `migrate` 只支持 **Vue 3 + Vite** 存量项目，不支持 Vue CLI、Nuxt 与非 Vue 项目。`adopt` 检测后只写入 `.fluffy/manifest.json`，不修改任何业务文件；`migrate` 默认 dry-run，只有显式 `--apply` 才写入，且仅更新「当前内容 hash 与 manifest 基线一致」的 `generator-owned` 文件；目标是 Git 仓库且工作区脏时拒绝执行。冲突（managed 文件被修改 / 缺失 / 模板源缺失）一律 `fail` 且不写入。`migrate rollback <id>` 仅在迁移后文件未被再次修改时恢复。provider 根配置（`vercel.json` / `wrangler.jsonc`）是运行时生成的受管文件，没有模板源，不参与模板版本迁移。更宽松的 `skip` / `backup` 冲突策略属于远期目标。

### 3.3 部署配置生成

- 定义 provider 抽象：`none`、`vercel`、`cloudflare`；provider 只生成本地配置和说明，不执行登录、上传、部署，也不写入 token、账号或 secret。
- `vercel` 为默认 provider，生成 `vercel.json`，仅描述静态 SPA 所需的构建输出、history fallback 和必要 headers；不假定具体框架，不生成秘密值。
- `cloudflare` 生成与选定 Cloudflare Pages/Workers 目标匹配的 `wrangler.jsonc`，必要时生成 `_redirects`/`_headers`。MVP 必须在实现前固定 Pages 或 Workers，不隐式生成两套冲突配置。
- provider 选择和 provider 版本写入 manifest，便于存量项目后续补齐或替换部署配置。

### 3.2 非目标

- MVP 不实现后端用户、RBAC 服务或 OSS 服务本身。
- MVP 不承诺兼容所有 UI 组件库；shadcn-vue 是默认生成方案。
- MVP 不在 CLI 中上传项目内容、不自动发布、不修改用户全局配置。
- MVP 不将 Fluffy SDK 强制绑定到所有项目；未选择时不生成 import、env 或初始化副作用。

## 4. 用户流程

### 4.1 新项目

```text
create <dir>
  -> 检查 Node 与目标目录
  -> 选择/输入项目配置（含 deploy provider，默认 vercel）
  -> 展示配置摘要并确认
  -> 复制模板与渲染变量
  -> 写入仅被选择的依赖、文件、env 示例和 provider 配置
  -> 安装依赖（可跳过）
  -> 运行生成项目的 vp check/vp build（可选但默认提示）
  -> 输出下一步命令
```

### 4.2 存量项目

```text
adopt [dir]
  -> 检查项目边界、Git 状态和技术栈
  -> 生成检测报告、能力差距和冲突清单
  -> 预览 .fluffy/manifest.json
  -> 确认后只写入认领 manifest

migrate [dir]
  -> 读取 manifest 与模板版本
  -> 生成迁移计划和文件变更摘要
  -> 默认 dry-run；确认后写入 staging
  -> 校验 hash/依赖/配置并原子替换
  -> 记录事务与备份，输出回滚命令
```

### 4.3 CLI 交互原则

- 问题按决策顺序出现：项目身份 → 技术选项 → 外部集成 → deploy provider → 安装与验证；非交互模式使用显式配置文件或命令行参数。
- 每个选项提供默认值、影响说明和可回退的摘要确认；provider 默认 `vercel`，显式选择 `none` 时不生成部署文件。
- 主题色输入支持预设与自定义值；无效值在 CLI 边界阻止生成。
- `create` 失败不覆盖既有目录；`adopt` 默认不修改业务文件；`migrate` 使用 staging 和原子替换，失败自动回滚并保留清晰错误信息。
- 任何写入前展示文件 owner、冲突策略和变更范围；未被 generator-owned 的文件不得静默覆盖。
- SDK 选项只询问对应的公开配置，不要求在 CLI 中输入 secret；secret 仅进入 `.env.local` 指引或由用户后续配置。

## 5. 目标生成项目架构

```text
src/
  app/                 启动编排、providers、错误边界
  assets/              全局样式与静态资源
  components/          可复用 UI 与应用组件（含 layout/navbar）
  config/              生成的运行时默认配置（含 layout）
  directives/          权限等指令
  hooks/               locale、theme、permission、request、responsive
  layouts/             app shell 与页面布局
  locales/             zh-CN/en-US 与模块文案
  pages/               页面实现
  router/              路由入口、守卫、modules、types
  stores/              app、user、tabs 等 Pinia store
  integrations/        oss、log-trace 等可选 adapter
  lib/                 cn、环境、token 等无副作用工具
  styles/              Tailwind 入口与 token

.fluffy/
  manifest.json        认领状态、模板版本、owner/hash、迁移与 provider 记录
  backups/<id>/        迁移事务备份，仅由 CLI 管理
```

### 5.1 依赖方向

- `app` 只负责初始化和组合 providers，不承载页面业务。
- `router` 可读取 stores 与权限策略；页面不直接修改路由注册表。
- `layouts` 消费 router/store 派生的菜单和标签状态，不直接请求后端菜单；`DefaultLayout` 只编排 Navbar、sidebar/drawer、content 与 footer。
- `components/layout/navbar` 只消费配置、路由上下文和显式注入的用户/通知状态，不直接请求业务 API 或维护菜单来源。
- `integrations` 只通过显式 adapter 暴露 SDK 能力；未启用集成时必须为空实现或完全不生成。
- `pages` 通过 API/service 访问数据，不直接操作 SDK 原始对象。
- `components` 不依赖具体业务页面，业务组件与基础 UI 分开。

## 6. 能力设计

### 6.1 路由与菜单

采用基于文件的路由模块：每个模块导出 route records，生成器只保留所选模块。route meta 至少支持 `titleKey`、`icon`、`order`、`requiresAuth`、`roles`、`hideInMenu`、`hideChildrenInMenu`。菜单从可访问路由派生，客户端静态菜单为默认模式，服务端菜单作为显式配置项。

Navbar 借鉴 Arco Design Pro 的应用壳组织方式，但不引入 Arco 运行时：

- `DefaultLayout` 负责 60px 顶栏、sidebar/drawer、content 和 footer 的区域编排；`Navbar` 是可独立测试和替换的布局组件。
- Navbar 默认提供品牌/logo、侧栏折叠入口、页面上下文或面包屑、语言切换、主题切换、通知入口和用户菜单等区域；搜索、标签页入口等按配置或 slot 注入，不强制生成业务能力。
- Navbar 只消费 route/store 派生的上下文和显式注入的状态，不直接请求后端菜单或业务 API。配置至少支持 logo/标题、显示项、固定或随内容滚动、断点和侧栏入口。
- 桌面端保持顶栏与侧栏层级清晰；窄屏将侧栏入口转为 drawer 控制，Navbar 内控件必须保留可访问名称、键盘 focus 和 Reduced Motion 行为。

### 6.2 权限

提供 `accessRouter(route, user)` 与 `v-permission` 两个稳定入口。导航权限控制页面进入，指令权限控制局部操作；二者都不能被视为后端授权替代。默认 demo 角色仅用于本地演示，生产项目需替换为真实身份与权限来源。

### 6.3 i18n

默认生成 zh-CN 与 en-US，按模块拆分 locale 文件；locale key 与 route meta 使用稳定 key，而不是把中文/英文直接散落在组件。语言切换持久化到 localStorage，并在 SSR 不适用的前提下保持浏览器安全访问边界；fallback 文案必须可见且可追踪。

### 6.4 主题与暗色

使用 Tailwind/shadcn 的语义 CSS 变量；CLI 主题色转换成 OKLCH 色阶并生成 light/dark tokens。主题色只承担品牌与 primary action 语义，状态色（success/warning/destructive/info）独立生成。需要同时检查 sRGB 可显示范围和文本对比度；不以机械反转 light palette 生成 dark palette。

建议 token 层级：

```text
brand scale -> semantic roles -> component states -> utility classes
```

生成的 token 至少包括 background、foreground、card、muted、border、input、ring、primary、primary-foreground、secondary、accent、destructive，以及 sidebar/nav 专用角色。

### 6.5 请求与错误

定义与后端协议无关的 `HttpClient`/`ApiError` adapter：统一 base URL、headers、token 注入、超时、取消、业务错误映射和 session-expired 事件。UI 层只消费结构化状态，不直接依赖 axios/fetch 响应细节。生产默认不把 token、secret、完整请求体或用户隐私写入日志。

### 6.6 可选 Fluffy 生态集成

每个集成具备四部分：依赖声明、环境变量样例、初始化模块、对业务可消费的最小 adapter。

- Fluffy OSS：只在选中后生成客户端初始化与上传/URL 能力；secret 不进入源码。
- Fluffy Log Trace Browser：只在选中后生成初始化、错误上报和 trace context 注入；提供开发环境开关和敏感字段过滤策略。
- 两者均不得在未选择时出现在依赖图、bundle 或运行时代码中。

具体包名、版本、初始化 API 和服务端协议待确认，见第 11 节。

## 7. Vite 8、Vite+ 与 Oxc 工具链

### 7.1 选型结论

生成项目以 Vite 8 作为构建基础，以 Vite+ 的 `vp` 作为统一命令入口，以 Oxc 生态的 Oxlint 与 Oxfmt 作为默认 lint/format 实现。官方资料明确说明 `vp fmt` 基于 Oxfmt，`vp check` 可统一执行格式化、lint 与类型检查；Vite+同时整合 Vite、Vitest、Oxlint、Oxfmt、Rolldown、tsdown 与 Vite Task。

这是一项目标架构决策，不代表当前仓库已经安装这些依赖。Vite+ 的具体版本、Vue SFC 支持、配置字段和发布稳定性必须在实现阶段以锁定版本的官方文档与实际生成项目验证为准。

### 7.2 统一命令面

生成项目只暴露统一的 `vp` 入口，不再默认生成 `.eslintrc.*`、`prettier.config.*`、`.stylelintrc.*` 等分散配置文件：

```text
vp dev                 开发服务器
vp build               生产构建
vp test                测试
vp lint                lint
vp fmt                 格式化
vp fmt --check         检查格式
vp check               格式化、lint、类型检查的统一质量门禁
vp task <name>         组合或缓存任务（以选定 Vite+ 版本能力为准）
```

`package.json` 仅保留面向团队的语义脚本（如 `dev`、`build`、`check`），脚本内部调用 `vp`；用户不需要记忆底层 Oxlint/Oxfmt 命令。CLI 生成的 README 必须同时给出直接 `vp` 命令与 npm/pnpm 兼容入口的说明。

### 7.3 配置边界

- 统一配置集中在 `vite.config.ts` 或 Vite+ 支持的统一配置入口，配置只描述项目规则，不复制工具专属配置文件。
- `vp check` 是提交前和 CI 的默认质量门禁；`vp fmt --check` 只负责格式一致性，避免 CI 隐式改文件。
- Git hooks 不再引入 Husky 作为默认依赖。若 Vite+ 提供稳定的 hook/task 集成，则由 `vp` 执行提交前检查；若没有，则使用尽可能薄的原生 Git hook 调用 `vp check`，而不是恢复 ESLint/Prettier/Husky 全套分散配置。
- Vue SFC、TypeScript、Tailwind class 排序和 shadcn-vue 生成代码必须建立兼容性测试；Oxc 不能自动等价替代所有 Vue/Stylelint 专项规则。
- 需要第三方插件或规则时，优先通过统一配置的插件/规则扩展接入；只有官方能力不足且有明确收益时，才引入单独工具，并记录理由。

### 7.4 Tree shaking 与构建策略

- shadcn-vue 组件采用源码级复制/按需导入，不做全局组件注册。
- Tailwind 扫描生成源码和组件目录，避免动态拼接无法被扫描的 class；动态主题通过 CSS 变量而不是生成无限 class。
- 图表、mock、SDK、示例页面均以 feature preset 或 conditional template 注入。
- Vite 8 使用标准 ESM 开发与生产构建；Rolldown/Vite 8 的生产优化以实际版本默认行为为准，不手工添加重复拆包配置。
- 生产环境提供压缩与可选 bundle report；若 Vite+提供统一 task，则作为 `vp task` 暴露。
- CLI 生成后清理未选择 feature 的依赖和 import，并用 `vp check`、`vp build` 作为验收门禁。

## 8. UI/UX 设计系统

### 8.1 视觉方向

主题不是“换一枚主色”，而是把“生成器的配置感”转译成产品界面：以安静的中性表面承载数据，以一条可识别的品牌色轨迹贯穿 active nav、focus ring 和主要 CTA。唯一的视觉冒险是让侧栏选中态使用窄幅品牌色轨迹与轻微光晕，而不是大面积彩色填充；这样保留中台效率，又让生成项目具有可识别的 Fluffy 签名。

### 8.2 布局

- Desktop：60px Navbar、可折叠 sidebar、内容区最小高度撑满视口；具体宽度由 token 配置，默认建议 240px。
- Navbar 默认使用中性表面与轻边界，active/focus 状态复用品牌色轨迹；不使用大面积彩色填充，也不复制 Arco 的全量组件主题。
- Narrow viewport：sidebar 转为 drawer，核心操作保持可达；页面内容不依赖固定文字宽度，Navbar 的可选操作按优先级收纳。
- Navbar 的品牌区、上下文区、操作区保持稳定的阅读顺序；slot 或配置隐藏区域时不得留下不可达的空白或仅图标操作。
- 页面结构优先级：页面标题/上下文 → 主要操作 → 关键摘要 → 内容区 → 次要信息。
- 组内间距小于组间间距，优先使用留白而非分割线；使用 logical properties 支持 RTL。
- 表格、表单、dashboard 必须定义 loading、empty、error、success、disabled、focus 状态。

### 8.3 交互

- Navbar 的侧栏折叠、语言、主题、通知和用户菜单是独立操作；每项状态改变都提供可见反馈，不将 hover 作为唯一入口。
- 状态改变使用可打断的短 transition，不使用 `transition: all`。
- button press 使用轻微 `scale(0.96)`，不把动画作为唯一反馈；尊重 `prefers-reduced-motion`。
- 图标使用单一图标集、`currentColor` 和一致 stroke weight；icon-only 控件必须有可访问名称。
- 嵌套圆角满足外层半径 = 内层半径 + 内边距；阴影表达层级，边框表达结构或状态。
- 文案使用 sentence case/自然中文、主动语态；空态直接告诉用户下一步，错误说明发生了什么及如何恢复。

## 9. 模板分层与版本策略

建议模板分为：

- `core`：最小可运行工程、应用壳、Navbar、Tailwind/shadcn、router、i18n、theme、store。
- `auth`：登录页、token adapter、用户 store、权限 guard。
- `presets`：dashboard/list/form/result/exception。
- `integrations`：oss、log-trace。
- `deploy`：`vercel`、`cloudflare` provider 配置；`none` 不生成部署文件。
- `quality`：`vp` 统一 lint/format/check、typecheck、unit/e2e scaffold，以及最薄的原生 Git hook（仅在需要时调用 `vp check`）。

CLI、模板、迁移协议和 provider 需要独立版本；生成结果或被认领的存量项目都应写入 `.fluffy/manifest.json`，记录：

- `cliVersion`、`templateVersion`、`schemaVersion`、生成/认领时间和完整选择清单；
- 文件路径、`owner`（`generator-owned`/`user-owned`）、生成内容 hash 和最近迁移版本；
- 依赖增删、迁移步骤、冲突处理结果、事务 ID/备份位置；
- deploy provider、provider 版本、部署目标（如 Pages/Workers）和生成文件列表。

`adopt` 只建立检测结果和认领边界；`migrate` 根据 manifest 做可审计的增量变更。升级机制不属于 MVP，但 manifest schema 和迁移记录必须为后续版本升级预留字段。

## 10. 验收标准

### CLI

- `create` 在新目录生成成功；已有非空目录默认拒绝覆盖。
- `adopt` 对存量项目完成技术栈、Git 状态、manifest 和冲突检测；未确认迁移前不修改业务文件。
- `migrate --dry-run` 不写入文件；确认迁移只更新 generator-owned 文件，未知文件冲突默认 fail。
- 迁移失败自动恢复，事务 ID 可用于 `migrate rollback <id>`；manifest hash、owner、依赖变更和 provider 选择均可追溯。
- 项目名、主题色、语言、暗色、preset、SDK 选项均能在生成结果中追溯。
- 默认 provider 为 Vercel；选择 `none` 不生成部署配置，选择 Cloudflare 只生成该 provider 的配置。
- 未选择 SDK 时，依赖、初始化、env 示例和 bundle 均不存在对应内容。
- 取消、非法输入、安装失败、构建失败都有可恢复提示；CLI 不上传项目、不自动发布、不写入 secret。

### 生成项目

- `install` 后可启动开发服务器并打开登录/首页。
- `vp check` 与 `vp build` 通过；如锁定版本未提供独立类型检查入口，则由 `vp check` 覆盖类型检查。
- 路由模块可以独立添加页面并自动出现在菜单（符合权限与 hide meta）。
- Navbar 的品牌、侧栏入口、上下文和可选操作在桌面可用；窄屏转为 drawer，隐藏区域不产生空操作。
- 中英文切换、暗色切换、刷新后状态恢复可用。
- 桌面侧栏折叠与窄屏抽屉可用；键盘 focus、Reduced Motion、基础 RTL 规则有验证。
- 主题色在 light/dark 下满足对比度与可显示范围要求。

## 11. 待确认事项

1. [ASK USER] CLI 的正式 npm 包名是 `create-fluffy-design-pro` 还是其他名称？用户描述中同时出现了 `fluffy-desgin-pro` 的拼写，应在实现前固定。
2. [ASK USER] 默认包管理器是 npm、pnpm，还是根据用户环境自动选择并支持 `--package-manager`？
3. [ASK USER] Fluffy OSS SDK 与 Fluffy Log Trace Browser SDK 的准确 npm 包名、当前稳定版本、初始化代码和环境变量名是什么？
4. [ASK USER] 是否需要生成真实登录/权限 API adapter，还是只生成 mock demo 与接口占位？
5. [ASK USER] MVP 是否包含示例业务页面（dashboard/list/form 等），以及默认包含哪些 preset？
6. [ASK USER] 是否要求支持 Vue Router 的服务端菜单模式，还是先只支持静态文件路由？
7. [ASK USER] 支持的 Node、浏览器、Vue、Tailwind 与 shadcn-vue 最低版本矩阵是什么？
8. [ASK USER] 是否需要在生成阶段自动执行依赖安装、类型检查和构建，还是只输出命令由用户执行？
9. [ASK USER] Cloudflare provider 的 MVP 目标是 Cloudflare Pages 静态站点还是 Workers 部署？两者配置入口和构建产物不同，不能默认混用。
10. [RESOLVED] 存量项目首批支持范围已确定为「Vue 3 + Vite」；Vue CLI、Nuxt 与非 Vue 项目明确不支持，见 3.2 实现状态。
11. [ASK USER] Navbar 默认显示哪些区域（品牌、折叠、面包屑、搜索、语言、主题、通知、用户菜单），哪些只作为可选 slot？
12. [ASK USER] `backup` 冲突策略是否允许 CLI 自动写入 `.fluffy/backups/<id>`，还是所有备份都必须由用户显式确认？

## 12. 下一步实施顺序

1. 固定包名、版本矩阵、SDK contract、存量项目支持范围、Cloudflare Pages/Workers 目标与 CLI 选项。
2. 初始化 CLI 包、命令路由和模板 manifest，先实现 dry-run、项目检测和非破坏性目录检查。
3. 实现 `adopt` 的检测报告、认领边界、owner/hash manifest 和迁移计划，不先改业务代码。
4. 实现 `migrate` 的 staging、冲突策略、原子写入、备份和 rollback；用 fixture 验证空目录、非空 Vue 项目、脏 Git 和未知文件。
5. 构建 core 模板：Vite、Vue、Tailwind、shadcn、Navbar、router、i18n、theme、store、应用壳。
6. 实现 deploy provider：默认 Vercel，随后实现已确认目标的 Cloudflare provider；provider 仅生成配置，不执行发布。
7. 实现可选 preset 与 SDK adapter 的条件注入。
8. 加入生成结果测试：文件快照、依赖图、manifest hash、迁移回滚、provider 输出、安装/build/check 验证。
9. 以真实生成项目启动浏览器，走通登录、Navbar 导航、主题、语言、窄屏、错误状态和部署配置校验，再发布 beta。
