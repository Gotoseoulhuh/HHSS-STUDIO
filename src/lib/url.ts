/**
 * public/ 아래 파일 주소. 배포 위치(base)에 맞춰 앞부분을 붙인다.
 *  - hhss.studio 연결 후: '/'            → /brand/hhss-logo.png
 *  - 연결 전 github.io:   '/HHSS-STUDIO/' → /HHSS-STUDIO/brand/hhss-logo.png
 */
export const asset = (path: string) => import.meta.env.BASE_URL + path.replace(/^\/+/, '')

/** 라우터 basename ('/HHSS-STUDIO' 또는 '/') */
export const routerBase = import.meta.env.BASE_URL.replace(/\/$/, '') || '/'
