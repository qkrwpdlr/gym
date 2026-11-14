// ============ 운동 기록 가져오기 ============
// 내보내기(exportData)로 만든 JSON 을 다시 넣는다. 파일을 읽고 무엇을 쓸지 정하는 planImport 는
// localStorage 를 건드리지 않는 순수 함수라 따로 시험할 수 있고, 실제 쓰기는 applyImport 가 맡는다.

import {
  DEFAULT_ACCENT,
  DEVICE_ONLY_KEYS,
  LOG_INDEX_KEY,
  PROGRAM_ARCHIVE_KEY,
  PROGRAM_KEY,
  V4,
  activeProgram,
  invalidatePastLogs,
  loadLogByDate,
  loadOverride,
  logDoneCount,
  logKey,
  lsGet,
  lsSet,
  overrideKey,
  validateProgram,
} from './storage'
import type { Override, Program, SessionLog, SetEntry } from './types'

/// 파일 자체를 쓸 수 없을 때 던진다. message 는 그대로 화면에 보여준다.
export class ImportError extends Error {}

/// 가져오기 전의 이 기기 상태. 시험할 때는 가짜 상태를 넘긴다.
export type ImportCurrent = {
  loadLog: (date: string) => SessionLog | null
  loadOverride: (date: string) => Override | null
  program: Program | null
  archive: Program[]
}

