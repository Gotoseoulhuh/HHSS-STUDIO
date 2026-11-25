import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { festival } from '../data/festival'
import { festivalDateLine, hidePopup, isFestivalSeason, isPopupHidden, listFestivalFilms } from '../lib/festival'
import { asset } from '../lib/url'

/**
 * 시즌 한정 이벤트창: 영화제 기간에 사이트에 들어오면 한 번 뜬다.
 * - 인트로 영상이 끝난 뒤에 나타남
 * - 영화제 페이지(/festival)로 바로 들어온 사람에게는 띄우지 않음 (QR로 들어온 경우)
 * - '닫기'는 이번 방문 동안, '오늘 하루 보지 않기'는 오늘 하루 다시 뜨지 않음
 */
export function FestivalPopup() {
  const { pathname } = useLocation()
  const onFestivalPage = pathname.startsWith('/festival')
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDialogElement>(null)

  // 띄울 조건이 되면, 인트로가 끝나기를 기다렸다가 연다
  useEffect(() => {
    if (onFestivalPage || !isFestivalSeason() || isPopupHidden()) return
    const root = document.documentElement
    let timer = 0
    const show = (delay: number) => { timer = window.setTimeout(() => setOpen(true), delay) }
    if (!root.classList.contains('is-intro')) {
      show(700)
      return () => window.clearTimeout(timer)
    }
    const mo = new MutationObserver(() => {
      if (root.classList.contains('is-intro')) return
      mo.disconnect()
      show(1600) // 인트로가 걷히는 동안은 기다림
    })
    mo.observe(root, { attributes: true, attributeFilter: ['class'] })
    return () => { mo.disconnect(); window.clearTimeout(timer) }
  }, [onFestivalPage])

  // 다른 페이지로 넘어가면(영화제 페이지 포함) 닫는다
  useEffect(() => {
    if (onFestivalPage) setOpen(false)
  }, [onFestivalPage])

  useEffect(() => {
    const el = ref.current
    if (!open || !el) return
    if (!el.open) el.showModal()
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
      if (el.open) el.close()
    }
  }, [open])

  if (!open) return null

  const films = listFestivalFilms()
  const cover = films.find((f) => f.cover?.src)?.cover
  const close = (scope: 'session' | 'today') => {
    hidePopup(scope)
    setOpen(false)
  }

  return (
    <dialog
      ref={ref}
      className="fest-pop"
      aria-labelledby="fest-pop-title"
      onCancel={(e) => { e.preventDefault(); close('session') }}
      onClick={(e) => { if (e.target === e.currentTarget) close('session') }}
    >
      <div className="fest-pop__panel">
        {cover?.src && (
          <div className="fest-pop__cover">
            <img src={asset(cover.src)} alt={cover.alt} />
          </div>
        )}
        <div className="fest-pop__body">
          <span className="fest-pop__label">{festival.nameEn}</span>
          <h2 id="fest-pop-title" className="fest-pop__title">{festival.name}</h2>
          <p className="fest-pop__when">
            {festivalDateLine()}
            {festival.venue && <><br />{festival.venue}</>}
          </p>
          {films.length > 0 && (
            <p className="fest-pop__films">{films.map((f) => `〈${f.title}〉`).join(' ')}</p>
          )}
          <Link to="/festival" className="pill pill--solid fest-pop__go" viewTransition onClick={() => hidePopup('session')}>
            상영작 보기 <span aria-hidden="true">→</span>
          </Link>
        </div>
        <div className="fest-pop__foot">
          <button type="button" onClick={() => close('today')}>오늘 하루 보지 않기</button>
          <button type="button" onClick={() => close('session')}>닫기 ✕</button>
        </div>
      </div>
    </dialog>
  )
}
