import { useEffect } from 'react'

type NotificationSettingsModalProps = {
  active: boolean
  onCancel: () => void
  onConfirm: () => void
}

export const NOTIFICATION_SETTINGS_MODAL_ID = 'notification-settings-modal'
export const NOTIFICATION_OPEN_SETTINGS_BUTTON_ID = 'notification-open-settings-button'

export function NotificationSettingsModal({ active, onCancel, onConfirm }: NotificationSettingsModalProps) {
  useEffect(() => {
    if (!active) return undefined
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [active, onCancel])

  return (
    <div
      id={NOTIFICATION_SETTINGS_MODAL_ID}
      aria-describedby="notificationSettingsBody"
      aria-labelledby="notificationSettingsTitle"
      aria-modal="true"
      className={`app-modal ${active ? 'active' : ''}`}
      data-testid={NOTIFICATION_SETTINGS_MODAL_ID}
      onClick={(event) => {
        if (event.target === event.currentTarget) onCancel()
      }}
      role="dialog"
    >
      <div className="app-modal-panel">
        <h2 className="app-modal-title" id="notificationSettingsTitle">
          알림이 꺼져 있어요
        </h2>
        <p className="app-modal-body" id="notificationSettingsBody">
          휴식이 끝났을 때 알려드리려면 알림 권한이 필요해요. 설정에서 알림을 허용해 주세요.
        </p>
        <div className="app-modal-actions">
          <button className="app-modal-btn" id="notification-settings-cancel-button" type="button" onClick={onCancel}>
            나중에
          </button>
          <button
            className="app-modal-btn primary"
            id={NOTIFICATION_OPEN_SETTINGS_BUTTON_ID}
            data-testid={NOTIFICATION_OPEN_SETTINGS_BUTTON_ID}
            type="button"
            onClick={onConfirm}
          >
            설정 열기
          </button>
        </div>
      </div>
    </div>
  )
}
