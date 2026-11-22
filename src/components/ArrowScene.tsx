import { useEffect, useRef, useState } from 'react'

/**
 * 화살 전환: 정면에서 날아오는 화살이 화면을 덮고, 덮인 색(배경색)이 걷히면 다음 블록이 나타난다.
 *
 * - 이 요소 자체는 본문 흐름 속의 '빈 구간'이고, 화살은 화면에 고정된 층(.scene__stage)에 그린다.
 * - 스크롤 위치 → 진행률 p(0~1) → transform·opacity만 바꾼다. (스크롤 한 번에 계산 1회, requestAnimationFrame)
 * - 원근: 크기 = 1 / 거리. 화살촉은 거리 d, 깃은 그보다 화살 길이(L)만큼 뒤(d + L)에 있어
 *   가까워질수록 화살촉만 급격히 커져 깃을 가리고 화면을 덮는다.
 * - '움직임 줄이기' 설정이면 켜지지 않는다(빈 구간도 생기지 않음).
 *
 * 타이밍은 아래 상수만 고치면 된다.
 */
const START = 1.5 // 빈 구간 윗변이 화면 높이의 150% 지점(화면 아래로 반 화면)일 때 시작 — 앞 내용이 보이는 동안 날아온다
const END = -0.3 // 윗변이 화면 위로 30% 올라갔을 때 끝
const FLY = 0.64 // 진행률 0 ~ FLY: 날아옴 (FLY에서 화면이 완전히 덮임 — 앞 내용이 아직 화면에 남아 있을 때)
const FADE = 0.83 // FLY ~ FADE: 덮인 채 유지(앞 내용이 화면 밖으로 나감), FADE ~ 1: 덮은 색이 걷힘
const D0 = 1125 // 출발 거리 (도착 거리 1 기준). 클수록 처음에 더 작은 점
const L = 10 // 화살 길이(화살촉~깃 사이 거리). 클수록 깃이 일찍 가려짐
const HEAD_MAX = 4.5 // 화살촉 최종 배율 (화면을 덮는 크기)
const FEATHER = 3 // 깃이 화살촉보다 얼마나 넓게 퍼지는지
const TILT = 30 // 살짝 비껴 날아오는 정도: 깃이 화살촉에서 벗어나는 거리(vmin, 깃 배율 1 기준)
const TILT_DEG = -38 // 깃이 벗어나는 방향 (0 = 오른쪽, -90 = 위)

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))

export function ArrowScene() {
  const spacer = useRef<HTMLDivElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const head = useRef<HTMLDivElement>(null)
  const facets = useRef<HTMLDivElement>(null)
  const shaft = useRef<HTMLDivElement>(null)
  const fletch = useRef<SVGSVGElement>(null)
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
    let last = -1

    const draw = () => {
      raf = 0
      const sp = spacer.current, st = stage.current, hd = head.current, fc = facets.current, fl = fletch.current, sh = shaft.current
      if (!sp || !st || !hd || !fc || !fl || !sh) return

      const t = sp.getBoundingClientRect().top / window.innerHeight
      const p = clamp((START - t) / (START - END))
      if (p === last) return
      last = p

      if (p <= 0 || p >= 1) {
        st.style.visibility = 'hidden'
        return
      }
      st.style.visibility = 'visible'

      const q = clamp(p / FLY)
      const d = D0 * Math.pow(1 / D0, q) // 거리: D0 → 1 (지수 감소 = 일정한 속도감)
      const headScale = HEAD_MAX / d
      const fletchScale = (FEATHER * HEAD_MAX) / (d + L)

      // 깃은 화살촉보다 뒤에 있어 화면에서는 비스듬히 벗어나 보이고, 그 사이를 살대가 잇는다
      const off = TILT * fletchScale // vmin
      const rad = (TILT_DEG * Math.PI) / 180
      const behind = String(clamp((0.93 - q) / 0.06)) // 화살촉에 가려진 뒤에는 그리지 않음

      hd.style.transform = `translate(-50%, -50%) rotate(45deg) scale(${headScale})`
      fl.style.transform = `translate(-50%, -50%) translate(${off * Math.cos(rad)}vmin, ${off * Math.sin(rad)}vmin) rotate(${q * 50}deg) scale(${fletchScale})`
      fl.style.opacity = behind
      // 살대: 기준 크기 100vmin × 10vmin. 길이는 깃까지, 굵기는 화살촉 쪽에 맞춤
      sh.style.transform = `translate(0, -50%) rotate(${TILT_DEG}deg) scale(${off / 100}, ${headScale * 2.2})`
      sh.style.opacity = behind
      fc.style.opacity = String(clamp((0.97 - q) / 0.25)) // 덮일수록 쇠 빛이 배경색으로 가라앉음
      st.style.opacity = String(clamp((1 - p) / (1 - FADE))) // 다 덮은 뒤 서서히 걷힘
    }

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(draw)
    }
    draw()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [live])

  if (!live) return null

  return (
    <div ref={spacer} className="scene scene--arrow" aria-hidden="true">
      <div ref={stage} className="scene__stage">
        {/* 깃: 영화 소품처럼 짙은 갈색 바탕에 밝은 줄무늬. 정면에서 보면 세 갈래로 퍼진다 */}
        <svg ref={fletch} className="scene__fletch" viewBox="-100 -100 200 200">
          <defs>
            <clipPath id="arrow-vane">
              <path d="M0 -10 C 9 -30, 15 -62, 5 -96 L 0 -99 L -5 -96 C -15 -62, -9 -30, 0 -10 Z" />
            </clipPath>
            <g id="arrow-feather">
              <g clipPath="url(#arrow-vane)">
                <rect x="-16" y="-100" width="32" height="92" fill="#2a2018" />
                {[-90, -78, -66, -54, -42, -30, -19].map((y) => (
                  <path key={y} d={`M-16 ${y + 5} L0 ${y} L16 ${y + 5} L16 ${y + 9.5} L0 ${y + 4.5} L-16 ${y + 9.5} Z`} fill="#cfc4ae" />
                ))}
              </g>
              <path d="M0 -8 L0 -99" stroke="#17110c" strokeWidth="1.6" />
            </g>
          </defs>
          <use href="#arrow-feather" />
          <use href="#arrow-feather" transform="rotate(120)" />
          <use href="#arrow-feather" transform="rotate(240)" />
          <circle r="9" fill="#5b4028" />
        </svg>
        <div ref={shaft} className="scene__shaft" />
        {/* 화살촉: 네 면으로 깎인 쇠. 끝까지 커지면 배경색 한 장이 된다 */}
        <div ref={head} className="scene__head">
          <div ref={facets} className="scene__facets" />
        </div>
      </div>
    </div>
  )
}
