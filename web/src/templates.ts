// ============ 루틴 템플릿 (첫 실행 온보딩 · 설정의 루틴 바꾸기) ============
// 템플릿은 블록 프로그램(Program)으로 만든다. 코치가 짠 블록과 같은 경로
// (validateProgram → applyProgram → 주차 전개·선형 증량·디로드)를 그대로 타게 하려는 것.
// 무게는 절대값 대신 "추정 1RM 대비 비율"로 적어 두고, 사용자가 입력한 무게로 계산한다.
// 입력이 없으면 무게를 비워 횟수만 보여 준다 — 실제 무게는 세트 기록 시트에서 적는다.

import { LOG_INDEX_KEY, ROUTINE, V4, activeProgram, lsGet, roundPlate, validateProgram } from './storage'
import type { Deload, Program, ProgressionRule, WorkoutDay, WorkoutSection, WorkoutSet } from './types'

export const ONBOARDED_KEY = V4 + 'onboarded'

// ============ 주요 종목 ============
export type LiftKey = 'squat' | 'bench' | 'deadlift' | 'ohp' | 'row'

export const LIFTS: { key: LiftKey; label: string }[] = [
  { key: 'squat', label: '스쿼트' },
  { key: 'bench', label: '벤치프레스' },
  { key: 'deadlift', label: '데드리프트' },
  { key: 'ohp', label: '오버헤드 프레스' },
  { key: 'row', label: '바벨 로우' },
]

/// 종목별 추정 1RM(kg). 모르는 종목은 비워 둔다.
export type LiftMaxes = Partial<Record<LiftKey, number>>

/// 사용자가 입력하는 기준. 초보는 1RM을 재 본 적이 없는 경우가 많아 "5회 가능한 무게"를 기본으로 둔다.
export type WeightBasis = 'rm5' | 'rm1'

/// 입력값을 추정 1RM으로 바꾼다. 5회 무게는 Epley 공식(w × (1 + 5/30))으로 환산한다.
export function toE1rm(weight: number, basis: WeightBasis): number {
  return basis === 'rm5' ? weight * (1 + 5 / 30) : weight
}

// 빈 바는 20kg. 계산값이 그보다 작아도 바벨 종목은 20kg 아래로 내려가지 않는다.
const BAR_KG = 20

// ============ 템플릿 명세 ============
type Load = { lift: LiftKey; pct: number } | 'BAR' | 'BW' | 'HEAVY' | ''

type SetSpec = { label: string; name: string; load: Load; reps: string; unit: string }

type SectionSpec = {
  title: string
  meta: string
  rest: number
  sets: SetSpec[]
  /** 주마다 올릴 무게(kg). 숫자 무게가 있을 때만 progression 규칙이 된다. */
  perWeek?: number
  /** 워밍업은 계산된 무게가 앞 세트보다 무겁지 않으면 뺀다 (가벼운 사용자에게 빈 바만 반복되지 않게) */
  warmup?: boolean
}

type DaySpec = Omit<WorkoutDay, 'sections'> & { sections: SectionSpec[] }

export type RoutineTemplate = {
  id: string
  name: string
  level: string
  /** 카드에 보여줄 한 줄 요약 */
  summary: string
  /** 카드에 보여줄 주요 종목 구성 */
  mainLine: string
  weeks: number
  deload: Deload
  days: DaySpec[]
}

function warmup(lift: LiftKey, name: string, steps: [number | 'BAR', string][], meta = '가볍게 · 폼 확인', rest = 60): SectionSpec {
  return {
    title: '워밍업 · ' + name,
    meta,
    rest,
    warmup: true,
    sets: steps.map(([step, reps], i) => ({
      label: 'W' + (i + 1),
      name: name + ' 워밍업',
      load: step === 'BAR' ? 'BAR' : { lift, pct: step },
      reps,
      unit: 'kg',
    })),
  }
}

