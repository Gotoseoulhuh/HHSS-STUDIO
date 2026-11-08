import { useEffect, useRef } from 'react'

export interface TocItem { id: string; label: string }

/**
 * 오른쪽 세로 목차 + 읽은 만큼 채워지는 선.
 * 각 항목의 --p(0~1) = 그 섹션을 얼마나 읽었는지. 다 읽은 항목은 하늘색, 읽는 중인 항목은 선이 차오른다.
 * 휴대폰에서는 헤더 아래 얇은 진행 막대만 보인다. (스크롤마다 React를 다시 그리지 않도록 DOM에 직접 쓴다)
 */
export function ConceptToc({ items }: { items: TocItem[] }) {
  const listRef = useRef<HTMLOListElement>(null)
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let raf = 0
    const update = () => {
      raf = 0
      const line = window.innerHeight * 0.4
      const lis = listRef.current?.querySelectorAll<HTMLLIElement>('li') ?? []
      items.forEach((it, i) => {
        const el = document.getElementById(it.id)
        const li = lis[i]
        if (!el || !li) return
        const r = el.getBoundingClientRect()
        const p = Math.min(1, Math.max(0, (line - r.top) / r.height))
        li.style.setProperty('--p', p.toFixed(3))
        li.dataset.state = p >= 1 ? 'done' : p > 0 ? 'active' : 'todo'
        if (p > 0 && p < 1) li.setAttribute('aria-current', 'step')
        else li.removeAttribute('aria-current')
      })
      const doc = document.documentElement
      const total = doc.scrollHeight - window.innerHeight
      barRef.current?.style.setProperty('--p', total > 0 ? (window.scrollY / total).toFixed(3) : '0')
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [items])

  const go = (id: string) => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    document.getElementById(id)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
  }

  return (
    <>
      <div className="ctoc-bar" ref={barRef} aria-hidden="true" />
      <nav className="ctoc" aria-label="이 글의 목차">
        <ol ref={listRef}>
          {items.map((it, i) => (
            <li key={it.id} data-state="todo">
              <a href={`#${it.id}`} onClick={(e) => { e.preventDefault(); go(it.id) }}>
                <span className="ctoc__no">{String(i + 1).padStart(2, '0')}</span>
                <span className="ctoc__label">{it.label}</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>
    </>
  )
}
