import { useEffect, useRef } from 'react'
import type { MediaRef } from '../data/types'
import { pad2 } from '../lib/format'
import { MediaFrame } from './MediaFrame'

interface Props {
  items: MediaRef[]
  index: number
  onChange: (i: number) => void
  onClose: () => void
}

/** 사진 확대 보기: Esc 닫기, ←/→ 넘기기, 터치 밀기, 초점 가두기, 닫으면 원래 버튼으로 초점 복귀(호출부) */
export function Lightbox({ items, index, onChange, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const touchX = useRef<number | null>(null)
  const item = items[index]
  const prev = () => onChange((index - 1 + items.length) % items.length)
  const next = () => onChange((index + 1) % items.length)

  useEffect(() => {
    closeRef.current?.focus()
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowLeft') prev()
      else if (e.key === 'ArrowRight') next()
      else if (e.key === 'Tab' && ref.current) {
        const f = ref.current.querySelectorAll<HTMLElement>('button')
        const first = f[0], last = f[f.length - 1]
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  return (
    <div
      ref={ref}
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label="사진 크게 보기"
      onTouchStart={(e) => { touchX.current = e.touches[0].clientX }}
      onTouchEnd={(e) => {
        if (touchX.current === null) return
        const dx = e.changedTouches[0].clientX - touchX.current
        if (Math.abs(dx) > 48) (dx > 0 ? prev : next)()
        touchX.current = null
      }}
    >
      <div className="lightbox__bar">
        <span className="meta" aria-live="polite">{pad2(index + 1)} / {pad2(items.length)}</span>
        <button ref={closeRef} className="icon-btn" onClick={onClose}>닫기 ✕</button>
      </div>
      <div className="lightbox__stage" key={index}>
        {/* 세로 사진도 화면 높이 안에 들어오도록 폭을 비율로 제한 */}
        <div style={{ width: `min(100%, 1400px, calc((100dvh - 190px) * ${item.ratio}))` }}>
          <MediaFrame media={item} fit="contain" eager />
        </div>
      </div>
      <div className="lightbox__nav">
        <button className="icon-btn" onClick={prev} aria-label="이전 사진">←</button>
        <p className="caption">{item.caption}</p>
        <button className="icon-btn" onClick={next} aria-label="다음 사진">→</button>
      </div>
    </div>
  )
}
