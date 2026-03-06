# AGENTS.md

## 项目概述
这是一个基于 Vue 3 + TypeScript 和 Leafer UI 构建的绘图应用程序。它提供了一个基于画布的绘图编辑器，包含形状工具（矩形、圆形、线条、文本、自由绘画）、选择/变换（移动/缩放/旋转）、删除、清空功能，以及通过基于命令的历史记录实现的撤销/重做功能。

## 构建和开发命令

### 核心命令
- `pnpm dev` - 启动开发服务器，支持热重载
- `pnpm build` - 类型检查并构建生产版本
- `pnpm preview` - 预览生产构建
- `pnpm build-only` - 仅构建（不进行类型检查，速度更快）

### 代码质量
- `pnpm lint` - 运行所有 linter（oxlint + eslint）并自动修复
- `pnpm lint:oxlint` - 运行 oxlint 并自动修复
- `pnpm lint:eslint` - 运行 eslint 并自动修复和缓存
- `pnpm format` - 使用 oxfmt 格式化代码

### 类型检查
- `pnpm type-check` - 使用 vue-tsc 运行 TypeScript 类型检查

## 架构和代码结构

### 目录结构
```
src/
├── App.vue                    # 主应用组件
├── editor/                   # 核心编辑器功能
│   ├── editor.ts             # 主 Editor 类
│   ├── history.ts            # 撤销/重做历史管理（命令栈）
│   ├── event.ts              # 事件处理（选择、变换、颜色选择框）
│   ├── type.ts               # 类型定义（ICommand、IPlugin）
│   ├── graph/                # 绘图工具
│   │   ├── base.ts           # 图形抽象基类
│   │   ├── rect.ts           # 矩形工具
│   │   ├── circle.ts         # 圆形工具
│   │   ├── line.ts           # 线条工具
│   │   ├── text.ts           # 文本工具（支持编辑和颜色选择）
│   │   ├── pen.ts            # 自由绘画工具
│   │   └── index.ts          # 图形管理器
│   ├── command/              # 命令模式实现
│   │   ├── index.ts          # 命令导出
│   │   ├── addGraph.ts       # 添加图形命令
│   │   ├── updateGraph.ts    # 更新图形属性命令
│   │   └── deleteGraph.ts    # 删除图形命令
│   └── plugin/                # 插件
│       ├── dotMatrix.ts      # 网格背景插件
│       ├── ruler.ts          # 标尺插件（暂时禁用）
│       └── snap.ts           # 对齐辅助插件
└── main.ts                  # 应用程序入口点
```

### 核心组件
- **Editor**: 主协调器，管理应用、历史记录和图形工具
  - `deleteSelected()` / `remove()`: 删除所有选中的元素（支持撤销/重做）
  - `clear()`: 清空画布上的所有元素（支持撤销/重做）
  - `undo()`: 撤销最后一个操作
  - `redo()`: 重做最后撤销的操作
  - `exec(name: string)`: 切换当前绘图工具（或选择模式）
- **History**: 管理撤销/重做的命令栈
- **AddEvent**: 事件处理，包括选择、变换、文本编辑颜色选择框
- **Graph**: 绘图工具管理器
- **GraphRect/GraphCircle/GraphLine/GraphText/GraphPen**: 具体的绘图工具实现
- **Commands**:
  - `AddGraphCommand`: 将创建的形状添加到画布（撤销时移除）
  - `UpdateGraphCommand`: 对一个或多个形状应用变换/属性更新（撤销时恢复）
  - `DeleteGraphsCommand`: 移除选中的形状，撤销时在原始父级/索引位置恢复
- **Plugins**:
  - `DotMatrix`: 网格背景
  - `SnapPlugin`: 对齐辅助
  - `RulerPlugin`: 标尺（暂时禁用）

### 类型定义 (type.ts)
```typescript
interface ICommand {
  execute(): void
  undo(): void
}

interface IPlugin {
  init(app: App): void
  enable(enabled: boolean): void
  destroy(): void
}
```

## 已知问题

### leafer-x-ruler 插件兼容性问题
- **问题**: `leafer-x-ruler` v2.0.0 插件存在 bug，重复引入 `leafer-ui/draw`，导致与 `leafer-editor` 冲突，文本编辑功能无法使用
- **状态**: 暂时禁用，等待插件作者修复

## 编辑器配置

### 缩放限制
- 在 `src/editor/index.ts` 中配置
- 默认最小缩放: 0.1 (10%)
- 默认最大缩放: 5 (500%)

### 初始化配置 (index.ts)
```typescript
const editor = new Editor({
  view,
  editor: { zoom: { min: 0.1, max: 5 } },
  tree: { type: 'design' },
  fill: '#f3f3f3'
})
```

