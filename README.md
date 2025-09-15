# Embeddings Visualizer

A professional web application for visualizing and understanding sentence embedding similarities using AI. Built with Next.js, TensorFlow.js, and modern web technologies.

## 🚀 Features

### Core Functionality
- **AI-Powered Embeddings**: Uses Google's Universal Sentence Encoder to generate high-quality sentence embeddings
- **Interactive Visualizations**: 2D and 3D scatter plots with PCA and t-SNE dimensionality reduction
- **Similarity Analysis**: Quantitative metrics including cosine similarity, Euclidean distance, and interpretations
- **Real-time Processing**: Client-side processing for responsive user experience

### Professional UI/UX
- **Modern Design**: Beautiful gradients, animations, and responsive layout
- **Educational Interface**: Tooltips, explanations, and confidence levels for better understanding
- **Activity History**: Persistent storage of analysis sessions with export/import functionality
- **Mobile Responsive**: Works seamlessly across all device sizes

### Technical Excellence
- **TypeScript**: Full type safety and excellent developer experience
- **Performance Optimized**: Efficient tensor operations and memory management
- **Accessibility**: WCAG-compliant interface with keyboard navigation
- **SEO Ready**: Optimized meta tags and structured data

## 🛠️ Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **UI Components**: Tailwind CSS, Radix UI, Framer Motion
- **AI/ML**: TensorFlow.js, Universal Sentence Encoder
- **Visualization**: Plotly.js for interactive charts
- **Data Processing**: ml-matrix, t-sne-js for dimensionality reduction
- **Deployment**: Vercel-optimized with serverless functions

## 🎯 Use Cases

### Educational
- **Research**: Understand how different sentences relate semantically
- **Learning**: Explore NLP concepts through visual examples
- **Comparison**: Analyze similarity between texts quantitatively

### Professional
- **Content Analysis**: Compare documents, articles, or marketing copy
- **SEO Optimization**: Understand semantic relationships for better content strategy
- **Data Science**: Prototype and visualize text similarity models

### Development
- **API Testing**: Validate embedding model performance
- **Prototyping**: Quick experiments with sentence embeddings
- **Integration**: Example implementation for larger projects

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd embeddings-visualizer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:3000
   ```

### Deployment

#### Vercel (Recommended)
```bash
npm run build
vercel deploy
```

#### Other Platforms
```bash
npm run build
npm start
```

## 📊 How It Works

### 1. Sentence Input
- Enter 2-50 sentences for analysis
- Real-time validation and suggestions
- Support for various text lengths

### 2. Embedding Generation
- Uses Universal Sentence Encoder (512-dimensional vectors)
- Client-side processing for privacy
- Optimized for performance and accuracy

### 3. Dimensionality Reduction
- **PCA**: Linear reduction preserving variance
- **t-SNE**: Non-linear reduction for cluster visualization
- Configurable parameters for fine-tuning

### 4. Similarity Analysis
- **Cosine Similarity**: Measures angular similarity (0-1)
- **Euclidean Distance**: Measures spatial distance
- **Manhattan Distance**: Measures grid-based distance
- **Interpretations**: Human-readable explanations

### 5. Interactive Visualization
- **2D/3D Scatter Plots**: Interactive exploration
- **Hover Information**: Detailed sentence and metric display
- **Zoom/Pan**: Explore clusters and outliers
- **Color Coding**: Visual similarity representation

## 🎨 Interface Components

### Main Dashboard
- **Input Panel**: Sentence entry with dynamic addition/removal
- **Settings Panel**: Visualization configuration options
- **Results Panel**: Interactive plots and similarity matrices
- **History Sidebar**: Session management and quick access

### Educational Features
- **Confidence Levels**: High/Medium/Low similarity indicators
- **Explanatory Text**: Plain-language interpretations
- **Metric Tooltips**: Detailed explanations of similarity measures
- **Example Suggestions**: Pre-loaded sentence sets for testing

## 🔧 Configuration

### Visualization Settings
```typescript
{
  method: 'pca' | 'tsne',
  dimensions: 2 | 3,
  perplexity: 5-50,     // t-SNE only
  showLabels: boolean,
  colorScheme: string
}
```

### API Configuration
- **Max Sentences**: 50 per request
- **Timeout**: 30 seconds
- **Rate Limiting**: Configured for Vercel limits
- **Memory Management**: Automatic tensor cleanup

## 🚀 Performance Optimizations

- **Model Caching**: Universal Sentence Encoder loaded once
- **Tensor Management**: Automatic memory cleanup
- **Code Splitting**: Dynamic imports for large dependencies
- **Responsive Loading**: Progressive enhancement
- **CDN Optimization**: Static asset delivery

## 🔒 Privacy & Security

- **Client-Side Processing**: Sentences never leave your browser for embedding generation
- **No Data Collection**: Privacy-first approach
- **Local Storage**: History saved locally only
- **Secure Deployment**: HTTPS and modern security headers

## 🧪 Testing & Quality

- **TypeScript**: Compile-time type checking
- **ESLint**: Code quality enforcement
- **Responsive Testing**: Mobile and desktop validation
- **Accessibility**: WCAG compliance testing
- **Performance**: Lighthouse optimization

## 📈 Metrics & Analytics

### Similarity Metrics Explained

**Cosine Similarity (0-1)**
- 0.9-1.0: Extremely similar
- 0.8-0.9: Very similar  
- 0.7-0.8: Similar
- 0.5-0.7: Somewhat similar
- 0.3-0.5: Slightly similar
- 0.0-0.3: Different

**Euclidean Distance**
- Lower values = more similar
- Measures direct spatial distance
- Sensitive to magnitude differences

**Manhattan Distance**
- Sum of absolute differences
- Grid-based similarity measure
- Robust to outliers

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines for details on:

- Code style and standards
- Testing requirements
- Pull request process
- Issue reporting

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Google Research**: Universal Sentence Encoder model
- **TensorFlow.js Team**: Client-side ML framework
- **Plotly**: Interactive visualization library
- **Vercel**: Deployment and hosting platform

## 📞 Support

- **Documentation**: Comprehensive guides and examples
- **Issues**: GitHub issue tracker for bugs and features
- **Community**: Discussions and help forum
- **Email**: Direct support for enterprise users

---

**Built with ❤️ for the AI and NLP community**