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

    // Threshold: Absent rate > 20% means Red (Error)
    const dateStats: Record<string, 'success' | 'error'> = {}
    
    records.forEach(record => {
        const absent = Number(record.absentCount)
        const total = Number(record.totalCount)
        
        if (total > 0) {
            const absentRate = absent / total
            const date = new Date(record.dateAt)
            const dateStr = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`
            
            dateStats[dateStr] = absentRate <= 0.20 ? 'success' : 'error'
        }
    })

    return {
        stats: dateStats
    }
})