<script setup lang="ts">
import { onBeforeUnmount, onMounted, useTemplateRef } from 'vue'
import * as echarts from 'echarts/core'
import { BarChart, LineChart } from 'echarts/charts'
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([BarChart, CanvasRenderer, GridComponent, LegendComponent, LineChart, TooltipComponent])
const chartElement = useTemplateRef<HTMLDivElement>('chart')
let chart: echarts.ECharts | undefined
let resizeObserver: ResizeObserver | undefined
onMounted(() => { if (!chartElement.value) return; chart = echarts.init(chartElement.value); chart.setOption({ color: ['#4f46e5', '#22a06b'], grid: { left: 36, right: 20, top: 44, bottom: 28 }, legend: { top: 8, textStyle: { color: '#7c8090' } }, tooltip: { trigger: 'axis' }, xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], axisLine: { lineStyle: { color: '#d8dae0' } } }, yAxis: { type: 'value', splitLine: { lineStyle: { color: '#eceef2' } } }, series: [{ name: 'Requests', type: 'line', smooth: true, data: [84, 119, 92, 158, 141, 187, 206] }, { name: 'Deployments', type: 'bar', barMaxWidth: 26, data: [12, 18, 15, 25, 21, 30, 35] }] }); resizeObserver = new ResizeObserver(() => chart?.resize()); resizeObserver.observe(chartElement.value) })
onBeforeUnmount(() => { resizeObserver?.disconnect(); chart?.dispose() })
</script>
<template><section class="page"><header><p class="eyebrow">{{ $t('showcase.eyebrow') }}</p><h1>{{ $t('showcase.chartsTitle') }}</h1><p>{{ $t('showcase.chartsDescription') }}</p></header><article class="panel"><div class="panel-heading"><div><h2>{{ $t('showcase.traffic') }}</h2><p>{{ $t('showcase.trafficDescription') }}</p></div><span>{{ $t('showcase.lastSevenDays') }}</span></div><div ref="chart" class="chart" /></article></section></template>
<style scoped>
.page{display:grid;gap:24px}.eyebrow{color:var(--primary);font-size:11px;font-weight:750;letter-spacing:.08em;margin:0 0 10px;text-transform:uppercase}h1{font-size:clamp(1.8rem,3vw,2.5rem);letter-spacing:-.045em;margin:0}header p:not(.eyebrow),.panel-heading p{color:var(--muted-foreground);font-size:14px;margin:10px 0 0}.panel{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-lg);box-shadow:var(--shadow-sm);padding:20px}.panel-heading{align-items:flex-start;display:flex;justify-content:space-between}.panel-heading h2{font-size:14px;margin:0}.panel-heading span{color:var(--subtle-foreground);font-size:12px}.chart{height:340px;margin-top:16px;width:100%}
</style>