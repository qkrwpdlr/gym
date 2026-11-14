import { useCallback, useEffect, useRef, useState } from 'react'
import { timerRemaining } from './exerciseTimer'
import type { ExerciseTimerState, TimedPrescription } from './exerciseTimer'

type Target = { key: string; prescription: TimedPrescription } | null

export function useExerciseTimer(target: Target, onFinish: () => void) {
  const [saved, setSaved] = useState<ExerciseTimerState | null>(null)
  const notifiedRun = useRef<number | null>(null)
  const key = target?.key
  const timer: ExerciseTimerState | null = target
    ? saved?.key === key ? saved : { key: target.key, total: target.prescription.min, remaining: target.prescription.min, endTime: null, runId: null, finished: false }
    : null
  const active = saved?.key === key ? saved : null
  const endTime = active?.endTime

  useEffect(() => {
    if (!key || !endTime) return
    const tick = () => setSaved((prev) => {
      if (!prev || prev.key !== key || prev.endTime !== endTime) return prev
      const remaining = timerRemaining(prev)
      if (remaining === prev.remaining && remaining > 0) return prev
      return { ...prev, remaining, endTime: remaining > 0 ? endTime : null, finished: remaining === 0 }
    })
    const id = window.setInterval(tick, 200)
    // 백그라운드에서 멈춘 동안도 종료 시각을 기준으로 따라잡는다.
    document.addEventListener('visibilitychange', tick)
    return () => { window.clearInterval(id); document.removeEventListener('visibilitychange', tick) }
  }, [key, endTime])

  useEffect(() => {
    if (active?.finished && active.runId && notifiedRun.current !== active.runId) {
      notifiedRun.current = active.runId
      onFinish()
    }
  }, [active?.finished, active?.runId, onFinish])

  const toggle = () => {
    if (!timer) return
    if (timer.endTime !== null) {
      const remaining = timerRemaining(timer)
      setSaved({ ...timer, remaining, endTime: null, finished: remaining === 0 })
    } else {
      const remaining = timer.finished ? timer.total : timer.remaining
      setSaved({ ...timer, remaining, endTime: Date.now() + remaining * 1000, runId: timer.finished || !timer.runId ? Date.now() : timer.runId, finished: false })
    }
  }
  const reset = (total = timer?.total) => {
    if (!timer || !total || !target || total < target.prescription.min || total > target.prescription.max) return
    setSaved({ key: timer.key, total, remaining: total, endTime: null, runId: null, finished: false })
  }
  const clear = useCallback(() => setSaved(null), [])
  const restore = useCallback((state: ExerciseTimerState) => {
    if (!state || typeof state.key !== 'string' || !Number.isFinite(state.total) || state.total <= 0 || !Number.isFinite(state.remaining) || state.remaining < 0 || (state.endTime !== null && !Number.isFinite(state.endTime))) return
    const remaining = timerRemaining(state)
    setSaved({ ...state, remaining, endTime: remaining > 0 ? state.endTime : null, finished: remaining === 0 })
  }, [])
  return { timer, toggle, reset, clear, restore }
}
