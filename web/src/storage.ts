// ============ gym v4 — 비-UI 로직 (index.html 포팅) ============
// 원본의 localStorage 단일 진실원본 방식을 그대로 따른다. React 레이어는
// 변경 후 rev 카운터를 bump 해 화면이 storage 를 다시 읽게 한다 (원본의 render() 와 동일).

import routineData from './routine.json'
import type {
  FlatSet,
  Op,
  Override,
  Program,
  Proposal,
  Routine,
  ServerEnvelope,
  SessionLog,
  SetEntry,
  WireMessage,
  WorkoutDay,
  WorkoutSection,
  WorkoutSet,
} from './types'

// ============ CONSTANTS ============
export const V4 = 'gym-v4-'
export const TIMER_KEY = 'gym-v4-timer'
export const LOG_INDEX_KEY = 'gym-v4-log-index'
export const DEFAULT_ACCENT = '#ff2d2d'
export const PROGRAM_KEY = V4 + 'program'
export const PROGRAM_ARCHIVE_KEY = V4 + 'program-archive'

// 코치 서버는 우리 서버 하나다. 주소와 앱 토큰은 빌드할 때 WebApp/.env.local에서 넣는다.
// 앱에 실리는 값이라 비밀이 아니다 — 사용자 구분과 한도는 서버가 계정 단위로 맡는다.
export const SERVER_URL = (import.meta.env.VITE_SERVER_URL || '').replace(/\/+$/, '')
export const API_TOKEN = import.meta.env.VITE_API_TOKEN || ''
export const LOGIN_SKIP_KEY = V4 + 'login-skipped'
export const MIGRATED_KEY = V4 + 'migrated'
// 예전 설정 탭에서 직접 넣던 서버 주소·토큰. 지금은 쓰지 않지만 남아 있는 기기가 있을 수 있다.
export const LEGACY_SERVER_URL_KEY = V4 + 'server-url'
export const LEGACY_API_TOKEN_KEY = V4 + 'api-token'
// 이 기기에서만 의미가 있거나 민감한 키. 내보내기에 넣지 않고, 파일에 있어도 가져오지 않는다.
// 타이머는 이 기기에서 돌던 세션 시각이라 다른 기기로 옮기면 엉뚱한 휴식 알림이 뜬다.
export const DEVICE_ONLY_KEYS: ReadonlySet<string> = new Set([
  TIMER_KEY,
  LOGIN_SKIP_KEY,
  MIGRATED_KEY,
  LEGACY_SERVER_URL_KEY,
  LEGACY_API_TOKEN_KEY,
])
export const RPE_VALUES = [6, 7, 7.5, 8, 8.5, 9, 9.5, 10]

export const ROUTINE = routineData as Routine
const days = Object.keys(ROUTINE) // ['day1', ..., 'dayN'] — slot N = days[N-1]

// ============ MIGRATION (v3 → v4) ============
// 기존 체크 상태는 날짜 정보가 없는 휘발성 데이터라 승계하지 않고 폐기한다.
export function migrateV3() {
  // 예전 설정 탭에서 직접 넣던 서버 주소·토큰. 이제 빌드에 들어가므로 지운다 (내보내기에 섞이지 않게).
  localStorage.removeItem(LEGACY_SERVER_URL_KEY)
  localStorage.removeItem(LEGACY_API_TOKEN_KEY)
  if (localStorage.getItem(MIGRATED_KEY)) return
  try {
    days.forEach((d) => localStorage.removeItem('gym-v3-' + d + '-checks'))
    localStorage.removeItem('gym-v3-last-day')
    localStorage.removeItem('gym-v3-timer')
    localStorage.setItem(MIGRATED_KEY, '1')
  } catch {
    /* ignore */
  }
}

// ============ HELPERS ============
export function todayStr(): string {
  const d = new Date()
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
}

export function parseNum(str: unknown): number | null {
  const m = String(str ?? '').match(/\d+(\.\d+)?/)
  return m ? parseFloat(m[0]) : null
}

export function fmtNum(n: number | null | undefined): string {
  return n === null || n === undefined || isNaN(n) ? '' : String(Math.round(n * 100) / 100)
}

export function lsGet<T>(key: string, fallback: T): T {
  try {
    const v = JSON.parse(localStorage.getItem(key) as string)
    return v === null || v === undefined ? fallback : (v as T)
  } catch {
    return fallback
  }
}

export function lsSet(key: string, val: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(val))
  } catch {
    /* ignore */
  }
}

export function countTotalSets(day: WorkoutDay): number {
  return day.sections.reduce((acc, s) => acc + s.sets.length, 0)
}

export function mixColor(hex: string, mixWith: string, amount: number): string {
  const h = hex.replace('#', '')
  const r = parseInt(h.substring(0, 2), 16)
  const g = parseInt(h.substring(2, 4), 16)
  const b = parseInt(h.substring(4, 6), 16)
  const m = mixWith.replace('#', '')
  const mr = parseInt(m.substring(0, 2) || '00', 16)
  const mg = parseInt(m.substring(2, 4) || '00', 16)
  const mb = parseInt(m.substring(4, 6) || '00', 16)
  const nr = Math.round(r * (1 - amount) + mr * amount)
  const ng = Math.round(g * (1 - amount) + mg * amount)
  const nb = Math.round(b * (1 - amount) + mb * amount)
  return '#' + [nr, ng, nb].map((x) => x.toString(16).padStart(2, '0')).join('')
}

export function formatRestShort(sec: number): string {
  if (sec < 60) return sec + '초'
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return s === 0 ? m + '분' : `${m}분 ${s}초`
}

/// '5' → '5회', '10–12' → '10–12회'. 'AMRAP' 같은 글자는 그대로 둔다.
export function repsText(reps: string): string {
  return /^[\d\s–~-]+$/.test(reps) ? reps + '회' : reps
}

/// 숫자 무게인지. 'BAR'·'BW'·'HEAVY'·'LIGHT' 같은 글자 무게에는 단위를 붙이지 않는다 ('BARkg'가 되지 않게).
export function isNumericWeight(weight: string): boolean {
  return !isNaN(parseFloat(weight))
}

/// 무게와 단위. 글자 무게는 단위 없이 그대로.
export function weightText(set: { weight: string; unit: string }): string {
  return set.weight + (isNumericWeight(set.weight) ? set.unit || '' : '')
}

/// 무게와 횟수를 한 줄로. 맨몸 세트는 횟수만.
export function loadText(set: { weight: string; unit: string; reps: string }): string {
  return set.weight ? `${weightText(set)} × ${set.reps}` : repsText(set.reps)
}

const WEEKDAY_KR: Record<string, string> = { SUN: '일', MON: '월', TUE: '화', WED: '수', THU: '목', FRI: '금', SAT: '토' }

