<script setup lang="ts">
import { initEditor, GraphTypes } from './editor'
import { onMounted, ref, useTemplateRef } from 'vue'
import PropertiesPanel from '@/components/PropertiesPanel.vue'

const canvas = useTemplateRef<HTMLCanvasElement>('canvas')
const editor = ref()

onMounted(() => {
  editor.value = initEditor(canvas.value!)
})

function deleteSelected() {
  editor.value?.remove()
}

function undo() {
  editor.value?.undo()
}

function redo() {
  editor.value?.redo()
}

function onSelectGraph(name: string = '') {
  editor.value?.exec(name)
}

function onClear() {
  editor.value?.clear()
}
</script>

<template>
  <div class="leafer-draw">
    <div class="canvas-area">
      <div class="tool-container">
        <button @click="onSelectGraph()">选择</button>
        <button @click="onSelectGraph(GraphTypes.Rect)">矩形</button>
        <button @click="onSelectGraph(GraphTypes.Circle)">椭圆</button>
        <button @click="onSelectGraph(GraphTypes.Line)">直线</button>
        <button @click="onSelectGraph(GraphTypes.Arrow)">箭头</button>
        <button @click="onSelectGraph(GraphTypes.Text)">文本</button>
        <button @click="onSelectGraph(GraphTypes.Pen)">画笔</button>
        <button @click="deleteSelected">删除</button>
        <button @click="onClear">清空</button>
        <button @click="undo">撤销</button>
        <button @click="redo">重做</button>
      </div>
      <canvas ref="canvas"></canvas>
    </div>

    <PropertiesPanel :editor="editor" />
  </div>
</template>

<style scoped lang="scss">
.leafer-draw {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  overflow: hidden;
}

.canvas-area {
  position: relative;
  flex: 1;
  min-width: 0;
}
.tool-container {
  position: absolute;
  top: 30px;
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

canvas {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
