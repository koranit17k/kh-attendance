<script setup lang="ts">
const props = defineProps<{
  empCode?: string | number
  dateAt?: string
}>()

const sharedEmpCode = useState<string | number | null>('selectedEmpCode', () => null)
const sharedComCode = useState<string | null>('selectedComCode', () => null)
const sharedDateAt = useState<string | null>('selectedDateAt', () => null)
const route = useRoute()
const effectiveEmpCode = computed(() => props.empCode || sharedEmpCode.value || route.query.empCode)
const effectiveComCode = computed(() => sharedComCode.value || route.query.comCode)
const effectiveDateAt = computed(() => props.dateAt || sharedDateAt.value || route.query.dateAt)

const attendance = ref<any>(null)
const attendanceBackup = ref<any>(null)
const loading = ref(false)
const isEditing = ref(false)
const isUpdating = ref(false)

function startEdit() {
  attendanceBackup.value = JSON.parse(JSON.stringify(attendance.value))
  isEditing.value = true
}

function cancelEdit() {
  if (attendanceBackup.value) {
    attendance.value = JSON.parse(JSON.stringify(attendanceBackup.value))
  }
  isEditing.value = false
}

const toast = useToast()
const refreshTrigger = useState<number>('attendanceRefreshTrigger', () => 0)

