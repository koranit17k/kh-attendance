import { pool } from '../utils/db'

export default defineEventHandler(async (event) => {
  const path = event.path
    // ไม่นับ api / asset
  if (path.startsWith('/api/') || path.startsWith('/_') || path.includes('.')) {
    return
  }

  const lastVisit = Number(getCookie(event, 'last_visit') || 0)
  const now = Date.now()
  const oneMinute = 60 * 1000

  if (!lastVisit || now - lastVisit >= oneMinute) {
    await pool.execute(
      'UPDATE counter SET `value` = `value` + 1, created_at = NOW() LIMIT 1'
    )

    setCookie(event, 'last_visit', String(now), {
      maxAge: 60,
      path: '/'
    })
  }
})