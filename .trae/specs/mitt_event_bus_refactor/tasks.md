# Tasks
- [ ] Task 1: 安装 mitt 依赖
  - [ ] SubTask 1.1: 运行 pnpm add mitt
  - [ ] SubTask 1.2: 添加类型定义 @types/mitt

- [ ] Task 2: 创建事件总线模块
  - [ ] SubTask 2.1: 创建 src/editor/emitter.ts

- [ ] Task 3: 重构 Editor - 使用事件发射替代 selectionListeners
  - [ ] SubTask 3.1: 导入 mitt 并创建 emitter 实例
  - [ ] SubTask 3.2: 添加 emitSelectionChange 方法
  - [ ] SubTask 3.3: 添加 emitHistoryChange 方法
  - [ ] SubTask 3.4: 移除 selectionListeners 和 onSelectionChange

- [ ] Task 4: 重构 App.vue - 使用事件总线监听状态
  - [ ] SubTask 4.1: 导入 emitter
  - [ ] SubTask 4.2: 监听 'selection-change' 事件更新 selectionCount
  - [ ] SubTask 4.3: 监听 'history-change' 事件更新 canUndo/canRedo
  - [ ] SubTask 4.4: 移除旧的 watch editor 逻辑

- [ ] Task 5: 重构 PropertiesPanel.vue - 使用事件总线
  - [ ] SubTask 5.1: 导入 emitter
  - [ ] SubTask 5.2: 监听 'selection-change' 事件

- [ ] Task 6: 验证功能
  - [ ] SubTask 6.1: 运行 pnpm type-check
  - [ ] SubTask 6.2: 运行 pnpm lint
  - [ ] SubTask 6.3: 测试选择变化事件是否正常工作
  - [ ] SubTask 6.4: 测试撤销/重做按钮状态

# Task Dependencies
- Task 2 依赖 Task 1 完成
- Task 3 依赖 Task 2 完成
- Task 4 依赖 Task 3 完成
- Task 5 依赖 Task 2 完成
- Task 6 依赖 Task 4 和 Task 5 完成
