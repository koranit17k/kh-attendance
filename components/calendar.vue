<script setup lang="ts">
import { CalendarDate, today, getLocalTimeZone, parseDate } from '@internationalized/date'

const modelValue = shallowRef<{ start: CalendarDate | undefined, end: CalendarDate | undefined }>({
  start: today(getLocalTimeZone()),
  end: today(getLocalTimeZone())
})

const startDateStr = computed({
  get: () => modelValue.value.start?.toString(),
  set: (val) => { if (val) modelValue.value = { ...modelValue.value, start: parseDate(val) } }
})

const endDateStr = computed({
  get: () => (modelValue.value.end || modelValue.value.start)?.toString(),
  set: (val) => { if (val) modelValue.value = { ...modelValue.value, end: parseDate(val) } }
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
      <UInput v-model="startDateStr" :icon="null" :ui="{ base: 'text-center' }" class="w-32" />
      <span class="text-gray-500 font-bold">-</span>
      <UInput v-model="endDateStr" :icon="null" :ui="{ base: 'text-center' }" class="w-32" />
    </div>

    <UCalendar v-model="modelValue"
      :default-placeholder="today(getLocalTimeZone()).subtract({ months: 1 })"
      :number-of-months="2" 
      :range="true">
      <template #day="{ day }">
        <UChip :show="!!getColorByDate(day.toDate('UTC'))" :color="getColorByDate(day.toDate('UTC'))" size="2xs">
          {{ day.day }}
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