import { useState } from 'react'
import { Link } from 'react-router-dom'
import { asset } from '../lib/url'

const LOGO_SRC = asset('brand/hhss-logo.png')

/** public/brand/hhss-logo.png가 있으면 이미지, 없으면 텍스트 "HHSS"로 대신한다. */
export function Logo() {
  const [missing, setMissing] = useState(false)
  return (
    <Link to="/" className="logo" aria-label="HHSS 홈" viewTransition>
      {missing ? (
        <>
          <span className="logo__mark" aria-hidden="true" />
          HHSS
        </>
      ) : (
        <img src={LOGO_SRC} alt="HHSS" onError={() => setMissing(true)} />
      )}
    </Link>
  )
}
