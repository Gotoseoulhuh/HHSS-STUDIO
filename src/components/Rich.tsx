import type { ReactNode } from 'react'

/*
 * 개념 글의 작은 표기법
 *   **강조**        → 하늘색 굵은 글씨
 *   [[한 묶음]]      → 이 묶음 안에서는 줄을 바꾸지 않음
 *   "따옴표 속 말"   → 자동으로 한 묶음 (따옴표가 줄 끝에서 잘리지 않게)
 *   \n              → 여기서 줄을 바꿈
 */
const TOKEN = /(\*\*.+?\*\*|\[\[.+?\]\]|"[^"\n]{1,40}"|“[^”\n]{1,40}”|\n)/g

function parse(text: string, key = 'r'): ReactNode[] {
  return text.split(TOKEN).map((part, i) => {
    const k = `${key}-${i}`
    if (!part) return null
    if (part === '\n') return <br key={k} />
    if (part.startsWith('**')) return <strong key={k} className="kw">{parse(part.slice(2, -2), k)}</strong>
    if (part.startsWith('[[')) return <span key={k} className="nobr">{parse(part.slice(2, -2), k)}</span>
    if (/^["“]/.test(part)) return <span key={k} className="nobr">{part[0]}{parse(part.slice(1, -1), k)}{part[part.length - 1]}</span>
    return part
  })
}

export function Rich({ text }: { text: string }) {
  return <>{parse(text)}</>
}
