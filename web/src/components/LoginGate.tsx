import { useState } from 'react'

type LoginGateProps = {
  open: boolean
  onSignIn: () => Promise<string | null>
  onSkip: () => void
}

/// 첫 실행 로그인 화면.
///
/// 로그인하면 구독과 사용량이 계정에 묶여 기기를 바꿔도 따라온다.
/// 다만 기록 기능 자체는 로컬에서 도므로 둘러보기 경로를 함께 둔다 —
/// 아무것도 못 본 채 로그인부터 만나면 대부분 그냥 나간다.
export function LoginGate({ open, onSignIn, onSkip }: LoginGateProps) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!open) return null

  const run = async () => {
    setBusy(true)
    setError(null)
    try {
      await onSignIn()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="login-gate active">
      <div className="login-body">
        <div className="login-tag">GYM</div>
        <h1 className="login-title">
          오늘 할 세트,
          <span>하나씩 체크하세요</span>
        </h1>
        <ul className="login-points">
          <li>루틴 체크리스트와 자동 휴식 타이머</li>
          <li>날짜별 운동 기록과 볼륨</li>
          <li>컨디션에 맞춰 루틴을 조정하는 AI 코치</li>
        </ul>

        <button className="login-apple" type="button" disabled={busy} onClick={run}>
           Apple로 로그인
        </button>

        {error ? <div className="login-error">{error}</div> : null}

        <button className="login-skip" type="button" disabled={busy} onClick={onSkip}>
          로그인 없이 둘러보기
        </button>

        <div className="login-fine">운동 기록과 타이머는 로그인 없이도 전부 쓸 수 있어요. 코치는 로그인 후 쓸 수 있어요.</div>
      </div>
    </div>
  )
}
