import { Link } from 'react-router-dom'
import { MediaFrame } from '../components/MediaFrame'
import { festival } from '../data/festival'
import { pad2 } from '../lib/format'
import { festivalDateLine, festivalPhase, formatFestivalDay, listFestivalFilms } from '../lib/festival'

const PHASE_LABEL = { before: '상영 예정', during: '지금 상영 중', after: '상영 종료' } as const

/** 영화제 페이지: QR로 바로 들어오는 곳. 일정·상영작·시간표 */
export function Festival() {
  const films = listFestivalFilms()
  const phase = festivalPhase()
  const days = [...festival.days].sort()

  return (
    <>
      <header className="page-head container fest-head">
        <span className="page-head__index" data-reveal>{festival.nameEn}</span>
        <h1 data-reveal style={{ ['--i' as string]: 1 }}>{festival.name}</h1>
        <p className="fest-head__when" data-reveal style={{ ['--i' as string]: 2 }}>
          <span className={`fest-badge fest-badge--${phase}`}>{PHASE_LABEL[phase]}</span>
          <span>{festivalDateLine()}</span>
          {festival.venue && <span>{festival.venue}</span>}
        </p>
        <p className="hand prose" data-reveal style={{ ['--i' as string]: 3 }}>{festival.intro}</p>
        <hr className="rule" data-reveal />
      </header>

      <section className="container fest-section" aria-labelledby="fest-lineup">
        <div className="section__head">
          <h2 id="fest-lineup" data-reveal>상영작</h2>
          <span className="meta">{pad2(films.length)} FILMS</span>
        </div>
        {films.length === 0 ? (
          <p className="empty hand">상영작은 곧 공개됩니다.</p>
        ) : (
          <ul className="fest-films">
            {films.map((f, i) => (
              <li key={f.key} className="fest-film card" data-reveal style={{ ['--i' as string]: i % 4 }}>
                {f.to ? (
                  <Link to={f.to} viewTransition>
                    {f.cover && <div className="card__media"><MediaFrame media={f.cover} eager={i === 0} /></div>}
                    <div className="card__head">
                      <span className="card__no">{pad2(i + 1)}</span>
                      <h3 className="card__title">{f.title}</h3>
                      <span className="card__arrow" aria-hidden="true">→</span>
                    </div>
                    {f.summary && <p className="hand">{f.summary}</p>}
                    {f.sub && <p className="caption">{f.sub}</p>}
                  </Link>
                ) : (
                  <div className="fest-film__plain">
                    <div className="card__head">
                      <span className="card__no">{pad2(i + 1)}</span>
                      <h3 className="card__title">{f.title}</h3>
                    </div>
                    {f.sub && <p className="caption">{f.sub}</p>}
                  </div>
                )}
                {(f.to || f.watchUrl) && (
                  <p className="fest-film__actions">
                    {f.to && <Link to={f.to} className="btn" viewTransition>작품 소개 →</Link>}
                    {f.watchUrl && <a href={f.watchUrl} className="btn" target="_blank" rel="noopener noreferrer">영화 보기 ↗</a>}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {festival.timetable.length > 0 && (
        <section className="container fest-section" aria-labelledby="fest-time">
          <hr className="rule" data-reveal />
          <div className="section__head">
            <h2 id="fest-time" data-reveal>상영 시간표</h2>
          </div>
          <div className="fest-days">
            {days.map((day) => {
              const slots = festival.timetable.filter((s) => s.day === day).sort((a, b) => a.time.localeCompare(b.time))
              if (slots.length === 0) return null
              return (
                <div key={day} className="fest-day" data-reveal>
                  <h3 className="fest-day__title">{formatFestivalDay(day)}</h3>
                  <ul className="fest-day__list">
                    {slots.map((s) => (
                      <li key={s.time + s.title}>
                        <span className="fest-day__time">{s.time}</span>
                        <span className="fest-day__film">{s.title}</span>
                        {s.note && <span className="caption">{s.note}</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </section>
      )}

      <section className="container fest-section fest-more">
        <hr className="rule" data-reveal />
        <p className="hand" data-reveal>영화를 보셨다면 방명록에 한마디 남겨 주세요.</p>
        <p className="fest-more__actions" data-reveal>
          <Link to="/guestbook" className="pill pill--solid" viewTransition>방명록 쓰기 <span aria-hidden="true">→</span></Link>
          <Link to="/works" className="pill" viewTransition>다른 작품 보기 <span aria-hidden="true">→</span></Link>
        </p>
      </section>
    </>
  )
}
