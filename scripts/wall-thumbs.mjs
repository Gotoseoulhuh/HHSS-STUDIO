// 작품 목록 머리에 떠다니는 사진용 작은 그림 만들기
//   public/assets/works/<작품>/<파일>  →  public/assets/wall/<작품>/<파일이름>.jpg  (높이 220px)
// 작품 사진을 새로 넣었으면 `npm run wall` 을 한 번 실행하고, 생긴 파일을 같이 커밋한다.
// (화면 쪽: src/components/WorkPhotoWall.tsx — 작은 그림이 없는 사진은 화면에서 빠진다)
import { existsSync, mkdirSync, readdirSync, statSync } from 'node:fs'
import { basename, extname, join } from 'node:path'
import sharp from 'sharp'

const SRC = 'public/assets/works'
const OUT = 'public/assets/wall'
const HEIGHT = 220
// 손글씨·사인(투명 배경)과 스토리보드 스케치는 떠다니는 사진에 쓰지 않는다
const SKIP = /(-letter|-sign)\.|^storyboard-/

let made = 0
for (const dir of readdirSync(SRC)) {
  if (!statSync(join(SRC, dir)).isDirectory()) continue
  for (const file of readdirSync(join(SRC, dir))) {
    if (!/\.(jpe?g|png|webp)$/i.test(file) || SKIP.test(file)) continue
    const from = join(SRC, dir, file)
    const to = join(OUT, dir, basename(file, extname(file)) + '.jpg')
    if (existsSync(to) && statSync(to).mtimeMs >= statSync(from).mtimeMs) continue
    mkdirSync(join(OUT, dir), { recursive: true })
    await sharp(from).resize({ height: HEIGHT }).flatten({ background: '#0b100e' }).jpeg({ quality: 72, mozjpeg: true }).toFile(to)
    made++
  }
}
console.log(`wall-thumbs: ${made}개 만듦`)
