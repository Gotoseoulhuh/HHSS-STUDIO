import { useEffect, useState, type FormEvent } from 'react'
import { formatDate } from '../../lib/format'
import {
  adminListGuestbook, adminSetStatus, guestbookConfigured, maskName, messageOf,
  type AdminEntry, type GuestStatus,
} from '../../lib/guestbook'

const PASS_KEY = 'hhss-gb-admin' // 이 탭을 닫으면 사라짐(sessionStorage)
const STATUS_LABEL: Record<GuestStatus, string> = { pending: '확인 전', approved: '실명 공개', hidden: '숨김' }
const FILTERS: { key: GuestStatus | 'all'; label: string }[] = [
  { key: 'pending', label: '확인 전' },
  { key: 'approved', label: '실명 공개' },
  { key: 'hidden', label: '숨김' },
  { key: 'all', label: '전체' },
]

/** 방명록 확인: 확인 전 글은 이름이 가려져 보이고, '실명 공개'를 누르면 실명으로 바뀐다 */
function GuestbookAdmin() {
  const [pass, setPass] = useState(() => { try { return sessionStorage.getItem(PASS_KEY) ?? '' } catch { return '' } })
  const [input, setInput] = useState('')
  const [rows, setRows] = useState<AdminEntry[] | null>(null)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<GuestStatus | 'all'>('pending')
  const [busy, setBusy] = useState<number | null>(null)

  const load = async (p: string) => {
    setError('')
    try {
      const r = await adminListGuestbook(p)
      setRows(r)
      setPass(p)
      try { sessionStorage.setItem(PASS_KEY, p) } catch { /* 무시 */ }
    } catch (err) {
      setRows(null)
      setPass('')
      try { sessionStorage.removeItem(PASS_KEY) } catch { /* 무시 */ }
      setError(messageOf((err as Error).message))
    }
  }
  useEffect(() => { if (pass) load(pass) }, []) // 저장된 비밀번호로 처음 한 번만

  const login = (e: FormEvent) => { e.preventDefault(); if (input) load(input) }

  const setStatus = async (id: number, status: GuestStatus) => {
    setBusy(id)
    try {
      await adminSetStatus(pass, id, status)
      setRows((rs) => rs?.map((r) => (r.id === id ? { ...r, status } : r)) ?? null)
    } catch (err) {
      setError(messageOf((err as Error).message))
    } finally {
      setBusy(null)
    }
  }

  if (!guestbookConfigured) return <p className="gb-help">Supabase 연결 값이 없어 방명록을 불러올 수 없어요.</p>

  if (!rows) {
    return (
      <form className="gb-admin__login" onSubmit={login}>
        <label className="visually-hidden" htmlFor="gb-admin-pass">관리자 비밀번호</label>
        <input id="gb-admin-pass" className="gb-input" type="password" autoComplete="current-password"
          placeholder="관리자 비밀번호" value={input} onChange={(e) => setInput(e.target.value)} />
        <button className="btn" type="submit">열기</button>
        {error && <p className="gb-help" role="alert" style={{ alignSelf: 'center' }}>{error}</p>}
      </form>
    )
  }

  const count = (k: GuestStatus | 'all') => (k === 'all' ? rows.length : rows.filter((r) => r.status === k).length)
  const shown = filter === 'all' ? rows : rows.filter((r) => r.status === filter)

  return (
    <div className="gb-admin">
      <div className="gb-admin__tabs" role="group" aria-label="상태별 보기">
        {FILTERS.map((f) => (
          <button key={f.key} type="button" className="gb-chip" aria-pressed={filter === f.key} onClick={() => setFilter(f.key)}>
            {f.label} {count(f.key)}
          </button>
        ))}
        <button type="button" className="gb-chip" onClick={() => load(pass)}>새로고침</button>
      </div>
      {error && <p className="gb-help" role="alert">{error}</p>}
      {shown.length === 0 ? (
        <p className="gb-help empty">해당하는 글이 없어요.</p>
      ) : (
        <ul className="gb-list">
          {shown.map((e) => (
            <li key={e.id} className="gb-entry">
              <div className="gb-entry__head">
                <span className="gb-entry__name">{e.name}</span>
                <span className="meta">지금 보이는 이름: {e.status === 'approved' ? e.name : maskName(e.name)}</span>
                {e.role && <span className="meta">{e.role}</span>}
                <span className={`gb-status gb-status--${e.status}`}>{STATUS_LABEL[e.status]}</span>
                <span className="meta gb-entry__date">{formatDate(e.created_at)}</span>
              </div>
              {(e.favorites.length > 0 || e.feelings.length > 0) && (
                <p className="film-badges">
                  {e.favorites.map((f) => <span key={f} className="film-badge">{f}</span>)}
                  {e.feelings.map((f) => <span key={f} className="film-badge gb-badge--dim">{f}</span>)}
                </p>
              )}
              <p className="gb-entry__body">{e.body}</p>
              <div className="gb-admin__actions">
                {(['approved', 'pending', 'hidden'] as GuestStatus[]).filter((s) => s !== e.status).map((s) => (
                  <button key={s} type="button" className="gb-chip" disabled={busy === e.id} onClick={() => setStatus(e.id, s)}>
                    {s === 'approved' ? '실명 공개' : s === 'pending' ? '다시 가리기' : '숨기기'}
                  </button>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function AdminHome() {
  useEffect(() => {
    // 관리자 화면은 검색에 노출하지 않음
    const m = document.createElement('meta')
    m.name = 'robots'
    m.content = 'noindex, nofollow'
    document.head.appendChild(m)
    return () => m.remove()
  }, [])

  return (
    <section className="container page-head">
      <span className="page-head__index">ADMIN</span>
      <h1>관리자</h1>
      <h2 style={{ fontSize: 'var(--fs-h2)', marginTop: 24 }}>방명록 확인</h2>
      <p className="gb-help">확인 전 글은 이름 가운데가 *로 보여요. 확인하고 ‘실명 공개’를 누르면 실명으로 바뀌어요.</p>
      <GuestbookAdmin />
    </section>
  )
}
