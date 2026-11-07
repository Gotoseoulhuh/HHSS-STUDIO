import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { checkPassword, isUnlocked, rememberUnlock } from '../lib/gate'
import { asset } from '../lib/url'

/** 인트로를 보여 줄지 — index.html 인라인 스크립트와 같은 조건 */
function shouldPlayIntro() {
  try {
    return !sessionStorage.getItem('hhss-intro-seen') && !matchMedia('(prefers-reduced-motion: reduce)').matches
  } catch {
    return false
  }
}

/** 공개 전 가림막: 검은 화면 + 로고 + 비밀번호. 통과하면 인트로 → 사이트 순으로 이어진다. */
export function Gate({ children }: { children: ReactNode }) {
  const [unlocked, setUnlocked] = useState(() => {
    const ok = isUnlocked()
    // 가림막을 끈 경우(GATE_ENABLED=false) 등: index.html이 붙인 is-gated를 걷고 인트로 여부를 다시 정한다
    const root = document.documentElement
    if (ok && root.classList.contains('is-gated')) {
      root.classList.remove('is-gated')
      if (shouldPlayIntro()) root.classList.add('is-intro')
    }
    return ok
  })
  const [value, setValue] = useState('')
  const [status, setStatus] = useState<'idle' | 'checking' | 'wrong'>('idle')
  const inputRef = useRef<HTMLInputElement>(null)

  // 휴대폰 키보드가 올라오면 '실제로 보이는 영역' 기준으로 다시 배치 (visualViewport)
  const [view, setView] = useState<{ top?: number; height?: number; compact: boolean }>({ compact: false })
  useEffect(() => {
    if (unlocked) return
    const vv = window.visualViewport
    if (!vv) return
    const update = () => setView({ top: vv.offsetTop, height: vv.height, compact: vv.height < 480 })
    update()
    vv.addEventListener('resize', update)
    vv.addEventListener('scroll', update)
    return () => {
      vv.removeEventListener('resize', update)
      vv.removeEventListener('scroll', update)
    }
  }, [unlocked])

  // 자동 포커스는 마우스 기기에서만 — 휴대폰은 들어오자마자 키보드가 화면을 가리지 않게
  useEffect(() => {
    if (!unlocked && matchMedia('(pointer: fine)').matches) inputRef.current?.focus()
  }, [unlocked])

  if (unlocked) return <>{children}</>

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!value) return
    setStatus('checking')
    if (await checkPassword(value)) {
      rememberUnlock()
      const root = document.documentElement
      root.classList.remove('is-gated')
      if (shouldPlayIntro()) root.classList.add('is-intro')
      setUnlocked(true)
    } else {
      setStatus('wrong')
      setValue('')
      inputRef.current?.focus()
    }
  }

  return (
    <main className={`gate${view.compact ? ' gate--compact' : ''}`} style={{ top: view.top, height: view.height }}>
      {/* 로고는 보이는 화면의 정중앙(가운데 줄), 입력은 그 아래 줄 */}
      <h1 className="gate__logo">
        <img src={asset('brand/hhss-logo.png')} alt="HHSS" />
      </h1>
      <form className="gate__form" onSubmit={onSubmit}>
        <label htmlFor="gate-pw" className="visually-hidden">비밀번호</label>
        <div className="gate__row">
          <input
            ref={inputRef}
            id="gate-pw"
            className="gate__input"
            type="password"
            autoComplete="current-password"
            enterKeyHint="go"
            placeholder="비밀번호"
            value={value}
            onChange={(e) => { setValue(e.target.value); if (status === 'wrong') setStatus('idle') }}
            aria-invalid={status === 'wrong'}
            aria-describedby="gate-msg"
          />
          <button className="gate__btn" type="submit" disabled={status === 'checking'}>확인</button>
        </div>
        <p id="gate-msg" className="gate__msg" role="status" aria-live="polite">
          {status === 'wrong' ? '비밀번호가 맞지 않습니다.' : ' '}
        </p>
      </form>
    </main>
  )
}
