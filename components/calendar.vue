<script setup lang="ts">
import { CalendarDate, today, getLocalTimeZone, parseDate } from '@internationalized/date'

const rangeState = useState<{ start: string, end: string }>('attendance-range', () => ({
  start: today(getLocalTimeZone()).toString(),
  end: today(getLocalTimeZone()).toString()
}))

const isSelecting = useState('attendance-selecting', () => false)
const calendarResetId = useState('calendar-reset-id', () => 0)

const internalRange = computed({
  get: () => ({
    start: parseDate(rangeState.value.start),
    end: isSelecting.value ? undefined : parseDate(rangeState.value.end)
  }),
  set: (val) => {
    if (val.start && !val.end) {
      isSelecting.value = true
      rangeState.value.start = val.start.toString()
      rangeState.value.end = val.start.toString()
    } else if (val.start && val.end) {
      isSelecting.value = false
      rangeState.value.start = val.start.toString()
      rangeState.value.end = val.end.toString()
    }
  }
})

const startDateStr = computed({
  get: () => rangeState.value.start,
  set: (val) => {
    if (val) {
      rangeState.value.start = val
      isSelecting.value = false
    }
  }
})

const endDateStr = computed({
  get: () => rangeState.value.end,
  set: (val) => {
    if (val) {
      rangeState.value.end = val
      isSelecting.value = false
    }
  }
})

const { data: counterData } = await useFetch<{ value: number, dates: string[] }>('/api/calendar')

const highlightedDates = computed(() => {
  if (!counterData.value?.dates) return new Set<string>()
  return new Set(counterData.value.dates.map(d => {
    const date = new Date(d)
    return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`
  }))
})

function getColorByDate(date: Date) {
  // Use UTC components to match the date object from toDate('UTC')
  const dateStr = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`

  // Get current date string in UTC
  const now = new Date()
  const todayStr = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')}`

  const isWeekend = date.getDay() == 0

  // If date is in the future, return undefined
  if (dateStr > todayStr || isWeekend) {
    return undefined
  }

  // If date is today, return neutral
  if (dateStr === todayStr) {
    return 'neutral'
  }

  // If date is in the past, return success if highlighted, error if not
  if (highlightedDates.value.has(dateStr)) {
    return 'success'
  }

  return 'error'
}
</script>

<template>
  <div class="space-y-5 w-full flex-col items-center">
    <div class="flex items-center justify-center gap-2">
      <UInput v-model="startDateStr" :icon="null" :ui="{ base: 'text-center text-xl py-2' }" class="w-56" />
      <span class="text-gray-500 font-bold text-2xl">-</span>
      <UInput v-model="endDateStr" :icon="null" :ui="{ base: 'text-center text-xl py-2' }" class="w-56" />
    </div>

    <UCalendar v-model="internalRange" :key="calendarResetId"
      :default-placeholder="today(getLocalTimeZone()).subtract({ months: 1 })" :number-of-months="2" :range="true" :ui="{
        heading: 'text-2xl font-bold text-gray-900 dark:text-white'
      }" :prev-month="{ size: 'xl', variant: 'ghost', color: 'neutral' }"
      :next-month="{ size: 'xl', variant: 'ghost', color: 'neutral' }"
      :prev-year="{ size: 'xl', variant: 'ghost', color: 'neutral' }"
      :next-year="{ size: 'xl', variant: 'ghost', color: 'neutral' }">
      <template #day="{ day }">
        <UChip :show="!!getColorByDate(day.toDate('UTC'))" :color="getColorByDate(day.toDate('UTC'))" size="xs">
          <span class="text-lg">{{ day.day }}</span>
        </UChip>
      </template>
    </UCalendar>

    <div v-if="$slots.links" class="flex flex-wrap items-center justify-center gap-4 mt-6">
      <slot name="links" />
    </div>
  </div>
</template>

<style scoped>
:deep([data-outside-view]) {
  visibility: hidden;
  pointer-events: none;
}
</style>
