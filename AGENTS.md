# AGENTS.md

## 1. 文档目标
本文件面向在本仓库协作的开发者与 AI Agent，目标是：
- 快速理解项目结构与关键约束
- 在不破坏编辑器行为的前提下进行功能迭代
- 保持代码风格、撤销重做语义、插件策略一致

---

## 2. 项目概览
这是一个基于 `Vue 3 + TypeScript + Leafer` 的画布绘图应用，当前包含：
- 图形工具：矩形、圆形、直线、箭头、文本、画笔
- 编辑能力：选择、移动、缩放、旋转
- 操作能力：删除选中、清空画布
- 历史系统：命令模式的撤销/重做（Undo/Redo）
- 属性面板：支持单选/多选样式编辑，文本属性编辑

---

## 3. 快速开始

### 3.1 环境要求
- Node.js: `^20.19.0 || >=22.12.0`
- 包管理器: `pnpm`

### 3.2 常用命令
- `pnpm dev`：启动开发服务器（HMR）
- `pnpm build`：类型检查 + 生产构建
- `pnpm build-only`：仅构建（更快）
- `pnpm preview`：预览生产构建
- `pnpm type-check`：运行 `vue-tsc`
- `pnpm lint`：运行 `oxlint + eslint` 并修复
- `pnpm lint:oxlint`：仅 `oxlint`
- `pnpm lint:eslint`：仅 `eslint`
- `pnpm format`：运行 `oxfmt`

---

## 4. 目录结构（核心）

```text
src/
├── App.vue
├── components/
│   └── PropertiesPanel.vue
├── editor/
│   ├── index.ts                 # 唯一导出入口
│   ├── editor.ts                # 主协调器
│   ├── history.ts               # 命令栈管理
│   ├── event.ts                 # 事件总线 + 事件处理
│   ├── type.ts                  # 类型定义
│   ├── graph/
│   │   ├── base.ts
│   │   ├── rect.ts
│   │   ├── circle.ts
│   │   ├── line.ts
│   │   ├── arrow.ts
│   │   ├── text.ts
│   │   ├── pen.ts
│   │   └── index.ts
│   ├── command/
│   │   ├── addGraph.ts
│   │   ├── updateGraph.ts
│   │   ├── deleteGraph.ts
│   │   └── index.ts
│   ├── recorder/
│   │   ├── transformRecorder.ts
│   │   ├── textChangeRecorder.ts
│   │   └── index.ts
│   ├── plugin/
│   │   ├── dotMatrix.ts
│   │   ├── snap.ts
│   │   └── ruler.ts
│   └── utils/
│       └── selection.ts
└── main.ts
```

---

## 5. 架构与职责

### 5.1 Editor（`src/editor/editor.ts`）
主协调器，负责：
- 维护 `app / history / graph`
- `undo()` / `redo()`
- `remove()`：删除当前选中元素
- `clear()`：清空画布元素
- `exec(name)`：切换工具或回到选择模式
- `updateAttrs(attrs)`：更新选中元素属性并写入历史
- 选择监听：`onSelectionChange` / `notifySelectionChange`

### 5.2 History（`src/editor/history.ts`）
命令栈管理：
- `undoStack` / `redoStack`
- 执行期锁：`executing`（`isExecuting`）
- 在 `undo()/redo()` 回放期间禁止再次写历史

### 5.3 Graph 系统（`src/editor/graph/*`）
- `Graph`：工具注册/切换与默认样式维护
- `GraphBase`：统一处理指针生命周期（down/move/up）
- 各工具：`Rect/Circle/Line/Arrow/Text/Pen`

`GraphBase` 的三种模式：
- `drag`：拖拽成形（大多数几何图形）
- `oneClick`：单击创建（文本）
- `freeDraw`：连续采样（画笔）

### 5.4 Event + Recorder（`src/editor/event.ts`, `src/editor/recorder/*`）
事件系统分为两层：

**mitt 事件总线**（`src/editor/event.ts`）：
- 使用 `mitt` 库实现轻量级发布/订阅
- 导出 `emitter` 实例和 `Events` 常量对象
- 事件列表：
  - `SELECTION_CHANGE`：选择变更时触发，payload 为选中元素数组
  - `HISTORY_CHANGE`：历史栈变更时触发，payload 包含 `canUndo/canRedo` 状态
- UI 层通过订阅事件实现按钮状态同步

**AddEvent 类**（`src/editor/event.ts`）：
- 负责把 Leafer 事件转成可撤销记录
- `TransformRecorder`：记录几何变换 from/to，提交 `UpdateGraphCommand`
- `TextChangeRecorder`：在内部文本编辑 `BEFORE_OPEN/CLOSE` 之间记录文本变化

### 5.5 Commands（`src/editor/command/*`）
- `AddGraphCommand`：创建图形后入栈，撤销时移除
- `UpdateGraphCommand`：批量属性更新，可撤销恢复
- `DeleteGraphsCommand`：删除时记录 parent/index，撤销按原位置恢复

