<script setup lang="ts">
import { ref, computed } from 'vue'

const GRID_SIZE = 16
const CELL_SIZE = 24

const PALETTE: string[] = [
  '#1a1a2e',
  '#16213e',
  '#0f3460',
  '#e94560',
  '#f5a623',
  '#f8e71c',
  '#7ed321',
  '#4ade80',
  '#86efac',
  '#22c55e',
  '#4fc3f7',
  '#0288d1',
  '#ce93d8',
  '#ab47bc',
  '#ffffff',
  '#aaaaaa',
  '#555555',
  '#000000',
]

function createEmptyGrid(): (string | null)[][] {
  return Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => null),
  )
}

const grid = ref<(string | null)[][]>(createEmptyGrid())
const selectedColor = ref<string>('#4ade80')
const customColor = ref<string>('#4ade80')
const isPainting = ref(false)

function paintCell(row: number, col: number, erase: boolean) {
  grid.value[row][col] = erase ? null : selectedColor.value
}

function onMouseDown(row: number, col: number, event: MouseEvent) {
  event.preventDefault()
  isPainting.value = true
  paintCell(row, col, event.button === 2)
}

function onMouseEnter(row: number, col: number, event: MouseEvent) {
  if (!isPainting.value) return
  paintCell(row, col, (event.buttons & 2) !== 0)
}

function onMouseUp() {
  isPainting.value = false
}

function onMouseLeaveGrid() {
  isPainting.value = false
}

function selectPaletteColor(color: string) {
  selectedColor.value = color
  customColor.value = color
}

function onCustomColorChange(event: Event) {
  const value = (event.target as HTMLInputElement).value
  customColor.value = value
  selectedColor.value = value
}

function clearGrid() {
  grid.value = createEmptyGrid()
}

const exportedJson = computed<string>(() => {
  const rows = grid.value.map((row) => {
    const cells = row.map((cell) => (cell === null ? 'null' : `'${cell}'`))
    return `  [${cells.join(',')}]`
  })
  return `[\n${rows.join(',\n')}\n]`
})

const copied = ref(false)

async function copyToClipboard() {
  try {
    await navigator.clipboard.writeText(exportedJson.value)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 1500)
  } catch {
    // fallback: select textarea
    const ta = document.querySelector<HTMLTextAreaElement>('.export-textarea')
    if (ta) {
      ta.select()
      document.execCommand('copy')
    }
  }
}
</script>

<template>
  <div class="page" @mouseup="onMouseUp">
    <header class="header">
      <a href="/" class="back-link">← 返回</a>
      <h1 class="title">像素編輯器</h1>
    </header>

    <main class="editor">
      <!-- 畫布 -->
      <div class="canvas-wrap">
        <div
          class="pixel-grid"
          :style="{
            gridTemplateColumns: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
            gridTemplateRows: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
          }"
          @mouseleave="onMouseLeaveGrid"
          @contextmenu.prevent
        >
          <template v-for="r in GRID_SIZE" :key="r">
            <div
              v-for="c in GRID_SIZE"
              :key="`${r}-${c}`"
              class="pixel-cell"
              :style="{
                backgroundColor: grid[r - 1][c - 1] ?? 'transparent',
              }"
              @mousedown="(e) => onMouseDown(r - 1, c - 1, e)"
              @mouseenter="(e) => onMouseEnter(r - 1, c - 1, e)"
            />
          </template>
        </div>
      </div>

      <!-- 工具列 -->
      <aside class="sidebar">
        <!-- 調色盤 -->
        <section class="section">
          <h2 class="section-title">調色盤</h2>
          <div class="palette">
            <button
              v-for="color in PALETTE"
              :key="color"
              class="palette-swatch"
              :class="{ selected: selectedColor === color }"
              :style="{ backgroundColor: color }"
              :aria-label="color"
              @click="selectPaletteColor(color)"
            />
          </div>
        </section>

        <!-- 自訂顏色 -->
        <section class="section">
          <h2 class="section-title">自訂顏色</h2>
          <div class="custom-color-row">
            <input
              type="color"
              class="color-input"
              :value="customColor"
              @input="onCustomColorChange"
            />
            <div
              class="current-color-preview"
              :style="{ backgroundColor: selectedColor }"
            />
            <span class="color-label">{{ selectedColor }}</span>
          </div>
        </section>

        <!-- 操作 -->
        <section class="section">
          <h2 class="section-title">操作</h2>
          <p class="hint">左鍵塗色 &nbsp;|&nbsp; 右鍵清除</p>
          <button class="btn btn-danger" @click="clearGrid">清除畫布</button>
        </section>

        <!-- 匯出 -->
        <section class="section export-section">
          <h2 class="section-title">匯出資料</h2>
          <p class="hint">格式符合 petSprites.ts 的單幀資料</p>
          <textarea
            class="export-textarea"
            readonly
            :value="exportedJson"
            spellcheck="false"
          />
          <button class="btn btn-primary" @click="copyToClipboard">
            {{ copied ? '已複製！' : '複製到剪貼簿' }}
          </button>
        </section>
      </aside>
    </main>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: #1a1a2e;
  color: #e2e8f0;
  font-family: 'Courier New', monospace;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 24px;
  border-bottom: 1px solid #2d3748;
}

