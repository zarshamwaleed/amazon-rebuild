import { createContext, useCallback, useContext, useState } from 'react'
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react'

const ToastContext = createContext(null)

let id = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const removeToast = useCallback((toastId) => {
    setToasts((prev) => prev.filter((t) => t.id !== toastId))
  }, [])

  const pushToast = useCallback(
    (message, { type = 'success', duration = 3000 } = {}) => {
      const toastId = ++id
      setToasts((prev) => [...prev, { id: toastId, message, type }])
      if (duration > 0) {
        setTimeout(() => removeToast(toastId), duration)
      }
    },
    [removeToast]
  )

  const value = { pushToast }

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="fixed bottom-6 right-6 z-[100] space-y-2 max-w-sm"
        aria-live="polite"
        aria-atomic="true"
      >
        {toasts.map((t) => {
          const Icon =
            t.type === 'success' ? CheckCircle : t.type === 'error' ? AlertCircle : Info
          const colors =
            t.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-900'
              : t.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-900'
              : 'bg-blue-50 border-blue-200 text-blue-900'
          const iconColor =
            t.type === 'success'
              ? 'text-green-600'
              : t.type === 'error'
              ? 'text-red-600'
              : 'text-blue-600'
          return (
            <div
              key={t.id}
              className={
                'flex items-start gap-3 border rounded-md shadow-lg px-4 py-3 text-sm ' + colors
              }
              role="status"
            >
              <Icon className={'w-5 h-5 flex-shrink-0 mt-0.5 ' + iconColor} />
              <div className="flex-1">{t.message}</div>
              <button
                onClick={() => removeToast(t.id)}
                className="text-gray-500 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 rounded"
                aria-label="Dismiss notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx
}
