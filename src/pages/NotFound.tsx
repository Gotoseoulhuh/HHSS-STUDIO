import { Link } from 'react-router-dom'

export function NotFound() {
  return (
    <section className="container page-head">
      <span className="page-head__index">404</span>
      <h1>찾을 수 없음</h1>
      <p className="hand">요청한 페이지가 없거나 공개되지 않았습니다.</p>
      <p><Link to="/" className="btn" viewTransition>홈으로 →</Link></p>
    </section>
  )
}
