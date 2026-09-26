import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react'

const ToastContext = createContext(null)

let uid = 0
const EXIT_MS = 200

const TOAST_STYLES = {
  success: {
    Icon: CheckCircle2,
    iconBg: 'bg-success-50',
    iconColor: 'text-success-500',
    action: 'text-success-700',
    bar: 'bg-success-500/70',
  },
  error: {
    Icon: AlertCircle,
    iconBg: 'bg-error-50',
    iconColor: 'text-error-500',
    action: 'text-error-700',
    bar: 'bg-error-500/70',
  },
  warning: {
    Icon: AlertTriangle,
    iconBg: 'bg-warning-50',
    iconColor: 'text-warning-500',
    action: 'text-warning-700',
    bar: 'bg-warning-500/70',
  },
  info: {
    Icon: Info,
    iconBg: 'bg-info-50',
    iconColor: 'text-info-500',
    action: 'text-info-700',
    bar: 'bg-info-500/70',
  },
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timers = useRef(new Map())

  const clearTimer = useCallback((toastId) => {
    const timer = timers.current.get(toastId)
    if (timer) {
      clearTimeout(timer.timeoutId)
      timers.current.delete(toastId)
    }
  }, [])

  const removeToast = useCallback((toastId) => {
    clearTimer(toastId)
    setToasts((prev) => prev.filter((t) => t.id !== toastId))
  }, [clearTimer])

  const dismissToast = useCallback(
    (toastId) => {
      clearTimer(toastId)
      setToasts((prev) => prev.map((t) => (t.id === toastId ? { ...t, leaving: true } : t)))
      setTimeout(() => removeToast(toastId), EXIT_MS)
    },
    [clearTimer, removeToast]
  )

  const startTimer = useCallback(
    (toastId, ms) => {
      if (!(ms > 0)) return
      const timeoutId = setTimeout(() => dismissToast(toastId), ms)
      timers.current.set(toastId, { timeoutId, remaining: ms, start: Date.now() })
    },
    [dismissToast]
  )

  const pauseTimer = useCallback((toastId) => {
    const timer = timers.current.get(toastId)
    if (!timer) return
    clearTimeout(timer.timeoutId)
    timer.remaining -= Date.now() - timer.start
    setToasts((prev) => prev.map((t) => (t.id === toastId ? { ...t, paused: true } : t)))
  }, [])

  const resumeTimer = useCallback(
    (toastId) => {
      const timer = timers.current.get(toastId)
      if (!timer) return
      timer.start = Date.now()
      timer.timeoutId = setTimeout(() => dismissToast(toastId), Math.max(timer.remaining, 0))
      setToasts((prev) => prev.map((t) => (t.id === toastId ? { ...t, paused: false } : t)))
    },
    [dismissToast]
  )

  const pushToast = useCallback(
    (message, { type = 'success', duration = 3000, action } = {}) => {
      const toastId = ++uid
      setToasts((prev) => [
        ...prev,
        { id: toastId, message, type, duration, action, leaving: false, paused: false },
      ])
      startTimer(toastId, duration)
      return toastId
    },
    [startTimer]
  )

  useEffect(() => {
    const timersMap = timers.current
    return () => {
      timersMap.forEach((timer) => clearTimeout(timer.timeoutId))
      timersMap.clear()
    }
  }, [])

  const value = { pushToast }

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="fixed z-[100] flex flex-col gap-3 bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:w-96 pointer-events-none"
        aria-live="polite"
      >
        {toasts.map((t) => {
          const style = TOAST_STYLES[t.type] || TOAST_STYLES.info
          const Icon = style.Icon
          return (
            <div
              key={t.id}
              role={t.type === 'error' ? 'alert' : 'status'}
              onMouseEnter={() => pauseTimer(t.id)}
              onMouseLeave={() => resumeTimer(t.id)}
              className={
                'pointer-events-auto relative overflow-hidden rounded-xl border border-stone-200 bg-bone-50 shadow-lifted ' +
                (t.leaving ? 'animate-toast-out' : 'animate-toast-in')
              }
            >
              <div className="flex items-start gap-3 px-4 py-3.5">
                <span
                  className={
                    'flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center ' + style.iconBg
                  }
                >
                  <Icon className={'w-[18px] h-[18px] ' + style.iconColor} strokeWidth={2} />
                </span>
                <div className="flex-1 min-w-0 pt-0.5">
                  <p className="text-sm font-medium text-charcoal-800 leading-snug">{t.message}</p>
                  {t.action && (
                    <button
                      onClick={() => {
                        t.action.onClick?.()
                        dismissToast(t.id)
                      }}
                      className={'mt-1.5 text-xs font-semibold hover:underline focus:outline-none ' + style.action}
                    >
                      {t.action.label}
                    </button>
                  )}
                </div>
                <button
                  onClick={() => dismissToast(t.id)}
                  className="flex-shrink-0 -mr-1 -mt-1 p-1 rounded-md text-charcoal-400 hover:text-charcoal-700 hover:bg-stone-100 transition-avenzo"
                  aria-label="Dismiss notification"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              {t.duration > 0 && (
                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-stone-100">
                  <div
                    className={'h-full toast-progress-bar ' + style.bar}
                    style={{
                      animationDuration: t.duration + 'ms',
                      animationPlayState: t.paused ? 'paused' : 'running',
                    }}
                  />
                </div>
              )}
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
