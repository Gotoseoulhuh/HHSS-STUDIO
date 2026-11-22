/*
 * 콘텐츠 읽기 창구. 지금은 src/data/site.ts에서 읽고, Supabase 연결 시 이 파일 안쪽만 바꾼다.
 * (페이지 쪽 코드는 이 함수들만 사용)
 */
import { concepts } from '../data/concepts'
import filmographyData from '../data/filmography.json'
import { albums, posts, profile, resources, settings, works } from '../data/site'
import type { Filmography } from '../data/types'

const byOrder = <T extends { order: number }>(a: T, b: T) => a.order - b.order
const byDateDesc = <T extends { publishedAt: string }>(a: T, b: T) => b.publishedAt.localeCompare(a.publishedAt)

export const getSettings = () => settings
export const getProfile = () => profile

export const listWorks = () => [...works].sort(byOrder)
export const listFeaturedWorks = () => listWorks().filter((w) => w.featured)
export const getWork = (slug: string) => works.find((w) => w.slug === slug)

export const listAlbums = () => [...albums].sort(byOrder)
export const getAlbum = (slug: string) => albums.find((a) => a.slug === slug)

export const listPosts = () => [...posts].sort(byDateDesc)
export const getPost = (slug: string) => posts.find((p) => p.slug === slug)

export const listConcepts = () => [...concepts].sort((a, b) => a.no.localeCompare(b.no))
export const getConcept = (slug: string) => concepts.find((c) => c.slug === slug)

export const listResources = () => [...resources].sort(byOrder)
export const getResource = (slug: string) => resources.find((r) => r.slug === slug)

export const getFilmography = () => filmographyData as Filmography
/** 필모그래피 제목과 같은 작품 상세가 있으면 그 주소(slug) */
export const findWorkSlugByTitle = (title: string) => works.find((w) => w.title === title)?.slug

/** 초안(draft)은 개발 화면에서만 보임 */
export const SHOW_DRAFTS = import.meta.env.DEV
export const shown = <T extends { draft?: boolean }>(x: T) => !x.draft || SHOW_DRAFTS

/** 홈 첫 화면 아래 요약 숫자. 작품·수상은 필모그래피에서, 교직 연차는 발령일에서 자동 계산 */
export function getRecords(now = new Date()): { value: string; label: string }[] {
  const f = getFilmography()
  const awards = f.works.flatMap((w) => w.awards)
  const best = awards.filter((a) => a.name.includes('충남 학생단편영화제') && a.name.includes('최우수작')).length
  const [y, m] = profile.teachingSince.split('-').map(Number)
  // 3월 발령 → 그해가 1년차, 해마다 3월에 한 해씩 늘어남
  const nth = now.getFullYear() - y + (now.getMonth() + 1 >= m ? 1 : 0)
  return [
    { value: `${f.works.length}편`, label: '연출 작품' },
    { value: `${awards.length}회`, label: '영상제·공모전 수상' },
    ...(best > 0 ? [{ value: `최우수작 ${best}회`, label: '충남 학생단편영화제' }] : []),
    { value: `${nth}년차`, label: `교직 · ${y}년 발령` },
  ]
}
