import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { MediaFrame } from '../components/MediaFrame'
import { PageHead } from '../components/PageHead'
import { findWorkSlugByTitle, getFilmography, getProfile } from '../lib/content'
import type { FilmWork, MediaRef } from '../data/types'

const SCREENING_TYPE: Record<string, string> = { premiere: '시사회', festival: '영화제', broadcast: '방영', screening: '상영', online: '공개' }

/** 작품 왼쪽 칸: 완성작은 '2026.10.'(강조색), 진행 중이면 상태 문구(회색) */
function when(w: FilmWork, labels: Record<string, string>): { text: string; live: boolean } {
  const st = w.status ? labels[w.status] : ''
  if (st) return { text: st, live: false }
  if (w.year == null) return { text: '—', live: false }
  if (w.year_to && w.year_to !== w.year) return { text: `${w.year}–${w.year_to}`, live: true }
  if (w.month) return { text: `${w.year}.${String(w.month).padStart(2, '0')}.`, live: true }
  return { text: String(w.year), live: true }
}
const fmtDate = (v?: string | null) => (!v ? '' : /^\d{4}-\d{2}-\d{2}$/.test(v) ? v.replace(/-/g, '.') + '.' : v)
const byYearDesc = <T extends { year: number | null }>(a: T, b: T) => (b.year ?? -1) - (a.year ?? -1)

/** 한 줄: 왼쪽 날짜 · 가운데 제목과 설명 · 오른쪽 기관. 작품 상세가 있으면 줄 전체가 링크 */
function Row(props: { left: string; live?: boolean; title: string; sub?: string; side?: string | null; to?: string; children?: ReactNode; i: number }) {
  const { left, live, title, sub, side, to, children, i } = props
  const body = (
    <>
      <span className={`meta film-when${live ? ' is-live' : ''}`}>{left}</span>
      <h3>{title}{to && <span className="film-arrow" aria-hidden="true"> →</span>}</h3>
      {sub && <p className="caption row-sub">{sub}</p>}
      {children}
      {side && <span className="meta film-side">{side}</span>}
    </>
  )
  return (
    <li data-reveal style={{ ['--i' as string]: Math.min(i, 4) }}>
      {to ? <Link to={to} viewTransition className="film-row">{body}</Link> : <div className="film-row">{body}</div>}
    </li>
  )
}

function Badges({ items }: { items: string[] }) {
  if (items.length === 0) return null
  return <p className="row-sub film-badges">{items.map((b) => <span key={b} className="film-badge">{b}</span>)}</p>
}

