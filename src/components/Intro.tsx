import { useEffect, useRef, useState } from 'react'
import { asset } from '../lib/url'

const SEEN_KEY = 'hhss-intro-seen'
const VIDEO_SRC = asset('brand/hhss-intro.mp4')
/** 영상이 멈추거나 못 불러와도 이 시간 뒤에는 반드시 사이트를 보여 준다 */
const MAX_MS = 12000

type Phase = 'playing' | 'leaving' | 'done'

/** CSS 시간 값 → ms. 빌드 시 CSS 압축이 '1400ms'를 '1.4s'로 바꾸므로 단위를 꼭 해석한다 */
const toMs = (v: string, fallback: number) => {
  const n = parseFloat(v)
  if (Number.isNaN(n)) return fallback
  return v.trim().endsWith('ms') ? n : n * 1000
}

/**
 * 사이트 첫 진입 시: 흰 화면 한가운데 캐릭터 영상 재생 → 끝나면 천천히 사라지며 사이트가 드러남.
 * - 시작 여부는 index.html의 인라인 스크립트가 <html class="is-intro">로 결정(탭당 1회, 움직임 줄이기면 생략)
 * - 브라우저 자동재생 정책상 소리 없이 재생
 * - '건너뛰기' 버튼·Esc로 바로 넘길 수 있음
 */
export function Intro() {
  const [phase, setPhase] = useState<Phase>(() =>
    document.documentElement.classList.contains('is-intro') ? 'playing' : 'done',
  )
  const videoRef = useRef<HTMLVideoElement>(null)
  const skipRef = useRef<HTMLButtonElement>(null)

  const leave = () => setPhase((p) => (p === 'playing' ? 'leaving' : p))

  // 재생 중: 스크롤 막기, 안전 타이머, Esc, 자동재생 실패 대비
  useEffect(() => {
    if (phase !== 'playing') return
    document.body.style.overflow = 'hidden'
    skipRef.current?.focus({ preventScroll: true })
    const timer = window.setTimeout(leave, MAX_MS)
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') leave() }
    window.addEventListener('keydown', onKey)
    videoRef.current?.play().catch(leave)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('keydown', onKey)
    }
  }, [phase])

  // 사라지기 시작: 아래 사이트를 원래(어두운) 배경으로 되돌리고 첫 화면 애니메이션 시작
  useEffect(() => {
    if (phase !== 'leaving') return
    document.documentElement.classList.remove('is-intro')
    document.body.style.overflow = ''
    try { sessionStorage.setItem(SEEN_KEY, '1') } catch { /* 저장 불가 환경은 무시 */ }
    // transitionend가 오지 않는 경우 대비
    const fade = toMs(getComputedStyle(document.documentElement).getPropertyValue('--dur-intro-fade'), 1800)
    const t = window.setTimeout(() => setPhase('done'), fade + 300)
    return () => window.clearTimeout(t)
  }, [phase])

  if (phase === 'done') return null

  return (
    <div
      className={`intro${phase === 'leaving' ? ' intro--leaving' : ''}`}
      onTransitionEnd={(e) => { if (e.target === e.currentTarget && phase === 'leaving') setPhase('done') }}
    >
      <video
        ref={videoRef}
        className="intro__video"
        src={VIDEO_SRC}
        muted
        playsInline
        autoPlay
        preload="auto"
        aria-hidden="true"
        onEnded={leave}
        onError={leave}
      />
      <button ref={skipRef} className="intro__skip" onClick={leave}>
        건너뛰기
      </button>
    </div>
  )
}
