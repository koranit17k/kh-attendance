import { closePool } from '../utils/db'

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('close', async () => {
    await closePool()
  })
})
// เพื่อป้องกัน pool ค้าง ไว้แก้บัค pnpm build แล้วค้าง
