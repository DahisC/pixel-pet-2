<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useEditorStore } from '~/stores/useEditorStore'

const CELL_SIZE = 24
const PALETTE = [
  '#1a1a2e', '#16213e', '#0f3460', '#e94560',
  '#f5a623', '#f8e71c', '#7ed321', '#4ade80',
  '#86efac', '#22c55e', '#4fc3f7', '#0288d1',
  '#ce93d8', '#ab47bc', '#ffffff', '#aaaaaa',
  '#555555', '#000000',
]

const store = useEditorStore()
const customColor = ref(store.selectedColor)
const isPainting = ref(false)
const history = ref<ReturnType<typeof store.currentFrame>[]>([])

function snapshotFrame() {
  return store.currentFrame.map((row) => [...row])
}

function onMouseDown(row: number, col: number, event: MouseEvent) {
  event.preventDefault()
  if (store.tool === 'eyedropper') {
    const color = store.currentFrame[row][col]
    if (color) {
      store.selectColor(color)
      customColor.value = color
    }
    store.setTool('draw')
    return
  }
  history.value.push(snapshotFrame())
  isPainting.value = true
  store.paintCell(row, col, event.button === 2)
}

function onMouseEnter(row: number, col: number, event: MouseEvent) {
  if (!isPainting.value) return
  store.paintCell(row, col, (event.buttons & 2) !== 0)
}

function onMouseUp() { isPainting.value = false }
function onMouseLeaveGrid() { isPainting.value = false }

function undo() {
  const prev = history.value.pop()
  if (prev) {
    store.currentAction.frames[store.currentFrameIndex] = prev
  }
}

function selectPaletteColor(color: string) {
  store.selectColor(color)
  customColor.value = color
}

function onCustomColorChange(event: Event) {
  const value = (event.target as HTMLInputElement).value
  customColor.value = value
  store.selectColor(value)
}

function clearGrid() {
  history.value.push(snapshotFrame())
  store.clearFrame()
}

function onKeyDown(e: KeyboardEvent) {
  if (e.target instanceof HTMLInputElement) return
  if (e.key === 'q' || e.key === 'Q') store.setTool('draw')
  if (e.key === 'e' || e.key === 'E') store.setTool(store.tool === 'eyedropper' ? 'draw' : 'eyedropper')
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
            :class="{ selected: store.selectedColor === color }"
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
          <input type="color" class="color-input" :value="customColor" @input="onCustomColorChange" />
          <div class="current-color-preview" :style="{ backgroundColor: store.selectedColor }" />
          <span class="color-label">{{ store.selectedColor }}</span>
        </div>
      </div>

      <div class="tool-divider" />

      <div class="tool-divider" />

      <div class="tool-group">
        <span class="tool-label">動作</span>
        <div class="actions-row">
          <button
            v-for="(action, i) in store.actions"
            :key="i"
            class="action-tab"
            :class="{ active: i === store.currentActionIndex }"
            @click="store.selectAction(i)"
          >{{ action.name }}</button>
        </div>
      </div>

      <div class="tool-divider" />

      <div class="tool-group">
        <span class="tool-label">操作</span>
        <div class="actions-row">
          <button class="btn" :class="store.tool === 'draw' ? 'btn-active' : 'btn-secondary'" @click="store.setTool('draw')">畫筆 <kbd>Q</kbd></button>
          <button class="btn" :class="store.tool === 'eyedropper' ? 'btn-active' : 'btn-secondary'" @click="store.setTool(store.tool === 'eyedropper' ? 'draw' : 'eyedropper')">吸色 <kbd>E</kbd></button>
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
          gridTemplateColumns: `repeat(${store.GRID_SIZE}, ${CELL_SIZE}px)`,
          gridTemplateRows: `repeat(${store.GRID_SIZE}, ${CELL_SIZE}px)`,
          cursor: store.tool === 'eyedropper' ? 'cell' : 'crosshair',
        }"
        @mouseleave="onMouseLeaveGrid"
        @contextmenu.prevent
      >
        <template v-for="r in store.GRID_SIZE" :key="r">
          <div
            v-for="c in store.GRID_SIZE"
            :key="`${r}-${c}`"
            class="pixel-cell"
            :style="{ backgroundColor: store.currentFrame[r - 1][c - 1] ?? 'transparent' }"
            @mousedown="(e) => onMouseDown(r - 1, c - 1, e)"
            @mouseenter="(e) => onMouseEnter(r - 1, c - 1, e)"
          />
        </template>
      </div>
    </main>

    <!-- 幀列表 -->
    <div class="frame-panel">
      <div class="frame-list">
        <div
          v-for="(frame, i) in store.currentAction.frames"
          :key="i"
          class="frame-item"
          :class="{ active: i === store.currentFrameIndex }"
          @click="store.selectFrame(i)"
        >
          <FrameThumbnail :frame="frame" />
          <span class="frame-index">{{ i + 1 }}</span>
          <div class="frame-actions">
            <button class="frame-btn" title="複製" @click.stop="store.duplicateFrame(i)">⧉</button>
            <button
              class="frame-btn frame-btn-danger"
              title="刪除"
              :disabled="store.currentAction.frames.length <= 1"
              @click.stop="store.deleteFrame(i)"
            >✕</button>
          </div>
        </div>

        <button class="frame-add" @click="store.addFrame()">＋ 新增幀</button>
      </div>
    </div>
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

.nav-link:hover { text-decoration: underline; }

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
  padding: 16px 32px;
  border-bottom: 1px solid #2d3748;
  flex-shrink: 0;
  gap: 0;
}

.tool-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 0 32px;
}

.tool-group:first-child { padding-left: 0; }

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

.palette-swatch:hover { border-color: #a0aec0; }
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

.btn-danger:hover { background: #3d2020; }

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

/* 幀列表 */
.frame-panel {
  flex-shrink: 0;
  border-top: 1px solid #2d3748;
  padding: 12px 24px;
  background: #16213e;
}

.frame-list {
  display: flex;
  gap: 8px;
  overflow-x: auto;
}

.frame-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  padding: 6px;
  border-radius: 4px;
  border: 2px solid transparent;
  background: #1a1a2e;
  flex-shrink: 0;
}

.frame-item:hover { border-color: #4a5568; }
.frame-item.active { border-color: #4ade80; }

.frame-index {
  font-size: 10px;
  color: #718096;
}

.frame-actions {
  display: flex;
  gap: 2px;
}

.frame-btn {
  background: transparent;
  border: none;
  color: #718096;
  cursor: pointer;
  font-size: 11px;
  padding: 1px 4px;
  border-radius: 3px;
  line-height: 1;
}

.frame-btn:hover { background: #2d3748; color: #e2e8f0; }
.frame-btn-danger:hover { color: #fc8181; }
.frame-btn:disabled { opacity: 0.3; cursor: not-allowed; }

.frame-add {
  flex-shrink: 0;
  align-self: center;
  background: transparent;
  border: 1px dashed #4a5568;
  color: #718096;
  cursor: pointer;
  font-size: 12px;
  font-family: 'Courier New', monospace;
  padding: 6px 12px;
  border-radius: 4px;
  white-space: nowrap;
}

.frame-add:hover { border-color: #4ade80; color: #4ade80; }

.action-tab {
  padding: 5px 14px;
  border-radius: 4px;
  border: 1px solid #4a5568;
  background: #1a1a2e;
  cursor: pointer;
  font-size: 12px;
  font-family: 'Courier New', monospace;
  color: #a0aec0;
}

.action-tab:hover { border-color: #718096; color: #e2e8f0; }
.action-tab.active { border-color: #4ade80; color: #4ade80; }
</style>
