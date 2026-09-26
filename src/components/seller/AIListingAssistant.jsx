import { useState } from 'react'
import { Sparkles, Loader2, X } from 'lucide-react'
import {
  enhanceListing,
  generateTitle,
  generateBulletPoints,
  improveDescription,
  generateKeywords,
} from '../../services/aiService'
import { useToast } from '../../context/ToastContext'
import Button from '../Button'

export default function AIListingAssistant({ form, categoryName, onApply }) {
  const { pushToast } = useToast()
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(null) // 'enhance' | 'title' | 'bullets' | 'description' | 'keywords'
  const [result, setResult] = useState(null)

  async function run(kind) {
    setBusy(kind)
    setResult(null)
    try {
      const ctx = {
        title: form.title,
        brand: form.brand,
        category: categoryName,
        description: form.description,
        keywords: form.keywords,
      }

      let r
      if (kind === 'enhance') {
        const all = await enhanceListing(ctx)
        r = {
          title: all.title,
          bullet_points: all.bullet_points,
          description: all.description,
          keywords: all.keywords,
        }
      } else if (kind === 'title') {
        r = { title: await generateTitle(ctx) }
      } else if (kind === 'bullets') {
        r = { bullet_points: await generateBulletPoints(ctx) }
      } else if (kind === 'description') {
        r = { description: await improveDescription(ctx) }
      } else if (kind === 'keywords') {
        r = { keywords: await generateKeywords(ctx) }
      }
      setResult(r)
      pushToast('Generated', { type: 'success' })
    } catch (err) {
      pushToast('AI generation failed: ' + err.message, { type: 'error' })
    } finally {
      setBusy(null)
    }
  }

  function applyField(field) {
    if (!result || result[field] === undefined) return
    onApply(field, result[field])
    setResult((r) => ({ ...r, [field]: undefined }))
    pushToast('Applied to listing', { type: 'success' })
  }

  function applyAll() {
    if (!result) return
    onApply('__all__', result)
    setResult(null)
    setOpen(false)
    pushToast('All suggestions applied', { type: 'success' })
  }

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-6 z-40 bg-charcoal-900 text-brass-300 font-semibold px-5 py-3 rounded-full shadow-lifted hover:bg-charcoal-800 transition-avenzo flex items-center gap-2"
      >
        <Sparkles className="w-5 h-5" />
        AI Listing Assistant
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="flex-1 bg-charcoal-900/40 backdrop-blur-[1px] animate-fade-in"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <aside className="w-full max-w-md bg-bone-50 shadow-lifted flex flex-col overflow-hidden animate-[slideInLeft_320ms_cubic-bezier(0.16,1,0.3,1)_both]">
            {/* Header */}
            <div className="bg-charcoal-900 text-bone-50 px-5 py-4 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brass-300" />
                <span className="font-semibold">AI Listing Assistant</span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 transition-avenzo"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-5 py-3 text-xs text-charcoal-500 border-b border-stone-200 bg-stone-50 flex-shrink-0">
              Powered by Groq (Llama 3.3). Results are suggestions — review before applying.
            </div>

            {/* Actions */}
            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              <div className="space-y-2">
                <ActionButton
                  icon="✨"
                  label="Enhance My Listing"
                  desc="Generate title, bullets, description, and keywords in one shot."
                  loading={busy === 'enhance'}
                  onClick={() => run('enhance')}
                  primary
                />
                <ActionButton
                  icon="✏️"
                  label="Generate Title"
                  desc="Rewrite the product title."
                  loading={busy === 'title'}
                  onClick={() => run('title')}
                />
                <ActionButton
                  icon="•"
                  label="Generate Bullet Points"
                  desc="Create 5 benefit-driven bullets."
                  loading={busy === 'bullets'}
                  onClick={() => run('bullets')}
                />
                <ActionButton
                  icon="📝"
                  label="Improve Description"
                  desc="Rewrite the description."
                  loading={busy === 'description'}
                  onClick={() => run('description')}
                />
                <ActionButton
                  icon="🔍"
                  label="Generate Keywords"
                  desc="Suggest 10 search keywords."
                  loading={busy === 'keywords'}
                  onClick={() => run('keywords')}
                />
              </div>

              {/* Results */}
              {result && (
                <div className="border-t border-stone-200 pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="heading-sub">Suggestions</h3>
                    <Button size="sm" variant="secondary" onClick={applyAll}>
                      Apply all
                    </Button>
                  </div>

                  {result.title && (
                    <ResultBlock label="Title" value={result.title} onApply={() => applyField('title')} />
                  )}
                  {result.bullet_points && result.bullet_points.length > 0 && (
                    <ResultList
                      label="Bullet points"
                      items={result.bullet_points}
                      onApply={() => applyField('bullet_points')}
                    />
                  )}
                  {result.description && (
                    <ResultBlock
                      label="Description"
                      value={result.description}
                      onApply={() => applyField('description')}
                      multiline
                    />
                  )}
                  {result.keywords && (
                    <ResultBlock label="Keywords" value={result.keywords} onApply={() => applyField('keywords')} />
                  )}
                </div>
              )}
            </div>
          </aside>
        </div>
      )}
    </>
  )
}

function ActionButton({ icon, label, desc, loading, onClick, primary }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={
        'w-full text-left px-4 py-3 rounded-xl border transition-avenzo flex items-start gap-3 disabled:opacity-60 ' +
        (primary
          ? 'bg-brass-50 border-brass-300 hover:bg-brass-100'
          : 'bg-bone-50 border-stone-200 hover:border-stone-400 hover:bg-stone-50')
      }
    >
      <span className="text-lg leading-none mt-0.5">{icon}</span>
      <div className="flex-1">
        <div className="font-medium text-charcoal-900 flex items-center gap-2">
          {label}
          {loading && <Loader2 className="w-4 h-4 animate-spin text-charcoal-400" />}
        </div>
        <div className="text-xs text-charcoal-500 mt-0.5">{desc}</div>
      </div>
    </button>
  )
}

function ResultBlock({ label, value, onApply, multiline }) {
  return (
    <div className="border border-stone-200 rounded-xl p-3 bg-stone-50">
      <div className="flex items-center justify-between mb-1">
        <span className="text-label">{label}</span>
        <button
          onClick={onApply}
          className="text-xs bg-charcoal-900 hover:bg-charcoal-800 text-bone-50 px-2 py-1 rounded-md transition-avenzo"
        >
          Apply
        </button>
      </div>
      <p className={'text-body-sm ' + (multiline ? '' : 'line-clamp-3')}>{value}</p>
    </div>
  )
}

function ResultList({ label, items, onApply }) {
  return (
    <div className="border border-stone-200 rounded-xl p-3 bg-stone-50">
      <div className="flex items-center justify-between mb-2">
        <span className="text-label">{label}</span>
        <button
          onClick={onApply}
          className="text-xs bg-charcoal-900 hover:bg-charcoal-800 text-bone-50 px-2 py-1 rounded-md transition-avenzo"
        >
          Apply
        </button>
      </div>
      <ul className="space-y-1">
        {items.map((it, i) => (
          <li key={i} className="text-body-sm flex gap-2">
            <span className="text-charcoal-300 flex-shrink-0">•</span>
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
