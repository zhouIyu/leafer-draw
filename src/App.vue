<script setup lang="ts">
import { initEditor } from './editor'
import { onMounted, ref, useTemplateRef } from 'vue'

const canvas = useTemplateRef<HTMLCanvasElement>('canvas')
const editor = ref()
onMounted(() => {
  editor.value = initEditor(canvas.value!)
})

function addRect() {
  editor.value.addRect()
}

function removeRect() {
  editor.value.removeRect()
}

function undo() {
  editor.value.undo()
}

function redo() {
  editor.value.redo()
}
</script>

<template>
  <div class="leafer-draw">
    <div class="tool-container">
      <button @click="addRect">矩形</button>
      <button @click="removeRect">删除</button>
      <button @click="undo">撤销</button>
      <button @click="redo">重做</button>
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
}
</style>
