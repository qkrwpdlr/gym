import { useMemo, useRef, useState } from 'react'
import { countTotalSets, loadText, repsText, todayStr, weekdayKr } from '../storage'
import { LIFTS, TEMPLATES, buildProgram, templateById, templateLifts, toE1rm } from '../templates'
import type { LiftKey, LiftMaxes, RoutineTemplate, WeightBasis } from '../templates'
import type { Program } from '../types'
import './Onboarding.css'

type OnboardingProps = {
  open: boolean
  /** first: 첫 실행 — 나중에 하면 기본 템플릿을 무게 없이 건다. change: 설정에서 다시 연 경우 — 닫기만 한다. */
  mode: 'first' | 'change'
  onApply: (program: Program, start: string) => void
  onLater: () => void
  onCoach: () => void
}

type Step = 'pick' | 'weights' | 'start'

/// 루틴 고르기 → (선택) 무게 입력 → 시작일 확인.
/// 새 사용자가 남의 루틴을 보지 않도록 첫 실행에 한 번 띄우고, 설정에서 다시 열 수 있다.
export function Onboarding({ open, mode, onApply, onLater, onCoach }: OnboardingProps) {
  const [step, setStep] = useState<Step>('pick')
  const scrollRef = useRef<HTMLDivElement>(null)
  const [templateId, setTemplateId] = useState<string>(TEMPLATES[0].id)
  const [basis, setBasis] = useState<WeightBasis>('rm5')
  const [inputs, setInputs] = useState<Partial<Record<LiftKey, string>>>({})
  const [start, setStart] = useState(todayStr)

  const template = templateById(templateId) || TEMPLATES[0]
  const lifts = useMemo(() => templateLifts(template), [template])

  // 입력칸의 문자열 → 추정 1RM. 비었거나 이상한 값은 "모름"으로 친다.
  const maxes = useMemo(() => {
    const m: LiftMaxes = {}
    lifts.forEach((k) => {
      const v = parseFloat(inputs[k] || '')
      if (!isNaN(v) && v > 0 && v < 1000) m[k] = toE1rm(v, basis)
    })
    return m
  }, [lifts, inputs, basis])

  const program = useMemo(() => (step === 'start' ? buildProgram(template, maxes) : null), [step, template, maxes])

  if (!open) return null

  const stepNo = step === 'pick' ? 1 : step === 'weights' ? 2 : 3
  // 단계가 바뀌면 맨 위부터 보여 준다 — 앞 단계에서 아래 버튼까지 내려온 스크롤이 남으면 제목과 '이전'이 가려진다.
  const go = (next: Step) => {
    setStep(next)
    scrollRef.current?.scrollTo(0, 0)
  }
  const back = () => go(step === 'start' ? 'weights' : 'pick')

  return (
    <div className="onboard" ref={scrollRef} role="dialog" aria-modal="true" aria-labelledby="onboardTitle">
      <div className="onboard-body">
        <div className="onboard-top">
          {step === 'pick' ? (
            <span className="login-tag">{mode === 'first' ? 'GYM · 시작하기' : '루틴 바꾸기'}</span>
          ) : (
            <button className="onboard-back" type="button" onClick={back}>
              ‹ 이전
            </button>
          )}
          <span className="onboard-step">{stepNo} / 3</span>
          {mode === 'change' ? (
            <button className="onboard-close" type="button" aria-label="닫기" onClick={onLater}>
              ×
            </button>
          ) : null}
        </div>

        {step === 'pick' ? (
          <PickStep
            templateId={templateId}
            onSelect={setTemplateId}
            onCoach={onCoach}
            onNext={() => go('weights')}
            onLater={onLater}
            mode={mode}
          />
        ) : null}

        {step === 'weights' ? (
          <WeightsStep
            lifts={lifts}
            basis={basis}
            inputs={inputs}
            onBasis={setBasis}
            onInput={(k, v) => setInputs((cur) => ({ ...cur, [k]: v }))}
            onNext={() => go('start')}
            onSkip={() => {
              setInputs({})
              go('start')
            }}
          />
        ) : null}

        {step === 'start' && program ? (
          <StartStep template={template} program={program} start={start} onStart={setStart} onApply={() => onApply(program, start)} />
        ) : null}
      </div>
    </div>
  )
}

