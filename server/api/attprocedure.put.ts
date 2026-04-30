import { pool } from '../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { date } = body

  if (!date) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing date parameter'
    })
  }

  try {
    const [result] = await pool.execute('CALL runAttendance(?)', [date])
    return { success: true, result }
  } catch (error: any) {
    console.error('Procedure Error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message
    })
  }
})