function work(
  title: string,
  lift: LiftKey,
  pct: number,
  count: number,
  reps: string,
  rest: number,
  meta: string,
  perWeek: number,
  prefix = 'S',
): SectionSpec {
  return {
    title,
    meta,
    rest,
    perWeek,
    sets: Array.from({ length: count }, (_, i) => ({ label: prefix + (i + 1), name: title, load: { lift, pct }, reps, unit: 'kg' })),
  }
}

/// 보조 종목. 머신·덤벨 무게는 사람마다 너무 달라 비워 두되, 단위를 kg으로 둬 기록 시트에서 무게를 적을 수 있게 한다.
function acc(title: string, count: number, reps: string, rest: number, meta: string, prefix: string, bodyweight = false): SectionSpec {
  return {
    title,
    meta,
    rest,
    sets: Array.from({ length: count }, (_, i) => ({
      label: prefix + (i + 1),
      name: title,
      load: bodyweight ? 'BW' : '',
      reps,
      unit: bodyweight ? '' : 'kg',
    })),
  }
}

// 모든 템플릿 공통: 8주 블록, 4주 쌓고 5주차에 한 주 가볍게(무게 90%, 종목당 1세트 덜).
// 선형 증량은 주 단위라 매 세션 올리는 초보 프로그램보다 느리다 — 무리하지 않게 일부러 보수적으로 둔다.
const WEEKS = 8
const DELOAD: Deload = { week: 5, weightFactor: 0.9, setDrop: 1 }

// ============ 1. 초보 전신 주 3회 ============
// 월: 무거운 5회(스쿼트·벤치) / 수: 데드·프레스 / 금: 가벼운 8회 볼륨. 핵심 종목은 RPE 7 정도에서 시작한다.
const BEGINNER: RoutineTemplate = {
  id: 'beginner-fullbody-3',
  name: '초보 전신 주 3회',
  level: '입문',
  summary: '한 번에 몸 전체를 써요. 무거운 날과 가벼운 날을 나눠 부담이 적어요.',
  mainLine: '스쿼트·벤치·데드·프레스 3×5 · 로우 3×8',
  weeks: WEEKS,
  deload: DELOAD,
  days: [
    {
      title: 'FULL BODY A',
      day: 'MON',
      tag: '전신 · 스쿼트 · 벤치',
      color: '#ff2d2d',
      sections: [
        warmup('squat', '스쿼트', [['BAR', '10'], [0.5, '5'], [0.6, '3']]),
        work('스쿼트', 'squat', 0.7, 3, '5', 180, 'RPE 7 · 2~3회 여유 남기기', 2.5),
        warmup('bench', '벤치', [['BAR', '10'], [0.55, '5']]),
        work('벤치프레스', 'bench', 0.7, 3, '5', 150, 'RPE 7 · 바가 가슴에 닿게', 1.25),
        work('바벨 로우', 'row', 0.65, 3, '8', 120, '허리 중립 · 반동 없이', 1.25, 'R'),
        acc('플랭크', 3, '30초', 60, '코어 · 허리가 처지지 않게', 'C', true),
      ],
    },
    {
      title: 'FULL BODY B',
      day: 'WED',
      tag: '전신 · 데드 · 프레스',
      color: '#3da5ff',
      sections: [
        warmup('deadlift', '데드리프트', [[0.4, '5'], [0.55, '3']], '가볍게 · 등 중립 확인', 90),
        work('데드리프트', 'deadlift', 0.7, 3, '5', 180, 'RPE 7 · 매 회 바닥에서 다시 세팅', 2.5),
        warmup('ohp', '프레스', [['BAR', '10']]),
        work('오버헤드 프레스', 'ohp', 0.7, 3, '5', 150, 'RPE 7 · 엉덩이·복부 조이고', 1.25),
        acc('랫풀다운', 3, '8–10', 90, '등 · 가슴 쪽으로 당기기', 'L'),
        acc('워킹 런지', 2, '10', 90, '한쪽씩 · 덤벨 선택', 'WL'),
      ],
    },
    {
      title: 'FULL BODY C',
      day: 'FRI',
      tag: '전신 · 볼륨',
      color: '#00ff88',
      sections: [
        warmup('squat', '스쿼트', [['BAR', '10'], [0.45, '5']]),
        work('스쿼트', 'squat', 0.6, 3, '8', 150, 'RPE 7 · 템포 일정하게', 2.5),
        warmup('bench', '벤치', [['BAR', '10']]),
        work('벤치프레스', 'bench', 0.6, 3, '8', 120, 'RPE 7', 1.25),
        acc('체스트 서포티드 로우', 3, '10–12', 90, '머신 또는 덤벨', 'R'),
        acc('행잉 레그레이즈', 2, '8–12', 60, '어려우면 무릎 올리기로', 'C', true),
      ],
    },
  ],
}

