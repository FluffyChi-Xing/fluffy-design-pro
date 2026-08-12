import { defineComponent, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useFloatingWindow } from './useFloatingWindow'

const Harness = defineComponent({
  setup() {
    return useFloatingWindow({ width: 420, height: 640, margin: 16 })
  },
  template: '<button class="handle" @pointerdown="startDrag">drag</button>',
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('useFloatingWindow', () => {
  it('clamps a drag to the visible viewport margins', async () => {
    vi.stubGlobal('innerWidth', 800)
    vi.stubGlobal('innerHeight', 700)
    const callbacks = new Map<number, FrameRequestCallback>()
    let id = 0
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      id += 1
      callbacks.set(id, callback)
      return id
    })
    vi.stubGlobal('cancelAnimationFrame', (frame: number) => callbacks.delete(frame))

    const wrapper = mount(Harness, { attachTo: document.body })
    const handle = wrapper.get('.handle')
    await handle.trigger('pointerdown', { button: 0, clientX: 20, clientY: 20, pointerId: 1 })
    window.dispatchEvent(new PointerEvent('pointermove', { clientX: 2000, clientY: 2000 }))
    for (const callback of callbacks.values()) callback(0)
    await nextTick()

    const style = (wrapper.vm as unknown as { style: Record<string, string> }).style
    expect(style.left).toBe('364px')
    expect(style.top).toBe('44px')
    wrapper.unmount()
  })
})
