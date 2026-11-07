import { Link } from 'react-router-dom'
import { PageHead } from '../components/PageHead'
import { listPosts } from '../lib/content'
import { formatDate, pad2 } from '../lib/format'

export function Journal() {
  const posts = listPosts()
  return (
    <>
      <PageHead index="03 — JOURNAL" title="글" desc="에세이, 작업일지, 리뷰, 제작 과정." />
      <div className="container">
        {posts.length === 0 ? (
          <p className="empty hand">아직 공개된 글이 없습니다.</p>
        ) : (
          <ul className="row-list">
            {posts.map((p, i) => (
              <li key={p.slug} data-reveal style={{ ['--i' as string]: i }}>
                <Link to={`/journal/${p.slug}`} viewTransition>
                  <span className="meta">{pad2(i + 1)}</span>
                  <h3>{p.title}</h3>
                  <p className="caption row-sub">{p.category} · {p.summary}</p>
                  <span className="meta row-right">{formatDate(p.publishedAt)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}
