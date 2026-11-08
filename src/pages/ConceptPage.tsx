import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ConceptDiagram } from '../components/ConceptDiagram'
import { ConceptToc, type TocItem } from '../components/ConceptToc'
import { Disclosure } from '../components/Disclosure'
import { MediaFrame } from '../components/MediaFrame'
import { PaletteViewer, type PaletteFilm } from '../components/PaletteViewer'
import { Rich } from '../components/Rich'
import { conceptSeries } from '../data/concepts'
import type { Concept, ConceptScene } from '../data/types'

const I = (i: number) => ({ ['--i' as string]: i })

/**
 * 예시 장면 카드. 실제 HHSS 장면(still)이 있으면 그림 ↔ 장면을 번갈아 본다.
 * - 마우스: 올리면 반대쪽을 미리 보고, 누르면 그 상태로 고정
 * - 터치·키보드: 누를 때마다 바뀜
 */
function Scene({ s, front }: { s: ConceptScene; front: 'diagram' | 'still' }) {
  const [flipped, setFlipped] = useState(false)
  const diagram = (
    <div className="frame scene__frame"><ConceptDiagram name={s.diagram} label={`그림 — ${s.title}: ${s.caption}`} /></div>
  )
  const diagramCap = (
    <>
      <span className="scene__nm">{s.title}</span>
      <span className="scene__desc">{s.caption}</span>
    </>
  )
  if (!s.still) {
    return (
      <figure className="scene">
        {diagram}
        <figcaption className="scene__cap">{diagramCap}<span className="meta scene__tag">그림</span></figcaption>
      </figure>
    )
  }

  const still = <MediaFrame media={s.still.media} className="scene__frame" />
  const stillCap = (
    <>
      <span className="scene__nm">{s.still.work}</span>
      <span className="scene__desc">{s.still.note}</span>
    </>
  )
  const [a, b] = front === 'diagram' ? [diagram, still] : [still, diagram]
  const [capA, capB] = front === 'diagram' ? [diagramCap, stillCap] : [stillCap, diagramCap]
  const altName = front === 'diagram' ? 'HHSS 장면' : '그림'
  const mainName = front === 'diagram' ? '그림' : 'HHSS 장면'

  return (
    <figure className="scene scene--flip" data-flipped={flipped}>
      <button type="button" className="scene__toggle" aria-pressed={flipped} onClick={() => setFlipped((v) => !v)}
        aria-label={`${s.title} — ${flipped ? mainName : altName}으로 바꿔 보기`}>
        <span className="scene__stack">
          <span className="scene__side scene__side--a">{a}</span>
          <span className="scene__side scene__side--b">{b}</span>
        </span>
        <span className="scene__badge meta" aria-hidden="true">
          <span className="scene__side--a">{altName} 보기 ↻</span>
          <span className="scene__side--b">{mainName}으로 ↻</span>
        </span>
      </button>
      <figcaption className="scene__cap">
        <span className="scene__capside scene__side--a">{capA}</span>
        <span className="scene__capside scene__side--b">{capB}</span>
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
  const [viewing, setViewing] = useState<PaletteFilm | null>(null)

  const toc: TocItem[] = [
    { id: 's-def', label: `${c.nameKo}란?` },
    { id: 's-el', label: c.elements.heading },
    { id: 's-ex', label: '예시 장면' },
    ...(c.palette ? [{ id: 's-pal', label: '영화마다 다른 색' }] : []),
    { id: 's-mis', label: '자주 하는 실수' },
    { id: 's-mi', label: c.missions.heading },
    ...(c.onSet ? [{ id: 's-on', label: 'HHSS 촬영장에서' }] : []),
    { id: 's-se', label: '시리즈 목차' },
  ]

  return (
    <article className="container concept">
      <ConceptToc items={toc} />
      <PaletteViewer film={viewing} onClose={() => setViewing(null)} />
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
      <section className="concept-slide" id="s-def" aria-labelledby="c-def">
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
        {c.hook && (
          <div className="concept-hook" data-reveal style={I(3)}>
            <span className="sub-label">{c.hook.lead}</span>
            <p className="concept-hook__text"><Rich text={c.hook.text} /></p>
          </div>
        )}
        <div className="metaphor" data-reveal style={I(4)}>
          <span className="sub-label">Metaphor · 비유</span>
          <p className="metaphor__name">{c.metaphor.name}</p>
          <p className="metaphor__desc">{c.metaphor.desc}</p>
        </div>
      </section>

      {/* 2. 다섯 요소 */}
      <section className="concept-slide" id="s-el" aria-labelledby="c-el">
        <header className="bi-head" data-reveal>
          <h2 className="bi-head__ko" id="c-el">{c.elements.heading}</h2>
          <span className="bi-head__en">{c.elements.title}</span>
        </header>
        <p className="concept-lead hand" data-reveal style={I(1)}>{c.elements.sub}</p>
        <Disclosure idPrefix="el" items={c.elements.items.map((e) => ({ no: e.no, label: e.label, en: e.en, body: <Rich text={e.body} /> }))} />
      </section>

      {/* 3. 예시 장면 */}
      <section className="concept-slide" id="s-ex" aria-labelledby="c-ex">
        <header className="bi-head" data-reveal>
          <h2 className="bi-head__ko" id="c-ex">{c.examples.heading}</h2>
          <span className="bi-head__en">Example Scenes</span>
        </header>
        <p className="concept-lead hand" data-reveal style={I(1)}>{c.examples.sub}</p>
        {c.examples.pairs.map((pair, pi) => (
          <div className="scene-pair" key={pair.label} data-reveal style={I(2 + pi)}>
            <span className="sub-label">{pair.label}</span>
            <div className="scene-grid">
              {pair.scenes.map((s) => <Scene key={s.title} s={s} front={c.examples.front} />)}
            </div>
          </div>
        ))}
        <p className="concept-quote" data-reveal>{c.examples.note}</p>
      </section>

      {/* 3-1. 영화마다 다른 색 */}
      {c.palette && (
        <section className="concept-slide" id="s-pal" aria-labelledby="c-pal">
          <header className="bi-head" data-reveal>
            <h2 className="bi-head__ko" id="c-pal">{c.palette.heading}</h2>
            <span className="bi-head__en">Color · HHSS Films</span>
          </header>
          <p className="concept-lead hand" data-reveal style={I(1)}>{c.palette.sub}</p>
          <ul className="palettes">
            {c.palette.films.map((f, i) => (
              <li key={f.slug} data-reveal style={I(i)}>
                <button type="button" className="palette" onClick={() => setViewing(f)} aria-haspopup="dialog">
                  <MediaFrame media={f.media} className="palette__img" />
                  <span className="palette__swatches" aria-hidden="true">
                    {f.colors.map((col) => <span key={col.hex} style={{ background: col.hex, flexGrow: col.pct }} />)}
                  </span>
                  <span className="palette__cap">
                    <span className="palette__title">{f.title}</span>
                    <span className="meta">{f.year}</span>
                    <span className="palette__mood">{f.mood}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <p className="caption" data-reveal>{c.palette.note}</p>
        </section>
      )}

      {/* 4. 자주 하는 실수 */}
      <section className="concept-slide" id="s-mis" aria-labelledby="c-mis">
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
      <section className="concept-slide" id="s-mi" aria-labelledby="c-mi">
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

      {/* 5-1. HHSS 촬영장에서 */}
      {c.onSet && (
        <section className="concept-slide" id="s-on" aria-labelledby="c-on">
          <header className="bi-head" data-reveal>
            <h2 className="bi-head__ko" id="c-on">{c.onSet.heading}</h2>
            <span className="bi-head__en">On Set · HHSS</span>
          </header>
          <div className="concept-def" data-reveal style={I(1)}>
            {c.onSet.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
          </div>
          <ul className="values">
            {c.onSet.values.map((v, i) => (
              <li key={v.label} className="value" data-reveal style={I(i)}>
                <span className="meta">{String(i + 1).padStart(2, '0')}</span>
                <span className="value__label">{v.label}</span>
                <span className="value__desc hand">{v.desc}</span>
              </li>
            ))}
          </ul>
          <p className="concept-quote concept-quote--hand" data-reveal>{c.onSet.closing}</p>
        </section>
      )}

      {/* 6. 시리즈 목차 */}
      <section className="concept-slide" id="s-se" aria-labelledby="c-se">
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
