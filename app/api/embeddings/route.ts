import { NextRequest, NextResponse } from 'next/server'

// Cache the model to avoid reloading
let model: any = null

async function loadModel() {
  if (!model) {
    try {
      console.log('Loading Universal Sentence Encoder...')
      
      // Dynamic imports to avoid SSR issues
      const tf = await import('@tensorflow/tfjs')
      
      // Set backend for server-side execution
      if (typeof window === 'undefined') {
        // We're on the server, but let's use a simpler approach
        console.log('Server-side model loading...')
      }
      
      const use = await import('@tensorflow-models/universal-sentence-encoder')
      model = await use.load()
      console.log('Model loaded successfully')
    } catch (error) {
      console.error('Error loading Universal Sentence Encoder:', error)
      throw new Error(`Failed to load embedding model: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
  return model
}

export async function POST(request: NextRequest) {
  try {
    console.log('Embeddings API called')
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

    console.log(`Processing ${sentences.length} sentences`)

    // Load the model
    const useModel = await loadModel()
    console.log('Model ready, generating embeddings...')

    // Generate embeddings
    const embeddings = await useModel.embed(sentences)
    const embeddingsArray = await embeddings.array()

    // Clean up tensors to prevent memory leaks
    embeddings.dispose()

    console.log('Embeddings generated successfully')

    return NextResponse.json({
      embeddings: embeddingsArray,
      dimensions: embeddingsArray[0]?.length || 0,
      count: embeddingsArray.length,
      timestamp: new Date().toISOString()
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
    message: 'Embeddings API is running',
    model: 'Universal Sentence Encoder',
    maxSentences: 50,
    embeddingDimensions: 512
  })
}