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
  const limit = parseInt(query.limit as string) || 50
  const page = parseInt(query.page as string) || 1
  const offset = (page - 1) * limit
  
  const comCode = query.comCode as string
  const empCode = query.empCode as string
  const dateAt = query.dateAt as string
  
  let sql = `SELECT dateAt, comCode, empCode, morning, lunch_out, lunch_in, evening, night
             FROM attendance`
  const params: any[] = []
  const conditions: string[] = []

  if (comCode) {
    conditions.push('comCode = ?')
    params.push(comCode)
  }

  if (empCode) {
    conditions.push('empCode = ?')
    params.push(empCode)
  }
  
  if (dateAt) {
    conditions.push('dateAt = ?')
    params.push(dateAt)
  }

  let whereClause = ''
  if (conditions.length > 0) {
    whereClause = ' WHERE ' + conditions.join(' AND ')
  }

  // Count total matching rows
  const [countRows] = await pool.execute<any[]>(`SELECT COUNT(*) as total FROM attendance ${whereClause}`, params)
  const total = countRows[0].total

  // Get paginated rows
  sql += whereClause + ' ORDER BY dateAt DESC, comCode ASC, empCode ASC LIMIT ? OFFSET ?'
  params.push(limit, offset)

  const [rows] = await pool.execute<AttendanceRow[]>(sql, params)

  return {
    rows,
    total
  }
})
