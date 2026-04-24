import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const GRID_SIZE = 16

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

export const useEditorStore = defineStore('editor', () => {
  const SYSTEM_ACTIONS = ['idle', 'walk', 'sleep'] as const

  const actions = ref<Action[]>([
    { name: 'idle', frames: [createEmptyFrame()] },
    { name: 'walk', frames: [] },
    { name: 'sleep', frames: [] },
  ])
  const currentActionIndex = ref(0)
  const currentFrameIndex = ref(0)
  const selectedColor = ref('#4ade80')
  const tool = ref<'draw' | 'eyedropper'>('draw')

  const currentAction = computed(() => actions.value[currentActionIndex.value])
  const currentFrame = computed(() => currentAction.value.frames[currentFrameIndex.value])

  function paintCell(row: number, col: number, erase: boolean) {
    currentFrame.value[row][col] = erase ? null : selectedColor.value
  }

  function addFrame() {
    currentAction.value.frames.push(createEmptyFrame())
    currentFrameIndex.value = currentAction.value.frames.length - 1
  }

  function duplicateFrame(index: number) {
    const copy = currentAction.value.frames[index].map((row) => [...row])
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
    if (actions.value[index].frames.length === 0) {
      actions.value[index].frames.push(createEmptyFrame())
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
    selectColor,
    setTool,
    clearFrame,
  }
})