export type ImportPlan = {
  /** 파일에서 형식이 맞은 날짜 수 */
  fileDays: number
  /** 새로 쓸 기록 (없던 날 + 파일 쪽이 이긴 날) */
  logs: SessionLog[]
  /** 이 기기에 없던 날짜 수 */
  added: number
  /** 양쪽에 있었는데 파일 쪽을 남긴 날짜 수 */
  replaced: number
  /** 양쪽에 있었는데 이 기기 쪽을 남긴 날짜 수 */
  keptLocal: number
  overrides: Override[]
  /** 파일에 형식이 맞는 프로그램이 있었는지 */
  fileHasProgram: boolean
  /** 활성 프로그램으로 쓸 것. 이 기기에 이미 프로그램이 있으면 null */
  program: Program | null
  /** 보관함에 더할 프로그램 */
  archive: Program[]
  /** 형식이 맞지 않아 건너뛴 항목 수 */
  skipped: number
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const LOG_KEY_RE = /^gym-v4-log-(\d{4}-\d{2}-\d{2})$/
const OVERRIDE_KEY_RE = /^gym-v4-override-(\d{4}-\d{2}-\d{2})$/

function isObj(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

// 2026-02-30 같은 날짜는 달력·요일 계산을 어긋나게 하므로 실제로 있는 날짜만 받는다.
function isRealDate(s: unknown): s is string {
  if (typeof s !== 'string' || !DATE_RE.test(s)) return false
  const d = new Date(s + 'T00:00:00')
  return !isNaN(+d) && ymd(d) === s
}

function ymd(d: Date): string {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
}

const strOr = (v: unknown, fb: string): string => (typeof v === 'string' ? v : fb)
const strOrNull = (v: unknown): string | null => (typeof v === 'string' ? v : null)
const numOrNull = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : null)

// 세트 하나. 화면이 s/i 로 정렬하고 이름·라벨을 그대로 그리므로 이 값들은 꼭 있어야 한다.
function parseSetEntry(v: unknown): SetEntry | null {
  if (!isObj(v)) return null
  if (!Number.isInteger(v.s) || !Number.isInteger(v.i)) return null
  if (typeof v.name !== 'string' || typeof v.label !== 'string') return null
  if (typeof v.done !== 'boolean') return null
  const actual = (x: unknown) => (x === null || x === undefined ? null : String(x))
  return {
    s: v.s as number,
    i: v.i as number,
    sec: strOr(v.sec, ''),
    name: v.name,
    label: v.label,
    unit: strOr(v.unit, ''),
    targetW: String(v.targetW ?? ''),
    targetR: String(v.targetR ?? ''),
    actualW: actual(v.actualW),
    actualR: actual(v.actualR),
    done: v.done,
    skipped: v.skipped === true,
    rpe: numOrNull(v.rpe),
  }
}

// 하루 기록. 세트가 하나라도 깨져 있으면 그날 전체를 건너뛴다 — 반쪽짜리 기록이 완료율을 왜곡하지 않게.
function parseLog(date: string, v: unknown): SessionLog | null {
  if (!isObj(v) || v.date !== date) return null
  if (!Number.isInteger(v.daySlot) || (v.daySlot as number) < 1) return null
  if (typeof v.dayTitle !== 'string') return null
  if (typeof v.totalSets !== 'number' || !Number.isFinite(v.totalSets) || v.totalSets < 0) return null
  if (!Array.isArray(v.sets)) return null
  const sets: SetEntry[] = []
  for (const raw of v.sets) {
    const en = parseSetEntry(raw)
    if (!en) return null
    sets.push(en)
  }
  return {
    schemaVersion: typeof v.schemaVersion === 'number' ? v.schemaVersion : 1,
    date,
    programId: strOrNull(v.programId),
    week: numOrNull(v.week),
    daySlot: v.daySlot as number,
    dayTitle: v.dayTitle,
    color: /^#[0-9a-fA-F]{6}$/.test(strOr(v.color, '')) ? (v.color as string) : DEFAULT_ACCENT,
    totalSets: v.totalSets,
    startedAt: strOr(v.startedAt, ''),
    endedAt: strOrNull(v.endedAt),
    note: strOrNull(v.note),
    adjusted: strOrNull(v.adjusted),
    sets,
  }
}

function parseOverride(date: string, v: unknown): Override | null {
  if (!isObj(v) || v.date !== date || !Number.isInteger(v.daySlot)) return null
  const day = v.effectiveDay
  if (!isObj(day) || typeof day.title !== 'string' || !Array.isArray(day.sections)) return null
  if (!day.sections.every((sec) => isObj(sec) && typeof sec.title === 'string' && Array.isArray(sec.sets) && sec.sets.every(isObj))) return null
  if (!Array.isArray(v.changes) || !v.changes.every((c) => typeof c === 'string')) return null
  return {
    schemaVersion: typeof v.schemaVersion === 'number' ? v.schemaVersion : 1,
    date,
    daySlot: v.daySlot as number,
    effectiveDay: day as unknown as Override['effectiveDay'],
    summary: strOr(v.summary, ''),
    reason: strOr(v.reason, ''),
    changes: v.changes as string[],
    appliedAt: strOr(v.appliedAt, ''),
    revoked: v.revoked === true,
  }
}

// 프로그램은 만들 때와 같은 검사(validateProgram)를 거친다. 검사가 값을 보정하므로 사본에 돌린다.
function parseProgram(v: unknown, needStart: boolean): Program | null {
  if (!isObj(v)) return null
  let p: Program
  try {
    p = JSON.parse(JSON.stringify(v)) as Program
  } catch {
    return null
  }
  // 주차 계산이 시작일에 기대므로 활성 프로그램은 시작일이 꼭 있어야 한다.
  if (needStart && !isRealDate(p.startDate)) return null
  if (p.startDate !== undefined && typeof p.startDate !== 'string') return null
  return validateProgram(p) === null ? p : null
}

/// 파일 내용을 읽어 무엇을 쓸지 정한다. localStorage 는 읽지도 쓰지도 않는다.
/// 파일 자체가 운동 기록이 아니면 ImportError 를 던진다.
export function planImport(raw: unknown, current: ImportCurrent): ImportPlan {
  if (!isObj(raw)) throw new ImportError('운동 기록 파일이 아니에요.')
  const keys = Object.keys(raw)
  if (!keys.length || !keys.every((k) => k.startsWith(V4))) throw new ImportError('운동 기록 파일이 아니에요.')

  let skipped = 0
  const fileLogs: SessionLog[] = []
  const fileOverrides = new Map<string, Override>()
  let fileProgram: Program | null = null
  let fileArchive: Program[] = []

  for (const key of keys) {
    const value = raw[key]
    // 타이머·로그인 건너뜀 표시·예전 서버 토큰은 파일에 있어도 절대 쓰지 않는다.
    if (DEVICE_ONLY_KEYS.has(key)) continue
    // 목록은 실제 기록 키로 다시 만들기 때문에 파일의 목록은 믿지 않는다.
    if (key === LOG_INDEX_KEY) continue

    const logMatch = key.match(LOG_KEY_RE)
    if (logMatch) {
      const log = isRealDate(logMatch[1]) ? parseLog(logMatch[1], value) : null
      if (log) fileLogs.push(log)
      else skipped++
      continue
    }
    const ovrMatch = key.match(OVERRIDE_KEY_RE)
    if (ovrMatch) {
      const ovr = isRealDate(ovrMatch[1]) ? parseOverride(ovrMatch[1], value) : null
      if (ovr) fileOverrides.set(ovr.date, ovr)
      else skipped++
      continue
    }
    if (key === PROGRAM_KEY) {
      // 내보낼 때 프로그램이 없었으면 null 로 들어 있을 수 있다 — 형식 오류가 아니다.
      if (value === null) continue
      fileProgram = parseProgram(value, true)
      if (!fileProgram) skipped++
      continue
    }
    if (key === PROGRAM_ARCHIVE_KEY) {
      if (!Array.isArray(value)) {
        skipped++
        continue
      }
      for (const item of value) {
        const p = parseProgram(item, false)
        if (p) fileArchive.push(p)
        else skipped++
      }
      continue
    }
    // 나중 버전에서 생길 수 있는 키 — 모르는 값은 쓰지 않고 조용히 넘어간다.
  }

  // 같은 날짜가 양쪽에 있으면 완료한 세트가 더 많은 쪽을 남긴다.
  // 기기를 옮기는 날 두 기기에 나눠 기록했다면 더 많이 진행한 쪽이 실제 운동에 가깝고,
  // 날짜별 기록은 한 세션이라 세트 단위로 섞으면 s/i 위치가 서로 다른 루틴을 가리킬 수 있다.
  // 같으면 이 기기 쪽을 남긴다 — 지금 쓰던 메모나 진행 중인 세션을 덮어쓰지 않게.
  const logs: SessionLog[] = []
  const taken = new Set<string>()
  let added = 0
  let replaced = 0
  let keptLocal = 0
  for (const log of fileLogs) {
    const local = current.loadLog(log.date)
    if (!local) {
      added++
    } else if (logDoneCount(log) > logDoneCount(local)) {
      replaced++
    } else {
      keptLocal++
      continue
    }
    logs.push(log)
    taken.add(log.date)
  }

  // 당일 조정은 그날 기록의 세트 위치(s/i)와 짝이다. 파일 쪽 기록을 남긴 날이거나
  // 이 기기에 조정이 없는 날만 가져와서 기록과 조정이 서로 다른 기기 것으로 섞이지 않게 한다.
  const overrides = [...fileOverrides.values()].filter((o) => taken.has(o.date) || !current.loadOverride(o.date))

  // 활성 프로그램은 이미 있으면 그대로 둔다. 바꾸면 오늘 루틴과 주차, 진행 중인 기록의 세트 위치가
  // 한꺼번에 바뀌기 때문이다. 대신 파일의 프로그램은 보관함에 넣어 잃어버리지 않게 한다.
  let program: Program | null = null
  if (fileProgram) {
    if (!current.program) program = fileProgram
    else if (fileProgram.id !== current.program.id) {
      fileArchive = fileArchive.concat(Object.assign({}, fileProgram, { status: 'archived' }))
    }
  }
  // 보관함은 id 로 중복을 가린다. id 가 없는 예전 프로그램은 이름과 시작일로 대신 본다.
  const sig = (p: Program) => p.id || 'name:' + p.name + '|' + (p.startDate || '')
  const known = new Set(current.archive.concat(current.program ?? [], program ?? []).map(sig))
  const archive: Program[] = []
  for (const p of fileArchive) {
    if (known.has(sig(p))) continue
    known.add(sig(p))
    archive.push(p)
  }

  return {
    fileDays: fileLogs.length,
    logs,
    added,
    replaced,
    keptLocal,
    overrides,
    fileHasProgram: !!fileProgram,
    program,
    archive,
    skipped,
  }
}

/// 지금 기기 상태를 읽어 planImport 에 넘긴다.
export function currentImportState(): ImportCurrent {
  return {
    loadLog: loadLogByDate,
    loadOverride,
    program: activeProgram(),
    archive: lsGet<Program[]>(PROGRAM_ARCHIVE_KEY, []),
  }
}

/// 계획대로 localStorage 에 쓴다. 날짜 목록은 기존 목록과 새 날짜의 합집합을 정렬해 다시 만든다.
export function applyImport(plan: ImportPlan) {
  plan.logs.forEach((log) => lsSet(logKey(log.date), log))
  invalidatePastLogs()
  plan.overrides.forEach((o) => lsSet(overrideKey(o.date), o))
  const index = new Set(lsGet<string[]>(LOG_INDEX_KEY, []))
  plan.logs.forEach((log) => index.add(log.date))
  lsSet(LOG_INDEX_KEY, [...index].sort())
  if (plan.program) lsSet(PROGRAM_KEY, plan.program)
  if (plan.archive.length) lsSet(PROGRAM_ARCHIVE_KEY, lsGet<Program[]>(PROGRAM_ARCHIVE_KEY, []).concat(plan.archive))
}
