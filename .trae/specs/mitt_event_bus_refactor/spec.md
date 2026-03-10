# 使用 Mitt 重构消息管理和按钮状态管理 Spec

## Why
当前代码中使用手动订阅模式管理选择状态变化（`onSelectionChange`），这种方式存在以下问题：
1. 每个组件需要独立监听状态变化，代码重复
2. 状态分散在多个地方，难以追踪
3. Editor 类需要维护 selectionListeners Set，职责过重

使用事件总线（mitt）可以实现：
1. 集中式事件管理
2. 组件间解耦
3. 更简洁的 API

## What Changes
- 安装 mitt 依赖
- 创建统一的事件总线
- 重构 Editor 移除 selectionListeners，改用事件发射
- 重构 App.vue 使用事件总线监听状态
- 重构 PropertiesPanel 使用事件总线监听状态

## Impact
- Affected specs: 选择状态管理、按钮状态管理
- Affected code: src/editor/editor.ts, src/App.vue, src/components/PropertiesPanel.vue

## ADDED Requirements
### Requirement: 事件总线
系统应提供统一的事件总线用于组件间通信。

#### Scenario: 发射选择变化事件
- **WHEN** Editor 中的选中图形发生变化
- **THEN** 发射 'selection-change' 事件，携带选中项列表

#### Scenario: 发射历史变化事件
- **WHEN** 用户执行撤销/重做操作
- **THEN** 发射 'history-change' 事件，携带 { canUndo, canRedo }

### Requirement: 按钮状态响应
工具栏按钮应根据事件总线中的状态变化自动更新禁用/启用状态。

#### Scenario: 选择变化时更新删除按钮
- **GIVEN** 用户选中了一个图形
- **WHEN** 选择变化事件触发
- **THEN** 删除按钮自动启用

## MODIFIED Requirements
### Requirement: 选择状态管理
修改选择状态管理方式，从主动订阅改为事件驱动。

## REMOVED Requirements
- 移除 Editor 类中的 selectionListeners Set
- 移除 onSelectionChange 方法
