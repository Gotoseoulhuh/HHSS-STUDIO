import { Fragment } from 'react'
import type { BehindBlock, CastBlock, GalleryBlock, ListBlock, NoteBlock, StoryBlock, WorkBlock } from '../data/types'
import { pad2 } from '../lib/format'
import { asset } from '../lib/url'
import { ClipScene } from './ClipScene'
import { Gallery } from './Gallery'
import { MediaFrame } from './MediaFrame'

/** 블록 공통 머리: 작은 라벨 + 큰 제목(줄바꿈 유지) */
function BlockHead({ label, heading, id }: { label: string; heading: string; id: string }) {
  return (
    <header className="block__head">
      <hr className="rule" data-reveal />
      <span className="page-head__index" data-reveal>{label}</span>
      <h2 id={id} className="block__title" data-reveal style={{ ['--i' as string]: 1 }}>{heading}</h2>
    </header>
  )
}

function Story({ b, id }: { b: StoryBlock; id: string }) {
  return (
    <>
      <BlockHead label={b.label} heading={b.heading} id={id} />
      <div className="editorial">
        <div className="editorial__aside prose" data-reveal>
          {b.paragraphs.map((p, i) => <p key={i} className="hand">{p}</p>)}
          {b.quote && (
            <blockquote className="pull-quote">
              <p>“{b.quote.text}”</p>
              <cite className="meta">{b.quote.cite}</cite>
            </blockquote>
          )}
        </div>
        {b.media && (
          <div className="story-media">
            {b.media.map((m, i) => (
              <figure key={i} data-reveal style={{ ['--i' as string]: i }}>
                <MediaFrame media={m} />
                {m.caption && <figcaption className="caption">{m.caption}</figcaption>}
              </figure>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

function Cast({ b, id }: { b: CastBlock; id: string }) {
  return (
    <>
      <BlockHead label={b.label} heading={b.heading} id={id} />
      {b.credit && <p className="meta" data-reveal>{b.credit}</p>}
      <ul className="cast-list">
        {b.members.map((m, i) => (
          <li key={m.role} className="cast" data-reveal style={{ ['--i' as string]: i }}>
            <MediaFrame media={m.poster} />
            <div className="cast__body">
              <h3 className="cast__name">{m.role}</h3>
              <p className="meta">{m.actor}</p>
              <p className="cast__quote">“{m.quote}”</p>
              <div className="hand">{m.lines.map((l, j) => <p key={j}>{l}</p>)}</div>
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}

function GalleryB({ b, id }: { b: GalleryBlock; id: string }) {
  return (
    <>
      <BlockHead label={b.label} heading={b.heading} id={id} />
      {b.sub && <p className="hand prose block__sub" data-reveal>{b.sub}</p>}
      {b.groups.map((g) => (
        <div key={g.title} className="gallery-group">
          {(b.groups.length > 1 || g.note || b.layout === 'storyboard') && (
            <div className="gallery-group__head" data-reveal>
              <h3>{g.title}</h3>
              {g.note && <span className="meta">{g.note}</span>}
            </div>
          )}
          <Gallery items={g.items} layout={b.layout} />
        </div>
      ))}
    </>
  )
}

function Note({ b, id }: { b: NoteBlock; id: string }) {
  return (
    <>
      <BlockHead label={b.label} heading={b.heading} id={id} />
      {b.media && (
        <figure className="note__media" data-reveal>
          <MediaFrame media={b.media} />
          {b.media.caption && <figcaption className="caption">{b.media.caption}</figcaption>}
        </figure>
      )}
      <div className="prose prose--note hand">
        {b.paragraphs.map((p, i) => <p key={i} data-reveal>{p}</p>)}
        {b.signature && <p className="signature meta" data-reveal>{b.signature}</p>}
      </div>
    </>
  )
}

function List({ b, id }: { b: ListBlock; id: string }) {
  return (
    <>
      <BlockHead label={b.label} heading={b.heading} id={id} />
      <ol className="thanks-list">
        {b.items.map((t, i) => (
          <li key={i} data-reveal style={{ ['--i' as string]: i }}>
            <span className="card__no">{pad2(i + 1)}</span>
            <p className="hand">{t}</p>
          </li>
        ))}
      </ol>
      {b.signature && <p className="signature meta" data-reveal>{b.signature}</p>}
      {b.media && (
        <div className="story-media story-media--row">
          {b.media.map((m, i) => (
            <figure key={i} data-reveal style={{ ['--i' as string]: i }}>
              <MediaFrame media={m} />
              {m.caption && <figcaption className="caption">{m.caption}</figcaption>}
            </figure>
          ))}
        </div>
      )}
    </>
  )
}

/** 프레임 뒤에서: 대표 스틸컷 + 소개 + 손글씨 소감 + 사인 */
function Behind({ b, id }: { b: BehindBlock; id: string }) {
  return (
    <>
      <BlockHead label={b.label} heading={b.heading} id={id} />
      {b.people.map((p) => {
        const who = (
          <>
            <div className="behind__who" data-reveal>
              <span className="meta">{p.role}</span>
              <h3 className="behind__name">{p.name}</h3>
            </div>
            {p.intro && <p className="hand prose" data-reveal>{p.intro}</p>}
          </>
        )
        return (
        <div key={p.name} className="behind">
          {/* 스틸컷이 없으면 그 자리에 이름·소개가 온다 */}
          {p.still ? (
            <figure className="behind__still" data-reveal>
              <MediaFrame media={p.still} />
              {p.still.caption && <figcaption className="caption">{p.still.caption}</figcaption>}
            </figure>
          ) : (
            <div className="behind__aside">{who}</div>
          )}
          <div className="behind__body">
            {p.still && who}
            {/* 손글씨는 좁은 화면에서 글자가 작아지지 않게 옆으로 밀어 본다 */}
            <div className="behind__letter" data-reveal tabIndex={0} role="group" aria-label={`${p.name}의 손글씨 소감`}>
              <img src={asset(p.letter.src ?? '')} alt={p.letter.alt} loading="lazy" decoding="async" style={{ aspectRatio: String(p.letter.ratio) }} />
            </div>
            <img className="behind__sign" data-reveal src={asset(p.sign.src ?? '')} alt={p.sign.alt} loading="lazy" decoding="async" style={{ aspectRatio: String(p.sign.ratio) }} />
          </div>
        </div>
        )
      })}
    </>
  )
}

export function WorkBlocks({ blocks }: { blocks: WorkBlock[] }) {
  return (
    <>
      {blocks.map((b, i) => {
        const id = `block-${i}`
        return (
          <Fragment key={i}>
          {b.enter?.type === 'clip' && <ClipScene src={b.enter.src} poster={b.enter.poster} label={b.enter.label} />}
          <section className={`block block--${b.type}`} aria-labelledby={id}>
            {b.type === 'story' && <Story b={b} id={id} />}
            {b.type === 'cast' && <Cast b={b} id={id} />}
            {b.type === 'gallery' && <GalleryB b={b} id={id} />}
            {b.type === 'note' && <Note b={b} id={id} />}
            {b.type === 'list' && <List b={b} id={id} />}
            {b.type === 'behind' && <Behind b={b} id={id} />}
          </section>
          </Fragment>
        )
      })}
    </>
  )
}