// ============ 2. 상하체 분할 주 4회 ============
// 상체·하체를 주 2번씩. 날마다 강도 종목 1개(4×5)와 볼륨 종목을 섞는다.
const UPPER_LOWER: RoutineTemplate = {
  id: 'upper-lower-4',
  name: '상하체 분할 주 4회',
  level: '초중급',
  summary: '상체와 하체를 주 2번씩 나눠 해요. 운동 6개월 이상이면 추천해요.',
  mainLine: '스쿼트·벤치·데드·프레스 4×5 · 보조 3×8~12',
  weeks: WEEKS,
  deload: DELOAD,
  days: [
    {
      title: 'UPPER A',
      day: 'MON',
      tag: '상체 · 벤치 강도',
      color: '#ff2d2d',
      sections: [
        warmup('bench', '벤치', [['BAR', '10'], [0.5, '5'], [0.65, '3']]),
        work('벤치프레스', 'bench', 0.75, 4, '5', 180, 'RPE 7~8 · 폼 무너지면 멈추기', 1.25),
        work('바벨 로우', 'row', 0.65, 4, '8', 120, '허리 중립 · 반동 없이', 1.25, 'R'),
        work('오버헤드 프레스', 'ohp', 0.6, 3, '8', 120, 'RPE 7', 1.25, 'P'),
        acc('랫풀다운', 3, '10–12', 90, '등 · 가슴 쪽으로 당기기', 'L'),
        acc('EZ 컬', 2, '10–12', 60, '이두', 'BI'),
        acc('푸시다운', 2, '10–12', 60, '삼두', 'TR'),
      ],
    },
    {
      title: 'LOWER A',
      day: 'TUE',
      tag: '하체 · 스쿼트 강도',
      color: '#ffdd00',
      sections: [
        warmup('squat', '스쿼트', [['BAR', '10'], [0.5, '5'], [0.65, '3']]),
        work('스쿼트', 'squat', 0.75, 4, '5', 180, 'RPE 7~8 · 절대 실패 X', 2.5),
        work('스티프 레그 데드', 'deadlift', 0.5, 3, '8', 120, '후면사슬 · 허리 중립', 2.5, 'SL'),
        acc('레그 프레스', 3, '10–12', 90, '머신', 'LP'),
        acc('카프 레이즈', 3, '12–15', 60, '종아리', 'CF'),
        acc('행잉 레그레이즈', 3, '10–12', 60, '코어', 'C', true),
      ],
    },
    {
      title: 'UPPER B',
      day: 'THU',
      tag: '상체 · 프레스 강도',
      color: '#3da5ff',
      sections: [
        warmup('ohp', '프레스', [['BAR', '10'], [0.6, '3']]),
        work('오버헤드 프레스', 'ohp', 0.75, 4, '5', 180, 'RPE 7~8 · 엉덩이·복부 조이고', 1.25),
        work('인클라인 벤치', 'bench', 0.6, 3, '8–10', 120, '상부 가슴', 1.25, 'I'),
        acc('풀업', 3, '6–10', 120, '안 되면 랫풀다운으로', 'PU', true),
        acc('체스트 서포티드 로우', 3, '10–12', 90, '머신 또는 덤벨', 'R'),
        acc('케이블 레터럴 레이즈', 3, '12–15', 60, '어깨', 'LT'),
      ],
    },
    {
      title: 'LOWER B',
      day: 'FRI',
      tag: '하체 · 데드 강도',
      color: '#c77dff',
      sections: [
        warmup('deadlift', '데드리프트', [[0.4, '5'], [0.55, '3'], [0.65, '1']], '가볍게 · 등 중립 확인', 90),
        work('데드리프트', 'deadlift', 0.75, 3, '5', 180, 'RPE 7~8 · 허리 컨디션 우선', 2.5),
        work('스쿼트', 'squat', 0.62, 3, '8', 150, '볼륨 · 바속도 유지', 2.5, 'V'),
        acc('워킹 런지', 3, '10', 90, '한쪽씩 · 덤벨 선택', 'WL'),
        acc('햄스트링 컬', 3, '10–12', 60, '햄 마무리', 'H'),
      ],
    },
  ],
}

