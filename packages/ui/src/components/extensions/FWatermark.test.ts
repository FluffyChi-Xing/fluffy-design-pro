import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import FWatermark from './FWatermark.vue'

vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => { callback(0); return 1 })
vi.stubGlobal('cancelAnimationFrame', vi.fn())

describe('FWatermark', () => {
  it('renders text as inert literal watermark tiles', async () => {
    const wrapper = mount(FWatermark, { props: { content: '<script>alert(1)</script>', width: 50, height: 40, gapX: 0, gapY: 0 }, slots: { default: '<article>Protected content</article>' } })
    await wrapper.vm.$nextTick()
    expect(wrapper.find('article').text()).toBe('Protected content')
    expect(wrapper.find('[aria-hidden="true"]').text()).toContain('<script>alert(1)</script>')
    expect(wrapper.find('[aria-hidden="true"]').html()).not.toContain('<script>')
  })

  it('supports image watermark tiles and a refresh method', async () => {
    const wrapper = mount(FWatermark, { props: { image: '/mark.png' }, slots: { default: '<div style="height:100px" />' } })
    await wrapper.vm.$nextTick()
    expect(wrapper.find('[aria-hidden="true"] img').attributes('src')).toBe('/mark.png')
    expect(typeof (wrapper.vm as unknown as { refresh: unknown }).refresh).toBe('function')
  })
})
