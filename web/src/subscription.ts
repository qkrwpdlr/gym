// 구독과 계정. 서버가 권위 소스다.
//
// 앱은 서명된 거래(JWS)를 네이티브에서 받아 서버에 넘기고, 등급은 서버가 알려준 값만 쓴다.
// 로컬에 "나 유료야" 같은 값을 저장하지 않는다 — 저장소를 고치면 뚫리기 때문이다.
// 계정은 서버가 Apple 로그인을 확인하고 발급한 세션 토큰으로 증명한다.
// 세션은 네이티브 키체인에 있고, 여기서는 요청 헤더에 실어 보내기만 한다.

import { API_TOKEN, SERVER_URL } from './storage'

export type Tier = 'free' | 'paid'

export type ModeUsage = { used: number; limit: number; window: 'day' | 'month' }

export type AccountState = {
  tier: Tier
  accountId: string | null
  usage: Record<string, ModeUsage> | null
  /** 서버에 닿지 못했을 때 true. 등급을 모른다는 뜻이지 무료라는 뜻이 아니다. */
  offline: boolean
}

export type StoreProduct = {
  id: string
  title: string
  price: string
  description: string
  /** 청구 주기. 네이티브가 StoreKit의 구독 기간에서 채운다. 구독이 아니거나 예전 앱이면 없다. */
  periodUnit?: 'day' | 'week' | 'month' | 'year' | 'unknown'
  periodValue?: number
  /** "1개월", "1년" 같은 표시용 기간 */
  subscriptionPeriod?: string
}

type NativeStore = {
  loadProducts?: () => Promise<{ products: StoreProduct[] }>
  purchase?: (productId: string) => Promise<{ signedTransaction?: string | null; cancelled?: boolean }>
  restorePurchases?: () => Promise<{ signedTransaction?: string | null }>
  currentEntitlement?: () => Promise<{ signedTransaction?: string | null }>
  signIn?: () => Promise<{
    accountId?: string
    identityToken?: string
    authorizationCode?: string | null
    cancelled?: boolean
  }>
  signOut?: () => Promise<unknown>
  accountState?: () => Promise<{ accountId?: string | null; session?: string | null }>
  saveSession?: (session: string) => Promise<unknown>
}

function native(): NativeStore | null {
  const g = (window as Window & { GymNative?: NativeStore }).GymNative
  return g && typeof g.loadProducts === 'function' ? g : null
}

/** 네이티브 앱 안에서 도는지. 브라우저에서는 결제도 Apple 로그인도 걸 수 없다. */
export function storeAvailable(): boolean {
  return native() !== null
}

/** UI 테스트에서 게이트를 건너뛰는 스위치. 네이티브 DEBUG 빌드만 이 값을 켠다. */
export function skipLoginGateFlag(): boolean {
  return (window as Window & { __gymSkipLoginGate?: boolean }).__gymSkipLoginGate === true
}

/** 로그인을 걸 수 있는 환경인지. 브라우저 배포본에서는 게이트를 띄우지 않는다. */
export function loginAvailable(): boolean {
  const g = (window as Window & { GymNative?: NativeStore }).GymNative
  return typeof g?.signIn === 'function'
}

let cachedAccountId: string | null = null
let cachedSession: string | null = null

export function currentAccountId(): string | null {
  return cachedSession ? cachedAccountId : null
}

function authHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Authorization: 'Bearer ' + API_TOKEN,
  }
  if (cachedSession) headers['X-Gym-Session'] = cachedSession
  return headers
}

function clearLocalAccount() {
  cachedAccountId = null
  cachedSession = null
}

const OFFLINE: AccountState = { tier: 'free', accountId: null, usage: null, offline: true }

/** 서버에 닿지 못했을 때. 등급은 모르지만 로그인 상태는 기기에 있는 그대로 보여준다. */
function offlineState(): AccountState {
  return { ...OFFLINE, accountId: currentAccountId() }
}

/** 서버에 현재 등급과 사용량을 묻는다. */
export async function fetchAccountState(): Promise<AccountState> {
  const base = SERVER_URL
  if (!base || !API_TOKEN) return offlineState()
  try {
    const resp = await fetch(base + '/v1/me', { headers: authHeaders() })
    if (!resp.ok) return offlineState()
    const data = (await resp.json()) as { tier?: Tier; account?: string | null; usage?: Record<string, ModeUsage> }
    // 세션을 보냈는데 서버가 계정을 모르면 다른 기기에서 삭제됐거나 만료된 것이다.
    if (cachedSession && !data.account) {
      await native()?.signOut?.()
      clearLocalAccount()
    }
    return {
      tier: data.tier === 'paid' ? 'paid' : 'free',
      accountId: data.account ?? null,
      usage: data.usage ?? null,
      offline: false,
    }
  } catch {
    return offlineState()
  }
}

/** 서명된 거래를 서버에 보내 등급을 갱신한다. */
export async function submitTransaction(signedTransaction: string): Promise<AccountState> {
  const base = SERVER_URL
  if (!base) return offlineState()
  // 구독 권한은 로그인한 계정에만 붙는다. 로그인 전에는 보내지 않는다.
  if (!cachedSession) throw new Error('구독하려면 먼저 로그인해 주세요.')
  const resp = await fetch(base + '/v1/subscription', {
    method: 'POST',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ signedTransaction }),
  })
  if (!resp.ok) {
    const detail = (await resp.json().catch(() => ({}))) as { error?: string }
    throw new Error(
      detail.error === 'login_required'
        ? '구독하려면 먼저 로그인해 주세요.'
        : detail.error === 'subscription_in_use'
          ? '이 App Store 구독은 이미 다른 계정에 연결돼 있어요. 처음 구독을 연결한 계정으로 로그인해 주세요.'
          : `구독을 확인하지 못했어요. (${resp.status})`,
    )
  }
  return fetchAccountState()
}

