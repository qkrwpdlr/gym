import { useEffect, useState } from 'react'
import { PRIVACY_URL, TERMS_URL, openExternal } from '../legal'
import type { AccountState, StoreProduct } from '../subscription'
import { loadProducts, purchase, restore, storeAvailable } from '../subscription'
import './Paywall.css'

type PaywallProps = {
  open: boolean
  /** 한도 초과로 열렸을 때 보여줄 한 줄. 설정에서 열면 비어 있다. */
  reason?: string | null
  onClose: () => void
  onUpgraded: (state: AccountState) => void
  /** 구독은 계정에 붙는다. 로그인 전이면 결제 대신 로그인부터 안내한다. */
  loggedIn: boolean
  onSignIn: () => Promise<string | null>
}

const FREE_LIMITS = [
  ['코치 루틴 조정', '하루 2회', '하루 30회'],
  ['새 블록 만들기', '월 1회', '하루 3회'],
  ['기록·타이머·운동 화면', '무제한', '무제한'],
]

// 구매 버튼에 청구 주기와 자동 갱신을 함께 밝힌다(심사 3.1.2). 기간을 모르면 가격만 보여 준다.
const UNIT_SHORT: Record<string, string> = { day: '일', week: '주', month: '월', year: '연' }
const UNIT_EVERY: Record<string, string> = { day: '매일', week: '매주', month: '매월', year: '매년' }

function priceLabel(product: StoreProduct) {
  const unit = product.periodUnit || ''
  if (product.periodValue === 1 && UNIT_SHORT[unit]) return `${UNIT_SHORT[unit]} ${product.price}`
  if (product.subscriptionPeriod) return `${product.price} / ${product.subscriptionPeriod}`
  return product.price
}

function renewLabel(product: StoreProduct) {
  const unit = product.periodUnit || ''
  if (product.periodValue === 1 && UNIT_EVERY[unit]) return `${UNIT_EVERY[unit]} 자동 갱신`
  if (product.subscriptionPeriod) return `${product.subscriptionPeriod}마다 자동 갱신`
  return '자동 갱신 구독'
}

export function Paywall({ open, reason, onClose, onUpgraded, loggedIn, onSignIn }: PaywallProps) {
  const [products, setProducts] = useState<StoreProduct[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return undefined
    let cancelled = false
    void loadProducts().then((list) => {
      if (!cancelled) setProducts(list)
    })
    return () => {
      cancelled = true
    }
  }, [open])

  if (!open) return null

  const available = storeAvailable()

  const run = async (fn: () => Promise<AccountState | null>, emptyMessage: string) => {
    setBusy(true)
    setError(null)
    try {
      const state = await fn()
      if (!state) {
        setError(emptyMessage)
        return
      }
      if (state.tier !== 'paid') {
        setError('구독을 확인하지 못했어요. 잠시 후 다시 시도해 주세요.')
        return
      }
      onUpgraded(state)
      onClose()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="paywall active">
      <div className="paywall-sheet">
        <div className="paywall-head">
          <div className="paywall-tag">GYM PRO</div>
          <button className="paywall-close" type="button" onClick={onClose} aria-label="닫기">
            ✕
          </button>
        </div>

        {reason ? <div className="paywall-reason">{reason}</div> : null}

        <h2 className="paywall-title">코치를 더 자주 쓰고 싶다면</h2>
        <p className="paywall-sub">PRO는 코치 조정과 블록 만들기 한도가 크게 늘어나요. 기록 기능은 무료에서도 전부 쓸 수 있어요.</p>

        <table className="paywall-table">
          <thead>
            <tr>
              <th></th>
              <th>무료</th>
              <th>PRO</th>
            </tr>
          </thead>
          <tbody>
            {FREE_LIMITS.map(([label, free, pro]) => (
              <tr key={label}>
                <td>{label}</td>
                <td>{free}</td>
                <td className="pro">{pro}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {!available ? (
          <div className="paywall-note">앱에서만 구독할 수 있어요.</div>
        ) : !loggedIn ? (
          <div className="paywall-login">
            <div className="paywall-note">구독은 계정에 연결돼요. 먼저 로그인해 주세요.</div>
            <button
              className="login-apple"
              type="button"
              disabled={busy}
              onClick={async () => {
                setBusy(true)
                setError(null)
                try {
                  await onSignIn()
                } catch (e) {
                  setError((e as Error).message)
                } finally {
                  setBusy(false)
                }
              }}
            >
               Apple로 로그인
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="paywall-note">상품을 불러오는 중…</div>
        ) : (
          <div className="paywall-products">
            {products.map((product) => (
              <button
                className="paywall-buy"
                type="button"
                key={product.id}
                disabled={busy}
                onClick={() => run(() => purchase(product.id), '결제가 취소됐어요')}
              >
                <span className="name">
                  {product.title}
                  <span className="renew">{renewLabel(product)}</span>
                </span>
                <span className="price">{priceLabel(product)}</span>
              </button>
            ))}
          </div>
        )}

        {error ? <div className="paywall-error">{error}</div> : null}

        <button
          className="paywall-restore"
          type="button"
          disabled={busy || !available || !loggedIn}
          onClick={() => run(restore, '복원할 구독이 없어요')}
        >
          구매 복원
        </button>

        <div className="paywall-fine">
          결제는 구매를 확인할 때 Apple 계정으로 청구돼요. 기간이 끝나기 24시간 전까지 해지하지 않으면 같은 가격으로
          자동 갱신돼요. 설정 앱 › Apple 계정 › 구독에서 언제든 해지할 수 있어요.
        </div>

        {/* 약관과 개인정보처리방침 링크는 구매 화면에 있어야 한다(심사 3.1.2). 서버 주소가 없으면 숨긴다. */}
        {TERMS_URL || PRIVACY_URL ? (
          <div className="paywall-legal">
            {TERMS_URL ? (
              <button type="button" onClick={() => openExternal(TERMS_URL)}>
                이용약관
              </button>
            ) : null}
            {PRIVACY_URL ? (
              <button type="button" onClick={() => openExternal(PRIVACY_URL)}>
                개인정보처리방침
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  )
}
