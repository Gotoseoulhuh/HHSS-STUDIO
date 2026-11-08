import { useEffect, useState, type ReactNode } from 'react'

export interface DisclosureItem {
  no: string
  label: string
  /** 라벨 옆 작은 영문 */
  en?: string
  body: ReactNode
  /** 강조 카드(지금 보는 개념 등) */
  current?: boolean
}

/** 접기/펼치기 카드 묶음. 열림 상태는 aria-expanded 하나로, 애니메이션은 CSS(.disc)가 맡는다. */
export function Disclosure({ items, idPrefix, openRequest }: { items: DisclosureItem[]; idPrefix: string; openRequest?: { no: string; n: number } | null }) {
  const [open, setOpen] = useState<Set<string>>(() => new Set())
  // 바깥에서 특정 카드를 열어 달라는 요청 (n이 바뀔 때마다)
  useEffect(() => {
    if (openRequest) setOpen((prev) => new Set(prev).add(openRequest.no))
  }, [openRequest])
  const toggle = (no: string) =>
    setOpen((prev) => {
      const next = new Set(prev)
      if (next.has(no)) next.delete(no)
      else next.add(no)
      return next
    })

  return (
    <div className="disc">
      {items.map((it, i) => {
        const id = `${idPrefix}-${it.no}`
        const isOpen = open.has(it.no)
        return (
          <div key={it.no} id={`${idPrefix}-item-${it.no}`} className={'disc__item' + (it.current ? ' is-current' : '')} data-open={isOpen} data-reveal style={{ ['--i' as string]: i }}>
            <button type="button" className="disc__head" aria-expanded={isOpen} aria-controls={id} onClick={() => toggle(it.no)}>
              <span className="meta">{it.no}</span>
              <span className="disc__label">{it.label}</span>
              {it.en && <span className="disc__en">{it.en}</span>}
              <span className="disc__icon" aria-hidden="true" />
            </button>
            <div className="disc__body" id={id} role="region" aria-label={it.label} inert={!isOpen}>
              <div>
                <div className="disc__text">{it.body}</div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
