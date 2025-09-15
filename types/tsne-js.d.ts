declare module 'tsne-js' {
  export interface TSNEOptions {
    dim?: number
    perplexity?: number
    earlyExaggeration?: number
    learningRate?: number
    nIter?: number
    metric?: string
  }

  export interface TSNEData {
    data: number[][]
    type: string
  }

  export class TSNE {
    constructor(options: TSNEOptions)
    init(data: TSNEData): void
    step(): void
    isConverged(): boolean
    getSolution(): number[][]
  }
}