.back-link {
  color: #4ade80;
  text-decoration: none;
  font-size: 14px;
}

.back-link:hover {
  text-decoration: underline;
}

.title {
  font-size: 20px;
  font-weight: bold;
  color: #4ade80;
  letter-spacing: 1px;
}

.editor {
  display: flex;
  flex: 1;
  gap: 24px;
  padding: 24px;
  align-items: flex-start;
  flex-wrap: wrap;
}

/* 畫布 */
.canvas-wrap {
  flex-shrink: 0;
}

.pixel-grid {
  display: grid;
  border: 1px solid #4a5568;
  cursor: crosshair;
  user-select: none;
}

.pixel-cell {
  width: 24px;
  height: 24px;
  border: 0.5px solid rgba(74, 85, 104, 0.4);
  box-sizing: border-box;
}

.pixel-cell:hover {
  outline: 1px solid rgba(74, 213, 128, 0.6);
  outline-offset: -1px;
  z-index: 1;
  position: relative;
}

/* 側欄 */
.sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 220px;
  max-width: 280px;
}

.section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-title {
  font-size: 12px;
  font-weight: bold;
  color: #a0aec0;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* 調色盤 */
.palette {
  display: grid;
  grid-template-columns: repeat(6, 28px);
  gap: 4px;
}

.palette-swatch {
  width: 28px;
  height: 28px;
  border: 2px solid transparent;
  border-radius: 3px;
  cursor: pointer;
  padding: 0;
}

.palette-swatch:hover {
  border-color: #a0aec0;
}

.palette-swatch.selected {
  border-color: #4ade80;
  box-shadow: 0 0 0 1px #4ade80;
}

/* 自訂顏色 */
.custom-color-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.color-input {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  padding: 2px;
  background: transparent;
}

.current-color-preview {
  width: 28px;
  height: 28px;
  border-radius: 4px;
  border: 1px solid #4a5568;
}

.color-label {
  font-size: 13px;
  color: #a0aec0;
  font-family: monospace;
}

/* 提示 */
.hint {
  font-size: 12px;
  color: #718096;
}

/* 按鈕 */
.btn {
  padding: 8px 14px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  font-family: 'Courier New', monospace;
  font-weight: bold;
  letter-spacing: 0.5px;
}

.btn-primary {
  background: #4ade80;
  color: #1a1a2e;
}

.btn-primary:hover {
  background: #22c55e;
}

.btn-danger {
  background: #2d3748;
  color: #fc8181;
  border: 1px solid #fc8181;
}

.btn-danger:hover {
  background: #3d2020;
}

/* 匯出區塊 */
.export-section {
  flex: 1;
}

.export-textarea {
  width: 100%;
  height: 200px;
  background: #0d1117;
  color: #a0aec0;
  border: 1px solid #2d3748;
  border-radius: 4px;
  padding: 10px;
  font-size: 11px;
  font-family: monospace;
  resize: vertical;
  line-height: 1.4;
}
</style>
