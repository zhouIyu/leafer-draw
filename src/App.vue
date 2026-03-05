<script setup lang="ts">
import { initEditor, GraphTypes } from './editor'
import { onMounted, ref, useTemplateRef, computed } from 'vue'

const canvas = useTemplateRef<HTMLCanvasElement>('canvas')
const editor = ref()

onMounted(() => {
  editor.value = initEditor(canvas.value!)
})

// 计算属性：是否可以撤销
const canUndo = computed(() => editor.value?.canUndo || false)

// 计算属性：是否可以重做
const canRedo = computed(() => editor.value?.canRedo || false)

// 计算属性：是否有选中元素
const hasSelection = computed(() => editor.value?.selectedCount > 0)

function deleteSelected() {
  editor.value?.deleteSelected()
}

function undo() {
  editor.value?.undo()
}

function redo() {
  editor.value?.redo()
}

function onSelectGraph(name: string) {
  editor.value?.exec(name)
}
</script>

<template>
  <div class="leafer-draw">
    <div class="tool-container">
      <button @click="onSelectGraph('')">选择</button>
      <button @click="onSelectGraph(GraphTypes.Rect)">矩形</button>
      <button @click="onSelectGraph(GraphTypes.Circle)">圆</button>
      <button @click="onSelectGraph(GraphTypes.Line)">线</button>
      <button @click="deleteSelected" :class="{ selected: hasSelection }">删除选中</button>
      <button @click="undo" :disabled="!canUndo">撤销</button>
      <button @click="redo" :disabled="!canRedo">重做</button>
    </div>
    <canvas ref="canvas"></canvas>
  </div>
</template>

<style scoped lang="scss">
.leafer-draw {
  width: 100%;
  height: 100%;
  position: relative;
}
.tool-container {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: #fff;
  padding: 8px 10px;
  box-sizing: border-box;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  display: flex;
  gap: 8px;
  align-items: center;
}

button {
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s;
}

button:hover:not(:disabled) {
  background: #f5f5f5;
  border-color: #999;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

button.selected {
  background: #007bff;
  color: white;
  border-color: #0056b3;
}

button.selected:hover {
  background: #0056b3;
  border-color: #004085;
}
</style>
