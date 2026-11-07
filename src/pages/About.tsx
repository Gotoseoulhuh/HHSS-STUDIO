import { Link } from 'react-router-dom'
import { MediaFrame } from '../components/MediaFrame'
import { PageHead } from '../components/PageHead'
import { getProfile } from '../lib/content'

export function About() {
  const p = getProfile()
  return (
    <>
      <PageHead index="05 — ABOUT" title="소개" />
      <div className="container editorial">
        <aside className="editorial__aside" data-reveal>
          <h2 style={{ fontSize: 'var(--fs-h2)' }}>{p.name}</h2>
          <p className="hand" style={{ marginTop: 12 }}>{p.shortBio}</p>
          {p.fields.length > 0 && <p className="meta" style={{ marginTop: 16 }}>{p.fields.join(' · ')}</p>}
          {/* 연락처·외부 링크: 공개로 고른 항목만 */}
          {p.email && <p style={{ marginTop: 16 }}><a href={`mailto:${p.email}`}>{p.email}</a></p>}
          {p.links.map((l) => <p key={l.url}><a href={l.url} rel="noopener noreferrer" target="_blank">{l.label} ↗</a></p>)}
        </aside>
        <div>
          {p.longBio.length > 0 && (
            <div className="prose hand" data-reveal>
              {p.longBio.map((para, i) => <p key={i}>{para}</p>)}
            </div>
          )}
          {p.activities.length > 0 && (
            <section aria-labelledby="about-activities">
              <h2 id="about-activities" className="page-head__index" data-reveal>활동</h2>
              <ul className="row-list activity-list">
                {p.activities.map((a, i) => {
                  const body = (
                    <>
                      <span className="meta">{a.date}</span>
                      <h3>{a.title}</h3>
                      {a.detail && <p className="caption row-sub">{a.detail}</p>}
                      {a.media && <div className="row-sub activity-media"><MediaFrame media={a.media} fit="contain" /></div>}
                    </>
                  )
                  return (
                    <li key={a.title} data-reveal style={{ ['--i' as string]: i }}>
                      {a.workSlug ? <Link to={`/works/${a.workSlug}`} viewTransition>{body}</Link> : <div className="row">{body}</div>}
                    </li>
                  )
                })}
              </ul>
            </section>
          )}
        </div>
      </div>
    </>
  )
}
