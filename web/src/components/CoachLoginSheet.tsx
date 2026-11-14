import { useState } from 'react'

type CoachLoginSheetProps = {
  open: boolean
  onSignIn: () => Promise<string | null>
  onClose: () => void
  /** 로그인에 성공하면 원래 하려던 동작(코치 열기 등)을 이어서 한다 */
  onDone: () => void
}

/// 코치를 열려는데 로그인이 안 돼 있을 때 뜨는 안내.
/// 코치는 계정마다 사용 한도와 구독이 붙는 서버 기능이라 로그인이 필요하다.
/// 기록·타이머는 로그인 없이 계속 쓸 수 있다는 점을 같이 알린다.
export function CoachLoginSheet({ open, onSignIn, onClose, onDone }: CoachLoginSheetProps) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!open) return null

  const run = async () => {
    setBusy(true)
    setError(null)
    try {
      const id = await onSignIn()
      if (id) onDone()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      className="app-modal confirm-modal active"
      role="dialog"
      aria-modal="true"
      aria-labelledby="coachLoginTitle"
      onClick={(event) => {
        if (event.target === event.currentTarget && !busy) onClose()
      }}
    >
      <div className="app-modal-panel">
        <h2 className="app-modal-title" id="coachLoginTitle">
          코치는 로그인 후 쓸 수 있어요
        </h2>
        <p className="app-modal-body">
          코치 사용량과 구독이 계정에 저장돼서, 기기를 바꿔도 그대로 이어져요. 운동 기록과 타이머는 로그인 없이도 계속 쓸 수
          있어요.
        </p>
        <button className="login-apple" type="button" disabled={busy} onClick={run}>
           Apple로 로그인
        </button>
        {error ? <div className="login-error sheet-error">{error}</div> : null}
        <button className="app-modal-btn ghost" type="button" disabled={busy} onClick={onClose}>
          나중에
        </button>
      </div>
    </div>
  )
}
