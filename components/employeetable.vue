<script setup lang="ts">
import { h, resolveComponent, ref, onMounted, watch } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import { useIntersectionObserver, useDebounceFn } from '@vueuse/core'

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

const data = ref<Employee[]>([])
const loading = ref(false)
const sentinel = ref<HTMLElement | null>(null)
const hasMore = ref(true)
const totalCount = ref(0)

const companies = ref<Company[]>([])
const selectedCompany = ref<string>('')
const globalFilter = ref('')

async function fetchCompanies() {
  try {
    const raw = await $fetch<Company[]>('/api/company')
    companies.value = raw.map(c => ({
      ...c,
      displayName: `${c.comCode}  ${c.comName}`
    }))
  } catch (error) {
    console.error('Failed to fetch companies:', error)
  }
}

async function fetchEmployee(reset = false) {
  if (reset) {
    data.value = []
    hasMore.value = true
    totalCount.value = 0
  }
  if (loading.value || !hasMore.value) return
  loading.value = true
  
  try {
    const res = await $fetch<{ rows: Employee[], total: number }>('/api/employee', {
      query: {
        limit: 50,
        offset: data.value.length,
        comCode: selectedCompany.value,
        q: globalFilter.value
      }
    })
    
    if (res.rows.length < 50) {
      hasMore.value = false
    }
    
    data.value.push(...res.rows)
    totalCount.value = res.total
  } catch (error) {
    console.error('Failed to fetch employee:', error)
  } finally {
    loading.value = false
  }
}

const debouncedFetch = useDebounceFn(() => {
  fetchEmployee(true)
}, 500)

watch(globalFilter, () => {
  debouncedFetch()
})

watch(selectedCompany, () => {
  fetchEmployee(true)
})

useIntersectionObserver(sentinel, (entries) => {
  if (entries[0]?.isIntersecting && !loading.value && hasMore.value) {
    fetchEmployee()
  }
})

onMounted(() => {
  fetchCompanies()
  fetchEmployee()
})

const router = useRouter()

function onRowClick(_: any, row: any) {
  const empCode = row.original.empCode
  router.push(`/attendance/edit-employee?empCode=${empCode}`)
}

const columns: TableColumn<Employee>[] = [
  {
    accessorKey: 'comCode',
    header: 'ComCode'
  },
  {
    accessorKey: 'empCode',
    header: 'EmpCode',
    cell: ({ row }) => `${row.getValue('empCode')}`
  },
  {
    accessorKey: 'name',
    header: 'Name'
  },
  {
    accessorKey: 'beginDate',
    header: 'BeginDate',
    cell: ({ row }) => {
      const val = row.getValue('beginDate')
      return val ? new Date(val as string).toLocaleDateString() : '-'
    }
  },
  {
    accessorKey: 'endDate',
    header: 'EndDate',
    cell: ({ row }) => {
      const val = row.getValue('endDate')
      return val ? new Date(val as string).toLocaleDateString() : '-'
    }
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
</script>

<template>
  <div class="flex flex-col h-[calc(100vh-200px)] w-full bg-background">
    <div class="flex px-4 py-3.5 border-b border-accented shrink-0 gap-4 items-center bg-gray-50/50 dark:bg-gray-900/50">
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

      <div class="text-sm text-gray-500 whitespace-nowrap">
        Total: <span class="font-bold text-gray-900 dark:text-white">{{ totalCount.toLocaleString() }}</span>
      </div>
    </div>

    <ClientOnly>
      <UTable 
        ref="table" 
        v-model:global-filter="globalFilter" 
        :data="data" 
        :columns="columns" 
        :virtualize="{ estimateSize: 40 }"
        :ui="{ 
          tr: 'hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer',
          td: 'py-1.5',
          th: 'py-2.5'
        }"
        @select="onRowClick"
        class="flex-1 overflow-auto"
      >
        <template #body-bottom>
          <div ref="sentinel" class="p-4 flex justify-center w-full">
            <UIcon v-if="loading" name="i-lucide-loader-2" class="animate-spin h-5 w-5 text-primary" />
            <span v-else-if="hasMore" class="text-sm text-muted-foreground italic">Scroll for more</span>
            <span v-else-if="data.length > 0" class="text-sm text-muted-foreground">End of list</span>
          </div>
        </template>
      </UTable>
    </ClientOnly>
  </div>
</template>
