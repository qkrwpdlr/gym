type StatusBarProps = {
  notificationPermission: string
  wakeLockActive: boolean
  wakeLockUnavailable: boolean
  onWakeClick: () => void
  onNotifClick: () => void
}

export const WAKE_STATUS_CHIP_ID = 'wake-status-chip'
export const NOTIFICATION_STATUS_CHIP_ID = 'notification-status-chip'

// 켜진 상태는 현재 상태를, 꺼진 상태는 누르면 일어날 일을 적는다.
function wakeChipLabel(wakeLockActive: boolean, wakeLockUnavailable: boolean) {
  if (wakeLockUnavailable) return '화면 유지 미지원'
  return wakeLockActive ? '화면 켜둠' : '화면 켜두기'
}

function wakeChipAccessibilityLabel(wakeLockActive: boolean, wakeLockUnavailable: boolean) {
  if (wakeLockUnavailable) return '화면 켜짐 상태: 지원 안 됨'
  return wakeLockActive ? '화면 켜짐 상태: 켜짐' : '화면 켜짐 상태: 꺼짐'
}

function notificationChipLabel(permission: string) {
  if (permission === 'unsupported') return '알림 미지원'
  if (permission === 'granted') return '휴식 알림 켜짐'
  if (permission === 'denied') return '알림 꺼짐'
  return '휴식 알림 켜기'
}

function notificationChipAccessibilityLabel(permission: string) {
  if (permission === 'unsupported') return '알림 상태: 지원 안 됨'
  if (permission === 'granted') return '알림 상태: 켜짐'
  if (permission === 'denied') return '알림 상태: 차단됨'
  return '알림 상태: 꺼짐'
}

export function StatusBar({
  notificationPermission,
  wakeLockActive,
  wakeLockUnavailable,
  onWakeClick,
  onNotifClick,
}: StatusBarProps) {
  return (
    <div className="status-bar">
      <button
        id={WAKE_STATUS_CHIP_ID}
        aria-label={wakeChipAccessibilityLabel(wakeLockActive, wakeLockUnavailable)}
        aria-pressed={wakeLockActive}
        className={`status-chip ${wakeLockActive ? 'active' : ''}`}
        data-testid={WAKE_STATUS_CHIP_ID}
        type="button"
        onClick={onWakeClick}
      >
        <span className="dot" aria-hidden="true" />
        <span>{wakeChipLabel(wakeLockActive, wakeLockUnavailable)}</span>
      </button>
      <button
        id={NOTIFICATION_STATUS_CHIP_ID}
        aria-label={notificationChipAccessibilityLabel(notificationPermission)}
        aria-pressed={notificationPermission === 'granted'}
        className={`status-chip ${notificationPermission === 'granted' ? 'active' : ''}`}
        data-testid={NOTIFICATION_STATUS_CHIP_ID}
        type="button"
        onClick={onNotifClick}
      >
        <span className="dot" aria-hidden="true" />
        <span>{notificationChipLabel(notificationPermission)}</span>
      </button>
    </div>
  )
}
