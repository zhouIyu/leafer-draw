# Tasks
- [x] Task 1: 实现全选功能 - 在 Editor 中添加 selectAll() 方法
  - [x] SubTask 1.1: 在 editor.ts 中添加 selectAll 方法
  - [x] SubTask 1.2: 在 App.vue 中添加 Ctrl+A 快捷键支持

- [x] Task 2: 实现按钮禁用状态 - 在 App.vue 中添加响应式按钮状态
  - [x] SubTask 2.1: 使用 watch 监听 editor 状态变化
  - [x] SubTask 2.2: 计算 canUndo/canRedo/canCopy/canPaste/canDelete 状态
  - [x] SubTask 2.3: 在模板中绑定按钮 disabled 属性

- [x] Task 3: 验证功能
  - [x] SubTask 3.1: 运行 pnpm type-check
  - [x] SubTask 3.2: 运行 pnpm lint
  - [x] SubTask 3.3: 手动测试各功能

# Task Dependencies
- Task 2 依赖 Task 1 完成
- Task 3 依赖 Task 1 和 Task 2 完成
