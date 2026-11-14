import type { AiConsent } from '../aiConsent'
import { PRIVACY_URL, openExternal } from '../legal'
import { formatDateKr } from '../storage'
import './AiConsentSheet.css'

type AiConsentSheetProps = {
  open: boolean
  onAgree: () => void
  onDecline: () => void
}

/// 코치를 처음 열 때(로그인 다음, 챗을 열기 전에) 뜨는 데이터 전송 동의.
/// 코치 답변은 외부 AI(DeepSeek)가 만들기 때문에, 무엇을 누구에게 왜 보내는지 먼저 알리고
/// 명시적으로 동의를 받아야 한다(App Store 5.1.2(i)). 항목은 storage.ts 의
/// buildDailyContext · buildBuilderContext · buildHistorySummary 가 실제로 담는 내용과 맞춘다 —
/// 거기에 보내는 항목이 늘면 이 문구와 AI_CONSENT_VERSION 을 함께 고친다.
export function AiConsentSheet({ open, onAgree, onDecline }: AiConsentSheetProps) {
  if (!open) return null

  return (
    <div
      className="app-modal confirm-modal active"
      role="dialog"
      aria-modal="true"
      aria-labelledby="aiConsentTitle"
      onClick={(event) => {
        if (event.target === event.currentTarget) onDecline()
      }}
    >
      <div className="app-modal-panel ai-consent-panel">
        <h2 className="app-modal-title" id="aiConsentTitle">
          코치에게 보낼 정보를 확인해 주세요
        </h2>
        <p className="app-modal-body">
          코치 답변은 외부 AI 서비스인 DeepSeek이 만들어요. 코치에게 말을 걸면 아래 정보가 저희 서버를 거쳐 DeepSeek으로
          전송돼요.
        </p>
        <ul className="app-modal-list">
          <li>지금 루틴과 진행 중인 블록 (운동 이름, 목표 무게·횟수, 오늘 한 세트)</li>
          <li>최근 운동 기록 요약 (무게·횟수·RPE)과 운동 메모</li>
          <li>코치 채팅에 입력한 내용</li>
        </ul>
        <p className="app-modal-body small">
          코치 답변과 루틴 조정안을 만드는 데만 써요. DeepSeek은 중국 회사라 정보가 한국 밖에서 처리될 수 있어요. Apple 계정
          정보, 이름, 이메일은 보내지 않아요.
        </p>
        <p className="app-modal-body small">
          동의하지 않아도 운동 기록과 타이머는 그대로 쓸 수 있어요. 동의는 설정에서 언제든 철회할 수 있어요.
        </p>
        {PRIVACY_URL ? (
          <button className="ai-consent-link" type="button" onClick={() => openExternal(PRIVACY_URL)}>
            개인정보 처리방침 보기
          </button>
        ) : null}
        <div className="app-modal-actions">
          <button className="app-modal-btn" type="button" onClick={onDecline}>
            동의 안 함
          </button>
          <button className="app-modal-btn primary" type="button" onClick={onAgree}>
            동의하고 시작
          </button>
        </div>
      </div>
    </div>
  )
}

type AiConsentSettingsRowProps = {
  consent: AiConsent | null
  onToggle: () => void
}

/// 설정의 동의 상태 줄. 동의했으면 철회를, 안 했으면 동의 안내를 연다.
export function AiConsentSettingsRow({ consent, onToggle }: AiConsentSettingsRowProps) {
  return (
    <button className="settings-item" type="button" onClick={onToggle}>
      <span>
        AI 코치 데이터 전송 동의
        <span className="settings-item-sub">
          {consent ? `${consentDateLabel(consent.at)}동의했어요 · 누르면 철회해요` : '코치를 열 때 다시 물어봐요'}
        </span>
      </span>
      <span className={`ai-consent-state ${consent ? 'on' : ''}`}>{consent ? '동의함' : '동의 안 함'}</span>
    </button>
  )
}

/// 저장은 UTC ISO 시각이라, 날짜는 기기 시간대로 바꿔서 보여준다. 읽을 수 없으면 날짜를 뺀다.
function consentDateLabel(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const ymd = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
  return formatDateKr(ymd, false) + '에 '
}
