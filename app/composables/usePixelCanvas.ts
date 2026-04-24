import { ref, computed, watch, onMounted, onUnmounted, type MaybeRefOrGetter, toValue } from 'vue'

export function usePixelCanvas(
  frames: MaybeRefOrGetter<(string | null)[][][]>,
  scale: number,
  interval: number,
) {
  const canvas = ref<HTMLCanvasElement | null>(null)
  const size = computed(() => toValue(frames)[0].length)

  function draw(ctx: CanvasRenderingContext2D, frame: (string | null)[][]) {
    const s = size.value
    ctx.clearRect(0, 0, s * scale, s * scale)
    for (let y = 0; y < s; y++) {
      for (let x = 0; x < s; x++) {
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

    function redraw() {
      const f = toValue(frames)
      draw(ctx!, f[frameIndex % f.length])
    }

    redraw()

    watch(() => toValue(frames), () => {
      frameIndex = 0
      redraw()
    }, { deep: true })

    const timer = setInterval(() => {
      frameIndex = (frameIndex + 1) % toValue(frames).length
      redraw()
    }, interval)

    onUnmounted(() => clearInterval(timer))
  })

  return { canvas, size }
}
