import { pool } from '../utils/db'

export default defineEventHandler(async (event) => {
  console.time('update-employee')
  const body = await readBody(event)
  const { comCode, empCode, name, beginDate, endDate, timeCode } = body

  if (!comCode || !empCode) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing comCode or empCode'
    })
  }

  try {
    // ฟังก์ชันช่วยจัดการรูปแบบวันที่ให้เป็น YYYY-MM-DD
    const formatDBDate = (dateVal: any) => {
      if (!dateVal || dateVal === '') return null
      try {
        const d = new Date(dateVal)
        if (isNaN(d.getTime())) return null
        // ใช้ Local Time เพื่อหลีกเลี่ยงปัญหาเรื่อง Timezone เลื่อนวัน
        const year = d.getFullYear()
        const month = String(d.getMonth() + 1).padStart(2, '0')
        const day = String(d.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
      } catch (e) {
        return null
      }
    }

    console.log('Updating employee:', { comCode, empCode, name, beginDate, endDate, timeCode })
    
    const [result] = await pool.execute(
      'UPDATE employee SET name = ?, beginDate = ?, endDate = ?, timeCode = ? WHERE comCode = ? AND empCode = ?',
      [
        name || null,
        formatDBDate(beginDate),
        formatDBDate(endDate),
        (timeCode === '' || timeCode === null || timeCode === undefined) ? null : Number(timeCode),
        comCode,
        empCode
      ]
    )
    console.timeEnd('update-employee')
    return { success: true, result }
  } catch (error: any) {
    console.error('Update Error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message
    })
  }
})
