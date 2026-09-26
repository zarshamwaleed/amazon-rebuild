import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Gift,
  ArrowRight,
  Sparkles,
  Mail,
  Printer,
  Package,
  Cake,
  Heart,
  GraduationCap,
  Snowflake,
  Plane,
  Baby,
  HandHeart,
  Star,
  Check,
  DollarSign,
  CheckCircle2,
} from 'lucide-react'
import { useToast } from '../context/ToastContext'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import AddGiftCardModal from '../components/AddGiftCardModal'
import SectionHeader from '../components/SectionHeader'
import Button from '../components/Button'
import LoadingSkeleton from '../components/LoadingSkeleton'
import EmptyState from '../components/EmptyState'
import {
  getGiftCardDesigns,
  redeemGiftCardCode,
  getUserGiftCardBalance,
} from '../services/giftCardService'

/* ------------------------------------------------------------------
   Presentation-only lookups keyed off real gift_card_designs columns
   (category, delivery_type) — no mock catalog data, every card rendered
   below comes from getGiftCardDesigns().
   ------------------------------------------------------------------ */

const CATEGORY_META = {
  amazon: { icon: Gift },
  any: { icon: Sparkles },
  baby: { icon: Baby },
  birthday: { icon: Cake },
  congratulations: { icon: GraduationCap },
  holiday: { icon: Snowflake },
  'thank-you': { icon: HandHeart },
  travel: { icon: Plane },
  wedding: { icon: Heart },
  wellness: { icon: HandHeart },
}

const DELIVERY_META = {
  email: { icon: Mail, caption: 'Delivered by email' },
  physical: { icon: Package, caption: '+$2.99 shipping' },
  print: { icon: Printer, caption: 'Printable PDF' },
}

const FALLBACK_GRADIENT = 'from-charcoal-800 to-charcoal-900'

// The design catalog still carries its original "Amazon Rebuild" naming in
// the database — sanitized for display only, never written back.
function displayName(name = '') {
  return name.replace(/Amazon Rebuild\s*/gi, 'Avenzo ').replace(/\s+/g, ' ').trim()
}

