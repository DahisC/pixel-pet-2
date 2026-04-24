<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

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
const tool = ref<'draw' | 'eyedropper' | 'erase'>('draw')

const history = ref<(string | null)[][][]>([])

function snapshotGrid(): (string | null)[][] {
  return grid.value.map((row) => [...row])
}

function paintCell(row: number, col: number, erase: boolean) {
  grid.value[row][col] = erase ? null : selectedColor.value
}

function onMouseDown(row: number, col: number, event: MouseEvent) {
  event.preventDefault()
  if (tool.value === 'eyedropper') {
    const color = grid.value[row][col]
    if (color) {
      selectedColor.value = color
      customColor.value = color
    }
    tool.value = 'draw'
    return
  }
  history.value.push(snapshotGrid())
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

function undo() {
  const prev = history.value.pop()
  if (prev) grid.value = prev
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
  history.value.push(snapshotGrid())
  grid.value = createEmptyGrid()
}

function onKeyDown(e: KeyboardEvent) {
  if (e.target instanceof HTMLInputElement) return
  if (e.key === 'q' || e.key === 'Q') tool.value = 'draw'
  if (e.key === 'e' || e.key === 'E') tool.value = tool.value === 'eyedropper' ? 'draw' : 'eyedropper'
  if (e.key === 'z' || e.key === 'Z') undo()
  if (e.key === 'Delete' || e.key === 'Backspace') clearGrid()
}

onMounted(() => window.addEventListener('keydown', onKeyDown))
onUnmounted(() => window.removeEventListener('keydown', onKeyDown))
</script>

<template>
  <div class="page" @mouseup="onMouseUp">
    <header class="header">
      <NuxtLink to="/" class="nav-link">← 首頁</NuxtLink>
      <h1 class="title">像素編輯器</h1>
      <NuxtLink to="/docs" class="nav-link">Docs</NuxtLink>
    </header>

    <!-- 工具列 -->
    <div class="toolbar">
      <div class="tool-group">
        <span class="tool-label">調色盤</span>
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
      </div>

      <div class="tool-divider" />

      <div class="tool-group">
        <span class="tool-label">自訂顏色</span>
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
      </div>

      <div class="tool-divider" />

      <div class="tool-group">
        <span class="tool-label">操作</span>
        <div class="actions-row">
          <button class="btn" :class="tool === 'draw' ? 'btn-active' : 'btn-secondary'" @click="tool = 'draw'">畫筆 <kbd>Q</kbd></button>
          <button class="btn" :class="tool === 'eyedropper' ? 'btn-active' : 'btn-secondary'" @click="tool = tool === 'eyedropper' ? 'draw' : 'eyedropper'">吸色 <kbd>E</kbd></button>
          <button class="btn btn-secondary" :disabled="history.length === 0" @click="undo">上一步 <kbd>Z</kbd></button>
          <button class="btn btn-danger" @click="clearGrid">清除 <kbd>Del</kbd></button>
        </div>
      </div>
    </div>

    <!-- 畫布 -->
    <main class="canvas-area">
      <div
        class="pixel-grid"
        :style="{
          gridTemplateColumns: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
          gridTemplateRows: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
          cursor: tool === 'eyedropper' ? 'cell' : 'crosshair',
        }"
        @mouseleave="onMouseLeaveGrid"
        @contextmenu.prevent
      >
        <template v-for="r in GRID_SIZE" :key="r">
          <div
            v-for="c in GRID_SIZE"
            :key="`${r}-${c}`"
            class="pixel-cell"
            :style="{ backgroundColor: grid[r - 1][c - 1] ?? 'transparent' }"
            @mousedown="(e) => onMouseDown(r - 1, c - 1, e)"
            @mouseenter="(e) => onMouseEnter(r - 1, c - 1, e)"
          />
        </template>
      </div>
    </main>
  </div>
</template>

<style scoped>
.page {
  height: 100vh;
  overflow: hidden;
  background: #1a1a2e;
  color: #e2e8f0;
  font-family: 'Courier New', monospace;
  display: flex;
  flex-direction: column;
}

/* Header */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 24px;
  border-bottom: 1px solid #2d3748;
  flex-shrink: 0;
}

.nav-link {
  color: #4ade80;
  text-decoration: none;
  font-size: 14px;
}

.nav-link:hover {
  text-decoration: underline;
}

.title {
  font-size: 18px;
  font-weight: bold;
  color: #4ade80;
  letter-spacing: 1px;
}

/* 工具列 */
.toolbar {
  display: flex;
  align-items: center;
  gap: 0;
  padding: 16px 32px;
  border-bottom: 1px solid #2d3748;
  flex-shrink: 0;
  flex-wrap: wrap;
  gap: 0;
}

.tool-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 0 32px;
}

.tool-group:first-child {
  padding-left: 0;
}

.tool-divider {
  width: 1px;
  align-self: stretch;
  background: #2d3748;
}

.tool-label {
  font-size: 11px;
  font-weight: bold;
  color: #a0aec0;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.palette {
  display: grid;
  grid-template-columns: repeat(9, 24px);
  gap: 4px;
}

.palette-swatch {
  width: 24px;
  height: 24px;
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

.custom-color-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.color-input {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  padding: 2px;
  background: transparent;
}

.current-color-preview {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: 1px solid #4a5568;
}

.color-label {
  font-size: 12px;
  color: #a0aec0;
  font-family: monospace;
}

.actions-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.actions-row {
  display: flex;
  flex-direction: row;
  gap: 8px;
  align-items: center;
}

kbd {
  font-size: 10px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 3px;
  padding: 1px 4px;
  font-family: monospace;
  opacity: 0.8;
}

.btn {
  padding: 7px 14px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-family: 'Courier New', monospace;
  font-weight: bold;
  letter-spacing: 0.5px;
}

.btn-secondary {
  background: #2d3748;
  color: #a0aec0;
  border: 1px solid #4a5568;
}

.btn-secondary:hover:not(:disabled) {
  background: #3d4a5c;
  color: #e2e8f0;
}

.btn-secondary:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-active {
  background: #4ade80;
  color: #1a1a2e;
  border: 1px solid #4ade80;
}

.btn-danger {
  background: #2d3748;
  color: #fc8181;
  border: 1px solid #fc8181;
}

.btn-danger:hover {
  background: #3d2020;
}

/* 畫布區 */
.canvas-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 0;
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
</style>
