import type { RowDataPacket } from 'mysql2'
import { pool } from '../utils/db'

interface AttendanceSummaryRow extends RowDataPacket {
  startDate: string
  endDate: string
  fullDay: number
  halfDay: number
  absent: number
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

  const [rows] = await pool.execute<AttendanceSummaryRow[]>(
    `
    SELECT
      ? AS startDate,
      ? AS endDate,
      COUNT(CASE WHEN status = 'FullDay' THEN 1 END) AS fullDay,
      COUNT(CASE WHEN status = 'HalfDay' THEN 1 END) AS halfDay,
      COUNT(CASE WHEN status = 'Absent' THEN 1 END) AS absent
    FROM attendance
    WHERE dateAt BETWEEN ? AND ?
    `,
    [startDate, endDate, startDate, endDate]
  )

  return rows[0] ?? {
    startDate,
    endDate,
    fullDay: 0,
    halfDay: 0,
    absent: 0
  }
})