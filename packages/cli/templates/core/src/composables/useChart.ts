import { onBeforeUnmount, onMounted, shallowRef, toValue, watch } from 'vue'
import type { MaybeRefOrGetter, ShallowRef } from 'vue'
import * as echarts from 'echarts/core'
import type { EChartsCoreOption } from 'echarts/core'

export interface UseChartOptions<Option extends EChartsCoreOption = EChartsCoreOption> {
  modules: unknown[]
  option: MaybeRefOrGetter<Option>
  autoresize?: boolean
}

export function useChart<Option extends EChartsCoreOption>(
  element: ShallowRef<HTMLElement | null>,
  options: UseChartOptions<Option>
) {
  const instance = shallowRef<echarts.ECharts>()
  let resizeObserver: ResizeObserver | undefined

  function setOption(option = toValue(options.option)) {
    instance.value?.setOption(option)
  }

  function resize() {
    instance.value?.resize()
  }

  function dispose() {
    resizeObserver?.disconnect()
    resizeObserver = undefined
    instance.value?.dispose()
    instance.value = undefined
  }

  onMounted(() => {
    const target = element.value
    if (!target) return

    echarts.use(options.modules as Parameters<typeof echarts.use>[0])
    instance.value = echarts.init(target)
    setOption()

    if (options.autoresize !== false) {
      resizeObserver = new ResizeObserver(resize)
      resizeObserver.observe(target)
    }
  })

  watch(() => toValue(options.option), () => setOption(), { deep: true })
  onBeforeUnmount(dispose)

  return { instance, setOption, resize, dispose }
}