export function About() {
  const p = getProfile()
  const f = getFilmography()
  const labels = f.meta.status_labels
  const workUrl = (title: string) => { const slug = findWorkSlugByTitle(title); return slug ? `/works/${slug}` : undefined }

  // 작품: 분류별 → 연도 내림차순 → 같은 연도는 월 내림차순
  const groups = Object.entries(f.meta.categories)
    .map(([key, label]) => ({
      key,
      label,
      works: f.works.filter((w) => w.category === key).sort((a, b) => byYearDesc(a, b) || (b.month ?? 0) - (a.month ?? 0) || a.id.localeCompare(b.id)),
    }))
    .filter((g) => g.works.length > 0)

  const awards = f.works.flatMap((w) => w.awards.map((a) => ({ ...a, title: w.title }))).sort(byYearDesc)

  // 상영·방영: 행사(events) + 작품별 방영. 같은 이름이 행사에 있으면 한 번만
  const titleOf = (id: string) => f.works.find((w) => w.id === id)?.title ?? ''
  const screenings: { key: string; year: number; name: string; sub: string; venue: string | null; detail?: string; media?: MediaRef }[] = [
    ...f.events.map((e) => ({
      key: e.id,
      year: e.year,
      name: e.name,
      sub: [SCREENING_TYPE[e.type] ?? e.type, e.works.map(titleOf).filter(Boolean).join(', '), fmtDate(e.date), e.note].filter(Boolean).join(' · '),
      venue: e.venue,
      ...p.eventExtras[e.id],
    })),
  ]
  for (const w of f.works) for (const s of w.screenings) {
    if (screenings.some((x) => x.year === s.year && x.name.includes(s.name))) continue
    screenings.push({ key: `${w.id}-${s.name}`, year: s.year, name: s.name, sub: [SCREENING_TYPE[s.type] ?? s.type, w.title, fmtDate(s.date), s.note].filter(Boolean).join(' · '), venue: s.venue ?? null })
  }
  screenings.sort(byYearDesc)

  const sections = [
    f.about.length > 0 && { id: 'about-career', label: '경력' },
    groups.length > 0 && { id: 'about-filmography', label: '필모그래피' },
    (awards.length > 0 || f.honors.length > 0) && { id: 'about-awards', label: '수상' },
    screenings.length > 0 && { id: 'about-screenings', label: '상영·방영' },
  ].filter(Boolean) as { id: string; label: string }[]

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
          {sections.length > 1 && (
            <nav className="about-jump" aria-label="소개 바로가기">
              {sections.map((s) => <a key={s.id} href={`#${s.id}`} className="meta">{s.label}</a>)}
            </nav>
          )}
        </aside>
        <div className="about-body">
          {p.longBio.length > 0 && (
            <div className="prose hand" data-reveal>
              {p.longBio.map((para, i) => <p key={i}>{para}</p>)}
            </div>
          )}

          {f.about.length > 0 && (
            <section id="about-career" className="about-section" aria-labelledby="about-career-h">
              <h2 id="about-career-h" className="page-head__index" data-reveal>경력</h2>
              <ul className="row-list film-list">
                {f.about.map((a, i) => (
                  <Row key={a.text} i={i} left={a.status ?? ''} live={!!a.status} title={a.text} side={a.org && !a.text.includes(a.org) ? a.org : null} />
                ))}
              </ul>
            </section>
          )}

          {groups.length > 0 && (
            <section id="about-filmography" className="about-section" aria-labelledby="about-filmography-h">
              <h2 id="about-filmography-h" className="page-head__index" data-reveal>필모그래피</h2>
              {groups.map((g) => {
                let lastYear: number | null | undefined
                return (
                  <div key={g.key} className="film-group">
                    <h3 className="film-group__label" data-reveal>{g.label}</h3>
                    <ul className="row-list film-list">
                      {g.works.flatMap((w, i) => {
                        const out = []
                        if (w.year !== lastYear) {
                          lastYear = w.year
                          const note = w.year != null ? f.meta.year_notes[String(w.year)] : ''
                          out.push(
                            <li key={`y-${w.year}`} className="film-year" data-reveal>
                              <span className="film-year__num">{w.year ?? '—'}</span>
                              {note && <span className="caption">{note}</span>}
                            </li>,
                          )
                        }
                        const d = when(w, labels)
                        const badges = [...w.awards.map((a) => a.name), ...w.screenings.filter((s) => s.type === 'broadcast').map((s) => s.name)]
                        out.push(
                          <Row key={w.id} i={i} left={d.text} live={d.live} title={w.title} to={workUrl(w.title)}
                            sub={[w.type, w.genre, w.runtime].filter(Boolean).join(' · ')} side={w.client || w.production}>
                            <Badges items={badges} />
                          </Row>,
                        )
                        return out
                      })}
                    </ul>
                  </div>
                )
              })}
            </section>
          )}

          {(awards.length > 0 || f.honors.length > 0) && (
            <section id="about-awards" className="about-section" aria-labelledby="about-awards-h">
              <h2 id="about-awards-h" className="page-head__index" data-reveal>수상</h2>
              <ul className="row-list film-list">
                {awards.map((a, i) => (
                  <Row key={a.name + a.title} i={i} left={String(a.year)} live title={a.title} sub={a.name} side={a.org} to={workUrl(a.title)} />
                ))}
              </ul>
              {f.honors.length > 0 && (
                <div className="film-group">
                  <h3 className="film-group__label" data-reveal>지도교사 표창</h3>
                  <ul className="row-list film-list">
                    {[...f.honors].sort(byYearDesc).map((h, i) => (
                      <Row key={h.year + h.name} i={i} left={String(h.year)} live title={h.name} side={h.org} />
                    ))}
                  </ul>
                </div>
              )}
            </section>
          )}

          {screenings.length > 0 && (
            <section id="about-screenings" className="about-section" aria-labelledby="about-screenings-h">
              <h2 id="about-screenings-h" className="page-head__index" data-reveal>상영·방영</h2>
              <ul className="row-list film-list">
                {screenings.map((s, i) => (
                  <Row key={s.key} i={i} left={String(s.year)} live title={s.name} sub={s.sub} side={s.venue}>
                    {s.detail && <p className="caption row-sub">{s.detail}</p>}
                    {s.media && <div className="row-sub activity-media"><MediaFrame media={s.media} fit="contain" /></div>}
                  </Row>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </>
  )
}
