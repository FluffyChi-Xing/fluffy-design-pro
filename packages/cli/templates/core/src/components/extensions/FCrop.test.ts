import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import FCrop from './FCrop.vue'

describe('FCrop', () => {
  it('initializes a full-image crop and emits its dimensions', async () => {
    const wrapper = mount(FCrop, { props: { src: 'image.png' } })
    const image = wrapper.find('img').element
    Object.defineProperties(image, { naturalWidth: { value: 400 }, naturalHeight: { value: 200 } })
    await wrapper.find('img').trigger('load')

    expect(wrapper.emitted('ready')?.[0]).toEqual([{ width: 400, height: 200 }])
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([{ x: 0, y: 0, width: 400, height: 200 }])
  })

  it('exposes reset and marks the crop frame as an accessible control', async () => {
    const wrapper = mount(FCrop, { props: { src: 'image.png', modelValue: { x: 10, y: 10, width: 100, height: 100 } } })
    const image = wrapper.find('img').element
    Object.defineProperties(image, { naturalWidth: { value: 400 }, naturalHeight: { value: 200 } })
    await wrapper.find('img').trigger('load')
    ;(wrapper.vm as unknown as { reset: () => void }).reset()

    expect(wrapper.find('[role="group"]').attributes('aria-label')).toBe('Image crop area')
    expect(wrapper.emitted('change')).toHaveLength(1)
  })
})
