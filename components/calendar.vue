<script setup lang="ts">
import { CalendarDate, today, getLocalTimeZone } from '@internationalized/date'

const modelValue = shallowRef(today(getLocalTimeZone()))

const { data: counterData } = await useFetch<{ value: number, dates: string[] }>('/api/counter')

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
  
  // If date is in the future, return undefined
  if (dateStr > todayStr) {
    return undefined
  }

  // If date is today or in the past, return success if highlighted, error if not
  if (highlightedDates.value.has(dateStr)) {
    return 'success'
  }

  return 'error'
}
</script>

<template>
  <UCalendar v-model="modelValue",
    :default-placeholder="today(getLocalTimeZone()).subtract({ months: 1 })"
  :number-of-months="2" >
    <template #day="{ day }">
      <UChip :show="!!getColorByDate(day.toDate('UTC'))" :color="getColorByDate(day.toDate('UTC'))" size="2xs">
        {{ day.day }}
      </UChip>
    </template>
  </UCalendar>
</template>

<style scoped>
:deep([data-outside-view]) {
  visibility: hidden;
  pointer-events: none;
}
</style>