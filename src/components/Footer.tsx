import { useEffect, useState } from 'react'
import { getSettings } from '../lib/content'
import { loadVisitStats, visitsConfigured, type VisitStats } from '../lib/visits'
import { SocialLinks } from './SocialLinks'

const fmt = new Intl.NumberFormat('ko-KR')

/** 하단: 왼쪽 저작권 · 가운데 슬로건 · 오른쪽 방문자 수와 링크 */
export function Footer() {
  const settings = getSettings()
  const [stats, setStats] = useState<VisitStats | null>(null)

  useEffect(() => {
    if (!visitsConfigured) return
    let alive = true
    loadVisitStats().then((s) => { if (alive) setStats(s) })
    return () => { alive = false }
  }, [])

  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <span className="meta site-footer__copy">© {new Date().getFullYear()} {settings.footerName}</span>
        <span className="hand site-footer__slogan">{settings.slogan}</span>
        <div className="site-footer__end">
          {stats && (
            <p className="visit-stats meta" aria-label={`오늘 방문자 ${stats.today}명, 전체 방문자 ${stats.total}명`}>
              <span>오늘 <b>{fmt.format(stats.today)}</b></span>
              <span>전체 <b>{fmt.format(stats.total)}</b></span>
            </p>
          )}
          <SocialLinks />
        </div>
      </div>
    </footer>
  )
}
