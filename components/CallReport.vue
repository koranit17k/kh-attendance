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
        <URadioGroup
          v-model="form.report"
          indicator="start"
          variant="table"
          :items="reportOptions"
          :ui="{ label: 'text-lg leading-7 my-auto', item: 'items-center', container: 'self-center' }"
          class="mt-3"
        />
      </div>

      <Calendar />

      <div class="space-y-2 border-t pt-6 border-gray-200 dark:border-gray-800">
        <label class="font-semibold text-xl block">เลือกบริษัท</label>
        <div class="mt-3 grid grid-cols-2 grid-rows-4 grid-flow-col gap-2">
          <UCheckbox
            v-for="opt in companyOptions"
            :key="opt.value"
            :model-value="form.comCode.includes(opt.value)"
            @update:model-value="toggleCompany(opt.value)"
            :label="opt.label"
            indicator="start"
            variant="card"
            :ui="{ label: 'text-lg leading-7 my-auto', wrapper: 'items-center', container: 'self-center' }"
          />
        </div>
      </div>
      
      <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800 text-l text-gray-500">
        <p>วันที่ออกรายงาน: <strong>{{ formatDate(rangeState.start) }}</strong> ถึง <strong>{{ formatDate(rangeState.end) }}</strong> </p>
      </div>
    </div>

    <template #footer>
      <div class="flex flex-wrap gap-4 justify-between items-center w-full">
        <UButton color="neutral" size="lg" variant="outline" icon="i-heroicons-trash" @click="clearForm">reset</UButton>
        <div class="flex gap-4">
          <UButton color="primary" size="lg" icon="i-heroicons-document-text" @click="getPDF">GET PDF</UButton>
          <UButton color="neutral" size="lg" variant="solid" icon="i-heroicons-arrow-down-tray" @click="openPDF">OPEN PDF</UButton>
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
const isSelecting = useState('attendance-selecting', () => false)
const calendarResetId = useState('calendar-reset-id', () => 0)

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
  isSelecting.value = false
  rangeState.value.start = today(getLocalTimeZone()).toString()
  rangeState.value.end = today(getLocalTimeZone()).toString()
  calendarResetId.value++
}

const toggleCompany = (code: string) => {
  const idx = form.comCode.indexOf(code)
  if (idx === -1) form.comCode.push(code)
  else form.comCode.splice(idx, 1)
}

const reportOptions = [
  { value: 'A01', label: '1 เช็คเวลาประจำวัน' },
  { value: 'A02', label: '2 ตรวจสอบรายบุคคล' },
  { value: 'A03', label: '3 สรุปประจำเดือน' },
  { value: 'A04', label: '4 วิเคราะห์พนักงาน' },
  { value: 'A05', label: '5 วิเคราะห์บริษัท' }
] as { value: string; label: string }[]

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

  if (form.report === 'A05') {
    const payload = { 
        ...form, 
        comCode: form.comCode.join(','),
        startDate: rangeState.value.start,
        endDate: rangeState.value.end
    } as any
    const params = new URLSearchParams(payload)
    window.open(`/api/callreport?${params.toString()}`, "_blank")
  } else {
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
}

const openPDF = async () => {
  if (!validateForm()) return
  
  const processReport = async (codeStr: string) => {
    const payload = { 
        ...form, 
        comCode: codeStr,
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
        alert(`Error for company ${codeStr}: ${e.message}`)
        if (reportWindow) reportWindow.close()
    }
  }

  if (form.report === 'A05') {
    await processReport(form.comCode.join(','))
  } else {
    for (const code of form.comCode) {
      await processReport(code)
    }
  }
}
</script>
