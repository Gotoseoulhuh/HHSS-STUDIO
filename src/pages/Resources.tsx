import { Link } from 'react-router-dom'
import { PageHead } from '../components/PageHead'
import { listResources } from '../lib/content'
import { formatBytes, pad2 } from '../lib/format'

export function Resources() {
  const items = listResources()
  return (
    <>
      <PageHead index="04 — RESOURCES" title="자료" desc="공개해도 되는 문서와 제작 자료입니다." />
      <div className="container">
        {items.length === 0 ? (
          <p className="empty hand">아직 공개된 자료가 없습니다.</p>
        ) : (
          <ul className="row-list">
            {items.map((r, i) => (
              <li key={r.slug} data-reveal style={{ ['--i' as string]: i }}>
                <Link to={`/resources/${r.slug}`} viewTransition>
                  <span className="meta">{pad2(i + 1)}</span>
                  <h3>{r.title}</h3>
                  <p className="caption row-sub">{r.summary}</p>
                  <span className="meta row-right">{r.file ? `${r.file.format.toUpperCase()} · ${formatBytes(r.file.sizeBytes)}` : '파일 연결 전'}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}
