import { useCallback, useEffect, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { clearAiConsent, hasAiConsent, loadAiConsent, saveAiConsent } from './aiConsent'
import type { AiConsent } from './aiConsent'
import { AiConsentSettingsRow, AiConsentSheet } from './components/AiConsentSheet'
import { CoachLoginSheet } from './components/CoachLoginSheet'
import { ConfirmDialog } from './components/ConfirmDialog'
import { DeleteAccountSheet } from './components/DeleteAccountSheet'
import type { ConfirmRequest } from './components/ConfirmDialog'
import { Fab } from './components/Fab'
import { FocusMode } from './components/FocusMode'
import type { FocusSummary } from './components/FocusMode'
import { MemoSheet } from './components/MemoSheet'
import { MiniPlayer } from './components/MiniPlayer'
import { LoginGate } from './components/LoginGate'
import { NotificationSettingsModal } from './components/NotificationSettingsModal'
import { Onboarding } from './components/Onboarding'
import { Paywall } from './components/Paywall'
import { StatusBar } from './components/StatusBar'
import { PRIVACY_URL, TERMS_URL, openExternal } from './legal'
import type { AccountState } from './subscription'
import {
  authHeadersForChat,
  currentAccountId,
  deleteAccount,
  fetchAccountState,
  loginAvailable,
  reconcileOnLaunch,
  skipLoginGateFlag,
  signIn,
  signOut,
  submitTransaction,
} from './subscription'
import { Tabbar } from './components/Tabbar'
import { ImportError, applyImport, currentImportState, planImport } from './importData'
import type { ImportPlan } from './importData'
import { DEFAULT_TEMPLATE, buildProgram, markOnboarded, needsOnboarding } from './templates'
import {
  DEFAULT_ACCENT,
  LOG_INDEX_KEY,
  LOGIN_SKIP_KEY,
  RPE_VALUES,
  TIMER_KEY,
  activeProgram,
  applyOps,
  applyProgram,
  applyProposal,
  buildBuilderContext,
  buildDailyContext,
  buildFlatSets,
  callServer,
  chatConfigured,
  countTotalSets,
  currentWeek,
  dayCount,
  dayDefs,
  dayFor,
  dayLabel,
  defaultSlot,
  deleteLog,
  ensureTodayLog,
  exportData,
  formatDateKr,
  formatRestShort,
  formatTime,
  fmtNum,
  frequencyText,
  getEntry,
  isLogComplete,
  loadLogByDate,
  logDoneCount,
  lsGet,
  migrateV3,
  mixColor,
  navigate,
  nextMonday,
  parseNum,
  parseRoute,
  plateStep,
  type QuotaError,
  type Route,
  recordSet,
  setPlateStep,
  loadText,
  isNumericWeight,
  revertOverride,
  saveLog,
  setChatAuthHeaders,
  todayLogFor,
  trimWire,
  todayOverrideFor,
  todayStr,
  validateProgram,
  validateProposal,
  weekDoneSlots,
  weekdayKr,
} from './storage'
import type {
  ChatMessage,
  ChatState,
  FlatSet,
  Program,
  Proposal,
  SessionLog,
  SetEntry,
  WorkoutSection,
  WorkoutSet,
} from './types'

migrateV3()

type ViewRoute = Exclude<Route, { redirect: string }>

// 서버 주소가 빠진 채 빌드된 경우에만 보인다.
const NOT_CONFIGURED_MSG = '지금은 코치를 쓸 수 없어요. 앱을 최신 버전으로 업데이트해 주세요.'

let msgSeq = 0
const nextId = () => ++msgSeq

type FocusPhase = 'exercise' | 'rest' | 'complete'

type FocusState = {
  slot: number
  flatSets: FlatSet[]
  currentIdx: number
  phase: FocusPhase
  restEndTime?: number
  restRemaining?: number
  lastCountdown?: number | null
}

/// 오늘 목록에 "지금 어디"를 표시하기 위한 현재 위치.
type SessionMark = {
  slot: number
  sIdx: number
  setIdx: number
  phase: FocusPhase
  restRemaining: number
}

type SheetCtx = {
  slot: number
  s: number
  i: number
  rest: number
  fromFocus: boolean
}

type WakeLockSentinelLike = {
  release: () => Promise<void>
  addEventListener?: (name: string, listener: () => void) => void
}

type WakeLockNavigator = Navigator & {
  wakeLock?: { request: (type: 'screen') => Promise<WakeLockSentinelLike> }
}

type LiveActivityInfo = {
  dayTitle: string
  exerciseName: string
  setLabel: string
  phase: FocusPhase
  restEndEpochMs: number
  setIndex: number
  setTotal: number
}

type GymNativeWindow = Window & {
  GymNative?: {
    openSettings?: () => void
    startWorkoutActivity?: (info: LiveActivityInfo & { startEpochMs: number }) => void
    updateWorkoutActivity?: (info: LiveActivityInfo) => void
    endWorkoutActivity?: () => void
    scheduleRestEnd?: (info: { endEpochMs: number; title: string; body: string; foregroundBanner: boolean }) => void
    cancelRestEnd?: () => void
  }
}

function isFinished(log: SessionLog | null, f: FlatSet): boolean {
  const en = getEntry(log, f.sIdx, f.setIdx)
  return !!en && (en.done || en.skipped)
}

/// base.flatSets에서 at 다음으로 아직 하지 않은(완료·건너뜀이 아닌) 세트 위치. 없으면 -1.
/// 뒤에 남은 세트가 없으면 앞에서 놓친 세트로 돌아간다 — 목록에서 순서를 건너뛰어 체크했거나
/// 뒤쪽 세트의 타이머만 눌렀어도, 남은 세트를 두고 '완료'로 끝나지 않게 한다.
/// at 자신은 다른 세트가 하나도 안 남았을 때만, includeAt이면 고른다 — 체크 없이 타이머로만 쉰 세트로 돌아가는 경우.
function nextUndoneIdx(base: FocusState, at: number, includeAt = false): number {
  const log = todayLogFor(base.slot)
  const n = base.flatSets.length
  const start = at >= 0 && at < n ? at : -1
  for (let step = 1; step <= n; step++) {
    const k = (start + step) % n
    if (k === start) continue
    if (!isFinished(log, base.flatSets[k])) return k
  }
  if (includeAt && start >= 0 && !isFinished(log, base.flatSets[start])) return start
  return -1
}

/// 지금 세션에서 끝낸(완료·건너뜀) 세트 수.
function finishedCount(f: FocusState): number {
  const log = todayLogFor(f.slot)
  return f.flatSets.filter((s) => isFinished(log, s)).length
}

/// 화면에 보여줄 "몇 번째 세트" — 하고 있는 세트는 끝낸 수 + 1, 쉬는 중이면 방금 끝낸 세트.
function focusPosition(f: FocusState): number {
  const total = f.flatSets.length
  if (f.phase === 'complete') return total
  const done = finishedCount(f)
  return Math.max(1, Math.min(f.phase === 'rest' ? done : done + 1, total))
}

/// 세트를 기록하면 남은 세트의 목표가 바뀔 수 있다 — 탑세트 실제 무게에 맞춘 백오프, 보조 종목 무게 이어받기.
/// 세션이 처음에 만든 세트 목록을 그대로 쓰면 집중 모드·미니 바가 옛 무게를 보여 주고 그 무게로 기록한다.
/// 세트 위치(섹션·세트 순서)가 그대로일 때만 새 목록으로 바꾼다. 위치가 바뀌는 코치 조정은 refreshFocusAfterOverride가 맡는다.
function withFreshSets(base: FocusState): FocusState {
  const flatSets = buildFlatSets(dayFor(base.slot))
  const same =
    flatSets.length === base.flatSets.length &&
    flatSets.every((f, k) => f.sIdx === base.flatSets[k].sIdx && f.setIdx === base.flatSets[k].setIdx)
  return same ? { ...base, flatSets } : base
}

const REST_END_TITLE = '휴식 끝'

/// 휴식 종료 알림 본문 — 휴식이 끝나면 넘어갈 세트(advanceFrom과 같은 기준)를 알려준다.
function restEndBody(f: FocusState): string {
  const idx = nextUndoneIdx(f, f.currentIdx, true)
  const next = idx >= 0 ? f.flatSets[idx] : undefined
  return next ? `다음: ${next.set.name} ${loadText(next.set)}` : '다음 세트를 시작하세요'
}

/// iOS 앱이면 휴식 종료 알림을 네이티브가 예약해서 보낸다. 브라우저에서는 JS가 직접 띄운다.
function nativeRestAlerts(): boolean {
  return !!(window as GymNativeWindow).GymNative?.scheduleRestEnd
}

// 집중 모드 상태를 잠금화면(Live Activity) 표시용 정보로 변환한다.
function liveActivityInfoFor(f: FocusState, dayTitle: string): LiveActivityInfo {
  const total = f.flatSets.length
  if (f.phase === 'complete') {
    return {
      dayTitle,
      exerciseName: '',
      setLabel: `${total}세트 모두 완료`,
      phase: 'complete',
      restEndEpochMs: 0,
      setIndex: total,
      setTotal: total,
    }
  }
  const current = f.flatSets[f.currentIdx]
  const index = focusPosition(f)
  return {
    dayTitle,
    exerciseName: current ? current.section.title : '',
    setLabel: `${index}/${total}세트`,
    phase: f.phase,
    restEndEpochMs: f.phase === 'rest' ? f.restEndTime ?? 0 : 0,
    setIndex: index,
    setTotal: total,
  }
}

function getNotificationPermission() {
  if (!('Notification' in window)) return 'unsupported'
  return Notification.permission
}

function initialRoute(): ViewRoute {
  const r = parseRoute()
  return 'redirect' in r ? { view: 'today', slot: defaultSlot() } : r
}

function App() {
  const [route, setRoute] = useState<ViewRoute>(initialRoute)
  const [rev, setRev] = useState(0)
  const bump = useCallback(() => setRev((r) => r + 1), [])

  const [focus, setFocus] = useState<FocusState | null>(null)
  const [focusAlert, setFocusAlert] = useState(false)
  const [focusCollapsed, setFocusCollapsed] = useState(false)
  const [sheet, setSheet] = useState<SheetCtx | null>(null)
  const [sheetKey, setSheetKey] = useState(0)
  const [chat, setChat] = useState<ChatState | null>(null)
  const [chatOpen, setChatOpen] = useState(false)

  const [calCursor, setCalCursor] = useState<{ y: number; m: number } | null>(null)
  const [calSelected, setCalSelected] = useState<string | null>(null)

  const [wakeLockActive, setWakeLockActive] = useState(false)
  const [wakeLockUnavailable, setWakeLockUnavailable] = useState(false)
  const [notificationPermission, setNotificationPermission] = useState(getNotificationPermission)
  const [showNotificationSettings, setShowNotificationSettings] = useState(false)
  const [account, setAccount] = useState<AccountState>({ tier: 'free', accountId: null, usage: null, offline: true })
  const [paywall, setPaywall] = useState<{ open: boolean; reason: string | null }>({ open: false, reason: null })
  // 계정 조회가 끝나기 전에는 게이트를 띄우지 않는다 — 로그인한 사람에게 깜빡이면 안 된다.
  const [accountResolved, setAccountResolved] = useState(false)
  const [loginSkipped, setLoginSkipped] = useState(() => localStorage.getItem(LOGIN_SKIP_KEY) === '1')
  const [confirmReq, setConfirmReq] = useState<ConfirmRequest | null>(null)
  const confirmResolveRef = useRef<((ok: boolean) => void) | null>(null)
  const [memo, setMemo] = useState<{ open: boolean; key: number; slot: number }>({ open: false, key: 0, slot: 1 })
  const [coachLoginOpen, setCoachLoginOpen] = useState(false)
  const afterCoachLoginRef = useRef<(() => void) | null>(null)
  const [aiConsent, setAiConsent] = useState<AiConsent | null>(loadAiConsent)
  const [aiConsentOpen, setAiConsentOpen] = useState(false)
  const afterAiConsentRef = useRef<(() => void) | null>(null)
  const [deleteSheet, setDeleteSheet] = useState<{ open: boolean; key: number }>({ open: false, key: 0 })
  // 루틴 온보딩: 첫 실행(기록·블록 없는 새 사용자)에 한 번, 이후엔 설정의 '루틴 바꾸기'로 다시 연다.
  const [onboarding, setOnboarding] = useState<{ open: boolean; mode: 'first' | 'change'; key: number }>(() => ({
    open: needsOnboarding(),
    mode: 'first',
    key: 0,
  }))

  const wakeLockRef = useRef<WakeLockSentinelLike | null>(null)
  const wakeLockUserEnabledRef = useRef(false)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const focusRestDoneHandledRef = useRef(false)
  const focusAdvanceTimeoutRef = useRef<number | null>(null)
  const focusRef = useRef<FocusState | null>(null)
  const chatRef = useRef<ChatState | null>(null)
  const renderedDateRef = useRef<string>(todayStr())
  const liveActivityActiveRef = useRef(false)
  const focusCollapsedRef = useRef(false)

  useEffect(() => {
    focusRef.current = focus
  }, [focus])
  useEffect(() => {
    focusCollapsedRef.current = focusCollapsed
  }, [focusCollapsed])
  useEffect(() => {
    chatRef.current = chat
  }, [chat])

  // 집중 모드 ↔ 잠금화면 Live Activity 동기화 (iOS 네이티브 앱에서만 동작)
  // 진행 위치(끝낸 세트 수)도 넣는다 — 목록에서 체크를 풀면 위치는 그대로여도 잠금화면의 'N/전체'가 바뀐다.
  const focusSig = focus
    ? `${focus.currentIdx}|${focus.phase}|${focus.restEndTime ?? 0}|${focusPosition(focus)}`
    : ''
  useEffect(() => {
    const native = (window as GymNativeWindow).GymNative
    if (!native?.startWorkoutActivity) return

    if (!focus) {
      if (liveActivityActiveRef.current) {
        native.endWorkoutActivity?.()
        liveActivityActiveRef.current = false
      }
      return
    }

    const info = liveActivityInfoFor(focus, dayFor(focus.slot).title)
    if (!liveActivityActiveRef.current) {
      native.startWorkoutActivity?.({ ...info, startEpochMs: Date.now() })
      liveActivityActiveRef.current = true
    } else {
      native.updateWorkoutActivity?.(info)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusSig])

  // ----- routing -----
  useEffect(() => {
    if (!location.hash) history.replaceState(null, '', '#/today/' + defaultSlot())
    const sync = () => {
      const r = parseRoute()
      if ('redirect' in r) {
        location.replace(r.redirect)
        return
      }
      setRoute(r)
    }
    sync()
    window.addEventListener('hashchange', sync)
    return () => window.removeEventListener('hashchange', sync)
  }, [])

  // ----- accent per route -----
  useEffect(() => {
    let accent = DEFAULT_ACCENT
    if (route.view === 'today') accent = (dayDefs()[route.slot - 1] || {}).color || DEFAULT_ACCENT
    else if (route.view === 'logDetail') {
      const log = loadLogByDate(route.date)
      if (log && log.color) accent = log.color
    }
    document.documentElement.style.setProperty('--accent', accent)
    document.documentElement.style.setProperty('--accent-dim', mixColor(accent, '#000', 0.5))
    renderedDateRef.current = todayStr()
  }, [route, rev])

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./service-worker.js').catch(() => {})
    }
  }, [])

  // ============ AUDIO ============
  const getAudioCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      try {
        const AudioContextConstructor = window.AudioContext || window.webkitAudioContext
        audioCtxRef.current = new AudioContextConstructor()
      } catch {
        return null
      }
    }
    return audioCtxRef.current
  }, [])

  const playBeep = useCallback(
    (freq = 880, duration = 0.2) => {
      const ctx = getAudioCtx()
      if (!ctx) return
      if (ctx.state === 'suspended') void ctx.resume()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = freq
      osc.type = 'sine'
      gain.gain.setValueAtTime(0.25, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + duration)
    },
    [getAudioCtx],
  )

  const playBeepSequence = useCallback(() => {
    playBeep(880, 0.15)
    window.setTimeout(() => playBeep(1320, 0.25), 180)
  }, [playBeep])

  const vibrate = useCallback((pattern: number | number[]) => {
    if (navigator.vibrate) navigator.vibrate(pattern)
  }, [])

  /// 브라우저 전용 — 휴식이 끝난 시점에 웹 알림을 띄운다.
  /// iOS 앱은 휴식 시작 때 네이티브가 예약해 두므로 여기서 또 띄우면 두 번 울린다.
  const notifyRestDone = useCallback((visibleOnly: boolean) => {
    if (nativeRestAlerts()) return
    if (visibleOnly && document.visibilityState !== 'visible') return
    if (!visibleOnly && document.visibilityState === 'visible') return
    if ('Notification' in window && Notification.permission === 'granted') {
      const cur = focusRef.current
      const body = cur ? restEndBody(cur) : '다음 세트를 시작하세요'
      try {
        new Notification(REST_END_TITLE, { body, icon: './icon-192.png', tag: 'rest-done' })
      } catch {
        /* native bridge may reject mid-transition */
      }
    }
  }, [])

  // ============ WAKE LOCK ============
  const releaseWakeLock = useCallback(async () => {
    if (wakeLockRef.current) {
      try {
        await wakeLockRef.current.release()
      } catch {
        /* ignore */
      }
      wakeLockRef.current = null
    }
    setWakeLockActive(false)
  }, [])

  const requestWakeLock = useCallback(async () => {
    const wakeNavigator = navigator as WakeLockNavigator
    if (!wakeNavigator.wakeLock) {
      setWakeLockUnavailable(true)
      return false
    }
    try {
      const lock = await wakeNavigator.wakeLock.request('screen')
      wakeLockRef.current = lock
      lock.addEventListener?.('release', () => {
        wakeLockRef.current = null
        setWakeLockActive(false)
      })
      setWakeLockUnavailable(false)
      setWakeLockActive(true)
      return true
    } catch {
      return false
    }
  }, [])

  const toggleWakeLock = useCallback(async () => {
    if (wakeLockRef.current) {
      wakeLockUserEnabledRef.current = false
      await releaseWakeLock()
      return
    }
    wakeLockUserEnabledRef.current = true
    await requestWakeLock()
  }, [releaseWakeLock, requestWakeLock])

  const openNativeNotificationSettings = useCallback(() => {
    ;(window as GymNativeWindow).GymNative?.openSettings?.()
  }, [])

  const requestNotif = useCallback(async () => {
    if (!('Notification' in window)) {
      setNotificationPermission('unsupported')
      return
    }
    if (Notification.permission === 'default') {
      await Notification.requestPermission()
    } else if (Notification.permission === 'denied') {
      setShowNotificationSettings(true)
    } else {
      openNativeNotificationSettings()
    }
    setNotificationPermission(getNotificationPermission())
  }, [openNativeNotificationSettings])

  const ensurePermissions = useCallback(async () => {
    if (!wakeLockRef.current) {
      wakeLockUserEnabledRef.current = true
      await requestWakeLock()
    }
    if ('Notification' in window && Notification.permission === 'default') {
      void requestNotif()
    }
  }, [requestNotif, requestWakeLock])

  useEffect(() => {
    const onVisibilityChange = () => {
      setNotificationPermission(getNotificationPermission())
      if (document.visibilityState === 'visible' && !wakeLockRef.current && wakeLockUserEnabledRef.current) {
        void requestWakeLock()
      }
      // 자정을 넘긴 stale 화면 갱신
      if (document.visibilityState === 'visible' && renderedDateRef.current !== todayStr() && !focusRef.current) {
        renderedDateRef.current = todayStr()
        bump()
      }
    }
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [bump, requestWakeLock])

  // ============ 세션(미니 플레이어 + 포커스 모드 공용) ============
  // 오늘 목록의 체크와 포커스 모드가 같은 세션 하나를 공유한다.
  // 휴식 카운트다운도 이 세션이 들고 있고, 표시만 미니 바/포커스 모드로 갈린다.

  /// 아직 하지 않은 다음 세트로 넘긴다. 남은 세트가 없으면 완료 상태가 된다.
  const advanceFrom = useCallback((prev: FocusState, at: number): FocusState => {
    const base = withFreshSets(prev)
    const k = nextUndoneIdx(base, at, true)
    if (k >= 0) {
      return { ...base, currentIdx: k, phase: 'exercise', restEndTime: undefined, restRemaining: undefined, lastCountdown: null }
    }
    return {
      ...base,
      currentIdx: base.flatSets.length,
      phase: 'complete',
      restEndTime: undefined,
      restRemaining: undefined,
      lastCountdown: null,
    }
  }, [])

  /// 지정한 세트 위치에서 휴식을 건다. 세션이 없으면 그 자리에서 만든다.
  /// 오늘 목록에서 세트를 체크하거나 타이머 버튼을 눌렀을 때의 진입점이다.
  /// 체크로 들어왔고 남은 세트가 없으면 쉴 이유가 없으니 바로 완료로 넘긴다.
  /// 타이머 버튼(explicit)은 사용자가 직접 고른 휴식이라 그대로 건다.
  const beginRestAt = useCallback(
    (slot: number, sIdx: number, setIdx: number, rest: number, explicit = false) => {
      setFocus((prev) => {
        const base: FocusState =
          prev && prev.slot === slot
            ? withFreshSets(prev)
            : { slot, flatSets: buildFlatSets(dayFor(slot)), currentIdx: 0, phase: 'exercise' }
        const found = base.flatSets.findIndex((f) => f.sIdx === sIdx && f.setIdx === setIdx)
        const at = found >= 0 ? found : Math.min(base.currentIdx, base.flatSets.length - 1)
        if (rest > 0 && (explicit || nextUndoneIdx(base, -1) >= 0)) {
          return {
            ...base,
            currentIdx: at,
            phase: 'rest',
            restEndTime: Date.now() + rest * 1000,
            restRemaining: rest,
            lastCountdown: null,
          }
        }
        return advanceFrom(base, at)
      })
      setFocusCollapsed(true)
    },
    [advanceFrom],
  )

  /// 오늘 목록의 세트별 타이머 버튼 — 체크 없이 휴식만 건다.
  const startRestOnly = useCallback(
    (slot: number, sIdx: number, setIdx: number, rest: number) => {
      if (rest <= 0) return
      void ensurePermissions()
      beginRestAt(slot, sIdx, setIdx, rest, true)
    },
    [beginRestAt, ensurePermissions],
  )

  // ============ 확인 창 ============
  // confirm() 대신 앱 안 확인 창을 띄우고, 고른 결과를 Promise로 돌려준다.
  const askConfirm = useCallback((req: ConfirmRequest) => {
    confirmResolveRef.current?.(false)
    setConfirmReq(req)
    return new Promise<boolean>((resolve) => {
      confirmResolveRef.current = resolve
    })
  }, [])

  const resolveConfirm = useCallback((ok: boolean) => {
    const resolve = confirmResolveRef.current
    confirmResolveRef.current = null
    setConfirmReq(null)
    resolve?.(ok)
  }, [])

  /// 오늘 이미 다른 day 기록이 있으면 이 day로 바꿀지 앱 안 확인 창으로 묻고, 바꾸면 그 기록을 지운 뒤 then을 부른다.
  /// 겹치는 기록이 없으면 then을 바로(같은 탭 이벤트 안에서) 부른다 — 알림·화면 유지 권한 요청이 사용자 동작으로 인정되게.
  /// storage의 ensureTodayLog는 같은 상황에서 브라우저 confirm()을 띄우는데, 여기서 먼저 정리하므로 그 창은 뜨지 않는다.
  const withDaySwitch = useCallback(
    (slot: number, then: () => void) => {
      const log = loadLogByDate(todayStr())
      if (!log || log.daySlot === slot) {
        then()
        return
      }
      void askConfirm({
        title: `DAY ${slot}로 바꿀까요?`,
        body: `오늘은 이미 DAY ${log.daySlot} · ${log.dayTitle} 기록이 있어요. 바꾸면 그 기록은 지워져요.`,
        confirmLabel: '바꾸기',
        destructive: true,
      }).then((ok) => {
        if (!ok) return
        const cur = loadLogByDate(todayStr())
        if (cur && cur.daySlot !== slot) deleteLog(cur.date)
        // 지운 기록을 따라가던 세션(미니 바·'지금' 표시)은 함께 끝낸다. 휴식이 막 끝나 예약된
        // 자동 넘김(800ms)이 남아 있으면 새 세션을 건너뛰게 하므로 그것도 지운다.
        if (focusRef.current && focusRef.current.slot !== slot) {
          if (focusAdvanceTimeoutRef.current) {
            clearTimeout(focusAdvanceTimeoutRef.current)
            focusAdvanceTimeoutRef.current = null
          }
          setFocusAlert(false)
        }
        setFocus((f) => (f && f.slot !== slot ? null : f))
        then()
        bump()
      })
    },
    [askConfirm, bump],
  )

  // ============ 운동 기록 가져오기 ============
  // 파일 요약을 확인 창으로 보여주고, 합치기를 고르면 쓴 뒤 다시 그린다.
  // 결과 문구는 설정 화면이 가져오기 줄 아래에 보여준다. 취소하면 null.
  const importRecords = useCallback(
    async (file: File): Promise<ImportResult | null> => {
      let raw: unknown
      try {
        raw = JSON.parse(await file.text())
      } catch {
        return { error: true, text: '파일을 읽지 못했어요. 내보내기로 만든 JSON 파일인지 확인해 주세요.' }
      }
      let plan: ImportPlan
      try {
        plan = planImport(raw, currentImportState())
      } catch (e) {
        if (e instanceof ImportError) return { error: true, text: e.message }
        throw e
      }
      if (!plan.fileDays && !plan.fileHasProgram) {
        return { error: true, text: '가져올 기록이 없어요.' + skippedText(plan) }
      }
      const overlap = plan.replaced + plan.keptLocal
      const items = [
        `${plan.fileDays}일치 기록` + (plan.fileDays ? ` (새 날짜 ${plan.added}일${overlap ? `, 겹치는 날짜 ${overlap}일` : ''})` : ''),
        !plan.fileHasProgram
          ? '프로그램 없음'
          : plan.program
            ? '프로그램 있음 — 이 기기에 없어서 함께 가져와요'
            : '프로그램 있음 — 지금 쓰는 프로그램은 그대로 둬요',
      ]
      if (plan.skipped) items.push(`형식이 맞지 않는 ${plan.skipped}개는 건너뛰어요`)
      const ok = await askConfirm({
        title: '운동 기록을 가져올까요?',
        body: '지금 기록은 지우지 않고 없는 날짜만 더해요. 같은 날짜가 겹치면 완료한 세트가 더 많은 쪽을 남겨요.',
        items,
        confirmLabel: '합치기',
      })
      if (!ok) return null
      applyImport(plan)
      bump()
      const written = plan.added + plan.replaced
      return {
        error: false,
        text:
          (written ? `${written}일치 기록을 가져왔어요.` : '새로 더할 기록은 없었어요.') +
          (plan.keptLocal ? ` 겹치는 ${plan.keptLocal}일은 이 기기 기록을 남겼어요.` : '') +
          (plan.program ? ' 프로그램도 가져왔어요.' : '') +
          skippedText(plan),
      }
    },
    [askConfirm, bump],
  )

  // ============ TODAY: toggle / memo / reset / revert ============
  const toggleCheck = useCallback(
    (slot: number, s: number, i: number, rest: number) => {
      const log = todayLogFor(slot)
      const en = getEntry(log, s, i)
      if (en && (en.done || en.skipped)) {
        recordSet(slot, s, i, { done: false, skipped: false, actualW: null, actualR: null, rpe: null })
        // 탑세트를 풀면 백오프가 계획 무게로 돌아간다 — 세션이 들고 있는 목표도 맞춘다.
        setFocus((f) => (f && f.slot === slot ? withFreshSets(f) : f))
        bump()
        return
      }
      withDaySwitch(slot, () => {
        const set = dayFor(slot).sections[s].sets[i]
        const ok = recordSet(slot, s, i, { done: true, skipped: false, actualW: set.weight || '', actualR: set.reps || '' })
        if (!ok) return
        void ensurePermissions()
        beginRestAt(slot, s, i, rest)
        bump()
      })
    },
    [beginRestAt, bump, ensurePermissions, withDaySwitch],
  )

  const onMemo = useCallback((slot: number) => {
    setMemo((m) => ({ open: true, key: m.key + 1, slot }))
  }, [])

  const closeMemo = useCallback(() => setMemo((m) => ({ ...m, open: false })), [])

  const onMemoSave = useCallback(
    (text: string) => {
      const existing = loadLogByDate(todayStr())
      const l = existing || ensureTodayLog(memo.slot)
      closeMemo()
      if (!l) return
      l.note = text.trim() || null
      if (!l.sets.length && !l.note) deleteLog(l.date)
      else saveLog(l, false)
      bump()
    },
    [bump, closeMemo, memo.slot],
  )

  // 운동 중(집중 모드) 조정 반영: flatSets 재구성 + 포인터 재탐색
  const refreshFocusAfterOverride = useCallback(() => {
    setFocus((prev) => {
      if (!prev) return prev
      const day = dayFor(prev.slot)
      const log = todayLogFor(prev.slot)
      const flatSets = buildFlatSets(day)
      let idx = flatSets.findIndex(({ sIdx, setIdx }) => {
        const en = getEntry(log, sIdx, setIdx)
        return !(en && (en.done || en.skipped))
      })
      if (idx === -1) idx = Math.min(prev.currentIdx, flatSets.length - 1)
      return { ...prev, flatSets, currentIdx: Math.max(idx, 0) }
    })
  }, [])

  const onRevertOverride = useCallback(
    async (slot: number) => {
      const o = todayOverrideFor(slot)
      const ok = await askConfirm({
        title: '코치 조정을 되돌릴까요?',
        body: '오늘 루틴이 원래 계획으로 돌아가요.',
        items: o ? o.changes : undefined,
        confirmLabel: '되돌리기',
      })
      if (!ok) return
      revertOverride(slot)
      refreshFocusAfterOverride()
      bump()
    },
    [askConfirm, bump, refreshFocusAfterOverride],
  )

  // ============ FOCUS MODE ============
  const stopFocusTimer = useCallback(() => {
    if (focusAdvanceTimeoutRef.current) {
      clearTimeout(focusAdvanceTimeoutRef.current)
      focusAdvanceTimeoutRef.current = null
    }
  }, [])

  const enterFocusMode = useCallback(
    (slot: number) => {
      const day = dayFor(slot)
      const log = ensureTodayLog(slot)
      if (!log) return
      const flatSets = buildFlatSets(day)
      let startIdx = flatSets.findIndex(({ sIdx, setIdx }) => {
        const en = getEntry(log, sIdx, setIdx)
        return !(en && (en.done || en.skipped))
      })
      if (startIdx === -1) startIdx = 0
      setFocus({ slot, flatSets, currentIdx: startIdx, phase: 'exercise' })
      setFocusCollapsed(false)
      void ensurePermissions()
      const ctx = getAudioCtx()
      if (ctx && ctx.state === 'suspended') void ctx.resume()
    },
    [ensurePermissions, getAudioCtx],
  )

  /// 오늘 탭의 시작 버튼 — 같은 day 세션이 이미 돌고 있으면 새로 시작하지 않고 펼친다.
  const startOrResume = useCallback(
    (slot: number) => {
      const cur = focusRef.current
      if (cur && cur.slot === slot) setFocusCollapsed(false)
      else withDaySwitch(slot, () => enterFocusMode(slot))
    },
    [enterFocusMode, withDaySwitch],
  )

  const exitFocusMode = useCallback(() => {
    stopFocusTimer()
    setFocus(null)
    setFocusAlert(false)
    setFocusCollapsed(false)
    bump()
  }, [bump, stopFocusTimer])

  /// 오늘 기록 초기화 — 진행 중이던 세션도 함께 끝낸다.
  /// 기록만 지우면 미니 바와 '지금' 표시가 지워진 기록을 가리킨 채 남는다.
  const onReset = useCallback(async () => {
    const ok = await askConfirm({
      title: '오늘 기록을 지울까요?',
      body: '체크한 세트와 메모가 모두 지워지고, 되돌릴 수 없어요.',
      confirmLabel: '지우기',
      destructive: true,
    })
    if (!ok) return
    deleteLog(todayStr())
    exitFocusMode()
  }, [askConfirm, exitFocusMode])

  const focusAfterDone = useCallback(() => {
    setFocus((cur) => {
      if (!cur) return cur
      // 방금 기록한 세트 때문에 남은 세트의 목표가 바뀌었을 수 있다 (백오프 연동) — 휴식 화면의 '다음 세트'부터 맞춘다.
      const prev = withFreshSets(cur)
      const current = prev.flatSets[prev.currentIdx]
      const restSec = current ? current.section.rest : 0
      // 마지막 세트였다면 휴식 없이 바로 완료로
      if (restSec > 0 && nextUndoneIdx(prev, -1) >= 0) {
        return { ...prev, phase: 'rest', restEndTime: Date.now() + restSec * 1000, restRemaining: restSec, lastCountdown: null }
      }
      return advanceFrom(prev, prev.currentIdx)
    })
  }, [advanceFrom])

  const advanceAfterRest = useCallback(() => {
    if (focusAdvanceTimeoutRef.current) {
      clearTimeout(focusAdvanceTimeoutRef.current)
      focusAdvanceTimeoutRef.current = null
    }
    setFocus((prev) => (prev ? advanceFrom(prev, prev.currentIdx) : prev))
  }, [advanceFrom])

  const onFocusNext = useCallback(() => {
    const cur = focusRef.current
    if (!cur) return
    const current = cur.flatSets[cur.currentIdx]
    if (!current) return
    // 목표는 지금 루틴에서 다시 읽는다 — 세션의 세트 목록은 마지막으로 넘어간 시점의 값이다.
    const set = dayFor(cur.slot).sections[current.sIdx]?.sets[current.setIdx] || current.set
    // 타이머 버튼으로 다른 day 세션을 시작했다면 오늘 기록과 day가 다를 수 있다 — 앱 안 확인 창으로 묻는다.
    withDaySwitch(cur.slot, () => {
      const existing = getEntry(todayLogFor(cur.slot), current.sIdx, current.setIdx)
      if (!existing || !existing.done) {
        const ok = recordSet(cur.slot, current.sIdx, current.setIdx, {
          done: true,
          skipped: false,
          actualW: set.weight || '',
          actualR: set.reps || '',
        })
        if (!ok) return
      }
      focusAfterDone()
    })
  }, [focusAfterDone, withDaySwitch])

  const focusRestDone = useCallback(() => {
    vibrate([200, 100, 200, 100, 400])
    playBeepSequence()
    setFocusAlert(true)
    window.setTimeout(() => setFocusAlert(false), 400)
    // 아래 두 알림은 브라우저 전용이다. iOS 앱은 휴식 시작 때 네이티브가 같은 기준으로 예약해 둔다.
    notifyRestDone(false)
    // 포커스 모드는 화면 전체가 번쩍여서 알림이 필요 없지만,
    // 미니 바만 떠 있을 때는 화면을 보고 있어도 놓치기 쉬워 알림을 띄운다.
    if (focusCollapsedRef.current) notifyRestDone(true)
    focusAdvanceTimeoutRef.current = window.setTimeout(advanceAfterRest, 800)
  }, [advanceAfterRest, notifyRestDone, playBeepSequence, vibrate])

  const onSkipRest = useCallback(() => {
    focusRestDoneHandledRef.current = true
    advanceAfterRest()
  }, [advanceAfterRest])

  const onFocusExit = useCallback(async () => {
    const ok = await askConfirm({
      title: '운동을 마칠까요?',
      body: '지금까지 한 세트는 기록에 그대로 남아요.',
      confirmLabel: '운동 마치기',
      cancelLabel: '계속하기',
    })
    if (ok) exitFocusMode()
  }, [askConfirm, exitFocusMode])

  /// 휴식에 시간을 더한다. 끝난 휴식에는 쓰지 않는다.
  const extendRest = useCallback((sec: number) => {
    setFocus((prev) => {
      // 이미 끝난 휴식은 다음 세트로 넘어가는 중이라 건드리지 않는다.
      if (!prev || prev.phase !== 'rest' || !prev.restEndTime || prev.restEndTime <= Date.now()) return prev
      const restEndTime = prev.restEndTime + sec * 1000
      return { ...prev, restEndTime, restRemaining: Math.ceil((restEndTime - Date.now()) / 1000), lastCountdown: null }
    })
  }, [])

  const focusPhase = focus?.phase
  const focusRestEndTime = focus?.restEndTime
  useEffect(() => {
    if (focusPhase !== 'rest' || !focusRestEndTime) return undefined
    focusRestDoneHandledRef.current = false
    const tick = () => {
      setFocus((current) => {
        if (!current || current.phase !== 'rest' || !current.restEndTime) return current
        const remaining = Math.ceil((current.restEndTime - Date.now()) / 1000)
        if (remaining <= 0) {
          if (!focusRestDoneHandledRef.current) {
            focusRestDoneHandledRef.current = true
            focusRestDone()
          }
          return { ...current, restRemaining: 0 }
        }
        if ([3, 2, 1].includes(remaining) && current.lastCountdown !== remaining) {
          playBeep(600, 0.1)
          return { ...current, restRemaining: remaining, lastCountdown: remaining }
        }
        return { ...current, restRemaining: remaining }
      })
    }
    tick()
    const timerId = window.setInterval(tick, 250)
    return () => window.clearInterval(timerId)
  }, [focusPhase, focusRestEndTime, focusRestDone, playBeep])

  // 휴식 종료 알림 예약 (iOS 네이티브 앱에서만). 화면이 잠기면 JS가 멈춰 위 틱이 돌지 않으므로,
  // 휴식이 시작되거나 종료 시각이 바뀌는 순간 iOS에 알림을 맡겨 둔다.
  // 경로별로 부르지 않고 세션 상태 하나만 본다 — 세트 체크(목록·미니 바·집중 모드), 타이머 버튼,
  // +30초, 다른 day로 전환, 새로고침 후 복원은 모두 rest/restEndTime 변화로, 건너뛰기·자연 종료·
  // 운동 마치기·초기화는 rest가 아닌 상태(또는 세션 없음)로 나타나 여기서 예약/취소된다.
  // 앞에 있을 때의 중복 방지: 집중 모드 화면이 열려 있으면 번쩍임·비프로 충분해 네이티브가 배너를 숨기고,
  // 미니 바만 떠 있으면 놓치기 쉬워 배너를 띄운다(foregroundBanner). 접힘 상태가 바뀌면 다시 예약해 반영한다.
  // rev: 휴식 중 목록에서 다른 세트를 체크/해제하면 '다음 세트' 본문이 바뀐다.
  // notificationPermission: 첫 휴식은 권한 요청과 동시에 시작돼 허용 전 예약이 실패할 수 있어, 허용되면 다시 건다.
  useEffect(() => {
    const native = (window as GymNativeWindow).GymNative
    if (!native?.scheduleRestEnd) return
    const cur = focusRef.current
    if (focusPhase !== 'rest' || !focusRestEndTime || !cur || focusRestEndTime <= Date.now()) {
      native.cancelRestEnd?.()
      return
    }
    native.scheduleRestEnd({
      endEpochMs: focusRestEndTime,
      title: REST_END_TITLE,
      body: restEndBody(cur),
      foregroundBanner: focusCollapsed,
    })
  }, [focusPhase, focusRestEndTime, focusCollapsed, notificationPermission, rev])

  // 구독·계정은 서버가 권위 소스다. 앱이 뜨면 기기에 남은 구독을 서버와 맞춘다.
  useEffect(() => {
    setChatAuthHeaders(authHeadersForChat)
    let cancelled = false
    void reconcileOnLaunch().then((state) => {
      if (cancelled) return
      setAccount(state)
      setAccountResolved(true)
    })
    // 갱신·환불처럼 앱 밖에서 일어난 거래 변화
    const onTransaction = (event: Event) => {
      const detail = (event as CustomEvent<{ signedTransaction?: string }>).detail
      if (!detail?.signedTransaction) return
      void submitTransaction(detail.signedTransaction)
        .then((state) => setAccount(state))
        .catch(() => undefined)
    }
    window.addEventListener('gym-transaction-update', onTransaction)
    return () => {
      cancelled = true
      window.removeEventListener('gym-transaction-update', onTransaction)
    }
  }, [])

  // 웹뷰가 다시 로드돼도 진행 중이던 휴식은 이어간다.
  // 저장 효과보다 먼저 선언해야 첫 렌더에서 키가 지워지기 전에 읽는다.
  useEffect(() => {
    const restoreSession = () => {
      if (focusRef.current) return
      const data = JSON.parse(localStorage.getItem(TIMER_KEY) || 'null') as
        | { mode?: string; slot?: number; sIdx?: number; setIdx?: number; phase?: string; restEndTime?: number }
        | null
      if (!data || data.mode !== 'session') {
        if (data) localStorage.removeItem(TIMER_KEY)
        return
      }
      const endTime = data.restEndTime ?? 0
      if (data.phase !== 'rest' || endTime <= Date.now() || typeof data.slot !== 'number') return
      const flatSets = buildFlatSets(dayFor(data.slot))
      const at = flatSets.findIndex((f) => f.sIdx === data.sIdx && f.setIdx === data.setIdx)
      if (at < 0) return
      setFocus({
        slot: data.slot,
        flatSets,
        currentIdx: at,
        phase: 'rest',
        restEndTime: endTime,
        restRemaining: Math.ceil((endTime - Date.now()) / 1000),
        lastCountdown: null,
      })
      setFocusCollapsed(true)
    }
    restoreSession()
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') restoreSession()
    }
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [])

  // 세션 스냅샷 저장 — 현재 세트 위치와 휴식 종료 시각만 남긴다.
  useEffect(() => {
    if (!focus) {
      localStorage.removeItem(TIMER_KEY)
      return
    }
    const cur = focus.flatSets[focus.currentIdx]
    localStorage.setItem(
      TIMER_KEY,
      JSON.stringify({
        mode: 'session',
        slot: focus.slot,
        sIdx: cur ? cur.sIdx : null,
        setIdx: cur ? cur.setIdx : null,
        phase: focus.phase,
        restEndTime: focus.restEndTime ?? 0,
      }),
    )
  }, [focus])

  // 탭 이동이나 뒤로 가기로 화면이 바뀌면 포커스 모드를 종료하지 않고 접는다.
  // 운동 세션은 미니 바로 남아 계속 이어진다.
  const routeKey = route.view === 'today' ? `today/${route.slot}` : route.view
  useEffect(() => {
    if (focusRef.current) setFocusCollapsed(true)
  }, [routeKey])

  // 미니 바가 떠 있는 동안에는 본문 아래 여백과 FAB 위치를 한 칸 올린다.
  const miniActive = focus !== null && focusCollapsed
  useEffect(() => {
    document.body.classList.toggle('has-mini', miniActive)
    return () => document.body.classList.remove('has-mini')
  }, [miniActive])

  // ============ 오버레이 열림 시 배경 스크롤 잠금 ============
  // WKWebView는 키보드가 뜨면 인풋을 노출하려고 문서를 강제 스크롤한다.
  // 오버레이가 떠 있는 동안 body를 고정해 이 점프(덜컹임)를 차단한다.
  // 로그인 게이트가 뜰 수 있는 환경에서는 계정 조회가 끝날 때까지 온보딩을 미룬다 — 게이트보다 먼저 깜빡이면 안 된다.
  const loginSettled = !loginAvailable() || skipLoginGateFlag() || accountResolved
  const onboardingVisible = onboarding.open && (onboarding.mode === 'change' || loginSettled)
  const overlayLock = chatOpen || sheet !== null || memo.open || onboardingVisible
  useEffect(() => {
    if (!overlayLock) return undefined
    const y = window.scrollY
    const { body } = document
    body.style.position = 'fixed'
    body.style.top = `-${y}px`
    body.style.left = '0'
    body.style.right = '0'
    body.style.width = '100%'
    return () => {
      body.style.position = ''
      body.style.top = ''
      body.style.left = ''
      body.style.right = ''
      body.style.width = ''
      window.scrollTo(0, y)
    }
  }, [overlayLock])

  // ============ ACTUAL EDIT SHEET ============
  const openSheet = useCallback((ctx: SheetCtx) => {
    setSheet(ctx)
    setSheetKey((k) => k + 1) // 열 때마다 시트를 리마운트해 스텝퍼 초기값 재계산
  }, [])
  const closeSheet = useCallback(() => setSheet(null), [])

  const onSheetSave = useCallback(
    (ctx: SheetCtx, wStr: string, rStr: string, rpe: number | null) => {
      closeSheet()
      withDaySwitch(ctx.slot, () => {
        const day = dayFor(ctx.slot)
        const set = day.sections[ctx.s].sets[ctx.i]
        // 이미 끝낸 세트의 숫자만 고친 경우 — 운동이 끝난 뒤 기록을 정리할 때도 휴식 타이머가 다시 돌면 안 된다.
        const wasDone = !!getEntry(todayLogFor(ctx.slot), ctx.s, ctx.i)?.done
        const w = parseFloat(wStr)
        const r = parseFloat(rStr)
        const log = recordSet(ctx.slot, ctx.s, ctx.i, {
          done: true,
          skipped: false,
          actualW: isNaN(w) ? set.weight || '' : fmtNum(w),
          actualR: isNaN(r) ? set.reps || '' : fmtNum(r),
          rpe,
        })
        if (!log) return
        if (ctx.fromFocus) {
          focusAfterDone()
        } else if (wasDone) {
          // 고친 숫자가 남은 세트의 목표(백오프 연동)를 바꿀 수 있으니 세션 목록만 맞춘다.
          setFocus((f) => (f && f.slot === ctx.slot ? withFreshSets(f) : f))
          bump()
        } else {
          void ensurePermissions()
          beginRestAt(ctx.slot, ctx.s, ctx.i, ctx.rest)
          bump()
        }
      })
    },
    [beginRestAt, bump, closeSheet, ensurePermissions, focusAfterDone, withDaySwitch],
  )

  const onSheetSkip = useCallback(
    (ctx: SheetCtx) => {
      closeSheet()
      withDaySwitch(ctx.slot, () => {
        const log = recordSet(ctx.slot, ctx.s, ctx.i, { done: false, skipped: true, actualW: null, actualR: null, rpe: null })
        if (!log) return
        if (ctx.fromFocus) advanceAfterRest()
        else bump()
      })
    },
    [advanceAfterRest, bump, closeSheet, withDaySwitch],
  )

  // ============ 계정 ============
  const doSignIn = useCallback(async () => {
    const id = await signIn()
    if (id) setAccount(await fetchAccountState())
    return id
  }, [])

  /// 코치를 여는 모든 입구가 거치는 관문. 로그인 → 데이터 전송 동의 → 하려던 동작 순서로 잇는다.
  /// 코치는 계정마다 한도와 구독이 붙는 기능이라 로그인이 필요하고, 답변을 외부 AI가 만들기 때문에
  /// 처음 한 번은 무엇을 보내는지 알리고 동의를 받는다.
  /// 브라우저 배포본은 Apple 로그인이 없어 서버가 코치를 막으므로, 챗을 열지 않고 앱에서 쓰라고 안내한다.
  const withCoach = useCallback(
    (action: () => void) => {
      if (!loginAvailable()) {
        void askConfirm({
          title: '코치는 iOS 앱에서 쓸 수 있어요',
          body: '코치는 로그인이 필요한데, 로그인은 iOS 앱에서만 할 수 있어요. 운동 기록과 타이머는 여기서도 그대로 쓸 수 있어요.',
          confirmLabel: '확인',
          notice: true,
        })
        return
      }
      const withConsent = () => {
        if (!hasAiConsent()) {
          afterAiConsentRef.current = action
          setAiConsentOpen(true)
          return
        }
        action()
      }
      if (!currentAccountId()) {
        afterCoachLoginRef.current = withConsent
        setCoachLoginOpen(true)
        return
      }
      withConsent()
    },
    [askConfirm],
  )

  const closeCoachLogin = useCallback(() => {
    afterCoachLoginRef.current = null
    setCoachLoginOpen(false)
  }, [])

  const onCoachLoginDone = useCallback(() => {
    const next = afterCoachLoginRef.current
    afterCoachLoginRef.current = null
    setCoachLoginOpen(false)
    next?.()
  }, [])

  const onAiConsentAgree = useCallback(() => {
    setAiConsent(saveAiConsent())
    setAiConsentOpen(false)
    const next = afterAiConsentRef.current
    afterAiConsentRef.current = null
    next?.()
  }, [])

  const onAiConsentDecline = useCallback(() => {
    afterAiConsentRef.current = null
    setAiConsentOpen(false)
  }, [])

  /// 설정에서 동의를 켜고 끈다. 철회는 기록만 지우고, 다음에 코치를 열 때 다시 묻는다.
  const onAiConsentToggle = useCallback(async () => {
    if (!hasAiConsent()) {
      afterAiConsentRef.current = null
      setAiConsentOpen(true)
      return
    }
    const ok = await askConfirm({
      title: '데이터 전송 동의를 철회할까요?',
      body: '이제 코치에게 루틴, 운동 기록, 채팅 내용을 보내지 않아요. 코치를 다시 열면 동의를 다시 물어봐요.',
      confirmLabel: '철회',
    })
    if (!ok) return
    clearAiConsent()
    setAiConsent(null)
  }, [askConfirm])

  const onDeleteAccount = useCallback(async () => {
    const result = await deleteAccount()
    setAccount(await fetchAccountState())
    return result
  }, [])

  // ============ 루틴 온보딩 ============
  /// 템플릿 블록을 걸고 DAY 1로 보낸다. 라우트도 직접 바꾼다 — 새 블록의 day 수가 적으면
  /// 해시 변경이 반영되기 전 렌더에서 없는 slot을 그리게 된다.
  const startProgram = useCallback(
    (program: Program, start: string) => {
      if (!applyProgram(program, start)) return
      markOnboarded()
      setOnboarding((o) => ({ ...o, open: false }))
      if (focusRef.current) exitFocusMode()
      setRoute({ view: 'today', slot: 1 })
      navigate('#/today/1')
      bump()
    },
    [bump, exitFocusMode],
  )

  const onOnboardApply = useCallback(
    async (program: Program, start: string) => {
      // 이미 쓰던 루틴이 있으면 한 번 묻는다. 기존 블록은 applyProgram이 보관함으로 옮기고, 기록은 건드리지 않는다.
      const hasData = !!activeProgram() || lsGet<string[]>(LOG_INDEX_KEY, []).length > 0
      if (onboarding.mode === 'change' && hasData) {
        const ok = await askConfirm({
          title: `${program.name}로 바꿀까요?`,
          body:
            '지금 루틴은 보관되고, 지금까지의 운동 기록은 그대로 남아요.' +
            (focusRef.current ? ' 진행 중인 운동은 여기서 끝나요.' : ''),
          confirmLabel: '바꾸기',
        })
        if (!ok) return
      }
      startProgram(program, start)
    },
    [askConfirm, onboarding.mode, startProgram],
  )

  /// 첫 실행에서 "나중에"를 고르면 작성자 개인 루틴 대신 초보 전신 템플릿을 무게 없이 건다.
  /// 설정에서 연 경우엔 지금 루틴을 그대로 두고 닫기만 한다.
  const onOnboardLater = useCallback(() => {
    if (onboarding.mode === 'first') startProgram(buildProgram(DEFAULT_TEMPLATE), todayStr())
    else setOnboarding((o) => ({ ...o, open: false }))
  }, [onboarding.mode, startProgram])

  const openRoutinePicker = useCallback(() => {
    setOnboarding((o) => ({ open: true, mode: 'change', key: o.key + 1 }))
  }, [])

  // ============ GYMBRO CHAT ============
  const openChat = useCallback((kind: 'daily' | 'builder', slot?: number, focusPos?: { s: number; i: number } | null) => {
    setChat((prev) => {
      const fresh = !prev || prev.kind !== kind || prev.date !== todayStr() || (kind === 'daily' && prev.slot !== (slot || 1))
      if (fresh) {
        const messages: ChatMessage[] = []
        if (!chatConfigured()) messages.push({ id: nextId(), kind: 'sys', text: NOT_CONFIGURED_MSG })
        return { kind, slot: slot || 1, date: todayStr(), wire: [], messages, pendingNote: '', busy: false, generate: false, typing: false, focusPos: focusPos ?? null }
      }
      // 같은 챗을 다시 열면 진행 위치만 현재 세트로 갱신 (지정됐을 때만)
      return focusPos !== undefined ? { ...prev, focusPos } : prev
    })
    setChatOpen(true)
  }, [])

  const closeChat = useCallback(() => setChatOpen(false), [])

  /// 온보딩의 "코치와 직접 만들기". 코치 블록이 적용되기 전(로그인을 미루거나 챗을 닫는 경우)에도
  /// 남의 루틴이 보이지 않게, 첫 실행이면 "나중에"와 같은 기본 템플릿을 먼저 걸어 둔다.
  const onOnboardCoach = useCallback(() => {
    onOnboardLater()
    withCoach(() => openChat('builder'))
  }, [onOnboardLater, openChat, withCoach])

  const pushMsg = useCallback((msg: ChatMessage) => {
    setChat((prev) => (prev ? { ...prev, messages: [...prev.messages, msg] } : prev))
  }, [])

  const setMsgState = useCallback((id: number, patch: Partial<ChatMessage>) => {
    setChat((prev) =>
      prev
        ? { ...prev, messages: prev.messages.map((m) => (m.id === id ? ({ ...m, ...patch } as ChatMessage) : m)) }
        : prev,
    )
  }, [])

  const setPendingNote = useCallback((note: string) => {
    setChat((prev) => (prev ? { ...prev, pendingNote: note } : prev))
  }, [])

  const onProposalApply = useCallback(
    (id: number, slot: number, proposal: Proposal) => {
      applyProposal(slot, proposal)
      setMsgState(id, { state: 'applied' } as Partial<ChatMessage>)
      setPendingNote('(방금 제안을 적용했어)')
      refreshFocusAfterOverride()
      bump()
    },
    [bump, refreshFocusAfterOverride, setMsgState, setPendingNote],
  )

  const onProposalReject = useCallback(
    (id: number) => {
      setMsgState(id, { state: 'rejected' } as Partial<ChatMessage>)
      setPendingNote('(방금 제안은 거절했어)')
    },
    [setMsgState, setPendingNote],
  )

  const onProgramApply = useCallback(
    (id: number, program: Program, start: string) => {
      if (applyProgram(program, start)) {
        setMsgState(id, { state: 'applied' } as Partial<ChatMessage>)
        setPendingNote('(블록을 적용했어)')
        // 진행 중이던 세션은 예전 루틴의 세트 목록을 들고 있다. 온보딩에서 루틴을 바꿀 때처럼 끝낸다.
        if (focusRef.current) exitFocusMode()
        // 새 블록이 지금 보던 day보다 짧으면 없는 day를 그리게 된다. 오늘 탭이면 새 블록 기준으로 다시 고른다.
        const m = location.hash.match(/^#\/today\/(\d+)/)
        if (m && Number(m[1]) > dayCount()) navigate('#/today/' + defaultSlot())
        bump()
      }
    },
    [bump, exitFocusMode, setMsgState, setPendingNote],
  )

  const onProgramReject = useCallback(
    (id: number) => {
      setMsgState(id, { state: 'editing' } as Partial<ChatMessage>)
      setPendingNote('(직전 블록 제안에서 수정하고 싶은 게 있어)')
    },
    [setMsgState, setPendingNote],
  )

  const sendChat = useCallback(
    async (rawText: string, forceGenerate = false) => {
      const text = (rawText || '').trim()
      const current = chatRef.current
      if (!current || current.busy || !text) return
      // 입구(withCoach)에서 이미 동의를 받지만, 챗이 열린 사이 동의가 철회됐을 수도 있다.
      // 동의 없이는 어떤 경로로도 외부 AI에 보내지 않도록 전송 직전에 한 번 더 막는다.
      if (!hasAiConsent()) {
        setChatOpen(false)
        afterAiConsentRef.current = () => setChatOpen(true)
        setAiConsentOpen(true)
        return
      }
      if (!chatConfigured()) {
        pushMsg({ id: nextId(), kind: 'sys', text: NOT_CONFIGURED_MSG })
        return
      }
      const generate = current.kind === 'builder' && (current.generate || forceGenerate)
      const mode = current.kind === 'daily' ? 'daily_adjust' : generate ? 'program_generate' : 'program_intake'
      // 영구 저장용 wire: builder 는 첫 메시지에 컨텍스트를 baking (인테이크 내내 유지).
      // daily 는 컨텍스트를 저장하지 않는다 — 매 전송 시 최신 스냅샷으로 새로 주입하므로.
      let storedText = text
      if (current.kind === 'builder' && !current.wire.length) {
        storedText = buildBuilderContext() + '\n\n' + storedText
      }
      if (current.pendingNote) storedText = current.pendingNote + '\n' + storedText
      const newWire = [...current.wire, { role: 'user' as const, content: storedText }]

      // 실제 전송용 wire: daily 는 매 메시지마다 최신 컨텍스트(진행 위치·완료/실측 상태 포함)를
      // 마지막 유저 턴에 주입한다. 이전 턴의 옛 스냅샷은 wire 에 남지 않아 토큰·혼선이 없다.
      let sendWire = newWire
      if (current.kind === 'daily') {
        const ctx = buildDailyContext(current.slot, current.focusPos)
        sendWire = newWire.map((m, idx) => (idx === newWire.length - 1 ? { ...m, content: ctx + '\n\n' + m.content } : m))
      }
      // 대화가 길어지면 서버 상한(메시지 수·글자 수)에 걸려 매번 400이 난다. 오래된 턴을 덜어 보낸다.
      sendWire = trimWire(sendWire, mode, current.kind === 'builder')
      const slot = current.slot
      const kind = current.kind

      setChat((prev) =>
        prev
          ? {
              ...prev,
              wire: newWire,
              pendingNote: '',
              busy: true,
              typing: true,
              generate,
              messages: [...prev.messages, { id: nextId(), kind: 'user', text }],
            }
          : prev,
      )

      try {
        const env = await callServer(mode, sendWire)
        setChat((prev) =>
          prev ? { ...prev, wire: [...prev.wire, { role: 'assistant' as const, content: env.raw }], typing: false } : prev,
        )
        if (env.message) pushMsg({ id: nextId(), kind: 'bot', text: env.message })
        if (kind === 'daily' && env.proposal) {
          const err = validateProposal(slot, env.proposal)
          if (err) {
            pushMsg({ id: nextId(), kind: 'sys', text: '제안을 적용할 수 없는 형태로 받았어요. 다시 요청해 주세요.' })
            setPendingNote('(직전 제안은 형식 오류로 무효: ' + err + '. 고쳐서 다시 제안해줘)')
          } else {
            const preview = applyOps(dayFor(slot), env.proposal.ops)
            pushMsg({ id: nextId(), kind: 'proposal', proposal: env.proposal, changes: preview.changes, state: 'pending' })
          }
        }
        if (kind === 'builder' && env.program) {
          const err = validateProgram(env.program)
          if (err) {
            pushMsg({ id: nextId(), kind: 'sys', text: '받은 블록에 문제가 있어 적용할 수 없어요. 다시 만들어 달라고 해 주세요.' })
            setPendingNote('(생성한 블록이 검증에 실패했어: ' + err + '. 해당 부분만 고쳐서 다시 생성해줘)')
          } else {
            pushMsg({ id: nextId(), kind: 'program', program: env.program, state: 'pending' })
          }
        }
      } catch (e) {
        // 보내지 못한 턴은 대화에서 뺀다. 그 턴에 실어 보낸 메모(제안 적용·거절 같은 pendingNote)는 다음 전송에 다시 싣는다.
        const lostNote = current.pendingNote
        setChat((prev) =>
          prev
            ? {
                ...prev,
                wire: prev.wire.slice(0, -1),
                typing: false,
                pendingNote: [lostNote, prev.pendingNote].filter(Boolean).join('\n'),
              }
            : prev,
        )
        const err = e as QuotaError
        pushMsg({ id: nextId(), kind: 'sys', text: err.message })
        // 세션이 끊겼다면(다른 기기에서 계정 삭제 등) 로그인 안내를 띄우고, 로그인하면 챗을 다시 연다.
        // 로그인할 수 없는 환경(브라우저)에서는 안내를 띄워도 버튼이 동작하지 않으므로 메시지만 남긴다.
        if (err.loginRequired && loginAvailable()) {
          void fetchAccountState().then(setAccount)
          setChatOpen(false)
          afterCoachLoginRef.current = () => setChatOpen(true)
          setCoachLoginOpen(true)
        }
        // 한도를 다 쓴 거라면 페이월로 안내한다. 무료 사용자에게만 의미가 있다.
        if (err.quota) {
          void fetchAccountState().then(setAccount)
          if (err.tier !== 'paid') {
            setPaywall({ open: true, reason: err.message })
          }
        }
      } finally {
        setChat((prev) => (prev ? { ...prev, busy: false, generate: false } : prev))
      }
    },
    [pushMsg, setPendingNote],
  )

  const onChatGenerate = useCallback(() => {
    const current = chatRef.current
    if (!current || current.busy) return
    void sendChat('지금까지 합의한 내용으로 블록을 생성해줘', true)
  }, [sendChat])

  // ============ RENDER ============
  const activeSlot = route.view === 'today' ? route.slot : 1

  // 로그인 게이트: 네이티브 앱에서, 계정 조회가 끝났고, 계정이 없고, 건너뛰지 않았을 때만.
  // 브라우저 배포본에는 Apple 로그인이 없으므로 아예 띄우지 않는다.
  const loginGateOpen =
    loginAvailable() &&
    !skipLoginGateFlag() &&
    accountResolved &&
    !account.accountId &&
    !loginSkipped

  // 세션이 지금 어느 세트에 있는지 — 오늘 목록에서 위치와 휴식을 함께 보여준다.
  const currentMarkSet = focus && focus.phase !== 'complete' ? focus.flatSets[focus.currentIdx] : undefined
  const sessionMark: SessionMark | null =
    focus && currentMarkSet
      ? {
          slot: focus.slot,
          sIdx: currentMarkSet.sIdx,
          setIdx: currentMarkSet.setIdx,
          phase: focus.phase,
          restRemaining: focus.restRemaining ?? 0,
        }
      : null

  // 집중 모드·미니 바가 보여 줄 '다음 세트'와 진행 위치. 휴식이 끝나면 실제로 넘어갈 세트(advanceFrom)와 같은 기준이다.
  const focusNextIdx = focus && focus.phase !== 'complete' ? nextUndoneIdx(focus, focus.currentIdx, focus.phase === 'rest') : -1
  const focusNext = focus && focusNextIdx >= 0 ? focus.flatSets[focusNextIdx] : undefined
  const focusPos = focus ? focusPosition(focus) : 0
  const focusDone = focus ? (focus.phase === 'complete' ? focus.flatSets.length : finishedCount(focus)) : 0

  const summaryLog = focus ? todayLogFor(focus.slot) : null
  const focusSummary: FocusSummary = {
    done: summaryLog ? logDoneCount(summaryLog) : 0,
    total: focus ? focus.flatSets.length : 0,
    minutes: summaryLog ? sessionDuration(summaryLog) : null,
    volumeKg: summaryLog ? logVolume(summaryLog) : 0,
  }

  if (loginGateOpen) {
    return (
      <LoginGate
        open
        onSignIn={doSignIn}
        onSkip={() => {
          localStorage.setItem(LOGIN_SKIP_KEY, '1')
          setLoginSkipped(true)
        }}
      />
    )
  }

  return (
    <>
      {route.view === 'today' && (
        <TodayView
          slot={route.slot}
          notificationPermission={notificationPermission}
          wakeLockActive={wakeLockActive}
          wakeLockUnavailable={wakeLockUnavailable}
          onToggle={toggleCheck}
          onOpenSheet={openSheet}
          onTimerStart={startRestOnly}
          onMemo={onMemo}
          onReset={onReset}
          onStartFocus={startOrResume}
          sessionActive={focus !== null && focus.slot === route.slot}
          mark={sessionMark}
          collapsed={focusCollapsed}
          onRevert={onRevertOverride}
          onWakeClick={toggleWakeLock}
          onNotifClick={requestNotif}
        />
      )}
      {route.view === 'log' && (
        <CalendarView
          cursor={calCursor}
          selected={calSelected}
          onCursor={setCalCursor}
          onSelected={setCalSelected}
        />
      )}
      {route.view === 'logDetail' && <LogDetailView date={route.date} />}
      {route.view === 'settings' && (
        <SettingsView
          onBuilder={() => withCoach(() => openChat('builder'))}
          onChangeRoutine={openRoutinePicker}
          aiConsent={aiConsent}
          onAiConsentToggle={() => void onAiConsentToggle()}
          onDeleteAccount={() => setDeleteSheet((d) => ({ open: true, key: d.key + 1 }))}
          account={account}
          onAccountChange={setAccount}
          onOpenPaywall={() => setPaywall({ open: true, reason: null })}
          onImport={importRecords}
        />
      )}

      {/* 하단 고정 스택 — FAB이 미니 바 유무에 따라 자동으로 올라간다 */}
      <div className="bottom-stack">
        <Fab show={route.view === 'today'} onClick={() => withCoach(() => openChat('daily', activeSlot))} />
        <MiniPlayer
          focus={focus}
          next={focusNext}
          position={focusPos}
          finished={focusDone}
          show={miniActive}
          alert={focusAlert}
          onExpand={() => setFocusCollapsed(false)}
          onSetDone={onFocusNext}
          onSkipRest={onSkipRest}
          onFinish={exitFocusMode}
        />
        <Tabbar activeView={route.view} />
      </div>

      <ActualSheet key={sheetKey} ctx={sheet} onClose={closeSheet} onSave={onSheetSave} onSkip={onSheetSkip} />
      <MemoSheet
        key={'memo' + memo.key}
        open={memo.open}
        initial={loadLogByDate(todayStr())?.note || ''}
        onClose={closeMemo}
        onSave={onMemoSave}
      />
      <ChatOverlay
        open={chatOpen}
        chat={chat}
        onClose={closeChat}
        onSend={sendChat}
        onGenerate={onChatGenerate}
        onProposalApply={onProposalApply}
        onProposalReject={onProposalReject}
        onProgramApply={onProgramApply}
        onProgramReject={onProgramReject}
      />
      <FocusMode
        focus={focus}
        next={focusNext}
        position={focusPos}
        alert={focusAlert}
        collapsed={focusCollapsed}
        summary={focusSummary}
        onCollapse={() => setFocusCollapsed(true)}
        onExit={onFocusExit}
        onCoach={() => {
          if (!focus) return
          const cur = focus.flatSets[focus.currentIdx]
          withCoach(() => openChat('daily', focus.slot, cur ? { s: cur.sIdx, i: cur.setIdx } : null))
        }}
        onNext={onFocusNext}
        onSkipRest={onSkipRest}
        onExtendRest={extendRest}
        onMemo={() => focus && onMemo(focus.slot)}
        onAlt={(current) =>
          focus && openSheet({ slot: focus.slot, s: current.sIdx, i: current.setIdx, rest: current.section.rest, fromFocus: true })
        }
        onDone={exitFocusMode}
      />
      <Paywall
        open={paywall.open}
        reason={paywall.reason}
        onClose={() => setPaywall({ open: false, reason: null })}
        onUpgraded={setAccount}
        loggedIn={!!account.accountId}
        onSignIn={doSignIn}
      />
      <CoachLoginSheet open={coachLoginOpen} onSignIn={doSignIn} onClose={closeCoachLogin} onDone={onCoachLoginDone} />
      <AiConsentSheet open={aiConsentOpen} onAgree={onAiConsentAgree} onDecline={onAiConsentDecline} />
      <DeleteAccountSheet
        key={'delete' + deleteSheet.key}
        open={deleteSheet.open}
        subscribed={account.tier === 'paid'}
        onDelete={onDeleteAccount}
        onClose={() => setDeleteSheet((d) => ({ ...d, open: false }))}
      />
      <NotificationSettingsModal
        active={showNotificationSettings}
        onCancel={() => setShowNotificationSettings(false)}
        onConfirm={() => {
          setShowNotificationSettings(false)
          openNativeNotificationSettings()
        }}
      />
      <Onboarding
        key={'onboard' + onboarding.key}
        open={onboardingVisible}
        mode={onboarding.mode}
        onApply={onOnboardApply}
        onLater={onOnboardLater}
        onCoach={onOnboardCoach}
      />
      <ConfirmDialog request={confirmReq} onResolve={resolveConfirm} />
    </>
  )
}

// ============ TODAY VIEW ============
type TodayViewProps = {
  slot: number
  notificationPermission: string
  wakeLockActive: boolean
  wakeLockUnavailable: boolean
  onToggle: (slot: number, s: number, i: number, rest: number) => void
  onOpenSheet: (ctx: SheetCtx) => void
  onTimerStart: (slot: number, s: number, i: number, rest: number) => void
  onMemo: (slot: number) => void
  onReset: () => void
  onStartFocus: (slot: number) => void
  sessionActive: boolean
  mark: SessionMark | null
  onRevert: (slot: number) => void
  onWakeClick: () => void
  onNotifClick: () => void
  collapsed: boolean
}

function TodayView({
  slot,
  notificationPermission,
  wakeLockActive,
  wakeLockUnavailable,
  onToggle,
  onOpenSheet,
  onTimerStart,
  onMemo,
  onReset,
  onStartFocus,
  sessionActive,
  mark,
  collapsed,
  onRevert,
  onWakeClick,
  onNotifClick,
}: TodayViewProps) {
  // 세트가 넘어가거나 포커스 모드를 접었을 때 현재 세트가 보이도록 스크롤한다.
  const markSIdx = mark?.sIdx
  const markSetIdx = mark?.setIdx
  useEffect(() => {
    if (markSIdx === undefined || markSetIdx === undefined) return
    const el = document.getElementById(`set-${markSIdx}-${markSetIdx}`)
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [markSIdx, markSetIdx, collapsed])

  const day = dayFor(slot)
  const log = todayLogFor(slot)
  const totalSets = countTotalSets(day)
  const doneSets = logDoneCount(log)
  const pct = totalSets ? Math.round((doneSets / totalSets) * 100) : 0
  const complete = isLogComplete(log)
  const program = activeProgram()
  const override = todayOverrideFor(slot)
  const weekSlots = weekDoneSlots()
  const defs = dayDefs()

  // 고른 day 칩을 줄 가운데로 옮긴다. 양옆 칩이 늘 보여서 스크롤 없이 탭만으로 끝까지 갈 수 있다.
  // 페이지까지 움직이는 scrollIntoView 대신 줄만 가로로 스크롤한다. 처음 그릴 때는 애니메이션 없이.
  const stripRef = useRef<HTMLDivElement>(null)
  const stripScrolledRef = useRef(false)
  const dayCount = defs.length
  useEffect(() => {
    const strip = stripRef.current
    const chip = strip?.querySelector<HTMLElement>('.day-chip.active')
    if (!strip || !chip) return
    const offset = chip.getBoundingClientRect().left - strip.getBoundingClientRect().left
    const left = strip.scrollLeft + offset - (strip.clientWidth - chip.offsetWidth) / 2
    strip.scrollTo({ left, behavior: stripScrolledRef.current ? 'smooth' : 'auto' })
    stripScrolledRef.current = true
  }, [slot, dayCount])

  const tagParts = [
    program ? `${currentWeek(program)}/${program.weeks}주차` : '',
    // 대체 루틴('ALT')은 요일이 정해져 있지 않다 — 'ALT요일'로 보이지 않게 진짜 요일일 때만 붙인다.
    weekdayKr(day.day) ? weekdayKr(day.day) + '요일' : '',
    day.tag || '',
  ].filter(Boolean)

  // 시작 버튼은 지금 상태에서 누르면 일어날 일을 말한다.
  let start: { main: string; sub: string; cls: string; onClick: () => void }
  if (complete) {
    start = { main: '오늘 운동 완료', sub: '기록 보기', cls: 'done', onClick: () => navigate('#/log/' + todayStr()) }
  } else if (sessionActive || doneSets > 0) {
    start = { main: '이어서 하기', sub: `${doneSets}/${totalSets}세트 완료`, cls: '', onClick: () => onStartFocus(slot) }
  } else {
    start = {
      main: '운동 시작',
      sub: `${day.sections.length}종목 · ${totalSets}세트`,
      cls: '',
      onClick: () => onStartFocus(slot),
    }
  }

  return (
    <div className="app" id="app">
      <StatusBar
        notificationPermission={notificationPermission}
        wakeLockActive={wakeLockActive}
        wakeLockUnavailable={wakeLockUnavailable}
        onWakeClick={onWakeClick}
        onNotifClick={onNotifClick}
      />

      <div className="header">
        {tagParts.length ? <div className="header-tag">{tagParts.join(' · ')}</div> : null}
        <h1 className="header-title">
          DAY {String(slot).padStart(2, '0')}
          <br />
          <span>{day.title}</span>
        </h1>
        {override ? (
          <button className="adjusted-chip" type="button" onClick={() => onRevert(slot)}>
            코치가 오늘 루틴을 조정했어요 <span className="adjusted-undo">되돌리기</span>
          </button>
        ) : null}
      </div>

      <div className="day-strip" ref={stripRef}>
        {defs.map((d, idx) => {
          const s = idx + 1
          const sLog = todayLogFor(s)
          let state = ''
          if (sLog && sLog.sets.length && !isLogComplete(sLog)) state = 'in-progress'
          else if ((sLog && isLogComplete(sLog)) || weekSlots.has(s)) state = 'completed'
          const cls = ['day-chip', s === slot ? 'active' : '', state].filter(Boolean).join(' ')
          return (
            <button
              key={s}
              type="button"
              className={cls}
              style={{ '--chip-color': d.color } as CSSProperties}
              aria-label={`DAY ${s} ${d.title}`}
              aria-current={s === slot ? 'true' : undefined}
              onClick={() => navigate('#/today/' + s)}
            >
              <span className={d.chip ? 'd alt' : 'd'}>{d.chip || `D${s}`}</span>
              <span className="wd">{dayLabel(d) || '·'}</span>
              <span className="day-dot" />
            </button>
          )
        })}
      </div>

      <button className={`start-btn ${start.cls}`} type="button" onClick={start.onClick}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          {complete ? <polyline points="5 12.5 10 17.5 19 7" className="stroke" /> : <path d="M8 5v14l11-7z" />}
        </svg>
        <span className="start-text">
          <span className="main">{start.main}</span>
          <span className="sub">{start.sub}</span>
        </span>
      </button>

      <div className="progress-wrap">
        <div className="progress-label">
          <span>
            <b>{doneSets}</b> / {totalSets}세트 완료
          </span>
          <span className="pct">{pct}%</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {day.sections.map((section, sIdx) => (
        <TodaySection
          key={sIdx}
          slot={slot}
          section={section}
          sIdx={sIdx}
          log={log}
          onToggle={onToggle}
          onOpenSheet={onOpenSheet}
          onTimerStart={onTimerStart}
          mark={mark}
        />
      ))}

      {log?.note ? (
        <button className="note-box today-note" type="button" onClick={() => onMemo(slot)}>
          <span className="note-label">메모</span>
          {log.note}
        </button>
      ) : null}

      <div className="action-row">
        <button className="reset-btn" type="button" onClick={() => onMemo(slot)}>
          {log?.note ? '메모 수정' : '메모 남기기'}
        </button>
        {log ? (
          <button className="reset-btn" type="button" onClick={onReset}>
            오늘 기록 지우기
          </button>
        ) : null}
      </div>
      <div className="list-hint">세트를 누르면 체크, 숫자를 누르면 실제 무게·횟수를 적을 수 있어요.</div>
    </div>
  )
}

type TodaySectionProps = {
  slot: number
  section: WorkoutSection
  sIdx: number
  log: SessionLog | null
  onToggle: (slot: number, s: number, i: number, rest: number) => void
  onOpenSheet: (ctx: SheetCtx) => void
  onTimerStart: (slot: number, s: number, i: number, rest: number) => void
  mark: SessionMark | null
}

function TodaySection({ slot, section, sIdx, log, onToggle, onOpenSheet, onTimerStart, mark }: TodaySectionProps) {
  const sectionActive = !!mark && mark.slot === slot && mark.sIdx === sIdx
  const sectionDone = section.sets.every((_, i) => {
    const en = getEntry(log, sIdx, i)
    return en && (en.done || en.skipped)
  })

  return (
    <div className={`section ${sectionDone ? 'complete' : ''}`}>
      <div className="section-head">
        <div className="section-num">{String(sIdx + 1).padStart(2, '0')}</div>
        <div className="section-info">
          <div className="section-title">{section.title}</div>
          <div className="section-meta">
            {section.rest > 0 ? (
              <>
                휴식 <span className="rest">{formatRestShort(section.rest)}</span>
              </>
            ) : (
              '휴식 없음'
            )}
            {section.meta ? ` · ${section.meta}` : ''}
          </div>
        </div>
        {sectionActive && mark ? (
          <span className={`section-now ${mark.phase === 'rest' ? 'rest' : ''}`}>
            {mark.phase === 'rest' ? '휴식 중' : '진행 중'}
          </span>
        ) : sectionDone ? (
          <span className="section-done" aria-label="완료">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <polyline points="5 12.5 10 17.5 19 7" />
            </svg>
          </span>
        ) : null}
      </div>
      <div className="sets">
        {section.sets.map((set, setIdx) => (
          <TodaySetRow
            key={setIdx}
            slot={slot}
            section={section}
            sIdx={sIdx}
            setIdx={setIdx}
            set={set}
            entry={getEntry(log, sIdx, setIdx)}
            onToggle={onToggle}
            onOpenSheet={onOpenSheet}
            onTimerStart={onTimerStart}
            mark={mark}
          />
        ))}
      </div>
    </div>
  )
}

type TodaySetRowProps = {
  slot: number
  section: WorkoutSection
  sIdx: number
  setIdx: number
  set: WorkoutSet
  entry: ReturnType<typeof getEntry>
  onToggle: (slot: number, s: number, i: number, rest: number) => void
  onOpenSheet: (ctx: SheetCtx) => void
  onTimerStart: (slot: number, s: number, i: number, rest: number) => void
  mark: SessionMark | null
}

function TodaySetRow({ slot, section, sIdx, setIdx, set, entry, onToggle, onOpenSheet, onTimerStart, mark }: TodaySetRowProps) {
  const isDone = !!(entry && entry.done)
  const isSkipped = !!(entry && entry.skipped)
  const adjusted = !!set._changed
  const rest = section.rest
  const isNow = !!mark && mark.slot === slot && mark.sIdx === sIdx && mark.setIdx === setIdx
  const isResting = isNow && mark.phase === 'rest'
  const rowCls = ['set-row', isDone ? 'done' : '', isSkipped ? 'skipped' : '', isNow ? 'now' : '', isResting ? 'resting' : '']
    .filter(Boolean)
    .join(' ')

  return (
    <div id={`set-${sIdx}-${setIdx}`} className={rowCls} onClick={() => onToggle(slot, sIdx, setIdx, rest)}>
      {/* 체크박스를 실제 접근성 요소로 노출한다 — VoiceOver가 세트를 읽고 토글할 수 있다 */}
      <div
        className="checkbox"
        role="checkbox"
        aria-checked={isDone}
        aria-label={`${set.label} ${set.name} 완료`}
        tabIndex={0}
        onClick={(e) => {
          e.stopPropagation()
          onToggle(slot, sIdx, setIdx, rest)
        }}
      >
        <svg viewBox="0 0 24 24">
          <polyline points="4 12 10 18 20 6" />
        </svg>
      </div>
      <div className="set-label">{set.label}</div>
      <div
        className="set-content"
        role="button"
        aria-label={`${set.label} 기록 수정`}
        onClick={(e) => {
          e.stopPropagation()
          onOpenSheet({ slot, s: sIdx, i: setIdx, rest, fromFocus: false })
        }}
      >
        <SetFigures
          name={set.name}
          targetW={set.weight}
          targetR={set.reps}
          unit={set.unit}
          entry={entry}
          adjusted={adjusted}
        />
      </div>
      {/* 세션이 지금 이 세트에 있으면 표시한다. 휴식 중이면 남은 시간까지 */}
      {isNow && mark ? (
        <span className={`set-now ${isResting ? 'rest' : ''}`}>
          {isResting ? `휴식 ${formatTime(mark.restRemaining)}` : '지금'}
        </span>
      ) : null}
      {rest > 0 ? (
        <button
          className="timer-btn"
          type="button"
          aria-label={`휴식 타이머 ${formatRestShort(rest)} 시작`}
          onClick={(e) => {
            e.stopPropagation()
            onTimerStart(slot, sIdx, setIdx, rest)
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="13" r="8" />
            <path d="M12 9v4l2 2M9 2h6" />
          </svg>
        </button>
      ) : null}
    </div>
  )
}

/// 세트 한 줄의 무게 × 횟수. 실측이 목표와 다르면 목표를 지우고 실측을 노랗게 보여준다.
/// 오늘 목록과 기록 상세가 같은 규칙으로 그린다.
function SetFigures({
  name,
  targetW,
  targetR,
  unit,
  entry,
  adjusted = false,
}: {
  name: string
  targetW: string
  targetR: string
  unit: string
  entry: SetEntry | null
  adjusted?: boolean
}) {
  const isDone = !!(entry && entry.done)
  const wEdited = isDone && entry!.actualW !== null && entry!.actualW !== (entry!.targetW ?? targetW)
  const rEdited = isDone && entry!.actualR !== null && entry!.actualR !== (entry!.targetR ?? targetR)
  const reps = rEdited ? entry!.actualR! : targetR
  const numericReps = /^[\d\s–~-]+$/.test(reps)
  const shownW = wEdited ? entry!.actualW! : targetW

  return (
    <>
      {targetW || wEdited ? (
        <>
          {wEdited && targetW ? <span className="set-old">{targetW}</span> : null}
          <span className={`set-weight${wEdited || adjusted ? ' edited' : ''}`}>{shownW}</span>
          {(unit || wEdited) && isNumericWeight(shownW) ? <span className="set-unit">{unit || 'kg'}</span> : null}
        </>
      ) : (
        <span className="set-name">{name}</span>
      )}
      <span className="set-x">×</span>
      {rEdited ? <span className="set-old">{targetR}</span> : null}
      <span className={`set-reps${rEdited || adjusted ? ' edited' : ''}`}>
        <span className="num">{reps}</span>
        {numericReps ? '회' : ''}
      </span>
      {isDone && entry!.rpe ? <span className="set-rpe-tag">RPE {entry!.rpe}</span> : null}
      {entry?.skipped ? <span className="set-skip-tag">건너뜀</span> : null}
    </>
  )
}

// ============ CALENDAR VIEW ============
type CalendarViewProps = {
  cursor: { y: number; m: number } | null
  selected: string | null
  onCursor: (c: { y: number; m: number }) => void
  onSelected: (d: string | null) => void
}

function CalendarView({ cursor, selected, onCursor, onSelected }: CalendarViewProps) {
  const now = new Date()
  const cur = cursor || { y: now.getFullYear(), m: now.getMonth() }
  const { y, m } = cur
  const isThisMonth = y === now.getFullYear() && m === now.getMonth()
  const index = lsGet<string[]>(LOG_INDEX_KEY, [])
  const monthPrefix = y + '-' + String(m + 1).padStart(2, '0')
  const monthDates = index.filter((d) => d.startsWith(monthPrefix))
  const logs: Record<string, SessionLog> = {}
  monthDates.forEach((d) => {
    const l = loadLogByDate(d)
    if (l) logs[d] = l
  })
  const completeCount = Object.values(logs).filter((l) => isLogComplete(l)).length

  const startWd = new Date(y, m, 1).getDay()
  const daysInMonth = new Date(y, m + 1, 0).getDate()
  const today = todayStr()

  const move = (delta: number) => {
    const d = new Date(y, m + delta, 1)
    onCursor({ y: d.getFullYear(), m: d.getMonth() })
    onSelected(null)
  }

  const cells: ReactNode[] = []
  ;['일', '월', '화', '수', '목', '금', '토'].forEach((w) => cells.push(<div key={'wd' + w} className="cal-wd">{w}</div>))
  for (let k = 0; k < startWd; k++) cells.push(<div key={'e' + k} className="cal-cell empty" />)
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = monthPrefix + '-' + String(d).padStart(2, '0')
    const l = logs[dateStr]
    let cls = 'cal-cell'
    let style: CSSProperties | undefined
    if (l) {
      cls += ' has-log'
      if (!isLogComplete(l)) cls += ' partial'
      style = { '--log-color': l.color || DEFAULT_ACCENT } as CSSProperties
    }
    if (dateStr === today) cls += ' today'
    if (dateStr === selected) cls += ' selected'
    cells.push(
      <button
        key={dateStr}
        type="button"
        className={cls}
        style={style}
        aria-label={formatDateKr(dateStr) + (l ? ' 운동함' : '')}
        onClick={() => onSelected(selected === dateStr ? null : dateStr)}
      >
        <span>{d}</span>
        <span className="cal-dot" />
      </button>,
    )
  }

  const selLog = selected ? logs[selected] : null
  const selDur = selLog ? sessionDuration(selLog) : null

  return (
    <div className="app" id="app">
      <div className="header">
        <h1 className="header-title kr">운동 기록</h1>
        <div className="header-sub">{index.length ? `지금까지 ${index.length}번 운동했어요` : '아직 기록이 없어요'}</div>
      </div>
      <div className="cal-head">
        <div className="cal-month">
          {y}년 {m + 1}월
        </div>
        <div className="cal-nav">
          {!isThisMonth ? (
            <button
              className="cal-today"
              type="button"
              onClick={() => {
                onCursor({ y: now.getFullYear(), m: now.getMonth() })
                onSelected(null)
              }}
            >
              이번 달
            </button>
          ) : null}
          <button type="button" aria-label="이전 달" onClick={() => move(-1)}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M15 6l-6 6 6 6" />
            </svg>
          </button>
          <button type="button" aria-label="다음 달" onClick={() => move(1)}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </button>
        </div>
      </div>
      <div className="cal-grid">{cells}</div>
      <div className="cal-summary">
        <div>
          <b>{monthDates.length}</b>
          <span>{m + 1}월 운동한 날</span>
        </div>
        <div>
          <b>{completeCount}</b>
          <span>끝까지 마친 날</span>
        </div>
      </div>
      {selected && selLog ? (
        <div className="cal-day-card" style={{ borderLeftColor: selLog.color || DEFAULT_ACCENT }}>
          <div className="t">
            DAY {selLog.daySlot} · {selLog.dayTitle}
          </div>
          <div className="m">
            {formatDateKr(selected)} · {logDoneCount(selLog)}/{selLog.totalSets || selLog.sets.length}세트
            {selDur ? ` · ${selDur}분` : ''}
            {selLog.adjusted ? ' · 코치 조정' : ''}
          </div>
          <button className="go" type="button" onClick={() => navigate('#/log/' + selected)}>
            자세히 보기
          </button>
        </div>
      ) : selected ? (
        <div className="cal-day-card empty">{formatDateKr(selected)}에는 운동 기록이 없어요.</div>
      ) : null}
      {!index.length ? (
        <div className="empty-state">
          오늘 탭에서 세트를 체크하면
          <br />
          날짜별로 여기에 자동으로 쌓여요.
        </div>
      ) : null}
    </div>
  )
}

function sessionDuration(log: SessionLog): number | null {
  return log.startedAt && log.endedAt ? Math.max(1, Math.round((+new Date(log.endedAt) - +new Date(log.startedAt)) / 60000)) : null
}

/// 완료한 세트의 무게 × 횟수 합계 (kg).
function logVolume(log: SessionLog): number {
  return log.sets
    .filter((en) => en.done)
    .reduce((acc, en) => {
      const w = parseNum(en.actualW ?? en.targetW)
      const r = parseNum(en.actualR ?? en.targetR)
      return w && r ? acc + w * r : acc
    }, 0)
}

function formatVolume(kg: number): string {
  return kg >= 1000 ? `${(kg / 1000).toFixed(1)}t` : `${Math.round(kg)}kg`
}

// ============ LOG DETAIL VIEW ============
function LogDetailView({ date }: { date: string }) {
  const log = loadLogByDate(date)

  const back = (
    <button className="detail-back" type="button" onClick={() => navigate('#/log')}>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M15 6l-6 6 6 6" />
      </svg>
      기록
    </button>
  )

  if (!log) {
    return (
      <div className="app" id="app">
        {back}
        <div className="empty-state">{formatDateKr(date)}에는 운동 기록이 없어요.</div>
      </div>
    )
  }

  const doneCnt = logDoneCount(log)
  const dur = sessionDuration(log)
  const volume = logVolume(log)

  const groups: { s: number; title: string; entries: typeof log.sets }[] = []
  log.sets
    .slice()
    .sort((a, b) => a.s - b.s || a.i - b.i)
    .forEach((en) => {
      let g = groups.find((x) => x.s === en.s)
      if (!g) {
        g = { s: en.s, title: en.sec, entries: [] }
        groups.push(g)
      }
      g.entries.push(en)
    })

  return (
    <div className="app" id="app">
      {back}
      <div className="header">
        <div className="header-tag">
          {formatDateKr(date)} · DAY {log.daySlot}
        </div>
        <h1 className="header-title">
          <span>{log.dayTitle}</span>
        </h1>
      </div>

      <div className="stat-row">
        <div>
          <b>
            {doneCnt}/{log.totalSets || log.sets.length}
          </b>
          <span>세트</span>
        </div>
        {volume ? (
          <div>
            <b>{formatVolume(volume)}</b>
            <span>총 볼륨</span>
          </div>
        ) : null}
        {dur ? (
          <div>
            <b>{dur}분</b>
            <span>운동 시간</span>
          </div>
        ) : null}
      </div>

      {log.adjusted ? (
        <div className="note-box">
          <span className="note-label">코치 조정</span>
          {log.adjusted}
        </div>
      ) : null}

      {groups.map((g) => (
        <div className="section" key={g.s + '-' + g.title}>
          <div className="section-head">
            {/* s가 -1인 세트는 코치 조정으로 계획에서 빠진 세트다 — 기록은 남기되 번호는 붙이지 않는다. */}
            <div className="section-num">{g.s >= 0 ? String(g.s + 1).padStart(2, '0') : '–'}</div>
            <div className="section-info">
              <div className="section-title">{g.title}</div>
            </div>
          </div>
          <div className="sets">
            {g.entries.map((en, ei) => {
              const rowCls = ['set-row', 'static', en.done ? 'done' : '', en.skipped ? 'skipped' : ''].filter(Boolean).join(' ')
              return (
                <div className={rowCls} key={ei}>
                  <div className="checkbox">
                    <svg viewBox="0 0 24 24">
                      <polyline points="4 12 10 18 20 6" />
                    </svg>
                  </div>
                  <div className="set-label">{en.label}</div>
                  <div className="set-content">
                    <SetFigures name={en.name} targetW={en.targetW} targetR={en.targetR} unit={en.unit} entry={en} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {log.note ? (
        <div className="note-box">
          <span className="note-label">메모</span>
          {log.note}
        </div>
      ) : null}
    </div>
  )
}

// ============ SETTINGS VIEW ============
const MODE_LABELS: Record<string, string> = {
  daily_adjust: '코치 루틴 조정',
  program_intake: '블록 상담',
  program_generate: '새 블록 만들기',
}

type ImportResult = { error: boolean; text: string }

function skippedText(plan: ImportPlan): string {
  return plan.skipped ? ` ${plan.skipped}개는 형식이 맞지 않아 건너뛰었어요.` : ''
}

type SettingsViewProps = {
  onBuilder: () => void
  onChangeRoutine: () => void
  aiConsent: AiConsent | null
  onAiConsentToggle: () => void
  onDeleteAccount: () => void
  account: AccountState
  onAccountChange: (state: AccountState) => void
  onOpenPaywall: () => void
  onImport: (file: File) => Promise<ImportResult | null>
}

function SettingsView({
  onBuilder,
  onChangeRoutine,
  aiConsent,
  onAiConsentToggle,
  onDeleteAccount,
  account,
  onAccountChange,
  onOpenPaywall,
  onImport,
}: SettingsViewProps) {
  const [authBusy, setAuthBusy] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const importInputRef = useRef<HTMLInputElement>(null)
  const [importBusy, setImportBusy] = useState(false)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)

  const [exportBusy, setExportBusy] = useState(false)
  const [exportResult, setExportResult] = useState<ImportResult | null>(null)

  const onExport = async () => {
    setExportBusy(true)
    setExportResult(null)
    try {
      // 공유 시트를 그냥 닫은 경우는 사용자가 원한 것이니 아무 말도 하지 않는다.
      if ((await exportData()) === 'saved') setExportResult({ error: false, text: '기록 파일을 저장했어요.' })
    } catch {
      setExportResult({ error: true, text: '기록 파일을 만들지 못했어요. 다시 시도해 주세요.' })
    } finally {
      setExportBusy(false)
    }
  }

  const onImportFile = async (input: HTMLInputElement) => {
    const file = input.files?.[0]
    // 같은 파일을 다시 골라도 change 가 오도록 바로 비운다.
    input.value = ''
    if (!file) return
    setImportBusy(true)
    setImportResult(null)
    try {
      setImportResult(await onImport(file))
    } finally {
      setImportBusy(false)
    }
  }

  const runAuth = async (fn: () => Promise<unknown>) => {
    setAuthBusy(true)
    setAuthError(null)
    try {
      await fn()
      onAccountChange(await fetchAccountState())
    } catch (e) {
      setAuthError((e as Error).message)
    } finally {
      setAuthBusy(false)
    }
  }

  const index = lsGet<string[]>(LOG_INDEX_KEY, [])
  const p = activeProgram()
  const [plate, setPlate] = useState(plateStep)
  const togglePlate = () => {
    const next = plate === 5 ? 2.5 : 5
    setPlateStep(next)
    setPlate(next)
  }

  const accountText = account.offline
    ? '코치 서버에 연결되지 않았어요'
    : account.accountId
      ? 'Apple 계정으로 로그인됨'
      : '로그인하지 않음'

  return (
    <div className="app" id="app">
      <div className="header">
        <h1 className="header-title kr">설정</h1>
      </div>

      {/* 계정·구독은 Apple 로그인이 되는 iOS 앱에서만 의미가 있다. 브라우저 배포본에서는 눌러도 동작하지 않는
          로그인·구독 버튼과 '서버에 연결되지 않았어요' 문구만 남으므로 칸을 통째로 숨긴다. */}
      {loginAvailable() ? (
        <>
          <div className="settings-group-label">계정</div>
          <div className="settings-block account-block">
            <div className="account-row">
              <span className={`tier-badge ${account.tier}`}>{account.tier === 'paid' ? 'PRO' : 'FREE'}</span>
              <span className="account-id">{accountText}</span>
            </div>

            {account.usage ? (
              <div className="usage-list">
                {Object.entries(account.usage).map(([mode, usage]) => (
                  <div className="usage-row" key={mode}>
                    <span className="usage-name">{MODE_LABELS[mode] || mode}</span>
                    <span className="usage-bar">
                      <span style={{ width: `${Math.min((usage.used / Math.max(usage.limit, 1)) * 100, 100)}%` }} />
                    </span>
                    <span className="usage-num">
                      {usage.window === 'month' ? '이번 달' : '오늘'} {usage.used}/{usage.limit}회
                    </span>
                  </div>
                ))}
              </div>
            ) : null}

            <div className="account-actions">
              {account.tier === 'paid' ? null : (
                <button className="reset-btn accent" type="button" onClick={onOpenPaywall}>
                  PRO 구독하기
                </button>
              )}
              {account.accountId ? (
                <button className="reset-btn" type="button" disabled={authBusy} onClick={() => runAuth(signOut)}>
                  로그아웃
                </button>
              ) : (
                <button className="reset-btn" type="button" disabled={authBusy} onClick={() => runAuth(signIn)}>
                   Apple로 로그인
                </button>
              )}
            </div>
            {authError ? <div className="settings-error">{authError}</div> : null}
            {!account.accountId ? (
              <div className="settings-hint">로그인하면 코치를 쓸 수 있고, 기기를 바꿔도 구독이 그대로 이어져요.</div>
            ) : null}
          </div>
          {account.accountId ? (
            <button className="settings-danger-link" type="button" onClick={onDeleteAccount}>
              계정 삭제
            </button>
          ) : null}
        </>
      ) : null}

      <div className="settings-group-label">프로그램</div>
      {p ? (
        <div className="program-card">
          <div className="pc-name">{p.name}</div>
          <div className="pc-meta">
            {currentWeek(p)}/{p.weeks}주차 · {frequencyText(p.days)} · {formatDateKr(p.startDate || '', false)} 시작
          </div>
          <div className="program-bar">
            <div className="fill" style={{ width: `${Math.round((currentWeek(p) / p.weeks) * 100)}%` }} />
          </div>
          {currentWeek(p) >= p.weeks ? <div className="pc-alert">이번 주가 마지막 주예요. 다음 블록을 준비해 보세요.</div> : null}
        </div>
      ) : (
        <div className="program-card">
          <div className="pc-name">기본 루틴</div>
          <div className="pc-meta">{frequencyText(dayDefs())} 분할 · 진행 중인 블록 없음</div>
        </div>
      )}

      <button className="settings-item" type="button" onClick={onChangeRoutine}>
        <span>
          루틴 바꾸기
          <span className="settings-item-sub">초보 전신 · 상하체 분할 · 파워빌딩 중에서 골라요</span>
        </span>
        <span className="chev" aria-hidden="true">›</span>
      </button>

      <button className="settings-item" type="button" onClick={togglePlate}>
        <span>
          바벨 무게 단위
          <span className="settings-item-sub">
            {plate === 5 ? '가장 작은 원판이 2.5kg이라 5kg씩 올려요' : '1.25kg 원판이 있어 2.5kg씩 올려요'} · 누르면 바꿔요
          </span>
        </span>
        <span className="settings-item-value">{plate}kg</span>
      </button>

      <button className="settings-item" type="button" onClick={onBuilder}>
        <span>
          코치와 새 블록 만들기
          <span className="settings-item-sub">목표와 일정을 말하면 몇 주짜리 프로그램을 짜 줘요</span>
        </span>
        <span className="chev" aria-hidden="true">›</span>
      </button>
      <AiConsentSettingsRow consent={aiConsent} onToggle={onAiConsentToggle} />

      <div className="settings-group-label">데이터</div>
      <button className="settings-item" type="button" disabled={exportBusy} onClick={() => void onExport()}>
        <span>
          운동 기록 내보내기
          <span className="settings-item-sub">{index.length}일치 기록을 JSON 파일로 저장해요</span>
        </span>
        <span className="chev" aria-hidden="true">›</span>
      </button>
      {exportResult ? (
        <div className={exportResult.error ? 'settings-error' : 'settings-hint'} role="status" style={{ margin: '0 4px 10px' }}>
          {exportResult.text}
        </div>
      ) : null}
      {/* iOS 웹뷰에서도 표준 파일 입력이 '파일' 앱 선택 창을 연다 — 네이티브 쪽 처리는 필요 없다. */}
      <input
        ref={importInputRef}
        type="file"
        accept="application/json,.json"
        hidden
        onChange={(e) => void onImportFile(e.currentTarget)}
      />
      <button
        className="settings-item"
        type="button"
        disabled={importBusy}
        onClick={() => importInputRef.current?.click()}
      >
        <span>
          운동 기록 가져오기
          <span className="settings-item-sub">내보낸 JSON 파일의 기록을 지금 기록에 합쳐요</span>
        </span>
        <span className="chev" aria-hidden="true">›</span>
      </button>
      {importResult ? (
        <div className={importResult.error ? 'settings-error' : 'settings-hint'} role="status" style={{ margin: '0 4px 10px' }}>
          {importResult.text}
        </div>
      ) : null}

      {/* 문서는 코치 서버가 서빙한다. 서버 주소 없이 빌드했으면 열 곳이 없으니 숨긴다. */}
      {TERMS_URL || PRIVACY_URL ? (
        <>
          <div className="settings-group-label">정보</div>
          {TERMS_URL ? (
            <button className="settings-item" type="button" onClick={() => openExternal(TERMS_URL)}>
              <span>이용약관</span>
              <span className="chev" aria-hidden="true">›</span>
            </button>
          ) : null}
          {PRIVACY_URL ? (
            <button className="settings-item" type="button" onClick={() => openExternal(PRIVACY_URL)}>
              <span>개인정보처리방침</span>
              <span className="chev" aria-hidden="true">›</span>
            </button>
          ) : null}
        </>
      ) : null}
    </div>
  )
}

// ============ ACTUAL EDIT SHEET ============
type ActualSheetProps = {
  ctx: SheetCtx | null
  onClose: () => void
  onSave: (ctx: SheetCtx, w: string, r: string, rpe: number | null) => void
  onSkip: (ctx: SheetCtx) => void
}

function sheetInitial(ctx: SheetCtx | null) {
  if (!ctx) return { wVal: '', rVal: '', rpe: null as number | null }
  const set = dayFor(ctx.slot).sections[ctx.s].sets[ctx.i]
  const en = getEntry(todayLogFor(ctx.slot), ctx.s, ctx.i)
  const w = parseNum(en && en.actualW !== null ? en.actualW : set.weight)
  const r = parseNum(en && en.actualR !== null ? en.actualR : set.reps)
  return { wVal: w == null ? '' : String(w), rVal: r == null ? '' : String(r), rpe: en ? en.rpe : null }
}

function ActualSheet({ ctx, onClose, onSave, onSkip }: ActualSheetProps) {
  // 시트는 열 때마다 key 로 리마운트되므로 초기값을 초기화 함수에서 한 번만 계산한다
  const init = sheetInitial(ctx)
  const [wVal, setWVal] = useState(init.wVal)
  const [rVal, setRVal] = useState(init.rVal)
  const [rpe, setRpe] = useState<number | null>(init.rpe)

  const set = ctx ? dayFor(ctx.slot).sections[ctx.s].sets[ctx.i] : null
  const unit = set?.unit || 'kg'
  // 맨몸 세트는 무게 입력을 숨긴다.
  const showWeight = !!set && (!!set.weight || !!set.unit)

  const step = (cur: string, delta: number) => fmtNum(Math.max(0, (parseFloat(cur) || 0) + delta))

  return (
    <>
      <div className={`sheet-backdrop ${ctx ? 'active' : ''}`} onClick={onClose} />
      <div className={`sheet ${ctx ? 'active' : ''}`} role="dialog" aria-label="세트 기록">
        <div className="sheet-handle" />
        <div className="sheet-heading">{set ? set.name : ''}</div>
        <div className="sheet-caption">{set ? `${set.label} · 목표 ${loadText(set)}` : ''}</div>
        {showWeight ? (
          <>
            <div className="stepper-caption">무게 ({unit})</div>
            <div className="stepper-row">
              <button className="stepper-btn" type="button" aria-label="2.5 줄이기" onClick={() => setWVal((v) => step(v, -2.5))}>
                −2.5
              </button>
              <input
                className="stepper-val"
                type="number"
                inputMode="decimal"
                step="0.5"
                placeholder="0"
                aria-label="무게"
                value={wVal}
                onChange={(e) => setWVal(e.target.value)}
              />
              <button className="stepper-btn" type="button" aria-label="2.5 늘리기" onClick={() => setWVal((v) => step(v, 2.5))}>
                +2.5
              </button>
            </div>
          </>
        ) : null}
        <div className="stepper-caption">횟수</div>
        <div className="stepper-row">
          <button className="stepper-btn" type="button" aria-label="1회 줄이기" onClick={() => setRVal((v) => step(v, -1))}>
            −1
          </button>
          <input
            className="stepper-val"
            type="number"
            inputMode="numeric"
            step="1"
            placeholder="0"
            aria-label="횟수"
            value={rVal}
            onChange={(e) => setRVal(e.target.value)}
          />
          <button className="stepper-btn" type="button" aria-label="1회 늘리기" onClick={() => setRVal((v) => step(v, 1))}>
            +1
          </button>
        </div>
        <div className="stepper-caption">
          RPE <span className="opt">선택 · 10에 가까울수록 한계에 가까웠다는 뜻</span>
        </div>
        <div className="rpe-row">
          {RPE_VALUES.map((v) => (
            <button
              key={v}
              className={`rpe-chip ${rpe === v ? 'on' : ''}`}
              type="button"
              aria-pressed={rpe === v}
              onClick={() => setRpe((cur) => (cur === v ? null : v))}
            >
              {v}
            </button>
          ))}
        </div>
        <div className="sheet-actions">
          <button className="sheet-btn skip" type="button" onClick={() => ctx && onSkip(ctx)}>
            건너뛰기
          </button>
          <button className="sheet-btn save" type="button" onClick={() => ctx && onSave(ctx, wVal, rVal, rpe)}>
            저장
          </button>
        </div>
      </div>
    </>
  )
}

// ============ CHAT OVERLAY ============
type ChatOverlayProps = {
  open: boolean
  chat: ChatState | null
  onClose: () => void
  onSend: (text: string) => void
  onGenerate: () => void
  onProposalApply: (id: number, slot: number, proposal: Proposal) => void
  onProposalReject: (id: number) => void
  onProgramApply: (id: number, program: Program, start: string) => void
  onProgramReject: (id: number) => void
}

const CHAT_COPY = {
  daily: {
    sub: (slot: number) => `DAY ${slot} 루틴 조정`,
    intro: '오늘 컨디션이나 상황을 알려주세요. 코치가 남은 세트를 맞춰 조정해 드려요.',
    chips: ['오늘 컨디션 별로야', '30분밖에 없어', '허리가 좀 불편해', '잠을 거의 못 잤어'],
    placeholder: '지금 상태를 알려주세요',
  },
  builder: {
    sub: () => '새 블록 설계',
    intro: '목표, 주당 운동 횟수, 기간을 알려주세요. 코치가 몇 가지 물어본 뒤 블록을 짜 드려요.',
    chips: ['다음 블록 짜줘', '주 4일로 바꾸고 싶어', '벤치 위주로 가고 싶어'],
    placeholder: '목표나 일정을 알려주세요',
  },
} as const

function ChatOverlay({
  open,
  chat,
  onClose,
  onSend,
  onGenerate,
  onProposalApply,
  onProposalReject,
  onProgramApply,
  onProgramReject,
}: ChatOverlayProps) {
  const [input, setInput] = useState('')
  const bodyRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const b = bodyRef.current
    if (b) b.scrollTop = b.scrollHeight
  }, [open, chat?.messages, chat?.typing])

  // 키보드가 뜨면서 웹뷰가 리사이즈되면 대화를 맨 아래로 유지
  useEffect(() => {
    const onResize = () => {
      const b = bodyRef.current
      if (b) b.scrollTop = b.scrollHeight
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const busy = !!chat?.busy
  const canSend = !!input.trim() && !busy

  const submit = () => {
    if (!canSend) return
    const v = input
    setInput('')
    onSend(v)
  }

  const copy = CHAT_COPY[chat?.kind ?? 'daily']
  const showIntro = !!chat && !chat.messages.some((m) => m.kind === 'user')

  return (
    <div className={`chat-overlay ${open ? 'active' : ''}`} aria-hidden={!open}>
      <div className="chat-backdrop" onClick={onClose} />
      <div className="chat-panel">
        <div className="chat-handle" />
        <div className="chat-header">
          <div className="chat-heading">
            <div className="chat-title">
              GYM<span>BRO</span>
            </div>
            <div className="chat-sub">{chat ? copy.sub(chat.slot) : ''}</div>
          </div>
          {chat?.kind === 'builder' ? (
            <button className="chat-hbtn gen" type="button" disabled={busy} onClick={onGenerate}>
              블록 만들기
            </button>
          ) : null}
          <button className="chat-close" type="button" aria-label="닫기" onClick={onClose}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        <div className="chat-body" ref={bodyRef}>
          {showIntro ? <div className="chat-intro">{copy.intro}</div> : null}
          {chat?.messages.map((m) => {
            if (m.kind === 'proposal') {
              return (
                <ProposalCard
                  key={m.id}
                  msg={m}
                  onApply={() => onProposalApply(m.id, chat.slot, m.proposal)}
                  onReject={() => onProposalReject(m.id)}
                />
              )
            }
            if (m.kind === 'program') {
              return (
                <ProgramCard
                  key={m.id}
                  msg={m}
                  onApply={(start) => onProgramApply(m.id, m.program, start)}
                  onReject={() => onProgramReject(m.id)}
                />
              )
            }
            return (
              <div key={m.id} className={`chat-msg ${m.kind}`}>
                {m.text}
              </div>
            )
          })}
          {chat?.typing ? (
            chat.generate ? (
              <div className="chat-typing">블록을 설계하고 있어요. 1~2분 정도 걸려요.</div>
            ) : (
              <div className="chat-typing dots" aria-label="코치가 답변을 쓰고 있어요">
                <span />
                <span />
                <span />
              </div>
            )
          ) : null}
          {showIntro ? (
            <div className="quick-chips">
              {copy.chips.map((c) => (
                <button key={c} className="quick-chip" type="button" onClick={() => onSend(c)}>
                  {c}
                </button>
              ))}
            </div>
          ) : null}
        </div>
        <div className="chat-input-bar">
          <input
            className="chat-input"
            type="text"
            placeholder={copy.placeholder}
            autoComplete="off"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                e.preventDefault()
                submit()
              }
            }}
          />
          <button className="chat-send" type="button" aria-label="보내기" disabled={!canSend} onClick={submit}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 19V5M6 11l6-6 6 6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

function ProposalCard({
  msg,
  onApply,
  onReject,
}: {
  msg: Extract<ChatMessage, { kind: 'proposal' }>
  onApply: () => void
  onReject: () => void
}) {
  return (
    <div className="diff-card">
      <div className="dc-title">오늘 루틴 조정안</div>
      {msg.proposal.summary ? <div className="dc-summary">{msg.proposal.summary}</div> : null}
      {msg.changes.map((c, i) => (
        <div className="dc-item" key={i}>
          {c}
        </div>
      ))}
      {msg.state === 'pending' ? (
        <div className="dc-actions">
          <button className="dc-btn reject" type="button" onClick={onReject}>
            적용 안 함
          </button>
          <button className="dc-btn apply" type="button" onClick={onApply}>
            적용하기
          </button>
        </div>
      ) : msg.state === 'applied' ? (
        <div className="dc-state ok">오늘 루틴에 적용했어요. 오늘 탭에서 되돌릴 수 있어요.</div>
      ) : (
        <div className="dc-state">적용하지 않았어요. 원하는 방향을 말해 주면 다시 제안해요.</div>
      )}
    </div>
  )
}

function ProgramCard({
  msg,
  onApply,
  onReject,
}: {
  msg: Extract<ChatMessage, { kind: 'program' }>
  onApply: (start: string) => void
  onReject: () => void
}) {
  const [start, setStart] = useState(nextMonday)
  const program = msg.program
  const progressionCount = (program.progression || []).length
  return (
    <div className="diff-card program">
      <div className="dc-title">새 블록 제안</div>
      <div className="dc-name">{program.name}</div>
      <div className="dc-meta">
        {program.weeks}주 · {frequencyText(program.days)}
        {program.deload ? ` · ${program.deload.week}주차 디로드` : ''}
      </div>
      {program.intent ? <div className="dc-summary">{program.intent}</div> : null}
      {program.days.map((d, i) => (
        <div className="dc-item" key={i}>
          <span className="dc-dot" style={{ background: d.color }} /> DAY {i + 1} · {d.title}
          {dayLabel(d) ? <span className="dc-faint"> · {dayLabel(d)}</span> : null}
          <span className="dc-faint"> · {countTotalSets(d)}세트</span>
        </div>
      ))}
      {progressionCount ? <div className="dc-item dc-faint">매주 무게를 올리는 종목 {progressionCount}개</div> : null}
      {msg.state === 'pending' ? (
        <>
          <label className="dc-date">
            <span>시작일</span>
            <input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
          </label>
          <div className="dc-actions">
            <button className="dc-btn reject" type="button" onClick={onReject}>
              수정 요청
            </button>
            <button className="dc-btn apply" type="button" disabled={!start} onClick={() => onApply(start)}>
              이 블록으로 시작
            </button>
          </div>
        </>
      ) : msg.state === 'applied' ? (
        <div className="dc-state ok">블록을 적용했어요. 오늘 탭에서 바로 확인할 수 있어요.</div>
      ) : (
        <div className="dc-state">어떤 부분을 바꾸고 싶은지 말해 주세요.</div>
      )}
    </div>
  )
}

declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext
  }
}

export default App
