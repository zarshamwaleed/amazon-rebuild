import { FileText } from 'lucide-react'
import Button from '../Button'
import { useToast } from '../../context/ToastContext'

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[c]))
}

function buildLabelHtml({ order, seller }) {
  const shortId = order.id.slice(0, 8).toUpperCase()
  const rma = 'RMA-' + shortId
  const addr = order.addresses

  const sellerName = esc(seller?.business_name || seller?.store_name || 'Avenzo Marketplace Seller')
  const sellerAddress = esc(seller?.business_address || 'Fulfilled via Avenzo Marketplace')
  const sellerPhone = seller?.business_phone ? esc(seller.business_phone) : ''

  const buyerName = esc(addr?.full_name || 'Customer')
  const buyerLine = esc(addr?.address_line || '')
  const buyerCityPostal = esc(
    [addr?.city, addr?.postal_code].filter(Boolean).join(', ')
  )
  const buyerCountry = esc(addr?.country || '')
  const buyerPhone = addr?.phone ? esc(addr.phone) : ''

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>Shipping Label — Order #${shortId}</title>
<style>
  * { box-sizing: border-box; }
  body {
    font-family: Arial, Helvetica, sans-serif;
    margin: 0;
    padding: 24px;
    background: #f5f5f5;
    color: #111;
  }
  .toolbar {
    max-width: 4in;
    margin: 0 auto 16px;
    display: flex;
    justify-content: flex-end;
  }
  .toolbar button {
    font-family: inherit;
    font-size: 13px;
    font-weight: 600;
    padding: 8px 16px;
    border-radius: 6px;
    border: 1px solid #111;
    background: #111;
    color: #fff;
    cursor: pointer;
  }
  .label {
    width: 4in;
    height: 6in;
    margin: 0 auto;
    background: #fff;
    border: 2px solid #000;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .row { border-bottom: 1px solid #000; padding-bottom: 10px; }
  .row:last-child { border-bottom: none; }
  .label-tag { font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase; color: #444; margin-bottom: 4px; }
  .from-name, .to-name { font-size: 16px; font-weight: 700; }
  .addr-line { font-size: 13px; line-height: 1.5; }
  .barcode-block { text-align: center; padding-top: 6px; }
  .barcode {
    font-family: 'Courier New', monospace;
    font-size: 34px;
    letter-spacing: 2px;
    line-height: 1;
  }
  .rma { font-family: 'Courier New', monospace; font-size: 13px; font-weight: 700; margin-top: 6px; }
  .order-id { font-size: 11px; color: #444; margin-top: 2px; }
  @media print {
    body { background: #fff; padding: 0; }
    .toolbar { display: none; }
    .label { border: 2px solid #000; margin: 0; }
  }
</style>
</head>
<body>
  <div class="toolbar">
    <button onclick="window.print()">Print</button>
  </div>
  <div class="label">
    <div class="row">
      <div class="label-tag">Ship From</div>
      <div class="from-name">${sellerName}</div>
      <div class="addr-line">${sellerAddress}</div>
      ${sellerPhone ? `<div class="addr-line">${sellerPhone}</div>` : ''}
    </div>
    <div class="row">
      <div class="label-tag">Ship To</div>
      <div class="to-name">${buyerName}</div>
      ${buyerLine ? `<div class="addr-line">${buyerLine}</div>` : ''}
      ${buyerCityPostal ? `<div class="addr-line">${buyerCityPostal}</div>` : ''}
      ${buyerCountry ? `<div class="addr-line">${buyerCountry}</div>` : ''}
      ${buyerPhone ? `<div class="addr-line">${buyerPhone}</div>` : ''}
    </div>
    <div class="row" style="border-bottom: none; margin-top: auto;">
      <div class="barcode-block">
        <div class="barcode">*${shortId}*</div>
        <div class="rma">${rma}</div>
        <div class="order-id">Order #${shortId}</div>
      </div>
    </div>
  </div>
  <script>
    window.onload = function () {
      window.focus();
      window.print();
    };
  </script>
</body>
</html>`
}

export default function ShippingLabelButton({
  order,
  seller,
  variant = 'outline',
  size = 'md',
  iconOnly = false,
  className = '',
}) {
  const { pushToast } = useToast()

  function handlePrint(e) {
    e?.stopPropagation()
    if (!order) return
    const html = buildLabelHtml({ order, seller })
    const win = window.open('', '_blank', 'width=480,height=680')
    if (!win) {
      pushToast('Could not open the label — check your popup blocker.', { type: 'error' })
      return
    }
    win.document.open()
    win.document.write(html)
    win.document.close()
    pushToast('Shipping label opened in a new tab.', { type: 'info' })
  }

  if (iconOnly) {
    return (
      <button
        type="button"
        onClick={handlePrint}
        className={
          'p-1.5 rounded-lg text-charcoal-500 hover:text-charcoal-800 hover:bg-stone-100 transition-avenzo ' +
          className
        }
        aria-label="Print shipping label"
        title="Print shipping label"
      >
        <FileText className="w-4 h-4" />
      </button>
    )
  }

  return (
    <Button variant={variant} size={size} className={className} onClick={handlePrint}>
      <FileText className="w-4 h-4" /> Print Shipping Label
    </Button>
  )
}
