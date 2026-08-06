# Fluffy Design Pro 概要设计

> 状态：Draft 0.1。本文是目标产品设计，不代表当前仓库已有实现。当前仓库仅包含 Git 元数据、`.gitignore`、`.idea/` 与文档目录。

## 1. 产品定位

`create fluffy-design-pro` 是一个面向 Vue 中后台应用的项目生成 CLI：以 shadcn-vue 与 Tailwind CSS 为 UI 基础，吸收 Arco Design Pro Vue 的成熟应用壳、国际化、主题、权限与路由组织方式，同时通过按需组件与样式生成获得更好的 tree shaking；通过交互式向导生成项目名称、品牌主题色和可选 Fluffy 生态 SDK 配置。

### 1.1 目标用户

- 需要快速启动管理后台、运营后台和内部工具的前端开发者。
- 希望保留 Tailwind/shadcn 可组合性，而不被整套 UI 运行时绑定的团队。
- 需要统一接入 Fluffy OSS 与浏览器日志/链路追踪 SDK 的项目。

### 1.2 核心价值

1. 生成即可运行的中后台应用壳，而非只生成空白 Vue 页面。
2. 能力以模块和语义令牌组织，默认可 tree shake，避免全量注册。
3. CLI 负责选择与注入配置；模板负责运行时能力；可选生态 SDK 不污染未选择的项目。
4. 视觉上形成“Fluffy”识别度：克制的中台密度、明确的层级、可配置但不廉价的品牌表达。

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
| 类型与质量门禁 | `tsconfig.json:1-20`、`.eslintrc.js:4-70`、`.prettierrc.js`、`.stylelintrc.js`、`.husky/` | 生成项目默认 TypeScript strict、ESLint、Prettier、Stylelint、lint-staged、commitlint；版本需选择当前兼容组合 |

## 3. 目标范围与非目标

### 3.1 MVP 范围

- `npx create fluffy-design-pro@latest` 启动 CLI。
- 交互式收集：项目名称、目录、包管理器、主题色、语言、是否启用暗色、是否启用 mock、是否接入 Fluffy OSS、是否接入 Fluffy Log Trace Browser。
- 生成 Vue 3 + TypeScript + Vite + Tailwind CSS + shadcn-vue 基础工程。
- 生成应用壳：顶部导航、侧边栏/移动端抽屉、面包屑、页面容器、可选标签页、页脚、404、登录页。
- 生成基础能力：i18n、主题/暗色、路由模块、route meta 权限、Pinia stores、请求 adapter、错误边界/日志 adapter。
- 生成可选 preset：dashboard、list、form、result、exception；每个 preset 的页面和依赖可独立移除。
- 生成 README、环境变量示例、基础测试和能力清单。

### 3.2 非目标

- MVP 不实现后端用户、RBAC 服务或 OSS 服务本身。
- MVP 不承诺兼容所有 UI 组件库；shadcn-vue 是默认生成方案。
- MVP 不在 CLI 中上传项目内容、不自动发布、不修改用户全局配置。
- MVP 不将 Fluffy SDK 强制绑定到所有项目；未选择时不生成 import、env 或初始化副作用。

## 4. 用户流程

```text
启动 CLI
  -> 检查 Node 与目录
  -> 选择/输入项目配置
  -> 展示配置摘要并确认
  -> 复制模板与渲染变量
  -> 写入仅被选择的依赖、文件和 env 示例
  -> 安装依赖（可跳过）
  -> 运行生成项目的类型检查/构建（可选但默认提示）
  -> 输出下一步命令
```

### 4.1 CLI 交互原则

- 问题按决策顺序出现：项目身份 → 技术选项 → 外部集成 → 安装与验证。
- 每个选项提供默认值、影响说明和可回退的摘要确认。
- 主题色输入支持预设与自定义值；无效值在 CLI 边界阻止生成。
- 生成失败不覆盖既有目录；写入应采用临时目录/原子替换策略，保留清晰错误信息。
- SDK 选项只询问对应的公开配置，不要求在 CLI 中输入 secret；secret 仅进入 `.env.local` 指引或由用户后续配置。

## 5. 目标生成项目架构

```text
src/
  app/                 启动编排、providers、错误边界
  assets/              全局样式与静态资源
  components/          可复用 UI 与应用组件
  config/              生成的运行时默认配置
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
```

### 5.1 依赖方向

- `app` 只负责初始化和组合 providers，不承载页面业务。
- `router` 可读取 stores 与权限策略；页面不直接修改路由注册表。
- `layouts` 消费 router/store 派生的菜单和标签状态，不直接请求后端菜单。
- `integrations` 只通过显式 adapter 暴露 SDK 能力；未启用集成时必须为空实现或完全不生成。
- `pages` 通过 API/service 访问数据，不直接操作 SDK 原始对象。
- `components` 不依赖具体业务页面，业务组件与基础 UI 分开。

