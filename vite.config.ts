import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 사용자 도메인(hhss.studio) 루트에 배포하므로 base는 '/'
export default defineConfig({
  plugins: [react()],
  base: '/',
  // 사진·자료용 public/assets와 섞이지 않도록 빌드 산출물은 /_app 아래에
  build: { assetsDir: '_app' },
})
