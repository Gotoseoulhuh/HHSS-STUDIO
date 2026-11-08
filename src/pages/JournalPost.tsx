import { Link, useParams } from 'react-router-dom'
import { getConcept, getPost } from '../lib/content'
import { formatDate } from '../lib/format'
import { ConceptPage } from './ConceptPage'
import { NotFound } from './NotFound'

export function JournalPost() {
  const { slug = '' } = useParams()
  const concept = getConcept(slug)
  if (concept) return <ConceptPage c={concept} />
  const post = getPost(slug)
  if (!post) return <NotFound />

  return (
    <article className="container">
      <header className="page-head">
        <Link to="/journal" className="page-head__index" viewTransition>← 글</Link>
        <h1 data-reveal>{post.title}</h1>
        <p className="meta" data-reveal style={{ ['--i' as string]: 1 }}>{post.category} · {formatDate(post.publishedAt)}</p>
        <hr className="rule" data-reveal />
      </header>
      {/* 2단계에서 정화된 HTML 본문으로 교체 */}
      <div className="prose hand">
        {post.body.map((para, i) => <p key={i}>{para}</p>)}
      </div>
    </article>
  )
}