// ============ 3. 파워빌딩 (routine.json 파생) ============
// 기존 기본 루틴(작성자 개인 프로그램)을 템플릿으로 남긴다. 절대 kg 대신 작성자 기준 1RM 대비 비율로 바꿔
// 입력한 무게에 맞게 다시 계산한다. 기준값은 탑세트 RPE를 감안해 잡은 추정치다.
const AUTHOR_E1RM: Record<LiftKey, number> = { squat: 210, bench: 130, deadlift: 235, ohp: 90, row: 145 }
// 작성자의 현재 작업 무게보다 5% 가볍게 시작해 주간 증량으로 8주차쯤 원래 강도에 닿게 한다.
const POWER_START = 0.95
// 주간 증량을 거는 강도 섹션 (섹션 제목 기준)
const POWER_PROGRESS = new Set([
  '스쿼트 탑셋',
  '스쿼트 백오프',
  '벤치프레스',
  'OHP',
  '데드 탑싱글',
  '데드 백오프',
  '컴페티션 벤치 탑싱글',
  '벤치 백오프',
  '포즈 로우바 스쿼트',
])

function liftOf(name: string): LiftKey | null {
  // '체스트 서포티드 로우'도 '로우'를 포함하지만 무게가 HEAVY라 여기까지 오지 않는다.
  if (/데드/.test(name)) return 'deadlift'
  if (/스쿼트/.test(name)) return 'squat'
  if (/OHP|오버헤드/.test(name)) return 'ohp'
  if (/벤치/.test(name)) return 'bench'
  if (/로우/.test(name)) return 'row'
  return null
}

function fromRoutineSet(set: WorkoutSet): SetSpec {
  const w = parseFloat(set.weight)
  const lift = liftOf(set.name)
  let load: Load = ''
  if (!isNaN(w) && lift) load = { lift, pct: (w / AUTHOR_E1RM[lift]) * POWER_START }
  else if (['BAR', 'BW', 'HEAVY'].includes(set.weight.toUpperCase())) load = set.weight.toUpperCase() as Load
  // 'LIGHT'처럼 프로그램 검증이 모르는 값은 비워 둔다 (횟수만 표시).
  return { label: set.label, name: set.name, load, reps: set.reps, unit: set.unit || (lift || load === 'BAR' ? 'kg' : '') }
}

function fromRoutineSection(sec: WorkoutSection): SectionSpec {
  return {
    title: sec.title,
    meta: sec.meta,
    rest: sec.rest,
    perWeek: POWER_PROGRESS.has(sec.title) ? 1.25 : undefined,
    sets: sec.sets.map(fromRoutineSet),
  }
}

const POWERBUILDING: RoutineTemplate = {
  id: 'powerbuilding-5',
  name: '파워빌딩 주 5회',
  level: '고급',
  summary: '탑세트와 백오프로 3대 운동을 올리고 보조 운동으로 근육을 키워요. 허리가 불편한 날 쓸 대체 루틴이 있어요.',
  mainLine: '탑세트 1~3회 + 백오프 · 보조 4~5세트',
  weeks: WEEKS,
  deload: DELOAD,
  days: Object.keys(ROUTINE).map((k) => {
    const d = ROUTINE[k]
    return { ...d, sections: d.sections.map(fromRoutineSection) }
  }),
}

