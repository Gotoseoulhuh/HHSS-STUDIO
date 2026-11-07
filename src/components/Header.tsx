import { useEffect, useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { NAV } from '../lib/nav'
import { Logo } from './Logo'

export function Header() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const toggleRef = useRef<HTMLButtonElement>(null)

  // 페이지 이동 시 메뉴 닫기
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  // 열린 동안 배경 스크롤 막기 + Esc로 닫고 초점 복귀
  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        toggleRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Logo />
        <button
          ref={toggleRef}
          className="nav-toggle"
          aria-expanded={open}
          aria-controls="site-nav"
          aria-label={open ? '메뉴 닫기' : '메뉴 열기'}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="nav-toggle__bars" aria-hidden="true" />
        </button>
        <nav id="site-nav" className={`nav${open ? ' is-open' : ''}`} aria-label="주 메뉴">
          <ul>
            {NAV.map((item) => (
              <li key={item.to}>
                <NavLink to={item.to} viewTransition>
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  )
}
