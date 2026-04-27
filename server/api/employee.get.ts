import type { RowDataPacket } from 'mysql2'
import { pool } from '../utils/db'

interface EmployeeRow extends RowDataPacket {
  empCode: number
  name: string
  beginDate: string | null
  endDate: string | null
  timeCode: number | null
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const limit = parseInt(query.limit as string) || 50
  const offset = parseInt(query.offset as string) || 0
  const comCode = query.comCode as string
  const q = query.q as string

  let sql = `SELECT comCode, empCode, name, beginDate, endDate, timeCode
             FROM employee`
  const params: any[] = []
  const conditions: string[] = []

  if (comCode) {
    conditions.push('comCode = ?')
    params.push(comCode)
  }

  if (q) {
    conditions.push('(name LIKE ? OR empCode = ?)')
    params.push(`%${q}%`, `${q}`)
  }

  let whereClause = ''
  if (conditions.length > 0) {
    whereClause = ' WHERE ' + conditions.join(' AND ')
  }

  // Count total matching rows
  const [countRows] = await pool.execute<any[]>(`SELECT COUNT(*) as total FROM employee ${whereClause}`, params)
  const total = countRows[0].total

  // Get paginated rows
  sql += whereClause + ' ORDER BY comCode ASC, empCode ASC LIMIT ? OFFSET ?'
  params.push(limit, offset)

  const [rows] = await pool.execute<EmployeeRow[]>(sql, params)

  return {
    rows,
    total
  }
})
