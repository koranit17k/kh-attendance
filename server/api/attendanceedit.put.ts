import { pool } from '../utils/db'

function formatDBTime(timeVal: any): string | null {
  if (!timeVal || timeVal === '') return null
  return String(timeVal).trim()
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { comCode, empCode, dateAt, morning, lunch_out, lunch_in, evening, night } = body

  if (!comCode || !empCode || !dateAt) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing comCode, empCode, or dateAt'
    })
  }

  try {
    const [result] = await pool.execute(
      'UPDATE attendance SET morning = ?, lunch_out = ?, lunch_in = ?, evening = ?, night = ? WHERE comCode = ? AND empCode = ? AND dateAt = ?',
      [
        formatDBTime(morning),
        formatDBTime(lunch_out),
        formatDBTime(lunch_in),
        formatDBTime(evening),
        formatDBTime(night),
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