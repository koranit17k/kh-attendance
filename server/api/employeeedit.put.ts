import { pool } from '../utils/db'

function formatDBDate(dateVal: any): string | null {
  if (!dateVal || dateVal === '') return null
  const d = new Date(dateVal)
  if (isNaN(d.getTime())) return null
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { comCode, empCode, name, beginDate, endDate, timeCode } = body

  if (!comCode || !empCode) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing comCode or empCode'
    })
  }

  try {
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
    return { success: true, result }
  } catch (error: any) {
    console.error('Update Error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message
    })
  }
})
