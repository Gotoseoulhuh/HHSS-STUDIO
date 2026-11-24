import { useMemo } from 'react'
import type { MediaRef, Work } from '../data/types'
import { listAlbums, listWorks } from '../lib/content'
import { asset } from '../lib/url'

/*
 * 작품 목록 머리 배경: 작품 사진이 두 줄로 천천히 옆으로 떠다닌다 (방명록의 떠다니는 후기와 같은 방식).
 * 사진은 작은 그림(public/assets/wall, `npm run wall`로 만듦)을 쓴다 — 원본을 그대로 쓰면 너무 무겁다.
 * 값은 아래 상수와 styles/layout.css의 .photo-wall 만 고치면 된다.
 */
const ROWS = 2
/** 한 작품에서 가져오는 사진 수 (한 작품이 줄을 독차지하지 않게) */
const PER_WORK = 6
/** 사진 한 장이 지나가는 데 걸리는 시간(초). 클수록 느리다 */
const SECONDS_PER_PHOTO = 10

/** 작품 상세에 쓰인 사진들 (등장인물 포스터·스토리보드·손글씨·사인은 뺌) */
function photosOf(w: Work): MediaRef[] {
  const out: MediaRef[] = [w.cover]
  for (const b of w.blocks) {
    if (b.type === 'story' || b.type === 'list') out.push(...(b.media ?? []))
    else if (b.type === 'note') { if (b.media) out.push(b.media) }
    else if (b.type === 'gallery') { if (b.layout === 'photo') out.push(...b.groups.flatMap((g) => g.items)) }
    else if (b.type === 'behind') out.push(...b.people.flatMap((p) => (p.still ? [p.still] : [])))
  }
  return out
}

/** 'assets/works/<작품>/<파일>.<확장자>' → 'assets/wall/<작품>/<파일>.jpg' */
const thumb = (src: string) => src.replace(/^assets\/works\//, 'assets/wall/').replace(/\.\w+$/, '.jpg')

export function WorkPhotoWall() {
  const rows = useMemo(() => {
    const albums = listAlbums()
    // 작품별 사진 묶음 → 작품을 번갈아 가며 한 장씩 뽑아 같은 작품 사진이 붙어 나오지 않게
    const perWork = listWorks().map((w) => {
      const all = [...photosOf(w), ...albums.filter((a) => a.workSlug === w.slug).flatMap((a) => a.photos)]
      const seen = new Set<string>()
      return all.filter((m) => m.src?.startsWith('assets/works/') && !seen.has(m.src) && seen.add(m.src)).slice(0, PER_WORK)
    })
    const mixed: MediaRef[] = []
    for (let i = 0; i < PER_WORK; i++) for (const list of perWork) if (list[i]) mixed.push(list[i])
    return Array.from({ length: ROWS }, (_, r) => mixed.filter((_, i) => i % ROWS === r)).filter((row) => row.length > 0)
  }, [])
  if (rows.length === 0) return null
  return (
    <div className="photo-wall" aria-hidden="true">
      {rows.map((row, r) => (
        <div key={r} className="photo-wall__row" style={{ animationDuration: `${row.length * (SECONDS_PER_PHOTO + r * 2)}s` }}>
          {[0, 1].map((copy) => row.map((m, i) => (
            <img
              key={`${copy}-${i}`}
              src={asset(thumb(m.src!))}
              alt=""
              decoding="async"
              style={{ aspectRatio: String(m.ratio) }}
              // 작은 그림을 아직 만들지 않은 사진은 자리를 차지하지 않게 뺀다
              onError={(e) => { e.currentTarget.style.display = 'none' }}
            />
          )))}
        </div>
      ))}
    </div>
  )
}
