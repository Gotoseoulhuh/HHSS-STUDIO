import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import type { MediaRef } from '../data/types'
import { MediaFrame } from './MediaFrame'

export interface PaletteFilm { title: string; year: number; slug: string; media: MediaRef; colors: { hex: string; pct: number }[]; mood: string }

/** 화면을 크게 보고, 오른쪽에 주요 색과 비율(%)을 나열한다. 닫기: Esc · 바깥 누르기 · 닫기 버튼 */
export function PaletteViewer({ film, onClose }: { film: PaletteFilm | null; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (film && !d.open) d.showModal()
    if (!film && d.open) d.close()
  }, [film])

  return (
    <dialog
      ref={ref}
      className="pv"
      aria-label={film ? `${film.title} 색 보기` : undefined}
      onClose={onClose}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      {film && (
        <div className="pv__inner">
          <MediaFrame media={film.media} className="pv__img" eager />
          <div className="pv__side">
            <div className="pv__head">
              <span className="sub-label">Color · {film.year}</span>
              <h3 className="pv__title">{film.title}</h3>
              <p className="pv__mood hand">{film.mood}</p>
            </div>
            <span className="pv__bar" aria-hidden="true">
              {film.colors.map((c) => <span key={c.hex} style={{ background: c.hex, flexGrow: c.pct }} />)}
            </span>
            <ol className="pv__list">
              {film.colors.map((c) => (
                <li key={c.hex}>
                  <span className="pv__chip" style={{ background: c.hex }} aria-hidden="true" />
                  <span className="pv__hex">{c.hex}</span>
                  <span className="pv__pct">{c.pct}%</span>
                </li>
              ))}
            </ol>
            <div className="pv__foot">
              <Link to={`/works/${film.slug}`} className="meta pv__more" viewTransition>작품 보러 가기 →</Link>
              <button type="button" className="pv__close meta" onClick={onClose}>닫기 ✕</button>
            </div>
          </div>
        </div>
      )}
    </dialog>
  )
}
