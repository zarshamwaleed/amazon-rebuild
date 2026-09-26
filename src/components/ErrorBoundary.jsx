import { Component } from 'react'
import { AlertTriangle } from 'lucide-react'
import Button from './Button'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-bone-100 p-6">
          <div className="max-w-md w-full bg-bone-50 border border-stone-200 shadow-card rounded-xl p-8 text-center">
            <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-error-50 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-error-700" strokeWidth={1.5} />
            </div>
            <h1 className="heading-sub mb-2">Something went wrong</h1>
            <p className="text-body-sm mb-6">
              {this.state.error?.message || 'Unexpected error.'}
            </p>
            <Button onClick={() => window.location.reload()}>Reload</Button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
