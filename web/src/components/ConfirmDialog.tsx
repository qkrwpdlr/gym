import { useEffect } from 'react'

export type ConfirmRequest = {
  title: string
  body?: string
  /** 본문 아래에 목록으로 보여줄 항목 (예: 되돌릴 조정 내역) */
  items?: string[]
  confirmLabel: string
  cancelLabel?: string
  /** 기록을 지우는 것처럼 되돌릴 수 없는 동작이면 확인 버튼을 경고색으로 둔다 */
  destructive?: boolean
  /** 고를 게 없는 안내면 확인 버튼 하나만 둔다 */
  notice?: boolean
}

type ConfirmDialogProps = {
  request: ConfirmRequest | null
  onResolve: (ok: boolean) => void
}

/// 브라우저 confirm() 대신 쓰는 앱 안 확인 창.
/// 버튼에 '확인' 대신 실제로 일어날 일을 적어 한눈에 고를 수 있게 한다.
export function ConfirmDialog({ request, onResolve }: ConfirmDialogProps) {
  useEffect(() => {
    if (!request) return undefined
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onResolve(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [request, onResolve])

  if (!request) return null

  return (
    <div
      className="app-modal confirm-modal active"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirmTitle"
      onClick={(event) => {
        if (event.target === event.currentTarget) onResolve(false)
      }}
    >
      <div className="app-modal-panel">
        <h2 className="app-modal-title" id="confirmTitle">
          {request.title}
        </h2>
        {request.body ? <p className="app-modal-body">{request.body}</p> : null}
        {request.items?.length ? (
          <ul className="app-modal-list">
            {request.items.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        ) : null}
        {request.notice ? (
          <button className="app-modal-btn primary wide" type="button" onClick={() => onResolve(true)}>
            {request.confirmLabel}
          </button>
        ) : (
          <div className="app-modal-actions">
            <button className="app-modal-btn" type="button" onClick={() => onResolve(false)}>
              {request.cancelLabel || '취소'}
            </button>
            <button
              className={`app-modal-btn ${request.destructive ? 'danger' : 'primary'}`}
              type="button"
              onClick={() => onResolve(true)}
            >
              {request.confirmLabel}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