export const TEMPLATES: RoutineTemplate[] = [BEGINNER, UPPER_LOWER, POWERBUILDING]

/// "나중에 할게요"·코치로 넘어갈 때 쓰는 기본 템플릿.
export const DEFAULT_TEMPLATE = BEGINNER

export function templateById(id: string): RoutineTemplate | undefined {
  return TEMPLATES.find((t) => t.id === id)
}

/// 템플릿이 무게 계산에 쓰는 주요 종목 (입력 화면에 이것만 묻는다)
export function templateLifts(t: RoutineTemplate): LiftKey[] {
  const used = new Set<LiftKey>()
  t.days.forEach((d) =>
    d.sections.forEach((sec) =>
      sec.sets.forEach((s) => {
        if (typeof s.load === 'object') used.add(s.load.lift)
      }),
    ),
  )
  return LIFTS.map((l) => l.key).filter((k) => used.has(k))
}

function resolveWeight(load: Load, maxes: LiftMaxes): string {
  if (typeof load !== 'object') return load
  const max = maxes[load.lift]
  if (!max || max <= 0) return ''
  return String(Math.max(BAR_KG, roundPlate(max * load.pct)))
}

function buildSection(spec: SectionSpec, maxes: LiftMaxes): WorkoutSection {
  let sets: WorkoutSet[] = spec.sets.map((s) => ({
    label: s.label,
    name: s.name,
    weight: resolveWeight(s.load, maxes),
    unit: s.unit,
    reps: s.reps,
  }))
  if (spec.warmup) {
    // 앞 세트보다 무겁지 않은 워밍업은 뺀다. 무게를 모를 때('')는 그대로 둔다.
    let prev = 0
    sets = sets.filter((s) => {
      const w = s.weight === 'BAR' ? BAR_KG : parseFloat(s.weight)
      if (isNaN(w)) return true
      if (w <= prev) return false
      prev = w
      return true
    })
    sets.forEach((s, i) => (s.label = 'W' + (i + 1)))
  }
  return { title: spec.title, meta: spec.meta, rest: spec.rest, sets }
}

/// 템플릿 + 입력 무게 → 검증을 통과한 Program. 실패하면 오류를 던진다 (템플릿 자체의 버그).
export function buildProgram(t: RoutineTemplate, maxes: LiftMaxes = {}): Program {
  const progression: ProgressionRule[] = []
  const days: WorkoutDay[] = t.days.map((d, dayIdx) => {
    const sections = d.sections.map((spec, sectionIdx) => {
      const sec = buildSection(spec, maxes)
      // 숫자 무게가 하나도 없으면(무게를 건너뛴 경우) 증량할 대상이 없으니 규칙을 걸지 않는다.
      if (spec.perWeek && sec.sets.some((s) => !isNaN(parseFloat(s.weight)))) {
        progression.push({ rule: 'linear_kg', dayIdx, sectionIdx, perWeek: spec.perWeek })
      }
      return sec
    })
    return { ...d, sections }
  })
  const program: Program = {
    name: t.name,
    weeks: t.weeks,
    days,
    progression,
    deload: { ...t.deload },
    intent: t.summary,
  }
  const err = validateProgram(program)
  if (err) throw new Error(`템플릿 ${t.id} 검증 실패: ${err}`)
  return program
}

// ============ 첫 실행 판단 ============
/// 온보딩을 띄울지. 기록이나 진행 중인 블록이 있는 기존 사용자는 절대 보지 않게 하고,
/// 그런 사용자는 완료로 기록해 나중에 기록을 지워도 다시 뜨지 않게 한다.
export function needsOnboarding(): boolean {
  try {
    if (localStorage.getItem(ONBOARDED_KEY)) return false
  } catch {
    return false
  }
  if (activeProgram() || lsGet<string[]>(LOG_INDEX_KEY, []).length > 0) {
    markOnboarded()
    return false
  }
  return true
}

export function markOnboarded() {
  try {
    localStorage.setItem(ONBOARDED_KEY, '1')
  } catch {
    /* ignore */
  }
}
