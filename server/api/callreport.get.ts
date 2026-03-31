export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  
  // The original backend URL
  const baseUrl = "http://localhost:8080/kxreport"
  
  // Construct the original URL with query parameters
  const targetUrl = `${baseUrl}/getPDF?${new URLSearchParams(query as Record<string, string>).toString()}`
  
  // Redirect the user to the PDF directly
  return sendRedirect(event, targetUrl)
})