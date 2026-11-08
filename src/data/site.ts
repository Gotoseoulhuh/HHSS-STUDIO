/*
 * 사이트 콘텐츠 — 'HHSS 영화 소개서'(2026)의 원문을 옮긴 것.
 * Supabase 연결 후에는 관리자 화면에서 편집하고, 이 파일은 초기 데이터(시드)로만 쓴다.
 */
import type { Album, MediaRef, Post, Profile, Resource, SiteSettings, Work } from './types'

const img = (dir: string, file: string, w: number, h: number, alt: string, caption?: string): MediaRef => ({
  src: `assets/works/${dir}/${file}`,
  alt,
  caption,
  ratio: w / h,
})

/* ───────────── 작품 ───────────── */

const K = 'keuge-sorichimyeo'
const T = 'take-your-mark'
const G = 'geu-yeoreume-meomuneun-neoege'
const U = 'uriga-chatgo-itdeon-byeol'

const kCover = img(K, 'cover.jpg', 1920, 1080, '대숲에서 서로의 손을 붙잡은 세 낭자')

const kMaking = {
  spring: [
    img(K, 'making-spring-01.jpg', 960, 643, '문 앞에 선 세 낭자와 연출', '4월 · 홍성 거북이마을 — 문 앞에 선 세 낭자와 연출'),
    img(K, 'making-spring-02.jpg', 1076, 720, '마당에서 부채춤 장면 촬영', '마당에서 부채춤 장면 촬영'),
    img(K, 'making-spring-03.jpg', 1076, 720, '촬영 출발 전 단체 사진', '촬영 출발 전 단체 사진'),
    img(K, 'making-spring-04.jpg', 1076, 720, '대문 틈으로 얼굴을 내민 조연들', '대문 틈으로 얼굴을 내민 조연들'),
    img(K, 'making-spring-05.jpg', 1076, 720, '붐 마이크를 든 음향팀과 하연', '붐 마이크를 든 음향팀과 하연'),
  ],
  july: [
    img(K, 'making-july-01.jpg', 1600, 1071, '장비를 든 제작진 단체 사진', '장비를 든 제작진 단체 사진'),
    img(K, 'making-july-02.jpg', 1600, 1071, '버드나무 아래 제작진 단체 사진', '버드나무 아래 제작진 단체 사진'),
    img(K, 'making-july-03.jpg', 1600, 1071, '정자 아래 제작진', '정자 아래 제작진'),
    img(K, 'making-july-04.jpg', 1600, 1071, '산책로의 두 사람', '산책로의 두 사람'),
  ],
  bamboo: [
    img(K, 'making-bamboo-01.jpg', 1076, 720, '대본을 확인하는 스크립터와 배우', '대본을 확인하는 스크립터와 배우'),
    img(K, 'making-bamboo-02.jpg', 1076, 720, '바닥에 엎드려 촬영하는 연출', '바닥에 엎드려 촬영하는 연출'),
    img(K, 'making-bamboo-03.jpg', 1076, 720, '연못 돌다리 위의 두 낭자', '연못 돌다리 위의 두 낭자'),
    img(K, 'making-bamboo-04.jpg', 1076, 720, '돌다리를 건너는 조연들', '돌다리를 건너는 조연들'),
    img(K, 'making-bamboo-05.jpg', 1076, 720, '쉬는 시간의 스크립터', '쉬는 시간의 스크립터'),
    img(K, 'making-bamboo-06.jpg', 1076, 720, '한복을 입은 배우들', '한복을 입은 배우들'),
  ],
  september: [
    img(K, 'making-september-01.jpg', 1600, 1071, '촬영 사이 서로를 안아 주는 배우들', '촬영 사이 서로를 안아 주는 배우들'),
    img(K, 'making-september-02.jpg', 1540, 1031, '대본을 맞춰 보는 세 낭자', '대본을 맞춰 보는 세 낭자'),
    img(K, 'making-september-03.jpg', 1540, 1031, '밤 촬영, 카메라 뒤의 촬영팀', '밤 촬영, 카메라 뒤의 촬영팀'),
  ],
}

