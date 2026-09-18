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
    } catch (err) {
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
    } catch (err) {
      pushToast('Could not send reply', { type: 'error' })
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-5 h-[calc(100vh-140px)] flex flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <p className="text-sm text-gray-600">
            {threads.length} thread{threads.length !== 1 ? 's' : ''}
            {unreadCount > 0 && (
              <>
                {' · '}
                <span className="text-[#c7511f] font-medium">
                  {unreadCount} unread
                </span>
              </>
            )}
          </p>
        </div>
        <button
          onClick={load}
          className="border border-gray-300 bg-white hover:bg-gray-50 px-3 py-2 rounded text-sm flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="grid lg:grid-cols-[340px_1fr] gap-5 flex-1 min-h-0">
        {/* Left: thread list */}
        <aside
          className={
            'bg-white border border-gray-200 rounded-lg flex flex-col overflow-hidden ' +
            (mobileView === 'detail' ? 'hidden lg:flex' : '')
          }
        >
          {/* Filters */}
          <div className="border-b p-3 space-y-2">
            <div className="flex gap-1">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={
                    'flex-1 text-xs font-medium py-1.5 rounded transition ' +
                    (filter === f.id
                      ? 'bg-[#232f3e] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200')
                  }
                >
                  {f.label}
                  {f.id === 'unread' && unreadCount > 0 && (
                    <span className="ml-1">({unreadCount})</span>
                  )}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 bg-gray-50 rounded px-2 py-1.5">
              <Search className="w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search messages..."
                className="flex-1 bg-transparent text-xs focus:outline-none"
              />
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-6 text-center text-sm text-gray-500">Loading…</div>
            ) : filtered.length === 0 ? (
              <div className="p-6 text-center">
                <Inbox className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No messages</p>
              </div>
            ) : (
              <ul className="divide-y">
                {filtered.map((t) => {
                  const active = t.thread_id === selectedId
                  return (
                    <li key={t.thread_id}>
                      <button
                        onClick={() => handleSelect(t)}
                        className={
                          'w-full text-left p-3 transition ' +
                          (active ? 'bg-orange-50' : 'hover:bg-gray-50')
                        }
                      >
                        <div className="flex items-start gap-2">
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-700 flex-shrink-0">
                            {(t.customer_name || 'C').charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <div
                                className={
                                  'text-sm truncate ' +
                                  (t.status === 'unread'
                                    ? 'font-bold text-gray-900'
                                    : 'font-medium text-gray-800')
                                }
                              >
                                {t.customer_name}
                              </div>
                              {t.status === 'unread' && (
                                <span className="w-2 h-2 rounded-full bg-[#c7511f] flex-shrink-0" />
                              )}
                            </div>
                            <div className="text-xs text-gray-900 truncate mt-0.5">
                              {t.subject}
                            </div>
                            <div className="text-xs text-gray-500 truncate mt-0.5">
                              {t.last_preview}
                            </div>
                            <div className="text-[10px] text-gray-400 mt-1">
                              {new Date(t.last_message_at).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </aside>

        {/* Right: detail */}
        <section
          className={
            'bg-white border border-gray-200 rounded-lg flex flex-col overflow-hidden ' +
            (mobileView === 'list' ? 'hidden lg:flex' : '')
          }
        >
          {!selected ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Mail className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-600">Select a message to view</p>
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="border-b px-5 py-4 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <button
                    onClick={() => setMobileView('list')}
                    className="lg:hidden p-1.5 hover:bg-gray-100 rounded -ml-1"
                    aria-label="Back"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div className="min-w-0">
                    <h2 className="font-bold text-gray-900 truncate">
                      {selected.subject}
                    </h2>
                    <div className="text-xs text-gray-500 flex flex-wrap items-center gap-3 mt-1">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {selected.customer_name}
                      </span>
                      {selected.customer_email && (
                        <span>{selected.customer_email}</span>
                      )}
                      {selected.order_id && (
                        <Link
                          to={`/seller/orders/${selected.order_id}`}
                          className="flex items-center gap-1 text-[#007185] hover:underline"
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
              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto px-5 py-4 space-y-4 bg-gray-50"
              >
                {selected.messages.map((m) => {
                  const outbound = m.direction === 'outbound'
                  return (
                    <div
                      key={m.id}
                      className={'flex ' + (outbound ? 'justify-end' : 'justify-start')}
                    >
                      <div
                        className={
                          'max-w-[75%] rounded-lg px-4 py-3 shadow-sm ' +
                          (outbound
                            ? 'bg-[#232f3e] text-white'
                            : 'bg-white text-gray-800 border border-gray-200')
                        }
                      >
                        <div className="text-xs opacity-80 mb-1">
                          {outbound ? 'You' : m.customer_name} ·{' '}
                          {new Date(m.created_at).toLocaleString()}
                        </div>
                        <div className="text-sm whitespace-pre-wrap">{m.body}</div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Reply box */}
              <div className="border-t p-4 bg-white">
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
                    className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                  <button
                    type="submit"
                    disabled={sending || !reply.trim()}
                    className="bg-[#febd69] hover:bg-[#f3a847] text-gray-900 font-medium px-4 py-2 rounded flex items-center gap-2 text-sm transition disabled:opacity-60"
                  >
                    <Send className="w-4 h-4" />
                    {sending ? 'Sending…' : 'Send'}
                  </button>
                </form>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  )
}