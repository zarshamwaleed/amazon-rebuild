import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, ChevronLeft, Send, Package } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import {
  getCustomerThreads,
  sendCustomerReply,
  markCustomerThreadRead,
} from '../services/messageService'

export default function CustomerMessages() {
  const { user, profile } = useAuth()
  const { pushToast } = useToast()
  const navigate = useNavigate()

  const [threads, setThreads] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState(null)
  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)
  const [mobileView, setMobileView] = useState('list')

  async function load() {
    if (!user?.email) return
    try {
      setLoading(true)
      const t = await getCustomerThreads(user.email)
      setThreads(t)
      if (!selectedId && t.length) setSelectedId(t[0].thread_id)
    } catch (err) {
      pushToast('Could not load messages', { type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [user])

  const selected = threads.find((t) => t.thread_id === selectedId) || null

  async function handleSelect(thread) {
    setSelectedId(thread.thread_id)
    setMobileView('detail')
    if (thread.has_unread_reply) {
      try {
        await markCustomerThreadRead(thread.thread_id)
        setThreads((prev) =>
          prev.map((t) =>
            t.thread_id === thread.thread_id ? { ...t, has_unread_reply: false } : t
          )
        )
      } catch {}
    }
  }

  async function handleSend() {
    if (!selected || !reply.trim()) return
    setSending(true)
    try {
      await sendCustomerReply({
        sellerId: selected.seller_id,
        threadId: selected.thread_id,
        orderId: selected.order_id,
        customerName: profile?.full_name || 'Customer',
        customerEmail: user.email,
        subject: selected.subject.startsWith('Re:')
          ? selected.subject
          : 'Re: ' + selected.subject,
        body: reply.trim(),
      })
      setReply('')
      pushToast('Reply sent', { type: 'success' })
      await load()
      setSelectedId(selected.thread_id)
    } catch {
      pushToast('Could not send reply', { type: 'error' })
    } finally {
      setSending(false)
    }
  }

  if (!user) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm text-gray-600 mb-4">
          Sign in to view your messages.
        </p>
        <Link
          to="/login"
          className="bg-[#febd69] hover:bg-[#f3a847] text-gray-900 font-medium px-5 py-2 rounded"
        >
          Sign in
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-5 h-[calc(100vh-140px)] flex flex-col">
      <div className="flex-shrink-0">
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <p className="text-sm text-gray-600">
          Your conversations with sellers.
        </p>
      </div>

      <div className="grid lg:grid-cols-[340px_1fr] gap-5 flex-1 min-h-0">
        {/* Thread list */}
        <aside
          className={
            'bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col ' +
            (mobileView === 'detail' ? 'hidden lg:flex' : '')
          }
        >
          <div className="border-b px-4 py-3 text-xs uppercase tracking-wider text-gray-500">
            {threads.length} conversation{threads.length !== 1 ? 's' : ''}
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-6 text-center text-sm text-gray-500">Loading…</div>
            ) : threads.length === 0 ? (
              <div className="p-6 text-center">
                <Mail className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">
                  No messages yet
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Contact a seller from your order history.
                </p>
              </div>
            ) : (
              <ul className="divide-y">
                {threads.map((t) => {
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
                          <div className="w-8 h-8 rounded-full bg-[#232f3e] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                            S
                          </div>
                          <div className="flex-1 min-w-0">
                            <div
                              className={
                                'text-sm truncate ' +
                                (t.has_unread_reply
                                  ? 'font-bold text-gray-900'
                                  : 'font-medium text-gray-800')
                              }
                            >
                              {t.subject}
                            </div>
                            <div className="text-xs text-gray-500 truncate mt-0.5">
                              {t.last_preview}
                            </div>
                            <div className="text-[10px] text-gray-400 mt-1 flex items-center gap-2">
                              <span>{new Date(t.last_message_at).toLocaleString()}</span>
                              {t.has_reply && (
                                <span className="text-green-700 font-medium">
                                  Seller replied
                                </span>
                              )}
                            </div>
                          </div>
                          {t.has_unread_reply && (
                            <span className="w-2 h-2 rounded-full bg-[#c7511f] mt-1" />
                          )}
                        </div>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </aside>

        {/* Detail */}
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
                <p className="text-sm text-gray-600">Select a conversation</p>
              </div>
            </div>
          ) : (
            <>
              <div className="border-b px-5 py-4 flex items-start gap-3">
                <button
                  onClick={() => setMobileView('list')}
                  className="lg:hidden p-1.5 hover:bg-gray-100 rounded -ml-1"
                  aria-label="Back"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="min-w-0 flex-1">
                  <h2 className="font-bold text-gray-900 truncate">
                    {selected.subject}
                  </h2>
                  {selected.order_id && (
                    <Link
                      to={`/orders/${selected.order_id}`}
                      className="text-xs text-[#007185] hover:underline flex items-center gap-1 mt-1"
                    >
                      <Package className="w-3 h-3" />
                      Order #{selected.order_id.slice(0, 8)}
                    </Link>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 bg-gray-50">
                {selected.messages.map((m) => {
                  const fromSeller = m.direction === 'outbound'
                  return (
                    <div
                      key={m.id}
                      className={'flex ' + (fromSeller ? 'justify-start' : 'justify-end')}
                    >
                      <div
                        className={
                          'max-w-[75%] rounded-lg px-4 py-3 shadow-sm ' +
                          (fromSeller
                            ? 'bg-white text-gray-800 border border-gray-200'
                            : 'bg-[#232f3e] text-white')
                        }
                      >
                        <div className="text-xs opacity-80 mb-1">
                          {fromSeller ? 'Seller' : 'You'} ·{' '}
                          {new Date(m.created_at).toLocaleString()}
                        </div>
                        <div className="text-sm whitespace-pre-wrap">{m.body}</div>
                      </div>
                    </div>
                  )
                })}
              </div>

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
                    placeholder="Reply to seller…"
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