/// 루틴 데이터의 'MON' 같은 요일 코드를 '월'로 바꾼다. 요일이 아닌 값('ALT' 같은 대체 루틴 표시)은 빈 문자열.
export function weekdayKr(code?: string | null): string {
  if (!code) return ''
  return WEEKDAY_KR[code.toUpperCase()] || ''
}

/// day 칩·목록에 붙일 짧은 이름표. 요일이 정해진 day는 '월', 이름표(chip)가 붙은 대체 루틴은 '대체'.
export function dayLabel(d: Pick<WorkoutDay, 'day' | 'chip'>): string {
  return weekdayKr(d.day) || (d.chip ? '대체' : '')
}

/// '주 5회' 또는 '주 5회 + 대체 1일'. 이름표가 붙은 대체 루틴은 주간 횟수에 세지 않는다.
export function frequencyText(defs: Pick<WorkoutDay, 'chip'>[]): string {
  const regular = defs.filter((d) => !d.chip).length
  const alt = defs.length - regular
  return `주 ${regular}회${alt ? ` + 대체 ${alt}일` : ''}`
}

/// 'YYYY-MM-DD' → '9월 26일 (토)'
export function formatDateKr(date: string, withWeekday = true): string {
  const [y, m, d] = date.split('-').map(Number)
  if (!y || !m || !d) return date
  const label = `${m}월 ${d}일`
  if (!withWeekday) return label
  return `${label} (${'일월화수목금토'[new Date(y, m - 1, d).getDay()]})`
}

export function formatTime(s: number): string {
  const m = Math.floor(s / 60)
  const ss = s % 60
  return `${m}:${ss.toString().padStart(2, '0')}`
}

export function buildFlatSets(day: WorkoutDay): FlatSet[] {
  const flat: FlatSet[] = []
  day.sections.forEach((section, sIdx) => {
    section.sets.forEach((set, setIdx) => {
      flat.push({ sIdx, setIdx, section, set })
    })
  })
  return flat
}

// ============ SESSION LOG (날짜 키 운동일지) ============
export function logKey(date: string) {
  return V4 + 'log-' + date
}

export function loadLogByDate(date: string): SessionLog | null {
  return lsGet<SessionLog | null>(logKey(date), null)
}

export function saveLog(log: SessionLog, touch = true) {
  if (touch) log.endedAt = new Date().toISOString()
  lsSet(logKey(log.date), log)
  if (log.date < todayStr()) invalidatePastLogs()
  const index = lsGet<string[]>(LOG_INDEX_KEY, [])
  if (!index.includes(log.date)) {
    index.push(log.date)
    index.sort()
    lsSet(LOG_INDEX_KEY, index)
  }
}

export function deleteLog(date: string) {
  localStorage.removeItem(logKey(date))
  invalidatePastLogs()
  lsSet(
    LOG_INDEX_KEY,
    lsGet<string[]>(LOG_INDEX_KEY, []).filter((d) => d !== date),
  )
}

function newLog(slot: number): SessionLog {
  const day = dayFor(slot)
  const p = activeProgram()
  const ovr = todayOverrideFor(slot)
  return {
    schemaVersion: 1,
    date: todayStr(),
    programId: p ? p.id ?? null : null,
    week: p ? currentWeek(p) : null,
    daySlot: slot,
    dayTitle: day.title,
    color: day.color || DEFAULT_ACCENT,
    totalSets: countTotalSets(day),
    startedAt: new Date().toISOString(),
    endedAt: null,
    note: null,
    adjusted: ovr ? ovr.changes.join(', ').slice(0, 300) : null,
    sets: [],
  }
}

// 오늘 로그 보장. 다른 day 세션이 진행 중이면 confirm 후 교체. 취소 시 null.
// 새 로그는 저장하지 않고 반환만 한다 — 실제 저장은 첫 기록(recordSet/메모) 시점.
export function ensureTodayLog(slot: number): SessionLog | null {
  const log = loadLogByDate(todayStr())
  if (log && log.daySlot === slot) return log
  if (log) {
    if (
      !confirm(
        '오늘은 이미 DAY ' +
          log.daySlot +
          ' · ' +
          log.dayTitle +
          ' 기록이 있어요.\nDAY ' +
          slot +
          '로 바꾸면 기존 기록은 지워져요. 바꿀까요?',
      )
    )
      return null
    deleteLog(log.date)
  }
  return newLog(slot)
}

export function getEntry(log: SessionLog | null, s: number, i: number): SetEntry | null {
  return (log && log.sets.find((en) => en.s === s && en.i === i)) || null
}

export function hasDoneSetInSection(log: SessionLog | null, s: number): boolean {
  return !!log && log.sets.some((en) => en.s === s && en.done)
}

export type SetPatchInput = Partial<Pick<SetEntry, 'done' | 'skipped' | 'actualW' | 'actualR' | 'rpe'>>

// 세트 상태 기록. patch: { done, skipped, actualW, actualR, rpe }
export function recordSet(slot: number, s: number, i: number, patch: SetPatchInput): SessionLog | null {
  const log = ensureTodayLog(slot)
  if (!log) return null
  const day = dayFor(slot)
  const section = day.sections[s]
  const set = section.sets[i]
  let entry = getEntry(log, s, i)
  if (!entry) {
    entry = {
      s,
      i,
      sec: section.title,
      name: set.name,
      label: set.label,
      unit: set.unit || '',
      targetW: set.weight || '',
      targetR: set.reps || '',
      actualW: null,
      actualR: null,
      done: false,
      skipped: false,
      rpe: null,
    }
    log.sets.push(entry)
  }
  Object.assign(entry, patch)
  if (!entry.done && !entry.skipped) {
    log.sets = log.sets.filter((en) => en !== entry) // 체크 해제 → 엔트리 제거
  }
  if (!log.sets.length && !log.note) {
    deleteLog(log.date)
    return log
  }
  saveLog(log)
  return log
}

export function logDoneCount(log: SessionLog | null): number {
  return log ? log.sets.filter((en) => en.done).length : 0
}

// skipped 의미론: 진행상 통과로 치되 done 집계에서는 제외.
export function logFinishedCount(log: SessionLog | null): number {
  return log ? log.sets.filter((en) => en.done || en.skipped).length : 0
}
export function isLogComplete(log: SessionLog | null): boolean {
  return !!log && log.totalSets > 0 && logFinishedCount(log) >= log.totalSets
}

export function todayLogFor(slot: number): SessionLog | null {
  const log = loadLogByDate(todayStr())
  return log && log.daySlot === slot ? log : null
}

// 이번 주(월~일)에 세션 로그가 있는 slot 집합
export function weekDoneSlots(): Set<number> {
  const now = new Date()
  const mon = new Date(now)
  mon.setDate(now.getDate() - ((now.getDay() + 6) % 7)) // 이번 주 월요일
  const monStr = mon.getFullYear() + '-' + String(mon.getMonth() + 1).padStart(2, '0') + '-' + String(mon.getDate()).padStart(2, '0')
  const slots = new Set<number>()
  lsGet<string[]>(LOG_INDEX_KEY, []).forEach((d) => {
    if (d >= monStr && d <= todayStr()) {
      const l = loadLogByDate(d)
      if (l && l.sets.length) slots.add(l.daySlot)
    }
  })
  return slots
}

