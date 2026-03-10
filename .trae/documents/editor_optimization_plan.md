# Editor 模块优化计划

## 一、当前代码问题分析

### 1.1 类型安全问题（高优先级）

| 位置                   | 问题                                | 风险      |
| -------------------- | --------------------------------- | ------- |
| `GraphBase`          | 使用 `this.graph!` 非空断言             | 运行时可能崩溃 |
| `AddGraphCommand`    | 使用 `this.editor.app.tree!` 非空断言   | 运行时可能崩溃 |
| `UpdateGraphCommand` | 强制转换 `graphs as unknown as IUI[]` | 类型不安全   |
| 插件类                  | 使用 `this.dotMatrix!` 非空断言         | 初始化顺序问题 |

### 1.2 代码重复与冗余

| 位置                       | 问题                                              |
| ------------------------ | ----------------------------------------------- |
| `GraphTypes` 常量          | 与 `graph/index.ts` 内部注册逻辑重复                     |
| `Editor.getSelected()`   | 多次调用时可复用                                        |
| 命令类的 `updateSelection()` | `UpdateGraphCommand` 和 `DeleteGraphsCommand` 重复 |

### 1.3 架构问题

| 问题                   | 影响               |
| -------------------- | ---------------- |
| 插件未正确实现 `IPlugin` 接口 | 缺少类型检查，方法签名不完整   |
| `GraphTypes` 未统一导出   | 外部使用时需自行导入       |
| `History` 未导出状态信息    | UI 无法响应撤销/重做可用状态 |

### 1.4 功能缺失

| 功能     | 优先级 | 说明                      |
| ------ | --- | ----------------------- |
| 快捷键支持  | 高   | Ctrl+Z/Y 撤销重做，Delete 删除 |
| 复制/粘贴  | 中   | 剪贴板操作                   |
| 图形对齐   | 低   | 多个图形对齐方式                |
| 历史记录限制 | 中   | 防止内存溢出                  |
| 完整类型导出 | 中   | 便于外部扩展                  |

***

## 二、优化计划

### 2.1 类型安全修复

* [ ] **修复 GraphBase 非空断言**

  * 将 `this.graph!` 改为安全检查

  * 在 `finalizeCreation()` 中添加 null 检查

* [ ] **修复 AddGraphCommand**

  * 添加 tree 的 null 检查

* [ ] **修复 UpdateGraphCommand 类型转换**

  * 使用类型守卫替代强制转换

* [ ] **修复插件类**

  * 在 `enable()` 中检查初始化状态

### 2.2 代码重构

* [ ] **统一 GraphTypes 导出**

  * 在 `editor/index.ts` 中统一导出

* [ ] **抽取 Selection 工具类**

  * 合并 `getSelected()` 和 `getSelectedGraphLike()`

  * 放置在 `editor/utils/selection.ts`

* [ ] **简化命令执行逻辑**

  * 在 `Editor.execCommand()` 中处理 null 检查

### 2.3 历史系统增强

* [ ] **添加历史记录数量限制**

  * 默认限制 100 条

  * 超出时移除最旧的记录

* [ ] **导出历史状态**

  * 在 `Editor` 中暴露 `canUndo` / `canRedo 2.4` 属性

### 功能增强

* [ ] **添加快捷键支持**

  * `Ctrl+Z` / `Cmd+Z`: 撤销

  * `Ctrl+Y` / `Cmd+Shift+Z`: 重做

  * `Delete` / `Backspace`: 删除选中

  * `Ctrl+C` / `Cmd+C`: 复制

  * `Ctrl+V` / `Cmd+V`: 粘贴

* [ ] **添加复制/粘贴功能**

  * 实现 `Editor.copy()` 方法

  * 实现 `Editor.paste()` 方法

### 2.5 插件系统优化

* [ ] **完善 IPlugin 接口**

  ```typescript
  export interface IPlugin {
    init(app: App): void
    enable(enabled: boolean): void
    destroy(): void
    name?: string
  }
  ```

* [ ] **统一插件实现**

  * 修复 `DotMatrixPlugin` 和 `SnapPlugin` 的接口实现

***

## 三、实施顺序

```
第一阶段：类型安全修复（高优先级）
  ↓
第二阶段：代码重构（消除重复）
  ↓
第三阶段：历史系统增强
  ↓
第四阶段：功能增强（快捷键、复制粘贴）
  ↓
第五阶段：插件系统优化
```

***

## 四、验收标准

1. **类型检查通过** - `pnpm type-check` 无错误
2. **Lint 通过** - `pnpm lint` 无警告
3. **功能验证**

   * 撤销/重做正常工作

   * 删除选中正常工作

   * 快捷键正常工作

   * 复制/粘贴正常工作（如果实现）
4. **无运行时错误**

