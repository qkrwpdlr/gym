// ============ ROUTINE / PROGRAM DATA MODEL (gym v4) ============

export type WorkoutSet = {
  label: string
  name: string
  weight: string // '', '60', 'BAR', 'BW', 'HEAVY', ...
  unit: string // 'kg' | ''
  reps: string // '5', '10–12', 'AMRAP', ...
  _changed?: boolean // 당일 조정으로 바뀐 세트 (노랑 표시)
}

export type WorkoutSection = {
  title: string
  meta: string
  rest: number
  sets: WorkoutSet[]
}

export type WorkoutDay = {
  title: string
  day?: string | null // 'MON' ...
  weekday?: string | null
  chip?: string // 수동 선택용 대체 루틴의 이름표
  tag?: string
  color?: string
  sections: WorkoutSection[]
}

export type Routine = Record<string, WorkoutDay>

// ============ SESSION LOG (날짜 키 운동일지) ============

export type SetEntry = {
  s: number
  i: number
  sec: string
  name: string
  label: string
  unit: string
  targetW: string
  targetR: string
  actualW: string | null
  actualR: string | null
  done: boolean
  skipped: boolean
  rpe: number | null
}

export type SessionLog = {
  schemaVersion: number
  date: string
  programId: string | null
  week: number | null
  daySlot: number
  dayTitle: string
  color: string
  totalSets: number
  startedAt: string
  endedAt: string | null
  note: string | null
  adjusted: string | null
  sets: SetEntry[]
}

// ============ BLOCK PROGRAM ============

export type ProgressionRule = {
  rule: 'linear_kg'
  dayIdx: number
  sectionIdx: number
  perWeek: number
}

export type Deload = {
  week: number
  weightFactor?: number
  setDrop?: number
}

export type Program = {
  schemaVersion?: number
  id?: string
  name: string
  weeks: number
  days: WorkoutDay[]
  daysPerWeek?: number
  progression?: ProgressionRule[]
  deload?: Deload | null
  status?: string
  startDate?: string
  createdAt?: string
  archivedAt?: string
  intent?: string
}

// ============ DAY OVERRIDE (예전 코치 당일 조정 — 남아 있는 데이터 표시·되돌리기용) ============

export type Override = {
  schemaVersion: number
  date: string
  daySlot: number
  effectiveDay: WorkoutDay
  summary: string
  reason: string
  changes: string[]
  appliedAt: string
  revoked: boolean
}

// ============ FOCUS MODE ============

export type FlatSet = {
  sIdx: number
  setIdx: number
  section: WorkoutSection
  set: WorkoutSet
}
