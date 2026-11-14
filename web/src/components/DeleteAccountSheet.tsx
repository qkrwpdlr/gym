import { useState } from 'react'

type DeleteAccountSheetProps = {
  open: boolean
  /** 구독 중이면 App Store 구독은 따로 해지해야 한다고 알린다 */
  subscribed: boolean
  onDelete: () => Promise<{ appleRevoked: boolean }>
  onClose: () => void
}

const DELETE_CONFIRM_PHRASE = '삭제하겠습니다'

/// 계정 삭제. 한 번의 탭으로 지워지지 않도록 확인 문구를 직접 입력해야 버튼이 켜진다.
/// 열 때마다 key로 리마운트되므로 입력값은 매번 비어 있다.
export function DeleteAccountSheet({ open, subscribed, onDelete, onClose }: DeleteAccountSheetProps) {
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState<{ appleRevoked: boolean } | null>(null)

  if (!open) return null

  const matched = text.trim() === DELETE_CONFIRM_PHRASE

  const run = async () => {
    if (!matched || busy) return
    setBusy(true)
    setError(null)
    try {
      setDone(await onDelete())
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  if (done) {
    return (
      <div className="app-modal confirm-modal active" role="dialog" aria-modal="true" aria-labelledby="deleteDoneTitle">
        <div className="app-modal-panel">
          <h2 className="app-modal-title" id="deleteDoneTitle">
            계정을 삭제했어요
          </h2>
          <p className="app-modal-body">
            그동안 이용해 주셔서 감사해요.
            {done.appleRevoked
              ? ''
              : ' Apple 로그인 연결은 설정 앱 › Apple 계정 › Apple로 로그인에서 직접 해제할 수 있어요.'}
          </p>
          <button className="app-modal-btn primary wide" type="button" onClick={onClose}>
            확인
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className="app-modal confirm-modal active"
      role="dialog"
      aria-modal="true"
      aria-labelledby="deleteAccountTitle"
      onClick={(event) => {
        if (event.target === event.currentTarget && !busy) onClose()
      }}
    >
      <div className="app-modal-panel">
        <h2 className="app-modal-title" id="deleteAccountTitle">
          계정을 삭제할까요?
        </h2>
        <p className="app-modal-body">아래 정보가 모두 지워지고, 되돌릴 수 없어요.</p>
        <ul className="app-modal-list">
          <li>코치 사용 기록과 남은 사용 한도</li>
          <li>이 계정에 연결된 PRO 구독 정보 (다른 계정에 다시 연결할 수 있게 돼요)</li>
          <li>Apple 로그인 연결</li>
        </ul>
        <p className="app-modal-body small">이 기기에 저장된 운동 기록은 지워지지 않아요.</p>
        {subscribed ? (
          <div className="app-modal-warn">
            App Store 구독은 자동으로 해지되지 않아요. 설정 앱 › Apple 계정 › 구독에서 직접 해지해 주세요.
          </div>
        ) : null}

        <label className="delete-confirm" htmlFor="deleteConfirmInput">
          계속하려면 아래 칸에 <b>{DELETE_CONFIRM_PHRASE}</b>를 입력해 주세요.
        </label>
        <input
          id="deleteConfirmInput"
          className="delete-confirm-input"
          type="text"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          placeholder={DELETE_CONFIRM_PHRASE}
          value={text}
          disabled={busy}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.nativeEvent.isComposing) void run()
          }}
        />
        {error ? <div className="login-error sheet-error">{error}</div> : null}

        <div className="app-modal-actions">
          <button className="app-modal-btn" type="button" disabled={busy} onClick={onClose}>
            취소
          </button>
          <button className="app-modal-btn danger" type="button" disabled={!matched || busy} onClick={run}>
            {busy ? '삭제하는 중…' : '계정 삭제'}
          </button>
        </div>
      </div>
    </div>
  )
}
