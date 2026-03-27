import { pool } from '../utils/db'

export default defineEventHandler(async () => {
    // Fetch individual counts for each status per date
    const [rows] = await pool.query(`
        SELECT 
            dateAt,
            SUM(CASE WHEN LOWER(status) = 'absent' THEN 1 ELSE 0 END) as absentCount,
            SUM(CASE WHEN LOWER(status) IN ('fullday', 'halfday') THEN 1 ELSE 0 END) as presentCount,
            COUNT(*) as totalCount
        FROM attendance 
        WHERE dateAt IS NOT NULL 
        GROUP BY dateAt 
        ORDER BY dateAt
    `)

    const records = rows as Array<{ 
        dateAt: string, 
        absentCount: number | string, 
        presentCount: number | string, 
        totalCount: number | string 
    }>

    // Threshold: Absent rate > 50% means Red (Error)
    // We only return "Green" (Success) dates where Absent rate <= 50%
    const greenDates = records
        .filter(record => {
            const absent = Number(record.absentCount)
            const total = Number(record.totalCount)
            
            if (total === 0) return false
            
            const absentRate = absent / total
            return absentRate <= 0.35 // Success only if 35% or less are absent
        })
        .map(record => record.dateAt)

    return {
        dates: greenDates
    }
})