// ============ PROGRAM (블록 프로그램) ============
export function activeProgram(): Program | null {
  return lsGet<Program | null>(PROGRAM_KEY, null)
}

export function currentWeek(p: Program): number {
  const start = new Date(p.startDate + 'T00:00:00')
  const diff = Math.floor((+new Date(todayStr() + 'T00:00:00') - +start) / 86400000)
  if (diff < 0) return 1
  return Math.min(p.weeks, Math.floor(diff / 7) + 1)
}

// ============ 원판 단위 ============
// 바벨 무게를 바꿀 수 있는 최소 폭(kg) = 가장 작은 원판 × 2. 2.5kg 원판이 가장 작은 헬스장이면 5kg.
export const PLATE_STEP_KEY = V4 + 'plate-step'

export function plateStep(): number {
  return lsGet<number>(PLATE_STEP_KEY, 5) === 2.5 ? 2.5 : 5
}

export function setPlateStep(step: number) {
  lsSet(PLATE_STEP_KEY, step === 2.5 ? 2.5 : 5)
}

export function roundPlate(n: number): number {
  const step = plateStep()
  return Math.round(n / step) * step
}

// 디로드처럼 줄이는 계산은 아래 단위로 내린다 (반올림하면 오히려 무거워질 수 있다).
function floorPlate(n: number): number {
  const step = plateStep()
  return Math.floor(n / step + 1e-9) * step
}

/// 주차 적용된 day 계산: progression(linear_kg) + 디로드.
/// earned(섹션 인덱스 → 쌓인 kg)를 주면 그 값을, 없으면 "매주 성공했다고 치고" perWeek × (week − 1)을 쓴다.
/// 쌓인 kg은 원판 단위가 다 찼을 때만 무게에 반영된다 (1.25kg씩 쌓여도 5kg가 모여야 오른다).
export function materializeDay(p: Program, week: number, slot: number, earned?: Record<number, number>): WorkoutDay {
  const day: WorkoutDay = JSON.parse(JSON.stringify(p.days[slot - 1]))
  const step = plateStep()
  ;(p.progression || []).forEach((rule) => {
    if (rule.dayIdx !== slot - 1) return
    const sec = day.sections[rule.sectionIdx]
    if (!sec) return
    const gained = earned ? earned[rule.sectionIdx] || 0 : (rule.perWeek || 0) * (week - 1)
    const add = Math.floor(gained / step + 1e-9) * step
    sec.sets.forEach((set) => {
      const base = parseFloat(set.weight)
      if (!isNaN(base)) set.weight = String(roundPlate(base) + add)
    })
  })
  const dl = p.deload
  if (dl && week === dl.week) {
    day.sections.forEach((sec) => {
      sec.sets.forEach((set) => {
        const w = parseFloat(set.weight)
        if (!isNaN(w)) set.weight = String(floorPlate(w * (dl.weightFactor || 0.85)))
      })
      const drop = Math.min(dl.setDrop || 0, sec.sets.length - 1)
      if (drop > 0) sec.sets = sec.sets.slice(0, sec.sets.length - drop)
    })
  }
  return day
}

// day 정의 목록 (칩/요일/카운트용 — 활성 블록 없으면 routine.js 폴백)
export function dayDefs(): WorkoutDay[] {
  const p = activeProgram()
  return p ? p.days : days.map((d) => ROUTINE[d])
}
export function dayCount(): number {
  return dayDefs().length
}

// ============ 수행 기반 진행 ============
// 증량은 달력이 아니라 기록을 보고 정한다. 빠진 주는 무게가 그대로고, 버거웠던 세션은 증량에 세지 않는다.
// 오늘 기록은 보지 않는다 — 세션 도중에 목표 무게가 바뀌면 안 된다 (백오프 연동만 예외).

const isWorkLabel = (label: string) => !/^W\d/.test(label)

// 메인 섹션 meta에 상한이 없을 때: 실패 직전(RPE 9.5 이상)은 성공으로 치지 않는다.
const DEFAULT_RPE_CAP = 9

/// meta의 'RPE 8', 'RPE 8~9'에서 상한을 읽는다.
function rpeCap(meta: string): number {
  const m = meta.match(/RPE\s*(\d+(?:\.\d+)?)(?:\s*[~–-]\s*(\d+(?:\.\d+)?))?/i)
  return m ? parseFloat(m[2] || m[1]) : DEFAULT_RPE_CAP
}

// 지난 기록은 오늘 세션 중에 바뀌지 않으니 한 번 읽어 둔다. 기록을 저장·삭제하면 비운다.
let pastLogCache: { key: string; logs: SessionLog[] } | null = null

function allPastLogs(): SessionLog[] {
  const today = todayStr()
  const key = today + '|' + (localStorage.getItem(LOG_INDEX_KEY) || '')
  if (pastLogCache && pastLogCache.key === key) return pastLogCache.logs
  const logs = lsGet<string[]>(LOG_INDEX_KEY, [])
    .filter((d) => d < today)
    .map(loadLogByDate)
    .filter((l): l is SessionLog => !!l)
  pastLogCache = { key, logs }
  return logs
}

export function invalidatePastLogs() {
  pastLogCache = null
}

/// 한 세션에서 이 섹션이 목표를 채웠는지. 손대지 않았거나 코치가 조정한 날은 판단하지 않는다(null).
function judgeSection(log: SessionLog, sec: WorkoutSection): 'success' | 'fail' | null {
  if (log.adjusted) return null
  const planned = sec.sets.filter((s) => isWorkLabel(s.label)).length
  const entries = log.sets.filter((en) => en.sec === sec.title && isWorkLabel(en.label))
  if (!planned || !entries.length) return null
  const done = entries.filter((en) => en.done)
  if (done.length < planned) return 'fail'
  const cap = rpeCap(sec.meta)
  for (const en of done) {
    const tw = parseNum(en.targetW)
    const aw = parseNum(en.actualW ?? en.targetW)
    if (tw !== null && aw !== null && aw < tw) return 'fail'
    const tr = parseNum(en.targetR)
    const ar = parseNum(en.actualR ?? en.targetR)
    if (tr !== null && ar !== null && ar < tr) return 'fail'
    if (en.rpe !== null && en.rpe > cap) return 'fail'
  }
  return 'success'
}