export default function GiftCards() {
  const { pushToast } = useToast()
  const { addGiftCard } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [designs, setDesigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)

  const [claimCode, setClaimCode] = useState('')
  const [checking, setChecking] = useState(false)
  const [selectedCard, setSelectedCard] = useState(null)

  const [balance, setBalance] = useState(0)
  const [redeemSuccess, setRedeemSuccess] = useState(null)

  useEffect(() => {
    let cancelled = false
    getGiftCardDesigns()
      .then((data) => {
        if (!cancelled) setDesigns(data)
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    if (!user) {
      setBalance(0)
      return
    }
    getUserGiftCardBalance(user.id).then((bal) => {
      if (!cancelled) setBalance(bal)
    })
    return () => {
      cancelled = true
    }
  }, [user])

  function handleAddToCart(design) {
    setSelectedCard({
      id: design.id,
      name: displayName(design.name),
      gradient: design.gradient,
      delivery: design.delivery_type,
    })
  }

  async function handleRedeem(e) {
    e.preventDefault()
    const code = claimCode.trim().toUpperCase()
    if (!code) {
      return pushToast('Enter a claim code', { type: 'error' })
    }
    if (!user) {
      pushToast('Please sign in to redeem a gift card', { type: 'error' })
      navigate('/login', { state: { from: '/gift-cards' } })
      return
    }

    setChecking(true)
    setRedeemSuccess(null)
    try {
      const result = await redeemGiftCardCode(code)
      if (result.success) {
        pushToast(`$${Number(result.amount).toFixed(2)} added to your balance`, { type: 'success' })
        setRedeemSuccess({ amount: result.amount, newBalance: result.new_balance })
        setClaimCode('')
        const bal = await getUserGiftCardBalance(user.id)
        setBalance(bal)
      } else {
        pushToast(result.error || 'Could not redeem this code', { type: 'error' })
      }
    } catch (err) {
      pushToast(err.message || 'Could not redeem this code', { type: 'error' })
    } finally {
      setChecking(false)
    }
  }

  const popular = designs.filter((d) => d.featured)
  const classics = designs.filter((d) => d.category === 'amazon')
  const occasions = designs.filter((d) => d.category !== 'amazon' && d.delivery_type === 'email')
  const shipOrPrint = designs.filter((d) => d.delivery_type !== 'email')

  return (
    <div className="space-y-10 md:space-y-14">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-charcoal-900 via-charcoal-800 to-brass-900 text-bone-50 shadow-card">
        <div className="grid md:grid-cols-2 gap-10 items-center p-8 md:p-14">
          <div>
            <div className="flex items-center gap-2.5 mb-5">
              <Gift className="w-6 h-6 text-brass-400" />
              <span className="text-av-label uppercase tracking-wider text-brass-300 font-semibold">
                Gift Cards
              </span>
            </div>
            <h1 className="font-display text-display-sm md:text-display font-medium leading-tight text-bone-50 mb-4">
              The perfect gift for any occasion
            </h1>
            <p className="text-body-lg text-stone-300 mb-8 max-w-md">
              Delivered by email, printable, or shipped in a premium envelope.
              Never expires.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="#popular"
                className="inline-flex items-center gap-2 bg-brass-400 hover:bg-brass-300 text-charcoal-900 font-medium h-12 px-6 rounded-lg transition-avenzo"
              >
                Shop Gift Cards <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#redeem"
                className="inline-flex items-center gap-2 border border-bone-50/30 hover:bg-bone-50/10 text-bone-50 font-medium h-12 px-6 rounded-lg transition-avenzo"
              >
                Redeem a Gift Card
              </a>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-gradient-to-br from-brass-500 via-brass-600 to-brass-800 p-7 flex flex-col justify-between shadow-lifted ring-1 ring-inset ring-bone-50/15">
              <div
                className="absolute inset-0 opacity-[0.14] mix-blend-overlay pointer-events-none"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(135deg, rgba(255,255,255,.8) 0px, rgba(255,255,255,.8) 1px, transparent 1px, transparent 11px)',
                }}
                aria-hidden="true"
              />
              <div
                aria-hidden="true"
                className="absolute -right-4 -bottom-6 font-display italic text-charcoal-900/10 text-[9rem] leading-none select-none pointer-events-none"
              >
                A
              </div>
              <div className="relative font-display italic text-charcoal-900 text-lg tracking-wide">
                Avenzo
              </div>
              <div className="relative text-charcoal-900">
                <div className="text-av-label uppercase tracking-wider font-semibold opacity-80">Gift Card</div>
                <div className="font-display text-3xl font-medium mt-1">Choose your amount</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRIMARY ACTIONS */}
      <section className="grid md:grid-cols-2 gap-4">
        <a
          href="#popular"
          className="bg-bone-50 border border-stone-200 rounded-xl p-6 flex items-center gap-4 hover:shadow-card hover:border-stone-300 transition-avenzo group"
        >
          <div className="w-14 h-14 rounded-lg bg-brass-50 flex items-center justify-center flex-shrink-0">
            <Gift className="w-7 h-7 text-brass-700" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="heading-sub mb-1">Shop Gift Cards</h3>
            <p className="text-body-sm">Browse by occasion, design, or delivery method.</p>
          </div>
          <ArrowRight className="w-5 h-5 text-charcoal-400 group-hover:text-brass-700 group-hover:translate-x-0.5 transition-avenzo flex-shrink-0" />
        </a>

        <a
          href="#redeem"
          className="bg-bone-50 border border-stone-200 rounded-xl p-6 flex items-center gap-4 hover:shadow-card hover:border-stone-300 transition-avenzo group"
        >
          <div className="w-14 h-14 rounded-lg bg-success-50 flex items-center justify-center flex-shrink-0">
            <DollarSign className="w-7 h-7 text-success-700" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="heading-sub mb-1">Redeem a Gift Card</h3>
            <p className="text-body-sm">Add balance to your account instantly.</p>
          </div>
          <ArrowRight className="w-5 h-5 text-charcoal-400 group-hover:text-brass-700 group-hover:translate-x-0.5 transition-avenzo flex-shrink-0" />
        </a>
      </section>

      {loading ? (
        <LoadingSkeleton count={8} cols={4} />
      ) : loadError ? (
        <EmptyState title="Could not load gift cards" message={loadError} />
      ) : (
        <>
          {/* POPULAR GIFT CARDS */}
          {popular.length > 0 && (
            <section id="popular">
              <div className="flex items-end justify-between gap-4 mb-6 md:mb-8">
                <div>
                  <h2 className="font-display text-heading-section md:text-heading-page text-charcoal-900">
                    Popular Gift Cards
                  </h2>
                  <p className="text-body-sm mt-1.5">The most-gifted designs right now.</p>
                </div>
                <a
                  href="#avenzo-cards"
                  className="group shrink-0 inline-flex items-center gap-1.5 text-av-label uppercase tracking-wide text-brass-700 whitespace-nowrap transition-avenzo hover:text-brass-800"
                >
                  See all
                  <ArrowRight className="w-3.5 h-3.5 transition-transform duration-base group-hover:translate-x-0.5" />
                </a>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {popular.map((design) => (
                  <GiftCardTile key={design.id} design={design} onAdd={handleAddToCart} />
                ))}
              </div>
            </section>
          )}

          {/* AVENZO GIFT CARDS */}
          {classics.length > 0 && (
            <section id="avenzo-cards">
              <SectionHeader title="Avenzo Gift Cards" subtitle="Classic designs in every denomination." />
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {classics.map((design) => (
                  <GiftCardTile key={design.id} design={design} size="compact" onAdd={handleAddToCart} />
                ))}
              </div>
            </section>
          )}

          {/* OCCASION GIFT CARDS */}
          {occasions.length > 0 && (
            <section>
              <SectionHeader title="Gift Cards for Every Occasion" subtitle="Birthdays, holidays, weddings, and more." />
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {occasions.map((design) => (
                  <GiftCardTile key={design.id} design={design} onAdd={handleAddToCart} />
                ))}
              </div>
            </section>
          )}

          {/* SHIP OR PRINT */}
          {shipOrPrint.length > 0 && (
            <section>
              <SectionHeader title="Ship or Print" subtitle="A premium envelope, gift box, or printable PDF." />
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {shipOrPrint.map((design) => (
                  <GiftCardTile key={design.id} design={design} onAdd={handleAddToCart} />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {/* REDEEM / CHECK BALANCE */}
      <section id="redeem" className="bg-stone-50 border border-stone-200 rounded-2xl p-6 md:p-10">
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="heading-section mb-2">Redeem a Gift Card</h2>
            <p className="text-body-sm mb-4">
              Enter your claim code to add the balance to your Avenzo account.
            </p>
            <form onSubmit={handleRedeem} className="space-y-3 max-w-md">
              <input
                type="text"
                value={claimCode}
                onChange={(e) => setClaimCode(e.target.value.toUpperCase())}
                placeholder="XXXX-XXXXXX-XXXX"
                disabled={checking}
                className="w-full rounded-lg border border-stone-300 bg-bone-50 px-4 py-3 text-sm font-mono tracking-wider text-charcoal-900 placeholder:text-charcoal-400 transition-avenzo focus:outline-none focus:border-brass-400 disabled:opacity-60"
              />
              <Button type="submit" variant="secondary" size="lg" loading={checking} disabled={checking} className="w-full">
                {checking ? 'Redeeming…' : 'Redeem'}
              </Button>
            </form>
            {redeemSuccess && (
              <div className="mt-3 max-w-md flex items-start gap-2 bg-success-50 border border-success-500/20 text-success-700 rounded-lg p-3 text-sm animate-fade-in-up">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">
                    +${Number(redeemSuccess.amount).toFixed(2)} added — new balance $
                    {Number(redeemSuccess.newBalance).toFixed(2)}
                  </p>
                  <p className="mt-1">
                    <Link to="/gift-cards/balance" className="underline font-medium">
                      View balance
                    </Link>{' '}
                    ·{' '}
                    <Link to="/products" className="underline font-medium">
                      Start shopping
                    </Link>
                  </p>
                </div>
              </div>
            )}
            <p className="text-caption mt-3">
              Codes are case-insensitive. Never share your claim code with anyone outside Avenzo.
            </p>
          </div>

          <div className="bg-bone-50 border border-stone-200 rounded-xl p-6">
            <h3 className="heading-sub mb-2">Your Gift Card Balance</h3>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="font-mono text-4xl font-semibold text-charcoal-900">
                ${balance.toFixed(2)}
              </span>
            </div>
            <p className="text-caption mb-4">Redeem a gift card to add to your balance.</p>
            <div className="text-caption bg-stone-50 border border-stone-200 rounded-lg p-3">
              Your balance is automatically applied at checkout. You can review your balance anytime from Your
              Account.
            </div>
          </div>
        </div>
      </section>

      {/* TRUST BADGES */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8 border-t border-stone-200">
        {[
          { icon: Sparkles, title: 'No expiry', desc: 'Gift cards never expire.' },
          { icon: Mail, title: 'Instant delivery', desc: 'eGifts arrive in minutes.' },
          { icon: Package, title: 'Premium packaging', desc: 'Physical cards in gift boxes.' },
          { icon: Check, title: 'No fees', desc: 'No hidden charges. Ever.' },
        ].map((f) => {
          const Icon = f.icon
          return (
            <div key={f.title} className="text-center">
              <div className="w-12 h-12 rounded-full bg-brass-50 flex items-center justify-center mx-auto mb-3">
                <Icon className="w-5 h-5 text-brass-700" />
              </div>
              <h3 className="text-sm font-semibold text-charcoal-900 mb-1">{f.title}</h3>
              <p className="text-caption">{f.desc}</p>
            </div>
          )
        })}
      </section>

      {selectedCard && (
        <AddGiftCardModal
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
          onAdd={(meta) => {
            addGiftCard(meta)
            setSelectedCard(null)
          }}
        />
      )}
    </div>
  )
}

/* ============================================================
   Card component — every visual detail (wordmark, monogram, fine-line
   pattern, denomination range, delivery caption) is rendered on top of
   the design's own `gradient`/`image_url` fields; nothing is added to
   the gift_card_designs table itself.
   ============================================================ */

function GiftCardTile({ design, size = 'default', onAdd }) {
  const compact = size === 'compact'
  const meta = CATEGORY_META[design.category] || CATEGORY_META.amazon
  const delivery = DELIVERY_META[design.delivery_type] || DELIVERY_META.email
  const Icon = meta.icon
  const name = displayName(design.name)

  return (
    <div className="flex flex-col bg-bone-50 border border-stone-200 rounded-xl overflow-hidden hover:shadow-card hover:border-stone-300 hover:-translate-y-0.5 transition-avenzo">
      <div
        className={
          'relative flex flex-col justify-between overflow-hidden bg-gradient-to-br ' +
          (design.gradient || FALLBACK_GRADIENT) +
          ' ' +
          (compact ? 'aspect-[3/2] p-3' : 'aspect-[16/10] p-4')
        }
      >
        {design.image_url && (
          <img
            src={design.image_url}
            alt=""
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        {/* Duotone wash — keeps every design on-brand regardless of the
            underlying gradient's hue */}
        <div className="absolute inset-0 bg-gradient-to-br from-charcoal-900/45 via-charcoal-900/10 to-charcoal-900/55" />
        {/* Fine line pattern */}
        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(135deg, rgba(255,255,255,.7) 0px, rgba(255,255,255,.7) 1px, transparent 1px, transparent 9px)',
          }}
          aria-hidden="true"
        />
        {/* Monogram watermark */}
        <div
          aria-hidden="true"
          className={
            'absolute font-display italic text-bone-50/[0.16] select-none pointer-events-none leading-none ' +
            (compact ? '-right-2 -bottom-3 text-6xl' : '-right-3 -bottom-5 text-8xl')
          }
        >
          A
        </div>

        <div className="relative flex items-start justify-between">
          <span className={'font-display italic text-bone-50 tracking-wide ' + (compact ? 'text-xs' : 'text-sm')}>
            Avenzo
          </span>
          <Icon className={'text-bone-50/75 ' + (compact ? 'w-3.5 h-3.5' : 'w-4 h-4')} strokeWidth={1.75} />
        </div>

        <div className="relative flex items-end justify-between gap-2">
          <div>
            <div className={'font-display text-bone-50 font-medium ' + (compact ? 'text-base' : 'text-2xl')}>
              $25–$500
            </div>
            <div className="text-[10px] uppercase tracking-wider text-bone-50/75 font-semibold mt-0.5">
              Gift Card
            </div>
          </div>
          {design.featured && (
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-bone-50/15 ring-1 ring-inset ring-bone-50/30 flex items-center justify-center">
              <Star className="w-3 h-3 text-brass-300 fill-brass-300" />
            </span>
          )}
        </div>
      </div>

      <div className={'flex flex-col flex-1 ' + (compact ? 'p-3' : 'p-4')}>
        <h3
          className={
            'font-medium text-charcoal-900 leading-snug line-clamp-1 ' + (compact ? 'text-xs' : 'text-sm')
          }
        >
          {name}
        </h3>
        {design.tagline && !compact && <p className="text-caption mt-0.5 line-clamp-1">{design.tagline}</p>}

        <div className="mt-auto pt-3 flex items-center justify-between gap-2">
          <span className="text-av-caption text-charcoal-500 truncate">{delivery.caption}</span>
          <Button onClick={() => onAdd(design)} size="sm" className="flex-shrink-0">
            Add
          </Button>
        </div>
      </div>
    </div>
  )
}
