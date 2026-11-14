import { useState } from 'react'

type MemoSheetProps = {
  open: boolean
  initial: string
  onClose: () => void
  onSave: (note: string) => void
}

const MEMO_CHIPS = ['컨디션 좋음', '잠 부족', '허리 뻐근함', '시간 부족']

/// 오늘 운동 메모. 열 때마다 key로 리마운트되므로 초기값은 한 번만 읽는다.
export function MemoSheet({ open, initial, onClose, onSave }: MemoSheetProps) {
  const [text, setText] = useState(initial)

  const addChip = (chip: string) => setText((cur) => (cur.trim() ? `${cur.trim()}, ${chip}` : chip))

  return (
    <>
      <div className={`sheet-backdrop ${open ? 'active' : ''}`} onClick={onClose} />
      <div className={`sheet memo-sheet ${open ? 'active' : ''}`} role="dialog" aria-label="오늘 메모">
        <div className="sheet-handle" />
        <div className="sheet-heading">오늘 메모</div>
        <div className="sheet-caption">컨디션이나 특이사항을 남겨두면 코치가 다음 조정에 참고해요.</div>
        <textarea
          className="memo-input"
          rows={4}
          value={text}
          placeholder="예: 어깨가 좀 뻐근했음, 벤치 마지막 세트 힘들었음"
          onChange={(e) => setText(e.target.value)}
        />
        <div className="memo-chips">
          {MEMO_CHIPS.map((chip) => (
            <button key={chip} className="rpe-chip" type="button" onClick={() => addChip(chip)}>
              + {chip}
            </button>
          ))}
        </div>
        <div className="sheet-actions">
          <button className="sheet-btn skip" type="button" onClick={onClose}>
            취소
          </button>
          <button className="sheet-btn save" type="button" onClick={() => onSave(text)}>
            저장
          </button>
        </div>
      </div>
    </>
  )
}
