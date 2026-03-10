<script setup lang="ts">
import { initEditor, GraphTypes } from './editor'
import { computed, onBeforeUnmount, onMounted, ref, useTemplateRef } from 'vue'
import { emitter, Events } from './editor'
import type { GraphLike } from './editor'
import PropertiesPanel from '@/components/PropertiesPanel.vue'

const canvas = useTemplateRef<HTMLCanvasElement>('canvas')
const editor = ref()

onMounted(() => {
  editor.value = initEditor(canvas.value!)
})

const canUndo = ref(false)
const canRedo = ref(false)
const selectionCount = ref(0)
const hasSelection = computed(() => selectionCount.value > 0)
const hasClipboard = computed(() => editor.value?.hasClipboard ?? false)

function handleSelectionChange(items: unknown[]) {
  selectionCount.value = (items as GraphLike[]).length
}

function handleHistoryChange(payload: unknown) {
  const { canUndo: u, canRedo: r } = payload as { canUndo: boolean; canRedo: boolean }
  canUndo.value = u
  canRedo.value = r
}

onMounted(() => {
  emitter.on(Events.SELECTION_CHANGE, handleSelectionChange)
  emitter.on(Events.HISTORY_CHANGE, handleHistoryChange)
})

onBeforeUnmount(() => {
  emitter.off(Events.SELECTION_CHANGE, handleSelectionChange)
  emitter.off(Events.HISTORY_CHANGE, handleHistoryChange)
  window.removeEventListener('keydown', handleKeydown)
})

function selectAll() {
  editor.value?.selectAll()
}

function deleteSelected() {
  editor.value?.remove()
}

function copy() {
  editor.value?.copy()
}

function paste() {
  editor.value?.paste()
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

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  if (target.isContentEditable) return true
  const tag = target.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT'
}

function handleKeydown(e: KeyboardEvent) {
  if (!editor.value) return
  if (isTypingTarget(e.target)) return

  const key = e.key.toLowerCase()
  const withCommand = e.metaKey || e.ctrlKey

  if (withCommand && key === 'z') {
    e.preventDefault()
    if (e.shiftKey) {
      redo()
    } else {
      undo()
    }
    return
  }

  if (withCommand && key === 'y') {
    e.preventDefault()
    redo()
    return
  }

  if (withCommand && key === 'c') {
    e.preventDefault()
    copy()
    return
  }

  if (withCommand && key === 'v') {
    e.preventDefault()
    paste()
    return
  }

  if (withCommand && key === 'a') {
    e.preventDefault()
    selectAll()
    return
  }

  if (key === 'delete' || key === 'backspace') {
    e.preventDefault()
    deleteSelected()
    return
  }

  if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return

  if (key === 'escape') {
    onSelectGraph()
    return
  }

  const toolMap: Record<string, string> = {
    r: GraphTypes.Rect,
    o: GraphTypes.Circle,
    l: GraphTypes.Line,
    a: GraphTypes.Arrow,
    t: GraphTypes.Text,
    p: GraphTypes.Pen,
  }

  const tool = toolMap[key]
  if (!tool) return
  onSelectGraph(tool)
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})
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
        <button @click="deleteSelected" :disabled="!hasSelection">删除</button>
        <button @click="onClear">清空</button>
        <button @click="copy" :disabled="!hasSelection">复制</button>
        <button @click="paste" :disabled="!hasClipboard">粘贴</button>
        <button @click="selectAll" :disabled="!hasSelection">全选</button>
        <button @click="undo" :disabled="!canUndo">撤销</button>
        <button @click="redo" :disabled="!canRedo">重做</button>
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
