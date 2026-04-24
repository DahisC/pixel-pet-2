import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

const GRID_SIZE = 16
const STORAGE_KEY = 'pixel-pet-editor'

export type Frame = (string | null)[][]
export interface Action {
  name: string
  frames: Frame[]
}

function createEmptyFrame(): Frame {
  return Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => null),
  )
}

function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h = 0, s = 0
  const l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }
  return [h * 360, s * 100, l * 100]
}

function hslToHex(h: number, s: number, l: number): string {
  h /= 360; s /= 100; l /= 100
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 1 / 2) return q
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
    return p
  }
  let r, g, b
  if (s === 0) {
    r = g = b = l
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }
  return '#' + [r, g, b].map((x) => Math.round(x * 255).toString(16).padStart(2, '0')).join('')
}

const defaultActions: Action[] = [
  { name: 'idle', frames: [createEmptyFrame()] },
  { name: 'walk', frames: [] },
  { name: 'sleep', frames: [] },
]

function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as { actions: Action[]; duration: number }
  } catch {}
  return null
}

export const useEditorStore = defineStore('editor', () => {
  const SYSTEM_ACTIONS = ['idle', 'walk', 'sleep'] as const

  const saved = loadSaved()

  const actions = ref<Action[]>(saved?.actions ?? defaultActions)
  const currentActionIndex = ref(0)
  const currentFrameIndex = ref(0)
  const selectedColor = ref('#4ade80')
  const tool = ref<'draw' | 'eyedropper' | 'fill'>('draw')
  const duration = ref(saved?.duration ?? 1)

  watch(
    () => ({ a: actions.value, d: duration.value }),
    ({ a, d }) => localStorage.setItem(STORAGE_KEY, JSON.stringify({ actions: a, duration: d })),
    { deep: true },
  )

  const currentAction = computed(() => actions.value[currentActionIndex.value]!)
  const currentFrame = computed(() => currentAction.value.frames[currentFrameIndex.value]!)

  function paintCell(row: number, col: number, erase: boolean) {
    if (currentFrame.value[row]) currentFrame.value[row]![col] = erase ? null : selectedColor.value
  }

  function addFrame() {
    currentAction.value.frames.push(createEmptyFrame())
    currentFrameIndex.value = currentAction.value.frames.length - 1
  }

  function duplicateFrame(index: number) {
    const copy = currentAction.value.frames[index]!.map((row) => [...row])
    currentAction.value.frames.splice(index + 1, 0, copy)
    currentFrameIndex.value = index + 1
  }

  function deleteFrame(index: number) {
    if (currentAction.value.frames.length <= 1) return
    currentAction.value.frames.splice(index, 1)
    currentFrameIndex.value = Math.min(index, currentAction.value.frames.length - 1)
  }

  function selectFrame(index: number) {
    currentFrameIndex.value = index
  }

  function selectAction(index: number) {
    currentActionIndex.value = index
    currentFrameIndex.value = 0
    if (actions.value[index]!.frames.length === 0) {
      actions.value[index]!.frames.push(createEmptyFrame())
    }
  }

  function selectColor(color: string) {
    selectedColor.value = color
  }

  function setTool(t: typeof tool.value) {
    tool.value = t
  }

  function clearFrame() {
    currentAction.value.frames[currentFrameIndex.value] = createEmptyFrame()
  }

  function gradientFill(startRow: number, startCol: number) {
    const frame = currentFrame.value
    if (!frame || frame[startRow]?.[startCol] !== null) return

    const interior = new Set<string>()
    const queue: [number, number][] = [[startRow, startCol]]
    const visited = new Set<string>([`${startRow},${startCol}`])

    while (queue.length > 0) {
      const [r, c] = queue.shift()!
      interior.add(`${r},${c}`)
      for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]] as const) {
        const nr = r + dr, nc = c + dc
        if (nr < 0 || nr >= GRID_SIZE || nc < 0 || nc >= GRID_SIZE) continue
        const key = `${nr},${nc}`
        if (visited.has(key)) continue
        visited.add(key)
        if (frame[nr]?.[nc] === null) queue.push([nr, nc])
      }
    }

    const distance = new Map<string, number>()
    const distQueue: [number, number, number][] = []

    for (const key of interior) {
      const [r, c] = key.split(',').map(Number) as [number, number]
      for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]] as const) {
        const nr = r + dr, nc = c + dc
        if (nr < 0 || nr >= GRID_SIZE || nc < 0 || nc >= GRID_SIZE || frame[nr]?.[nc] !== null) {
          if (!distance.has(key)) {
            distance.set(key, 1)
            distQueue.push([r, c, 1])
          }
          break
        }
      }
    }

    let qi = 0, maxDist = 1
    while (qi < distQueue.length) {
      const [r, c, d] = distQueue[qi++]!
      for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]] as const) {
        const nr = r + dr, nc = c + dc
        const key = `${nr},${nc}`
        if (interior.has(key) && !distance.has(key)) {
          distance.set(key, d + 1)
          maxDist = Math.max(maxDist, d + 1)
          distQueue.push([nr, nc, d + 1])
        }
      }
    }

    const [h, s, l] = hexToHsl(selectedColor.value)
    const newFrame = frame.map((row) => [...row])
    for (const [key, d] of distance) {
      const [r, c] = key.split(',').map(Number) as [number, number]
      const t = d / maxDist
      newFrame[r]![c] = hslToHex(h, s, Math.min(92, l + t * 18))
    }

    currentAction.value.frames[currentFrameIndex.value] = newFrame
  }

  return {
    actions,
    currentActionIndex,
    currentFrameIndex,
    currentAction,
    currentFrame,
    selectedColor,
    tool,
    GRID_SIZE,
    paintCell,
    addFrame,
    duplicateFrame,
    deleteFrame,
    selectFrame,
    SYSTEM_ACTIONS,
    selectAction,
    duration,
    selectColor,
    setTool,
    clearFrame,
    gradientFill,
  }
})
