import { ref, computed, watch, onMounted, onUnmounted, type MaybeRefOrGetter, toValue } from 'vue'

export function usePixelCanvas(
  frames: MaybeRefOrGetter<(string | null)[][][]>,
  scale: number,
  interval: MaybeRefOrGetter<number>,
) {
  const canvas = ref<HTMLCanvasElement | null>(null)
  const size = computed(() => toValue(frames)[0]?.length ?? 16)

  function draw(ctx: CanvasRenderingContext2D, frame: (string | null)[][]) {
    const s = size.value
    ctx.clearRect(0, 0, s * scale, s * scale)
    for (let y = 0; y < s; y++) {
      for (let x = 0; x < s; x++) {
        const color = frame[y]?.[x]
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
    let timer: ReturnType<typeof setInterval>

    function redraw() {
      const f = toValue(frames)
      const frame = f[frameIndex % f.length]
      if (frame) draw(ctx!, frame)
    }

    function restartTimer() {
      clearInterval(timer)
      timer = setInterval(() => {
        frameIndex = (frameIndex + 1) % toValue(frames).length
        redraw()
      }, toValue(interval))
    }

    redraw()
    restartTimer()

    watch(() => toValue(frames), () => {
      frameIndex = 0
      redraw()
    }, { deep: true })

    watch(() => toValue(interval), () => {
      frameIndex = 0
      restartTimer()
    })

    onUnmounted(() => clearInterval(timer))
  })

  return { canvas, size }
}
