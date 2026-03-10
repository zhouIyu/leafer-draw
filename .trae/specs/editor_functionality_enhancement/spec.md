# 编辑器功能增强 Spec

## Why
当前编辑器已实现基础功能，但工具栏按钮缺少正确的禁用状态，撤销/重做/复制/粘贴等操作在不可用时仍可点击，影响用户体验。此外，工具栏布局和交互可进一步优化。

## What Changes
- 工具栏按钮根据操作可用性启用/禁用状态
- 撤销/重做按钮状态与 canUndo/canRedo 同步
- 复制/粘贴按钮在无可选内容/剪贴板为空时禁用
- 添加全选功能（Ctrl+A）
- 优化工具栏布局，分组显示

## Impact
- Affected specs: 撤销重做、复制粘贴、快捷键
- Affected code: App.vue, PropertiesPanel.vue

## ADDED Requirements
### Requirement: 按钮禁用状态
工具栏中的撤销、重做、复制、粘贴、删除按钮应根据当前状态正确启用或禁用。

#### Scenario: 撤销按钮状态
- **GIVEN** 历史记录为空（无可撤销操作）
- **WHEN** 用户查看工具栏
- **THEN** 撤销按钮处于禁用状态

#### Scenario: 重做按钮状态
- **GIVEN** 重做栈为空（无可重做操作）
- **WHEN** 用户查看工具栏
- **THEN** 重做按钮处于禁用状态

#### Scenario: 复制按钮状态
- **GIVEN** 画布上没有选中任何图形
- **WHEN** 用户查看工具栏
- **THEN** 复制按钮处于禁用状态

#### Scenario: 粘贴按钮状态
- **GIVEN** 剪贴板为空（未复制过任何图形）
- **WHEN** 用户查看工具栏
- **THEN** 粘贴按钮处于禁用状态

#### Scenario: 删除按钮状态
- **GIVEN** 画布上没有选中任何图形
- **WHEN** 用户查看工具栏
- **THEN** 删除按钮处于禁用状态

### Requirement: 全选功能
用户可通过 Ctrl+A / Cmd+A 快捷键选中画布上所有图形。

#### Scenario: 全选成功
- **GIVEN** 画布上至少有一个图形
- **WHEN** 用户按下 Ctrl+A
- **THEN** 所有图形被选中

#### Scenario: 全选空画布
- **GIVEN** 画布上没有图形
- **WHEN** 用户按下 Ctrl+A
- **THEN** 无任何选中状态变化

## MODIFIED Requirements
### Requirement: 工具栏按钮
修改现有工具栏按钮，添加动态禁用状态。

## REMOVED Requirements
无
