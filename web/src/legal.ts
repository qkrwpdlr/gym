// 법적 문서와 외부 링크. 문서는 코치 서버(워커)가 /privacy, /terms 로 서빙한다.
// 웹뷰 안에서 그냥 링크를 따라가면 앱 화면이 그 페이지로 바뀌고 돌아올 길이 없다.
// 그래서 외부 주소는 항상 openExternal 로 연다 — 네이티브 앱은 Safari 시트로, 브라우저는 새 탭으로.

import { SERVER_URL } from './storage'

export const PRIVACY_URL = SERVER_URL ? SERVER_URL + '/privacy' : ''
export const TERMS_URL = SERVER_URL ? SERVER_URL + '/terms' : ''

type ExternalNative = { openURL?: (url: string) => void }

export function openExternal(url: string) {
  if (!url) return
  const native = (window as Window & { GymNative?: ExternalNative }).GymNative
  if (native?.openURL) native.openURL(url)
  else window.open(url, '_blank', 'noopener')
}
