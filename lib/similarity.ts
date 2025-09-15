import { SimilarityMetrics, ComparisonResult, EmbeddingData } from '@/types/embeddings'

/**
 * Calculate cosine similarity between two vectors
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length')
  }

  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0)
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0))
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0))

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0
  }

  return dotProduct / (magnitudeA * magnitudeB)
}

/**
 * Calculate Euclidean distance between two vectors
 */
export function euclideanDistance(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length')
  }

  const sumSquares = a.reduce((sum, val, i) => {
    const diff = val - b[i]
    return sum + diff * diff
  }, 0)

  return Math.sqrt(sumSquares)
}

/**
 * Calculate Manhattan distance between two vectors
 */
export function manhattanDistance(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length')
  }

  return a.reduce((sum, val, i) => sum + Math.abs(val - b[i]), 0)
}

/**
 * Calculate dot product between two vectors
 */
export function dotProduct(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length')
  }

  return a.reduce((sum, val, i) => sum + val * b[i], 0)
}

/**
 * Calculate all similarity metrics between two embeddings
 */
export function calculateSimilarityMetrics(
  embedding1: number[],
  embedding2: number[]
): SimilarityMetrics {
  return {
    cosineSimilarity: cosineSimilarity(embedding1, embedding2),
    euclideanDistance: euclideanDistance(embedding1, embedding2),
    manhattanDistance: manhattanDistance(embedding1, embedding2),
    dotProduct: dotProduct(embedding1, embedding2),
  }
}

/**
 * Get human-readable interpretation of similarity scores
 */
export function interpretSimilarity(cosineSim: number): {
  interpretation: string
  confidenceLevel: 'high' | 'medium' | 'low'
} {
  if (cosineSim >= 0.9) {
    return {
      interpretation: 'Extremely similar - nearly identical meaning',
      confidenceLevel: 'high'
    }
  } else if (cosineSim >= 0.8) {
    return {
      interpretation: 'Very similar - closely related concepts',
      confidenceLevel: 'high'
    }
  } else if (cosineSim >= 0.7) {
    return {
      interpretation: 'Similar - related themes or topics',
      confidenceLevel: 'medium'
    }
  } else if (cosineSim >= 0.5) {
    return {
      interpretation: 'Somewhat similar - some shared concepts',
      confidenceLevel: 'medium'
    }
  } else if (cosineSim >= 0.3) {
    return {
      interpretation: 'Slightly similar - few shared elements',
      confidenceLevel: 'low'
    }
  } else {
    return {
      interpretation: 'Different - distinct meanings or topics',
      confidenceLevel: 'low'
    }
  }
}

/**
 * Compare two sentences and return detailed analysis
 */
export function compareSentences(
  sentence1: string,
  sentence2: string,
  embedding1: number[],
  embedding2: number[]
): ComparisonResult {
  const metrics = calculateSimilarityMetrics(embedding1, embedding2)
  const { interpretation, confidenceLevel } = interpretSimilarity(metrics.cosineSimilarity)

  return {
    sentence1,
    sentence2,
    metrics,
    interpretation,
    confidenceLevel,
  }
}

/**
 * Find the most similar sentence to a given sentence
 */
export function findMostSimilar(
  targetSentence: string,
  targetEmbedding: number[],
  candidates: EmbeddingData[]
): { sentence: string; similarity: number } | null {
  if (candidates.length === 0) return null

  let maxSimilarity = -1
  let mostSimilar = ''

  candidates.forEach(candidate => {
    if (candidate.sentence !== targetSentence) {
      const similarity = cosineSimilarity(targetEmbedding, candidate.embedding)
      if (similarity > maxSimilarity) {
        maxSimilarity = similarity
        mostSimilar = candidate.sentence
      }
    }
  })

  return maxSimilarity > -1 ? { sentence: mostSimilar, similarity: maxSimilarity } : null
}

/**
 * Calculate average similarity within a group of embeddings
 */
export function calculateGroupSimilarity(embeddings: number[][]): number {
  if (embeddings.length < 2) return 1

  let totalSimilarity = 0
  let comparisons = 0

  for (let i = 0; i < embeddings.length; i++) {
    for (let j = i + 1; j < embeddings.length; j++) {
      totalSimilarity += cosineSimilarity(embeddings[i], embeddings[j])
      comparisons++
    }
  }

  return comparisons > 0 ? totalSimilarity / comparisons : 0
}