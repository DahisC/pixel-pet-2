<script setup lang="ts">
import { usePixelCanvas } from '~/composables/usePixelCanvas'
import { DEFAULT_PET_FRAMES } from '~/data/petSprites'

const SCALE = 8

const { canvas, size } = usePixelCanvas(DEFAULT_PET_FRAMES, SCALE, 400)
</script>

<template>
  <canvas
    ref="canvas"
    :width="size * SCALE"
    :height="size * SCALE"
    style="image-rendering: pixelated;"
  />
</template>
