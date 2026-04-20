<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const canvas = ref<HTMLCanvasElement | null>(null)

const SCALE = 8

// 2 frames: normal → squished (idle bounce)
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

let frameIndex = 0
let timer: ReturnType<typeof setInterval>

function draw(ctx: CanvasRenderingContext2D, frame: (string | null)[][]) {
  ctx.clearRect(0, 0, 16 * SCALE, 16 * SCALE)
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      const color = frame[y][x]
      if (color) {
        ctx.fillStyle = color
        ctx.fillRect(x * SCALE, y * SCALE, SCALE, SCALE)
      }
    }
  }
}

onMounted(() => {
  const ctx = canvas.value?.getContext('2d')
  if (!ctx) return
  draw(ctx, FRAMES[0])
  timer = setInterval(() => {
    frameIndex = (frameIndex + 1) % FRAMES.length
    draw(ctx, FRAMES[frameIndex])
  }, 400)
})

onUnmounted(() => clearInterval(timer))
</script>

<template>
  <canvas
    ref="canvas"
    :width="16 * SCALE"
    :height="16 * SCALE"
    style="image-rendering: pixelated;"
  />
</template>
