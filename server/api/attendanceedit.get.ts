import type { RowDataPacket } from 'mysql2'
import { pool } from '../utils/db'

interface AttendanceRow extends RowDataPacket {
  dateAt: string
  comCode: string
  empCode: number
  morning: string | null
  lunch_out: string | null
  lunch_in: string | null
  evening: string | null
  night: string | null
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const comCode = query.comCode as string
  const empCode = query.empCode as string
  const dateAt = query.dateAt as string

  if (!comCode || !empCode || !dateAt) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing comCode, empCode, or dateAt'
    })
  }

  const sql = `SELECT dateAt, comCode, empCode, morning, lunch_out, lunch_in, evening, night
               FROM attendance 
               WHERE comCode = ? AND empCode = ? AND dateAt = ? LIMIT 1`
  
  const [rows] = await pool.execute<AttendanceRow[]>(sql, [comCode, empCode, dateAt])

  return {
    attendance: rows.length > 0 ? rows[0] : null
  }
})