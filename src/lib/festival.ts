import { festival, type FestivalFilm } from '../data/festival'
import type { MediaRef } from '../data/types'
import { getWork } from './content'

const PREVIEW_KEY = 'hhss-festival-preview'
const HIDE_KEY = 'hhss-festival-hide'

/** 한국 시간 기준 오늘 날짜 'YYYY-MM-DD' */
const todayKST = (now = new Date()) => new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul' }).format(now)

/** ?festival=on|off 미리 보기 설정을 읽어 이 탭에 기억한다 */
function previewOverride(): 'on' | 'off' | null {
  try {
    const q = new URLSearchParams(location.search).get('festival')
    if (q === 'on' || q === 'off') sessionStorage.setItem(PREVIEW_KEY, q)
    const v = sessionStorage.getItem(PREVIEW_KEY)
    return v === 'on' || v === 'off' ? v : null
  } catch {
    return null
  }
}

/** 지금이 영화제 시즌(이벤트창·메뉴가 나오는 기간)인지 */
export function isFestivalSeason(now = new Date()) {
  const o = previewOverride()
  if (o) return o === 'on'
  const t = now.getTime()
  return t >= Date.parse(festival.seasonFrom) && t < Date.parse(festival.seasonUntil)
}

/** 상영 전 · 상영 중 · 상영 후 */
export function festivalPhase(now = new Date()): 'before' | 'during' | 'after' {
  const today = todayKST(now)
  const days = [...festival.days].sort()
  if (today < days[0]) return 'before'
  if (today > days[days.length - 1]) return 'after'
  return 'during'
}

const dayFmt = new Intl.DateTimeFormat('ko-KR', { timeZone: 'Asia/Seoul', month: 'numeric', day: 'numeric', weekday: 'short' })
/** '2026-12-18' → '12월 18일 (금)' */
export const formatFestivalDay = (day: string) => dayFmt.format(new Date(`${day}T12:00:00+09:00`))

/** '2026.12.18.(금) – 19.(토)' */
export function festivalDateLine() {
  const wd = new Intl.DateTimeFormat('ko-KR', { timeZone: 'Asia/Seoul', weekday: 'short' })
  const part = (day: string) => {
    const [y, m, d] = day.split('-').map(Number)
    return { y, m, d, w: wd.format(new Date(`${day}T12:00:00+09:00`)) }
  }
  const days = [...festival.days].sort().map(part)
  const first = days[0]
  const rest = days.slice(1).map((p) =>
    p.y !== first.y ? `${p.y}.${p.m}.${p.d}.(${p.w})` : p.m !== first.m ? `${p.m}.${p.d}.(${p.w})` : `${p.d}.(${p.w})`,
  )
  return [`${first.y}.${first.m}.${first.d}.(${first.w})`, ...rest].join(' – ')
}

export interface FestivalEntry {
  key: string
  title: string
  sub: string
  summary?: string
  cover?: MediaRef
  /** 작품 소개 주소 */
  to?: string
  watchUrl?: string
}

/** 상영작 목록을 화면용으로 풀어 준다 (HHSS 작품은 작품 정보에서 제목·사진을 가져옴) */
export function listFestivalFilms(): FestivalEntry[] {
  return festival.lineup.flatMap((f: FestivalFilm, i): FestivalEntry[] => {
    const w = f.slug ? getWork(f.slug) : undefined
    if (w) {
      return [{
        key: w.slug,
        title: w.title,
        sub: f.sub ?? [w.workType, w.genre, w.runtime].filter(Boolean).join(' · '),
        summary: w.summary,
        cover: w.cover,
        to: `/works/${w.slug}`,
        watchUrl: f.watchUrl ?? w.videoUrl,
      }]
    }
    if (!f.title) return []
    return [{ key: `film-${i}`, title: f.title, sub: f.sub ?? '', watchUrl: f.watchUrl }]
  })
}

/** 이벤트창을 닫았는지: 'session' 이번 방문 동안 / 'today' 오늘 하루 */
export function isPopupHidden() {
  try {
    return sessionStorage.getItem(HIDE_KEY) === '1' || localStorage.getItem(HIDE_KEY) === todayKST()
  } catch {
    return false
  }
}
export function hidePopup(scope: 'session' | 'today') {
  try {
    sessionStorage.setItem(HIDE_KEY, '1')
    if (scope === 'today') localStorage.setItem(HIDE_KEY, todayKST())
  } catch { /* 저장 불가 환경: 이번 화면에서만 닫힘 */ }
}
