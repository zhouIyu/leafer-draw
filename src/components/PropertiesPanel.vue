<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'

import type { Editor, GraphLike, UpdatableLeafData } from '@/editor'

const props = defineProps<{
  editor?: Editor
}>()

const selected = ref<GraphLike[]>([])
let offSelection: undefined | (() => void)

watch(
  () => props.editor,
  (editor) => {
    offSelection?.()
    offSelection = undefined

    if (!editor) {
      selected.value = []
      return
    }

    offSelection = editor.onSelectionChange((items) => {
      selected.value = items
      syncFormFromSelection(items)
    })
  },
  { immediate: true },
)

onBeforeUnmount(() => offSelection?.())

const primary = computed(() => selected.value[0] as GraphLike | undefined)

const fill = ref('')
const stroke = ref('')
const strokeWidth = ref<number | null>(null)
const text = ref('')
const fontSize = ref<number | null>(null)

function isPlainString(value: unknown): value is string {
  return typeof value === 'string'
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function commonString(items: GraphLike[], key: string) {
  // 多选时：只有“所有选中项该字段一致”才回填值，否则回填空字符串表示“混合值”。
  if (items.length === 0) return ''
  const firstItem = items[0]
  if (!firstItem) return ''
  const first = firstItem[key]
  if (!isPlainString(first)) return ''
  for (const item of items) {
    if (item[key] !== first) return ''
  }
  return first
}

function commonNumber(items: GraphLike[], key: string) {
  // 同上：混合值返回 null，让输入框显示为空。
  if (items.length === 0) return null
  const firstItem = items[0]
  if (!firstItem) return null
  const first = firstItem[key]
  if (!isFiniteNumber(first)) return null
  for (const item of items) {
    if (item[key] !== first) return null
  }
  return first
}

function commonText(items: GraphLike[]) {
  if (items.length === 0) return ''
  const firstItem = items[0]
  if (!firstItem) return ''
  const first = firstItem['text']
  if (!isPlainString(first)) return ''
  for (const item of items) {
    const itemText = item['text']
    if (!isPlainString(itemText) || itemText !== first) return ''
  }
  return first
}

function allSupportText(items: GraphLike[]) {
  if (items.length === 0) return false
  return items.every((item) => 'text' in item)
}

function syncFormFromSelection(items: GraphLike[]) {
  fill.value = commonString(items, 'fill')
  stroke.value = commonString(items, 'stroke')
  strokeWidth.value = commonNumber(items, 'strokeWidth')

  if (allSupportText(items)) {
    text.value = commonText(items)
    fontSize.value = commonNumber(items, 'fontSize')
  } else {
    text.value = ''
    fontSize.value = null
  }
}

function commitAttrs(attrs: Partial<UpdatableLeafData>) {
  const editor = props.editor
  if (!editor) return
  editor.updateAttrs(attrs)
}

const geometry = computed(() => {
  const item = primary.value
  if (!item) return null
  const x = item['x']
  const y = item['y']
  const width = item['width']
  const height = item['height']
  const rotation = item['rotation']
  return {
    x: isFiniteNumber(x) ? x : null,
    y: isFiniteNumber(y) ? y : null,
    width: isFiniteNumber(width) ? width : null,
    height: isFiniteNumber(height) ? height : null,
    rotation: isFiniteNumber(rotation) ? rotation : null,
  }
})

const multiSizes = computed(() => {
  if (selected.value.length <= 1) return []
  return selected.value.map((item, index) => {
    const width = item['width']
    const height = item['height']
    return {
      key: (item['id'] ?? item['name'] ?? item['tag'] ?? index) as string | number,
      index,
      width: isFiniteNumber(width) ? width : null,
      height: isFiniteNumber(height) ? height : null,
    }
  })
})

const showTextSection = computed(() => allSupportText(selected.value))
</script>

<template>
  <aside class="panel">
    <div class="panel-header">
      <div class="title">属性</div>
      <div class="meta">
        <span v-if="selected.length === 0">未选择</span>
        <span v-else>已选择 {{ selected.length }} 个</span>
      </div>
    </div>

    <div v-if="selected.length === 0" class="empty">选择一个图形后，这里会显示可编辑的样式与文本属性。</div>

    <div v-else class="panel-body">
      <section class="section">
        <div class="section-title">几何（只读）</div>
        <div v-if="selected.length === 1" class="grid">
          <div class="row">
            <div class="label">X</div>
            <div class="value">{{ geometry?.x ?? '—' }}</div>
          </div>
          <div class="row">
            <div class="label">Y</div>
            <div class="value">{{ geometry?.y ?? '—' }}</div>
          </div>
          <div class="row">
            <div class="label">W</div>
            <div class="value">{{ geometry?.width ?? '—' }}</div>
          </div>
          <div class="row">
            <div class="label">H</div>
            <div class="value">{{ geometry?.height ?? '—' }}</div>
          </div>
          <div class="row">
            <div class="label">R</div>
            <div class="value">{{ geometry?.rotation ?? '—' }}</div>
          </div>
        </div>

        <div v-else class="sizes">
          <div class="sizes-head">
            <div class="sizes-col">#</div>
            <div class="sizes-col">W</div>
            <div class="sizes-col">H</div>
          </div>
          <div v-for="row in multiSizes" :key="row.key" class="sizes-row">
            <div class="sizes-col">{{ row.index + 1 }}</div>
            <div class="sizes-col">{{ row.width ?? '—' }}</div>
            <div class="sizes-col">{{ row.height ?? '—' }}</div>
          </div>
        </div>
      </section>

      <section class="section">
        <div class="section-title">样式</div>

        <div class="field">
          <label class="field-label">填充 Fill</label>
          <div class="field-control">
            <input
              class="color"
              type="color"
              v-model="fill"
              @change="
                (e) => {
                  fill = (e.target as HTMLInputElement).value
                  commitAttrs({ fill })
                }
              "
            />
            <input
              class="input"
              type="text"
              v-model="fill"
              placeholder="例如：#ff0000 / transparent"
              @change="commitAttrs({ fill })"
            />
          </div>
        </div>

        <div class="field">
          <label class="field-label">描边 Stroke</label>
          <div class="field-control">
            <input class="color" type="color" v-model="stroke" @change="commitAttrs({ stroke })" />
            <input
              class="input"
              type="text"
              v-model="stroke"
              placeholder="例如：#00aaff / transparent"
              @change="commitAttrs({ stroke })"
            />
          </div>
        </div>

        <div class="field">
          <label class="field-label">描边宽度 StrokeWidth</label>
          <div class="field-control">
            <input
              class="input"
              type="number"
              min="0"
              step="1"
              v-model="strokeWidth"
              @change="
                (e) => {
                  const n = Number((e.target as HTMLInputElement).value)
                  strokeWidth = Number.isFinite(n) ? n : null
                  if (strokeWidth !== null) commitAttrs({ strokeWidth })
                }
              "
            />
          </div>
        </div>
      </section>

      <section v-if="showTextSection" class="section">
        <div class="section-title">文本</div>

        <div class="field">
          <label class="field-label">内容 Text</label>
          <div class="field-control">
            <textarea class="textarea" v-model="text" rows="3" placeholder="文本内容" @change="commitAttrs({ text })" />
          </div>
        </div>

        <div class="field">
          <label class="field-label">字号 FontSize</label>
          <div class="field-control">
            <input
              class="input"
              type="number"
              min="1"
              step="1"
              v-model="fontSize"
              @change="
                (e) => {
                  const n = Number((e.target as HTMLInputElement).value)
                  fontSize = Number.isFinite(n) ? n : null
                  if (fontSize !== null) commitAttrs({ fontSize })
                }
              "
            />
          </div>
        </div>
      </section>
    </div>
  </aside>
</template>

<style scoped lang="scss">
.panel {
  width: 300px;
  height: 100%;
  box-sizing: border-box;
  border-left: 1px solid rgba(0, 0, 0, 0.08);
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
}

.panel-header {
  padding: 14px 14px 10px;
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.title {
  font-size: 14px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.85);
}

.meta {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.5);
}

