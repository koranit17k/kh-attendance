import { pool } from '../utils/db'

function formatDBTime(timeVal: any): string | null {
  if (!timeVal || timeVal === '') return null
  return String(timeVal).trim()
}

function formatDateTime(dateVal: any): string | null {
  if (!dateVal) return null
  const date = new Date(dateVal)
  if (isNaN(date.getTime())) return null
  return date.toISOString().slice(0, 19).replace('T', ' ')
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { comCode, empCode, dateAt, morning, lunch_out, lunch_in, evening, night, reason,status_check, modified_by, modified_at, approved_by, approved_at } = body

  if (!comCode || !empCode || !dateAt) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing comCode, empCode, or dateAt'
    })
  }

  try {
    const [result] = await pool.execute(
      'UPDATE attendance SET morning = ?, lunch_out = ?, lunch_in = ?, evening = ?, night = ?, reason = ?,status_check = ?, modified_by = ?, modified_at = ?, approved_by = ?, approved_at = ? WHERE comCode = ? AND empCode = ? AND dateAt = ?',
      [
        formatDBTime(morning),
        formatDBTime(lunch_out),
        formatDBTime(lunch_in),
        formatDBTime(evening),
        formatDBTime(night),
        reason || '1',
        status_check || '1',
        modified_by || 'admin',
        formatDateTime(modified_at) || formatDateTime(new Date()),
        approved_by || 'admin',
        formatDateTime(approved_at) || formatDateTime(new Date()),
        comCode,
        empCode,
        dateAt
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