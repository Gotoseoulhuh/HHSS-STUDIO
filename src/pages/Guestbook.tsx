import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { PageHead } from '../components/PageHead'
import { favoriteGroups, favoriteStarter, GUEST_FEELINGS, GUEST_QUESTIONS, GUEST_ROLES, GUEST_STARTERS, ROLE_STARTERS } from '../data/guestbook'
import { formatDate } from '../lib/format'
import { guestbookConfigured, listGuestbook, maskName, messageOf, writeGuestbook, type GuestEntry } from '../lib/guestbook'

const BODY_MAX = 600
const toggle = (list: string[], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v])
const shuffle = <T,>(a: T[]) => {
  const r = [...a]
  for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]] }
  return r
}

/** 눌러서 고르는 키워드 하나 */
function Chip({ on, children, onClick }: { on: boolean; children: string; onClick: () => void }) {
  return (
    <button type="button" className="gb-chip" aria-pressed={on} onClick={onClick}>
      {children}
    </button>
  )
}

/** 질문 한 줄: 옆의 버튼을 누르면 고를 수 있는 키워드가 펼쳐짐 */
function Ask({ no, title, picked, children }: { no: string; title: string; picked: string; children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const id = useId()
  return (
    <div className={`gb-ask${open ? ' is-open' : ''}`}>
      <div className="gb-ask__head">
        <span className="gb-step__no">{no}</span>
        <span className="gb-ask__title">{title}</span>
        <button type="button" className="gb-ask__btn" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}>
          {picked ? <span className="gb-ask__picked">{picked}</span> : '고르기'}
          <span className="gb-ask__chev" aria-hidden="true">↓</span>
        </button>
      </div>
      <div id={id} className="gb-ask__body" hidden={!open}>{children}</div>
    </div>
  )
}

/** 많이 고른 키워드 위에서 3개만 보여 줌 (글 목록이 아래로 밀리지 않게. 전체 데이터는 그대로 남아 있음) */
const TOP_N = 3
function topCounts(entries: GuestEntry[], pick: (e: GuestEntry) => string[]) {
  const m = new Map<string, number>()
  for (const e of entries) for (const k of pick(e)) m.set(k, (m.get(k) ?? 0) + 1)
  return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, TOP_N)
}

/**
 * 머리 부분 배경에 흐릿하게 떠다니는 후기 카드. 두 줄이 서로 다른 방향·속도로 옆으로 흐름.
 * 꾸밈용이라 화면 낭독기에는 숨김(같은 글이 아래 '남겨 주신 글'에 있음).
 * 글이 적어도 줄이 비지 않게 같은 글을 되풀이해 채우고, 묶음을 두 번 이어 붙여 끊김 없이 반복.
 */
const WALL_ROWS = 2 // 글이 적은 동안은 2줄(되풀이 줄이기). 글이 많아지면 3으로
const WALL_MIN = 5 // 한 줄을 채우는 최소 카드 수 (카드 5장 ≈ 1420px ≥ 본문 최대 너비)
function ReviewWall({ entries }: { entries: GuestEntry[] }) {
  const rows = useMemo(() => {
    if (entries.length === 0) return []
    return Array.from({ length: WALL_ROWS }, (_, r) => {
      // 글이 줄 수보다 적으면 모든 줄이 같은 글을 쓰되 시작 위치를 다르게
      const own = entries.length >= WALL_ROWS ? entries.filter((_, i) => i % WALL_ROWS === r) : entries
      return Array.from({ length: Math.max(WALL_MIN, own.length) }, (_, i) => own[(i + r) % own.length])
    })
  }, [entries])
  if (rows.length === 0) return null
  return (
    <div className="gb-wall" aria-hidden="true">
      {rows.map((row, r) => (
        <div key={r} className="gb-wall__row" style={{ animationDuration: `${row.length * (11 + r * 2)}s` }}>
          {[0, 1].map((copy) => row.map((e, i) => (
            <div key={`${copy}-${i}`} className="gb-wall__card">
              <span className="gb-wall__name">{e.name}</span>
              <p className="gb-wall__body">{e.body.replace(/\s+/g, ' ')}</p>
            </div>
          )))}
        </div>
      ))}
    </div>
  )
}

function Entry({ e }: { e: GuestEntry }) {
  return (
    <li className="gb-entry">
      <div className="gb-entry__head">
        <span className="gb-entry__name">{e.name}</span>
        {e.role && <span className="meta">{e.role}</span>}
        <span className="meta gb-entry__date">{formatDate(e.created_at)}</span>
      </div>
      {(e.favorites.length > 0 || e.feelings.length > 0) && (
        <p className="film-badges">
          {e.favorites.map((f) => <span key={f} className="film-badge">{f}</span>)}
          {e.feelings.map((f) => <span key={f} className="film-badge gb-badge--dim">{f}</span>)}
        </p>
      )}
      <p className="gb-entry__body">{e.body}</p>
    </li>
  )
}

