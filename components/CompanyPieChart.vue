<script setup lang="ts">
import * as echarts from 'echarts'
import { onMounted, onUnmounted, ref, watch, computed } from 'vue'

const chartRef = ref<HTMLElement | null>(null)
let chart: echarts.ECharts | null = null

const colorMode = useColorMode()

// Access the shared attendance range state
const range = useState<{ start: string, end: string }>('attendance-range')

// Fetch company data based on shared state
const { data, pending, error } = useFetch<any[]>('/api/attendance-by-company', {
  query: computed(() => ({
    startDate: range.value?.start,
    endDate: range.value?.end
  })),
  watch: [() => range.value?.start, () => range.value?.end],
  lazy: true
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
  if (!chart || !data.value) return

  const option = {
    backgroundColor: 'transparent',
    title: {
      text: 'แบ่งตามบริษัท',
      left: 'center',
      textStyle: {
        fontSize: 18,
        fontWeight: 400
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      bottom: 0,
      left: 'center',
      textStyle: {
        fontSize: 12
      }
    },
    series: [
      {
        name: 'จำนวนเข้างาน',
        type: 'pie',
        radius: ['40%', '65%'],
        center: ['50%', '50%'],
        avoidLabelOverlap: false,
        padAngle: 3, // <--- padAngle here
        itemStyle: {
          borderRadius: 10
        },
        label: {
          show: true,
          position: 'outside',
          formatter: '{b}: {c} ({d}%)'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: true
        },
        data: data.value,
        color: [
          '#10b981', // emerald
          '#3b82f6', // blue
          '#f59e0b', // amber
          '#ef4444', // red
          '#8b5cf6', // violet
          '#ec4899', // pink
          '#06b6d4', // cyan
          '#f97316'  // orange
        ]
      }
    ]
  }

  chart.setOption(option)
}

const handleResize = () => {
  chart?.resize()
}

onMounted(() => {
  initChart()
  window.addEventListener('resize', handleResize)
  if (data.value) updateChart()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  chart?.dispose()
})

// Watch for data changes
watch(data, (newVal) => {
  if (newVal) {
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
      <p class="text-sm text-gray-500">กำลังโหลดกราฟบริษัท...</p>
    </div>
    <div v-else-if="error" class="flex items-center justify-center h-full uppercase tracking-widest text-xs">
      <p class="text-red-500">Error loading company chart data</p>
    </div>
    <div v-else-if="!data || data.length === 0" class="flex items-center justify-center h-full">
      <p class="text-gray-500">ไม่พบข้อมูลสำหรับช่วงวันที่เลือก</p>
    </div>
    <div ref="chartRef" class="w-full h-full" :class="{ 'opacity-50 grayscale pointer-events-none': pending }"></div>
  </div>
</template>

<style scoped>
</style>
