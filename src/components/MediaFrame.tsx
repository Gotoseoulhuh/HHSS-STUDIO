import type { MediaRef } from '../data/types'
import { asset } from '../lib/url'

interface Props {
  media: MediaRef
  className?: string
  eager?: boolean
  /** cover: 틀을 꽉 채움 / contain: 잘리지 않게(스토리보드·확대 보기) */
  fit?: 'cover' | 'contain'
}

/** 비율을 지키는 이미지 틀. src가 없으면 '이미지 자리'를 보여 준다. */
export function MediaFrame({ media, className = '', eager = false, fit = 'cover' }: Props) {
  return (
    <div className={`frame ${className}`} style={{ aspectRatio: String(media.ratio) }}>
      {media.src ? (
        // 3단계에서 manifest 기반 srcset(화면용/미리보기용 WebP)으로 바뀐다.
        <img
          src={asset(media.src)}
          alt={media.alt}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          style={fit === 'contain' ? { objectFit: 'contain' } : undefined}
        />
      ) : (
        <div className="frame__label" role="img" aria-label={media.alt}>
          IMAGE
        </div>
      )}
    </div>
  )
}
