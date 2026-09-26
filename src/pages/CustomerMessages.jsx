import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, MessageCircle, ChevronLeft, Send, Package } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import Button from '../components/Button'
import EmptyState from '../components/EmptyState'
import {
  getCustomerThreads,
  sendCustomerReply,
  markCustomerThreadRead,
} from '../services/messageService'

export default function CustomerMessages() {
  const { user, profile } = useAuth()
  const { pushToast } = useToast()

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
    } catch {
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
      } catch {
        // best-effort read receipt; thread list already updated optimistically
      }
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
      <div className="max-w-md mx-auto py-16">
        <EmptyState
          icon={Mail}
          title="Sign in to view your messages"
          message="Your conversations with sellers live here once you're signed in."
          action={
            <Link to="/login">
              <Button variant="primary" size="md">
                Sign in
              </Button>
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div className="space-y-5 h-[calc(100vh-140px)] flex flex-col">
      <div className="flex-shrink-0">
        <h1 className="heading-page">Messages</h1>
        <p className="text-body-sm mt-1">Your conversations with sellers.</p>
      </div>

      <div className="grid lg:grid-cols-[360px_1fr] gap-5 flex-1 min-h-0">
        {/* Thread list */}
        <aside
          className={
            'bg-bone-50 border border-stone-200 rounded-xl shadow-soft overflow-hidden flex flex-col ' +
            (mobileView === 'detail' ? 'hidden lg:flex' : '')
          }
        >
          <div className="border-b border-stone-200 px-4 py-3.5 text-label flex-shrink-0">
            {threads.length} conversation{threads.length !== 1 ? 's' : ''}
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <ThreadListSkeleton />
            ) : threads.length === 0 ? (
              <div className="p-4">
                <EmptyState
                  icon={Mail}
                  title="No messages yet"
                  message="Contact a seller from your order history to start a conversation."
                />
              </div>
            ) : (
              <ul className="divide-y divide-stone-100">
                {threads.map((t) => {
                  const active = t.thread_id === selectedId
                  return (
                    <li key={t.thread_id}>
                      <button
                        onClick={() => handleSelect(t)}
                        className={
                          'relative w-full text-left px-4 py-3.5 flex items-start gap-3 transition-avenzo ' +
                          (active ? 'bg-brass-50' : 'hover:bg-stone-50')
                        }
                      >
                        {active && (
                          <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-brass-400" />
                        )}
                        <div
                          className={
                            'w-9 h-9 rounded-full flex items-center justify-center font-display text-xs font-semibold flex-shrink-0 ' +
                            (t.has_unread_reply
                              ? 'bg-brass-400 text-charcoal-900'
                              : 'bg-charcoal-900 text-bone-50')
                          }
                        >
                          S
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={
                                'text-sm truncate ' +
                                (t.has_unread_reply
                                  ? 'font-semibold text-charcoal-900'
                                  : 'font-medium text-charcoal-700')
                              }
                            >
                              {t.subject}
                            </span>
                            {t.has_unread_reply && (
                              <span className="w-2 h-2 rounded-full bg-brass-500 flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-body-sm truncate mt-0.5">{t.last_preview}</p>
                          <div className="text-metadata mt-1 flex items-center gap-2">
                            <span>{new Date(t.last_message_at).toLocaleString()}</span>
                            {t.has_reply && (
                              <span className="text-success-700 font-medium">
                                Seller replied
                              </span>
                            )}
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

        {/* Detail */}
        <section
          className={
            'bg-bone-50 border border-stone-200 rounded-xl shadow-soft flex flex-col overflow-hidden ' +
            (mobileView === 'list' ? 'hidden lg:flex' : '')
          }
        >
          {!selected ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <EmptyState
                icon={MessageCircle}
                title="Select a conversation"
                message="Choose a thread from the list to see the full message history."
              />
            </div>
          ) : (
            <>
              <div className="border-b border-stone-200 px-5 py-4 flex items-start gap-3 flex-shrink-0">
                <button
                  onClick={() => setMobileView('list')}
                  className="lg:hidden p-1.5 hover:bg-stone-100 rounded-lg -ml-1 transition-avenzo"
                  aria-label="Back"
                >
                  <ChevronLeft className="w-4 h-4 text-charcoal-600" />
                </button>
                <div className="min-w-0 flex-1">
                  <h2 className="heading-sub truncate">{selected.subject}</h2>
                  {selected.order_id && (
                    <Link
                      to={`/orders/${selected.order_id}`}
                      className="text-caption text-info-700 hover:underline inline-flex items-center gap-1 mt-1"
                    >
                      <Package className="w-3 h-3" />
                      Order #{selected.order_id.slice(0, 8)}
                    </Link>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-stone-50">
                {selected.messages.map((m) => {
                  const fromSeller = m.direction === 'outbound'
                  return (
                    <div
                      key={m.id}
                      className={'flex animate-fade-in-up ' + (fromSeller ? 'justify-start' : 'justify-end')}
                    >
                      <div
                        className={
                          'max-w-[75%] px-4 py-3 shadow-soft ' +
                          (fromSeller
                            ? 'bg-bone-50 text-charcoal-800 border border-stone-200 rounded-2xl rounded-bl-sm'
                            : 'bg-charcoal-900 text-bone-50 rounded-2xl rounded-br-sm')
                        }
                      >
                        <div className="text-sm whitespace-pre-wrap">{m.body}</div>
                        <div
                          className={
                            'text-metadata mt-1.5 ' +
                            (fromSeller ? '' : 'text-bone-300')
                          }
                        >
                          {fromSeller ? 'Seller' : 'You'} · {new Date(m.created_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

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
                    placeholder="Reply to seller…"
                    className="flex-1 rounded-lg border border-stone-300 bg-bone-50 px-3.5 py-2.5 text-sm text-charcoal-900 placeholder:text-charcoal-400 resize-none transition-avenzo focus:outline-none focus:border-brass-400"
                  />
                  <Button
                    type="submit"
                    variant="secondary"
                    size="md"
                    loading={sending}
                    disabled={!reply.trim()}
                  >
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

function ThreadListSkeleton() {
  return (
    <div className="divide-y divide-stone-100">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="px-4 py-3.5 flex items-start gap-3">
          <div className="skeleton-shimmer w-9 h-9 rounded-full flex-shrink-0" />
          <div className="flex-1 min-w-0 space-y-2 pt-0.5">
            <div className="skeleton-shimmer h-3 rounded w-2/3" />
            <div className="skeleton-shimmer h-2.5 rounded w-full" />
            <div className="skeleton-shimmer h-2.5 rounded w-1/3" />
          </div>
        </div>
      ))}
    </div>
  )
}
