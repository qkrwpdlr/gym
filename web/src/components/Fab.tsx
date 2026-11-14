type FabProps = {
  show: boolean
  onClick: () => void
}

export function Fab({ show, onClick }: FabProps) {
  return (
    <button className={`fab ${show ? 'show' : ''}`} aria-label="코치에게 물어보기" type="button" onClick={onClick}>
      <svg viewBox="0 0 24 24">
        <path d="M4 3h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-5 4V5a2 2 0 0 1 2-2zm9.2 3.2L9.8 11h2.4l-.9 3.8 3.4-4.8h-2.4l.9-3.8z" />
      </svg>
    </button>
  )
}
