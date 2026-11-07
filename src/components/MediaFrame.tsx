import type { MediaRef } from '../data/types'
import { asset } from '../lib/url'

interface Props {
  media: MediaRef
  className?: string
  eager?: boolean
}

/** 비율을 지키는 이미지 틀. src가 없으면 '이미지 자리'를 보여 준다. */
export function MediaFrame({ media, className = '', eager = false }: Props) {
  return (
    <div className={`frame ${className}`} style={{ aspectRatio: String(media.ratio) }}>
      {media.src ? (
        // 3단계에서 manifest 기반 srcset(화면용/미리보기용 WebP)으로 바뀐다.
        <img src={asset(media.src)} alt={media.alt} loading={eager ? 'eager' : 'lazy'} decoding="async" />
      ) : (
        <div className="frame__label" role="img" aria-label={media.alt}>
          IMAGE
        </div>
      )}
    </div>
  )
}
