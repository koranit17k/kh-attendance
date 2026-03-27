<script setup lang="ts">
import { computed } from 'vue'
import { today, getLocalTimeZone } from '@internationalized/date'

interface AttendanceSummary {
  startDate: string
  endDate: string
  fullDay: number
  halfDay: number
  absent: number
}

const range = useState<{ start: string, end: string }>('attendance-range', () => ({
  start: today(getLocalTimeZone()).toString(),
  end: today(getLocalTimeZone()).toString()
}))

const queryParams = computed(() => ({
  startDate: range.value.start,
  endDate: range.value.end
}))

const { data, pending, error, refresh } = await useFetch<AttendanceSummary>(
  '/api/attend-sum',
  {
    query: queryParams,
    watch: [queryParams]
  }
)
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">Attendance Summary</h1>
      <UButton
        label="Refresh"
        icon="i-lucide-refresh-cw"
        variant="outline"
        @click="refresh()"
      />
    </div>

    <p class="text-sm text-muted">
      ช่วงวันที่ {{ queryParams.startDate }} ถึง {{ queryParams.endDate }}
    </p>

    <div v-if="pending">Loading...</div>
    <div v-else-if="error">โหลดข้อมูลไม่สำเร็จ</div>

    <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <UCard>
        <div class="space-y-2">
          <p class="text-sm text-muted">เต็มวัน</p>
          <p class="text-4xl font-bold">{{ data?.fullDay ?? 0 }}</p>
        </div>
      </UCard>

      <UCard>
        <div class="space-y-2">
          <p class="text-sm text-muted">ครึ่งวัน</p>
          <p class="text-4xl font-bold">{{ data?.halfDay ?? 0 }}</p>
        </div>
      </UCard>

      <UCard>
        <div class="space-y-2">
          <p class="text-sm text-muted">ขาด</p>
          <p class="text-4xl font-bold">{{ data?.absent ?? 0 }}</p>
        </div>
      </UCard>
    </div>
  </div>
</template>