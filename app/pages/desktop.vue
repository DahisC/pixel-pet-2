<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useEditorStore } from '~/stores/useEditorStore'
import { usePixelCanvas } from '~/composables/usePixelCanvas'
import { DEFAULT_PET_FRAMES } from '~/data/petSprites'

const SCALE = 8
const PET_PX = 16 * SCALE // 128

const store = useEditorStore()

const walkFrames = computed(() => {
  const frames = store.actions.find(a => a.name === 'walk')?.frames ?? []
  const hasContent = frames.some(f => f.some(row => row.some(cell => cell !== null)))
  return hasContent ? frames : DEFAULT_PET_FRAMES
})

const { canvas } = usePixelCanvas(
  walkFrames,
  SCALE,
  computed(() => store.duration * 1000 / walkFrames.value.length),
)

const petX = ref(0)
const facingLeft = ref(false)
let screenW = 800
let walkTimer: ReturnType<typeof setInterval>

onMounted(async () => {
  try {
    const { getCurrentWindow, LogicalSize, LogicalPosition } = await import('@tauri-apps/api/window')
    const win = getCurrentWindow()
    screenW = window.screen.width
    const screenH = window.screen.height
    await win.setSize(new LogicalSize(screenW, PET_PX))
    await win.setPosition(new LogicalPosition(0, screenH - PET_PX))
  } catch {
    screenW = window.innerWidth
  }

  const SPEED = 2
  walkTimer = setInterval(() => {
    petX.value += facingLeft.value ? -SPEED : SPEED
    if (petX.value >= screenW - PET_PX) facingLeft.value = true
    if (petX.value <= 0) facingLeft.value = false
  }, 16)
})

onUnmounted(() => clearInterval(walkTimer))
</script>

<template>
  <canvas
    ref="canvas"
    :width="PET_PX"
    :height="PET_PX"
    :style="{
      position: 'fixed',
      bottom: '0',
      left: `${petX}px`,
      transform: facingLeft ? 'scaleX(-1)' : 'none',
      imageRendering: 'pixelated',
    }"
  />
</template>

<style>
html, body {
  background: transparent !important;
  overflow: hidden;
}
</style>
