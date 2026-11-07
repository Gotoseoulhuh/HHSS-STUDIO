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
        </aside>
        <div className="prose hand" data-reveal style={{ ['--i' as string]: 1 }}>
          {p.longBio.map((para, i) => <p key={i}>{para}</p>)}
          {/* 연락처·외부 링크: 공개로 고른 항목만 */}
          {p.email && <p><a href={`mailto:${p.email}`}>{p.email}</a></p>}
          {p.links.map((l) => <p key={l.url}><a href={l.url} rel="noopener noreferrer" target="_blank">{l.label} ↗</a></p>)}
        </div>
      </div>
    </>
  )
}
