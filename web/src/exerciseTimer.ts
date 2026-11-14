export type TimedPrescription = { min: number; max: number }

export type ExerciseTimerState = {
  key: string
  total: number
  remaining: number
  endTime: number | null
  runId: number | null
  finished: boolean
}

/** reps에 적힌 운동 시간만 읽는다. 횟수·템포 설명을 시간으로 오인하지 않는다. */
export function parseTimedReps(reps: string): TimedPrescription | null {
  const range = reps.trim().match(/^(\d+)\s*(?:[–~-]\s*(\d+)\s*)?(초|분)$/)
  if (range) {
    const scale = range[3] === '분' ? 60 : 1
    const min = Number(range[1]) * scale
    const max = Number(range[2] ?? range[1]) * scale
    return Number.isSafeInteger(max) && min > 0 && max >= min ? { min, max } : null
  }
  const mixed = reps.trim().match(/^(\d+)\s*분\s*(\d+)\s*초$/)
  if (!mixed) return null
  const seconds = Number(mixed[1]) * 60 + Number(mixed[2])
  return Number.isSafeInteger(seconds) && seconds > 0 ? { min: seconds, max: seconds } : null
}

export function timerRemaining(timer: Pick<ExerciseTimerState, 'remaining' | 'endTime'>, now = Date.now()): number {
  return timer.endTime === null ? timer.remaining : Math.max(0, Math.ceil((timer.endTime - now) / 1000))
}
