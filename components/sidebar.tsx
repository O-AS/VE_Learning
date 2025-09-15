'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { History, Clock, TrendingUp, BarChart3, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'
import { HistoryEntry } from '@/types/embeddings'

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [selectedEntry, setSelectedEntry] = useState<string | null>(null)

  useEffect(() => {
    // Load history from localStorage
    const savedHistory = localStorage.getItem('embeddings-history')
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory))
      } catch (error) {
        console.error('Error loading history:', error)
      }
    }
  }, [])

  const clearHistory = () => {
    setHistory([])
    localStorage.removeItem('embeddings-history')
  }

  const deleteEntry = (id: string) => {
    const newHistory = history.filter(entry => entry.id !== id)
    setHistory(newHistory)
    localStorage.setItem('embeddings-history', JSON.stringify(newHistory))
  }

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <motion.aside
      initial={{ width: isCollapsed ? 60 : 320 }}
      animate={{ width: isCollapsed ? 60 : 320 }}
      className={`bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-r border-gray-200 dark:border-gray-700 flex flex-col ${className}`}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <History className="w-5 h-5 text-blue-600" />
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">
              Activity History
            </h2>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-gray-600 hover:text-blue-600"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 overflow-hidden flex flex-col"
          >
            {/* Stats */}
            <div className="p-4 space-y-3">
              <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800">
                <CardContent className="p-3">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        Total Sessions
                      </p>
                      <p className="text-lg font-bold text-blue-600">
                        {history.length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
                <CardContent className="p-3">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        Sentences Analyzed
                      </p>
                      <p className="text-lg font-bold text-green-600">
                        {history.reduce((total, entry) => total + entry.sentences.length, 0)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* History List */}
            <div className="flex-1 overflow-y-auto px-4 pb-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Recent Sessions
                </h3>
                {history.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearHistory}
                    className="text-red-600 hover:text-red-700 text-xs"
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Clear
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                {history.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No history yet</p>
                    <p className="text-xs">Start analyzing sentences to see them here</p>
                  </div>
                ) : (
                  history.slice(0, 10).map((entry) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ scale: 1.02 }}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedEntry === entry.id
                          ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100 dark:bg-gray-800/50 dark:border-gray-700 dark:hover:bg-gray-800'
                      }`}
                      onClick={() => setSelectedEntry(selectedEntry === entry.id ? null : entry.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                            {entry.title || `${entry.sentences.length} sentences`}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center mt-1">
                            <Clock className="w-3 h-3 mr-1" />
                            {formatDate(entry.timestamp)}
                          </p>
                          <div className="flex items-center space-x-2 mt-2">
                            <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded">
                              {entry.config.method.toUpperCase()}
                            </span>
                            <span className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 px-2 py-1 rounded">
                              {entry.config.dimensions}D
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteEntry(entry.id)
                          }}
                          className="text-gray-400 hover:text-red-600 p-1"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>

                      <AnimatePresence>
                        {selectedEntry === entry.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700"
                          >
                            <div className="space-y-1">
                              {entry.sentences.slice(0, 3).map((sentence, index) => (
                                <p key={index} className="text-xs text-gray-600 dark:text-gray-300 truncate">
                                  • {sentence}
                                </p>
                              ))}
                              {entry.sentences.length > 3 && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                                  +{entry.sentences.length - 3} more...
                                </p>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isCollapsed && (
        <div className="flex flex-col items-center py-4 space-y-4">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-blue-600"
          >
            <History className="w-4 h-4" />
          </Button>
          <div className="text-center">
            <p className="text-xs font-bold text-blue-600">{history.length}</p>
            <p className="text-xs text-gray-500">Sessions</p>
          </div>
        </div>
      )}
    </motion.aside>
  )
}