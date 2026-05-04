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

const sharedEmpCode = useState<number | null>('selectedEmpCode', () => null)
const sharedComCode = useState<string | null>('selectedComCode', () => null)
const sharedDateAt = useState<string | null>('selectedDateAt', () => null)
const refreshTrigger = useState<number>('attendanceRefreshTrigger', () => 0)

function onRowClick(event: any, row: any) {
  const empCode = row?.original?.empCode || row?.empCode
  const comCode = row?.original?.comCode || row?.comCode
  const dateAt = row?.original?.dateAt || row?.dateAt
  
  if (empCode && comCode && dateAt) {
    sharedEmpCode.value = Number(empCode)
    sharedComCode.value = comCode
    sharedDateAt.value = dateAt
  }
}

watch(refreshTrigger, () => refresh())

const columns: TableColumn<Attendance>[] = [
  {
    id: 'no',
    header: 'ลำดับ',
    cell: ({ row }) => (page.value - 1) * pageCount + row.index + 1
  },
  {
    accessorKey: 'dateAt',
    header: 'วันที่',
    cell: ({ row }) => formatDate(row.getValue('dateAt'))
  },
  { accessorKey: 'comCode', header: 'บริษัท' },
  { accessorKey: 'empCode', header: 'รหัสพนักงาน', cell: ({ row }) => `${row.getValue('empCode')}` },
  { accessorKey: 'morning', header: 'เข้างาน', cell: ({ row }) => formatTime(row.getValue('morning')) },
  { accessorKey: 'lunch_out', header: 'ออกพัก', cell: ({ row }) => formatTime(row.getValue('lunch_out')) },
  { accessorKey: 'lunch_in', header: 'เข้าพัก', cell: ({ row }) => formatTime(row.getValue('lunch_in')) },
  { accessorKey: 'evening', header: 'เลิกงาน', cell: ({ row }) => formatTime(row.getValue('evening')) },
  { accessorKey: 'night', header: 'ออก OT', cell: ({ row }) => formatTime(row.getValue('night')) }
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
  <div class="flex flex-col w-full bg-background border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm">
    <div class="flex px-4 py-3.5 border-b border-gray-200 dark:border-gray-800 shrink-0 gap-4 items-center bg-gray-50/50 dark:bg-gray-900/50 rounded-t-lg">
      <USelectMenu 
        v-model="selectedCompany" 
        :items="companies" 
        value-key="comCode" 
        label-key="displayName" 
        placeholder="All Companies"
        class="w-72"
        clear
        icon="i-lucide-building-2"
      />

      <UInput 
        v-model="filterEmpCode" 
        class="flex-1" 
        placeholder="Search EmpCode..." 
        icon="i-lucide-search"
      />

      <UInput 
        v-model="filterDate" 
        type="date"
        class="w-48" 
        icon="i-lucide-calendar"
      />

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
      <div ref="tableWrapper" class="flex-1 overflow-x-auto bg-white dark:bg-gray-900">
      <UTable 
        :data="data" 
        :columns="columns" 
        :loading="loading"
        :ui="{ 
          tr: 'hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer',
          td: 'py-2',
          th: 'py-3'
        }"
        @select="onRowClick"
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
