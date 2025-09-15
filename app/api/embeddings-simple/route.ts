import { NextRequest, NextResponse } from 'next/server'

// Simple similarity calculation using TF-IDF-like approach
function calculateSimpleEmbedding(text: string): number[] {
  // Tokenize and create a simple vector representation
  const words = text.toLowerCase().match(/\b\w+\b/g) || []
  const uniqueWords = Array.from(new Set(words))
  
  // Create a 512-dimensional vector (to match USE dimensions)
  const embedding = new Array(512).fill(0)
  
  // Use word positions and frequencies to populate the vector
  words.forEach((word, index) => {
    const wordHash = hashString(word)
    const position = Math.abs(wordHash) % 512
    embedding[position] += 1 / (index + 1) // Weight by position
  })
  
  // Normalize the vector
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0))
  return magnitude > 0 ? embedding.map(val => val / magnitude) : embedding
}

function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return hash
}

export async function POST(request: NextRequest) {
  try {
    console.log('Simple embeddings API called')
    const { sentences }: { sentences: string[] } = await request.json()

    if (!sentences || !Array.isArray(sentences) || sentences.length === 0) {
      return NextResponse.json(
        { error: 'Invalid input: sentences array is required' },
        { status: 400 }
      )
    }

    if (sentences.length > 50) {
      return NextResponse.json(
        { error: 'Too many sentences: maximum 50 allowed' },
        { status: 400 }
      )
    }

    console.log(`Processing ${sentences.length} sentences with simple embeddings`)

    // Generate simple embeddings
    const embeddings = sentences.map(sentence => calculateSimpleEmbedding(sentence))

    console.log('Simple embeddings generated successfully')

    return NextResponse.json({
      embeddings,
      dimensions: 512,
      count: embeddings.length,
      timestamp: new Date().toISOString(),
      method: 'simple_tfidf'
    })

  } catch (error) {
    console.error('Error generating embeddings:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    return NextResponse.json(
      { 
        error: 'Failed to generate embeddings',
        details: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Simple Embeddings API is running',
    model: 'Simple TF-IDF based embeddings',
    maxSentences: 50,
    embeddingDimensions: 512
  })
}