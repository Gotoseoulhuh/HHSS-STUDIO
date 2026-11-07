/**
 * 방문자 수(오늘·누적). Supabase의 DB 함수(supabase/migrations/0001_visit_counter.sql)를
 * REST로 직접 부른다 — 별도 패키지 없이 fetch만 사용.
 *
 * 브라우저에 들어가는 값은 프로젝트 URL과 공개(anon/publishable) 키뿐이다.
 * 값이 없으면(아직 미연결) null을 돌려주고 화면에서 숫자를 숨긴다.
 */
const URL = import.meta.env.VITE_SUPABASE_URL as string | undefined
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export interface VisitStats {
  today: number
  total: number
}

const DAY_KEY = 'hhss-visit-day'

/** 한국 시간 기준 오늘 (YYYY-MM-DD) */
const todayKST = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(new Date())

async function rpc(name: 'hit_visit' | 'visit_stats'): Promise<VisitStats | null> {
  if (!URL || !KEY) return null
  const res = await fetch(`${URL.replace(/\/$/, '')}/rest/v1/rpc/${name}`, {
    method: 'POST',
    headers: { apikey: KEY, 'Content-Type': 'application/json' },
    body: '{}',
  })
  if (!res.ok) throw new Error(`visit ${name} ${res.status}`)
  const rows = (await res.json()) as { today: number; total: number }[]
  const row = rows[0]
  return row ? { today: Number(row.today), total: Number(row.total) } : null
}

let pending: Promise<VisitStats | null> | null = null

/** 같은 브라우저는 하루 한 번만 +1, 그 외에는 읽기만. 한 페이지 로드에서 한 번만 요청 */
export function loadVisitStats(): Promise<VisitStats | null> {
  if (pending) return pending
  pending = (async () => {
    const today = todayKST()
    let counted = false
    try { counted = localStorage.getItem(DAY_KEY) === today } catch { /* 저장 불가: 읽기만 */ counted = true }
    const stats = await rpc(counted ? 'visit_stats' : 'hit_visit')
    if (!counted && stats) {
      try { localStorage.setItem(DAY_KEY, today) } catch { /* 무시 */ }
    }
    return stats
  })().catch(() => null)
  return pending
}

export const visitsConfigured = Boolean(URL && KEY)
