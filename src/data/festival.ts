/*
 * HHSS 연합영화제 — 시즌 한정 이벤트창·영화제 페이지(/festival)의 내용.
 * 날짜·장소·상영작을 바꾸려면 이 파일만 고치면 된다.
 *
 * 미리 보기: 주소 끝에 ?festival=on 을 붙이면 기간이 아니어도 이벤트창·메뉴가 나온다(그 탭에서만).
 *            ?festival=off 를 붙이면 원래대로 돌아간다.
 */

/** 상영작. slug가 있으면 그 작품 소개(/works/slug)로 이어지고, 없으면(다른 팀 작품 등) 제목·설명만 보인다 */
export interface FestivalFilm {
  /** HHSS 작품이면 작품 주소(src/data/site.ts의 slug) */
  slug?: string
  /** slug가 없을 때: 제목 */
  title?: string
  /** slug가 없을 때: 제목 아래 한 줄 (예: '○○초등학교 · 연출 ○○○ · 12분') */
  sub?: string
  /** 온라인으로 볼 수 있는 주소(유튜브 등). 넣으면 '영화 보기' 단추가 생긴다 */
  watchUrl?: string
}

/** 상영 시간표 한 줄. 비워 두면 시간표 구역이 나오지 않는다 */
export interface FestivalSlot {
  /** 상영일 (예: '2026-12-18') */
  day: string
  /** 예: '14:00' */
  time: string
  title: string
  note?: string
}

export const festival = {
  name: '제3회 HHSS 연합영화제',
  nameEn: '3rd HHSS FILM FESTIVAL',
  /** 오프라인 상영일 */
  days: ['2026-12-18', '2026-12-19'],
  /** 상영 장소. 비워 두면 화면에 나오지 않는다 */
  venue: '',
  /** 영화제 페이지 제목 아래 소개 글 */
  intro: '한 해 동안 학생들과 함께 만든 영화를 한자리에서 상영합니다.',

  /** 이벤트창·메뉴·홈 단추가 나타나는 기간 (한국 시간). 영화제 페이지 주소(/festival)는 기간과 상관없이 늘 열린다 */
  seasonFrom: '2026-12-11T00:00:00+09:00',
  seasonUntil: '2026-12-20T00:00:00+09:00',

  lineup: [
    { slug: 'keuge-sorichimyeo' },
    { slug: 'take-your-mark' },
  ] as FestivalFilm[],

  timetable: [] as FestivalSlot[],
}
