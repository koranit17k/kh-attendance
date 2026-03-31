export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  const baseUrl = "http://localhost:8080/kxreport"
  
  // Proxy the POST request to the report server
  try {
    const response = await fetch(`${baseUrl}/openPDF`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
    
    if (!response.ok) {
        throw createError({ statusCode: response.status, statusMessage: `Report server error: ${response.statusText}` })
    }
    
    // Return the blob
    const blob = await response.blob()
    // Set headers
    setResponseHeader(event, 'Content-Type', 'application/pdf')
    // Convert blob to ArrayBuffer for Nitro response
    const arrayBuffer = await blob.arrayBuffer()
    return Buffer.from(arrayBuffer)
  } catch (err: any) {
    throw createError({ statusCode: 500, statusMessage: err.message })
  }
})
