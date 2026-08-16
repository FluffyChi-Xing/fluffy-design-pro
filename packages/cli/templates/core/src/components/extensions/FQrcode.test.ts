import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import FQrcode from './FQrcode.vue'

const context = { setTransform: vi.fn(), fillRect: vi.fn(), fillStyle: '' }

beforeEach(() => {
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context as unknown as CanvasRenderingContext2D)
  vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue('data:image/png;base64,qr')
  vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation((callback) => callback(new Blob()))
})

describe('FQrcode', () => {
  it('renders an accessible canvas and exposes canvas exports', async () => {
    const wrapper = mount(FQrcode, { props: { value: 'https://example.test', size: 128, ariaLabel: 'Example code' } })
    await wrapper.vm.$nextTick()
    expect(wrapper.find('canvas').attributes('role')).toBe('img')
    expect(wrapper.find('canvas').attributes('aria-label')).toBe('Example code')
    expect((wrapper.vm as unknown as { toDataURL: () => string }).toDataURL()).toContain('data:image')
  })

  it('reports a missing value', async () => {
    const wrapper = mount(FQrcode, { props: { value: '' } })
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('error')).toHaveLength(1)
    expect(wrapper.find('[role="status"]').text()).toContain('required')
  })
})
