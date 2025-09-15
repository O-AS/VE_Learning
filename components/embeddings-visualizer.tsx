'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { 
  EmbeddingData, 
  VisualizationConfig, 
  ProcessedEmbeddings,
  ComparisonResult,
  HistoryEntry 
} from '@/types/embeddings'
import { reduceDimensions } from '@/lib/dimensionality-reduction'
import { compareSentences } from '@/lib/similarity'
import { 
  Plus, 
  Play, 
  RotateCcw, 
  Settings, 
  Download, 
  Upload,
  Sparkles,
  Target,
  TrendingUp,
  BarChart3,
  Eye,
  Layers
} from 'lucide-react'

// Dynamically import Plotly to avoid SSR issues
const Plot = dynamic(() => import('react-plotly.js'), { 
  ssr: false,
  loading: () => <div className="w-full h-96 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
})

export function EmbeddingsVisualizer() {
  const [sentences, setSentences] = useState<string[]>([''])
  const [isLoading, setIsLoading] = useState(false)
  const [embeddings, setEmbeddings] = useState<EmbeddingData[]>([])
  const [processedData, setProcessedData] = useState<ProcessedEmbeddings | null>(null)
  const [comparisons, setComparisons] = useState<ComparisonResult[]>([])
  const [config, setConfig] = useState<VisualizationConfig>({
    method: 'pca',
    dimensions: 2,
    perplexity: 30,
    showLabels: true,
    colorScheme: 'viridis'
  })
  const [selectedSentence, setSelectedSentence] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(false)

  const { toast } = useToast()

  const addSentence = () => {
    setSentences([...sentences, ''])
  }

  const updateSentence = (index: number, value: string) => {
    const newSentences = [...sentences]
    newSentences[index] = value
    setSentences(newSentences)
  }

  const removeSentence = (index: number) => {
    if (sentences.length > 1) {
      setSentences(sentences.filter((_, i) => i !== index))
    }
  }

  const createFallbackVisualization = (sentences: string[], dimensions: number, title: string) => {
    // Create a simple circular arrangement as fallback
    const points = sentences.map((_, i) => {
      const angle = (i / sentences.length) * 2 * Math.PI
      const radius = 2
      return [
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
        ...(dimensions === 3 ? [Math.sin(angle * 2)] : [])
      ].slice(0, dimensions)
    })

    return createPlotlyData(points, sentences, title)
  }

  const generateEmbeddings = async () => {
    const validSentences = sentences.filter(s => s.trim().length > 0)
    
    if (validSentences.length < 2) {
      toast({
        title: "Need more sentences",
        description: "Please enter at least 2 sentences to compare",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    
    try {
      console.log('Starting embedding generation for:', validSentences)
      
      let response: Response
      let apiUrl = '/api/embeddings'
      
      // Try the main TensorFlow.js API first
      try {
        response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sentences: validSentences })
        })
        
        if (!response.ok) {
          throw new Error(`TensorFlow API failed: ${response.status}`)
        }
      } catch (tfError) {
        console.warn('TensorFlow API failed, falling back to simple embeddings:', tfError)
        
        // Fallback to simple embeddings API
        apiUrl = '/api/embeddings-simple'
        response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sentences: validSentences })
        })
        
        if (!response.ok) {
          throw new Error(`Fallback API also failed: ${response.status}`)
        }
        
        toast({
          title: "Using Fallback Embeddings",
          description: "TensorFlow.js failed, using simplified similarity calculation",
        })
      }

      console.log('API Response status:', response.status)

      const data = await response.json()
      console.log('Received embeddings data:', data)
      
      if (!data.embeddings || !Array.isArray(data.embeddings)) {
        throw new Error('Invalid embeddings data received')
      }

      const embeddingData: EmbeddingData[] = validSentences.map((sentence, index) => ({
        id: `embedding-${Date.now()}-${index}`,
        sentence,
        embedding: data.embeddings[index],
        timestamp: new Date().toISOString()
      }))

      setEmbeddings(embeddingData)
      
      // Process for visualization
      console.log('Processing embeddings for visualization...')
      const processed = await reduceDimensions(embeddingData, config)
      setProcessedData(processed)
      
      // Generate comparisons
      console.log('Generating similarity comparisons...')
      const newComparisons: ComparisonResult[] = []
      for (let i = 0; i < embeddingData.length; i++) {
        for (let j = i + 1; j < embeddingData.length; j++) {
          const comparison = compareSentences(
            embeddingData[i].sentence,
            embeddingData[j].sentence,
            embeddingData[i].embedding,
            embeddingData[j].embedding
          )
          newComparisons.push(comparison)
        }
      }
      setComparisons(newComparisons)

      // Save to history
      saveToHistory(validSentences, embeddingData, newComparisons)

      toast({
        title: "Analysis Complete!",
        description: `Successfully analyzed ${validSentences.length} sentences using ${data.method || 'TensorFlow.js'}`
      })

    } catch (error) {
      console.error('Error generating embeddings:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      
      toast({
        title: "Analysis Failed",
        description: `Error: ${errorMessage}. Please check the console for details.`,
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const saveToHistory = (sentences: string[], embeddings: EmbeddingData[], comparisons: ComparisonResult[]) => {
    const historyEntry: HistoryEntry = {
      id: `history-${Date.now()}`,
      sentences,
      embeddings,
      comparisons,
      config,
      timestamp: new Date().toISOString(),
      title: `Analysis of ${sentences.length} sentences`
    }

    const existingHistory = JSON.parse(localStorage.getItem('embeddings-history') || '[]')
    const newHistory = [historyEntry, ...existingHistory].slice(0, 50) // Keep last 50 entries
    localStorage.setItem('embeddings-history', JSON.stringify(newHistory))
  }

  const resetAll = () => {
    setSentences([''])
    setEmbeddings([])
    setProcessedData(null)
    setComparisons([])
    setSelectedSentence(null)
  }

  const exportData = () => {
    const exportData = {
      sentences,
      embeddings,
      comparisons,
      config,
      timestamp: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `embeddings-analysis-${Date.now()}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast({
      title: "Data exported",
      description: "Analysis data has been downloaded as JSON"
    })
  }

  const getVisualizationData = () => {
    if (!processedData) return null

    const { reduced } = processedData
    
    const trace: any = {
      x: reduced.map(d => d.x),
      y: reduced.map(d => d.y),
      z: config.dimensions === 3 ? reduced.map(d => d.z) : undefined,
      text: reduced.map(d => d.label),
      hovertemplate: '<b>%{text}</b><br>X: %{x:.2f}<br>Y: %{y:.2f}' + 
                   (config.dimensions === 3 ? '<br>Z: %{z:.2f}' : '') + '<extra></extra>',
      mode: 'markers+text',
      textposition: config.showLabels ? 'top center' : 'none',
      marker: {
        size: 12,
        color: reduced.map((_, index) => index),
        colorscale: config.colorScheme,
        opacity: 0.8,
        line: {
          width: 2,
          color: 'white'
        }
      },
      type: config.dimensions === 3 ? 'scatter3d' : 'scatter'
    }

    return [trace]
  }

  const plotLayout = {
    autosize: true,
    margin: { l: 50, r: 50, t: 50, b: 50 },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    font: {
      family: 'Inter, sans-serif',
      size: 12,
      color: '#374151'
    },
    scene: config.dimensions === 3 ? {
      xaxis: { title: 'PC1' },
      yaxis: { title: 'PC2' },
      zaxis: { title: 'PC3' }
    } : undefined,
    xaxis: config.dimensions === 2 ? { title: 'PC1', showgrid: true, gridcolor: '#e5e7eb' } : undefined,
    yaxis: config.dimensions === 2 ? { title: 'PC2', showgrid: true, gridcolor: '#e5e7eb' } : undefined,
    title: {
      text: `${config.method.toUpperCase()} Visualization (${config.dimensions}D)`,
      font: { size: 16, color: '#1f2937' }
    }
  }

  const plotConfig: any = {
    displayModeBar: true,
    modeBarButtonsToRemove: ['pan2d', 'lasso2d'],
    responsive: true
  }

  return (
    <div className="h-full flex flex-col lg:flex-row gap-6 p-6">
      {/* Left Panel - Input and Configuration */}
      <div className="lg:w-1/3 space-y-6">
        {/* Sentence Input */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <span>Sentence Input</span>
            </CardTitle>
            <CardDescription>
              Enter sentences to analyze their semantic similarities
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <AnimatePresence>
              {sentences.map((sentence, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center space-x-2"
                >
                  <div className="flex-1">
                    <Textarea
                      value={sentence}
                      onChange={(e) => updateSentence(index, e.target.value)}
                      placeholder={`Enter sentence ${index + 1}...`}
                      className="min-h-[60px] resize-none"
                    />
                  </div>
                  {sentences.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSentence(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      ×
                    </Button>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={addSentence}
                className="flex-1"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Sentence
              </Button>
              <Button
                onClick={generateEmbeddings}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <div className="loading-dots mr-2" />
                ) : (
                  <Play className="w-4 h-4 mr-2" />
                )}
                {isLoading ? 'Analyzing...' : 'Analyze'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Configuration */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Settings className="w-5 h-5 text-purple-600" />
                <span>Visualization Settings</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Eye className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Reduction Method
                    </label>
                    <div className="flex space-x-2 mt-1">
                      <Button
                        variant={config.method === 'pca' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setConfig({...config, method: 'pca'})}
                        className="flex-1"
                      >
                        PCA
                      </Button>
                      <Button
                        variant={config.method === 'tsne' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setConfig({...config, method: 'tsne'})}
                        className="flex-1"
                      >
                        t-SNE
                      </Button>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Dimensions
                    </label>
                    <div className="flex space-x-2 mt-1">
                      <Button
                        variant={config.dimensions === 2 ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setConfig({...config, dimensions: 2})}
                        className="flex-1"
                      >
                        2D
                      </Button>
                      <Button
                        variant={config.dimensions === 3 ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setConfig({...config, dimensions: 3})}
                        className="flex-1"
                      >
                        3D
                      </Button>
                    </div>
                  </div>

                  {config.method === 'tsne' && (
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Perplexity: {config.perplexity}
                      </label>
                      <input
                        type="range"
                        min="5"
                        max="50"
                        value={config.perplexity}
                        onChange={(e) => setConfig({...config, perplexity: parseInt(e.target.value)})}
                        className="w-full mt-1"
                      />
                    </div>
                  )}
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        {/* Actions */}
        <div className="flex space-x-2">
          <Button variant="outline" onClick={resetAll} className="flex-1">
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button 
            variant="outline" 
            onClick={exportData}
            disabled={embeddings.length === 0}
            className="flex-1"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Right Panel - Visualization and Results */}
      <div className="lg:w-2/3 space-y-6">
        {/* Visualization */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Layers className="w-5 h-5 text-green-600" />
              <span>Embeddings Visualization</span>
            </CardTitle>
            <CardDescription>
              Interactive plot showing sentence relationships in reduced dimensions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {processedData ? (
              <div className="w-full h-96">
                <Plot
                  data={getVisualizationData() || []}
                  layout={plotLayout}
                  config={plotConfig}
                  style={{ width: '100%', height: '100%' }}
                />
              </div>
            ) : (
              <div className="w-full h-96 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-700">
                <div className="text-center">
                  <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-300 font-medium">
                    No visualization yet
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Enter sentences and click "Analyze" to see the visualization
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Similarity Results */}
        {comparisons.length > 0 && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-orange-600" />
                <span>Similarity Analysis</span>
              </CardTitle>
              <CardDescription>
                Quantitative comparison of sentence similarities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-64 overflow-y-auto">
                {comparisons.map((comparison, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 rounded-lg border-l-4 ${
                      comparison.confidenceLevel === 'high' 
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : comparison.confidenceLevel === 'medium'
                        ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                        : 'border-red-500 bg-red-50 dark:bg-red-900/20'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-medium text-gray-700 dark:text-gray-300">Sentence 1:</p>
                          <p className="text-gray-600 dark:text-gray-400 truncate">{comparison.sentence1}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700 dark:text-gray-300">Sentence 2:</p>
                          <p className="text-gray-600 dark:text-gray-400 truncate">{comparison.sentence2}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex space-x-4 text-sm">
                          <span className="font-medium">
                            Cosine Similarity: <span className="text-blue-600">{comparison.metrics.cosineSimilarity.toFixed(3)}</span>
                          </span>
                          <span className="font-medium">
                            Distance: <span className="text-purple-600">{comparison.metrics.euclideanDistance.toFixed(3)}</span>
                          </span>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          comparison.confidenceLevel === 'high' 
                            ? 'bg-green-200 text-green-800'
                            : comparison.confidenceLevel === 'medium'
                            ? 'bg-yellow-200 text-yellow-800'
                            : 'bg-red-200 text-red-800'
                        }`}>
                          {comparison.confidenceLevel} confidence
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                        {comparison.interpretation}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}