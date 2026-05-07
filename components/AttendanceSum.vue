<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { today } from '@internationalized/date'

interface AttendanceSummary {
  startDate: string
  endDate: string
  fullDay: number
  halfDay: number
  absent: number
  late: number
}

const range = useState<{ start: string, end: string }>('attendance-range', () => ({
  start: today('Asia/Bangkok').toString(),
  end: today('Asia/Bangkok').toString()
}))
const isSelecting = useState('attendance-selecting', () => false)
const calendarResetId = useState('calendar-reset-id', () => 0)

onMounted(() => {
  const t = today('Asia/Bangkok').toString()
  range.value.start = t
  range.value.end = t
})

const queryParams = computed(() => ({
  startDate: range.value.start,
  endDate: range.value.end
}))

const { data, pending, error, refresh } = await useFetch<AttendanceSummary>(
  '/api/attend-sum',
  {
    key: 'attendance-sum-data',
    query: queryParams,
    watch: [queryParams],
    server: false,
    getCachedData: () => undefined
  }
)

const resetAndRefresh = async () => {
  isSelecting.value = false
  range.value.start = today('Asia/Bangkok').toString()
  range.value.end = today('Asia/Bangkok').toString()
  calendarResetId.value++
}
</script>

<template>
  <div class="space-y-4 text-gray-900 dark:text-white">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">Attendance Summary</h1>
      <UButton
        label="clear"
        icon="i-lucide-refresh-cw"
        variant="outline"
        @click="resetAndRefresh"
      />
    </div>

    <div v-if="pending && !data">Loading...</div>
    <div v-else-if="error">โหลดข้อมูลไม่สำเร็จ</div>

    <div v-else class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <UCard>
        <div class="space-y-4 text-center">
          <p class="text-xl text-gray-500 dark:text-gray-400">เต็มวัน</p>
          <p class="text-6xl font-bold">{{ data?.fullDay ?? 0 }}</p>
        </div>
      </UCard>

      <UCard>
        <div class="space-y-4 text-center">
          <p class="text-xl text-gray-500 dark:text-gray-400">ครึ่งวัน</p>
          <p class="text-6xl font-bold">{{ data?.halfDay ?? 0 }}</p>
        </div>
      </UCard>

      <UCard>
        <div class="space-y-4 text-center">
          <p class="text-xl text-gray-500 dark:text-gray-400">ขาด</p>
          <p class="text-6xl font-bold">{{ data?.absent ?? 0 }}</p>
        </div>
      </UCard>

      <UCard>
        <div class="space-y-4 text-center">
          <p class="text-xl text-gray-500 dark:text-gray-400">มาสาย</p>
          <p class="text-6xl font-bold">{{ data?.late ?? 0 }}</p>
        </div>
      </UCard>
    </div>
  </div>
</template>