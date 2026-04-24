<script setup lang="ts">
import { computed } from 'vue'
import { usePixelCanvas } from '~/composables/usePixelCanvas'
import { useEditorStore } from '~/stores/useEditorStore'
import { DEFAULT_PET_FRAMES } from '~/data/petSprites'

const SCALE = 8

const store = useEditorStore()

const frames = computed(() => {
  const idleFrames = store.actions.find((a) => a.name === 'idle')?.frames ?? []
  const hasContent = idleFrames.some((f) => f.some((row) => row.some((cell) => cell !== null)))
  return hasContent ? idleFrames : DEFAULT_PET_FRAMES
})

const { canvas, size } = usePixelCanvas(frames, SCALE, computed(() => store.duration * 1000 / frames.value.length))
</script>

<template>
  <canvas
    ref="canvas"
    :width="size * SCALE"
    :height="size * SCALE"
    style="image-rendering: pixelated;"
  />
</template>
