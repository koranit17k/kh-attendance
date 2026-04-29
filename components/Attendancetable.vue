<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { useDebounceFn } from '@vueuse/core'

type Attendance = {
  dateAt: string
  comCode: string
  empCode: number
  morning: string | null
  lunch_out: string | null
  lunch_in: string | null
  evening: string | null
  night: string | null
}

type Company = {
  comCode: string
  comName: string
  displayName?: string
}

const page = ref(1)
const pageCount = 50
const selectedCompany = ref<string>('')
const filterEmpCode = ref('')
const filterDate = ref('')
const debouncedEmpCode = ref('')
const debouncedDate = ref('')
const tableWrapper = ref<HTMLElement | null>(null)

const debouncedUpdateEmpCode = useDebounceFn((val: string) => {
  debouncedEmpCode.value = val
  page.value = 1
}, 500)

const debouncedUpdateDate = useDebounceFn((val: string) => {
  debouncedDate.value = val
  page.value = 1
}, 500)

watch(filterEmpCode, (val) => debouncedUpdateEmpCode(val))
watch(filterDate, (val) => debouncedUpdateDate(val))
watch(selectedCompany, () => { page.value = 1 })

// SSR: fetch companies
const { data: companiesRaw } = useLazyFetch<Company[]>('/api/company')
const companies = computed(() =>
  (companiesRaw.value || []).map(c => ({
    ...c,
    displayName: `${c.comCode}  ${c.comName}`
  }))
)

// SSR: fetch attendance with reactive query (auto-refetch on param change)
const { data: attendanceData, pending: loading, refresh } = useLazyFetch<{ rows: Attendance[], total: number }>('/api/attendance', {
  query: computed(() => ({
    limit: pageCount,
    page: page.value,
    comCode: selectedCompany.value || undefined,
    empCode: debouncedEmpCode.value || undefined,
    dateAt: debouncedDate.value || undefined
  }))
})

const data = computed(() => attendanceData.value?.rows || [])
const totalCount = computed(() => attendanceData.value?.total || 0)

watch(data, () => {
  nextTick(() => tableWrapper.value?.scrollTo({ top: 0 }))
})

function handleRefresh() {
  if (page.value === 1) refresh()
  else page.value = 1
}

const columns: TableColumn<Attendance>[] = [
  {
    id: 'no',
    header: 'No.',
    cell: ({ row }) => (page.value - 1) * pageCount + row.index + 1
  },
  {
    accessorKey: 'dateAt',
    header: 'Date',
    cell: ({ row }) => formatDate(row.getValue('dateAt'))
  },
  { accessorKey: 'comCode', header: 'ComCode' },
  { accessorKey: 'empCode', header: 'EmpCode', cell: ({ row }) => `${row.getValue('empCode')}` },
  { accessorKey: 'morning', header: 'Morning', cell: ({ row }) => formatTime(row.getValue('morning')) },
  { accessorKey: 'lunch_out', header: 'Lunch Out', cell: ({ row }) => formatTime(row.getValue('lunch_out')) },
  { accessorKey: 'lunch_in', header: 'Lunch In', cell: ({ row }) => formatTime(row.getValue('lunch_in')) },
  { accessorKey: 'evening', header: 'Evening', cell: ({ row }) => formatTime(row.getValue('evening')) },
  { accessorKey: 'night', header: 'Night', cell: ({ row }) => formatTime(row.getValue('night')) }
]

function formatDate(val: unknown): string {
  if (!val) return '-'
  const d = new Date(val as string)
  if (isNaN(d.getTime())) return '-'
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatTime(val: unknown): string {
  if (!val) return '-'
  return String(val)
}
</script>

<template>
  <div class="flex flex-col h-[calc(100vh-200px)] w-full bg-background border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm">
    <div class="flex px-4 py-3.5 border-b border-gray-200 dark:border-gray-800 shrink-0 gap-4 items-center bg-gray-50/50 dark:bg-gray-900/50 rounded-t-lg">
      <USelectMenu 
        v-model="selectedCompany" 
        :items="companies" 
        value-key="comCode" 
        label-key="displayName" 
        placeholder="All Companies"
        class="w-64"
        clear
        icon="i-lucide-building-2"
      />

      <UInput 
        v-model="filterEmpCode" 
        class="w-48" 
        placeholder="EmpCode..." 
        icon="i-lucide-search"
      />

      <UInput 
        v-model="filterDate" 
        type="date"
        class="w-48" 
        icon="i-lucide-calendar"
      />

      <div class="flex-1"></div>

      <UButton 
        icon="i-lucide-rotate-cw" 
        variant="outline" 
        color="primary" 
        size="sm" 
        :loading="loading"
        @click="handleRefresh" 
      />
    </div>

    <ClientOnly>
      <div ref="tableWrapper" class="flex-1 overflow-auto bg-white dark:bg-gray-900">
      <UTable 
        :data="data" 
        :columns="columns" 
        :loading="loading"
        :ui="{ 
          tr: 'hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors',
          td: 'py-2',
          th: 'py-3'
        }"
      >
        <template #empty-state>
          <div class="flex flex-col items-center justify-center p-8">
            <UIcon name="i-lucide-inbox" class="w-8 h-8 text-gray-400 mb-2" />
            <p class="text-sm text-gray-500">ไม่พบข้อมูล</p>
          </div>
        </template>
      </UTable>
      </div>

      <div class="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 rounded-b-lg">
        <div class="text-sm text-gray-500">
          แสดง <span class="font-medium text-gray-900 dark:text-white">{{ totalCount === 0 ? 0 : ((page - 1) * pageCount) + 1 }}</span>
          ถึง <span class="font-medium text-gray-900 dark:text-white">{{ Math.min(page * pageCount, totalCount) }}</span>
          จากทั้งหมด <span class="font-bold text-gray-900 dark:text-white">{{ totalCount.toLocaleString() }}</span> รายการ
        </div>
        <UPagination
          v-model:page="page"
          :items-per-page="pageCount"
          :total="totalCount"
        />
      </div>
    </ClientOnly>
  </div>
</template>
