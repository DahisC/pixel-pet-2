<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import type { Frame } from '~/stores/useEditorStore'

const props = defineProps<{ frame: Frame; size?: number }>()

const SCALE = 2
const canvas = ref<HTMLCanvasElement | null>(null)

function draw() {
  const ctx = canvas.value?.getContext('2d')
  if (!ctx) return
  const s = (props.size ?? 16) * SCALE
  ctx.clearRect(0, 0, s, s)
  for (let y = 0; y < props.frame.length; y++) {
    for (let x = 0; x < (props.frame[y]?.length ?? 0); x++) {
      const color = props.frame[y]?.[x]
      if (color) {
        ctx.fillStyle = color
        ctx.fillRect(x * SCALE, y * SCALE, SCALE, SCALE)
      }
    }
  }
}

onMounted(draw)
watch(() => props.frame, draw, { deep: true })
</script>

<template>
  <canvas
    ref="canvas"
    :width="(size ?? 16) * SCALE"
    :height="(size ?? 16) * SCALE"
    class="thumbnail"
  />
</template>

<style scoped>
.thumbnail {
  image-rendering: pixelated;
  display: block;
}
</style>
