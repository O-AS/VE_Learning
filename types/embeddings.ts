export interface EmbeddingData {
  id: string
  sentence: string
  embedding: number[]
  timestamp: string
}

export interface SimilarityMetrics {
  cosineSimilarity: number
  euclideanDistance: number
  manhattanDistance: number
  dotProduct: number
}

export interface ComparisonResult {
  sentence1: string
  sentence2: string
  metrics: SimilarityMetrics
  interpretation: string
  confidenceLevel: 'high' | 'medium' | 'low'
}

export interface VisualizationConfig {
  method: 'pca' | 'tsne'
  dimensions: 2 | 3
  perplexity?: number // for t-SNE
  components?: number // for PCA
  showLabels: boolean
  colorScheme: string
}

export interface HistoryEntry {
  id: string
  sentences: string[]
  embeddings: EmbeddingData[]
  comparisons: ComparisonResult[]
  config: VisualizationConfig
  timestamp: string
  title?: string
}

export interface ClusterInfo {
  centroid: number[]
  sentences: string[]
  averageSimilarity: number
  label: string
}

export interface EmbeddingResponse {
  embeddings: number[][]
  dimensions: number
  count: number
  timestamp: string
}

export interface ProcessedEmbeddings {
  original: EmbeddingData[]
  reduced: { x: number; y: number; z?: number; label: string; id: string }[]
  clusters: ClusterInfo[]
  method: 'pca' | 'tsne'
  variance?: number[] // for PCA
}