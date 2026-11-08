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

const LABEL = { fill: 'var(--text-dim)', fontFamily: 'var(--font-ui)', fontSize: 11, letterSpacing: '.06em' } as const

/** 서 있는 사람. (x, y) = 발끝 가운데 */
function Stand({ x, y, s = 1, fill }: { x: number; y: number; s?: number; fill: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} style={{ fill }}>
      <circle cx="0" cy="-60" r="9" />
      <path d="M-12 -47 C-12 -52 12 -52 12 -47 L10 -22 L7 0 L1.5 0 L0 -18 L-1.5 0 L-7 0 L-10 -22 Z" />
    </g>
  )
}

/** 얼굴. mood로 표정만 바꾼다 */
function Face({ cx, cy, r, fill, mood }: { cx: number; cy: number; r: number; fill: string; mood: 'neutral' | 'sad' | 'worried' | 'surprised' }) {
  const e = r * 0.32
  const ey = cy - r * 0.02
  const my = cy + r * 0.42
  const w = r * 0.26
  const mouth =
    mood === 'sad' ? `M${cx - w} ${my + 4} Q${cx} ${my - 5} ${cx + w} ${my + 4}`
    : mood === 'worried' ? `M${cx - w} ${my} Q${cx - w / 2} ${my - 4} ${cx} ${my} T${cx + w} ${my}`
    : `M${cx - w} ${my} L${cx + w} ${my}`
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} style={{ fill }} />
      {/* 앞머리 */}
      <path d={`M${cx - r} ${cy - r * 0.1} A${r} ${r} 0 0 1 ${cx + r} ${cy - r * 0.1} Q${cx} ${cy - r * 0.5} ${cx - r} ${cy - r * 0.1} Z`} style={{ fill: 'var(--text-dim)' }} />
      {mood === 'surprised' ? (
        <>
          <circle cx={cx - e} cy={ey} r={r * 0.08} style={{ fill: 'var(--bg)' }} />
          <circle cx={cx + e} cy={ey} r={r * 0.08} style={{ fill: 'var(--bg)' }} />
          <ellipse cx={cx} cy={my} rx={r * 0.1} ry={r * 0.14} style={{ fill: 'var(--bg)' }} />
        </>
      ) : (
        <>
          <circle cx={cx - e} cy={ey} r={r * 0.06} style={{ fill: 'var(--bg)' }} />
          <circle cx={cx + e} cy={ey} r={r * 0.06} style={{ fill: 'var(--bg)' }} />
          <path d={mouth} fill="none" style={{ stroke: 'var(--bg)' }} strokeWidth={Math.max(1.5, r * 0.05)} strokeLinecap="round" />
        </>
      )}
    </g>
  )
}

