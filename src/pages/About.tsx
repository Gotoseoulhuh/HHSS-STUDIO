import { useRef, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { MediaFrame } from '../components/MediaFrame'
import { PageHead } from '../components/PageHead'
import { SocialIcon } from '../components/SocialLinks'
import { findWorkSlugByTitle, getFilmography, getProfile, shown } from '../lib/content'
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
function Row(props: { left?: string; live?: boolean; title: string; sub?: string; side?: string | null; to?: string; children?: ReactNode; i: number; reveal?: boolean }) {
  const { left, live, title, sub, side, to, children, i, reveal = true } = props
  const body = (
    <>
      {left !== undefined && <span className={`meta film-when${live ? ' is-live' : ''}`}>{left}</span>}
      <h3>{title}{to && <span className="film-arrow" aria-hidden="true"> →</span>}</h3>
      {sub && <p className="caption row-sub">{sub}</p>}
      {children}
      {side && <span className="meta film-side">{side}</span>}
    </>
  )
  const cls = `film-row${left === undefined ? ' film-row--noleft' : ''}`
  return (
    <li {...(reveal ? { 'data-reveal': '' } : {})} style={{ ['--i' as string]: Math.min(i, 4) }}>
      {to ? <Link to={to} viewTransition className={cls}>{body}</Link> : <div className={cls}>{body}</div>}
    </li>
  )
}

/** 초안 묶음 표시 — 개발 화면에서만 나옴 */
function DraftNote({ on }: { on: boolean }) {
  return on ? <p className="draft-note">초안 · 개발 화면에서만 보여요. 글을 채우고 site.ts에서 draft 줄을 지우면 공개됩니다.</p> : null
}

function Badges({ items }: { items: string[] }) {
  if (items.length === 0) return null
  return <p className="row-sub film-badges">{items.map((b) => <span key={b} className="film-badge">{b}</span>)}</p>
}

export function About() {
  const p = getProfile()
  const pastRef = useRef<HTMLDetailsElement>(null)
  const historyRef = useRef<HTMLDetailsElement>(null)
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
  const screenings: { key: string; year: number; name: string; sub: string; venue: string | null; detail?: string; media?: MediaRef; photos?: MediaRef[] }[] = [
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

  // 경력: status가 '현재'면 현재 경력, 그 밖('이전' 등)은 이전 경력 — 이전 경력은 접어 둠
  const currentCareer = f.about.filter((a) => a.status === '현재')
  const pastCareer = f.about.filter((a) => a.status !== '현재')
  const careerSide = (a: { text: string; org: string | null }) => (a.org && !a.text.includes(a.org) ? a.org : null)

  // 틀만 있는 묶음: 초안(draft)은 개발 화면에서만
  const thoughts = p.thoughts.filter(shown)
  const topics = p.topics && shown(p.topics) ? p.topics : null
  const people = p.people.filter(shown)

  // 연혁: 발령한 해부터 올해까지, 해마다 있었던 일을 필모그래피에서 자동으로 모음 + 손으로 넣은 항목(profile.history)
  const startYear = Number(p.teachingSince.slice(0, 4))
  const historyRows: { year: number; order: number; kind: string; title: string; sub?: string }[] = [
    ...p.history.filter(shown).map((h) => ({ year: h.year, order: 0, kind: '', title: h.title, sub: h.sub })),
    // 현재 경력: '… (2023~)'의 시작 연도
    ...f.about.flatMap((a) => {
      const m = a.text.match(/\s*\((\d{4})\s*~[^)]*\)\s*$/)
      return m ? [{ year: Number(m[1]), order: 1, kind: '시작', title: a.text.replace(m[0], '') }] : []
    }),
    ...awards.map((a) => ({ year: a.year, order: 3, kind: '수상', title: a.name, sub: `〈${a.title}〉` })),
    ...f.honors.map((h) => ({ year: h.year, order: 4, kind: '표창', title: h.name, sub: h.org ?? undefined })),
    ...f.events.map((e) => ({ year: e.year, order: 5, kind: SCREENING_TYPE[e.type] ?? '행사', title: e.name, sub: e.venue ?? undefined })),
  ]
  const worksByYear = new Map<number, string[]>()
  for (const w of f.works) if (w.year != null) worksByYear.set(w.year, [...(worksByYear.get(w.year) ?? []), w.title])
  for (const [year, titles] of worksByYear) historyRows.push({ year, order: 2, kind: '작품', title: `작품 ${titles.length}편`, sub: titles.map((t) => `〈${t}〉`).join(' ') })
  const historyYears = [...new Set(historyRows.map((r) => r.year))].filter((y) => y >= startYear).sort((a, b) => a - b)
    .map((year) => ({ year, rows: historyRows.filter((r) => r.year === year).sort((a, b) => a.order - b.order) }))

  const sections = [
    thoughts.length > 0 && { id: 'about-thoughts', label: '생각' },
    f.about.length > 0 && { id: 'about-career', label: '경력' },
    historyYears.length > 0 && { id: 'about-history', label: '연혁' },
    groups.length > 0 && { id: 'about-filmography', label: '필모그래피' },
    (awards.length > 0 || f.honors.length > 0) && { id: 'about-awards', label: '수상' },
    screenings.length > 0 && { id: 'about-screenings', label: '상영·방영' },
    topics && { id: 'about-topics', label: '이야기' },
    people.length > 0 && { id: 'about-people', label: '사람들' },
  ].filter(Boolean) as { id: string; label: string }[]

  return (
    <>
      <PageHead index="05 — ABOUT" title="소개" />
      <div className="container editorial">
        <aside className="editorial__aside" data-reveal>
          <h2 style={{ fontSize: 'var(--fs-h2)' }}>{p.name}</h2>
          <p className="hand" style={{ marginTop: 12 }}>{p.shortBio}</p>
          {p.fields.length > 0 && <p className="meta about-fields" style={{ marginTop: 16 }}>{p.fields.map((x, i) => <span key={x}>{i > 0 && ' · '}<span className="nowrap">{x}</span></span>)}</p>}
          {/* 연락처·외부 링크: 공개로 고른 항목만 */}
          <ul className="about-contacts">
            {p.email && <li><a href={'mailto:' + p.email}>{SocialIcon.email}{p.email}</a></li>}
            {p.links.map((l) => (
              <li key={l.url}>
                <a href={l.url} rel="noopener noreferrer" target="_blank">
                  {/youtube/.test(l.url) ? SocialIcon.youtube : /instagram/.test(l.url) ? SocialIcon.instagram : null}
                  {l.label} <span aria-hidden="true">↗</span>
                </a>
              </li>
            ))}
          </ul>
          {sections.length > 1 && (
            <nav className="about-jump" aria-label="소개 바로가기">
              {sections.map((s) => (
                <a key={s.id} href={`#${s.id}`} className="meta"
                  // '경력' 바로가기로 오면 이전 경력도, '연혁' 바로가기로 오면 연혁도 펼쳐서 보여 줌
                  onClick={s.id === 'about-career' ? () => { if (pastRef.current) pastRef.current.open = true }
                    : s.id === 'about-history' ? () => { if (historyRef.current) historyRef.current.open = true } : undefined}>{s.label}</a>
              ))}
            </nav>
          )}
        </aside>
        <div className="about-body">
          {p.longBio.length > 0 && (
            <div className="prose hand" data-reveal>
              {p.longBio.map((para, i) => <p key={i}>{para}</p>)}
            </div>
          )}

          {thoughts.length > 0 && (
            <section id="about-thoughts" className="about-section" aria-labelledby="about-thoughts-h">
              <h2 id="about-thoughts-h" className="page-head__index" data-reveal>생각</h2>
              <DraftNote on={thoughts.some((t) => t.draft)} />
              <ol className="thoughts">
                {thoughts.map((t, i) => (
                  <li key={i} className="thought" data-reveal>
                    <span className="thought__no" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                    <h3 className="thought__title">{t.title}</h3>
                    {t.lead && <p className="thought__lead">{t.lead}</p>}
                    {t.body.length > 0 && <div className="thought__body hand">{t.body.map((para, j) => <p key={j}>{para}</p>)}</div>}
                  </li>
                ))}
              </ol>
            </section>
          )}

          {f.about.length > 0 && (
            <section id="about-career" className="about-section" aria-labelledby="about-career-h">
              <h2 id="about-career-h" className="page-head__index" data-reveal>경력</h2>
              {currentCareer.length > 0 && (
                <div className="film-group">
                  <h3 className="film-group__label" data-reveal>현재</h3>
                  <ul className="row-list film-list">
                    {currentCareer.map((a, i) => <Row key={a.text} i={i} title={a.text} side={careerSide(a)} />)}
                  </ul>
                </div>
              )}
              {pastCareer.length > 0 && (
                // 접기·펼치기(아코디언): 브라우저 기본 <details>라 키보드·화면낭독기도 그대로 동작
                <details ref={pastRef} className="career-past">
                  <summary className="career-past__toggle meta">
                    <span className="career-past__open">이전 경력 살펴보기</span>
                    <span className="career-past__close">이전 경력 접기</span>
                    <span className="career-past__count">{pastCareer.length}</span>
                    <span className="career-past__chev" aria-hidden="true">↓</span>
                  </summary>
                  <div className="film-group career-past__body">
                    <h3 className="film-group__label film-group__label--dim">이전</h3>
                    <ul className="row-list film-list">
                      {pastCareer.map((a, i) => <Row key={a.text} i={i} reveal={false} title={a.text} side={careerSide(a)} />)}
                    </ul>
                  </div>
                </details>
              )}
              {historyYears.length > 0 && (
                // 연혁: 경력 틀은 그대로 두고, 버튼을 눌렀을 때만 발령한 해부터 올해까지 펼쳐 보임
                <details ref={historyRef} id="about-history" className="career-past career-history">
                  <summary className="career-past__toggle meta">
                    <span className="career-past__open">{startYear}년부터 연혁 살펴보기</span>
                    <span className="career-past__close">연혁 접기</span>
                    <span className="career-past__chev" aria-hidden="true">↓</span>
                  </summary>
                  <div className="film-group career-past__body">
                    <ul className="row-list film-list">
                      {historyYears.flatMap(({ year, rows }) => [
                        <li key={`y-${year}`} className="film-year"><span className="film-year__num">{year}</span></li>,
                        ...rows.map((r, i) => <Row key={`${year}-${i}`} i={i} reveal={false} left={r.kind} title={r.title} sub={r.sub} />),
                      ])}
                    </ul>
                  </div>
                </details>
              )}
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
                    {s.photos && (
                      <div className="row-sub activity-photos">
                        {s.photos.map((ph) => (
                          <figure key={ph.src}>
                            <MediaFrame media={ph} />
                            {ph.caption && <figcaption className="caption">{ph.caption}</figcaption>}
                          </figure>
                        ))}
                      </div>
                    )}
                  </Row>
                ))}
              </ul>
            </section>
          )}

          {topics && (
            <section id="about-topics" className="about-section" aria-labelledby="about-topics-h">
              <h2 id="about-topics-h" className="page-head__index" data-reveal>이야기 나눌 것들 <span className="nowrap">/ {topics.items.length}</span></h2>
              <DraftNote on={!!topics.draft} />
              <div className="topics" data-reveal>
                <h3 className="topics__heading">{topics.heading}</h3>
                {topics.intro && <p className="topics__intro hand">{topics.intro}</p>}
                <ul className="topics__list">
                  {topics.items.map((it) => <li key={it}>{it}</li>)}
                </ul>
              </div>
            </section>
          )}

          {people.length > 0 && (
            <section id="about-people" className="about-section" aria-labelledby="about-people-h">
              <h2 id="about-people-h" className="page-head__index" data-reveal>영향을 준 사람들</h2>
              <DraftNote on={people.some((x) => x.draft)} />
              <ul className="people">
                {people.map((x, i) => {
                  const body = (
                    <>
                      {x.tag && <span className="person__tag">{x.tag}</span>}
                      <h3 className="person__name">{x.name}{x.url && <span className="person__arrow" aria-hidden="true"> ↗</span>}</h3>
                      <p className="person__intro hand">{x.intro}</p>
                    </>
                  )
                  return (
                    <li key={x.name} data-reveal style={{ ['--i' as string]: Math.min(i, 4) }}>
                      {x.url
                        ? <a className="person" href={x.url} target="_blank" rel="noopener noreferrer">{body}</a>
                        : <div className="person">{body}</div>}
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
