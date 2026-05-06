<script setup lang="ts">
import * as echarts from 'echarts'
import { onMounted, onUnmounted, ref, watch, computed, nextTick } from 'vue'

const chartRef = ref<HTMLElement | null>(null)
let chart: echarts.ECharts | null = null

const colorMode = useColorMode()

// Access the shared attendance range state
const range = useState<{ start: string, end: string }>('attendance-range')

// Fetch daily data based on shared state
const { data, pending, error } = useFetch<any[]>('/api/attendance-daily', {
  query: computed(() => ({
    startDate: range.value?.start,
    endDate: range.value?.end
  })),
  watch: [() => range.value?.start, () => range.value?.end],
  lazy: true,
  server: false
})

const initChart = () => {
  if (!chartRef.value) return

  // Dispose if already exists
  if (chart) {
    chart.dispose()
  }

  chart = echarts.init(chartRef.value, colorMode.value === 'dark' ? 'dark' : undefined)
}

const updateChart = () => {
  if (!chart || !data.value || data.value.length === 0) return

  // Using Daily Labels (dateAt)
  const dates = data.value.map(item => item.dateAt)
  const fullDays = data.value.map(item => item.fullDay)
  const halfDays = data.value.map(item => item.halfDay)
  const absents = data.value.map(item => item.absent)

  const option = {
    backgroundColor: 'transparent',
    title: {
      text: 'ความเคลื่อนไหวรายวัน',
      left: 'center',
      textStyle: {
        fontSize: 22,
        fontWeight: 600
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    legend: {
      data: ['เต็มวัน', 'ครึ่งวัน', 'ขาด'],
      bottom: 0,
      textStyle: {
        fontSize: 14
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      top: '15%',
      bottom: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: dates,
      axisLabel: {
        rotate: dates.length > 7 ? 45 : 0,
        fontSize: 13
      }
    },
    yAxis: {
      type: 'value',
      minInterval: 1,
      axisLabel: {
        fontSize: 13
      }
    },
    series: [
      {
        name: 'เต็มวัน',
        type: 'bar',
        stack: 'total', // Maintaining Stacked Bar
        data: fullDays,
        itemStyle: { color: '#10b981' }, // green-500
        label: { 
          show: true, 
          position: 'inside',
          fontSize: 12,
          formatter: (params: any) => params.value > 0 ? params.value : ''
        }
      },
      {
        name: 'ครึ่งวัน',
        type: 'bar',
        stack: 'total',
        data: halfDays,
        itemStyle: { color: '#f59e0b' }, // amber-500
        label: { 
          show: true, 
          position: 'inside',
          fontSize: 12,
          formatter: (params: any) => params.value > 0 ? params.value : ''
        }
      },
      {
        name: 'ขาด',
        type: 'bar',
        stack: 'total',
        data: absents,
        itemStyle: { color: '#ef4444' }, // red-500
        label: { 
          show: true, 
          position: 'inside',
          fontSize: 12,
          formatter: (params: any) => params.value > 0 ? params.value : ''
        }
      }
    ],
    // Automatically add scrollbar for long date ranges
    dataZoom: dates.length > 15 ? [
      { type: 'inside', start: 0, end: 100 },
      { type: 'slider', bottom: 30, start: 0, end: 100 }
    ] : []
  }

  chart.setOption(option)
}

const handleResize = () => {
  chart?.resize()
}

onMounted(() => {
  initChart()
  window.addEventListener('resize', handleResize)
  // If data already exists (from cache or fast fetch), update chart
  if (data.value) updateChart()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  chart?.dispose()
})

// Watch for data changes
watch(data, async (newVal) => {
  if (newVal && newVal.length > 0) {
    await nextTick()
    if (!chart) initChart()
    updateChart()
  }
}, { deep: true, immediate: true })

// Watch for color mode changes
watch(() => colorMode.value, () => {
  initChart()
  updateChart()
})
</script>

<template>
  <div class="w-full h-[600px]">
    <div v-if="pending && !data" class="flex flex-col items-center justify-center h-full space-y-4">
      <UIcon name="i-lucide-loader-2" class="w-8 h-8 animate-spin text-primary" />
      <p class="text-sm text-gray-500">กำลังโหลดกราฟ...</p>
    </div>
    <div v-else-if="error" class="flex items-center justify-center h-full uppercase tracking-widest text-xs">
      <p class="text-red-500">Error loading chart data</p>
    </div>
    <div v-else-if="!data || data.length === 0" class="flex items-center justify-center h-full">
      <p class="text-gray-500">ไม่พบข้อมูลสำหรับช่วงวันที่เลือก</p>
    </div>
    <div v-else ref="chartRef" class="w-full h-full" :class="{ 'opacity-50 grayscale pointer-events-none': pending }"></div>
  </div>
</template>
