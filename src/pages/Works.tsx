import { Link } from 'react-router-dom'
import { Card } from '../components/Card'
import { PageHead } from '../components/PageHead'
import { listWorks } from '../lib/content'
import { pad2 } from '../lib/format'

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
    </>
  )
}
