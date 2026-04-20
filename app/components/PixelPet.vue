<script setup lang="ts">
import { usePixelCanvas } from '~/composables/usePixelCanvas'

const SCALE = 8

const FRAMES: (string | null)[][][] = [
  [
    [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
    [null,null,null,null,null,null,'#4ade80','#4ade80','#4ade80','#4ade80',null,null,null,null,null,null],
    [null,null,null,null,'#4ade80','#4ade80','#4ade80','#4ade80','#4ade80','#4ade80','#4ade80','#4ade80',null,null,null,null],
    [null,null,null,'#4ade80','#4ade80','#86efac','#4ade80','#4ade80','#4ade80','#4ade80','#86efac','#4ade80','#4ade80',null,null,null],
    [null,null,'#4ade80','#4ade80','#4ade80','#4ade80','#4ade80','#4ade80','#4ade80','#4ade80','#4ade80','#4ade80','#4ade80','#4ade80',null,null],
    [null,null,'#4ade80','#4ade80','#4ade80','#1a1a2e','#1a1a2e','#4ade80','#4ade80','#1a1a2e','#1a1a2e','#4ade80','#4ade80','#4ade80',null,null],
    [null,null,'#4ade80','#4ade80','#4ade80','#1a1a2e','#1a1a2e','#4ade80','#4ade80','#1a1a2e','#1a1a2e','#4ade80','#4ade80','#4ade80',null,null],
    [null,null,'#4ade80','#4ade80','#4ade80','#4ade80','#4ade80','#4ade80','#4ade80','#4ade80','#4ade80','#4ade80','#4ade80','#4ade80',null,null],
    [null,null,'#4ade80','#4ade80','#4ade80','#4ade80','#4ade80','#4ade80','#4ade80','#4ade80','#4ade80','#4ade80','#4ade80','#4ade80',null,null],
    [null,null,'#4ade80','#4ade80','#4ade80','#4ade80','#4ade80','#4ade80','#4ade80','#4ade80','#4ade80','#4ade80','#4ade80','#4ade80',null,null],
    [null,null,null,'#4ade80','#4ade80','#22c55e','#4ade80','#4ade80','#4ade80','#4ade80','#22c55e','#4ade80','#4ade80',null,null,null],
    [null,null,null,null,'#4ade80','#4ade80','#4ade80','#4ade80','#4ade80','#4ade80','#4ade80','#4ade80',null,null,null,null],
    [null,null,null,null,'#4ade80','#4ade80','#4ade80','#4ade80','#4ade80','#4ade80','#4ade80','#4ade80',null,null,null,null],
    [null,null,null,null,null,'#4ade80','#4ade80','#4ade80','#4ade80','#4ade80','#4ade80',null,null,null,null,null],
    [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
    [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
  ],
  [
    [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
    [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
    [null,null,null,null,null,null,'#4ade80','#4ade80','#4ade80','#4ade80',null,null,null,null,null,null],
    [null,null,null,'#4ade80','#4ade80','#4ade80','#4ade80','#4ade80','#4ade80','#4ade80','#4ade80','#4ade80','#4ade80',null,null,null],
    [null,null,'#4ade80','#4ade80','#86efac','#4ade80','#4ade80','#4ade80','#4ade80','#4ade80','#4ade80','#86efac','#4ade80','#4ade80',null,null],
    [null,'#4ade80','#4ade80','#4ade80','#4ade80','#4ade80','#1a1a2e','#1a1a2e','#4ade80','#1a1a2e','#1a1a2e','#4ade80','#4ade80','#4ade80','#4ade80',null],
    [null,'#4ade80','#4ade80','#4ade80','#4ade80','#4ade80','#1a1a2e','#1a1a2e','#4ade80','#1a1a2e','#1a1a2e','#4ade80','#4ade80','#4ade80','#4ade80',null],
    [null,'#4ade80','#4ade80','#4ade80','#4ade80','#4ade80','#4ade80','#4ade80','#4ade80','#4ade80','#4ade80','#4ade80','#4ade80','#4ade80','#4ade80',null],
    [null,'#4ade80','#4ade80','#4ade80','#4ade80','#4ade80','#4ade80','#4ade80','#4ade80','#4ade80','#4ade80','#4ade80','#4ade80','#4ade80','#4ade80',null],
    [null,null,'#4ade80','#4ade80','#22c55e','#4ade80','#4ade80','#4ade80','#4ade80','#4ade80','#4ade80','#22c55e','#4ade80','#4ade80',null,null],
    [null,null,null,'#4ade80','#4ade80','#4ade80','#4ade80','#4ade80','#4ade80','#4ade80','#4ade80','#4ade80','#4ade80',null,null,null],
    [null,null,null,null,'#4ade80','#4ade80','#4ade80','#4ade80','#4ade80','#4ade80','#4ade80','#4ade80',null,null,null,null],
    [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
    [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
    [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
    [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
  ],
]

const { canvas, size } = usePixelCanvas(FRAMES, SCALE, 400)
</script>

<template>
  <canvas
    ref="canvas"
    :width="size * SCALE"
    :height="size * SCALE"
    style="image-rendering: pixelated;"
  />
</template>
