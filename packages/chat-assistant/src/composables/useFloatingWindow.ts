import { computed, onBeforeUnmount, onMounted, reactive, shallowRef } from 'vue'

export interface FloatingWindowOptions {
  width?: number
  height?: number
  margin?: number
  snapDistance?: number
}

interface Geometry {
  left: number
  top: number
  width: number
  height: number
}

function viewport() {
  const visualViewport = window.visualViewport
  return {
    width: visualViewport?.width ?? window.innerWidth,
    height: visualViewport?.height ?? window.innerHeight,
  }
}

export function useFloatingWindow(options: FloatingWindowOptions = {}) {
  const width = options.width ?? 420
  const height = options.height ?? 640
  const margin = options.margin ?? 16
  const snapDistance = options.snapDistance ?? 24
  const geometry = reactive<Geometry>({ left: 0, top: 0, width, height })
  const fullscreen = shallowRef(false)
  const dragging = shallowRef(false)
  const positioned = shallowRef(false)
  const restoreGeometry = shallowRef<Geometry>()
  const restorePositioned = shallowRef(false)
  let pointerOffset = { x: 0, y: 0 }
  let latestPointer: { x: number; y: number } | undefined
  let dragFrame: number | undefined

  function effectiveSize() {
    const currentViewport = viewport()
    return {
      width: Math.min(geometry.width, Math.max(0, currentViewport.width - margin * 2)),
      height: Math.min(geometry.height, Math.max(0, currentViewport.height - margin * 2)),
    }
  }

  function clamp() {
    const currentViewport = viewport()
    const size = effectiveSize()
    const maxLeft = Math.max(margin, currentViewport.width - size.width - margin)
    const maxTop = Math.max(margin, currentViewport.height - size.height - margin)
    geometry.left = Math.min(Math.max(geometry.left, margin), maxLeft)
    geometry.top = Math.min(Math.max(geometry.top, margin), maxTop)
  }

  function resetPosition() {
    const currentViewport = viewport()
    const size = effectiveSize()
    geometry.left = Math.max(margin, currentViewport.width - size.width - margin)
    geometry.top = Math.max(margin, currentViewport.height - size.height - margin)
    positioned.value = true
    clamp()
  }

  function snap() {
    const currentViewport = viewport()
    const size = effectiveSize()
    const distances = [
      { edge: 'left', value: geometry.left - margin },
      { edge: 'right', value: currentViewport.width - margin - (geometry.left + size.width) },
      { edge: 'top', value: geometry.top - margin },
      { edge: 'bottom', value: currentViewport.height - margin - (geometry.top + size.height) },
    ] as const
    const nearest = distances.reduce((current, candidate) => candidate.value < current.value ? candidate : current)
    if (nearest.value > snapDistance) return

    if (nearest.edge === 'left') geometry.left = margin
    if (nearest.edge === 'right') geometry.left = Math.max(margin, currentViewport.width - size.width - margin)
    if (nearest.edge === 'top') geometry.top = margin
    if (nearest.edge === 'bottom') geometry.top = Math.max(margin, currentViewport.height - size.height - margin)
    clamp()
  }

  function applyPointerPosition() {
    dragFrame = undefined
    if (!latestPointer || !dragging.value || fullscreen.value) return
    geometry.left = latestPointer.x - pointerOffset.x
    geometry.top = latestPointer.y - pointerOffset.y
    clamp()
  }

  function schedulePointerPosition() {
    if (dragFrame !== undefined) return
    dragFrame = requestAnimationFrame(applyPointerPosition)
  }

  function flushPointerPosition() {
    if (dragFrame !== undefined) {
      cancelAnimationFrame(dragFrame)
      dragFrame = undefined
    }
    applyPointerPosition()
  }

  function onPointerMove(event: PointerEvent) {
    if (!dragging.value || fullscreen.value) return
    const events = event.getCoalescedEvents?.() ?? [event]
    const latestEvent = events.at(-1) ?? event
    latestPointer = { x: latestEvent.clientX, y: latestEvent.clientY }
    schedulePointerPosition()
  }

  function onPointerUp() {
    if (!dragging.value) return
    flushPointerPosition()
    dragging.value = false
    latestPointer = undefined
    snap()
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerup', onPointerUp)
  }

  function startDrag(event: PointerEvent) {
    if (fullscreen.value || event.button !== 0) return
    const target = event.currentTarget as HTMLElement
    if (!positioned.value) {
      const rect = target.closest('.fca-window')?.getBoundingClientRect()
      geometry.left = rect?.left ?? margin
      geometry.top = rect?.top ?? margin
      positioned.value = true
      clamp()
    }
    pointerOffset = { x: event.clientX - geometry.left, y: event.clientY - geometry.top }
    latestPointer = { x: event.clientX, y: event.clientY }
    dragging.value = true
    target.setPointerCapture?.(event.pointerId)
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
  }

  function toggleFullscreen() {
    if (fullscreen.value) {
      fullscreen.value = false
      if (restoreGeometry.value) Object.assign(geometry, restoreGeometry.value)
      positioned.value = restorePositioned.value
      if (positioned.value) clamp()
      return
    }

    restoreGeometry.value = { ...geometry }
    restorePositioned.value = positioned.value
    fullscreen.value = true
  }

  function onResize() {
    if (!fullscreen.value && positioned.value) clamp()
  }

  const style = computed(() => {
    if (fullscreen.value) return { position: 'fixed', inset: '0px', width: '100vw', height: '100dvh' }

    const size = {
      position: 'fixed',
      width: `min(${geometry.width}px, calc(100vw - ${margin * 2}px))`,
      height: `min(${geometry.height}px, calc(100dvh - ${margin * 2}px))`,
    }
    if (!positioned.value) return { ...size, right: `${margin}px`, bottom: `${margin}px` }

    return { ...size, left: `${geometry.left}px`, top: `${geometry.top}px` }
  })

  onMounted(() => {
    window.addEventListener('resize', onResize)
    window.visualViewport?.addEventListener('resize', onResize)
  })
  onBeforeUnmount(() => {
    if (dragFrame !== undefined) cancelAnimationFrame(dragFrame)
    window.removeEventListener('resize', onResize)
    window.visualViewport?.removeEventListener('resize', onResize)
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerup', onPointerUp)
  })

  return { style, fullscreen, dragging, resetPosition, startDrag, toggleFullscreen }
}
