// 계획서 8장 데이터 구조의 화면용 형태. Supabase 연결 시 같은 모양으로 매핑한다.

export type ContentKind = 'work' | 'album' | 'post' | 'resource'

export interface MediaRef {
  /** public/assets 기준 경로. 아직 없으면 null → 화면에 '이미지 자리' 표시 */
  src: string | null
  alt: string
  caption?: string
  /** 가로/세로 비율 (예: 16/9). 사진 비율 존중용 */
  ratio: number
}

interface ContentBase {
  kind: ContentKind
  slug: string
  title: string
  summary: string
  featured: boolean
  order: number
  /** ISO 8601 UTC */
  publishedAt: string
  cover: MediaRef
}

export interface Work extends ContentBase {
  kind: 'work'
  workType: string
  year: number
  roles: string[]
  videoUrl?: string
  runtime?: string
  genre?: string
  synopsis?: string
}

export interface Album extends ContentBase {
  kind: 'album'
  shotAt?: string
  photos: MediaRef[]
}

export interface Post extends ContentBase {
  kind: 'post'
  category: string
  tags: string[]
  /** 2단계에서 문서형 편집기 + HTML 정화로 대체. 지금은 문단 배열 */
  body: string[]
}

export interface Resource extends ContentBase {
  kind: 'resource'
  file: { path: string; format: string; sizeBytes: number } | null
}

export interface Profile {
  name: string
  shortBio: string
  longBio: string[]
  fields: string[]
  links: { label: string; url: string }[]
  email?: string
}

export interface SiteSettings {
  siteName: string
  tagline: string
  heroLines: string[]
}
