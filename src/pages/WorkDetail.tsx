import { Link, useParams } from 'react-router-dom'
import { MediaFrame } from '../components/MediaFrame'
import { getWork } from '../lib/content'
import { NotFound } from './NotFound'

export function WorkDetail() {
  const { slug = '' } = useParams()
  const work = getWork(slug)
  if (!work) return <NotFound />

  // 입력한 항목만 표시
  const meta: [string, string | undefined][] = [
    ['종류', work.workType],
    ['연도', String(work.year)],
    ['역할', work.roles.join(', ')],
    ['러닝타임', work.runtime],
    ['장르', work.genre],
  ]

  return (
    <article className="container">
      <header className="page-head">
        <Link to="/works" className="page-head__index" viewTransition>← 작품</Link>
        <h1 data-reveal>{work.title}</h1>
        <p className="hand prose" data-reveal style={{ ['--i' as string]: 1 }}>{work.summary}</p>
      </header>
      {/* 4장: 영상 플레이어는 3단계에서. 링크가 없으면 대표 이미지만 */}
      <MediaFrame media={work.cover} eager />
      <div className="editorial" style={{ marginTop: 48 }}>
        <aside className="editorial__aside">
          <dl className="detail-meta">
            {meta.filter(([, v]) => v).map(([k, v]) => (
              <div key={k} style={{ display: 'contents' }}>
                <dt>{k}</dt>
                <dd className="hand">{v}</dd>
              </div>
            ))}
          </dl>
        </aside>
        {work.synopsis && <p className="hand prose">{work.synopsis}</p>}
      </div>
    </article>
  )
}