/** 네이티브가 기억하는 계정과 세션을 불러와 이후 요청에 싣는다. */
export async function syncAccount(): Promise<string | null> {
  const n = native()
  if (!n?.accountState) return null
  try {
    const { accountId, session } = await n.accountState()
    cachedAccountId = accountId || null
    cachedSession = accountId && session ? session : null
  } catch {
    clearLocalAccount()
  }
  return currentAccountId()
}

/**
 * Apple 로그인 → 서버가 Apple 서명을 확인하고 세션을 발급 → 키체인에 보관.
 * 서버 확인까지 끝나야 로그인으로 친다. 중간에 실패하면 기기에 남은 식별자도 지운다.
 */
export async function signIn(): Promise<string | null> {
  const n = native()
  if (!n?.signIn || !n.saveSession) throw new Error('앱에서만 로그인할 수 있어요.')
  if (!SERVER_URL || !API_TOKEN) throw new Error('지금은 로그인할 수 없어요. 잠시 후 다시 시도해 주세요.')

  const { accountId, identityToken, authorizationCode, cancelled } = await n.signIn()
  if (cancelled || !accountId || !identityToken) return null

  try {
    const resp = await fetch(SERVER_URL + '/v1/auth/apple', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + API_TOKEN, 'Content-Type': 'application/json' },
      body: JSON.stringify({ identityToken, authorizationCode: authorizationCode || null }),
    })
    if (!resp.ok) throw new Error(`로그인을 확인하지 못했어요. 잠시 후 다시 시도해 주세요. (${resp.status})`)
    const data = (await resp.json()) as { session?: string; account?: string }
    if (!data.session || !data.account) throw new Error('로그인을 확인하지 못했어요. 잠시 후 다시 시도해 주세요.')
    await n.saveSession(data.session)
    cachedAccountId = data.account
    cachedSession = data.session
    return data.account
  } catch (e) {
    await n.signOut?.()
    clearLocalAccount()
    if (e instanceof TypeError) throw new Error('네트워크에 연결할 수 없어요. 연결 상태를 확인해 주세요.', { cause: e })
    throw e
  }
}

export async function signOut(): Promise<void> {
  const n = native()
  if (n?.signOut) await n.signOut()
  clearLocalAccount()
}

/**
 * 계정 삭제. 서버가 Apple 로그인 연결을 끊고 계정 데이터를 지운 뒤, 기기의 로그인 정보도 지운다.
 * 이 기기에 저장된 운동 기록은 계정과 무관한 로컬 데이터라 그대로 남는다.
 */
export async function deleteAccount(): Promise<{ appleRevoked: boolean }> {
  if (!cachedSession || !SERVER_URL) throw new Error('로그인한 계정이 없어요.')
  let resp: Response
  try {
    resp = await fetch(SERVER_URL + '/v1/account/delete', { method: 'POST', headers: authHeaders() })
  } catch (e) {
    throw new Error('네트워크에 연결할 수 없어요. 연결 상태를 확인해 주세요.', { cause: e })
  }
  if (!resp.ok) throw new Error(`계정을 삭제하지 못했어요. 잠시 후 다시 시도해 주세요. (${resp.status})`)
  const data = (await resp.json().catch(() => ({}))) as { appleRevoked?: boolean }
  await signOut()
  return { appleRevoked: !!data.appleRevoked }
}

export async function loadProducts(): Promise<StoreProduct[]> {
  const n = native()
  if (!n?.loadProducts) return []
  try {
    const { products } = await n.loadProducts()
    return products || []
  } catch {
    return []
  }
}

/** 구매를 진행하고 서버 검증까지 마친 상태를 돌려준다. 취소하면 null. */
export async function purchase(productId: string): Promise<AccountState | null> {
  const n = native()
  if (!n?.purchase) throw new Error('앱에서만 결제할 수 있어요.')
  // 결제한 뒤에 권한을 붙일 계정이 없으면 돈만 나간다. 결제 전에 막는다.
  if (!cachedSession) throw new Error('구독하려면 먼저 로그인해 주세요.')
  const { signedTransaction, cancelled } = await n.purchase(productId)
  if (cancelled || !signedTransaction) return null
  return submitTransaction(signedTransaction)
}

/** 이미 구독 중인 기기에서 권한을 되살린다. */
export async function restore(): Promise<AccountState | null> {
  const n = native()
  if (!n?.restorePurchases) throw new Error('앱에서만 복원할 수 있어요.')
  if (!cachedSession) throw new Error('복원하려면 먼저 로그인해 주세요.')
  const { signedTransaction } = await n.restorePurchases()
  if (!signedTransaction) return null
  return submitTransaction(signedTransaction)
}

/** 앱 시작 시 한 번 — 기기에 남은 구독을 서버와 맞춘다. */
export async function reconcileOnLaunch(): Promise<AccountState> {
  await syncAccount()
  const n = native()
  if (n?.currentEntitlement && cachedSession) {
    try {
      const { signedTransaction } = await n.currentEntitlement()
      if (signedTransaction) return await submitTransaction(signedTransaction)
    } catch {
      // 검증 실패는 무시하고 서버가 아는 등급을 그대로 쓴다
    }
  }
  return fetchAccountState()
}

export function authHeadersForChat(): Record<string, string> {
  return authHeaders()
}
