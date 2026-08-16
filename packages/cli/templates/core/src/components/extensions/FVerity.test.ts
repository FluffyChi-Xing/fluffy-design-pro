import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import FVerity from './FVerity.vue'

async function slideToEnd(wrapper: ReturnType<typeof mount>) {
  await wrapper.find('input[type="range"]').setValue(100)
}

describe('FVerity', () => {
  it('verifies an attempt and emits the controlled model value', async () => {
    const verify = vi.fn(async () => true)
    const wrapper = mount(FVerity, { props: { verify, ariaLabel: 'Human verification' } })

    await slideToEnd(wrapper)

    expect(verify).toHaveBeenCalledOnce()
    expect(wrapper.emitted('attempt')).toHaveLength(1)
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([true])
    expect(wrapper.emitted('verified')).toHaveLength(1)
    expect(wrapper.find('input').attributes('disabled')).toBeDefined()
    expect(wrapper.find('[aria-live="polite"]').text()).toBe('Verification complete')
    expect(wrapper.find('input').attributes('aria-label')).toBe('Human verification')
  })

  it('resets and reports a rejected verification without an unhandled error', async () => {
    const wrapper = mount(FVerity, { props: { verify: async () => false } })

    await slideToEnd(wrapper)

    expect(wrapper.find('input').element.value).toBe('0')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false])
    expect(wrapper.emitted('failed')).toHaveLength(1)
    expect(wrapper.find('[aria-live="polite"]').text()).toBe('Verification failed. Try again.')
  })

  it('locks the control while an asynchronous verification is pending', async () => {
    let resolve!: (value: boolean) => void
    const verify = vi.fn(() => new Promise<boolean>((done) => { resolve = done }))
    const wrapper = mount(FVerity, { props: { verify } })

    await slideToEnd(wrapper)

    expect(wrapper.find('input').attributes('disabled')).toBeDefined()
    expect(wrapper.find('[aria-live="polite"]').text()).toBe('Verifying…')

    resolve(true)
    await Promise.resolve()
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('verified')).toHaveLength(1)
  })

  it('supports explicit reset and parent-driven resets', async () => {
    const wrapper = mount(FVerity, { props: { modelValue: true, resetKey: 1 } })

    expect(wrapper.find('input').element.value).toBe('100')
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('reset')).toHaveLength(1)
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false])

    await wrapper.setProps({ modelValue: false, resetKey: 2 })
    expect(wrapper.find('input').element.value).toBe('0')
  })

  it('keeps controls inert when disabled and retains semantic controls', async () => {
    const verify = vi.fn(async () => true)
    const wrapper = mount(FVerity, { props: { disabled: true, verify } })

    await slideToEnd(wrapper)

    expect(verify).not.toHaveBeenCalled()
    expect(wrapper.find('input[type="range"]').exists()).toBe(true)
    expect(wrapper.find('button[type="button"]').exists()).toBe(true)
    expect(wrapper.find('[aria-live="polite"]').exists()).toBe(true)
  })
})
