import type { RowDataPacket } from 'mysql2'
import { pool } from '../utils/db'

interface CompanyRow extends RowDataPacket {
  comCode: string
  comName: string
}

export default defineEventHandler(async (event) => {
  const [rows] = await pool.execute<CompanyRow[]>(
    'SELECT comCode, comName FROM company ORDER BY comCode ASC'
  )

  return rows
})
