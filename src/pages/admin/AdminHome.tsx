import { useEffect } from 'react'

/** 관리자 화면 자리. Supabase(GitHub 로그인 + site_owner RLS) 연결 후 2단계에서 구현한다. */
export function AdminHome() {
  useEffect(() => {
    // 관리자 화면은 검색에 노출하지 않음
    const m = document.createElement('meta')
    m.name = 'robots'
    m.content = 'noindex, nofollow'
    document.head.appendChild(m)
    return () => m.remove()
  }, [])

  return (
    <section className="container page-head">
      <span className="page-head__index">ADMIN</span>
      <h1>관리자</h1>
      <p className="hand prose">관리자 기능은 Supabase 연결 후 준비됩니다.</p>
      <p>
        <button className="btn" disabled aria-disabled="true" style={{ opacity: 0.5, cursor: 'not-allowed' }}>
          GitHub로 로그인
        </button>
      </p>
    </section>
  )
}
