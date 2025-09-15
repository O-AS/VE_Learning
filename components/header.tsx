'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Brain, Github, HelpCircle, Settings, Download, Share2 } from 'lucide-react'
import { motion } from 'framer-motion'

export function Header() {
  const [showHelp, setShowHelp] = useState(false)

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 px-6 py-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Brain className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold gradient-text">
                Embeddings Visualizer
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Understand sentence similarities through AI embeddings
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowHelp(!showHelp)}
            className="text-gray-600 hover:text-blue-600"
          >
            <HelpCircle className="w-4 h-4 mr-2" />
            Help
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-blue-600"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-blue-600"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-blue-600"
          >
            <Settings className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-blue-600"
            onClick={() => window.open('https://github.com', '_blank')}
          >
            <Github className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {showHelp && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
        >
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            How to use Embeddings Visualizer
          </h3>
          <div className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
            <p>• <strong>Add sentences:</strong> Enter sentences in the input area to generate embeddings</p>
            <p>• <strong>Compare similarities:</strong> View cosine similarity, distance metrics, and interpretations</p>
            <p>• <strong>Visualize:</strong> Use PCA or t-SNE to see sentences in 2D/3D space</p>
            <p>• <strong>History:</strong> All your analyses are automatically saved and can be revisited</p>
            <p>• <strong>Clusters:</strong> Similar sentences are automatically grouped together</p>
          </div>
        </motion.div>
      )}
    </motion.header>
  )
}