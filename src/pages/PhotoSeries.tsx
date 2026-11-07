import { Link, useParams } from 'react-router-dom'
import { Gallery } from '../components/Gallery'
import { getAlbum, getWork } from '../lib/content'
import { NotFound } from './NotFound'

export function PhotoSeries() {
  const { slug = '' } = useParams()
  const album = getAlbum(slug)
  if (!album) return <NotFound />
  const work = album.workSlug ? getWork(album.workSlug) : undefined

  return (
    <div className="container">
      <header className="page-head">
        <Link to="/photography" className="page-head__index" viewTransition>← 사진</Link>
        <h1 data-reveal>{album.title}</h1>
        <p className="hand prose" data-reveal style={{ ['--i' as string]: 1 }}>{album.summary}</p>
        {album.shotAt && <p className="meta" data-reveal style={{ ['--i' as string]: 2 }}>{album.shotAt}</p>}
        <hr className="rule" data-reveal />
      </header>
      <Gallery items={album.photos} />
      {work && (
        <p className="block" data-reveal>
          <Link to={`/works/${work.slug}`} className="btn" viewTransition>〈{work.title}〉 작품 보기 →</Link>
        </p>
      )}
    </div>
  )
}
