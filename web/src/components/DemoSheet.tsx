import { useEffect, useRef } from 'react'
import { demoUrl } from '../demos'
import type { ExerciseDemo } from '../demos'

export function DemoSheet({ demo, onClose }: { demo: ExerciseDemo | null; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  useEffect(() => {
    if (!demo) return
    const dialog = dialogRef.current
    const previous = document.activeElement
    dialog?.showModal()
    const closeFromFrame = (event: MessageEvent) => {
      if (event.origin === location.origin && event.source === iframeRef.current?.contentWindow && event.data?.type === 'gym-demo-close') onClose()
    }
    window.addEventListener('message', closeFromFrame)
    return () => {
      window.removeEventListener('message', closeFromFrame)
      dialog?.close()
      if (previous instanceof HTMLElement && previous.isConnected) previous.focus({ preventScroll: true })
    }
  }, [demo, onClose])

  if (!demo) return null
  return (
    <dialog ref={dialogRef} className="demo-sheet" aria-labelledby="demo-title" onCancel={(event) => { event.preventDefault(); onClose() }}>
      <header className="demo-sheet-header">
        <h2 id="demo-title">{demo.name} 자세</h2>
        <button type="button" className="demo-close" onClick={onClose} autoFocus aria-label="자세 보기 닫기">닫기</button>
      </header>
      <iframe ref={iframeRef} title={`${demo.name} 운동 시범`} src={demoUrl(demo)} />
    </dialog>
  )
}
