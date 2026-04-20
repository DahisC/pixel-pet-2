import { ref, onMounted, onUnmounted } from 'vue'

export function usePixelCanvas(
  frames: (string | null)[][][],
  scale: number,
  interval: number,
) {
  const canvas = ref<HTMLCanvasElement | null>(null)
  const size = frames[0].length

  function draw(ctx: CanvasRenderingContext2D, frame: (string | null)[][]) {
    ctx.clearRect(0, 0, size * scale, size * scale)
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const color = frame[y][x]
        if (color) {
          ctx.fillStyle = color
          ctx.fillRect(x * scale, y * scale, scale, scale)
        }
      }
    }
  }

  onMounted(() => {
    const ctx = canvas.value?.getContext('2d')
    if (!ctx) return
    let frameIndex = 0
    draw(ctx, frames[0])
    const timer = setInterval(() => {
      frameIndex = (frameIndex + 1) % frames.length
      draw(ctx, frames[frameIndex])
    }, interval)
    onUnmounted(() => clearInterval(timer))
  })

  return { canvas, size }
}
