import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useReveal } from '../lib/useReveal'
import { Footer } from './Footer'
import { Header } from './Header'

export function Layout() {
  const { pathname } = useLocation()
  useReveal()

  // 페이지 이동 시 맨 위로
  // 중괄호 필수: 최신 브라우저의 scrollTo()는 Promise를 돌려주는데, 이를 effect가 반환하면
  // React가 정리 함수로 착각해 오류가 나고 화면이 비어 버린다.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <>
      <a href="#main" className="skip-link">본문으로 건너뛰기</a>
      <Header />
      <main id="main" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
    </>
  )
}
