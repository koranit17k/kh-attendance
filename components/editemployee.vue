<script setup lang="ts">
const props = defineProps<{
  empCode?: string | number
}>()

const sharedEmpCode = useState<string | number | null>('selectedEmpCode', () => null)
const route = useRoute()
const effectiveEmpCode = computed(() => props.empCode || sharedEmpCode.value || route.query.empCode)

const employee = ref<any>(null)
const loading = ref(false)

async function fetchEmployee() {
  if (!effectiveEmpCode.value) {
    employee.value = null
    return
  }
  
  loading.value = true
  try {
    const res = await $fetch<{ rows: any[] }>('/api/employee', {
      query: {
        q: effectiveEmpCode.value,
        limit: 1
      }
    })
    employee.value = res.rows[0] || null
  } catch (error) {
    console.error('Failed to fetch employee details:', error)
  } finally {
    loading.value = false
  }
}

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

onMounted(() => {
  fetchEmployee()
})

watch(() => effectiveEmpCode.value, () => {
  fetchEmployee()
})
</script>

<template>
  <div class="max-w-4xl mx-auto p-4 w-full">
    <div v-if="loading" class="flex flex-col items-center justify-center p-8 space-y-4">
      <UIcon name="i-lucide-loader-2" class="animate-spin h-8 w-8 text-primary" />
      <p class="text-gray-500 text-sm">กำลังดึงข้อมูล...</p>
    </div>

    <template v-else-if="employee">
      <UCard class="overflow-hidden border-none shadow-lg ring-1 ring-gray-200 dark:ring-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl">
        <template #header>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <UIcon name="i-lucide-user" class="h-6 w-6" />
              </div>
              <div>
                <h2 class="text-xl font-bold text-gray-900 dark:text-white">{{ employee.name }}</h2>
                <p class="text-xs text-gray-500 font-mono">ID: {{ employee.empCode }}</p>
              </div>
            </div>
            <UBadge size="md" color="primary" variant="subtle">
              {{ employee.comCode }}
            </UBadge>
          </div>
        </template>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 py-2">
          <div class="space-y-4">
            <div class="flex items-start gap-3">
              <div class="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                <UIcon name="i-lucide-calendar" class="h-4 w-4" />
              </div>
              <div>
                <p class="text-[10px] font-semibold text-gray-400 uppercase">วันเริ่มงาน</p>
                <p class="text-sm font-medium text-gray-800 dark:text-gray-200">{{ formatDate(employee.beginDate) }}</p>
              </div>
            </div>

            <div class="flex items-start gap-3">
              <div class="p-1.5 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400">
                <UIcon name="i-lucide-calendar-x" class="h-4 w-4" />
              </div>
              <div>
                <p class="text-[10px] font-semibold text-gray-400 uppercase">วันสิ้นสุดสัญญา</p>
                <p class="text-sm font-medium text-gray-800 dark:text-gray-200">{{ formatDate(employee.endDate) }}</p>
              </div>
            </div>
          </div>

          <div class="space-y-4">
            <div class="flex items-start gap-3">
              <div class="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400">
                <UIcon name="i-lucide-clock" class="h-4 w-4" />
              </div>
              <div>
                <p class="text-[10px] font-semibold text-gray-400 uppercase">Time Code</p>
                <p class="text-sm font-medium text-gray-800 dark:text-gray-200">
                  {{ employee.timeCode || 'ยังไม่ได้ระบุ' }}
                </p>
              </div>
            </div>

            <div class="flex items-start gap-3">
              <div class="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400">
                <UIcon name="i-lucide-building" class="h-4 w-4" />
              </div>
              <div>
                <p class="text-[10px] font-semibold text-gray-400 uppercase">รหัสบริษัท</p>
                <p class="text-sm font-medium text-gray-800 dark:text-gray-200">{{ employee.comCode }}</p>
              </div>
            </div>
          </div>
        </div>

        <template #footer v-if="!props.empCode && !sharedEmpCode">
          <div class="flex justify-end gap-3">
            <UButton icon="i-lucide-chevron-left" variant="ghost" color="neutral" to="/attendance/employee">
              กลับ
            </UButton>
            <UButton icon="i-lucide-edit" color="primary">
              แก้ไขข้อมูล
            </UButton>
          </div>
        </template>
      </UCard>
    </template>

    <div v-else-if="sharedEmpCode || route.query.empCode" class="flex flex-col items-center justify-center p-8 text-center">
      <UIcon name="i-lucide-user-x" class="h-8 w-8 text-red-500 mb-2" />
      <h3 class="text-sm font-bold text-gray-900 dark:text-white">ไม่พบข้อมูลพนักงาน</h3>
    </div>
  </div>
</template>
