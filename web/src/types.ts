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

// ============ DAY OVERRIDE (당일 조정) ============

export type SetPatch = {
  weight?: string | number
  reps?: string | number
}

export type SectionPatch = {
  rest?: number
  meta?: string
}

export type Op =
  | { op: 'update_set'; s: number; i: number; patch: SetPatch }
  | { op: 'remove_set'; s: number; i: number }
  | { op: 'add_set'; s: number; after?: number; set: Partial<WorkoutSet> & { name: string } }
  | { op: 'update_section'; s: number; patch: SectionPatch }
  | { op: 'remove_section'; s: number }
  | { op: 'add_section'; after?: number; section: Partial<WorkoutSection> & { title: string; sets: WorkoutSet[] } }

export type Proposal = {
  summary?: string
  reason?: string
  ops: Op[]
}

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

// ============ CHAT (gymbro) ============

export type WireMessage = {
  role: 'user' | 'assistant'
  content: string
}

export type ServerEnvelope = {
  message: string
  proposal: Proposal | null
  program: Program | null
  raw: string
}

export type ChatKind = 'daily' | 'builder'

export type ChatMessage =
  | { id: number; kind: 'user' | 'bot' | 'sys'; text: string }
  | { id: number; kind: 'proposal'; proposal: Proposal; changes: string[]; state: 'pending' | 'applied' | 'rejected' }
  | { id: number; kind: 'program'; program: Program; state: 'pending' | 'applied' | 'editing' }

export type ChatState = {
  kind: ChatKind
  slot: number
  date: string
  wire: WireMessage[]
  messages: ChatMessage[]
  pendingNote: string
  busy: boolean
  generate: boolean
  typing: boolean
  focusPos?: { s: number; i: number } | null // 포커스 모드에서 열었을 때 진행 중인 세트
}
