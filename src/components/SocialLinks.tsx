import { getSettings } from '../lib/content'

const Icon = {
  youtube: (
    <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2.5" y="5.5" width="19" height="13" rx="4" fill="none" stroke="currentColor" strokeWidth="1.6" /><path d="M10 9.2v5.6l4.8-2.8z" fill="currentColor" /></svg>
  ),
  instagram: (
    <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="5" fill="none" stroke="currentColor" strokeWidth="1.6" /><circle cx="12" cy="12" r="3.8" fill="none" stroke="currentColor" strokeWidth="1.6" /><circle cx="17.2" cy="6.8" r="1" fill="currentColor" /></svg>
  ),
  email: (
    <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5.5" width="18" height="13" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" /><path d="m3.8 6.5 8.2 6.3 8.2-6.3" fill="none" stroke="currentColor" strokeWidth="1.6" /></svg>
  ),
}

/** 사이트 설정에 주소가 있는 링크만 아이콘으로 보여 준다 */
export function SocialLinks({ withLabel = false }: { withLabel?: boolean }) {
  const { youtube, instagram, email } = getSettings().social
  const items = [
    youtube && { key: 'youtube', href: youtube, label: 'YouTube', icon: Icon.youtube, external: true },
    instagram && { key: 'instagram', href: instagram, label: 'Instagram', icon: Icon.instagram, external: true },
    email && { key: 'email', href: `mailto:${email}`, label: '이메일', icon: Icon.email, external: false },
  ].filter(Boolean) as { key: string; href: string; label: string; icon: React.ReactNode; external: boolean }[]
  if (items.length === 0) return null

  return (
    <ul className={`social${withLabel ? ' social--label' : ''}`}>
      {items.map((it) => (
        <li key={it.key}>
          <a
            href={it.href}
            aria-label={withLabel ? undefined : it.label}
            title={it.label}
            {...(it.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          >
            {it.icon}
            {withLabel && <span>{it.label}</span>}
          </a>
        </li>
      ))}
    </ul>
  )
}
