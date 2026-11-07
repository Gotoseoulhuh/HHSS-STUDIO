import { Link, useParams } from 'react-router-dom'
import { getResource } from '../lib/content'
import { formatBytes } from '../lib/format'
import { NotFound } from './NotFound'

export function ResourceDetail() {
  const { slug = '' } = useParams()
  const r = getResource(slug)
  if (!r) return <NotFound />

  return (
    <article className="container">
      <header className="page-head">
        <Link to="/resources" className="page-head__index" viewTransition>← 자료</Link>
        <h1 data-reveal>{r.title}</h1>
        <p className="hand prose" data-reveal style={{ ['--i' as string]: 1 }}>{r.summary}</p>
        <hr className="rule" data-reveal />
      </header>
      {r.file ? (
        <a className="btn" href={`/${r.file.path}`} download>
          내려받기 · {r.file.format.toUpperCase()} · {formatBytes(r.file.sizeBytes)}
        </a>
      ) : (
        <p className="caption">아직 연결된 파일이 없습니다.</p>
      )}
    </article>
  )
}
