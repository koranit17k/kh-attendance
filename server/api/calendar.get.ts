import { pool } from '../utils/db'

export default defineEventHandler(async () => {
  const [rows] = await pool.query(
    'SELECT DISTINCT `dateAt` FROM attendance WHERE `dateAt` IS NOT NULL ORDER BY `dateAt`'
  )

  const result = rows as Array<{ dateAt: string }>

  return {
    dates: result.map(r => r.dateAt)
  }
})