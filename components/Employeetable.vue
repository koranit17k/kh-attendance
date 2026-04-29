<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import { useDebounceFn } from '@vueuse/core'

const UBadge = resolveComponent('UBadge')

type Employee = {
  empCode: number
  name: string
  beginDate: string | null
  endDate: string | null
  timeCode: number | null
  comCode: string
}

type Company = {
  comCode: string
  comName: string
  displayName?: string
}

const page = ref(1)
const pageCount = 50
const selectedCompany = ref<string>('')
const globalFilter = ref('')
const debouncedQ = ref('')
const tableWrapper = ref<HTMLElement | null>(null)

const debouncedUpdate = useDebounceFn((val: string) => {
  debouncedQ.value = val
  page.value = 1
}, 500)
watch(globalFilter, (val) => debouncedUpdate(val))
watch(selectedCompany, () => { page.value = 1 })

// SSR: fetch companies
const { data: companiesRaw } = useLazyFetch<Company[]>('/api/company')
const companies = computed(() =>
  (companiesRaw.value || []).map(c => ({
    ...c,
    displayName: `${c.comCode}  ${c.comName}`
  }))
)

// SSR: fetch employees with reactive query (auto-refetch on param change)
const { data: employeeData, pending: loading, refresh } = useLazyFetch<{ rows: Employee[], total: number }>('/api/employee', {
  query: computed(() => ({
    limit: pageCount,
    page: page.value,
    comCode: selectedCompany.value || undefined,
    q: debouncedQ.value || undefined
  }))
})

const data = computed(() => employeeData.value?.rows || [])
const totalCount = computed(() => employeeData.value?.total || 0)

watch(data, () => {
  nextTick(() => tableWrapper.value?.scrollTo({ top: 0 }))
})

function handleRefresh() {
  if (page.value === 1) refresh()
  else page.value = 1
}

const sharedEmpCode = useState<number | null>('selectedEmpCode', () => null)
const sharedComCode = useState<string | null>('selectedComCode', () => null)
const refreshTrigger = useState<number>('employeeRefreshTrigger', () => 0)

function onRowClick(event: any, row: any) {
  const empCode = row?.original?.empCode || row?.empCode
  const comCode = row?.original?.comCode || row?.comCode
  
  if (empCode && comCode) {
    sharedEmpCode.value = Number(empCode)
    sharedComCode.value = comCode
  }
}

watch(refreshTrigger, () => refresh())

const columns: TableColumn<Employee>[] = [
  {
    id: 'no',
    header: 'No.',
    cell: ({ row }) => (page.value - 1) * pageCount + row.index + 1
  },
  { accessorKey: 'comCode', header: 'ComCode' },
  { accessorKey: 'empCode', header: 'EmpCode', cell: ({ row }) => `${row.getValue('empCode')}` },
  { accessorKey: 'name', header: 'Name' },
  {
    accessorKey: 'beginDate',
    header: 'BeginDate',
    cell: ({ row }) => formatDate(row.getValue('beginDate'))
  },
  {
    accessorKey: 'endDate',
    header: 'EndDate',
    cell: ({ row }) => formatDate(row.getValue('endDate'))
  },
  {
    accessorKey: 'timeCode',
    header: 'TimeCode',
    cell: ({ row }) => {
      const val = row.getValue('timeCode')
      return val ? h(UBadge, { variant: 'subtle', color: 'neutral' }, () => val) : '-'
    }
  }
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
        class="w-72"
        clear
        icon="i-lucide-building-2"
      />

      <UInput 
        v-model="globalFilter" 
        class="flex-1" 
        placeholder="Search EmpCode or Name..." 
        icon="i-lucide-search"
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
      <div ref="tableWrapper" class="flex-1 overflow-auto bg-white dark:bg-gray-900">
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