/// 진행 규칙이 걸린 섹션마다 쌓인 kg. 성공한 세션마다 perWeek를 더하고,
/// 연속 2번 실패하면 지금 보이는 무게에서 원판 한 단위를 내린다. 디로드 주 기록은 세지 않는다.
export function earnedProgress(p: Program, slot: number): Record<number, number> {
  const out: Record<number, number> = {}
  const rules = (p.progression || []).filter((r) => r.dayIdx === slot - 1)
  if (!rules.length) return out
  const step = plateStep()
  const logs = allPastLogs().filter(
    (l) =>
      l.daySlot === slot &&
      l.programId === (p.id ?? null) &&
      (!p.startDate || l.date >= p.startDate) &&
      !(p.deload && l.week === p.deload.week),
  )
  const sections = p.days[slot - 1].sections
  for (const rule of rules) {
    const sec = sections[rule.sectionIdx]
    if (!sec) continue
    // 백오프는 그날 탑세트가 버거웠으면 (백오프 자체는 채웠어도) 성공으로 치지 않는다.
    const top = /백오프/.test(sec.title) ? pairedTop(sections, rule.sectionIdx) : null
    let gained = 0
    let misses = 0
    for (const log of logs) {
      let r = judgeSection(log, sec)
      if (r === 'success' && top && judgeSection(log, top) === 'fail') r = 'fail'
      if (r === 'success') {
        gained += rule.perWeek || 0
        misses = 0
      } else if (r === 'fail' && ++misses >= 2) {
        gained = (Math.floor(gained / step + 1e-9) - 1) * step
        misses = 0
      }
    }
    out[rule.sectionIdx] = gained
  }
  return out
}

/// 백오프 섹션 앞에 있는 같은 종목 탑세트 섹션
function pairedTop(sections: WorkoutSection[], backIdx: number): WorkoutSection | null {
  const lift = liftKey(sections[backIdx].sets.find((s) => isWorkLabel(s.label))?.name || '')
  for (let i = backIdx - 1; i >= 0; i--) {
    const s = sections[i]
    if (/탑/.test(s.title) && s.sets.some((st) => liftKey(st.name) === lift)) return s
  }
  return null
}

const REP_RANGE = /^(\d+)\s*[–~-]\s*(\d+)$/

/// 보조 종목(무게 비움·HEAVY + 횟수 범위)은 같은 요일 지난 기록의 무게를 이어 주고,
/// 모든 세트가 범위 상단을 채웠으면 무게를 올리라고 안내한다 (더블 프로그레션).
/// 머신·덤벨은 올리는 폭이 제각각이라 무게는 사용자가 정한다.
function carryAccessories(day: WorkoutDay, slot: number, factor: number, skip: (l: SessionLog) => boolean) {
  let logs: SessionLog[] | null = null
  day.sections.forEach((sec) => {
    const work = sec.sets.filter((s) => isWorkLabel(s.label))
    const isAccessory =
      work.length > 0 &&
      work.every((s) => s.unit === 'kg' && REP_RANGE.test(s.reps) && (s.weight === '' || s.weight.toUpperCase() === 'HEAVY'))
    if (!isAccessory) return
    logs = logs || allPastLogs().filter((l) => l.daySlot === slot && !skip(l))
    for (let k = logs.length - 1; k >= 0; k--) {
      const done = logs[k].sets.filter((en) => en.sec === sec.title && en.done && isWorkLabel(en.label))
      const weights = done.map((en) => parseNum(en.actualW)).filter((w): w is number => w !== null && w > 0)
      if (!weights.length) continue
      const last = weights[weights.length - 1]
      work.forEach((s) => (s.weight = fmtNum(factor === 1 ? last : Math.round(last * factor))))
      const top = parseInt(REP_RANGE.exec(work[0].reps)![2], 10)
      const allTop = done.length >= work.length && done.every((en) => (parseNum(en.actualR) ?? 0) >= top)
      if (allTop && factor === 1) sec.meta = '↑ 지난번 상단 달성 · 무게 올리기' + (sec.meta ? ' · ' + sec.meta : '')
      break
    }
  })
}

/// 오늘 탑세트를 계획과 다른 무게로 했거나 RPE 상한을 넘겼으면, 뒤따르는 같은 종목 백오프를
/// 실제 탑세트 기준 비율로 다시 잡는다. 상한을 넘겼으면 원판 한 단위 더 내린다.
function linkBackoffs(day: WorkoutDay, log: SessionLog | null) {
  if (!log) return
  day.sections.forEach((top, ti) => {
    if (!/탑/.test(top.title)) return
    const topSet = top.sets.find((s) => isWorkLabel(s.label))
    const en = topSet && log.sets.find((e) => e.sec === top.title && e.label === topSet.label && e.done)
    if (!topSet || !en) return
    const planned = parseNum(topSet.weight)
    const actual = parseNum(en.actualW ?? en.targetW)
    if (!planned || !actual) return
    const over = en.rpe !== null && en.rpe > rpeCap(top.meta)
    if (actual === planned && !over) return
    const lift = liftKey(topSet.name)
    const back = day.sections
      .slice(ti + 1)
      .find((s) => /백오프/.test(s.title) && s.sets.some((st) => liftKey(st.name) === lift))
    if (!back) return
    back.sets.forEach((st) => {
      const w = parseNum(st.weight)
      if (w === null || !isWorkLabel(st.label)) return
      if (log.sets.some((e) => e.sec === back.title && e.label === st.label && e.done)) return
      st.weight = String(floorPlate(actual * (w / planned)) - (over ? plateStep() : 0))
      st._changed = true
    })
    back.meta = (over ? '탑세트 RPE 초과 → 한 단계 낮춤' : `탑세트 ${fmtNum(actual)}kg 기준`) + (back.meta ? ' · ' + back.meta : '')
  })
}

// 주차 적용된 "계획" day (오버라이드 적용 전)
export function templateDayFor(slot: number): WorkoutDay {
  const p = activeProgram()
  let day: WorkoutDay
  if (p) {
    const week = currentWeek(p)
    const dl = p.deload
    day = materializeDay(p, week, slot, earnedProgress(p, slot))
    // 이 블록의 디로드 주 무게는 이어 받지 않는다. 디로드 주에는 이어 받은 무게도 같은 비율로 낮춘다.
    carryAccessories(day, slot, dl && week === dl.week ? dl.weightFactor || 0.85 : 1, (l) => !!dl && l.programId === p.id && l.week === dl.week)
  } else {
    day = JSON.parse(JSON.stringify(ROUTINE[days[slot - 1]]))
    carryAccessories(day, slot, 1, () => false)
  }
  linkBackoffs(day, todayLogFor(slot))
  return day
}

// 오늘의 유효 day = 당일 오버라이드(미철회) || 주차 계획
export function dayFor(slot: number): WorkoutDay {
  const ovr = todayOverrideFor(slot)
  return ovr ? ovr.effectiveDay : templateDayFor(slot)
}

