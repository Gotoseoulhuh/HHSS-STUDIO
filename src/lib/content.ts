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
