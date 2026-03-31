<template>
  <UCard class="max-w-4xl mx-auto my-8 mt-12">
    <template #header>
      <div class="flex items-center gap-4">
        <h2 class="text-3xl font-bold">ออกรายงาน</h2>
      </div>
    </template>

    <div class="space-y-6">
      <div class="space-y-2">
        <label class="font-semibold text-xl block">เลือกรายงาน</label>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
          <label v-for="opt in reportOptions" :key="opt.value" class="flex items-center gap-3 cursor-pointer">
            <input type="radio" v-model="form.report" :value="opt.value" class="w-6 h-6 text-primary focus:ring-primary border-gray-300 rounded-full" />
            <span class="text-gray-700 dark:text-gray-200 text-lg">{{ opt.label }}</span>
          </label>
        </div>
      </div>

      <Calendar />
      
      <div class="space-y-2 border-t pt-6 border-gray-200 dark:border-gray-800">
        <label class="font-semibold text-xl block">เลือกบริษัท</label>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
          <label v-for="opt in companyOptions" :key="opt.value" class="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" v-model="form.comCode" :value="opt.value" class="w-6 h-6 text-primary focus:ring-primary border-gray-300 rounded" />
            <span class="text-gray-700 dark:text-gray-200 text-lg">{{ opt.label }}</span>
          </label>
        </div>
      </div>
      
      <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800 text-l text-gray-500">
        <p>วันที่ออกรายงาน: <strong>{{ formatDate(rangeState.start) }}</strong> ถึง <strong>{{ formatDate(rangeState.end) }}</strong> </p>
      </div>
    </div>

    <template #footer>
      <div class="flex flex-wrap gap-4 justify-between items-center w-full">
        <UButton color="neutral" size="lg" variant="outline" icon="i-heroicons-trash" @click="clearForm">Clear</UButton>
        <div class="flex gap-4">
          <UButton color="primary" size="lg" icon="i-heroicons-document-text" @click="getPDF">GET PDF (New Tab)</UButton>
          <UButton color="neutral" size="lg" variant="solid" icon="i-heroicons-arrow-down-tray" @click="openPDF">OPEN PDF (Proxy)</UButton>
        </div>
      </div>
    </template>
  </UCard>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { today, getLocalTimeZone } from '@internationalized/date'

const rangeState = useState<{ start: string, end: string }>('attendance-range', () => ({
  start: today(getLocalTimeZone()).toString(),
  end: today(getLocalTimeZone()).toString()
}))

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })
}

const form = reactive({
  report: 'A01',
  comCode: [] as string[],
  db: 'payroll'
})

const clearForm = () => {
  form.report = ''
  form.comCode = []
  rangeState.value.start = today(getLocalTimeZone()).toString()
  rangeState.value.end = today(getLocalTimeZone()).toString()
}

const reportOptions = [
  { value: 'A01', label: '1 เช็คเวลาประจำวัน' },
  { value: 'A02', label: '2 ตรวจสอบรายบุคคล' },
  { value: 'A03', label: '3 สรุปประจำเดือน' },
  { value: 'A04', label: '4 วิเคราะห์พนักงาน' },
  { value: 'A05', label: '5 วิเคราะห์บริษัท' }
]

const companyOptions = [
  { value: '01', label: '1 กี่หิ้น การไฟฟ้าภูเก็ต' },
  { value: '02', label: '2 บ้านสุขภัณฑ์และวัสดุ' },
  { value: '03', label: '3 กี่หิ้น เทรดดิ้งจำกัด' },
  { value: '04', label: '4 เคบีคอมเมิร์ซจำกัด' },
  { value: '05', label: '5 กี่หิ้น เวอร์คชอพจำกัด' },
  { value: '06', label: '6 กี่หิ้น คอนเทร็คเตอร์จำกัด' },
  { value: '07', label: '7 พนักงานจ้าง' }
]

const validateForm = () => {
  if (!form.report || form.comCode.length === 0) {
    alert("กรุณาเลือก Report Name และ Company Name อย่างน้อย 1 รายการ")
    return false
  }
  return true
}

const getPDF = () => {
  if (!validateForm()) return

  for (const code of form.comCode) {
    const payload = { 
        ...form, 
        comCode: code,
        startDate: rangeState.value.start,
        endDate: rangeState.value.end
    } as any
    const params = new URLSearchParams(payload)
    window.open(`/api/callreport?${params.toString()}`, "_blank")
  }
}

const openPDF = async () => {
  if (!validateForm()) return
  
  for (const code of form.comCode) {
    const payload = { 
        ...form, 
        comCode: code,
        startDate: rangeState.value.start,
        endDate: rangeState.value.end
    }
    const reportWindow = window.open("", "_blank")
    if (!reportWindow) {
        alert("Please allow pop-ups for this site to open multiple reports.");
        return;
    }
    
    try {
        const response = await fetch("/api/callreport", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        })
        if (!response.ok) throw new Error(`Status: ${response.status}`)
        const blob = await response.blob()
        const blobUrl = URL.createObjectURL(blob)
        reportWindow.location.href = blobUrl
    } catch (e: any) {
        console.error(e)
        alert(`Error for company ${code}: ${e.message}`)
        if (reportWindow) reportWindow.close()
    }
  }
}
</script>
