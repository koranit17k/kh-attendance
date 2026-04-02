import type { RowDataPacket } from 'mysql2'
import { pool } from '../utils/db'

interface DailyAttendanceRow extends RowDataPacket {
  dateAt: string
  fullDay: number
  halfDay: number
  absent: number
  late: number
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

  // Optimized query: Grouping by Date again for daily breakdown.
  const [rows] = await pool.execute<DailyAttendanceRow[]>(
    `
    SELECT
      dateAt,
      COUNT(CASE WHEN status = 'FullDay' THEN 1 END) AS fullDay,
      COUNT(CASE WHEN status = 'HalfDay' THEN 1 END) AS halfDay,
      COUNT(CASE WHEN status = 'Absent' THEN 1 END) AS absent,
      COUNT(CASE WHEN late_morning_minutes > 0 OR late_lunch_minutes > 0 THEN 1 END) AS late
    FROM attendance
    WHERE dateAt BETWEEN ? AND ?
    GROUP BY dateAt
    ORDER BY dateAt ASC
    `,
    [startDate, endDate]
  )

  return rows
})
