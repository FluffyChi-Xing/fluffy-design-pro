import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import FMasonry from './FMasonry.vue'

describe('FMasonry', () => {
  it('renders slot items in source order with fixed columns and gaps', () => {
    const wrapper = mount(FMasonry, { props: { columns: 3, gap: 20, ariaLabel: 'Gallery' }, slots: { default: '<article>One</article><article>Two</article>' } })
    expect(wrapper.attributes('aria-label')).toBe('Gallery')
    expect(wrapper.attributes('style')).toContain('column-count: 3')
    expect(wrapper.attributes('style')).toContain('column-gap: 20px')
    expect(wrapper.findAll('article').map(item => item.text())).toEqual(['One', 'Two'])
  })

  it('exposes refresh for host content changes', () => {
    const wrapper = mount(FMasonry)
    expect(typeof (wrapper.vm as unknown as { refresh: unknown }).refresh).toBe('function')
  })
})
