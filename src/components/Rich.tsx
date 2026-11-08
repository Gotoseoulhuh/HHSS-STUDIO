/** 문장 속 **강조** 부분을 하늘색 키워드로. (그 외 마크다운은 쓰지 않는다) */
export function Rich({ text }: { text: string }) {
  const parts = text.split(/\*\*(.+?)\*\*/g)
  return <>{parts.map((p, i) => (i % 2 ? <strong key={i} className="kw">{p}</strong> : p))}</>
}
