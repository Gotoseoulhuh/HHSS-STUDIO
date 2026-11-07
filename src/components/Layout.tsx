import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { getSettings } from '../lib/content'
import { useReveal } from '../lib/useReveal'
import { Header } from './Header'

export function Layout() {
  const { pathname } = useLocation()
  useReveal()

  // 페이지 이동 시 맨 위로
  useEffect(() => window.scrollTo(0, 0), [pathname])

  return (
    <>
      <a href="#main" className="skip-link">본문으로 건너뛰기</a>
      <Header />
      <main id="main" tabIndex={-1}>
        <Outlet />
      </main>
      <footer className="site-footer">
        <div className="container site-footer__inner">
          <span className="meta">© {new Date().getFullYear()} {getSettings().siteName}</span>
          <span className="meta">hhss.studio</span>
        </div>
      </footer>
    </>
  )
}
