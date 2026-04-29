import type { RowDataPacket } from 'mysql2'
import { pool } from '../utils/db'

interface EmployeeRow extends RowDataPacket {
  empCode: number
  name: string
  beginDate: string | null
  endDate: string | null
  timeCode: number | null
  comCode: string
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const comCode = query.comCode as string
  const empCode = query.empCode as string

  if (!comCode || !empCode) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing comCode or empCode'
    })
  }

  const sql = `SELECT comCode, empCode, name, beginDate, endDate, timeCode
               FROM employee 
               WHERE comCode = ? AND empCode = ? LIMIT 1`
  
  const [rows] = await pool.execute<EmployeeRow[]>(sql, [comCode, empCode])

  return {
    employee: rows.length > 0 ? rows[0] : null
  }
})
