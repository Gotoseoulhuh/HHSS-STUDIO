// GitHub Pages는 SPA 하위 주소를 모르므로, 새로고침 시 404 대신 앱이 열리도록 index.html을 404.html로 복사한다.
// (3단계에서 페이지별 미리 렌더링 HTML과 sitemap.xml 생성이 이 스크립트에 추가된다.)
import { copyFileSync } from 'node:fs'
copyFileSync('dist/index.html', 'dist/404.html')
console.log('postbuild: dist/404.html 생성')
