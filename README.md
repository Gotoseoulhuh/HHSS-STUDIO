# HHSS — hhss.studio

작품·사진·글·자료를 소개하는 HHSS 포트폴리오 사이트입니다.
Vite + React + TypeScript로 만든 정적 사이트이고, GitHub Pages에서 무료로 호스팅합니다.

> 현재 상태: **1단계 골격**. 공개 페이지 틀과 디자인, 애니메이션, 배포 설정까지 되어 있습니다.
> Supabase(데이터베이스·로그인)는 아직 연결하지 않았습니다. 화면의 `작품 01` 같은 내용은 모두 개발용 자리표시자입니다(`src/data/seed.ts`).

## 설치와 실행

필요한 것: [Node.js](https://nodejs.org) 22 이상

```bash
npm install      # 처음 한 번
npm run dev      # 개발 서버 → http://localhost:5173
npm run build    # 배포용 빌드 → dist/
npm run preview  # 빌드 결과 미리보기 → http://localhost:4173
```

## 폴더 구성

```text
src/
  pages/            공개 페이지(홈·작품·사진·글·자료·소개)와 상세 화면
  pages/admin/      관리자 화면(아직 자리만 있음)
  components/       메뉴·카드·사진 확대 보기 등
  data/             데이터 형태(types.ts)와 개발용 자리표시자(seed.ts)
  lib/              콘텐츠 읽기 창구(content.ts)·날짜 형식·스크롤 등장
  styles/tokens.css 색·글꼴·애니메이션 값을 한 곳에서 관리
public/
  assets/           사진·자료 파일을 올리는 곳 (photos / works / files)
  brand/            HHSS 로고 → hhss-logo.png 를 넣으면 자동으로 표시
  fonts/            Paperlogy(제목·UI), 온글잎 허부장동생인체(세부 내용)
  CNAME             hhss.studio
design/fonts/       사이트에 쓰지 않는 Paperlogy 굵기(보관용, 배포 안 됨)
scripts/            빌드 후처리(404.html 생성)
.github/workflows/  GitHub Pages 배포(푸시·수동·매일 03:00 KST)
```

## 글꼴

| 용도 | 글꼴 | 변수 |
|---|---|---|
| 큰 제목·큰 글자 | Paperlogy | `--font-display` |
| 메뉴·버튼·번호·날짜 | Paperlogy | `--font-ui` |
| 세부 내용(설명·캡션·본문 문단) | 온글잎 허부장동생인체 | `--font-hand` |

어디에 무엇을 쓸지는 `src/styles/tokens.css`의 변수만 바꾸면 사이트 전체에 반영됩니다.

## 사진·자료 올리는 법

1. github.com 저장소에서 `public/assets/photos/<시리즈 이름>/`(또는 `works/`, `files/`) 폴더로 이동합니다.
2. **Add file → Upload files**를 누르고 파일을 끌어다 놓은 뒤 **Commit changes**를 누릅니다.
3. 1~3분 뒤 자동 배포가 끝나면 사이트에 반영됩니다.

> ⚠ **저장소는 공개입니다.** 한 번 올린 파일은 지워도 커밋 기록에 남습니다.
> 미공개 원본, 동의받지 않은 인물 사진, 민감한 문서는 올리지 마세요.
> 원본 사진은 PC에 따로 보관하고, 정리한 사진만 올려 주세요(사진 15MB, 자료 30MB 이하 권장).

WebP 자동 변환, 메타데이터 제거, `assets-manifest.json` 생성은 다음 단계에서 추가합니다.

## 배포 (GitHub Pages)

`main` 브랜치에 푸시하면 `.github/workflows/deploy.yml`이 빌드해서 배포합니다.

처음 한 번만 설정합니다.

1. 저장소 **Settings → Pages → Build and deployment → Source**를 **GitHub Actions**로 바꿉니다.
2. 같은 화면의 **Custom domain**에 `hhss.studio`를 입력하고 **Save**를 누릅니다.
3. DNS 확인이 끝나면 **Enforce HTTPS**를 체크합니다(인증서 발급에 몇 분~최대 24시간이 걸릴 수 있습니다).

수동으로 다시 배포하려면 **Actions → Deploy to GitHub Pages → Run workflow**를 누릅니다.

## 도메인 연결 (Cloudflare DNS)

Cloudflare 대시보드 → `hhss.studio` → **DNS → Records → Add record**에서 아래 레코드를 추가합니다.
**Proxy status는 모두 끔(회색 구름, DNS only)** 으로 둡니다. `review` 레코드는 건드리지 않습니다.

| Type | Name | Content |
|---|---|---|
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| AAAA | `@` | `2606:50c0:8000::153` |
| AAAA | `@` | `2606:50c0:8001::153` |
| AAAA | `@` | `2606:50c0:8002::153` |
| AAAA | `@` | `2606:50c0:8003::153` |
| CNAME | `www` | `gotoseoulhuh.github.io` |

> 위 IP는 GitHub 공식 문서 값입니다. 설정하기 전에 [GitHub Docs — Managing a custom domain](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)에서 한 번 더 확인하세요.

## Supabase 설정

다음 단계에서 추가합니다. 연결 값은 `.env.example`의 이름대로 `.env.local`에만 넣고 커밋하지 않습니다.
`service_role` 키는 저장소 어디에도 넣지 않습니다.
