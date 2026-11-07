/*
 * ⚠ 개발용 자리표시자 시드 — 실제 작품·사진·이력이 아님.
 * 누가 봐도 자리표시자인 이름만 사용한다. Supabase 연결 후 이 파일은 개발 환경에서만 쓴다.
 */
import type { Album, Post, Profile, Resource, SiteSettings, Work } from './types'

const placeholder = (alt: string, ratio = 16 / 9) => ({ src: null, alt, ratio })

export const settings: SiteSettings = {
  siteName: 'HHSS',
  tagline: '한 줄 소개 자리표시자',
  heroLines: ['HHSS', '한 줄 소개 자리표시자'],
}

export const profile: Profile = {
  name: '이름 자리표시자',
  shortBio: '짧은 소개 자리표시자',
  longBio: ['긴 소개 문단 자리표시자 01', '긴 소개 문단 자리표시자 02'],
  fields: ['분야 01', '분야 02'],
  links: [],
}

export const works: Work[] = [1, 2, 3, 4].map((n) => {
  const no = String(n).padStart(2, '0')
  return {
    kind: 'work',
    slug: `work-${no}`,
    title: `작품 ${no}`,
    summary: `작품 ${no} 소개 자리표시자`,
    featured: n <= 2,
    order: n,
    publishedAt: '2026-01-01T00:00:00Z',
    cover: placeholder(`작품 ${no} 대표 이미지 자리`),
    workType: '종류 자리표시자',
    year: 2026,
    roles: ['역할 자리표시자'],
  }
})

export const albums: Album[] = [1, 2].map((n) => {
  const no = String(n).padStart(2, '0')
  return {
    kind: 'album',
    slug: `series-${no}`,
    title: `사진 시리즈 ${no}`,
    summary: `사진 시리즈 ${no} 설명 자리표시자`,
    featured: false,
    order: n,
    publishedAt: '2026-01-01T00:00:00Z',
    cover: placeholder(`사진 시리즈 ${no} 대표 사진 자리`, 3 / 2),
    photos: [3 / 2, 2 / 3, 3 / 2, 1, 3 / 2, 2 / 3].map((ratio, i) => ({
      src: null,
      alt: `사진 ${String(i + 1).padStart(2, '0')} 자리`,
      caption: `캡션 자리표시자 ${String(i + 1).padStart(2, '0')}`,
      ratio,
    })),
  }
})

export const posts: Post[] = [1, 2, 3].map((n) => {
  const no = String(n).padStart(2, '0')
  return {
    kind: 'post',
    slug: `post-${no}`,
    title: `글 제목 ${no}`,
    summary: `글 요약 자리표시자 ${no}`,
    featured: false,
    order: n,
    publishedAt: `2026-01-0${n}T00:00:00Z`,
    cover: placeholder(`글 ${no} 대표 이미지 자리`),
    category: '분류 자리표시자',
    tags: [],
    body: ['본문 문단 자리표시자 01', '본문 문단 자리표시자 02', '본문 문단 자리표시자 03'],
  }
})

export const resources: Resource[] = [1].map((n) => {
  const no = String(n).padStart(2, '0')
  return {
    kind: 'resource',
    slug: `resource-${no}`,
    title: `자료 ${no}`,
    summary: `자료 ${no} 설명 자리표시자`,
    featured: false,
    order: n,
    publishedAt: '2026-01-01T00:00:00Z',
    cover: placeholder(`자료 ${no} 이미지 자리`),
    file: null,
  }
})
