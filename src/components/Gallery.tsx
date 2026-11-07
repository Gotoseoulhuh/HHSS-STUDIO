import { useRef, useState } from 'react'
import type { MediaRef } from '../data/types'
import { pad2 } from '../lib/format'
import { Lightbox } from './Lightbox'
import { MediaFrame } from './MediaFrame'

interface Props {
  items: MediaRef[]
  /** photo: 2~3열 사진 / storyboard: 촘촘한 번호 칸 */
  layout?: 'photo' | 'storyboard'
}

/** 사진 묶음 + 확대 보기(Esc·←/→·밀기, 닫으면 누른 사진으로 초점 복귀) */
export function Gallery({ items, layout = 'photo' }: Props) {
  const [open, setOpen] = useState<number | null>(null)
  const triggers = useRef<(HTMLButtonElement | null)[]>([])

  const close = () => {
    const i = open
    setOpen(null)
    if (i !== null) requestAnimationFrame(() => triggers.current[i]?.focus())
  }

  return (
    <>
      <ul className={`photo-grid${layout === 'storyboard' ? ' photo-grid--storyboard' : ''}`}>
        {items.map((p, i) => (
          <li key={`${p.src}-${i}`} data-reveal style={{ ['--i' as string]: i % 4 }}>
            <button ref={(el) => { triggers.current[i] = el }} onClick={() => setOpen(i)} aria-label={`${p.alt} 크게 보기`}>
              <MediaFrame media={p} fit={layout === 'storyboard' ? 'contain' : 'cover'} />
              {layout === 'storyboard' ? <span className="meta">{pad2(i + 1)}</span> : p.caption && <span className="caption">{p.caption}</span>}
            </button>
          </li>
        ))}
      </ul>
      {open !== null && <Lightbox items={items} index={open} onChange={setOpen} onClose={close} />}
    </>
  )
}