export function validateProgram(p: Program | null | undefined): string | null {
  if (!p || typeof p !== 'object') return '객체가 아님'
  if (!p.name) return 'name 없음'
  if (!Number.isInteger(p.weeks) || p.weeks < 1 || p.weeks > 12) return 'weeks 범위(1~12) 오류'
  if (!Array.isArray(p.days) || !p.days.length || p.days.length > 7) return 'days는 1~7개'
  p.daysPerWeek = p.days.length
  const palette = ['#ff2d2d', '#ff9500', '#00d4ff', '#a855f7', '#00ff88', '#ffdd00', '#ff2d8d']
  for (let di = 0; di < p.days.length; di++) {
    const d = p.days[di]
    if (!d || !d.title) return 'D' + (di + 1) + ' title 없음'
    if (!Array.isArray(d.sections) || !d.sections.length) return 'D' + (di + 1) + ' sections 없음'
    if (!/^#[0-9a-fA-F]{6}$/.test(d.color || '')) d.color = palette[di % palette.length]
    d.day = d.day || d.weekday || null
    d.tag = d.tag || ''
    for (const sec of d.sections) {
      if (!sec || !sec.title || !Array.isArray(sec.sets) || !sec.sets.length) return 'D' + (di + 1) + ' 섹션 형식 오류'
      sec.rest = Number.isInteger(sec.rest) ? Math.min(Math.max(sec.rest, 0), 600) : 90
      sec.meta = sec.meta || ''
      for (const st of sec.sets) {
        if (!st || !st.name || !st.label) return 'D' + (di + 1) + ' 세트 형식 오류 (name/label)'
        st.weight = String(st.weight ?? '')
        st.reps = String(st.reps ?? '')
        st.unit = st.unit || (st.weight && !isNaN(parseFloat(st.weight)) ? 'kg' : '')
        if (st.weight && isNaN(parseFloat(st.weight)) && !['BAR', 'BW', 'HEAVY'].includes(st.weight.toUpperCase())) {
          return 'D' + (di + 1) + ' weight 형식 오류: ' + st.weight
        }
      }
    }
  }
  for (const r of p.progression || []) {
    if (!r || r.rule !== 'linear_kg') return '지원하지 않는 진행 규칙'
    const d = p.days[r.dayIdx]
    if (!d || !d.sections[r.sectionIdx]) return 'progression 참조 오류'
    if (!d.sections[r.sectionIdx].sets.some((s) => !isNaN(parseFloat(s.weight)))) return 'progression 대상에 숫자 무게 없음'
    if (typeof r.perWeek !== 'number' || Math.abs(r.perWeek) > 10) return 'perWeek 범위 오류'
  }
  if (p.deload && (!Number.isInteger(p.deload.week) || p.deload.week < 1 || p.deload.week > p.weeks)) return 'deload.week 범위 오류'
  try {
    const probe = Object.assign({}, p, { startDate: todayStr() })
    for (let w = 1; w <= p.weeks; w++) for (let s = 1; s <= p.days.length; s++) materializeDay(probe, w, s)
  } catch (e) {
    return '주차 전개 실패: ' + (e as Error).message
  }
  return null
}

export function nextMonday(): string {
  const d = new Date()
  const add = (8 - d.getDay()) % 7 || 7
  d.setDate(d.getDate() + add)
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
}

// 적용: 기존 블록은 아카이브로, 새 블록 활성화. 시작일은 사용자가 카드에서 고른다.
export function applyProgram(program: Program, start: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(start.trim())) return false
  const old = activeProgram()
  if (old) {
    const arch = lsGet<Program[]>(PROGRAM_ARCHIVE_KEY, [])
    arch.push(Object.assign({}, old, { status: 'archived', archivedAt: new Date().toISOString() }))
    lsSet(PROGRAM_ARCHIVE_KEY, arch)
  }
  lsSet(
    PROGRAM_KEY,
    Object.assign({}, program, {
      schemaVersion: 1,
      id: 'prog_' + Math.random().toString(36).slice(2, 10),
      status: 'active',
      startDate: start.trim(),
      createdAt: new Date().toISOString(),
    }),
  )
  return true
}

// ============ DAY OVERRIDE (당일 조정 — 날짜 키, 자연 만료) ============
export function overrideKey(date: string) {
  return V4 + 'override-' + date
}
export function loadOverride(date: string): Override | null {
  return lsGet<Override | null>(overrideKey(date), null)
}

export function todayOverrideFor(slot: number): Override | null {
  const o = loadOverride(todayStr())
  return o && !o.revoked && o.daySlot === slot ? o : null
}

// ops를 스냅샷 day에 1회 적용해 유효 day 생성. 잘못된 인덱스 op는 관용적으로 무시.
export function applyOps(day: WorkoutDay, ops: Op[]): { day: WorkoutDay; changes: string[] } {
  const d: WorkoutDay = JSON.parse(JSON.stringify(day))
  const changes: string[] = []
  ops
    .filter((o): o is Extract<Op, { op: 'update_set' }> => o.op === 'update_set')
    .forEach((o) => {
      const sec = d.sections[o.s]
      const set = sec && sec.sets[o.i]
      if (!set || !o.patch) return
      const before = (set.weight || set.name) + '×' + set.reps
      if (o.patch.weight !== undefined) set.weight = String(o.patch.weight)
      if (o.patch.reps !== undefined) set.reps = String(o.patch.reps)
      set._changed = true
      changes.push(set.label + ' ' + before + ' → ' + (set.weight || set.name) + '×' + set.reps)
    })
  ops
    .filter((o): o is Extract<Op, { op: 'update_section' }> => o.op === 'update_section')
    .forEach((o) => {
      const sec = d.sections[o.s]
      if (!sec || !o.patch) return
      if (Number.isInteger(o.patch.rest)) {
        sec.rest = o.patch.rest as number
        changes.push(sec.title + ' 휴식 ' + formatRestShort(sec.rest))
      }
      if (typeof o.patch.meta === 'string') sec.meta = o.patch.meta
    })
  ops
    .filter((o): o is Extract<Op, { op: 'remove_set' | 'add_set' }> => o.op === 'remove_set' || o.op === 'add_set')
    .sort((a, b) => b.s - a.s || ((b as { i?: number; after?: number }).i ?? (b as { after?: number }).after ?? 0) - ((a as { i?: number; after?: number }).i ?? (a as { after?: number }).after ?? 0))
    .forEach((o) => {
      const sec = d.sections[o.s]
      if (!sec) return
      if (o.op === 'remove_set') {
        const rm = sec.sets[o.i]
        if (!rm) return
        sec.sets.splice(o.i, 1)
        changes.push('− ' + rm.name + ' ' + rm.label + ' 빼기')
      } else if (o.set && o.set.name) {
        const ns: WorkoutSet = Object.assign({ label: '+', weight: '', unit: 'kg', reps: '' }, o.set, { _changed: true })
        const at = Math.min(Math.max((o.after ?? sec.sets.length - 1) + 1, 0), sec.sets.length)
        sec.sets.splice(at, 0, ns)
        changes.push('+ ' + ns.name + ' ' + (ns.weight ? ns.weight + '×' : '') + ns.reps + ' 추가')
      }
    })
  ops
    .filter((o): o is Extract<Op, { op: 'remove_section' | 'add_section' }> => o.op === 'remove_section' || o.op === 'add_section')
    .sort((a, b) => ((b as { s?: number; after?: number }).s ?? (b as { after?: number }).after ?? 0) - ((a as { s?: number; after?: number }).s ?? (a as { after?: number }).after ?? 0))
    .forEach((o) => {
      if (o.op === 'remove_section') {
        const rs = d.sections[o.s]
        if (!rs) return
        d.sections.splice(o.s, 1)
        changes.push('− ' + rs.title + ' 빼기')
      } else if (o.section && o.section.title && Array.isArray(o.section.sets)) {
        const nsec: WorkoutSection = Object.assign({ meta: '', rest: 90 }, o.section) as WorkoutSection
        nsec.sets = nsec.sets.map((s) => Object.assign({ label: '+', weight: '', unit: 'kg', reps: '' }, s, { _changed: true }))
        const at = Math.min(Math.max((o.after ?? d.sections.length - 1) + 1, 0), d.sections.length)
        d.sections.splice(at, 0, nsec)
        changes.push('+ ' + nsec.title + ' 추가')
      }
    })
  d.sections = d.sections.filter((sec) => sec.sets.length)
  return { day: d, changes }
}

