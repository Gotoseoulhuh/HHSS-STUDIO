import { useId, type ReactNode } from 'react'
import type { DiagramName } from '../data/types'

/*
 * 개념 설명용 도식 (16:9). 실제 영화 스틸 대신 직접 그린 그림 — 저작권 걱정 없음.
 * 색은 tokens.css 변수만 쓴다.
 */

const W = 320
const H = 180

/** 앉아 있는 사람 실루엣. (x, y) = 엉덩이 높이 가운데 */
function Person({ x, y, s = 1, fill, opacity = 1 }: { x: number; y: number; s?: number; fill: string; opacity?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} style={{ fill }} opacity={opacity}>
      <circle cx="0" cy="-44" r="11" />
      <path d="M-16 0 C-16 -22 -10 -30 0 -30 C10 -30 16 -22 16 0 Z" />
    </g>
  )
}

/** 화면 3등분 안내선 */
function Thirds() {
  return (
    <g style={{ stroke: 'var(--line)' }} strokeWidth="1" strokeDasharray="3 5">
      <line x1={W / 3} y1="0" x2={W / 3} y2={H} />
      <line x1={(W * 2) / 3} y1="0" x2={(W * 2) / 3} y2={H} />
      <line x1="0" y1={H / 3} x2={W} y2={H / 3} />
      <line x1="0" y1={(H * 2) / 3} x2={W} y2={(H * 2) / 3} />
    </g>
  )
}

function Desk({ x, w }: { x: number; w: number }) {
  return (
    <g style={{ fill: 'var(--text-dim)' }} opacity=".55">
      <rect x={x} y="118" width={w} height="5" />
      <rect x={x + 6} y="123" width="3" height="27" />
      <rect x={x + w - 9} y="123" width="3" height="27" />
    </g>
  )
}

export function ConceptDiagram({ name, label }: { name: DiagramName; label: string }) {
  const gid = useId().replace(/:/g, '')

  let body: ReactNode = null
  switch (name) {
    case 'light-morning':
      body = (
        <>
          <rect width={W} height={H} style={{ fill: 'var(--bg-raise)' }} />
          {/* 창문 + 쏟아지는 빛 */}
          <polygon points="40,110 120,30 310,165 120,165" style={{ fill: 'var(--title)' }} opacity=".12" />
          <rect x="40" y="30" width="80" height="80" style={{ fill: 'var(--title)' }} opacity=".4" />
          <g style={{ stroke: 'var(--bg-raise)' }} strokeWidth="3">
            <line x1="80" y1="30" x2="80" y2="110" />
            <line x1="40" y1="70" x2="120" y2="70" />
          </g>
          <line x1="0" y1="150" x2={W} y2="150" style={{ stroke: 'var(--line)' }} />
          <Desk x={160} w={110} />
          <Person x={215} y={118} fill="var(--text)" />
        </>
      )
      break
    case 'light-night':
      body = (
        <>
          <defs>
            <radialGradient id={`glow-${gid}`} cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" style={{ stopColor: 'var(--title)', stopOpacity: 0.32 }} />
              <stop offset="1" style={{ stopColor: 'var(--title)', stopOpacity: 0 }} />
            </radialGradient>
          </defs>
          <rect width={W} height={H} style={{ fill: 'var(--bg)' }} />
          {/* 어두운 창문 */}
          <rect x="40" y="30" width="80" height="80" style={{ fill: 'var(--bg-raise)' }} />
          <circle cx="98" cy="50" r="6" style={{ fill: 'var(--text-dim)' }} opacity=".5" />
          {/* 스탠드 불빛이 벽을 조금 밝힘 */}
          <circle cx="262" cy="92" r="120" fill={`url(#glow-${gid})`} />
          {/* 벽에 비친 커다란 그림자 */}
          <Person x={150} y={118} s={1.9} fill="var(--bg)" opacity={0.95} />
          <line x1="0" y1="150" x2={W} y2="150" style={{ stroke: 'var(--line)' }} />
          <Desk x={160} w={110} />
          {/* 스탠드 + 좁은 빛 */}
          <polygon points="254,92 268,92 270,118 205,118" style={{ fill: 'var(--title)' }} opacity=".22" />
          <line x1="262" y1="118" x2="262" y2="92" style={{ stroke: 'var(--text-dim)' }} strokeWidth="2" />
          <polygon points="252,92 272,92 266,82 258,82" style={{ fill: 'var(--title)' }} />
          <Person x={215} y={118} fill="var(--text-dim)" />
        </>
      )
      break
    case 'blocking-close':
      body = (
        <>
          <rect width={W} height={H} style={{ fill: 'var(--bg-raise)' }} />
          <Thirds />
          <line x1="0" y1="150" x2={W} y2="150" style={{ stroke: 'var(--line)' }} />
          <g style={{ fill: 'var(--text-dim)' }} opacity=".55">
            <rect x="100" y="128" width="120" height="5" />
            <rect x="108" y="133" width="3" height="17" />
            <rect x="209" y="133" width="3" height="17" />
          </g>
          <Person x={146} y={128} fill="var(--text)" />
          <Person x={176} y={128} fill="var(--title)" />
        </>
      )
      break
    case 'blocking-apart':
      body = (
        <>
          <rect width={W} height={H} style={{ fill: 'var(--bg-raise)' }} />
          <Thirds />
          <line x1="0" y1="150" x2={W} y2="150" style={{ stroke: 'var(--line)' }} />
          <g style={{ fill: 'var(--text-dim)' }} opacity=".55">
            <rect x="22" y="128" width="276" height="5" />
            <rect x="30" y="133" width="3" height="17" />
            <rect x="287" y="133" width="3" height="17" />
          </g>
          <Person x={48} y={128} fill="var(--text)" />
          <Person x={272} y={128} fill="var(--title)" />
          {/* 가운데 빈 공간 표시 */}
          <g style={{ stroke: 'var(--text-dim)' }} strokeWidth="1">
            <line x1="76" y1="96" x2="244" y2="96" strokeDasharray="4 4" />
            <polyline points="82,91 76,96 82,101" fill="none" />
            <polyline points="238,91 244,96 238,101" fill="none" />
          </g>
          <text x="160" y="86" textAnchor="middle" style={{ fill: 'var(--text-dim)', fontFamily: 'var(--font-ui)', fontSize: 11, letterSpacing: '.1em' }}>
            빈 공간
          </text>
        </>
      )
      break
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} preserveAspectRatio="xMidYMid slice">
      {body}
    </svg>
  )
}
