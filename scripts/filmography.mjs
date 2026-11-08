// 필모그래피 원본(내 컴퓨터에만 있음) → 사이트용 공개 사본(src/data/filmography.json)
//
// 원본: assets/hhss-filmography/assets/data/filmography.json  (.gitignore — 저장소에 올라가지 않음)
// 공개 사본에 들어가는 것:
//   - public !== false 이고 verified !== false 인 작품·행사·표창만
//   - todo, note(작품 내부 메모), verified, public, poster 는 뺌
// 원본이 없으면(예: GitHub Actions) 이미 커밋된 공개 사본을 그대로 씀.
import { existsSync, readFileSync, writeFileSync } from 'node:fs'

const SRC = 'assets/hhss-filmography/assets/data/filmography.json'
const OUT = 'src/data/filmography.json'

if (!existsSync(SRC)) {
  console.log(`filmography: 원본 없음 — ${OUT} 그대로 사용`)
  process.exit(0)
}

const raw = JSON.parse(readFileSync(SRC, 'utf8'))
const shown = (x) => x.public !== false && x.verified !== false
const omit = (obj, keys) => Object.fromEntries(Object.entries(obj).filter(([k]) => !keys.includes(k)))

const works = (raw.works || []).filter(shown).map((w) => omit(w, ['todo', 'note', 'verified', 'public', 'poster']))
const ids = new Set(works.map((w) => w.id))

const out = {
  meta: {
    updated: raw.meta?.updated ?? null,
    categories: raw.meta?.categories ?? {},
    status_labels: raw.meta?.status_labels ?? {},
    year_notes: raw.meta?.year_notes ?? {},
  },
  about: (raw.about || []).filter(shown).map((a) => omit(a, ['todo', 'verified', 'public'])),
  works,
  // 행사 설명(note: 온라인 상영 기간 등)은 화면에 나오는 정보라 유지. 숨긴 작품 참조는 뺌
  events: (raw.events || []).filter(shown).map((e) => ({ ...omit(e, ['todo', 'verified', 'public']), works: (e.works || []).filter((id) => ids.has(id)) })),
  honors: (raw.honors || []).filter(shown).map((h) => omit(h, ['todo', 'verified', 'public'])),
}

writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n')
const hidden = (raw.works || []).length - works.length
console.log(`filmography: 작품 ${works.length}개 공개 (숨김·미확인 ${hidden}개 제외) → ${OUT}`)