// 진행 중 세션 로그의 s/i를 새 유효 day에 리매핑 (섹션제목+이름+라벨 매칭)
export function remapLogToDay(log: SessionLog, day: WorkoutDay) {
  const map: Record<string, { s: number; i: number }> = {}
  day.sections.forEach((sec, s) =>
    sec.sets.forEach((set, i) => {
      map[sec.title + '|' + set.name + '|' + set.label] = { s, i }
    }),
  )
  log.sets.forEach((en) => {
    const pos = map[en.sec + '|' + en.name + '|' + en.label]
    if (pos) {
      en.s = pos.s
      en.i = pos.i
    } else {
      en.s = -1
      en.i = -1 // 계획에서 빠진 세트 — 기록은 보존, 화면 매칭만 해제
    }
  })
  log.totalSets = countTotalSets(day)
}

export function validateProposal(slot: number, proposal: Proposal | null | undefined): string | null {
  if (!proposal || !Array.isArray(proposal.ops) || !proposal.ops.length) return '수정 항목이 비어 있음'
  const day = dayFor(slot)
  const log = todayLogFor(slot)
  for (const o of proposal.ops) {
    if (o.op === 'update_set' || o.op === 'remove_set') {
      const sec = day.sections[o.s]
      if (!sec || !sec.sets[o.i]) return '존재하지 않는 세트 (s' + o.s + ',i' + o.i + ')'
      const en = getEntry(log, o.s, o.i)
      if (en && en.done) return '이미 완료한 세트를 수정하려 함'
    } else if (o.op === 'add_set') {
      if (!day.sections[o.s] || !o.set || !o.set.name) return 'add_set 형식 오류'
    } else if (o.op === 'update_section') {
      if (!day.sections[o.s]) return '존재하지 않는 섹션 (s' + o.s + ')'
    } else if (o.op === 'remove_section') {
      if (!day.sections[o.s]) return '존재하지 않는 섹션 (s' + o.s + ')'
      if (hasDoneSetInSection(log, o.s)) return '이미 완료한 세트가 있는 섹션을 삭제하려 함'
    } else if (o.op === 'add_section') {
      if (!o.section || !o.section.title || !Array.isArray(o.section.sets) || !o.section.sets.length) return 'add_section 형식 오류'
    } else {
      return '알 수 없는 op: ' + (o as { op: string }).op
    }
  }
  return null
}

// 제안 수락 → 현재 유효 day 위에 ops 적용(누적), 오버라이드 저장, 진행 중 세션 리매핑
export function applyProposal(slot: number, proposal: Proposal): Override {
  const { day, changes } = applyOps(dayFor(slot), proposal.ops || [])
  const prev = loadOverride(todayStr())
  const keepPrev = !!(prev && !prev.revoked && prev.daySlot === slot)
  const ovr: Override = {
    schemaVersion: 1,
    date: todayStr(),
    daySlot: slot,
    effectiveDay: day,
    summary: proposal.summary || '',
    reason: (keepPrev && prev!.reason ? prev!.reason + ' / ' : '') + (proposal.reason || ''),
    changes: (keepPrev ? prev!.changes : []).concat(changes),
    appliedAt: new Date().toISOString(),
    revoked: false,
  }
  lsSet(overrideKey(ovr.date), ovr)
  const log = todayLogFor(slot)
  if (log) {
    remapLogToDay(log, day)
    log.adjusted = ovr.changes.join(', ').slice(0, 300)
    saveLog(log, false)
  }
  return ovr
}

export function revertOverride(slot: number) {
  const o = loadOverride(todayStr())
  if (!o || o.daySlot !== slot) return
  o.revoked = true
  lsSet(overrideKey(o.date), o)
  const log = todayLogFor(slot)
  if (log) {
    remapLogToDay(log, templateDayFor(slot))
    log.adjusted = null
    saveLog(log, false)
  }
}

// ============ HISTORY SUMMARY (LLM 컨텍스트 — 순수 로컬 계산) ============
const LIFT_MAP = [
  { key: 'SQ', re: /스쿼트|squat/i },
  { key: 'BP', re: /벤치|bench/i },
  { key: 'DL', re: /데드|deadlift/i },
  { key: 'OHP', re: /OHP|오버헤드|밀리터리/i },
]

function liftKey(name: string): string | null {
  return LIFT_MAP.find((m) => m.re.test(name))?.key ?? null
}

