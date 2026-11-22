import { useEffect, useRef, useState } from 'react'
import { asset } from '../lib/url'

/**
 * 영화 장면 전환: 블록 사이에서 영화의 한 장면(2~4초)이 화면 가득 재생된 뒤, 위로 올라가며 어두워지고 다음 블록이 흐린 상태에서 올라오며 선명해진다.
 *
 * - 구간 높이(260vh) 동안 화면이 고정(sticky)되고, 장면이 화면에 자리 잡으면 영화 본래 속도로 한 번 재생한다.
 * - 등장: 아래에서 올라오며 밝아짐(살짝 줌). 퇴장: 고정이 풀려 위로 올라가는 동안 어두워짐.
 * - 다음 블록: 화면 아래에서 올라오는 동안 흐림·투명 → 선명 (바로 뒤 형제 요소에 적용, 다 올라오면 스타일을 지움)
 * - 영상은 이 구간 근처까지 스크롤했을 때 불러온다(그 전에는 첫 장면 사진만).
 * - 화면 밖으로 나가면 처음으로 되감아, 다시 지나갈 때 처음부터 재생한다.
 * - '움직임 줄이기' 설정이면 켜지지 않는다(구간도 생기지 않음).
 *
 * 타이밍은 아래 상수와 styles/scenes.css의 .scene--clip 높이만 고치면 된다.
 */
const PLAY_AT = 0.6 // 등장이 이만큼 진행되면 재생 시작 (0 = 화면 아래에서 막 보임, 1 = 화면에 고정됨)
const OUT_END = 0.6 // 퇴장: 고정이 풀린 뒤 화면 높이의 이만큼 올라가면 완전히 어두워짐
const ZOOM = 0.06 // 등장할 때 살짝 크게 시작하는 정도
const NEXT_FROM = 0.98 // 다음 블록 윗변이 화면 높이의 이 지점(거의 맨 아래)일 때 가장 흐림
const NEXT_TO = 0.42 // 이 지점까지 올라오면 완전히 선명
const NEXT_BLUR = 10 // 가장 흐릴 때의 흐림(px)
const NEXT_RISE = 36 // 올라오는 거리(px)

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))

export function ClipScene({ src, poster, label }: { src: string; poster: string; label?: string }) {
  const section = useRef<HTMLDivElement>(null)
  const video = useRef<HTMLVideoElement>(null)
  const [live, setLive] = useState(false)

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setLive(!reduce.matches)
    sync()
    reduce.addEventListener('change', sync)
    return () => reduce.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    if (!live) return
    let raf = 0
    let loaded = false
    let playing = false

    const draw = () => {
      raf = 0
      const sec = section.current, v = video.current
      if (!sec || !v) return
      const vh = window.innerHeight
      const r = sec.getBoundingClientRect()

      // 1.5화면 앞까지 오면 영상 불러오기
      if (!loaded && r.top < vh * 2.5 && r.bottom > -vh) {
        loaded = true
        v.muted = true
        v.preload = 'auto'
        v.load()
      }

      const enter = clamp(1 - r.top / vh) // 0 → 1: 아래에서 올라와 화면에 고정될 때까지
      const pin = clamp(-r.top / (r.height - vh)) // 0 → 1: 고정된 동안
      const visible = r.top < vh && r.bottom > 0

      const leave = clamp(1 - r.bottom / vh) // 0 → 1: 고정이 풀려 위로 올라가 화면 밖으로 나갈 때까지

      const fadeIn = clamp(enter * 1.6 - 0.3)
      const fadeOut = 1 - clamp(leave / OUT_END)
      v.style.opacity = String(fadeIn * fadeOut)
      v.style.transform = `scale(${1 + ZOOM * (1 - enter)})`

      // 다음 블록: 흐린 상태에서 올라오며 선명해짐
      const next = sec.nextElementSibling as HTMLElement | null
      if (next) {
        const k = clamp((NEXT_FROM - next.getBoundingClientRect().top / vh) / (NEXT_FROM - NEXT_TO))
        if (k < 1 && visible) {
          next.style.filter = `blur(${((1 - k) * NEXT_BLUR).toFixed(2)}px)`
          next.style.opacity = String(0.25 + 0.75 * k)
          next.style.transform = `translateY(${((1 - k) * NEXT_RISE).toFixed(1)}px)`
        } else if (next.style.filter) {
          next.style.filter = ''
          next.style.opacity = ''
          next.style.transform = ''
        }
      }

      const shouldPlay = visible && enter >= PLAY_AT && pin < 1
      if (shouldPlay && !playing) {
        playing = true
        v.play().catch(() => { /* 자동 재생이 막힌 환경: 첫 장면 사진으로 남음 */ })
      } else if (!visible && playing) {
        playing = false
        v.pause()
        v.currentTime = 0
      }
    }

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(draw)
    }
    draw()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    const sec0 = section.current
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
      const next = sec0?.nextElementSibling as HTMLElement | null
      if (next) {
        next.style.filter = ''
        next.style.opacity = ''
        next.style.transform = ''
      }
    }
  }, [live])

  if (!live) return null

  return (
    <div ref={section} className="scene scene--clip" role="img" aria-label={label ?? '영화의 한 장면'}>
      <div className="scene__pin">
        <video ref={video} className="scene__video" src={asset(src)} poster={asset(poster)} muted playsInline preload="none" disablePictureInPicture tabIndex={-1} />
      </div>
    </div>
  )
}
