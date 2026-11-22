import { Link } from 'react-router-dom'
import { Card } from '../components/Card'
import { PageHead } from '../components/PageHead'
import { listWorks, SHOW_DRAFTS } from '../lib/content'
import { pad2 } from '../lib/format'
import { asset } from '../lib/url'

/** 아직 어느 작품 것인지 정하지 않은 삽화 (public/assets/illust/05~19.jpg). 개발 화면에서만 번호와 함께 보인다 */
const UNSORTED_ILLUST = Array.from({ length: 15 }, (_, i) => pad2(i + 5))

export function Works() {
  const works = listWorks()
  return (
    <>
      <PageHead index="01 — WORKS" title="작품" desc="학생들과 함께 만든 단편영화와 뮤직비디오." />
      <div className="container editorial">
        <aside className="editorial__aside" aria-label="작품 목차">
          <ul className="index-list">
            {works.map((w, i) => (
              <li key={w.slug}>
                <Link to={`/works/${w.slug}`} viewTransition><span className="meta">{pad2(i + 1)}</span>{w.title}</Link>
              </li>
            ))}
          </ul>
        </aside>
        {works.length === 0 ? (
          <p className="empty hand">아직 공개된 작품이 없습니다.</p>
        ) : (
          <ul className="card-list card-list--grid">
            {works.map((w, i) => (
              <Card key={w.slug} to={`/works/${w.slug}`} index={i} title={w.title} sub={[w.year, w.workType, w.runtime].filter(Boolean).join(" · ")} media={w.cover} />
            ))}
          </ul>
        )}
      </div>
      {SHOW_DRAFTS && (
        <section className="container illust-sort" aria-label="작품을 정하지 않은 삽화">
          <p className="draft-note">초안 · 개발 화면에서만 보여요. 번호마다 어느 작품인지 알려 주시면 그 작품으로 옮깁니다.</p>
          <ul className="illust-sort__grid">
            {UNSORTED_ILLUST.map((n) => (
              <li key={n}>
                <span className="illust-sort__no">{n}</span>
                <img src={asset(`assets/illust/${n}.jpg`)} alt={`삽화 ${n}번`} loading="lazy" decoding="async" />
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  )
}