.empty {
  padding: 14px;
  font-size: 13px;
  color: rgba(0, 0, 0, 0.55);
  line-height: 1.5;
}

.panel-body {
  padding: 14px;
  overflow: auto;
}

.section + .section {
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px dashed rgba(0, 0, 0, 0.08);
}

.section-title {
  font-size: 12px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.75);
  margin-bottom: 10px;
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 10px;
}

.sizes {
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 12px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.8);
}

.sizes-head,
.sizes-row {
  display: grid;
  grid-template-columns: 52px 1fr 1fr;
  gap: 10px;
  padding: 8px 10px;
  align-items: center;
}

.sizes-head {
  background: rgba(0, 0, 0, 0.03);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  font-size: 12px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.65);
}

.sizes-row + .sizes-row {
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}

.sizes-col {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.85);
  font-variant-numeric: tabular-nums;
}

.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.8);
}

.label {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.55);
}

.value {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.85);
  font-variant-numeric: tabular-nums;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 10px;
}

.field-label {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.6);
}

.field-control {
  display: flex;
  gap: 10px;
  align-items: center;
}

.color {
  width: 36px;
  height: 34px;
  padding: 0;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 10px;
  background: transparent;
}

.input {
  flex: 1;
  height: 34px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 10px;
  padding: 0 10px;
  outline: none;
  font-size: 13px;
  background: rgba(255, 255, 255, 0.9);
}

.textarea {
  width: 100%;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 10px;
  padding: 8px 10px;
  outline: none;
  font-size: 13px;
  resize: vertical;
  background: rgba(255, 255, 255, 0.9);
}

.input:focus,
.textarea:focus {
  border-color: rgba(0, 123, 255, 0.5);
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.12);
}
</style>
