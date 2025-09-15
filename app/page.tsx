'use client'

import { useState, useEffect } from 'react'
import { EmbeddingsVisualizer } from '@/components/embeddings-visualizer'
import { Header } from '@/components/header'
import { Sidebar } from '@/components/sidebar'
import { LoadingScreen } from '@/components/loading-screen'

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate initial loading time
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-hidden">
          <EmbeddingsVisualizer />
        </main>
      </div>
    </div>
  )
}