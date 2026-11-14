import type { ReactNode } from 'react'
import { isLogComplete, loadLogByDate, navigate, todayStr } from '../storage'

type ActiveView = 'today' | 'log' | 'logDetail' | 'settings'

type TabbarProps = {
  activeView: ActiveView
}

const ICONS: Record<'today' | 'log' | 'settings', ReactNode> = {
  today: (
    <path d="M3 10v4M6.5 7v10M17.5 7v10M21 10v4M6.5 12h11" />
  ),
  log: (
    <>
      <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </>
  ),
  settings: (
    <>
      <path d="M4 7h10M18 7h2M4 17h2M10 17h10" />
      <circle cx="16" cy="7" r="2" />
      <circle cx="8" cy="17" r="2" />
    </>
  ),
}

export function Tabbar({ activeView }: TabbarProps) {
  const log = loadLogByDate(todayStr())
  let todayState = ''
  if (log) todayState = isLogComplete(log) ? 'complete' : log.sets.length ? 'has-progress' : ''
  const tabs = [
    { view: 'today', hash: '#/today', label: '오늘', cls: todayState },
    { view: 'log', hash: '#/log', label: '기록', cls: '' },
    { view: 'settings', hash: '#/settings', label: '설정', cls: '' },
  ] as const

  return (
    <nav className="tabbar" id="tabbar">
      {tabs.map((t) => {
        const isActive = activeView === t.view || (t.view === 'log' && activeView === 'logDetail')
        const className = ['tab', isActive ? 'active' : '', t.cls].filter(Boolean).join(' ')
        return (
          <button
            className={className}
            key={t.view}
            type="button"
            aria-current={isActive ? 'page' : undefined}
            onClick={() => navigate(t.hash)}
          >
            <svg className="tab-icon" viewBox="0 0 24 24" aria-hidden="true">
              {ICONS[t.view]}
            </svg>
            <span className="tab-label">{t.label}</span>
            <span className="tab-dot" />
          </button>
        )
      })}
    </nav>
  )
}