export function buildHistorySummary(maxSessions = 12): string {
  const index = lsGet<string[]>(LOG_INDEX_KEY, [])
  const dates = index.slice(-maxSessions)
  if (!dates.length) return '아직 운동 기록 없음.'
  const logs = dates.map(loadLogByDate).filter(Boolean) as SessionLog[]
  const lifts: Record<string, { date: string; w: number; r: number; rpe: number | null; e: number }[]> = {}
  const rates: number[] = []
  logs.forEach((l) => {
    if (l.totalSets) rates.push(Math.round((logDoneCount(l) / l.totalSets) * 100))
    l.sets.forEach((en) => {
      if (!en.done) return
      const lift = LIFT_MAP.find((m) => m.re.test(en.name))
      if (!lift) return
      const w = parseNum(en.actualW ?? en.targetW)
      const r = parseNum(en.actualR ?? en.targetR)
      if (!w || !r) return
      ;(lifts[lift.key] = lifts[lift.key] || []).push({ date: l.date, w, r, rpe: en.rpe, e: w * (1 + r / 30) })
    })
  })
  const lines = ['== 최근 ' + logs.length + '세션 요약 (' + dates[0] + '~' + dates[dates.length - 1] + ') ==']
  Object.keys(lifts).forEach((k) => {
    const arr = lifts[k]
    const best = arr.reduce((a, b) => (b.e > a.e ? b : a))
    const half = Math.floor(arr.length / 2)
    let trend = '→'
    if (half > 0) {
      const om = Math.max(...arr.slice(0, half).map((x) => x.e))
      const nm = Math.max(...arr.slice(half).map((x) => x.e))
      trend = nm > om + 1 ? '↑' : nm < om - 1 ? '↓' : '→'
    }
    const top = arr[arr.length - 1]
    lines.push(
      k +
        ': e1RM ' +
        Math.round(best.e) +
        'kg (' +
        trend +
        '). 최근탑 ' +
        top.date.slice(5) +
        ' ' +
        top.w +
        '×' +
        top.r +
        (top.rpe ? '@RPE' + top.rpe : ''),
    )
  })
  if (rates.length) lines.push('수행률: 평균 ' + Math.round(rates.reduce((a, b) => a + b, 0) / rates.length) + '%')
  const notes = logs
    .filter((l) => l.note || l.adjusted)
    .slice(-3)
    .map((l) => l.date.slice(5) + ' "' + (l.note || '') + '"' + (l.adjusted ? ' (조정: ' + l.adjusted + ')' : ''))
  if (notes.length) lines.push('메모: ' + notes.join(' / '))
  return lines.join('\n')
}

// ============ GYMBRO CHAT CONTEXT ============

/// 한도 초과 오류 — 페이월 안내에 필요한 정보를 함께 들고 온다.
export type QuotaError = Error & { quota?: boolean; loginRequired?: boolean; tier?: string; limit?: number; window?: string }

// 계정 헤더 주입은 subscription 모듈이 담당한다. 순환 의존을 피하려고 주입식으로 둔다.
let chatAuthHeaders: () => Record<string, string> = () => ({
  Authorization: 'Bearer ' + API_TOKEN,
})

export function setChatAuthHeaders(fn: () => Record<string, string>) {
  chatAuthHeaders = fn
}

export function chatConfigured(): boolean {
  return !!(SERVER_URL && API_TOKEN)
}

export function buildDailyContext(slot: number, focusPos?: { s: number; i: number } | null): string {
  const day = dayFor(slot)
  const log = todayLogFor(slot)
  const compact = {
    sections: day.sections.map((sec, s) => ({
      s,
      title: sec.title,
      rest: sec.rest,
      sets: sec.sets.map((set, i) => {
        const en = getEntry(log, s, i)
        const o: Record<string, unknown> = { i, label: set.label, name: set.name, w: set.weight || '', r: set.reps || '' }
        if (en && en.done) {
          o.done = true
          if (en.actualW !== en.targetW || en.actualR !== en.targetR) o.act = { w: en.actualW, r: en.actualR }
        }
        if (en && en.skipped) o.skip = true
        return o
      }),
    })),
  }
  let posLine = ''
  if (focusPos) {
    const sec = day.sections[focusPos.s]
    const st = sec?.sets[focusPos.i]
    if (sec && st) {
      posLine =
        '\n== 지금 진행 중 (사용자가 이 세트에서 챗을 열었다) ==\ns' +
        focusPos.s +
        ' i' +
        focusPos.i +
        ' — ' +
        sec.title +
        ' / ' +
        (st.label ? st.label + ' ' : '') +
        st.name +
        ' (목표 ' +
        (st.weight ? weightText(st) : '?') +
        ' × ' +
        (st.reps || '?') +
        ')'
    }
  }
  const p = activeProgram()
  return (
    '<CONTEXT>\n오늘: ' +
    todayStr() +
    ' / D' +
    slot +
    ' ' +
    day.title +
    (p ? ' / 블록 "' + p.name + '" WEEK ' + currentWeek(p) + '/' + p.weeks : '') +
    '\n== 오늘 루틴 (s=섹션 인덱스, i=세트 인덱스, done=완료, act=실측, skip=스킵) ==\n' +
    JSON.stringify(compact) +
    posLine +
    '\n== 최근 기록 요약 ==\n' +
    buildHistorySummary() +
    '\n</CONTEXT>'
  )
}

// 'D6 허리 세이버(대체)' — 코치가 대체 루틴을 주간 분할의 한 날로 오해하지 않게 표시한다.
const dayLine = (d: WorkoutDay, i: number) => 'D' + (i + 1) + ' ' + d.title + (d.chip ? '(대체)' : '')

export function buildBuilderContext(): string {
  const p = activeProgram()
  const defs = dayDefs()
  const current = p
    ? '블록 "' +
      p.name +
      '" (' +
      p.weeks +
      '주 · ' +
      frequencyText(p.days) +
      ', WEEK ' +
      currentWeek(p) +
      ') — ' +
      p.days.map(dayLine).join(', ')
    : '기본 루틴 (' + frequencyText(defs) + ') — ' + defs.map(dayLine).join(', ')
  return '<CONTEXT>\n오늘: ' + todayStr() + '\n== 현재 루틴 ==\n' + current + '\n== 최근 기록 요약 ==\n' + buildHistorySummary() + '\n</CONTEXT>'
}

export type ServerMode = 'daily_adjust' | 'program_intake' | 'program_generate'

// 서버(validateBody)가 받는 대화 상한. 넘으면 400으로 거부해 그 대화를 더 이어갈 수 없게 된다.
const WIRE_MAX_MESSAGES = 40
const WIRE_MAX_CHARS: Record<ServerMode, number> = { daily_adjust: 12000, program_intake: 12000, program_generate: 40000 }

/// 오래 이어진 대화도 계속 보낼 수 있게, 상한을 넘으면 오래된 주고받기부터 한 쌍씩 덜어 낸다.
/// keepFirst면 첫 메시지(블록 상담은 여기에 루틴·기록 컨텍스트를 실어 둔다)를 남긴다.
/// 대화는 user/assistant가 번갈아 쌓이므로 두 개씩 덜어야 순서가 어긋나지 않는다. 지금 보내는 마지막 메시지는 늘 남는다.
export function trimWire(messages: WireMessage[], mode: ServerMode, keepFirst: boolean): WireMessage[] {
  const cap = WIRE_MAX_CHARS[mode]
  const chars = (ms: WireMessage[]) => ms.reduce((acc, m) => acc + m.content.length, 0)
  const head = keepFirst && messages.length > 1 ? messages.slice(0, 1) : []
  let tail = messages.slice(head.length)
  const over = () => head.length + tail.length > WIRE_MAX_MESSAGES || chars(head) + chars(tail) > cap
  while (tail.length > 2 && over()) tail = tail.slice(2)
  return head.concat(tail)
}

