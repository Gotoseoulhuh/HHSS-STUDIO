interface Props {
  index: string
  title: string
  desc?: string
}

export function PageHead({ index, title, desc }: Props) {
  return (
    <header className="page-head container">
      <span className="page-head__index" data-reveal>{index}</span>
      <h1 data-reveal style={{ ['--i' as string]: 1 }}>{title}</h1>
      {desc && <p className="hand prose" data-reveal style={{ ['--i' as string]: 2 }}>{desc}</p>}
      <hr className="rule" data-reveal />
    </header>
  )
}
