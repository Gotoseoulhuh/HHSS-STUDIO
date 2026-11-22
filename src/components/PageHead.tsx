import type { ReactNode } from 'react'

interface Props {
  index: string
  title: string
  desc?: string
  /** 페이지별 꾸밈용 이름표 (예: 'page-head--guestbook') */
  className?: string
  /** 글자 뒤에 깔리는 배경 꾸밈 (예: 방명록의 떠다니는 후기) */
  backdrop?: ReactNode
}

export function PageHead({ index, title, desc, className, backdrop }: Props) {
  return (
    <header className={`page-head container${className ? ' ' + className : ''}`}>
      {backdrop}
      <span className="page-head__index" data-reveal>{index}</span>
      <h1 data-reveal style={{ ['--i' as string]: 1 }}>{title}</h1>
      {desc && <p className="hand prose" data-reveal style={{ ['--i' as string]: 2 }}>{desc}</p>}
      <hr className="rule" data-reveal />
    </header>
  )
}
