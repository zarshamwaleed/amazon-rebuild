import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Mail,
  Send,
  RefreshCw,
  Search,
  Inbox,
  ChevronLeft,
  User,
  Package,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import {
  getSellerMessageThreads,
  sendSellerReply,
  markThreadRead,
} from '../../services/sellerService'
import SellerPageHeader from '../../components/seller/SellerPageHeader'
import Button from '../../components/Button'

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
  { id: 'replied', label: 'Replied' },
]

export default function SellerMessages() {
  const { user } = useAuth()
  const { pushToast } = useToast()

  const [threads, setThreads] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState(null)
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)
  const [mobileView, setMobileView] = useState('list') // 'list' | 'detail'
  const scrollRef = useRef(null)

  async function load() {
    if (!user) return
    try {
      setLoading(true)
      const t = await getSellerMessageThreads(user.id)
      setThreads(t)
      if (!selectedId && t.length > 0) setSelectedId(t[0].thread_id)
    } catch {
      pushToast('Could not load messages', { type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [user])

  const filtered = useMemo(() => {
    let list = threads
    if (filter !== 'all') list = list.filter((t) => t.status === filter)
    const q = query.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (t) =>
          t.subject.toLowerCase().includes(q) ||
          (t.customer_name || '').toLowerCase().includes(q) ||
          t.last_preview.toLowerCase().includes(q)
      )
    }
    return list
  }, [threads, filter, query])

  const selected = useMemo(
    () => threads.find((t) => t.thread_id === selectedId) || null,
    [threads, selectedId]
  )

  const unreadCount = threads.filter((t) => t.status === 'unread').length

  async function handleSelect(thread) {
    setSelectedId(thread.thread_id)
    setMobileView('detail')
    if (thread.status === 'unread') {
      try {
        await markThreadRead(user.id, thread.thread_id)
        // Update local state without a full reload
        setThreads((prev) =>
          prev.map((t) =>
            t.thread_id === thread.thread_id ? { ...t, status: 'read' } : t
          )
        )
      } catch {
        // silent
      }
    }
    // Scroll chat to bottom
    setTimeout(() => {
      if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }, 50)
  }

  async function handleSend() {
    if (!selected || !reply.trim()) return
    setSending(true)
    try {
      await sendSellerReply(user.id, selected.thread_id, reply.trim())
      setReply('')
      pushToast('Reply sent', { type: 'success' })
      await load()
      // keep selection
      setSelectedId(selected.thread_id)
      setTimeout(() => {
        if (scrollRef.current)
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight
      }, 100)
    } catch {
      pushToast('Could not send reply', { type: 'error' })
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col">
      <SellerPageHeader
        title="Messages"
        description={
          <>
            {threads.length} thread{threads.length !== 1 ? 's' : ''}
            {unreadCount > 0 && (
              <>
                {' · '}
                <span className="text-brass-600 font-medium">{unreadCount} unread</span>
              </>
            )}
          </>
        }
        actions={
          <Button variant="outline" size="sm" onClick={load}>
            <RefreshCw className="w-4 h-4" /> Refresh
          </Button>
        }
      />

      <div className="grid lg:grid-cols-[340px_1fr] gap-5 flex-1 min-h-0">
        {/* Left: thread list */}
        <aside
          className={
            'bg-bone-50 border border-stone-200 rounded-xl shadow-subtle flex flex-col overflow-hidden ' +
            (mobileView === 'detail' ? 'hidden lg:flex' : '')
          }
        >
          {/* Filters */}
          <div className="border-b border-stone-200 p-3 space-y-2 flex-shrink-0">
            <div className="flex gap-1 bg-stone-100 rounded-lg p-1">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={
                    'flex-1 text-xs font-medium py-1.5 rounded-md transition-avenzo ' +
                    (filter === f.id
                      ? 'bg-bone-50 text-charcoal-900 shadow-subtle'
                      : 'text-charcoal-500 hover:text-charcoal-800')
                  }
                >
                  {f.label}
                  {f.id === 'unread' && unreadCount > 0 && (
                    <span className="ml-1">({unreadCount})</span>
                  )}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5">
              <Search className="w-3.5 h-3.5 text-charcoal-400 flex-shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search messages…"
                className="flex-1 bg-transparent text-xs text-charcoal-800 placeholder:text-charcoal-400 focus:outline-none"
              />
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-16 rounded-lg skeleton-shimmer" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center">
                <Inbox className="w-8 h-8 text-stone-300 mx-auto mb-2" strokeWidth={1.5} />
                <p className="text-body-sm">No messages</p>
              </div>
            ) : (
              <div className="divide-y divide-stone-100">
                {filtered.map((t) => {
                  const active = t.thread_id === selectedId
                  const unread = t.status === 'unread'
                  return (
                    <button
                      key={t.thread_id}
                      onClick={() => handleSelect(t)}
                      className={
                        'w-full flex items-start gap-3 px-4 py-4 text-left transition-avenzo ' +
                        (active ? 'bg-brass-50' : unread ? 'bg-brass-50/50 hover:bg-stone-50' : 'hover:bg-stone-50')
                      }
                    >
                      <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center text-xs font-semibold text-charcoal-600 flex-shrink-0">
                        {(t.customer_name || 'C').charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div
                          className={
                            'text-sm truncate ' +
                            (unread ? 'font-semibold text-charcoal-900' : 'font-medium text-charcoal-700')
                          }
                        >
                          {t.customer_name}
                        </div>
                        <div className="text-xs text-charcoal-800 truncate mt-0.5">{t.subject}</div>
                        <div className="text-xs text-charcoal-500 truncate mt-0.5">{t.last_preview}</div>
                        <div className="text-caption mt-1">
                          {new Date(t.last_message_at).toLocaleString()}
                        </div>
                      </div>
                      {unread && (
                        <span className="w-1.5 h-1.5 rounded-full bg-brass-500 mt-1.5 flex-shrink-0" />
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </aside>

        {/* Right: detail */}
        <section
          className={
            'bg-bone-50 border border-stone-200 rounded-xl shadow-subtle flex flex-col overflow-hidden ' +
            (mobileView === 'list' ? 'hidden lg:flex' : '')
          }
        >
          {!selected ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Mail className="w-12 h-12 text-stone-300 mx-auto mb-3" strokeWidth={1.5} />
                <p className="text-body-sm">Select a message to view</p>
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="border-b border-stone-200 px-5 py-4 flex items-start justify-between gap-3 flex-shrink-0">
                <div className="flex items-start gap-3 min-w-0">
                  <button
                    onClick={() => setMobileView('list')}
                    className="lg:hidden p-1.5 hover:bg-stone-100 rounded-lg -ml-1 transition-avenzo"
                    aria-label="Back"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div className="min-w-0">
                    <h2 className="heading-sub truncate">{selected.subject}</h2>
                    <div className="text-xs text-charcoal-500 flex flex-wrap items-center gap-3 mt-1">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {selected.customer_name}
                      </span>
                      {selected.customer_email && <span>{selected.customer_email}</span>}
                      {selected.order_id && (
                        <Link
                          to={`/seller/orders/${selected.order_id}`}
                          className="flex items-center gap-1 text-brass-600 hover:text-brass-700 transition-avenzo"
                        >
                          <Package className="w-3 h-3" />
                          Order #{selected.order_id.slice(0, 8)}
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-4 bg-stone-50">
                {selected.messages.map((m) => {
                  const outbound = m.direction === 'outbound'
                  return (
                    <div key={m.id} className={'flex ' + (outbound ? 'justify-end' : 'justify-start')}>
                      <div
                        className={
                          'max-w-[75%] rounded-xl px-4 py-2.5 text-sm ' +
                          (outbound
                            ? 'bg-charcoal-900 text-bone-50 rounded-br-sm'
                            : 'bg-stone-100 text-charcoal-800 rounded-bl-sm')
                        }
                      >
                        <div className={'text-xs mb-1 ' + (outbound ? 'text-bone-300' : 'text-charcoal-500')}>
                          {outbound ? 'You' : m.customer_name} · {new Date(m.created_at).toLocaleString()}
                        </div>
                        <div className="whitespace-pre-wrap">{m.body}</div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Reply box */}
              <div className="border-t border-stone-200 p-4 bg-bone-50 flex-shrink-0">
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleSend()
                  }}
                  className="flex items-end gap-2"
                >
                  <textarea
                    rows={2}
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSend()
                      }
                    }}
                    placeholder="Type your response… (Enter to send, Shift+Enter for a new line)"
                    className="flex-1 rounded-lg border border-stone-300 bg-bone-50 px-3.5 py-2.5 text-sm text-charcoal-900 placeholder:text-charcoal-400 resize-none transition-avenzo focus:outline-none focus:border-brass-400"
                  />
                  <Button type="submit" disabled={!reply.trim()} loading={sending}>
                    <Send className="w-4 h-4" />
                    {sending ? 'Sending…' : 'Send'}
                  </Button>
                </form>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  )
}
