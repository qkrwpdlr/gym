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
  wd?: string // 요일 대신 칩에 보일 짧은 이름 (회복 루틴의 '상체A' 등)
  tag?: string
  color?: string
  sections: WorkoutSection[]
}

export type Routine = Record<string, WorkoutDay>

// ============ RECOVERY (부상 회복 루틴 — 주간이 아니라 단계로 넘어간다) ============

export type RecoveryPhase = {
  title: string
  guide: string // '대략 1~2주차' 같은 시기 안내
  goal: string
  advance: string[] // 다음 단계로 넘어가는 기준
  days: WorkoutDay[] // 단계 안에서는 순서대로 돌아간다
}

export type RecoveryPlan = {
  id: string
  name: string
  injury: string
  startedOn: string
  rules: string[]
  redFlags: string[]
  phases: RecoveryPhase[]
}

export type RecoveryState = {
  planId: string
  phase: number // 0부터
  startedOn: string
  phaseStartedOn: string
  ended?: string | null // 회복을 끝낸 날. 있으면 원래 루틴을 쓴다.
}

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
