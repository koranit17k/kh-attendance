import mysql from 'mysql2/promise'

let _pool: mysql.Pool | null = null

export function getPool(): mysql.Pool {
  if (!_pool) {
    _pool = mysql.createPool({
      host: 'localhost',
      user: 'koranit',
      password: 'oeviivog',
      database: 'payroll'
    })
  }
  return _pool
}

/** @deprecated use getPool() instead */
export const pool = new Proxy({} as mysql.Pool, {
  get(_target, prop) {
    return (getPool() as any)[prop]
  }
})
