import { beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import FUpload from '@/components/ui/FUpload.vue'

describe('FUpload', () => {
  beforeEach(() => setActivePinia(createPinia()))

  function mountUpload(props: Record<string, unknown> = {}) {
    return mount(FUpload, { props, global: { mocks: { $t: (key: string) => key } } })
  }

  it('renders a dropzone and a hidden file input', () => {
    const wrapper = mountUpload()
    expect(wrapper.find('.f-upload-dropzone').exists()).toBe(true)
    expect(wrapper.find('input[type="file"]').attributes('hidden')).toBeDefined()
  })

  it('passes accept and multiple through to the input', () => {
    const wrapper = mountUpload({ accept: ['image/png', 'image/jpeg'], multiple: false })
    const input = wrapper.find('input[type="file"]')
    expect(input.attributes('accept')).toBe('image/png,image/jpeg')
    expect(input.attributes('multiple')).toBeUndefined()
  })

  it('renders an optional hint', () => {
    const wrapper = mountUpload({ hint: 'max 10MB' })
    expect(wrapper.text()).toContain('max 10MB')
  })
})
