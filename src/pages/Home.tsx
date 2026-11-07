import { Link } from 'react-router-dom'
import { Card } from '../components/Card'
import { MediaFrame } from '../components/MediaFrame'
import { getSettings, listFeaturedWorks, listPosts } from '../lib/content'
import { formatDate, pad2 } from '../lib/format'

export function Home() {
  const settings = getSettings()
  const featured = listFeaturedWorks()
  const lead = featured[0]
  const rest = featured.slice(1)
  const posts = listPosts().slice(0, 3)

  return (
    <>
      <section className="hero container" aria-label="소개">
        <h1>
          <span className="hero-line" style={{ ['--i' as string]: 0 }}>
            <img className="hero-logo" src="/brand/hhss-logo.png" alt={settings.heroLines[0]} />
          </span>
        </h1>
        {settings.heroLines.slice(1).map((line, i) => (
          <p key={i} className="hero-line hand" style={{ ['--i' as string]: i + 1 }}>{line}</p>
        ))}
      </section>

      {!lead ? (
        <p className="container empty hand">아직 공개된 작품이 없습니다.</p>
      ) : (
        <section className="container card" aria-label="대표 작품">
          <Link to={`/works/${lead.slug}`} viewTransition>
            <MediaFrame media={lead.cover} className="hero-zoom" eager />
            <div className="card__head">
              <span className="card__no">{pad2(1)}</span>
              <h2 className="card__title">{lead.title}</h2>
            </div>
            <p className="caption">{lead.summary}</p>
          </Link>
        </section>
      )}

      {rest.length > 0 && (
        <section className="section container" aria-labelledby="home-works">
          <hr className="rule" data-reveal />
          <div className="section__head">
            <h2 id="home-works" data-reveal>주요 작품</h2>
            <Link to="/works" className="btn" viewTransition>작품 둘러보기 →</Link>
          </div>
          <ul className="card-list card-list--grid">
            {rest.map((w, i) => (
              <Card key={w.slug} to={`/works/${w.slug}`} index={i + 1} title={w.title} sub={`${w.year} · ${w.roles.join(', ')}`} media={w.cover} />
            ))}
          </ul>
        </section>
      )}

      {posts.length > 0 && (
        <section className="section container" aria-labelledby="home-posts">
          <hr className="rule" data-reveal />
          <div className="section__head">
            <h2 id="home-posts" data-reveal>최근 글</h2>
            <Link to="/journal" className="meta" viewTransition>전체 보기 →</Link>
          </div>
          <ul className="row-list">
            {posts.map((p, i) => (
              <li key={p.slug} data-reveal style={{ ['--i' as string]: i }}>
                <Link to={`/journal/${p.slug}`} viewTransition>
                  <span className="meta">{pad2(i + 1)}</span>
                  <h3>{p.title}</h3>
                  <p className="caption row-sub">{p.summary}</p>
                  <span className="meta row-right">{formatDate(p.publishedAt)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  )
}
