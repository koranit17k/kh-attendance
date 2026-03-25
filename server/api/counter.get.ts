import { pool } from '../utils/db'

export default defineEventHandler(async (event) => {
    const [rows] = await pool.query(
      'SELECT `value`, `created_at` FROM counter'
    )
    const result = rows as Array<{ value: number, created_at: string }>
    
    return {
        value: result[0]?.value ?? 0,
        dates: result.map(r => r.created_at)
    }
})

