import { DemoButton } from './DemoButton'
import type { ReactNode } from 'react'
import { formatRestShort, formatTime, isNumericWeight, repsText } from '../storage'
import type { FlatSet } from '../types'
import { parseTimedReps } from '../exerciseTimer'
import type { ExerciseTimerState } from '../exerciseTimer'

type FocusModeState = {
  flatSets: FlatSet[]
  currentIdx: number
  phase: 'exercise' | 'rest' | 'complete'
  restRemaining?: number
}

export type FocusSummary = {
  done: number
  total: number
  minutes: number | null
  volumeKg: number
}

type FocusModeProps = {
  focus: FocusModeState | null
  exerciseTimer: ExerciseTimerState | null
  onToggleExerciseTimer: () => void
  onResetExerciseTimer: (seconds?: number) => void
  /** 이 세트(휴식) 다음에 실제로 넘어갈 세트. 이미 한 세트는 건너뛴 기준이고, 없으면 마지막 세트다. */
  next?: FlatSet
  /** 지금 몇 번째 세트인지 (끝낸 세트 수 기준) */
  position: number
  alert: boolean
  collapsed: boolean
  summary: FocusSummary
  onCollapse: () => void
  onExit: () => void
  onNext: () => void
  onSkipRest: () => void
  onExtendRest: (sec: number) => void
  onAlt: (current: FlatSet) => void
  onMemo: () => void
  onDone: () => void
}

export function FocusMode({
  focus,
  exerciseTimer,
  onToggleExerciseTimer,
  onResetExerciseTimer,
  next,
  position,
  alert,
  collapsed,
  summary,
  onCollapse,
  onExit,
  onNext,
  onSkipRest,
  onExtendRest,
  onAlt,
  onMemo,
  onDone,
}: FocusModeProps) {
  const current = focus?.flatSets[focus.currentIdx]
  const sectionName = focus?.phase === 'complete' ? '오늘 운동' : current ? current.section.title : ''
  const currentCount = focus ? position : 0
  const totalCount = focus?.flatSets.length ?? 0

  return (
    <div
      className={`focus-mode ${focus && !collapsed ? 'active' : ''} ${focus?.phase === 'rest' ? 'rest' : ''} ${alert ? 'alert' : ''}`}
    >
      <div className="focus-header">
        {/* 접기 — 세션은 유지한 채 화면만 내린다. 종료는 오른쪽 '마치기'가 맡는다. */}
        <button className="focus-icon-btn" type="button" onClick={onCollapse} aria-label="접기">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
        <div className="focus-header-center">
          <div className="focus-section">{sectionName}{current && focus?.phase !== 'complete' ? <DemoButton name={current.set.name} /> : null}</div>
          <div className="focus-progress-text">
            <span className="current">{currentCount}</span> / {totalCount}세트
          </div>
        </div>
        <div className="focus-header-right">
          <button className="focus-end-btn" type="button" onClick={onExit}>
            마치기
          </button>
        </div>
      </div>
      <div id="focusBody">
        {focus?.phase === 'complete' ? <FocusComplete summary={summary} onMemo={onMemo} onDone={onDone} /> : null}
        {focus?.phase === 'exercise' && current ? (
          <FocusExercise
            current={current}
            exerciseTimer={exerciseTimer}
            onToggleTimer={onToggleExerciseTimer}
            onResetTimer={onResetExerciseTimer}
            next={next}
            onNext={onNext}
            onAlt={() => onAlt(current)}
          />
        ) : null}
        {focus?.phase === 'rest' && current ? (
          <FocusRest
            current={current}
            next={next}
            remaining={focus.restRemaining ?? current.section.rest}
            onSkipRest={onSkipRest}
            onExtendRest={onExtendRest}
          />
        ) : null}
      </div>
    </div>
  )
}

function FocusExercise({
  current,
  exerciseTimer,
  onToggleTimer,
  onResetTimer,
  next,
  onNext,
  onAlt,
}: {
  current: FlatSet
  exerciseTimer: ExerciseTimerState | null
  onToggleTimer: () => void
  onResetTimer: (seconds?: number) => void
  next?: FlatSet
  onNext: () => void
  onAlt: () => void
}) {
  const { set, section } = current
  const hasWeight = !!set.weight
  // 완료 버튼 아래에 다음에 일어날 일을 미리 적어 둔다.
  // 남은 세트가 없으면 휴식 없이 바로 끝난다.
  const after = !next ? '마지막 세트' : section.rest > 0 ? `다음: 휴식 ${formatRestShort(section.rest)}` : `다음: ${next.set.name}`

  return (
    <div className="focus-content">
      <div className="focus-label">{set.label}</div>
      <div className="focus-exercise demo-title-row"><span>{set.name}</span><DemoButton name={set.name} /></div>
      {section.meta ? <div className="focus-cue">{section.meta}</div> : null}
      {exerciseTimer ? (
        <ExerciseCountdown timer={exerciseTimer} reps={set.reps} weight={hasWeight ? `${set.weight}${set.unit}` : ''} onToggle={onToggleTimer} onReset={onResetTimer} />
      ) : hasWeight ? (
        <>
          <div className="focus-weight">{set.weight}</div>
          <div className="focus-unit">{isNumericWeight(set.weight) && set.unit ? set.unit : ' '}</div>
          <div className="focus-reps-box">
            <span className="focus-reps-x">×</span>
            <span className="focus-reps-num">{set.reps}</span>
            {/^[\d\s–~-]+$/.test(set.reps) ? <span className="focus-reps-label">회</span> : null}
          </div>
        </>
      ) : (
        <>
          <div className="focus-weight">{set.reps}</div>
          <div className="focus-unit">{repsText(set.reps) === set.reps ? ' ' : '회'}</div>
        </>
      )}
      <FocusBottom>
        <button className="focus-alt-btn" type="button" onClick={onAlt}>
          무게·횟수가 달랐다면 수정하기
        </button>
        <button className="focus-btn" type="button" onClick={onNext}>
          <span className="focus-btn-main">완료</span>
          <span className="focus-btn-sub">{after}</span>
        </button>
      </FocusBottom>
    </div>
  )
}