### 5.6 统一导出入口（`src/editor/index.ts`）
`index.ts` 是 editor 模块的唯一导出入口，统一暴露：
- `initEditor(view)`：编辑器初始化函数
- `Editor`：主编辑器类（类型）
- `GraphTypes`：图形工具类型
- `emitter`：mitt 事件总线实例
- `Events`：事件名称常量对象
- 所有类型定义（`type.ts`）

UI 层应从 `@/editor` 导入所需内容，避免直接引用内部模块。

---

## 6. 核心行为约束（必须遵守）

### 6.1 撤销/重做语义
- 所有“可回放的状态变更”必须通过命令对象（`execute/undo`）表达
- 历史回放期间（`history.executing === true`）禁止再次写入历史
- 新命令入栈时清空 redo 栈

### 6.2 选择框与编辑框同步
- 更新/撤销/重做后需保证选择框状态正确
- `UpdateGraphCommand` 中通过重新选择并 `updateEditBox()` 同步 UI

### 6.3 删除恢复一致性
- 删除命令必须保存每个元素的原父节点与索引
- 撤销删除时按索引顺序恢复，避免层级错乱

---

## 7. 插件策略与已知问题

### 7.1 当前启用插件
- `DotMatrix`（网格背景）
- `SnapPlugin`（吸附/对齐辅助）

### 7.2 已知兼容性问题
`leafer-x-ruler@2.0.0` 与当前 `leafer-editor` 组合存在兼容问题：
- 现象：重复引入 `leafer-ui/draw`，影响文本编辑能力
- 处理：`RulerPlugin` 代码保留，但在 `src/editor/index.ts` 中默认禁用

---

## 8. 编辑器初始化配置
位置：`src/editor/index.ts`

```ts
const editor = new Editor({
  view,
  editor: {},
  tree: { type: 'design' },
  zoom: { min: 0.1, max: 20 },
  fill: '#f3f3f3',
})
```

当前缩放范围：
- 最小缩放：`0.1`
- 最大缩放：`20`

---

## 9. 代码规范

### 9.1 TypeScript / Vue
- 使用 TypeScript 严格模式（含 `noUncheckedIndexedAccess`）
- Vue 3 Composition API，`<script setup lang="ts">`
- 优先使用类型守卫与空值检查，避免不安全断言

### 9.2 导入顺序
1. Node 内置模块
2. 第三方依赖
3. 本地模块（`@/`）

### 9.3 命名约定
- 类：`PascalCase`
- 方法/属性/变量：`camelCase`
- 工具类型标识：统一使用 `static name = 'xxx'`

### 9.4 格式化约束
- 缩进：2 空格
- 字符串：单引号
- 分号：不使用
- 行宽：100
- 换行：LF

---

## 10. 常见开发任务指引

### 10.1 新增绘图工具
1. 在 `graph/` 新增类并继承 `GraphBase`
2. 实现 `create()` 和 `update()`
3. 在 `graph/index.ts` 注册到 `GraphTypes` 与 `init()`
4. 在 `App.vue` 工具栏接入入口

### 10.2 新增“可撤销”的属性编辑
1. 扩展 `UpdatableLeafData`（必要时）
2. 在面板中调用 `editor.updateAttrs()`
3. 确认 `UpdateGraphCommand.buildUpdateCommand()` 能正确过滤可用目标
4. 验证撤销/重做后选择框与渲染状态

### 10.3 接入新插件
1. 实现 `IPlugin`：`init / enable / destroy`
2. 在 `src/editor/index.ts` 中 `editor.use()`
3. 验证不会破坏文本编辑与历史系统

### 10.4 使用事件总线同步 UI 状态
1. 从 `@/editor` 导入 `emitter` 和 `Events`
2. 订阅事件：`emitter.on(Events.SELECTION_CHANGE, (items) => { ... })`
3. 在组件卸载时取消订阅：`emitter.off(Events.SELECTION_CHANGE, handler)`
4. 常用场景：工具栏按钮状态、属性面板显示、撤销/重做按钮启用状态

---

## 11. 测试与质量
- 当前仓库尚未接入单元测试框架
- 建议新增测试放在：`src/**/__tests__/*`
- 提交前至少执行：
  - `pnpm type-check`
  - `pnpm lint`
  - `pnpm build-only`

---

## 12. 依赖与配置文件

### 12.1 关键依赖
- 核心：`vue`、`typescript`、`vite`
- 绘图：`leafer-editor`
- 事件总线：`mitt`
- 插件：`leafer-x-dot-matrix`、`leafer-x-easy-snap`
- 质量工具：`oxlint`、`oxfmt`、`eslint`

### 12.2 关键配置文件
- `.editorconfig`
- `.oxlintrc.json`
- `.oxfmtrc.json`
- `eslint.config.ts`
- `tsconfig.app.json`
- `vite.config.ts`

---

## 13. 维护建议
- 文档内容变更应与代码变更同 PR 提交
- 涉及命令系统、事件录制、插件兼容性的修改必须补充行为说明
- 若启用 `RulerPlugin`，需先验证文本编辑流程不受影响
