let count = 0

export default defineEventHandler(async (event) => {
  console.log(count)
  count++
  return count
})
