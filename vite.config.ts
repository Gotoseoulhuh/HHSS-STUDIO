import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * 배포 위치(base). GitHub Actions가 Pages 설정에서 받아 BASE_PATH로 넘긴다.
 *  - 사용자 도메인(hhss.studio) 연결 전: '/HHSS-STUDIO'  → https://gotoseoulhuh.github.io/HHSS-STUDIO/
 *  - 연결 후:                         ''              → https://hhss.studio/
 * 로컬 개발은 항상 '/'.
 */
const base = (process.env.BASE_PATH ?? '').replace(/\/+$/, '') + '/'

export default defineConfig({
  plugins: [react()],
  base,
  // 사진·자료용 public/assets와 섞이지 않도록 빌드 산출물은 /_app 아래에
  build: { assetsDir: '_app' },
})
