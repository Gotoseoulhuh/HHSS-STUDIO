import { Card } from '../components/Card'
import { PageHead } from '../components/PageHead'
import { listAlbums } from '../lib/content'

export function Photography() {
  const albums = listAlbums()
  return (
    <>
      <PageHead index="02 — PHOTOGRAPHY" title="사진" desc="시리즈 단위로 정리한 사진입니다." />
      <div className="container">
        {albums.length === 0 ? (
          <p className="empty hand">아직 공개된 사진 시리즈가 없습니다.</p>
        ) : (
          <ul className="card-list card-list--grid">
            {albums.map((a, i) => (
              <Card key={a.slug} to={`/photography/${a.slug}`} index={i} title={a.title} sub={a.summary} media={a.cover} />
            ))}
          </ul>
        )}
      </div>
    </>
  )
}