const sb = (n: number, scene: string, w: number, h: number, caption?: string) =>
  img(G, `storyboard-${String(n).padStart(2, '0')}.jpg`, w, h, `스토리보드 스케치 — ${scene}`, caption)

export const works: Work[] = [
  {
    kind: 'work',
    slug: K,
    title: '크게 소리치며',
    titleLines: ['크게', '소리치며'],
    summary: '서로의 인연을 약속한 세 낭자의 이야기.',
    featured: true,
    order: 1,
    publishedAt: '2026-09-01T00:00:00Z',
    cover: kCover,
    workType: '학생단편영화',
    year: 2026,
    release: '2026년 가을 공개',
    genre: '퓨전 사극',
    runtime: '16분 14초',
    credits: ['연출 허상경', '제작 내포스튜디오'],
    roles: ['연출'],
    blocks: [
      {
        type: 'story',
        label: 'Story · 줄거리',
        heading: '봄의 약속,\n여름의 기척',
        paragraphs: [
          '꽃이 피던 봄, 하연과 유하, 연화는 서로를 오래 기억하자며 옥반지를 나눈다. 계절이 흘러 여름이 찾아온 어느 날, 평소와 다름없이 산책길에 나선 세 사람은 대나무숲 너머에서 낯선 기척을 감지하게 되는데...',
        ],
        quote: { text: '바람이 먼저 여름을 알고,\n물빛은 늦게 따라온다.', cite: '연화의 시 · S#6 여름 대숲' },
        media: [
          img(K, 'story-hanok.jpg', 1040, 1214, '한옥 대문 틈으로 하연의 춤을 엿보는 조연들', 'S#3 봄 · 한옥 — 예산 추사고택'),
          { ...kCover, caption: 'S#7 여름 · 대숲 — 낯선 기척' },
        ],
      },
      {
        type: 'cast',
        label: 'Cast · 등장인물',
        heading: '인연을 약속한 세 낭자',
        credit: '촬영 ｜ 포스터 디자인 · 황찬범 작가',
        members: [
          {
            role: '주하연',
            actor: '배우 주하은 · 하연 역',
            quote: '사계절을 마치 한 계절처럼\n같이 보내게 되었다.',
            lines: [
              '봄날, 한옥 마루에서 부채춤을 추며 처음 등장한다.',
              '세 사람 중 가장 단정하고 차분한 사람.',
              '지켜야 할 것 앞에서는 누구보다 물러서지 않는다.',
            ],
            poster: img(K, 'poster-hayeon.jpg', 1123, 1584, '주하연 캐릭터 포스터'),
          },
          {
            role: '이유하',
            actor: '배우 이유민 · 유하 역',
            quote: '어떤 말을 해도\n날 이해할 수 없겠지…',
            lines: [
              '툭툭 던지듯 말하지만 현실적이고 행동이 빠르다.',
              '연화를 놀리며 웃게 만드는, 가장 먼저 움직이는 사람.',
              '그리고 세 사람의 이야기를 끝까지 기억하게 된다.',
            ],
            poster: img(K, 'poster-yuha.jpg', 1123, 1584, '이유하 캐릭터 포스터'),
          },
          {
            role: '조연화',
            actor: '배우 조민지 · 연화 역',
            quote: '당신의 목소리를 타고\n꽃이 피고, 웃음꽃이 피어난다.',
            lines: [
              '글과 시를 좋아하는 밝고 다정한 사람.',
              '한지에 시를 쓰고, 영화의 나레이션을 이끈다.',
              '서로 다른 유하와 하연 사이를 조율하며 함께 가려 한다.',
            ],
            poster: img(K, 'poster-yeonhwa.jpg', 1123, 1584, '조연화 캐릭터 포스터'),
          },
        ],
      },
      {
        type: 'note',
        label: "Director's Note · 기획 의도",
        heading: '함께한 시간이 끝난 뒤,\n관계는 어디에 남을까',
        paragraphs: [
          '이 영화는 해마다 아이들을 만나고 또 떠나보내면서, 함께한 시간이 끝난 뒤 우리들의 관계는 어디에 남는지 묻게 되면서 기획하게 되었습니다.',
          '이야기를 사극으로 풀어낸 것은 우리 충청남도 지역의 아름다움을 아이들과 함께 담고 싶었기 때문입니다.',
          '예산 추사고택, 부여 궁남지, 홍성 거북이마을, 공주 공산성, 당진 대숲바람길 등 충남의 명소와 문화재를 배경으로 삼아, 학생들이 교과서에서만 보던 문화재를 촬영 현장에서 직접 만나도록 했습니다.',
          '제작진과 배우로 참여한 학생들은 고택의 마루와 연못의 정자, 대숲길을 오가며 문화재를 이야기의 무대로 경험했습니다.',
          '충남의 풍경 속에서 세 낭자의 인연을 따라가는 이 영화가, 관객들에게도 우리 곁의 문화재와 지금 곁에 있는 사람들을 다시 바라보는 계기가 되었으면 좋겠습니다.',
        ],
        signature: '연출 허상경',
        media: img(K, 'note-gungnamji.jpg', 1920, 1080, '부여 궁남지, 연못 가운데 정자', '부여 궁남지, 연못 가운데 정자'),
      },
      {
        type: 'gallery',
        label: 'Making · 2026.04 – 09',
        heading: '6개월간의 대장정',
        layout: 'photo',
        groups: [
          { title: '봄, 거북이마을과 추사고택', note: '2026.04 – 06 · 홍성 거북이마을 · 예산 추사고택', items: kMaking.spring },
          { title: '여름, 궁남지와 홍예공원', note: '2026.07 · 부여 궁남지 · 내포 홍예공원', items: kMaking.july },
          { title: '여름, 당진 대숲바람길', note: '2026.07 · 당진 대숲바람길', items: kMaking.bamboo },
          { title: '9월, 다시 대숲으로', note: '2026.09 · 당진 대숲바람길', items: kMaking.september },
        ],
      },
      {
        type: 'note',
        label: "Director's Letter · 부모님께",
        heading: '주인공 부모님들께\n드리는 말씀',
        paragraphs: [
          '민지, 하은이, 유민이는 3~4학년일 때부터 민지와 유민이는 〈우리가 찾고 있던 별〉 제작진으로, 하은이의 경우는 오케스트라를 통해 이미 알고 지내던 제자들입니다.',
          '평소에 밝게 인사하고 학교 생활에 열심인 모습을 예전부터 지켜봐 왔기에, 여러 주인공 후보 중에서 기쁜 마음으로 이 아이들을 〈크게 소리치며〉의 주인공으로 뽑을 수 있었습니다.',
          '이번 영화는 차량 이동이 매우 많아 걱정도 많았고, 도움도 많이 받은 프로젝트였습니다.',
          '제작진도 힘들었겠지만, 무엇보다 주인공들과 주인공 가족분들이 가장 마음고생도, 부담감도 컸으리라 생각합니다. 이 장기간의 학생단편영화제작 프로젝트 경험이 아이들이 훗날 자랐을 때에도 크게 힘이 되어 주는 자양분이 되었으면 합니다.',
          '기획부터 촬영 마무리까지 시간과 노력을 들여 도와주신 부모님들께 깊은 감사의 말씀을 드립니다.',
        ],
        signature: '허상경 · 크게 소리치며 감독 · 내포초등학교 교사',
        media: img(K, 'letter-dancheong.jpg', 1071, 1600, '단청 아래 선 세 낭자', '단청 아래 선 세 낭자'),
      },
    ],
  },
  {
    kind: 'work',
    slug: T,
    title: 'TAKE YOUR MARK',
    titleLines: ['TAKE', 'YOUR MARK'],
    summary: '열세 살, 처음 마주한 진로의 고민',
    featured: true,
    order: 2,
    publishedAt: '2026-09-01T00:00:00Z',
    cover: img(T, 'cover.jpg', 1920, 1080, '물보라를 일으키며 헤엄치는 준영의 뒷모습'),
    workType: '학생단편영화',
    year: 2026,
    release: '2026년 가을 공개',
    genre: '성장 · 스포츠 드라마',
    runtime: '12분 9초',
    credits: ['연출 허상경', '제작 내포스튜디오', '천안시 체육회 수영단'],
    roles: ['연출'],
    blocks: [
      {
        type: 'note',
        label: "Director's Note · 기획 의도",
        heading: '이때가 아니면,\n수영장에서 영화를 찍을 수 없겠다',
        paragraphs: [
          '지난해 내포스튜디오는 학생단편영화를 쉬고 〈그 여름에 머무는 너에게〉 뮤직비디오 프로젝트에만 매달려 있었습니다. 그해 10월 카자흐스탄 국외 연수에서 만난 안서영 선생님께 친동생 준영이가 실제 학생 선수로 수영을 하고 있다는 이야기를 들었고, 함께 영화를 만들어 보자는 말이 오갔습니다. 연말 HHSS 연합영화제에 준영이네 가족이 모두 찾아와 영화제를 즐긴 뒤, 제작이 결정되었습니다.',
          '미술, 음악, 체육을 하는 학생들의 이야기를 몇 해 전부터 담고 싶었습니다. 이때가 아니면 수영장에서 영화를 찍을 기회가 없겠다는 생각에, 무리한 일정인 줄 알면서도 밀고 나갔습니다.',
          '시작부터 쉽지 않았습니다. 첫 촬영지였던 논산 충남체육고등학교는 홍성에서 왕복 네 시간 거리였고, 겨울방학 전지훈련 틈틈이 시간을 얻어 찍어야 했습니다. 훈련장에서 찍을 수 있었던 날은 처음 이야기된 것의 3분의 1에 그쳤고, 결국 천안의 수영장을 하루 통째로 빌려 추가 촬영을 했습니다. 낮은 층고에 드론이 물에 빠져 그날의 항공 촬영분은 모두 쓰지 못했고, 봄이 되어 학교 장면과 나레이션 녹음을 마치며 촬영이 끝났습니다.',
          '그래도 여기까지 올 수 있었던 건 사람들 덕분입니다. 매번 먼 길을 함께 와 준 준영이네 가족, 카메라 앞에서도 해맑았던 선수 친구들, 하루를 통째로 내어 준 동료 선생님들, 서울에서 논산까지 내려와 준 포스터 작가님, 그리고 추운 수영장에서 끝까지 버텨 준 우리 반 제작진. 개연성이나 더 담고 싶었던 장면 등 아쉬운 점이 많지만, 개인 프로덕션이 받을 수 있는 가장 큰 선물을 받았다고 생각합니다.',
          '이 영화를 보는 같은 또래의 학생들이 "이런 세계의 아이들도 있구나, 이렇게 열정을 쏟아붓는 아이들도 있구나" 하고 느껴 주었으면 합니다. 그것이 준영이와 친구들에게, 그리고 지금 저마다의 출발선에 선 모든 아이들에게 보내는 이 영화의 인사입니다.',
        ],
        signature: '연출 허상경',
        media: img(T, 'note-pool.jpg', 1920, 1080, '저녁이 되기 직전의 잔잔한 수영장', '저녁이 되기 직전의 잔잔한 수영장'),
      },
      {
        type: 'list',
        label: "Director's Note · 감사",
        heading: '끝까지 올 수 있었던 여섯 가지',
        signature: '연출 허상경',
        items: [
          '준영이와 가족들의 아낌없는 헌신',
          '조연 친구 배우들의 해맑은 마음과 자세',
          '하루를 통째로 내어 촬영을 도와주신 권오현 선생님 · 박진호 선생님',
          '서울에서 논산까지 내려와 주신 황찬범 포스터 작가님',
          '사랑하는 우리 반 제작진들',
          '처음부터 끝까지 부담감을 즐기며, 늘 예의 바르고 열정 많았던 준영이',
        ],
        media: [
          img(T, 'thanks-friends.jpg', 1081, 608, '촬영장에서 웃고 있는 준영과 친구들', '촬영장에서 웃고 있는 준영과 친구들'),
          img(T, 'thanks-swim.jpg', 1480, 608, '액션캠으로 담은 준영의 수영 옆모습', '액션캠으로 담은 준영의 수영 옆모습'),
        ],
      },
    ],
  },
  {
    kind: 'work',
    slug: G,
    title: '그 여름에 머무는 너에게',
    titleLines: ['그 여름에', '머무는 너에게'],
    summary: '그 여름을 잃어버리지 말아줘',
    featured: true,
    order: 3,
    publishedAt: '2025-09-01T00:00:00Z',
    cover: img(G, 'cover.jpg', 1920, 1080, '꽃잎이 흩날리는 강당에서 하늘을 올려다보는 상경과 손을 내민 진영'),
    workType: '뮤직비디오',
    year: 2025,
    release: '2025년 9월 공개',
    genre: '드라마 · 그리움',
    runtime: '4분 14초',
    credits: ['연출 허상경', '제작 내포스튜디오', '2025 6학년 8반'],
    roles: ['연출'],
    blocks: [
      {
        type: 'gallery',
        label: 'Storyboard · 스토리보드',
        heading: '연출의 말을 그림으로 옮기다',
        sub: 'Visual Director 정서윤 — 연출팀이 사전에 제시한 구도를 듣고 스토리보드를 그린 뒤 촬영에 들어갔다. 포스터에 들어갈 요소, 주인공들의 머리 스타일까지 여러 방면에서 의견을 냈다. 그 인연으로 제2회 HHSS 연합영화제(2nd HHSS FILM FESTIVAL)의 로고 작업까지 맡게 되었다.',
        layout: 'storyboard',
        groups: [
          {
            title: 'S#1 · 개학식 날, 끝 겨울',
            items: [
              sb(1, 'S#1 컷 1', 1080, 720), sb(2, 'S#1 컷 2', 561, 374), sb(3, 'S#1 컷 3', 1080, 720),
              sb(4, 'S#1 컷 4', 1080, 720), sb(5, 'S#1 컷 5', 1080, 720), sb(6, 'S#1 컷 6', 1084, 720),
              sb(7, 'S#1 컷 7', 561, 374), sb(8, 'S#1 컷 8', 1080, 720), sb(9, 'S#1 컷 9', 1080, 720),
              sb(10, 'S#1 컷 10', 1080, 720),
            ],
          },
        ],
      },
      {
        type: 'gallery',
        label: 'Storyboard · 스토리보드',
        heading: '여름이 끝나기 전에',
        sub: '비주얼 디렉터 정서윤',
        layout: 'storyboard',
        groups: [
          {
            title: 'S#4 · 전학 소식 듣는 날, 7월 종례 후',
            items: [
              sb(11, 'S#4 컷 1', 629, 418), sb(12, 'S#4 컷 2', 629, 418), sb(13, 'S#4 컷 3', 1080, 720),
              sb(14, 'S#4 컷 4', 627, 418), sb(15, 'S#4 컷 5', 627, 418),
            ],
          },
          {
            title: 'S#5 · 사물함에 편지를 넣는 진엽, 편지를 발견한 아라 — 여름방학 전날',
            items: [
              sb(16, 'S#5 컷 1', 1080, 720), sb(17, 'S#5 컷 2', 1080, 720), sb(18, 'S#5 컷 3', 1080, 720),
              sb(19, 'S#5 컷 4', 1080, 720), sb(20, 'S#5 컷 5', 514, 343), sb(21, 'S#5 컷 6', 1080, 720),
            ],
          },
        ],
      },
      {
        type: 'gallery',
        label: 'Storyboard · 인서트샷',
        heading: '말 대신 장면으로',
        sub: '비주얼 디렉터 정서윤',
        layout: 'photo',
        groups: [
          {
            title: '인서트샷',
            items: [
              sb(22, '진엽의 발걸음', 1080, 720, '진엽의 발걸음'),
              sb(23, '아라의 발걸음', 1080, 720, '아라의 발걸음'),
              sb(24, '반 아이들이 남긴 문구', 796, 531, '반 아이들이 남긴 문구 — 전학 가는 진엽에게 남긴 말들. 실제로는 제작진이 방학을 맞아 쓴 글들을 담았다.'),
              sb(25, '천 마리 종이학', 1080, 720, '천 마리 종이학 — 아라의 사물함에 놓인 종이학 상자. 전학을 가지 않길 바라는 마음.'),
            ],
          },
        ],
      },
    ],
  },
  {
    kind: 'work',
    slug: U,
    title: '우리가 찾고 있던 별',
    titleLines: ['우리가 찾고 있던', '별'],
    summary: '별자리를 건넨 의문의 소년, 그 별을 찾아 떠나는 소녀.',
    featured: true,
    order: 4,
    publishedAt: '2024-12-01T00:00:00Z',
    cover: img(U, 'cover.jpg', 1920, 1080, '어두운 방에서 망원경을 들여다보는 로와'),
    workType: '학생단편영화',
    year: 2024,
    release: '2024년 12월 공개',
    genre: '미스터리 · 성장 드라마',
    runtime: '22분 59초',
    credits: ['연출 허상경', '제작 내포스튜디오'],
    roles: ['연출'],
    blocks: [],
  },
]

