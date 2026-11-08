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

/** 소개 페이지 '상영·방영'의 행사에 덧붙이는 설명·이미지 (필모그래피 events의 id로 연결) */
export interface EventExtra {
  detail?: string
  media?: MediaRef
}

export interface Profile {
  name: string
  shortBio: string
  longBio: string[]
  fields: string[]
  /** 필모그래피 행사(id)별 추가 설명·이미지 */
  eventExtras: Record<string, EventExtra>
  links: { label: string; url: string }[]
  email?: string
}

export interface SiteSettings {
  siteName: string
  tagline: string
  /** 첫 화면 소개 두 줄: 보통 글자 한 줄 + 강조 한 줄 */
  heroIntro: string
  heroEmphasis: string
  /** 하단·첫 화면 외부 링크. 비어 있으면 화면에 나오지 않음 */
  social: { youtube?: string; youtubeName?: string; instagram?: string; instagramId?: string; email?: string }
  /** 하단 왼쪽 저작권 표기 이름 (예: 'HHSS STUDIO') */
  footerName: string
  /** 하단 오른쪽 슬로건 */
  slogan: string
}

/* ───────── 필모그래피 (src/data/filmography.json — scripts/filmography.mjs가 원본에서 공개 항목만 만듦) ───────── */
export type FilmStatus = 'released' | 'in_progress' | 'post' | 'development'
export interface FilmAward { year: number; name: string; org: string | null }
export interface FilmScreening { year: number; name: string; type: string; venue?: string | null; date?: string | null; note?: string | null }
export interface FilmWork {
  id: string
  title: string
  year: number | null
  month: number | null
  year_to?: number | null
  category: string
  type: string | null
  genre: string | null
  runtime: string | null
  credit: string | null
  production: string | null
  client: string | null
  status: FilmStatus | null
  awards: FilmAward[]
  screenings: FilmScreening[]
  links: { trailer: string | null; full: string | null }
}
export interface FilmEvent { id: string; year: number; type: string; name: string; venue: string | null; works: string[]; note: string | null; date?: string | null }
export interface FilmAbout { status: string | null; text: string; org: string | null }
export interface FilmHonor { year: number; name: string; org: string | null }
export interface Filmography {
  meta: { updated: string | null; categories: Record<string, string>; status_labels: Record<string, string>; year_notes: Record<string, string> }
  about: FilmAbout[]
  works: FilmWork[]
  events: FilmEvent[]
  honors: FilmHonor[]
}

/* ───────── 영화 개념 (src/data/concepts.ts) — 지금은 '글'의 '개념' 탭, 많아지면 별도 메뉴로 ───────── */
/** 도식 그림 이름 (components/ConceptDiagram.tsx) */
export type DiagramName = 'light-morning' | 'light-night' | 'blocking-close' | 'blocking-apart'
export interface ConceptScene {
  title: string
  caption: string
  /** 직접 그린 도식 */
  diagram: DiagramName
  /** 같은 원리가 보이는 HHSS 작품 장면 (있으면 도식과 번갈아 보기) */
  still?: { media: MediaRef; work: string; note: string }
}
export interface Concept {
  kind: 'concept'
  /** 시리즈 번호 '01' */
  no: string
  slug: string
  nameKo: string
  nameEn: string
  /** 글 목록에 보이는 한 줄 */
  summary: string
  publishedAt: string
  /** 첫 화면 큰 제목: 앞 + 강조 + 뒤 */
  cover: { before: string; strong: string; after: string }
  /** 첫 화면 아래 작은 정보 (대상·읽는 시간 등) */
  coverMeta: string[]
  headline: string
  tagline: string
  definition: string[]
  /** 정의 아래 강조 문장 (**굵게** → 하늘색) */
  hook?: { lead: string; text: string }
  metaphor: { name: string; desc: string }
  elements: { title: string; heading: string; sub: string; items: { no: string; label: string; en: string; body: string }[] }
  examples: { heading: string; sub: string; pairs: { label: string; scenes: [ConceptScene, ConceptScene] }[]; note: string
    /** 처음에 보일 쪽. 'diagram': 도식 → 누르면 실제 장면 / 'still': 반대 */
    front: 'diagram' | 'still' }
  /** 영화마다 다른 색 */
  palette?: { heading: string; sub: string; films: { title: string; year: number; slug: string; media: MediaRef; colors: { hex: string; pct: number }[]; mood: string }[]; note: string }
  /** HHSS 촬영장 이야기 (선생님 말) */
  onSet?: { heading: string; paragraphs: string[]; values: { label: string; desc: string }[]
    /** 마무리 문장 + 다음 개념으로 넘어가는 문장 (**굵게** → 하늘색) */
    closing: string; teaser?: string }
  mistakes: { heading: string; items: { wrong: string; why: string; fix: string }[] }
  missions: { heading: string; items: { title: string; desc: string; checks: string[] }[] }
}
