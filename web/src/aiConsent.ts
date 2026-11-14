// 코치 대화는 우리 서버를 거쳐 외부 AI(DeepSeek)로 전송된다.
// App Store 5.1.2(i): 제3자 AI로 개인 데이터를 보내기 전에 무엇을 누구에게 보내는지 알리고 명시적으로 동의를 받아야 한다.
// 동의는 이 기기에만 저장한다. 보내는 항목이나 받는 곳이 바뀌어 안내 문구를 고치면
// AI_CONSENT_VERSION 을 올린다 — 예전 버전에 한 동의는 무효가 되어 코치를 열 때 다시 묻는다.

import { V4, lsGet, lsSet } from './storage'

export const AI_CONSENT_KEY = V4 + 'ai-consent'
export const AI_CONSENT_VERSION = 1

export type AiConsent = { version: number; at: string }

/** 현재 버전 안내에 한 동의. 없거나 옛 버전이면 null */
export function loadAiConsent(): AiConsent | null {
  const c = lsGet<AiConsent | null>(AI_CONSENT_KEY, null)
  return c && c.version === AI_CONSENT_VERSION ? c : null
}

export function hasAiConsent(): boolean {
  return loadAiConsent() !== null
}

export function saveAiConsent(): AiConsent {
  const c: AiConsent = { version: AI_CONSENT_VERSION, at: new Date().toISOString() }
  lsSet(AI_CONSENT_KEY, c)
  return c
}

/** 철회는 기록만 지운다. 다음에 코치를 열면 다시 묻는다. */
export function clearAiConsent() {
  try {
    localStorage.removeItem(AI_CONSENT_KEY)
  } catch {
    /* ignore */
  }
}