/** 위에서 본 카메라 + 보는 범위(부채꼴). angle: 렌즈 방향(도, -90 = 위쪽) */
function Cam({ x, y, angle, small = false }: { x: number; y: number; angle: number; small?: boolean }) {
  const len = small ? 56 : 96
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle + 90})`}>
      <polygon points={`0,0 ${-len * 0.55},${-len} ${len * 0.55},${-len}`} style={{ fill: 'var(--title)' }} opacity=".12" />
      <rect x="-9" y="-2" width="18" height="12" style={{ fill: 'var(--title)' }} />
      <rect x="-4" y="-7" width="8" height="6" style={{ fill: 'var(--title)' }} />
    </g>
  )
}

function Arrow({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  const a = Math.atan2(y2 - y1, x2 - x1)
  const h = 7
  const p1 = `${x2 - h * Math.cos(a - 0.5)},${y2 - h * Math.sin(a - 0.5)}`
  const p2 = `${x2 - h * Math.cos(a + 0.5)},${y2 - h * Math.sin(a + 0.5)}`
  return (
    <g style={{ stroke: 'var(--title)' }} strokeWidth="1.5" fill="none">
      <line x1={x1} y1={y1} x2={x2} y2={y2} />
      <polyline points={`${p1} ${x2},${y2} ${p2}`} />
    </g>
  )
}

/** 편집 그림의 컷 한 칸 (120×76) */
function Shot({ x, y, children }: { x: number; y: number; children: ReactNode }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width="120" height="76" style={{ fill: 'var(--bg-raise)', stroke: 'var(--line)' }} />
      <svg width="120" height="76" overflow="hidden">{children}</svg>
    </g>
  )
}

function Waves({ x, y }: { x: number; y: number }) {
  return (
    <g fill="none" style={{ stroke: 'var(--title)' }} strokeWidth="2">
      <path d={`M${x} ${y - 8} a10 10 0 0 1 0 20`} />
      <path d={`M${x + 8} ${y - 16} a20 20 0 0 1 0 36`} opacity=".6" />
      <path d={`M${x + 16} ${y - 24} a30 30 0 0 1 0 52`} opacity=".3" />
    </g>
  )
}

function Note({ x, y }: { x: number; y: number }) {
  return (
    <g style={{ fill: 'var(--title)' }}>
      <ellipse cx={x} cy={y} rx="6" ry="4.5" transform={`rotate(-20 ${x} ${y})`} />
      <rect x={x + 4.5} y={y - 22} width="1.8" height="22" />
      <path d={`M${x + 6} ${y - 22} q8 4 6 12 q-1 -6 -6 -7 Z`} />
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
    /* ───────── 02 숏 사이즈 ───────── */
    case 'shot-long':
      body = (
        <>
          <rect width={W} height={H} style={{ fill: 'var(--bg-raise)' }} />
          <path d="M0 120 C60 92 110 98 160 110 C210 122 260 90 320 100 L320 180 L0 180 Z" style={{ fill: 'var(--line)' }} />
          <path d="M0 140 C80 128 180 132 320 126 L320 180 L0 180 Z" style={{ fill: 'var(--bg)' }} opacity=".6" />
          <g style={{ fill: 'var(--text-dim)' }} opacity=".7">
            <rect x="40" y="92" width="26" height="30" /><polygon points="36,92 53,78 70,92" />
            <rect x="250" y="84" width="4" height="30" /><circle cx="252" cy="80" r="12" />
            <rect x="272" y="90" width="4" height="26" /><circle cx="274" cy="86" r="10" />
          </g>
          <Stand x={190} y={136} s={0.42} fill="var(--title)" />
        </>
      )
      break
    case 'shot-close':
      body = (
        <>
          <rect width={W} height={H} style={{ fill: 'var(--bg-raise)' }} />
          <path d="M70 180 C80 150 120 140 160 140 C200 140 240 150 250 180 Z" style={{ fill: 'var(--text-dim)' }} />
          <Face cx={160} cy={84} r={62} fill="var(--text)" mood="sad" />
          <path d="M128 100 q-4 10 0 16 q4 -6 0 -16 Z" style={{ fill: 'var(--title)' }} />
        </>
      )
      break
    case 'shot-full':
      body = (
        <>
          <rect width={W} height={H} style={{ fill: 'var(--bg-raise)' }} />
          <line x1="0" y1="166" x2={W} y2="166" style={{ stroke: 'var(--line)' }} />
          <Stand x={160} y={166} s={1.95} fill="var(--text)" />
        </>
      )
      break
    case 'shot-medium':
      body = (
        <>
          <rect width={W} height={H} style={{ fill: 'var(--bg-raise)' }} />
          <path d="M92 180 C92 128 118 112 160 112 C202 112 228 128 228 180 Z" style={{ fill: 'var(--text-dim)' }} />
          <Face cx={160} cy={72} r={34} fill="var(--text)" mood="neutral" />
          <ellipse cx="222" cy="150" rx="12" ry="9" style={{ fill: 'var(--text)' }} />
        </>
      )
      break

    /* ───────── 03 카메라 앵글 ───────── */
    case 'angle-high':
      body = (
        <>
          <rect width={W} height={H} style={{ fill: 'var(--bg)' }} />
          <g style={{ stroke: 'var(--line)' }} strokeWidth="1">
            {[0, 40, 80, 120, 160, 200, 240, 280, 320].map((x) => <line key={`v${x}`} x1={x} y1="0" x2={x} y2={H} />)}
            {[0, 40, 80, 120, 160].map((y) => <line key={`h${y}`} x1="0" y1={y} x2={W} y2={y} />)}
          </g>
          <ellipse cx="166" cy="104" rx="26" ry="10" style={{ fill: '#000' }} opacity=".35" />
          <ellipse cx="160" cy="96" rx="24" ry="13" style={{ fill: 'var(--text-dim)' }} />
          <circle cx="160" cy="92" r="11" style={{ fill: 'var(--text)' }} />
          <path d="M150 88 a10 10 0 0 1 20 0 Z" style={{ fill: 'var(--text-dim)' }} />
        </>
      )
      break
    case 'angle-low':
      body = (
        <>
          <rect width={W} height={H} style={{ fill: 'var(--bg-raise)' }} />
          <rect width={W} height={H} style={{ fill: 'var(--title)' }} opacity=".08" />
          <polygon points="96,180 224,180 186,78 134,78" style={{ fill: 'var(--text-dim)' }} />
          <polygon points="134,80 186,80 178,46 142,46" style={{ fill: 'var(--text)' }} />
          <circle cx="160" cy="34" r="13" style={{ fill: 'var(--text)' }} />
          <line x1="160" y1="180" x2="160" y2="96" style={{ stroke: 'var(--bg-raise)' }} strokeWidth="2" opacity=".6" />
        </>
      )
      break
    case 'angle-eye':
      body = (
        <>
          <rect width={W} height={H} style={{ fill: 'var(--bg-raise)' }} />
          <line x1="0" y1="78" x2={W} y2="78" style={{ stroke: 'var(--title)' }} strokeDasharray="4 5" opacity=".6" />
          <rect x="40" y="40" width="50" height="110" style={{ fill: 'var(--line)' }} />
          <path d="M112 180 C112 132 132 118 160 118 C188 118 208 132 208 180 Z" style={{ fill: 'var(--text-dim)' }} />
          <Face cx={160} cy={84} r={30} fill="var(--text)" mood="neutral" />
        </>
      )
      break
    case 'angle-dutch':
      body = (
        <>
          <rect width={W} height={H} style={{ fill: 'var(--bg)' }} />
          <g transform="rotate(-14 160 90)">
            <rect x="-40" y="-40" width="400" height="260" style={{ fill: 'var(--bg-raise)' }} />
            <line x1="-40" y1="78" x2="360" y2="78" style={{ stroke: 'var(--title)' }} strokeDasharray="4 5" opacity=".6" />
            <rect x="40" y="40" width="50" height="110" style={{ fill: 'var(--line)' }} />
            <path d="M112 200 C112 132 132 118 160 118 C188 118 208 132 208 200 Z" style={{ fill: 'var(--text-dim)' }} />
            <Face cx={160} cy={84} r={30} fill="var(--text)" mood="worried" />
          </g>
        </>
      )
      break

    /* ───────── 04 카메라 움직임 (위에서 내려다본 그림) ───────── */
    case 'move-fixed':
      body = (
        <>
          <rect width={W} height={H} style={{ fill: 'var(--bg-raise)' }} />
          <Cam x={160} y={164} angle={-90} />
          {[70, 160, 250].map((x, i) => <circle key={x} cx={x} cy="50" r="10" style={{ fill: 'var(--text)' }} opacity={0.3 + i * 0.35} />)}
          <Arrow x1={88} y1={50} x2={238} y2={50} />
          <text x="160" y="104" textAnchor="middle" style={LABEL}>카메라는 그대로</text>
        </>
      )
      break
    case 'move-track':
      body = (
        <>
          <rect width={W} height={H} style={{ fill: 'var(--bg-raise)' }} />
          {[70, 160, 250].map((x, i) => (
            <g key={x} opacity={0.3 + i * 0.35}>
              <circle cx={x} cy="50" r="10" style={{ fill: 'var(--text)' }} />
              <Cam x={x} y={132} angle={-90} small />
            </g>
          ))}
          <Arrow x1={88} y1={50} x2={238} y2={50} />
          <Arrow x1={88} y1={160} x2={238} y2={160} />
          <text x="160" y="98" textAnchor="middle" style={LABEL}>나란히 함께</text>
        </>
      )
      break
    case 'move-push':
      body = (
        <>
          <rect width={W} height={H} style={{ fill: 'var(--bg-raise)' }} />
          <path d="M104 180 C104 130 128 112 160 112 C192 112 216 130 216 180 Z" style={{ fill: 'var(--text-dim)' }} />
          <Face cx={160} cy={78} r={30} fill="var(--text)" mood="neutral" />
          <g fill="none" style={{ stroke: 'var(--title)' }} strokeDasharray="5 5">
            <rect x="14" y="10" width="292" height="164" opacity=".35" />
            <rect x="66" y="36" width="188" height="106" opacity=".6" />
            <rect x="110" y="44" width="100" height="62" />
          </g>
          <Arrow x1={20} y1={16} x2={62} y2={33} />
          <Arrow x1={300} y1={16} x2={258} y2={33} />
        </>
      )
      break
    case 'move-handheld':
      body = (
        <>
          <rect width={W} height={H} style={{ fill: 'var(--bg-raise)' }} />
          <path d="M104 180 C104 130 128 112 160 112 C192 112 216 130 216 180 Z" style={{ fill: 'var(--text-dim)' }} />
          <Face cx={160} cy={78} r={30} fill="var(--text)" mood="surprised" />
          <g fill="none" style={{ stroke: 'var(--title)' }}>
            <rect x="40" y="20" width="240" height="140" transform="rotate(-3 160 90)" opacity=".7" />
            <rect x="46" y="16" width="240" height="140" transform="rotate(2 160 90)" opacity=".45" />
            <rect x="34" y="24" width="240" height="140" transform="rotate(4 160 90)" opacity=".25" />
          </g>
          <polyline points="12,90 18,80 24,98 30,82 36,94" fill="none" style={{ stroke: 'var(--text-dim)' }} />
          <polyline points="284,90 290,80 296,98 302,82 308,94" fill="none" style={{ stroke: 'var(--text-dim)' }} />
        </>
      )
      break

    /* ───────── 05 편집 ───────── */
    case 'edit-face-cake':
    case 'edit-face-rain':
      body = (
        <>
          <rect width={W} height={H} style={{ fill: 'var(--bg)' }} />
          <Shot x={16} y={34}>
            <Face cx={60} cy={44} r={26} fill="var(--text)" mood="neutral" />
          </Shot>
          <text x="160" y="80" textAnchor="middle" style={{ ...LABEL, fontSize: 22, fill: 'var(--title)' }}>+</text>
          <Shot x={184} y={34}>
            {name === 'edit-face-cake' ? (
              <>
                <rect x="30" y="40" width="60" height="26" style={{ fill: 'var(--text)' }} />
                <rect x="30" y="40" width="60" height="6" style={{ fill: 'var(--title)' }} />
                {[42, 60, 78].map((x) => (
                  <g key={x}><rect x={x - 1.5} y="26" width="3" height="14" style={{ fill: 'var(--text-dim)' }} /><ellipse cx={x} cy="22" rx="3" ry="5" style={{ fill: 'var(--title)' }} /></g>
                ))}
              </>
            ) : (
              <>
                <rect x="24" y="10" width="72" height="56" style={{ fill: 'var(--bg)' }} />
                <line x1="60" y1="10" x2="60" y2="66" style={{ stroke: 'var(--line)' }} strokeWidth="3" />
                <line x1="24" y1="38" x2="96" y2="38" style={{ stroke: 'var(--line)' }} strokeWidth="3" />
                {[[32, 14], [48, 24], [70, 16], [86, 26], [38, 44], [78, 46], [56, 52]].map(([x, y]) => (
                  <line key={`${x}-${y}`} x1={x} y1={y} x2={x - 3} y2={y + 9} style={{ stroke: 'var(--title)' }} strokeWidth="1.5" />
                ))}
              </>
            )}
          </Shot>
          <text x="160" y="150" textAnchor="middle" style={{ ...LABEL, fontSize: 13, fill: 'var(--title)' }}>
            {name === 'edit-face-cake' ? '= 설렘' : '= 쓸쓸함'}
          </text>
        </>
      )
      break
    case 'edit-insert':
      body = (
        <>
          <rect width={W} height={H} style={{ fill: 'var(--bg)' }} />
          <Shot x={16} y={34}>
            <rect x="0" y="58" width="120" height="2" style={{ fill: 'var(--line)' }} />
            <rect x="74" y="18" width="28" height="40" style={{ fill: 'var(--line)' }} />
            <rect x="80" y="36" width="10" height="7" style={{ fill: 'var(--title)' }} />
            <Stand x={40} y={60} s={0.62} fill="var(--text)" />
          </Shot>
          <Arrow x1={142} y1={72} x2={178} y2={72} />
          <Shot x={184} y={34}>
            <rect x="0" y="0" width="120" height="76" style={{ fill: 'var(--line)' }} opacity=".6" />
            <polygon points="36,54 60,28 84,54 60,46" style={{ fill: 'var(--title)' }} />
            <polygon points="60,28 68,18 64,40" style={{ fill: 'var(--title)' }} opacity=".7" />
          </Shot>
          <text x="244" y="134" textAnchor="middle" style={LABEL}>잠깐 크게</text>
        </>
      )
      break
    case 'edit-cross':
      body = (
        <>
          <rect width={W} height={H} style={{ fill: 'var(--bg)' }} />
          {[0, 1, 2, 3, 4].map((i) => {
            const a = i % 2 === 0
            const x = 14 + i * 60
            const c = a ? 'var(--text)' : 'var(--title)'
            return (
              <g key={i}>
                <rect x={x} y="50" width="52" height="40" style={{ fill: 'var(--bg-raise)', stroke: a ? 'var(--text-dim)' : 'var(--title)' }} />
                <ellipse cx={x + 18} cy="80" rx="8" ry="4" style={{ fill: c }} />
                <ellipse cx={x + 34} cy="74" rx="8" ry="4" style={{ fill: c }} />
                <text x={x + 26} y="110" textAnchor="middle" style={{ ...LABEL, fill: a ? 'var(--text-dim)' : 'var(--title)' }}>{a ? 'A' : 'B'}</text>
              </g>
            )
          })}
          <Arrow x1={14} y1={132} x2={300} y2={132} />
          <text x="160" y="158" textAnchor="middle" style={LABEL}>번갈아 → 곧 만날까?</text>
        </>
      )
      break

    /* ───────── 06 사운드 ───────── */
    case 'sound-in':
    case 'sound-silence':
      body = (
        <>
          <rect width={W} height={H} style={{ fill: 'var(--bg-raise)' }} />
          <line x1="0" y1="150" x2={W} y2="150" style={{ stroke: 'var(--line)' }} />
          <Desk x={120} w={150} />
          <Person x={160} y={118} fill="var(--text)" />
          <rect x="222" y="100" width="30" height="18" rx="3" style={{ fill: 'var(--text-dim)' }} />
          <circle cx="244" cy="109" r="5" style={{ fill: 'var(--bg-raise)' }} />
          {name === 'sound-in' ? (
            <Waves x={258} y={100} />
          ) : (
            <g>
              <text x="252" y="76" textAnchor="middle" style={{ ...LABEL, fontSize: 18 }}>. . .</text>
              <line x1="262" y1="94" x2="290" y2="66" style={{ stroke: 'var(--title)' }} strokeWidth="2" />
            </g>
          )}
        </>
      )
      break
    case 'sound-out':
      body = (
        <>
          <rect width={W} height={H} style={{ fill: 'var(--bg)' }} />
          <rect x="56" y="24" width="208" height="120" style={{ fill: 'var(--bg-raise)', stroke: 'var(--line)' }} />
          <line x1="56" y1="126" x2="264" y2="126" style={{ stroke: 'var(--line)' }} />
          <Person x={160} y={114} fill="var(--text)" />
          <Note x={24} y={52} /><Note x={286} y={44} /><Note x={292} y={118} /><Note x={22} y={128} />
          <text x="160" y="166" textAnchor="middle" style={LABEL}>음악·나레이션은 화면 밖에서</text>
        </>
      )
      break
    case 'sound-offscreen':
      body = (
        <>
          <rect width={W} height={H} style={{ fill: 'var(--bg-raise)' }} />
          <line x1="0" y1="150" x2={W} y2="150" style={{ stroke: 'var(--line)' }} />
          <path d="M100 150 C100 112 116 102 136 102 C156 102 172 112 172 150 Z" style={{ fill: 'var(--text-dim)' }} />
          <circle cx="142" cy="78" r="18" style={{ fill: 'var(--text)' }} />
          <circle cx="152" cy="74" r="2.5" style={{ fill: 'var(--bg)' }} />
          <text x="186" y="66" style={{ ...LABEL, fontSize: 18, fill: 'var(--title)' }}>?</text>
          <g fill="none" style={{ stroke: 'var(--title)' }} strokeWidth="2">
            <path d="M300 70 a26 26 0 0 0 0 52" opacity=".9" />
            <path d="M284 58 a40 40 0 0 0 0 76" opacity=".6" />
            <path d="M268 46 a54 54 0 0 0 0 100" opacity=".3" />
          </g>
          <text x="306" y="170" textAnchor="end" style={LABEL}>뚜벅 뚜벅</text>
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