// ============ 1. 루틴 고르기 ============
function PickStep({
  templateId,
  onSelect,
  onCoach,
  onNext,
  onLater,
  mode,
}: {
  templateId: string
  onSelect: (id: string) => void
  onCoach: () => void
  onNext: () => void
  onLater: () => void
  mode: 'first' | 'change'
}) {
  return (
    <>
      <h1 className="login-title onboard-title" id="onboardTitle">
        어떤 루틴으로
        <span>시작할까요?</span>
      </h1>
      <p className="onboard-lead">나중에 설정에서 언제든 바꿀 수 있어요.</p>

      <div className="onboard-cards" role="radiogroup" aria-label="루틴 템플릿">
        {TEMPLATES.map((t) => (
          <TemplateCard key={t.id} t={t} selected={t.id === templateId} onSelect={() => onSelect(t.id)} />
        ))}
      </div>

      <button className="settings-item onboard-coach" type="button" onClick={onCoach}>
        <span>
          코치와 직접 만들기
          <span className="settings-item-sub">목표와 일정을 말하면 코치가 몇 주짜리 루틴을 짜 줘요</span>
        </span>
        <span className="chev" aria-hidden="true">
          ›
        </span>
      </button>

      <div className="onboard-actions">
        <button className="start-btn onboard-primary" type="button" onClick={onNext}>
          <span className="start-text">
            <span className="main">다음</span>
            <span className="sub">무게 입력</span>
          </span>
        </button>
        <button className="login-skip" type="button" onClick={onLater}>
          {mode === 'first' ? '나중에 할게요' : '닫기'}
        </button>
        {mode === 'first' ? <div className="login-fine">나중에 하면 초보 전신 루틴을 무게 없이 먼저 보여 드려요.</div> : null}
      </div>
    </>
  )
}

/// '주 5회 + 대체 1일' — 이름표(chip)가 붙은 대체 루틴은 주간 횟수에서 뺀다.
function frequencyText(t: RoutineTemplate): string {
  const days = t.days.filter((d) => !d.chip).length
  const alt = t.days.length - days
  return `주 ${days}회${alt ? ` + 대체 ${alt}일` : ''}`
}

function TemplateCard({ t, selected, onSelect }: { t: RoutineTemplate; selected: boolean; onSelect: () => void }) {
  return (
    <button
      className={`program-card onboard-card${selected ? ' selected' : ''}`}
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
    >
      <span className="onboard-card-head">
        <span className="pc-name">{t.name}</span>
        <span className="onboard-level">{t.level}</span>
      </span>
      <span className="pc-meta">
        {frequencyText(t)} · {t.weeks}주 · {t.deload.week}주차 디로드
      </span>
      <span className="onboard-card-summary">{t.summary}</span>
      <span className="onboard-card-main">{t.mainLine}</span>
    </button>
  )
}

