<script setup lang="ts">
const props = defineProps<{
  empCode?: string | number
}>()

const sharedEmpCode = useState<string | number | null>('selectedEmpCode', () => null)
const sharedComCode = useState<string | null>('selectedComCode', () => null)
const route = useRoute()
const effectiveEmpCode = computed(() => props.empCode || sharedEmpCode.value || route.query.empCode)
const effectiveComCode = computed(() => sharedComCode.value || route.query.comCode)

const employee = ref<any>(null)
const employeeBackup = ref<any>(null)
const loading = ref(false)
const isEditing = ref(false)
const isUpdating = ref(false)

function startEdit() {
  employeeBackup.value = JSON.parse(JSON.stringify(employee.value))
  isEditing.value = true
}

function cancelEdit() {
  if (employeeBackup.value) {
    employee.value = JSON.parse(JSON.stringify(employeeBackup.value))
  }
  isEditing.value = false
}

const toast = useToast()

async function handleUpdate() {
  isUpdating.value = true
  try {
    await $fetch('/api/employee', {
      method: 'PUT',
      body: employee.value
    })
    toast.add({
      title: 'สำเร็จ',
      description: 'อัปเดตข้อมูลพนักงานเรียบร้อยแล้ว',
      color: 'success'
    })
    isEditing.value = false
  } catch (error: any) {
    console.error('Failed to update employee details:', error)
    toast.add({
      title: 'เกิดข้อผิดพลาด',
      description: error.data?.statusMessage || error.message || 'ไม่สามารถอัปเดตข้อมูลได้',
      color: 'error'
    })
    isEditing.value = false
  } finally {
    isUpdating.value = false
  }
}

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
        comCode: effectiveComCode.value,
        limit: 1
      }
    })
    const emp = res.rows[0] || null
    if (emp) {
      // แปลงวันที่ให้เป็นรูปแบบ YYYY-MM-DD เพื่อให้ช่อง Input type="date" ทำงานได้ถูกต้อง
      if (emp.beginDate) emp.beginDate = formatDate(emp.beginDate)
      if (emp.endDate) emp.endDate = formatDate(emp.endDate)
    }
    employee.value = emp
  } catch (error) {
    console.error('Failed to fetch employee details:', error)
  } finally {
    loading.value = false
  }
}

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return '-'
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

onMounted(() => {
  fetchEmployee()
})

watch(() => [effectiveEmpCode.value, effectiveComCode.value], () => {
  fetchEmployee()
})
</script>

<template>
  <div class="max-w-4xl mx-auto p-4 w-full">
    <div v-if="loading" class="flex flex-col items-center justify-center p-8">
      <p class="text-gray-500 text-sm">กำลังดึงข้อมูล...</p>
    </div>

    <template v-else-if="employee">
      <UCard class="overflow-hidden border-none shadow-lg ring-1 ring-gray-200 dark:ring-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl">
        <template #header>
          <div class="flex justify-end">
            <UButton class="w-24 justify-center" color="primary" variant="soft" @click="isEditing ? cancelEdit() : startEdit()">
              {{ isEditing ? 'ยกเลิก' : 'แก้ไข' }}
            </UButton>
          </div>
        </template>

        <div class="flex flex-row items-center justify-between gap-4 py-2 overflow-x-auto">
          <div class="flex-1 min-w-[80px]">
            <p class="text-xs font-semibold text-gray-500 uppercase">ComCode</p>
            <p class="text-sm font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap">{{ employee.comCode }}</p>
          </div>

          <div class="flex-1 min-w-[80px]">
            <p class="text-xs font-semibold text-gray-500 uppercase">EmpCode</p>
            <p class="text-sm font-medium text-gray-800 dark:text-gray-200 font-mono whitespace-nowrap">{{ employee.empCode }}</p>
          </div>

          <div class="flex-1 min-w-[120px]">
            <p class="text-xs font-semibold text-gray-500 uppercase">Name</p>
            <p v-if="!isEditing" class="text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">{{ employee.name }}</p>
            <UInput v-else v-model="employee.name" size="sm" class="w-full" />
          </div>

          <div class="hidden md:block flex-1 min-w-[120px]">
            <p class="text-xs font-semibold text-gray-500 uppercase">BeginDate</p>
            <p v-if="!isEditing" class="text-sm font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap">{{ formatDate(employee.beginDate) }}</p>
            <UInput v-else type="date" v-model="employee.beginDate" size="sm" class="w-full" />
          </div>

          <div class="hidden md:block flex-1 min-w-[120px]">
            <p class="text-xs font-semibold text-gray-500 uppercase">EndDate</p>
            <p v-if="!isEditing" class="text-sm font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap">{{ formatDate(employee.endDate) }}</p>
            <UInput v-else type="date" v-model="employee.endDate" size="sm" class="w-full" />
          </div>

          <div class="hidden md:block flex-1 min-w-[80px]">
            <p class="text-xs font-semibold text-gray-500 uppercase">TimeCode</p>
            <p v-if="!isEditing" class="text-sm font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap">{{ employee.timeCode || 'ยังไม่ได้ระบุ' }}</p>
            <UInput v-else v-model="employee.timeCode" size="sm" class="w-full" />
          </div>
        </div>

        <template #footer>
          <div class="flex justify-end gap-3">
            <UButton class="w-24 justify-center" variant="ghost" color="neutral" to="/attendance/employee" v-if="!props.empCode && !sharedEmpCode">
              กลับ
            </UButton>
            <UButton class="w-24 justify-center" color="primary" @click="handleUpdate" :loading="isUpdating">
              Update
            </UButton>
          </div>
        </template>
      </UCard>
    </template>

    <div v-else-if="sharedEmpCode || route.query.empCode" class="flex flex-col items-center justify-center p-8 text-center">
      <h3 class="text-sm font-bold text-gray-900 dark:text-white">ไม่พบข้อมูลพนักงาน</h3>
    </div>
  </div>
</template>
