import { Matrix } from 'ml-matrix'
import { PCA } from 'ml-pca'
import { TSNE } from 'tsne-js'
import { ProcessedEmbeddings, EmbeddingData, VisualizationConfig } from '@/types/embeddings'

/**
 * Perform PCA dimensionality reduction
 */
export function performPCA(
  embeddings: number[][],
  dimensions: 2 | 3 = 2
): { reduced: number[][]; variance: number[] } {
  try {
    if (embeddings.length < 2) {
      // Not enough data for PCA, return simple projection
      return {
        reduced: embeddings.map((emb, i) => [i, 0, 0].slice(0, dimensions)),
        variance: Array(dimensions).fill(0.5)
      }
    }

    const matrix = new Matrix(embeddings)
    const pca = new PCA(matrix, { center: true, scale: false })
    
    const reduced = pca.predict(matrix, { nComponents: dimensions }).to2DArray()
    const variance = pca.getExplainedVariance()
    
    return {
      reduced,
      variance: variance.slice(0, dimensions)
    }
  } catch (error) {
    console.error('PCA failed:', error)
    // Fallback to simple 2D projection based on first two dimensions
    return {
      reduced: embeddings.map((emb, i) => [
        emb[0] || i,
        emb[1] || Math.random() - 0.5,
        emb[2] || Math.random() - 0.5
      ].slice(0, dimensions)),
      variance: Array(dimensions).fill(0.3)
    }
  }
}

/**
 * Perform t-SNE dimensionality reduction
 */
export function performTSNE(
  embeddings: number[][],
  dimensions: 2 | 3 = 2,
  perplexity: number = 30
): Promise<number[][]> {
  return new Promise((resolve, reject) => {
    try {
      if (embeddings.length < 4) {
        // Not enough data for t-SNE, return simple arrangement
        const simple = embeddings.map((_, i) => {
          const angle = (i / embeddings.length) * 2 * Math.PI
          const radius = 1
          return [
            Math.cos(angle) * radius,
            Math.sin(angle) * radius,
            ...(dimensions === 3 ? [Math.random() - 0.5] : [])
          ].slice(0, dimensions)
        })
        resolve(simple)
        return
      }

      const tsne = new TSNE({
        dim: dimensions,
        perplexity: Math.min(perplexity, Math.floor((embeddings.length - 1) / 3)),
        earlyExaggeration: 4.0,
        learningRate: 100.0,
        nIter: 500, // Reduced iterations for faster processing
        metric: 'euclidean'
      })

      tsne.init({
        data: embeddings,
        type: 'dense'
      })

      let iterations = 0
      const maxIterations = 500

      const step = () => {
        tsne.step()
        iterations++

        if (iterations >= maxIterations || tsne.isConverged()) {
          const solution = tsne.getSolution()
          resolve(solution)
        } else if (iterations % 50 === 0) {
          // Progress update every 50 iterations
          console.log(`t-SNE progress: ${iterations}/${maxIterations}`)
          setTimeout(step, 1)
        } else {
          setTimeout(step, 0)
        }
      }

      step()
    } catch (error) {
      console.error('t-SNE failed:', error)
      // Fallback to simple circular arrangement
      const fallback = embeddings.map((_, i) => {
        const angle = (i / embeddings.length) * 2 * Math.PI
        const radius = 2
        return [
          Math.cos(angle) * radius,
          Math.sin(angle) * radius,
          ...(dimensions === 3 ? [Math.sin(angle * 2)] : [])
        ].slice(0, dimensions)
      })
      resolve(fallback)
    }
  })
}

/**
 * Apply dimensionality reduction based on configuration
 */
export async function reduceDimensions(
  embeddingData: EmbeddingData[],
  config: VisualizationConfig
): Promise<ProcessedEmbeddings> {
  const embeddings = embeddingData.map(item => item.embedding)
  
  if (embeddings.length === 0) {
    throw new Error('No embeddings provided for dimensionality reduction')
  }

  if (embeddings.some(emb => !emb || emb.length === 0)) {
    throw new Error('Invalid embeddings detected')
  }
  
  let reduced: number[][]
  let variance: number[] | undefined

  try {
    if (config.method === 'pca') {
      console.log('Performing PCA reduction...')
      const pcaResult = performPCA(embeddings, config.dimensions)
      reduced = pcaResult.reduced
      variance = pcaResult.variance
    } else {
      console.log('Performing t-SNE reduction...')
      const perplexity = config.perplexity || Math.min(30, Math.floor((embeddings.length - 1) / 3))
      reduced = await performTSNE(embeddings, config.dimensions, perplexity)
    }
  } catch (error) {
    console.error('Dimensionality reduction failed:', error)
    throw new Error(`Dimensionality reduction failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }

  // Format the reduced data for visualization
  const formattedReduced = reduced.map((coords, index) => ({
    x: coords[0],
    y: coords[1],
    z: config.dimensions === 3 ? coords[2] : undefined,
    label: embeddingData[index].sentence,
    id: embeddingData[index].id
  }))

  // Simple clustering based on proximity in reduced space
  const clusters = performSimpleClustering(formattedReduced, embeddingData)

  return {
    original: embeddingData,
    reduced: formattedReduced,
    clusters,
    method: config.method,
    variance
  }
}

/**
 * Perform simple k-means-style clustering in the reduced space
 */
function performSimpleClustering(
  reducedData: Array<{ x: number; y: number; z?: number; label: string; id: string }>,
  originalData: EmbeddingData[]
) {
  // Simple clustering: group points that are close in the reduced space
  const clusters: Array<{
    centroid: number[]
    sentences: string[]
    averageSimilarity: number
    label: string
  }> = []

  if (reducedData.length < 2) {
    return clusters
  }

  // For simplicity, create clusters based on quartiles
  const xValues = reducedData.map(d => d.x).sort((a, b) => a - b)
  const yValues = reducedData.map(d => d.y).sort((a, b) => a - b)
  
  const xMedian = xValues[Math.floor(xValues.length / 2)]
  const yMedian = yValues[Math.floor(yValues.length / 2)]

  const quadrants = [
    { name: 'Top-Right', points: [] as typeof reducedData },
    { name: 'Top-Left', points: [] as typeof reducedData },
    { name: 'Bottom-Right', points: [] as typeof reducedData },
    { name: 'Bottom-Left', points: [] as typeof reducedData }
  ]

  reducedData.forEach(point => {
    if (point.x >= xMedian && point.y >= yMedian) {
      quadrants[0].points.push(point)
    } else if (point.x < xMedian && point.y >= yMedian) {
      quadrants[1].points.push(point)
    } else if (point.x >= xMedian && point.y < yMedian) {
      quadrants[2].points.push(point)
    } else {
      quadrants[3].points.push(point)
    }
  })

  quadrants.forEach(quadrant => {
    if (quadrant.points.length > 0) {
      const centroidX = quadrant.points.reduce((sum, p) => sum + p.x, 0) / quadrant.points.length
      const centroidY = quadrant.points.reduce((sum, p) => sum + p.y, 0) / quadrant.points.length
      
      clusters.push({
        centroid: [centroidX, centroidY],
        sentences: quadrant.points.map(p => p.label),
        averageSimilarity: 0.5, // Simplified for now
        label: quadrant.name
      })
    }
  })

  return clusters
}

/**
 * Normalize embeddings to unit vectors
 */
export function normalizeEmbeddings(embeddings: number[][]): number[][] {
  return embeddings.map(embedding => {
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0))
    return magnitude > 0 ? embedding.map(val => val / magnitude) : embedding
  })
}