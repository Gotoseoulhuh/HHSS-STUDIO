import { useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Lightbox } from '../components/Lightbox'
import { MediaFrame } from '../components/MediaFrame'
import { getAlbum } from '../lib/content'
import { NotFound } from './NotFound'

export function PhotoSeries() {
  const { slug = '' } = useParams()
  const album = getAlbum(slug)
  const [open, setOpen] = useState<number | null>(null)
  const triggers = useRef<(HTMLButtonElement | null)[]>([])
  if (!album) return <NotFound />

  const close = () => {
    const i = open
    setOpen(null)
    if (i !== null) requestAnimationFrame(() => triggers.current[i]?.focus()) // 초점 복귀
  }

  return (
    <div className="container">
      <header className="page-head">
        <Link to="/photography" className="page-head__index" viewTransition>← 사진</Link>
        <h1 data-reveal>{album.title}</h1>
        <p className="hand prose" data-reveal style={{ ['--i' as string]: 1 }}>{album.summary}</p>
        <hr className="rule" data-reveal />
      </header>
      <ul className="photo-grid">
        {album.photos.map((p, i) => (
          <li key={i} data-reveal style={{ ['--i' as string]: i % 3 }}>
            <button ref={(el) => { triggers.current[i] = el }} onClick={() => setOpen(i)} aria-label={`${p.alt} 크게 보기`}>
              <MediaFrame media={p} />
              {p.caption && <span className="caption">{p.caption}</span>}
            </button>
          </li>
        ))}
      </ul>
      {open !== null && <Lightbox items={album.photos} index={open} onChange={setOpen} onClose={close} />}
    </div>
  )
}
