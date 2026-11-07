import { Link, useParams } from 'react-router-dom'
import { MediaFrame } from '../components/MediaFrame'
import { WorkBlocks } from '../components/WorkBlocks'
import { listAlbums, getWork, listWorks } from '../lib/content'
import { NotFound } from './NotFound'

export function WorkDetail() {
  const { slug = '' } = useParams()
  const work = getWork(slug)
  if (!work) return <NotFound />

  const all = listWorks()
  const idx = all.findIndex((w) => w.slug === work.slug)
  const next = all[(idx + 1) % all.length]
  const album = listAlbums().find((a) => a.workSlug === work.slug)

  // 입력한 항목만 표시
  const meta: [string, string | undefined][] = [
    ['공개', work.release],
    ['장르', work.genre],
    ['러닝타임', work.runtime],
    ['크레딧', work.credits.join(' · ')],
  ]

  return (
    <article>
      {/* 첫 화면: 대표 이미지 위에 제목 */}
      <header className="work-hero">
        <MediaFrame media={work.cover} className="work-hero__media hero-zoom" eager />
        <div className="work-hero__text container">
          <Link to="/works" className="page-head__index" viewTransition>← 작품</Link>
          <span className="meta hero-line" style={{ ['--i' as string]: 0 }}>{work.workType} · {work.year}</span>
          <h1 className="work-hero__title">
            {(work.titleLines ?? [work.title]).map((l, i) => (
              <span key={i} className="hero-line" style={{ ['--i' as string]: i + 1 }}>{l}</span>
            ))}
          </h1>
          <p className="hand hero-line" style={{ ['--i' as string]: 3 }}>{work.summary}</p>
        </div>
      </header>

      <div className="container">
        <dl className="detail-meta work-meta" data-reveal>
          {meta.filter(([, v]) => v).map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd className="hand">{v}</dd>
            </div>
          ))}
        </dl>

        <WorkBlocks blocks={work.blocks} />

        {album && (
          <p className="block" data-reveal>
            <Link to={`/photography/${album.slug}`} className="btn" viewTransition>촬영 기록 사진 모아 보기 →</Link>
          </p>
        )}

        {next && next.slug !== work.slug && (
          <nav className="next-work card" aria-label="다음 작품">
            <hr className="rule" data-reveal />
            <Link to={`/works/${next.slug}`} viewTransition>
              <span className="page-head__index">다음 작품</span>
              <span className="card__head">
                <span className="card__title next-work__title">{next.title}</span>
                <span className="card__arrow" aria-hidden="true">→</span>
              </span>
              <span className="caption">{next.summary}</span>
            </Link>
          </nav>
        )}
      </div>
    </article>
  )
}