async function handleUpdate() {
  isUpdating.value = true
  try {
    const updateData = {
      ...attendance.value,
      reason: '  1',
      modified_by: 'admin',
      modified_at: new Date(),
      approved_by: 'admin',
      approved_at: new Date()
    }
    
    await $fetch('/api/attendanceedit', {
      method: 'PUT',
      body: updateData
    })
    
    // เรียก procedure หลังจากอัปเดตสำเร็จ
    try {
      await $fetch('/api/attprocedure', {
        method: 'PUT',
        body: {
          date: attendance.value.dateAt
        }
      })
    } catch (procedureError: any) {
      console.warn('Procedure call failed:', procedureError)
      // ไม่ต้องแสดง error ถ้า procedure ล้มเหลว เพราะ update สำเร็จแล้ว
    }
    
    toast.add({
      title: 'สำเร็จ',
      description: 'อัปเดตข้อมูลการเข้า-ออกงานเรียบร้อยแล้ว',
      color: 'success'
    })
    isEditing.value = false
    refreshTrigger.value++
  } catch (error: any) {
    console.error('Failed to update attendance details:', error)
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

async function fetchAttendance() {
  if (!effectiveEmpCode.value || !effectiveDateAt.value) {
    attendance.value = null
    return
  }
  
  loading.value = true
  try {
    const res = await $fetch<{ attendance: any }>('/api/attendanceedit', {
      query: {
        empCode: effectiveEmpCode.value,
        comCode: effectiveComCode.value,
        dateAt: effectiveDateAt.value
      }
    })
    const att = res.attendance || null
    if (att) {
      if (att.dateAt) att.dateAt = formatDate(att.dateAt)
    }
    attendance.value = att
  } catch (error) {
    console.error('Failed to fetch attendance details:', error)
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

function handleTimeInput(event: Event, field: string) {
  const input = event.target as HTMLInputElement
  let value = input.value
  
  // ลบตัวอักษรที่ไม่ใช่ตัวเลขและเครื่องหมาย :
  value = value.replace(/[^0-9:]/g, '')
  
  // จัดการรูปแบบเวลา
  if (value.length === 2 && !value.includes(':')) {
    // ถ้าพิมพ์ตัวเลข 2 ตัวแล้ว ให้เพิ่ม :
    value = value + ':'
  } else if (value.length > 5) {
    // จำกัดความยาวสูงสุด 5 ตัวอักษร (HH:MM)
    value = value.slice(0, 5)
  }
  
  // อัปเดตค่าใน model
  if (attendance.value) {
    attendance.value[field] = value
  }
  
  // อัปเดตค่าใน input
  input.value = value
}

onMounted(() => {
  fetchAttendance()
})

watch(() => [effectiveEmpCode.value, effectiveComCode.value, effectiveDateAt.value], () => {
  fetchAttendance()
})
</script>

<template>
  <div class="w-full p-1">
    <div v-if="loading" class="flex flex-col items-center justify-center p-8">
      <p class="text-gray-500 text-sm">กำลังดึงข้อมูล...</p>
    </div>

    <template v-else-if="attendance">
      <UCard 
        class="overflow-hidden shadow-lg ring-1 ring-gray-200 dark:ring-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl"
        :ui="{ body: 'px-4 py-4 sm:p-4', footer: 'px-4 py-3 sm:px-4' }"
      >

        <div class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p class="text-s font-semibold text-gray-500 uppercase mb-1">บริษัท</p>
              <p class="text-sm font-medium text-gray-800 dark:text-gray-200">{{ attendance.comCode }}</p>
            </div>

            <div>
              <p class="text-s font-semibold text-gray-500 uppercase mb-1">รหัสพนักงาน</p>
              <p class="text-sm font-medium text-gray-800 dark:text-gray-200 font-mono">{{ attendance.empCode }}</p>
            </div>

            <div>
              <p class="text-s font-semibold text-gray-500 uppercase mb-1">วันที่</p>
              <p v-if="!isEditing" class="text-sm font-medium text-gray-900 dark:text-white">{{ formatDate(attendance.dateAt) }}</p>
              <UInput v-else type="date" v-model="attendance.dateAt" size="sm" class="w-full" />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div>
              <p class="text-s font-semibold text-gray-500 uppercase mb-1">เข้างาน</p>
              <p v-if="!isEditing" class="text-sm font-medium text-gray-800 dark:text-gray-200">{{ attendance.morning || '-' }}</p>
              <UInput v-else :value="attendance.morning" @input="handleTimeInput($event, 'morning')" size="sm" class="w-full" placeholder="08:00" />
            </div>

            <div>
              <p class="text-s font-semibold text-gray-500 uppercase mb-1">ออกพัก</p>
              <p v-if="!isEditing" class="text-sm font-medium text-gray-800 dark:text-gray-200">{{ attendance.lunch_out || '-' }}</p>
              <UInput v-else :value="attendance.lunch_out" @input="handleTimeInput($event, 'lunch_out')" size="sm" class="w-full" placeholder="12:00" />
            </div>

            <div>
              <p class="text-s font-semibold text-gray-500 uppercase mb-1">เข้าพัก</p>
              <p v-if="!isEditing" class="text-sm font-medium text-gray-800 dark:text-gray-200">{{ attendance.lunch_in || '-' }}</p>
              <UInput v-else :value="attendance.lunch_in" @input="handleTimeInput($event, 'lunch_in')" size="sm" class="w-full" placeholder="13:00" />
            </div>

            <div>
              <p class="text-s font-semibold text-gray-500 uppercase mb-1">เลิกงาน</p>
              <p v-if="!isEditing" class="text-sm font-medium text-gray-800 dark:text-gray-200">{{ attendance.evening || '-' }}</p>
              <UInput v-else :value="attendance.evening" @input="handleTimeInput($event, 'evening')" size="sm" class="w-full" placeholder="17:00" />
            </div>

            <div>
              <p class="text-s font-semibold text-gray-500 uppercase mb-1">ออก OT</p>
              <p v-if="!isEditing" class="text-sm font-medium text-gray-800 dark:text-gray-200">{{ attendance.night || '-' }}</p>
              <UInput v-else :value="attendance.night" @input="handleTimeInput($event, 'night')" size="sm" class="w-full" placeholder="22:00" />
            </div>
          </div>
        </div>

        <template #footer>
          <div class="flex justify-between items-center w-full">
            <div>
              <UButton class="w-24 justify-center" color="primary" variant="soft" @click="isEditing ? cancelEdit() : startEdit()">
                {{ isEditing ? 'ยกเลิก' : 'แก้ไข' }}
              </UButton>
            </div>
            <div class="flex gap-3">
              <UButton class="w-24 justify-center" variant="ghost" color="neutral" to="/attendance/attendance" v-if="!props.empCode && !sharedEmpCode">
                กลับ
              </UButton>
              <UButton class="w-24 justify-center" color="primary" @click="handleUpdate" :loading="isUpdating">
                Update
              </UButton>
            </div>
          </div>
        </template>
      </UCard>
    </template>

    <div v-else-if="sharedEmpCode || route.query.empCode" class="flex flex-col items-center justify-center p-8 text-center">
      <h3 class="text-sm font-bold text-gray-900 dark:text-white">ไม่พบข้อมูลการเข้า-ออกงาน</h3>
    </div>
  </div>
</template>
