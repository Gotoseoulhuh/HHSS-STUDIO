import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { PageHead } from '../components/PageHead'
import { favoriteGroups, favoriteStarter, GUEST_FEELINGS, GUEST_ROLES, GUEST_STARTERS, ROLE_STARTERS } from '../data/guestbook'
import { formatDate } from '../lib/format'
import { guestbookConfigured, listGuestbook, maskName, messageOf, writeGuestbook, type GuestEntry } from '../lib/guestbook'

const BODY_MAX = 600
const toggle = (list: string[], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v])

/** 눌러서 고르는 키워드 하나 */
function Chip({ on, children, onClick }: { on: boolean; children: string; onClick: () => void }) {
  return (
    <button type="button" className="gb-chip" aria-pressed={on} onClick={onClick}>
      {children}
    </button>
  )
}

/** 많이 고른 키워드 위에서 5개 */
function topCounts(entries: GuestEntry[], pick: (e: GuestEntry) => string[]) {
  const m = new Map<string, number>()
  for (const e of entries) for (const k of pick(e)) m.set(k, (m.get(k) ?? 0) + 1)
  return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5)
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
  const reload = () => listGuestbook().then((r) => { setEntries(r); setLoadError(false) }).catch(() => setLoadError(true))
  useEffect(() => { if (guestbookConfigured) reload() }, [])

  // 문장 앞부분: 고른 부분(앞에서 3개) → 역할 → 공통
  const groupOf = (fav: string) => groups.find((g) => g.items.includes(fav))?.label ?? ''
  const starters = [
    ...favorites.slice(0, 3).map((f) => favoriteStarter(f, groupOf(f))),
    ...(role && ROLE_STARTERS[role as keyof typeof ROLE_STARTERS] ? [ROLE_STARTERS[role as keyof typeof ROLE_STARTERS]!] : []),
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
      await writeGuestbook({ name: name.trim(), role, favorites, feelings, body: body.trim() })
      setRole(null); setFavorites([]); setFeelings([]); setBody(''); setName('')
      setNotice({ ok: true, text: '고마워요! 남겨 주신 글이 올라갔어요. 이름은 확인한 뒤에 실명으로 바뀌어요.' })
      reload()
    } catch (err) {
      setNotice({ ok: false, text: messageOf((err as Error).message) })
    } finally {
      setSending(false)
    }
  }

  const topFeelings = entries ? topCounts(entries, (e) => e.feelings) : []
  const topFavorites = entries ? topCounts(entries, (e) => e.favorites) : []

  return (
    <>
      <PageHead index="06 — GUESTBOOK" title="방명록" desc="무엇을 쓸지 막막하다면, 마음에 드는 키워드부터 눌러 보세요." />
      <div className="container gb">
        {!guestbookConfigured ? (
          <p className="hand empty">방명록은 곧 열려요.</p>
        ) : (
          <>
            <form className="gb-form" onSubmit={submit} noValidate>
              <fieldset className="gb-step" data-reveal>
                <legend><span className="gb-step__no">01</span>누구신가요? <span className="meta">고르지 않아도 돼요</span></legend>
                <div className="gb-chips">
                  {GUEST_ROLES.map((r) => (
                    <Chip key={r} on={role === r} onClick={() => setRole(role === r ? null : r)}>{r}</Chip>
                  ))}
                </div>
              </fieldset>

              <fieldset className="gb-step" data-reveal>
                <legend><span className="gb-step__no">02</span>어떤 부분이 마음에 남았나요? <span className="meta">여러 개 골라도 돼요</span></legend>
                {groups.map((g) => (
                  <div key={g.label} className="gb-group">
                    <span className="meta gb-group__label">{g.label}</span>
                    <div className="gb-chips">
                      {g.items.map((it) => (
                        <Chip key={it} on={favorites.includes(it)} onClick={() => setFavorites(toggle(favorites, it))}>{it}</Chip>
                      ))}
                    </div>
                  </div>
                ))}
              </fieldset>

              <fieldset className="gb-step" data-reveal>
                <legend><span className="gb-step__no">03</span>어떤 느낌이었나요? <span className="meta">여러 개 골라도 돼요</span></legend>
                <div className="gb-chips">
                  {GUEST_FEELINGS.map((f) => (
                    <Chip key={f} on={feelings.includes(f)} onClick={() => setFeelings(toggle(feelings, f))}>{f}</Chip>
                  ))}
                </div>
              </fieldset>

              <fieldset className="gb-step" data-reveal>
                <legend><span className="gb-step__no">04</span>한마디 남기기</legend>
                <p className="caption">문장 앞부분을 누르면 글 칸에 들어가요. 뒤를 이어서 써 주세요.</p>
                <div className="gb-chips gb-chips--starters">
                  {starters.map((s) => (
                    <button key={s} type="button" className="gb-starter" onClick={() => addStarter(s)}>
                      {s.trim()} …
                    </button>
                  ))}
                </div>
                <label className="visually-hidden" htmlFor="gb-body">한마디</label>
                <textarea
                  id="gb-body" ref={bodyRef} className="gb-input gb-textarea hand" rows={5} maxLength={BODY_MAX}
                  value={body} onChange={(e) => setBody(e.target.value)} placeholder="자유롭게 적어도 좋아요."
                />
                <p className="meta gb-count" aria-live="polite">{body.length} / {BODY_MAX}</p>

                <div className="gb-name">
                  <label className="meta" htmlFor="gb-name">이름</label>
                  <input
                    id="gb-name" className="gb-input" type="text" maxLength={20} autoComplete="name"
                    value={name} onChange={(e) => setName(e.target.value)} placeholder="홍길동"
                  />
                  <p className="caption gb-name__preview">
                    {name.trim()
                      ? <>처음에는 <b>{maskName(name)}</b>(으)로 보이고, 확인한 뒤에 실명으로 바뀌어요.</>
                      : <>처음에는 가운데 글자를 *로 가려서 보여 드려요. 확인한 뒤에 실명으로 바뀌어요.</>}
                  </p>
                </div>
                <div className="gb-trap" aria-hidden="true">
                  <label>웹사이트<input tabIndex={-1} autoComplete="off" value={trap} onChange={(e) => setTrap(e.target.value)} /></label>
                </div>

                <div className="gb-submit">
                  <button className="btn" type="submit" disabled={!canSend} aria-disabled={!canSend}>
                    {sending ? '남기는 중…' : '방명록 남기기'}
                  </button>
                  {notice && <p className={`caption gb-notice${notice.ok ? ' is-ok' : ''}`} role="status">{notice.text}</p>}
                </div>
              </fieldset>
            </form>

            <section className="gb-board" aria-labelledby="gb-board-h">
              <h2 id="gb-board-h" className="page-head__index" data-reveal>
                남겨 주신 글{entries && entries.length > 0 && <span className="gb-board__count"> {entries.length}</span>}
              </h2>

              {(topFeelings.length > 0 || topFavorites.length > 0) && (
                <div className="gb-summary" data-reveal>
                  {topFavorites.length > 0 && (
                    <div>
                      <span className="meta">마음에 남은 부분</span>
                      <p className="film-badges">{topFavorites.map(([k, n]) => <span key={k} className="film-badge">{k} <b>{n}</b></span>)}</p>
                    </div>
                  )}
                  {topFeelings.length > 0 && (
                    <div>
                      <span className="meta">많이 고른 느낌</span>
                      <p className="film-badges">{topFeelings.map(([k, n]) => <span key={k} className="film-badge gb-badge--dim">{k} <b>{n}</b></span>)}</p>
                    </div>
                  )}
                </div>
              )}

              {loadError && <p className="hand empty">글을 불러오지 못했어요. 잠시 뒤에 새로고침해 주세요.</p>}
              {entries && entries.length === 0 && <p className="hand empty">아직 남겨진 글이 없어요. 첫 글을 남겨 주세요.</p>}
              {entries && entries.length > 0 && (
                <ul className="gb-list">
                  {entries.map((e) => (
                    <li key={e.id} className="gb-entry">
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
                      <p className="hand gb-entry__body">{e.body}</p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </div>
    </>
  )
}
