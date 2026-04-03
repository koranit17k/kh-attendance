import type { RowDataPacket } from 'mysql2'
import { pool } from '../utils/db'

interface CompanyAttendanceRow extends RowDataPacket {
  name: string
  value: number
}

function getTodayBangkok() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' })
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  const startDate =
    typeof query.startDate === 'string' && query.startDate
      ? query.startDate
      : getTodayBangkok()

  const endDate =
    typeof query.endDate === 'string' && query.endDate
      ? query.endDate
      : startDate

  // Group by company name (comName)
  const [rows] = await pool.execute<CompanyAttendanceRow[]>(
    `
    SELECT
      c.comName AS name,
      COUNT(a.empCode) AS value
    FROM attendance a
    JOIN company c ON a.comCode = c.comCode
    WHERE a.dateAt BETWEEN ? AND ?
    GROUP BY c.comName
    `,
    [startDate, endDate]
  )

  return rows
})
