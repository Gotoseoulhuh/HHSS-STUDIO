import { useEffect } from 'react'

/**
 * 스크롤 등장. [data-reveal] 요소가 화면에 들어오면 .is-in을 붙인다.
 * - 관찰기가 준비된 뒤에만 <html class="motion-ready">를 붙이므로, JS가 늦거나 꺼져도 내용은 보인다.
 * - 나중에 비동기로 그려지는 요소(Supabase 응답)도 MutationObserver로 잡는다.
 */
export function useReveal() {
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return
    const root = document.documentElement

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('is-in')
            io.unobserve(e.target)
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
    )

    const scan = () => document.querySelectorAll('[data-reveal]:not(.is-in)').forEach((el) => io.observe(el))
    scan()
    root.classList.add('motion-ready')

    const mo = new MutationObserver(scan)
    mo.observe(document.getElementById('root')!, { childList: true, subtree: true })

    return () => {
      io.disconnect()
      mo.disconnect()
    }
  }, [])
}
