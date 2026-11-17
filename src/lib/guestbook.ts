/**
 * 방명록. Supabase DB 함수(supabase/migrations/0002_guestbook.sql)를 REST로 부른다.
 * 실명은 서버에서 가린 뒤 내려오므로, 확인 전 글의 실명은 브라우저에 오지 않는다.
 */
const URL = import.meta.env.VITE_SUPABASE_URL as string | undefined
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const guestbookConfigured = Boolean(URL && KEY)

export interface GuestEntry {
  id: number
  created_at: string
  name: string
  verified: boolean
  role: string | null
  favorites: string[]
  feelings: string[]
  body: string
}

export type GuestStatus = 'pending' | 'approved' | 'hidden'
export interface AdminEntry extends Omit<GuestEntry, 'verified'> {
  status: GuestStatus
}

export interface GuestDraft {
  name: string
  role: string | null
  favorites: string[]
  feelings: string[]
  body: string
}

/** 서버 오류 코드 → 화면 문구 */
const MESSAGES: Record<string, string> = {
  rate_limited: '조금 전에 여러 번 남겨 주셨어요. 10분쯤 뒤에 다시 남겨 주세요.',
  name_length: '이름은 1~20자로 적어 주세요.',
  body_length: '한마디는 2~600자로 적어 주세요.',
  too_many_tags: '고른 키워드가 너무 많아요.',
  not_set: '관리자 비밀번호가 아직 정해지지 않았어요. (SQL Editor에서 설정)',
  locked: '여러 번 틀려서 15분 동안 잠겼어요.',
  wrong: '비밀번호가 맞지 않아요.',
}
export const messageOf = (code: string) => MESSAGES[code] ?? '잠시 문제가 생겼어요. 조금 뒤에 다시 시도해 주세요.'

async function rpc<T>(name: string, args: Record<string, unknown> = {}): Promise<T> {
  if (!URL || !KEY) throw new Error('not_configured')
  const res = await fetch(`${URL.replace(/\/$/, '')}/rest/v1/rpc/${name}`, {
    method: 'POST',
    headers: { apikey: KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify(args),
  })
  if (!res.ok) {
    // raise exception '코드' → { message: '코드' }
    const err = (await res.json().catch(() => null)) as { message?: string } | null
    throw new Error(err?.message ?? `http_${res.status}`)
  }
  return (await res.json()) as T
}

export const listGuestbook = () => rpc<GuestEntry[]>('guestbook_list')

export const writeGuestbook = (d: GuestDraft) =>
  rpc<number>('guestbook_write', {
    p_name: d.name, p_role: d.role, p_favorites: d.favorites, p_feelings: d.feelings, p_body: d.body,
  })

export async function adminListGuestbook(pass: string): Promise<AdminEntry[]> {
  const r = await rpc<{ error?: string; rows?: AdminEntry[] }>('guestbook_admin_list', { p_pass: pass })
  if (r.error) throw new Error(r.error)
  return r.rows ?? []
}

export async function adminSetStatus(pass: string, id: number, status: GuestStatus) {
  const r = await rpc<{ error?: string }>('guestbook_admin_set', { p_pass: pass, p_id: id, p_status: status })
  if (r.error) throw new Error(r.error)
}

/** 서버와 같은 규칙으로 이름 가리기 — 입력하는 동안 미리 보기용 */
export function maskName(n: string) {
  const c = [...n.trim()]
  if (c.length <= 1) return c.length ? '*' : ''
  if (c.length === 2) return c[0] + '*'
  return c[0] + '*'.repeat(c.length - 2) + c[c.length - 1]
}