// ============ 2. 무게 입력 (선택) ============
function WeightsStep({
  lifts,
  basis,
  inputs,
  onBasis,
  onInput,
  onNext,
  onSkip,
}: {
  lifts: LiftKey[]
  basis: WeightBasis
  inputs: Partial<Record<LiftKey, string>>
  onBasis: (b: WeightBasis) => void
  onInput: (k: LiftKey, v: string) => void
  onNext: () => void
  onSkip: () => void
}) {
  const filled = lifts.filter((k) => parseFloat(inputs[k] || '') > 0).length
  return (
    <>
      <h1 className="login-title onboard-title" id="onboardTitle">
        지금 드는 무게를
        <span>알려주세요</span>
      </h1>
      <p className="onboard-lead">입력한 무게로 세트마다 무게를 계산해요. 모르는 종목은 비워 두면 횟수만 보여 드리고, 운동하면서 실제 무게를 적으면 돼요.</p>

      <div className="onboard-seg" role="radiogroup" aria-label="입력 기준">
        <button type="button" role="radio" aria-checked={basis === 'rm5'} className={basis === 'rm5' ? 'on' : ''} onClick={() => onBasis('rm5')}>
          5회 들 수 있는 무게
        </button>
        <button type="button" role="radio" aria-checked={basis === 'rm1'} className={basis === 'rm1' ? 'on' : ''} onClick={() => onBasis('rm1')}>
          1회 최대 (1RM)
        </button>
      </div>

      <div className="onboard-lifts">
        {lifts.map((k) => (
          <label className="onboard-lift" key={k}>
            <span>{LIFTS.find((l) => l.key === k)?.label}</span>
            <span className="onboard-lift-input">
              <input
                type="number"
                inputMode="decimal"
                step="2.5"
                min="0"
                placeholder="모름"
                value={inputs[k] || ''}
                onChange={(e) => onInput(k, e.target.value)}
              />
              <span className="onboard-unit">kg</span>
            </span>
          </label>
        ))}
      </div>

      <div className="onboard-actions">
        <button className="start-btn onboard-primary" type="button" onClick={onNext}>
          <span className="start-text">
            <span className="main">다음</span>
            <span className="sub">{filled ? `${filled}개 종목 무게로 계산` : '무게 없이 횟수만'}</span>
          </span>
        </button>
        <button className="login-skip" type="button" onClick={onSkip}>
          잘 모르겠어요 · 건너뛰기
        </button>
      </div>
    </>
  )
}

// ============ 3. 시작일 · 미리보기 ============
function StartStep({
  template,
  program,
  start,
  onStart,
  onApply,
}: {
  template: RoutineTemplate
  program: Program
  start: string
  onStart: (v: string) => void
  onApply: () => void
}) {
  return (
    <>
      <h1 className="login-title onboard-title" id="onboardTitle">
        이렇게
        <span>시작해요</span>
      </h1>
      <p className="onboard-lead">무게는 매주 조금씩 올라가고, {template.deload.week}주차는 가볍게 쉬어 가요.</p>

      <div className="program-card onboard-preview">
        <div className="pc-name">{program.name}</div>
        <div className="pc-meta">
          {frequencyText(template)} · {program.weeks}주 · {template.level}
        </div>
        <ul className="onboard-days">
          {program.days.map((d, i) => {
            const main = mainSetOf(program, i)
            return (
              <li key={i}>
                <span className="dc-dot" style={{ background: d.color }} />
                <span className="onboard-day-title">
                  DAY {i + 1} · {d.title}
                  <span className="onboard-faint">
                    {' '}
                    · {d.chip ? '대체' : weekdayKr(d.day)} · {countTotalSets(d)}세트
                  </span>
                </span>
                {main ? <span className="onboard-day-main">{main}</span> : null}
              </li>
            )
          })}
        </ul>
      </div>

      <label className="dc-date onboard-date">
        <span>시작일</span>
        <input type="date" value={start} onChange={(e) => onStart(e.target.value)} />
      </label>

      <div className="onboard-actions">
        <button className="start-btn onboard-primary" type="button" disabled={!start} onClick={onApply}>
          <span className="start-text">
            <span className="main">이 루틴으로 시작</span>
            <span className="sub">DAY 1부터 보여 드려요</span>
          </span>
        </button>
      </div>
    </>
  )
}

/// 날마다 가장 중요한 세트(증량이 걸린 첫 섹션, 없으면 첫 본운동 섹션)를 한 줄로.
/// 파워빌딩처럼 한 섹션 안에 워밍업 세트가 섞여 있으면 워밍업은 건너뛴다.
function mainSetOf(p: Program, dayIdx: number): string {
  const day = p.days[dayIdx]
  const rule = (p.progression || []).find((r) => r.dayIdx === dayIdx)
  const sec = rule ? day.sections[rule.sectionIdx] : day.sections.find((s) => !s.title.includes('워밍업'))
  if (!sec) return ''
  const set = sec.sets.find((s) => !s.name.includes('워밍업')) || sec.sets[0]
  if (!set) return ''
  const count = sec.sets.filter((s) => s.name === set.name).length
  const load = set.weight && !isNaN(parseFloat(set.weight)) ? loadText(set) : repsText(set.reps)
  return `${set.name} ${count}세트 · ${load}`
}
