// Simple test script to verify the API endpoints
import fetch from 'node-fetch'

const testSentences = [
  "I love programming",
  "Programming is fun",
  "The weather is nice today"
]

async function testAPI() {
  try {
    console.log('Testing main embeddings API...')
    
    const response = await fetch('http://localhost:3001/api/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sentences: testSentences }),
    })

    if (response.ok) {
      const data = await response.json()
      console.log('✅ Main API working! Embeddings shape:', data.embeddings.map(e => e.length))
    } else {
      console.log('❌ Main API failed:', response.status)
      
      // Try fallback API
      console.log('Testing fallback embeddings API...')
      const fallbackResponse = await fetch('http://localhost:3001/api/embeddings-simple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sentences: testSentences }),
      })

      if (fallbackResponse.ok) {
        const fallbackData = await fallbackResponse.json()
        console.log('✅ Fallback API working! Embeddings shape:', fallbackData.embeddings.map(e => e.length))
      } else {
        console.log('❌ Fallback API also failed:', fallbackResponse.status)
      }
    }
  } catch (error) {
    console.error('Test failed:', error.message)
  }
}

testAPI()