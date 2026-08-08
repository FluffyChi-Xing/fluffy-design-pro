import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import FProgress from '@/components/ui/FProgress.vue'

describe('FProgress', () => {
  it('renders the fill width matching the value', () => {
    const wrapper = mount(FProgress, { props: { value: 40 } })
    expect(wrapper.find('.f-progress-fill').attributes('style')).toContain('width: 40%')
  })

  it('clamps values above max to 100', () => {
    const wrapper = mount(FProgress, { props: { value: 150 } })
    expect(wrapper.find('.f-progress-fill').attributes('style')).toContain('width: 100%')
  })

  it('shows a percentage label when showLabel is set', () => {
    const wrapper = mount(FProgress, { props: { value: 55, showLabel: true } })
    expect(wrapper.text()).toContain('55%')
  })

  it('exposes progressbar semantics', () => {
    const wrapper = mount(FProgress, { props: { value: 33 } })
    expect(wrapper.attributes('role')).toBe('progressbar')
    expect(wrapper.attributes('aria-valuenow')).toBe('33')
  })
})