## 代码风格指南

### TypeScript 和 Vue
- 使用 TypeScript 严格模式，启用 `noUncheckedIndexedAccess: true`
- Vue 3 Composition API，使用 `<script setup lang="ts">`
- 从 'vue' 导入 Vue API（如 `ref`、`onMounted`、`useTemplateRef`）
- 从 'leafer-editor' 导入 Leafer UI

### 导入组织
1. **内置 Node.js 模块**（如 `path`、`url`）
2. **第三方库**（如 `vue`、`leafer-editor`）
3. **本地导入**（使用 `@/*` 别名指向 src/ 目录）

```typescript
// 良好的导入结构
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Editor from '@/editor/editor'
import { GraphBase } from '@/editor/graph/base'
```

### 命名约定
- **类**: PascalCase（如 `GraphRect`、`History`）
- **方法**: camelCase（如 `createGraph`、`save`）
- **属性**: camelCase（如 `isDrawing`、`currentGraph`）
- **静态属性**: 一致使用 `static name = 'identifier'`
- **变量**: camelCase（如 `startPoint`、`undoStack`）

### 错误处理
- **空值安全**: 在适当的地方使用可选链（`?.`）和空值检查
- **类型守卫**: 在访问属性前验证对象存在性
- **事件处理**: 确保在 `destroy()` 方法中正确清理
- **历史管理**: 在应用状态更改前检查 `isExecuting` 标志

### 代码模式

#### 抽象基类模式
```typescript
export abstract class GraphBase {
  protected abstract create(point: IPointData): IUI
  protected abstract update(item: IUI, endPoint: IPointData): void

  init() { /* 事件绑定 */ }
  destroy() { /* 事件解绑 */ }
}
```

#### 事件管理
- 始终一致地绑定/解绑事件处理器
- 使用绑定方法确保正确的 `this` 上下文
- 在 `destroy()` 中清理所有事件监听器

#### 历史模式
- 使用命令对象（`execute()` / `undo()`）推入 `History`
- 添加新命令时清空重做栈
- 对于变换，在选择/变换开始时捕获 `from`，在指针抬起时提交 `to`
- 撤销/重做后，通过重新选择目标并调用 `updateEditBox()` 刷新编辑器选择框

#### 颜色选择框模式
- 监听 `InnerEditorEvent.OPEN` 和 `InnerEditorEvent.CLOSE` 事件
- 在文本编辑开始时显示颜色选择框，结束时隐藏
- 使用 `target.worldBoxBounds` 获取目标元素的位置

#### 自由绘画工具模式
- 继承 `GraphBase`，重写 `onDown`、`onMove`、`onUp` 事件处理方法
- 使用 `Pen` 元素绘制自由曲线
- 通过 `pen.lineTo(x, y)` 方法添加点
- 可配置线条样式（颜色、粗细、端点样式）

### 格式化和样式
- **缩进**: 2 个空格（由 .editorconfig 强制执行）
- **引号**: 字符串使用单引号
- **分号**: 不使用分号（oxfmt 配置）
- **行长度**: 最大 100 字符（.editorconfig）
- **行结尾**: LF（Unix 风格）

### 测试
- 当前未配置测试框架
- 测试文件应放在 `src/**/__tests__/*` 目录中
- 考虑未来添加 vitest 或 jest

### 性能考虑
- Leafer UI 高效处理画布渲染
- 使用适当的事件绑定/解绑防止内存泄漏
- 历史管理应针对大型画布状态进行优化
- 颜色选择框等临时 UI 元素应及时清理

### 依赖项
- **核心**: Vue 3、TypeScript、Vite
- **UI**: leafer-editor（包含 @leafer-in/editor 和 @leafer-in/text-editor）
- **插件**: leafer-x-dot-matrix、leafer-x-easy-snap（leafer-x-ruler 暂时禁用）
- **工具**: oxlint、oxfmt、eslint 用于代码质量
- **构建**: vite-plugin-vue-devtools 用于开发

### 配置文件
- `.oxlintrc.json`: Oxlint 配置，用于 linting 规则
- `.oxfmtrc.json`: Oxfmt 配置（无分号，单引号）
- `.editorconfig`: 编辑器无关的格式化规则
- `tsconfig.app.json`: TypeScript 配置，包含 DOM 类型
- `eslint.config.ts`: ESLint，支持 Vue 和 TypeScript

### 开发说明
- 此项目使用 pnpm 作为包管理器
- Node.js 版本: ^20.19.0 || >=22.12.0
- Vue DevTools 插件已配置用于开发调试
- 文本编辑功能需要 `leafer-editor` 包提供的 TextEditor 支持
- 避免使用有兼容性问题的第三方插件
