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

async function fetchEmployees(reset = false) {
  if (reset) {
    data.value = []
    hasMore.value = true
  }
  if (loading.value || !hasMore.value) return
  loading.value = true
  
  try {
    const newData = await $fetch<Employee[]>('/api/employees', {
      query: {
        limit: 50,
        offset: data.value.length,
        comCode: selectedCompany.value,
        q: globalFilter.value
      }
    })
    
    if (newData.length < 50) {
      hasMore.value = false
    }
    
    data.value.push(...newData)
  } catch (error) {
    console.error('Failed to fetch employees:', error)
  } finally {
    loading.value = false
  }
}

const debouncedFetch = useDebounceFn(() => {
  fetchEmployees(true)
}, 500)

watch(globalFilter, () => {
  debouncedFetch()
})

watch(selectedCompany, () => {
  fetchEmployees(true)
})

useIntersectionObserver(sentinel, (entries) => {
  if (entries[0]?.isIntersecting && !loading.value && hasMore.value) {
    fetchEmployees()
  }
})

onMounted(() => {
  fetchCompanies()
  fetchEmployees()
})

const columns: TableColumn<Employee>[] = [
  {
    accessorKey: 'empCode',
    header: 'Code',
    cell: ({ row }) => `#${row.getValue('empCode')}`
  },
  {
    accessorKey: 'name',
    header: 'Name'
  },
  {
    accessorKey: 'beginDate',
    header: 'Begin Date',
    cell: ({ row }) => {
      const val = row.getValue('beginDate')
      return val ? new Date(val as string).toLocaleDateString() : '-'
    }
  },
  {
    accessorKey: 'endDate',
    header: 'End Date',
    cell: ({ row }) => {
      const val = row.getValue('endDate')
      return val ? new Date(val as string).toLocaleDateString() : '-'
    }
  },
  {
    accessorKey: 'timeCode',
    header: 'Time Code',
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
        placeholder="Search employees..." 
        icon="i-lucide-search"
      />
    </div>

    <UTable 
      ref="table" 
      v-model:global-filter="globalFilter" 
      :data="data" 
      :columns="columns" 
      :virtualize="{ estimateSize: 48 }"
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
  </div>
</template>
