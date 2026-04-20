<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const canvas = ref<HTMLCanvasElement | null>(null)

const SCALE = 8

const PALETTE: Record<number, string | null> = {
  0: null,        // transparent
  1: '#4ade80',   // body
  2: '#22c55e',   // shadow / underside
  3: '#86efac',   // highlight
  4: '#1a1a2e',   // eye
}

// 2 frames: normal → squished (idle bounce)
const FRAMES: number[][][] = [
  [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0],
    [0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0],
    [0,0,0,1,1,3,1,1,1,1,3,1,1,0,0,0],
    [0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
    [0,0,1,1,1,4,4,1,1,4,4,1,1,1,0,0],
    [0,0,1,1,1,4,4,1,1,4,4,1,1,1,0,0],
    [0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
    [0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
    [0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
    [0,0,0,1,1,2,1,1,1,1,2,1,1,0,0,0],
    [0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0],
    [0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0],
    [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  ],
  [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0],
    [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],
    [0,0,1,1,3,1,1,1,1,1,1,3,1,1,0,0],
    [0,1,1,1,1,1,4,4,1,4,4,1,1,1,1,0],
    [0,1,1,1,1,1,4,4,1,4,4,1,1,1,1,0],
    [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
    [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
    [0,0,1,1,2,1,1,1,1,1,1,2,1,1,0,0],
    [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],
    [0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  ],
]

let frameIndex = 0
let timer: ReturnType<typeof setInterval>

function draw(ctx: CanvasRenderingContext2D, frame: number[][]) {
  ctx.clearRect(0, 0, 16 * SCALE, 16 * SCALE)
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      const color = PALETTE[frame[y][x]]
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