/* ───────────── 사진 ───────────── */

export const albums: Album[] = [
  {
    kind: 'album',
    slug: 'keuge-sorichimyeo-making',
    title: '크게 소리치며 — 촬영 기록',
    summary: '6개월간의 대장정. 홍성 거북이마을, 예산 추사고택, 부여 궁남지, 내포 홍예공원, 당진 대숲바람길.',
    featured: false,
    order: 1,
    publishedAt: '2026-09-01T00:00:00Z',
    shotAt: '2026.04 – 09',
    workSlug: K,
    cover: kMaking.july[1],
    photos: [...kMaking.spring, ...kMaking.july, ...kMaking.bamboo, ...kMaking.september],
  },
]

/* ───────────── 글·자료 (아직 없음) ───────────── */

export const posts: Post[] = []
export const resources: Resource[] = []

/* ───────────── 소개·설정 ───────────── */

export const profile: Profile = {
  name: '허상경',
  shortBio: '초등학교 교사 · HHSS PRODUCTION 연출',
  longBio: [],
  fields: ['학생단편영화', '뮤직비디오', '홍보영상', '공모전 영상 제작'],
  // 경력·작품·수상·상영은 필모그래피 원본(assets/hhss-filmography)에서 → src/data/filmography.json
  eventExtras: {
    'ev2025-01': {
      detail: '총괄 · 로고 디자인 정서윤 — 영화관 메인 화면에 띄운 워드마크, 영화제 이후 HHSS 채널 로고로 사용 중',
      media: { src: 'assets/files/festival/2nd-hhss-film-festival-logo.webp', alt: '2nd HHSS Film Festival 로고', ratio: 3331 / 464 },
    },
  },
  links: [
    { label: 'YouTube · HHSS', url: 'https://www.youtube.com/@hhss329' },
    { label: 'Instagram · @go_to_seoul.huh', url: 'https://www.instagram.com/go_to_seoul.huh/' },
  ],
  email: 'hsk4173@gmail.com',
}

export const settings: SiteSettings = {
  siteName: 'HHSS',
  tagline: 'HHSS Filmography',
  heroIntro: '학생들과 함께 만든 단편영화와 뮤직비디오, 그리고 나의 이야기.',
  heroEmphasis: '특별한 것을 공유하다.',
  // 주소를 넣으면 하단·첫 화면에 자동으로 나타남
  social: {
    youtube: 'https://www.youtube.com/@hhss329',
    youtubeName: 'HHSS',
    instagram: 'https://www.instagram.com/go_to_seoul.huh/',
    instagramId: 'go_to_seoul.huh',
    email: 'hsk4173@gmail.com',
  },
  footerName: 'HHSS STUDIO',
  slogan: '특별한 것을 공유하다',
}
