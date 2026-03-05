# AGENTS.md

## 项目概述
这是一个基于 Vue 3 + TypeScript 和 Leafer UI 构建的绘图应用程序。它提供了一个基于画布的绘图编辑器，包含形状工具（矩形、圆形、线条）、选择/变换（移动/缩放/旋转）、删除、清空功能，以及通过基于命令的历史记录实现的撤销/重做功能。

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
│   ├── history.ts           # 撤销/重做历史管理（命令栈）
│   ├── graph/               # 绘图工具
│   │   ├── base.ts          # 图形抽象基类
│   │   ├── rect.ts          # 矩形工具
│   │   ├── circle.ts        # 圆形工具
│   │   ├── line.ts          # 线条工具
│   │   └── index.ts         # 图形管理器
│   ├── action.ts            # 命令实现（添加/更新/删除）
│   └── index.ts             # 编辑器初始化
├── main.ts                  # 应用程序入口点
└── style.scss              # 全局样式
```

### 核心组件
- **Editor**: 主协调器，管理应用、历史记录和图形工具
  - `deleteSelected()` / `remove()`: 删除所有选中的元素（支持撤销/重做）
  - `clear()`: 清空画布上的所有元素（支持撤销/重做）
  - `undo()`: 撤销最后一个操作
  - `redo()`: 重做最后撤销的操作
  - `exec(name: string)`: 切换当前绘图工具（或选择模式）
- **History**: 管理撤销/重做的命令栈
- **Graph**: 绘图工具的抽象基类
- **GraphRect/GraphCircle/GraphLine**: 具体的绘图工具实现
- **Commands (action.ts)**:
  - `AddGraphCommand`: 将创建的形状添加到画布（撤销时移除）
  - `UpdateAttrsCommand`: 对一个或多个形状应用变换/属性更新（撤销时恢复）
  - `DeleteGraphsCommand`: 移除选中的形状，撤销时在原始父级/索引位置恢复（也用于清空画布功能）

## 代码风格指南

### TypeScript 和 Vue
- 使用 TypeScript 严格模式，启用 `noUncheckedIndexedAccess: true`
- Vue 3 Composition API，使用 `<script setup lang="ts">`
- 从 'vue' 导入 Vue API（如 `ref`、`onMounted`、`useTemplateRef`）
- 从 'leafer-ui' 和 '@leafer-in/editor' 导入 Leafer UI

### 导入组织
1. **内置 Node.js 模块**（如 `path`、`url`）
2. **第三方库**（如 `vue`、`leafer-ui`）
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
  protected abstract createGraph(point: IPointData): IUI
  protected abstract updateGraph(item: IUI, endPoint: IPointData): void
  
  // 通用功能
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

### 依赖项
- **核心**: Vue 3、TypeScript、Vite
- **UI**: Leafer UI、@leafer-in/editor、@leafer-in/viewport
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
- 未找到 Cursor 或 Copilot 规则 - 遵循上述通用指南