/*
 * 방명록 키워드. 감상문을 쓰는 순서(누구 → 무엇이 → 어떻게 → 한마디)대로 고르게 한다.
 * 작품·개념·사진 목록은 콘텐츠에서 자동으로 만들어서, 작품이 늘면 키워드도 함께 는다.
 */
import { listAlbums, listConcepts, listWorks } from '../lib/content'

/** 한마디 아래에 놓이는 질문 세 개 (옆 버튼을 눌러야 키워드가 펼쳐짐) */
export const GUEST_QUESTIONS = {
  role: '어떤 분이세요?',
  favorite: '마음에 남은 부분이 있나요?',
  feeling: '한 단어로 남긴다면?',
} as const

export const GUEST_ROLES =['학생', '학부모', '관객', '함께 작업하고 싶은 분', '그 밖의 방문자'] as const

export interface FavoriteGroup { label: string; items: string[] }

export function favoriteGroups(): FavoriteGroup[] {
  return [
    { label: '작품', items: listWorks().map((w) => `〈${w.title}〉`) },
    { label: '영화 개념', items: listConcepts().map((c) => c.nameKo) },
    { label: '사진', items: listAlbums().map((a) => a.title) },
    { label: '그 밖에', items: ['인트로 영상', '소개·필모그래피', '사이트 디자인'] },
  ].filter((g) => g.items.length > 0)
}

export const GUEST_FEELINGS = [
  '따뜻했어요', '뭉클했어요', '웃음이 났어요', '설렜어요', '새로웠어요',
  '궁금해졌어요', '오래 남아요', '해 보고 싶어졌어요', '응원하고 싶어요', '함께 만들고 싶어요',
] as const

/** 글 칸에 넣어 주는 문장 앞부분. 누르면 이어서 쓰기만 하면 된다 */
export const GUEST_STARTERS = [
  '가장 기억에 남는 장면은 ',
  '보면서 떠오른 사람은 ',
  '나도 비슷한 경험이 있는데, ',
  '만든 사람에게 묻고 싶은 건 ',
  '다음에 보고 싶은 이야기는 ',
] as const

/** 고른 역할에 따라 하나 더 */
export const ROLE_STARTERS: Partial<Record<(typeof GUEST_ROLES)[number], string>> = {
  학생: '내가 직접 찍는다면 ',
  학부모: '아이와 함께 보면서 ',
  관객: '극장에서 보고 나와서 ',
  '함께 작업하고 싶은 분': '함께 해 보고 싶은 작업은 ',
}

/** 고른 부분마다 하나씩: 〈작품〉에서 좋았던 건 / 미장센에서 새로 알게 된 건 */
export function favoriteStarter(fav: string, group: string) {
  if (group === '영화 개념') return `${fav}에서 새로 알게 된 건 `
  return `${fav}에서 좋았던 건 `
}
