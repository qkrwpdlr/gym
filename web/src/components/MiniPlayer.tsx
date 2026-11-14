import { formatTime, loadText } from '../storage'
import type { FlatSet } from '../types'

type MiniPlayerFocus = {
  flatSets: FlatSet[]
  currentIdx: number
  phase: 'exercise' | 'rest' | 'complete'
  restRemaining?: number
}

type MiniPlayerProps = {
  focus: MiniPlayerFocus | null
  /** 휴식이 끝나면 넘어갈 세트. 이미 한 세트는 건너뛴 기준이다. */
  next?: FlatSet
  /** 지금 몇 번째 세트인지 (끝낸 세트 수 기준) */
  position: number
  /** 끝낸(완료·건너뜀) 세트 수 */
  finished: number
  show: boolean
  alert: boolean
  onExpand: () => void
  onSetDone: () => void
  onSkipRest: () => void
  onFinish: () => void
}

/// 포커스 모드를 접었을 때 탭바 위에 남는 작은 바.
/// 세션은 그대로 살아 있고, 탭하면 다시 포커스 모드가 열린다.
export function MiniPlayer({ focus, next, position, finished, show, alert, onExpand, onSetDone, onSkipRest, onFinish }: MiniPlayerProps) {
  const total = focus?.flatSets.length ?? 0
  const current = focus?.flatSets[focus.currentIdx]
  const phase = focus?.phase ?? 'exercise'
  const index = position

  // 끝낸 세트 수 기준 진행도 — 포커스 모드의 진행 표시와 같은 기준이다.
  const doneCount = phase === 'complete' ? total : finished
  const pct = total ? Math.min((doneCount / total) * 100, 100) : 0

  let title = '운동 중'
  let sub = `${index}/${total}세트`

  if (phase === 'complete') {
    title = '모든 세트 완료'
    sub = `${total}세트 · 수고했어요`
  } else if (phase === 'rest') {
    title = `휴식 ${formatTime(focus?.restRemaining ?? 0)}`
    sub = next ? `다음 · ${next.set.name} ${loadText(next.set)}` : '마지막 세트까지 끝났어요'
  } else if (current) {
    title = current.set.name
    sub = `${index}/${total}세트 · ${loadText(current.set)}`
  }

  // 단계에 따라 한 가지 주요 동작만 노출한다. 종료는 포커스 모드가 맡는다.
  const action =
    phase === 'complete'
      ? { label: '마치기', onClick: onFinish, cls: 'finish' }
      : phase === 'rest'
        ? { label: '건너뛰기', onClick: onSkipRest, cls: 'skip' }
        : { label: '세트 완료', onClick: onSetDone, cls: 'done' }

  const className = ['mini-player', show ? 'show' : '', phase, alert ? 'alert' : ''].filter(Boolean).join(' ')

  return (
    <div className={className}>
      <div className="mini-progress">
        <span style={{ width: `${pct}%` }} />
      </div>
      <button className="mini-main" type="button" onClick={onExpand} aria-label="운동 화면 열기">
        <svg className="mini-chevron" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M7 14l5-5 5 5z" />
        </svg>
        <span className="mini-text">
          <span className="mini-title">{title}</span>
          <span className="mini-sub">{sub}</span>
        </span>
      </button>
      <button className={`mini-action ${action.cls}`} type="button" onClick={action.onClick}>
        {action.label}
      </button>
    </div>
  )
}
