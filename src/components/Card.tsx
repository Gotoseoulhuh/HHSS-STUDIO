import { Link } from 'react-router-dom'
import type { MediaRef } from '../data/types'
import { pad2 } from '../lib/format'
import { MediaFrame } from './MediaFrame'

interface Props {
  to: string
  index: number
  title: string
  sub?: string
  media: MediaRef
}

/** 작품·사진 시리즈 카드: 번호 01 / 제목 / 캡션, 호버 시 이미지 1.03배·제목 색·→ 표시 */
export function Card({ to, index, title, sub, media }: Props) {
  return (
    <li className="card" data-reveal style={{ ['--i' as string]: index % 4 }}>
      <Link to={to} viewTransition>
        <div className="card__media">
          <MediaFrame media={media} />
        </div>
        <div className="card__head">
          <span className="card__no">{pad2(index + 1)}</span>
          <h3 className="card__title">{title}</h3>
          <span className="card__arrow" aria-hidden="true">→</span>
        </div>
        {sub && <p className="caption">{sub}</p>}
      </Link>
    </li>
  )
}