function ExerciseCountdown({ timer, reps, weight, onToggle, onReset }: {
  timer: ExerciseTimerState
  reps: string
  weight: string
  onToggle: () => void
  onReset: (seconds?: number) => void
}) {
  const running = timer.endTime !== null
  const paused = timer.runId !== null && !running && !timer.finished
  const status = timer.finished ? '시간 완료 · 완료를 누르면 다음으로 넘어가요' : running ? '진행 중' : paused ? '일시정지' : '준비 · 시작 버튼을 눌러 주세요'
  const label = running ? '일시정지' : timer.finished ? '다시 시작' : paused ? '이어서 시작' : '타이머 시작'
  const prescription = parseTimedReps(reps)
  const durations = prescription && prescription.min !== prescription.max
    ? [...new Set([prescription.min, Math.round((prescription.min + prescription.max) / 2), prescription.max])]
    : []
  return (
    <div className="focus-time-panel">
      <div className="focus-time-target">목표 {reps}{weight ? ` · ${weight}` : ''}</div>
      <div className={`focus-exercise-timer ${timer.finished ? 'finished' : ''}`} role="timer" aria-label="남은 운동 시간">{formatTime(timer.remaining)}</div>
      <div className="focus-time-status" role="status">{status}</div>
      {durations.length ? (
        <label className="focus-time-choice">목표 시간
          <select aria-label="목표 운동 시간" value={timer.total} disabled={running} onChange={(e) => onReset(Number(e.target.value))}>
            {durations.map((seconds) => <option key={seconds} value={seconds}>{formatTime(seconds)}</option>)}
          </select>
        </label>
      ) : null}
      <div className="focus-time-controls">
        <button type="button" className="focus-time-start" onClick={onToggle}>{label}</button>
        <button type="button" onClick={() => onReset()} aria-label="운동 타이머 처음부터">처음부터</button>
      </div>
    </div>
  )
}

function FocusRest({
  current,
  next,
  remaining,
  onSkipRest,
  onExtendRest,
}: {
  current: FlatSet
  next?: FlatSet
  remaining: number
  onSkipRest: () => void
  onExtendRest: (sec: number) => void
}) {
  return (
    <div className="focus-content">
      <div className="focus-label">휴식</div>
      <div className={`focus-rest-timer ${remaining <= 10 ? 'warning' : ''}`}>{formatTime(remaining)}</div>
      <NextPreview current={current} next={next} />
      <FocusBottom>
        <div className="focus-btn-row">
          <button className="focus-btn secondary compact" type="button" onClick={() => onExtendRest(30)}>
            +30초
          </button>
          <button className="focus-btn secondary" type="button" onClick={onSkipRest}>
            휴식 건너뛰기
          </button>
        </div>
      </FocusBottom>
    </div>
  )
}

function NextPreview({ current, next }: { current: FlatSet; next?: FlatSet }) {
  if (!next) {
    return (
      <div className="focus-next-preview">
        <div className="focus-next-label">마지막 세트였어요</div>
        <div className="focus-next-exercise">남은 세트가 없으면 여기서 마무리돼요</div>
      </div>
    )
  }
  const ns = next.set
  const isDifferentSection = next.sIdx !== current.sIdx
  return (
    <div className="focus-next-preview">
      <div className="focus-next-label">{isDifferentSection ? '다음 운동' : '다음 세트'}</div>
      <div className="focus-next-exercise">
        {ns.name} <span className="focus-next-set">{ns.label}</span>
      </div>
      <div className="focus-next-weight">
        {ns.weight ? (
          <>
            {ns.weight}
            <span className="unit">{isNumericWeight(ns.weight) ? ns.unit || '' : ''}</span>
            <span className="x">×</span>
            <span className="reps">{ns.reps}</span>
          </>
        ) : (
          <span className="reps">{repsText(ns.reps)}</span>
        )}
      </div>
    </div>
  )
}

function FocusComplete({ summary, onMemo, onDone }: { summary: FocusSummary; onMemo: () => void; onDone: () => void }) {
  const volume = summary.volumeKg >= 1000 ? `${(summary.volumeKg / 1000).toFixed(1)}t` : `${Math.round(summary.volumeKg)}kg`
  return (
    <>
      <div className="focus-complete">
        <div className="complete-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <polyline points="5 12.5 10 17.5 19 7" />
          </svg>
        </div>
        <div className="complete-title">오늘 운동 끝</div>
        <div className="complete-sub">수고했어요. 기록은 자동으로 저장됐어요.</div>
        <div className="complete-stats">
          <div>
            <b>
              {summary.done}/{summary.total}
            </b>
            <span>세트</span>
          </div>
          {summary.minutes ? (
            <div>
              <b>{summary.minutes}</b>
              <span>분</span>
            </div>
          ) : null}
          {summary.volumeKg > 0 ? (
            <div>
              <b>{volume}</b>
              <span>총 볼륨</span>
            </div>
          ) : null}
        </div>
      </div>
      <FocusBottom>
        <button className="focus-alt-btn" type="button" onClick={onMemo}>
          오늘 메모 남기기
        </button>
        <button className="focus-btn" type="button" onClick={onDone}>
          <span className="focus-btn-main">마치기</span>
        </button>
      </FocusBottom>
    </>
  )
}

function FocusBottom({ children }: { children: ReactNode }) {
  return <div className="focus-bottom">{children}</div>
}
