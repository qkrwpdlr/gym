import { useContext } from 'react'
import { DemoContext, exerciseDemo } from '../demos'

export function DemoButton({ name }: { name: string }) {
  const open = useContext(DemoContext)
  const demo = exerciseDemo(name)
  if (!demo) return null
  return (
    <button className="demo-button" type="button" aria-label={`${demo.name} 자세 보기`} onClick={() => open(demo)}>
      <span aria-hidden="true">?</span>
    </button>
  )
}
