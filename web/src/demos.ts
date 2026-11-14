import { createContext } from 'react'

export type ExerciseDemo = { id: string; variant?: string; name: string }

export const DemoContext = createContext<(demo: ExerciseDemo) => void>(() => {})

const DEMOS: Record<string, { id: string; variant?: string }> = {
  "벤치": {
    "id": "bench-press"
  },
  "벤치프레스": {
    "id": "bench-press"
  },
  "컴페티션 벤치": {
    "id": "bench-press"
  },
  "클로즈그립 벤치": {
    "id": "close-grip-bench"
  },
  "인클라인 벤치": {
    "id": "incline-bench"
  },
  "스쿼트": {
    "id": "low-bar-squat"
  },
  "로우바 스쿼트": {
    "id": "low-bar-squat"
  },
  "포즈 로우바 스쿼트": {
    "id": "paused-squat"
  },
  "포즈 스쿼트": {
    "id": "paused-squat"
  },
  "데드": {
    "id": "deadlift"
  },
  "데드리프트": {
    "id": "deadlift"
  },
  "스티프 레그 데드": {
    "id": "stiff-leg-deadlift"
  },
  "바벨 RDL": {
    "id": "barbell-rdl"
  },
  "덤벨 RDL": {
    "id": "dumbbell-rdl"
  },
  "한 발 RDL": {
    "id": "single-leg-rdl"
  },
  "힙힌지 연습": {
    "id": "hip-hinge-drill"
  },
  "OHP": {
    "id": "ohp"
  },
  "오버헤드 익스텐션": {
    "id": "overhead-triceps-extension"
  },
  "오버헤드 케이블 익스텐션": {
    "id": "overhead-triceps-extension"
  },
  "펜들레이 로우": {
    "id": "pendlay-row"
  },
  "바벨 로우": {
    "id": "barbell-row"
  },
  "체스트 서포티드 로우": {
    "id": "chest-supported-row"
  },
  "리어델트 머신": {
    "id": "rear-delt-machine"
  },
  "케이블 레터럴 레이즈": {
    "id": "cable-lateral-raise"
  },
  "EZ 컬": {
    "id": "ez-curl"
  },
  "인클라인 덤벨 컬": {
    "id": "incline-dumbbell-curl"
  },
  "레그 프레스": {
    "id": "leg-press"
  },
  "레그 익스텐션": {
    "id": "leg-extension"
  },
  "햄스트링 컬": {
    "id": "hamstring-curl"
  },
  "카프 레이즈": {
    "id": "calf-raise"
  },
  "불가리안 스플릿 스쿼트": {
    "id": "bulgarian-split-squat"
  },
  "워킹 런지": {
    "id": "walking-lunge"
  },
  "행잉 레그레이즈": {
    "id": "hanging-leg-raise"
  },
  "아스클링 익스텐더": {
    "id": "askling-extender"
  },
  "아스클링 글라이더": {
    "id": "askling-glider"
  },
  "힐 디그 · 무릎 90°": {
    "id": "heel-dig"
  },
  "힐 디그 · 무릎 30°": {
    "id": "heel-dig",
    "variant": "30"
  },
  "브릿지": {
    "id": "glute-bridge"
  },
  "브릿지 홀드": {
    "id": "glute-bridge",
    "variant": "hold"
  },
  "슬라이더 레그컬": {
    "id": "slider-leg-curl"
  },
  "슬라이더 레그컬 · 한 발 내리기": {
    "id": "slider-leg-curl",
    "variant": "single"
  },
  "노르딕컬": {
    "id": "nordic-curl"
  },
  "아스클링 다이버": {
    "id": "askling-diver"
  },
  "T-바 로우": {
    "id": "t-bar-row"
  },
  "풀업": {
    "id": "pull-up"
  }
}

export function exerciseDemo(name: string): ExerciseDemo | null {
  const clean = name.replace(/ 워밍업$/, '').trim()
  const demo = DEMOS[clean]
  return demo ? { ...demo, name: clean } : null
}

export function demoUrl(demo: ExerciseDemo): string {
  const params = new URLSearchParams({ embed: '1' })
  if (demo.variant) params.set('variant', demo.variant)
  return `${import.meta.env.BASE_URL}lab/${demo.id}.html?${params}`
}
