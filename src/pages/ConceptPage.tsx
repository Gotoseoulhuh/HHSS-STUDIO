import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ConceptDiagram } from '../components/ConceptDiagram'
import { Disclosure } from '../components/Disclosure'
import { MediaFrame } from '../components/MediaFrame'
import { conceptSeries } from '../data/concepts'
import type { Concept, ConceptScene } from '../data/types'

const I = (i: number) => ({ ['--i' as string]: i })

function Scene({ s }: { s: ConceptScene }) {
  return (
    <figure className="scene">
      {s.diagram ? (
        <div className="frame scene__frame"><ConceptDiagram name={s.diagram} label={`${s.title}: ${s.caption}`} /></div>
      ) : s.media ? (
        <MediaFrame media={s.media} className="scene__frame" />
      ) : null}
      <figcaption className="scene__cap">
        <span className="scene__nm">{s.title}</span>
        {s.source && <span className="meta">{s.source}</span>}
        {s.caption && <span className="scene__desc">{s.caption}</span>}
      </figcaption>
    </figure>
  )
}

/** 영화 개념 한 편 — 스크롤하는 슬라이드 묶음 */
export function ConceptPage({ c }: { c: Concept }) {
  // 이 페이지에서만 스크롤 스냅 (떠나면 풀림)
  useEffect(() => {
    const root = document.documentElement
    root.classList.add('snap')
    return () => root.classList.remove('snap')
  }, [])

  const idx = conceptSeries.findIndex((s) => s.slug === c.slug)
  const next = conceptSeries[idx + 1]

  return (
    <article className="container concept">
      {/* 표지 */}
      <section className="concept-cover">
        <Link to="/journal?tab=concept" className="concept-back meta" viewTransition>← 글 · 개념</Link>
        <span className="concept-cover__tag" data-reveal>Concept {c.no} · {c.nameEn}</span>
        <h1 className="concept-cover__title" data-reveal style={I(1)}>
          {c.cover.before}<strong>{c.cover.strong}</strong>
          {c.cover.after.split('\n').map((line, i) => <span key={i}>{i > 0 && <br />}{line}</span>)}
        </h1>
        <p className="concept-pills" data-reveal style={I(2)}>
          {c.coverMeta.map((m, i) => <span key={m} className="concept-pill">{i === 0 && <span className="concept-pill__dot" aria-hidden="true" />}{m}</span>)}
        </p>
        <span className="concept-cover__scroll meta" aria-hidden="true" data-reveal style={I(3)}>Scroll ↓</span>
      </section>

      {/* 1. 정의 + 비유 */}
      <section className="concept-slide" aria-labelledby="c-def">
        <header className="bi-head" data-reveal>
          <h2 className="bi-head__ko" id="c-def">{c.headline}</h2>
          <span className="bi-head__en">{c.no} · {c.nameEn}</span>
        </header>
        <div data-reveal style={I(1)}>
          <p className="concept-title">{c.nameKo}<small>{c.nameEn} — {c.tagline}</small></p>
        </div>
        <div className="concept-def" data-reveal style={I(2)}>
          {c.definition.map((p, i) => <p key={i}>{p}</p>)}
        </div>
        <div className="metaphor" data-reveal style={I(3)}>
          <span className="sub-label">Metaphor · 비유</span>
          <p className="metaphor__name">{c.metaphor.name}</p>
          <p className="metaphor__desc">{c.metaphor.desc}</p>
        </div>
      </section>

      {/* 2. 다섯 요소 */}
      <section className="concept-slide" aria-labelledby="c-el">
        <header className="bi-head" data-reveal>
          <h2 className="bi-head__ko" id="c-el">{c.elements.heading}</h2>
          <span className="bi-head__en">{c.elements.title}</span>
        </header>
        <p className="concept-lead hand" data-reveal style={I(1)}>{c.elements.sub}</p>
        <Disclosure idPrefix="el" items={c.elements.items.map((e) => ({ no: e.no, label: e.label, en: e.en, body: e.body }))} />
      </section>

      {/* 3. 예시 장면 */}
      <section className="concept-slide" aria-labelledby="c-ex">
        <header className="bi-head" data-reveal>
          <h2 className="bi-head__ko" id="c-ex">{c.examples.heading}</h2>
          <span className="bi-head__en">Example Scenes</span>
        </header>
        <p className="concept-lead hand" data-reveal style={I(1)}>{c.examples.sub}</p>
        {c.examples.pairs.map((pair, pi) => (
          <div className="scene-pair" key={pair.label} data-reveal style={I(2 + pi)}>
            <span className="sub-label">{pair.label}</span>
            <div className="scene-grid">
              {pair.scenes.map((s) => <Scene key={s.title} s={s} />)}
            </div>
          </div>
        ))}
        <p className="concept-quote" data-reveal>{c.examples.note}</p>
        {c.examples.stills.length > 0 && (
          <div className="scene-pair" data-reveal>
            <span className="sub-label">HHSS 작품에서 찾아보기</span>
            <div className="scene-grid">
              {c.examples.stills.map((s, i) => <Scene key={i} s={{ ...s, title: s.caption, caption: '' }} />)}
            </div>
          </div>
        )}
      </section>

      {/* 4. 자주 하는 실수 */}
      <section className="concept-slide" aria-labelledby="c-mis">
        <header className="bi-head" data-reveal>
          <h2 className="bi-head__ko" id="c-mis">{c.mistakes.heading}</h2>
          <span className="bi-head__en">Common Mistakes</span>
        </header>
        <ol className="mistakes">
          {c.mistakes.items.map((m, i) => (
            <li key={m.wrong} className="mistake" data-reveal style={I(i)}>
              <p className="mistake__wrong"><span className="mistake__mark" aria-hidden="true">✕</span>{m.wrong}</p>
              <p className="mistake__why hand">{m.why}</p>
              <p className="mistake__fix"><span className="sub-label">이렇게 고쳐요</span><span className="hand">{m.fix}</span></p>
            </li>
          ))}
        </ol>
      </section>

      {/* 5. 직접 해 보기 */}
      <section className="concept-slide" aria-labelledby="c-mi">
        <header className="bi-head" data-reveal>
          <h2 className="bi-head__ko" id="c-mi">{c.missions.heading}</h2>
          <span className="bi-head__en">Mission</span>
        </header>
        <div className="missions">
          {c.missions.items.map((m, i) => (
            <div key={m.title} className="mission" data-reveal style={I(i)}>
              <span className="sub-label">Mission {String(i + 1).padStart(2, '0')}</span>
              <h3 className="mission__title">{m.title}</h3>
              <p className="hand">{m.desc}</p>
              <ul className="mission__checks">
                {m.checks.map((ch) => <li key={ch} className="hand">{ch}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* 6. 시리즈 목차 */}
      <section className="concept-slide" aria-labelledby="c-se">
        <header className="bi-head" data-reveal>
          <h2 className="bi-head__ko" id="c-se">영화를 읽는 여섯 가지 눈</h2>
          <span className="bi-head__en">Series</span>
        </header>
        <Disclosure
          idPrefix="se"
          items={conceptSeries.map((s) => ({
            no: s.no,
            label: s.label,
            current: s.slug === c.slug,
            body: (
              <>
                {s.body}
                <span className="disc__status meta">{s.slug === c.slug ? '지금 보고 있는 개념' : s.slug ? <Link to={`/journal/${s.slug}`} viewTransition>읽으러 가기 →</Link> : '준비 중'}</span>
              </>
            ),
          }))}
        />
        {next && (
          <div className="concept-next" data-reveal>
            <span className="meta">Next · {next.no}</span>
            <span className="concept-next__title">{next.label}<span className="concept-next__arrow" aria-hidden="true">→</span></span>
            <span className="caption">{next.slug ? '' : '다음 개념은 준비 중입니다.'}</span>
          </div>
        )}
      </section>
    </article>
  )
}
