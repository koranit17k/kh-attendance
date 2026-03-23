import express from 'express'
import cors from 'cors'
import mysql from 'mysql2/promise'

const app = express()
const port = 3001

app.use(cors())
app.use(express.json())

const pool = mysql.createPool({
  host: 'localhost',
  user: 'koranit',
  password: 'oeviivog',
  database: 'payroll'
})

app.post('/api/counter', async (req, res) => {
  try {
    const { count } = req.body

    if (typeof count !== 'number') {
      return res.status(400).json({ message: 'count ต้องเป็นตัวเลข' })
    }

    await pool.execute(
      'INSERT INTO counter_logs (count_value) VALUES (?)',
      [count]
    )

    res.json({ message: 'บันทึกสำเร็จ', count })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'เกิดข้อผิดพลาดที่ server' })
  }
})

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`)
})