## 6. 能力设计

### 6.1 路由与菜单

采用基于文件的路由模块：每个模块导出 route records，生成器只保留所选模块。route meta 至少支持 `titleKey`、`icon`、`order`、`requiresAuth`、`roles`、`hideInMenu`、`hideChildrenInMenu`。菜单从可访问路由派生，客户端静态菜单为默认模式，服务端菜单作为显式配置项。

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

## 7. Tree shaking 与构建策略

- shadcn-vue 组件采用源码级复制/按需导入，不做全局组件注册。
- Tailwind 扫描生成源码和组件目录，避免动态拼接无法被扫描的 class；动态主题通过 CSS 变量而不是生成无限 class。
- 图表、mock、SDK、示例页面均以 feature preset 或 conditional template 注入。
- Vite 保留标准 ESM 输出；生产构建提供压缩与可选 bundle report。
- CLI 生成后清理未选择 feature 的依赖和 import，并用 build/typecheck 作为验收门禁。

## 8. UI/UX 设计系统

### 8.1 视觉方向

主题不是“换一枚主色”，而是把“生成器的配置感”转译成产品界面：以安静的中性表面承载数据，以一条可识别的品牌色轨迹贯穿 active nav、focus ring 和主要 CTA。唯一的视觉冒险是让侧栏选中态使用窄幅品牌色轨迹与轻微光晕，而不是大面积彩色填充；这样保留中台效率，又让生成项目具有可识别的 Fluffy 签名。

### 8.2 布局

- Desktop：60px navbar、可折叠 sidebar、内容区最小高度撑满视口；具体宽度由 token 配置，默认建议 240px。
- Narrow viewport：sidebar 转为 drawer，核心操作保持可达；页面内容不依赖固定文字宽度。
- 页面结构优先级：页面标题/上下文 → 主要操作 → 关键摘要 → 内容区 → 次要信息。
- 组内间距小于组间间距，优先使用留白而非分割线；使用 logical properties 支持 RTL。
- 表格、表单、dashboard 必须定义 loading、empty、error、success、disabled、focus 状态。

### 8.3 交互

- 状态改变使用可打断的短 transition，不使用 `transition: all`。
- button press 使用轻微 `scale(0.96)`，不把动画作为唯一反馈；尊重 `prefers-reduced-motion`。
- 图标使用单一图标集、`currentColor` 和一致 stroke weight；icon-only 控件必须有可访问名称。
- 嵌套圆角满足外层半径 = 内层半径 + 内边距；阴影表达层级，边框表达结构或状态。
- 文案使用 sentence case/自然中文、主动语态；空态直接告诉用户下一步，错误说明发生了什么及如何恢复。

## 9. 模板分层与版本策略

建议模板分为：

- `core`：最小可运行工程、应用壳、Tailwind/shadcn、router、i18n、theme、store。
- `auth`：登录页、token adapter、用户 store、权限 guard。
- `presets`：dashboard/list/form/result/exception。
- `integrations`：oss、log-trace。
- `quality`：lint、format、typecheck、unit/e2e scaffold、commit hooks。

CLI、模板和生成协议需要独立版本；生成结果应写入模板版本与选择清单，便于复现和升级。升级机制不属于 MVP，但模板 manifest 应为其预留版本字段。

## 10. 验收标准

### CLI

- 新目录生成成功；已有非空目录默认拒绝覆盖。
- 项目名、主题色、语言、暗色、preset、SDK 选项均能在生成结果中追溯。
- 未选择 SDK 时，依赖、初始化、env 示例和 bundle 均不存在对应内容。
- 取消、非法输入、安装失败、构建失败都有可恢复提示。

### 生成项目

- `install` 后可启动开发服务器并打开登录/首页。
- `typecheck`、`lint`、`build` 通过。
- 路由模块可以独立添加页面并自动出现在菜单（符合权限与 hide meta）。
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

## 12. 下一步实施顺序

1. 固定包名、版本矩阵、SDK contract 与 CLI 选项。
2. 初始化 CLI 包与模板 manifest，先实现 dry-run 和非破坏性目录检查。
3. 构建 core 模板：Vite、Vue、Tailwind、shadcn、router、i18n、theme、store、应用壳。
4. 实现可选 preset 与 SDK adapter 的条件注入。
5. 加入生成结果测试：文件快照、依赖图、安装/build/typecheck 验证。
6. 以真实生成项目启动浏览器，走通登录、导航、主题、语言、窄屏和错误状态，再发布 beta。
