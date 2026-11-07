// 계획서 8장 데이터 구조의 화면용 형태. Supabase 연결 시 같은 모양(JSON)으로 매핑한다.

export type ContentKind = 'work' | 'album' | 'post' | 'resource'

export interface MediaRef {
  /** public/ 기준 경로 (예: 'assets/works/x/cover.jpg'). 없으면 null → 화면에 '이미지 자리' */
  src: string | null
  alt: string
  caption?: string
  /** 가로/세로 비율. 사진 비율 존중용 */
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

/* ── 작품 상세를 이루는 블록 ── */
export interface StoryBlock {
  type: 'story'
  label: string
  heading: string
  paragraphs: string[]
  quote?: { text: string; cite: string }
  media?: MediaRef[]
}
export interface CastBlock {
  type: 'cast'
  label: string
  heading: string
  credit?: string
  members: { role: string; actor: string; quote: string; lines: string[]; poster: MediaRef }[]
}
export interface GalleryBlock {
  type: 'gallery'
  label: string
  heading: string
  sub?: string
  /** photo: 사진 비율대로 / storyboard: 촘촘한 번호 칸 */
  layout: 'photo' | 'storyboard'
  groups: { title: string; note?: string; items: MediaRef[] }[]
}
export interface NoteBlock {
  type: 'note'
  label: string
  heading: string
  paragraphs: string[]
  signature?: string
  media?: MediaRef
}
export interface ListBlock {
  type: 'list'
  label: string
  heading: string
  signature?: string
  items: string[]
  media?: MediaRef[]
}
export type WorkBlock = StoryBlock | CastBlock | GalleryBlock | NoteBlock | ListBlock

export interface Work extends ContentBase {
  kind: 'work'
  /** 예: '학생단편영화', '뮤직비디오' */
  workType: string
  year: number
  /** 첫 화면용 줄바꿈 제목 (예: ['크게', '소리치며']) */
  titleLines?: string[]
  release?: string
  genre?: string
  runtime?: string
  /** 예: ['연출 허상경', '제작 내포스튜디오'] */
  credits: string[]
  roles: string[]
  videoUrl?: string
  blocks: WorkBlock[]
}

export interface Album extends ContentBase {
  kind: 'album'
  shotAt?: string
  photos: MediaRef[]
  /** 관련 작품 slug */
  workSlug?: string
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

export interface Activity {
  date: string
  title: string
  detail?: string
  /** 작품 상세로 연결 */
  workSlug?: string
  media?: MediaRef
}

export interface Profile {
  name: string
  shortBio: string
  longBio: string[]
  fields: string[]
  activities: Activity[]
  links: { label: string; url: string }[]
  email?: string
}

export interface SiteSettings {
  siteName: string
  tagline: string
  heroLines: string[]
}