export async function callServer(mode: ServerMode, messages: WireMessage[]): Promise<ServerEnvelope> {
  const base = SERVER_URL
  const ctrl = new AbortController()
  // 서버는 DeepSeek를 재시도까지 합쳐 최대 60초(블록 생성은 170초) 기다린다. 앱이 먼저 끊으면 서버는 끝까지 답을 받아
  // 한도를 쓰는데 사용자는 '오래 걸린다'는 오류만 본다. 서버 대기보다 조금 길게 둔다.
  const tmo = setTimeout(() => ctrl.abort(), mode === 'program_generate' ? 180000 : 65000)
  let resp: Response
  try {
    resp = await fetch(base + '/v1/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...chatAuthHeaders(),
      },
      body: JSON.stringify({ mode, messages }),
      signal: ctrl.signal,
    })
  } catch (e) {
    throw new Error(
      (e as Error).name === 'AbortError'
        ? '응답이 너무 오래 걸려요. 잠시 후 다시 시도해 주세요.'
        : '네트워크에 연결할 수 없어요. 연결 상태를 확인해 주세요.',
      { cause: e },
    )
  } finally {
    clearTimeout(tmo)
  }
  if (!resp.ok) {
    // 한도 초과는 페이월로 안내해야 하므로 다른 오류와 구분해서 던진다.
    if (resp.status === 429) {
      const detail = (await resp.json().catch(() => ({}))) as {
        error?: string
        tier?: string
        limit?: number
        window?: string
      }
      const err = new Error(
        detail.error === 'quota_exceeded'
          ? `${detail.window === 'month' ? '이번 달' : '오늘'} 사용 한도를 모두 썼어요.`
          : '요청이 너무 잦아요. 잠시 후 다시 시도해 주세요.',
      ) as QuotaError
      err.quota = detail.error === 'quota_exceeded'
      err.tier = detail.tier
      err.limit = detail.limit
      err.window = detail.window
      throw err
    }
    if (resp.status === 401) {
      const detail = (await resp.json().catch(() => ({}))) as { error?: string }
      if (detail.error === 'login_required') {
        const err = new Error('코치는 로그인 후 쓸 수 있어요.') as QuotaError
        err.loginRequired = true
        throw err
      }
      throw new Error('서버 인증에 실패했어요. 앱을 최신 버전으로 업데이트해 주세요.')
    }
    const msg = resp.status === 403 ? '서버가 이 요청을 거부했어요.' : `서버에 문제가 생겼어요. (${resp.status})`
    throw new Error(msg)
  }
  const data = await resp.json()
  let env: { message?: unknown; proposal?: Proposal; program?: Program }
  try {
    env = JSON.parse(data.content)
  } catch {
    throw new Error('답변을 읽지 못했어요. 다시 시도해 주세요.')
  }
  if (typeof env.message !== 'string') throw new Error('답변을 읽지 못했어요. 다시 시도해 주세요.')
  return { message: env.message, proposal: env.proposal || null, program: env.program || null, raw: data.content }
}

// ============ ROUTER ============
export type Route =
  | { redirect: string }
  | { view: 'today'; slot: number }
  | { view: 'log' }
  | { view: 'logDetail'; date: string }
  | { view: 'settings' }

export function parseRoute(): Route {
  const h = location.hash.replace(/^#\/?/, '')
  const parts = h.split('/').filter(Boolean)

  const legacy = parts[0] && parts[0].match(/^day(\d+)$/)
  if (legacy) return { redirect: '#/today/' + legacy[1] }

  if (parts[0] === 'log') {
    if (parts[1] && /^\d{4}-\d{2}-\d{2}$/.test(parts[1])) return { view: 'logDetail', date: parts[1] }
    return { view: 'log' }
  }
  if (parts[0] === 'settings') return { view: 'settings' }

  let slot = parts[0] === 'today' ? parseInt(parts[1], 10) : NaN
  if (!slot || slot < 1 || slot > dayCount()) slot = defaultSlot()
  return { view: 'today', slot }
}

// 기본 day: ⓪오늘 진행 중 세션 → ①오늘 요일에 스케줄된 day → ②이번 주 첫 미수행 → ③slot 1
export function defaultSlot(): number {
  const log = loadLogByDate(todayStr())
  if (log && log.daySlot >= 1 && log.daySlot <= dayCount()) return log.daySlot
  const wd = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][new Date().getDay()]
  const idx = dayDefs().findIndex((d) => (d.day || '').toUpperCase() === wd)
  if (idx >= 0) return idx + 1
  const done = weekDoneSlots()
  const defs = dayDefs()
  // 이름표가 있는 대체 루틴은 직접 선택할 때만 사용한다.
  for (let s = 1; s <= defs.length; s++) if (!done.has(s) && !defs[s - 1].chip) return s
  return 1
}

export function navigate(hash: string) {
  location.hash = hash
}

// ============ EXPORT DATA ============
type ShareNative = {
  shareFile?: (file: { filename: string; content: string; mimeType: string }) => Promise<{ completed?: boolean }>
}

/// 'saved' 는 공유 시트에서 저장·전송을 마쳤거나 브라우저 다운로드를 시작했다는 뜻,
/// 'cancelled' 는 공유 시트를 그냥 닫았다는 뜻이다. 네이티브 오류는 그대로 던진다.
export async function exportData(): Promise<'saved' | 'cancelled'> {
  const data: Record<string, unknown> = {}
  for (let k = 0; k < localStorage.length; k++) {
    const key = localStorage.key(k)
    // migrateV3 가 예전 토큰을 지우지만, 지우기 전에 내보내는 경우까지 한 번 더 막는다.
    if (key && key.startsWith(V4) && !DEVICE_ONLY_KEYS.has(key)) {
      try {
        data[key] = JSON.parse(localStorage.getItem(key) as string)
      } catch {
        data[key] = localStorage.getItem(key)
      }
    }
  }
  const content = JSON.stringify(data, null, 2)
  const filename = 'gym-export-' + todayStr() + '.json'
  const mimeType = 'application/json'

  // iOS 웹뷰는 <a download> 를 처리하지 않아 눌러도 아무 일이 없다. 앱에서는 네이티브 공유 시트로
  // 파일을 넘겨 '파일에 저장'·AirDrop 등으로 꺼낼 수 있게 한다.
  const native = (window as Window & { GymNative?: ShareNative }).GymNative
  if (native?.shareFile) {
    const result = await native.shareFile({ filename, content, mimeType })
    return result?.completed ? 'saved' : 'cancelled'
  }

  const blob = new Blob([content], { type: mimeType })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = filename
  a.click()
  // 클릭 직후 바로 해제하면 브라우저가 다운로드를 시작하기 전에 URL 이 사라질 수 있다.
  const href = a.href
  setTimeout(() => URL.revokeObjectURL(href), 10_000)
  return 'saved'
}
