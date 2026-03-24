import { pool } from '../utils/db'

export default defineEventHandler(async (event) => {
    const [rows] = await pool.query(
      'SELECT `value` FROM counter LIMIT 1'
    )
    const result = rows as Array<{ value: number }>
    return result[0]?.value ?? 0
})