/**
 * 남겨진 글: 상품 후기처럼 아래에서 위로 천천히 밀려 올라감.
 * 글 묶음을 두 번 이어 붙이고 절반만큼 올린 뒤 처음으로 돌아가 끊김 없이 반복.
 * 글이 적어 칸을 다 채우지 못하면 움직이지 않고 그대로 보여 줌. 마우스를 올리거나 초점이 들어오면 멈춤.
 */
function Ticker({ entries }: { entries: GuestEntry[] }) {
  const boxRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const [dur, setDur] = useState(0) // 0이면 멈춤

  useLayoutEffect(() => {
    const box = boxRef.current, list = listRef.current
    if (!box || !list) return
    const measure = () => {
      const h = list.offsetHeight
      setDur(h > box.clientHeight ? h / 28 : 0) // 1초에 28px
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(box); ro.observe(list)
    return () => ro.disconnect()
  }, [entries])

  return (
    <div ref={boxRef} className={`gb-ticker${dur ? ' is-moving' : ''}`}>
      <div className="gb-ticker__track" style={dur ? { animationDuration: `${dur}s` } : undefined}>
        <ul ref={listRef} className="gb-list">{entries.map((e) => <Entry key={e.id} e={e} />)}</ul>
        {dur > 0 && <ul className="gb-list gb-ticker__copy" aria-hidden="true">{entries.map((e) => <Entry key={e.id} e={e} />)}</ul>}
      </div>
    </div>
  )
}

export function Guestbook() {
  const groups = useMemo(favoriteGroups, [])
  const [role, setRole] = useState<string | null>(null)
  const [favorites, setFavorites] = useState<string[]>([])
  const [feelings, setFeelings] = useState<string[]>([])
  const [body, setBody] = useState('')
  const [name, setName] = useState('')
  const [trap, setTrap] = useState('') // 사람에겐 안 보이는 칸: 채워져 있으면 자동 입력(스팸)
  const [sending, setSending] = useState(false)
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null)
  const bodyRef = useRef<HTMLTextAreaElement>(null)

  const [entries, setEntries] = useState<GuestEntry[] | null>(null)
  const [loadError, setLoadError] = useState(false)
  /** 무작위 순서. 방금 남긴 글(mine)은 맨 앞에 */
  const reload = (mine?: number) =>
    listGuestbook()
      .then((r) => {
        const first = r.filter((e) => e.id === mine)
        setEntries([...first, ...shuffle(r.filter((e) => e.id !== mine))])
        setLoadError(false)
      })
      .catch(() => setLoadError(true))
  useEffect(() => { if (guestbookConfigured) reload() }, [])

  // 문장 앞부분: 고른 부분(앞에서 3개) → 역할 → 공통
  const groupOf = (fav: string) => groups.find((g) => g.items.includes(fav))?.label ?? ''
  const roleStarter = role ? ROLE_STARTERS[role as keyof typeof ROLE_STARTERS] : undefined
  const starters = [
    ...favorites.slice(0, 3).map((f) => favoriteStarter(f, groupOf(f))),
    ...(roleStarter ? [roleStarter] : []),
    ...GUEST_STARTERS,
  ]

  /** 문장 앞부분 넣기: 비어 있으면 그대로, 쓰던 글이 있으면 다음 줄에. 커서는 문장 끝으로 */
  const addStarter = (s: string) => {
    const next = body.trim() ? `${body.replace(/\s+$/, '')}\n${s}` : s
    if (next.length > BODY_MAX) return
    setBody(next)
    requestAnimationFrame(() => {
      const el = bodyRef.current
      if (!el) return
      el.focus()
      el.setSelectionRange(next.length, next.length)
    })
  }

  const canSend = name.trim().length > 0 && body.trim().length >= 2 && !sending

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!canSend) return
    if (trap) { setNotice({ ok: true, text: '고마워요! 남겨 주신 글이 올라갔어요.' }); return }
    setSending(true)
    setNotice(null)
    try {
      const id = await writeGuestbook({ name: name.trim(), role, favorites, feelings, body: body.trim() })
      setRole(null); setFavorites([]); setFeelings([]); setBody(''); setName('')
      setNotice({ ok: true, text: '고마워요! 남겨 주신 글이 올라갔어요. 이름은 확인한 뒤에 실명으로 바뀌어요.' })
      reload(id)
    } catch (err) {
      setNotice({ ok: false, text: messageOf((err as Error).message) })
    } finally {
      setSending(false)
    }
  }

  const picked = (list: string[]) => (list.length === 0 ? '' : list.length === 1 ? list[0] : `${list[0]} 외 ${list.length - 1}개`)
  const topFeelings = entries ? topCounts(entries, (e) => e.feelings) : []
  const topFavorites = entries ? topCounts(entries, (e) => e.favorites) : []

  return (
    <>
      <PageHead
        index="06 — GUESTBOOK" title="방명록" className="page-head--guestbook"
        desc="편하게 한마디 남겨 주세요. 무엇을 쓸지 막막하다면 아래 질문에서 키워드를 골라 보세요. 고르지 않아도, 여러 개 골라도 괜찮아요."
        backdrop={entries && entries.length > 0 ? <ReviewWall entries={entries} /> : undefined}
      />
      <div className="container gb">
        {!guestbookConfigured ? (
          <p className="gb-help empty">방명록은 곧 열려요.</p>
        ) : (
          <>
            <form className="gb-form" onSubmit={submit} noValidate data-reveal>
              {/* 기본 방명록: 이름 + 한마디 */}
              <div className="gb-write">
                <div className="gb-name">
                  <label className="gb-label" htmlFor="gb-name">이름</label>
                  <input
                    id="gb-name" className="gb-input" type="text" maxLength={20} autoComplete="name"
                    value={name} onChange={(e) => setName(e.target.value)} placeholder="홍길동"
                  />
                  <p className="gb-help gb-name__preview">
                    {name.trim()
                      ? <>처음에는 <b>{maskName(name)}</b>(으)로 보이고, 확인한 뒤에 실명으로 바뀌어요.</>
                      : <>처음에는 가운데 글자를 *로 가려서 보여 드려요. 확인한 뒤에 실명으로 바뀌어요.</>}
                  </p>
                </div>
                <div className="gb-body">
                  <label className="gb-label" htmlFor="gb-body">한마디</label>
                  <textarea
                    id="gb-body" ref={bodyRef} className="gb-input gb-textarea" rows={5} maxLength={BODY_MAX}
                    value={body} onChange={(e) => setBody(e.target.value)} placeholder="자유롭게 적어 주세요."
                  />
                  <p className="meta gb-count" aria-live="polite">{body.length} / {BODY_MAX}</p>
                </div>
                <div className="gb-starters">
                  <span className="gb-help">이렇게 시작해 볼까요? 누르면 글 칸에 들어가요.</span>
                  <div className="gb-chips">
                    {starters.map((s) => (
                      <button key={s} type="button" className="gb-starter" onClick={() => addStarter(s)}>{s.trim()} …</button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 골라서 덧붙이기: 질문 옆 버튼을 눌러야 펼쳐짐 */}
              <div className="gb-asks">
                <Ask no="01" title={GUEST_QUESTIONS.role} picked={role ?? ''}>
                  <div className="gb-chips">
                    {GUEST_ROLES.map((r) => <Chip key={r} on={role === r} onClick={() => setRole(role === r ? null : r)}>{r}</Chip>)}
                  </div>
                </Ask>
                <Ask no="02" title={GUEST_QUESTIONS.favorite} picked={picked(favorites)}>
                  {groups.map((g) => (
                    <div key={g.label} className="gb-group">
                      <span className="meta gb-group__label">{g.label}</span>
                      <div className="gb-chips">
                        {g.items.map((it) => <Chip key={it} on={favorites.includes(it)} onClick={() => setFavorites(toggle(favorites, it))}>{it}</Chip>)}
                      </div>
                    </div>
                  ))}
                </Ask>
                <Ask no="03" title={GUEST_QUESTIONS.feeling} picked={picked(feelings)}>
                  <div className="gb-chips">
                    {GUEST_FEELINGS.map((f) => <Chip key={f} on={feelings.includes(f)} onClick={() => setFeelings(toggle(feelings, f))}>{f}</Chip>)}
                  </div>
                </Ask>
              </div>

              <div className="gb-trap" aria-hidden="true">
                <label>웹사이트<input tabIndex={-1} autoComplete="off" value={trap} onChange={(e) => setTrap(e.target.value)} /></label>
              </div>
              <div className="gb-submit">
                <button className="btn" type="submit" disabled={!canSend} aria-disabled={!canSend}>
                  {sending ? '남기는 중…' : '방명록 남기기'}
                </button>
                {notice && <p className={`gb-help gb-notice${notice.ok ? ' is-ok' : ''}`} role="status">{notice.text}</p>}
              </div>
            </form>

            <section className="gb-board" aria-labelledby="gb-board-h" data-reveal>
              <h2 id="gb-board-h" className="gb-board__title">
                남겨 주신 글{entries && entries.length > 0 && <span className="gb-board__count"> {entries.length}</span>}
              </h2>

              {(topFeelings.length > 0 || topFavorites.length > 0) && (
                <div className="gb-summary">
                  {topFavorites.length > 0 && (
                    <div>
                      <span className="meta">마음에 남은 부분</span>
                      <p className="film-badges">{topFavorites.map(([k, n]) => <span key={k} className="film-badge">{k} <b>{n}</b></span>)}</p>
                    </div>
                  )}
                  {topFeelings.length > 0 && (
                    <div>
                      <span className="meta">많이 고른 말</span>
                      <p className="film-badges">{topFeelings.map(([k, n]) => <span key={k} className="film-badge gb-badge--dim">{k} <b>{n}</b></span>)}</p>
                    </div>
                  )}
                </div>
              )}

              {loadError && <p className="gb-help empty">글을 불러오지 못했어요. 잠시 뒤에 새로고침해 주세요.</p>}
              {entries && entries.length === 0 && <p className="gb-help empty">아직 남겨진 글이 없어요. 첫 글을 남겨 주세요.</p>}
              {entries && entries.length > 0 && <Ticker entries={entries} />}
            </section>
          </>
        )}
      </div>
    </>
  )
}
