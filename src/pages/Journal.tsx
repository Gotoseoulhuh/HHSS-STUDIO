import { Link, useSearchParams } from 'react-router-dom'
import { PageHead } from '../components/PageHead'
import { listConcepts, listPosts } from '../lib/content'
import { formatDate, pad2 } from '../lib/format'

/* 개념 글이 많아지면 '개념'을 별도 메뉴로 뺀다. 그 전까지는 글 안의 탭. */
const TABS = [
  { key: 'all', label: '전체' },
  { key: 'concept', label: '개념' },
] as const
type TabKey = (typeof TABS)[number]['key']

interface Row { slug: string; title: string; sub: string; date: string; kind: 'post' | 'concept' }

export function Journal() {
  const [params, setParams] = useSearchParams()
  const tab: TabKey = params.get('tab') === 'concept' ? 'concept' : 'all'

  const conceptRows: Row[] = listConcepts().map((c) => ({
    slug: c.slug, title: `${c.nameKo}`, sub: `개념 ${c.no} · ${c.summary}`, date: c.publishedAt, kind: 'concept',
  }))
  const postRows: Row[] = listPosts().map((p) => ({
    slug: p.slug, title: p.title, sub: `${p.category} · ${p.summary}`, date: p.publishedAt, kind: 'post',
  }))
  const rows = tab === 'concept' ? conceptRows : [...postRows, ...conceptRows].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <>
      <PageHead index="03 — JOURNAL" title="글" desc="에세이, 작업일지, 리뷰, 제작 과정, 그리고 영화 개념." />
      <div className="container">
        <div className="journal-tabs" role="group" aria-label="글 종류" data-reveal>
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              className="meta"
              aria-pressed={tab === t.key}
              onClick={() => setParams(t.key === 'all' ? {} : { tab: t.key }, { replace: true })}
            >
              {t.label}
            </button>
          ))}
        </div>
        {rows.length === 0 ? (
          <p className="empty hand">아직 공개된 글이 없습니다.</p>
        ) : (
          <ul className="row-list" key={tab}>
            {rows.map((r, i) => (
              <li key={r.slug} data-reveal style={{ ['--i' as string]: i }}>
                <Link to={`/journal/${r.slug}`} viewTransition>
                  <span className="meta">{pad2(i + 1)}</span>
                  <h3>{r.title}</h3>
                  <p className="caption row-sub">{r.sub}</p>
                  <span className="meta row-right">{formatDate(r.date)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}
