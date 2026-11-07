import { Link } from 'react-router-dom'
import { Card } from '../components/Card'
import { MediaFrame } from '../components/MediaFrame'
import { getSettings, listFeaturedWorks, listPosts } from '../lib/content'
import { formatDate, pad2 } from '../lib/format'
import { asset } from '../lib/url'

export function Home() {
  const settings = getSettings()
  const featured = listFeaturedWorks()
  const lead = featured[0]
  const rest = featured.slice(1)
  const posts = listPosts().slice(0, 3)

  return (
    <>
      {/* 첫 화면: 들어오자마자 보이는 한 화면 안에 HHSS 소개만 — 잘리는 사진·글 없이 */}
      <section className="home-hero" aria-labelledby="home-hero-title">
        <div className="container home-hero__inner">
          <img className="home-hero__avatar hero-line" style={{ ['--i' as string]: 0 }} src={asset('brand/hhss-character.jpg')} alt="" width="480" height="480" />
          <h1 id="home-hero-title" className="home-hero__title hero-line" style={{ ['--i' as string]: 1 }}>
            <img src={asset('brand/hhss-logo.png')} alt="HHSS" />
            <span className="home-hero__studio">STUDIO</span>
          </h1>
          <p className="home-hero__lead hero-line" style={{ ['--i' as string]: 2 }}>
            {settings.heroIntro}
            <br />
            <strong>{settings.heroEmphasis}</strong>
          </p>
          <div className="home-hero__actions hero-line" style={{ ['--i' as string]: 3 }}>
            <Link to="/works" className="pill pill--solid" viewTransition>작품 보기 <span aria-hidden="true">→</span></Link>
            <Link to="/photography" className="pill pill--solid" viewTransition>촬영 기록 <span aria-hidden="true">→</span></Link>
            <Link to="/about" className="pill" viewTransition>소개 <span aria-hidden="true">→</span></Link>
            {settings.social.youtube && (
              <a href={settings.social.youtube} className="pill" target="_blank" rel="noopener noreferrer">YouTube <span aria-hidden="true">↗</span></a>
            )}
          </div>
        </div>
        <a href="#home-works-start" className="home-hero__scroll meta" aria-label="대표 작품으로 내려가기">SCROLL <span aria-hidden="true">↓</span></a>
      </section>
      <span id="home-works-start" />

      {!lead ? (
        <p className="container empty hand">아직 공개된 작품이 없습니다.</p>
      ) : (
        <section className="section container card" aria-labelledby="home-lead">
          <hr className="rule" data-reveal />
          <div className="section__head">
            <h2 id="home-lead" data-reveal>대표 작품</h2>
          </div>
          <Link to={`/works/${lead.slug}`} viewTransition>
            <MediaFrame media={lead.cover} />
            <div className="card__head">
              <span className="card__no">{pad2(1)}</span>
              <h3 className="card__title">{lead.title}</h3>
            </div>
            <p className="caption">{lead.summary}</p>
            <p className="meta">{[lead.workType, lead.genre, lead.runtime, lead.release].filter(Boolean).join(' · ')}</p>
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
              <Card key={w.slug} to={`/works/${w.slug}`} index={i + 1} title={w.title} sub={[w.year, w.workType, w.runtime].filter(Boolean).join(" · ")} media={w.cover} />
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
