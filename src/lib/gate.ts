/**
 * 공개 전 비밀번호 가림막 설정.
 *
 * ⚠ 정적 사이트라 브라우저에서만 확인하는 '가림막'이다. 일반 방문자를 막는 용도이고,
 *   공개 저장소의 파일·사진 주소를 직접 아는 사람까지 막지는 못한다.
 *
 * - 사이트를 공개할 때: GATE_ENABLED를 false로 바꾸고, index.html의 robots noindex 줄을 지운다.
 * - 비밀번호를 바꿀 때: 아래 명령으로 나온 값을 GATE_HASH에 넣고, GATE_KEY 끝 숫자를 올린다(기존 입장 기록 무효화).
 *     node -e "console.log(require('crypto').createHash('sha256').update('hhss-gate:'+'새비밀번호').digest('hex'))"
 */
export const GATE_ENABLED = true
export const GATE_HASH = '5e7586d83edf17c772c93e693ed882b796ee5dd24fa1f72c917553c83afa99b2'
/** 통과 기록을 남기는 localStorage 키 (index.html 인라인 스크립트와 같은 값) */
export const GATE_KEY = 'hhss-gate-v1'

export async function checkPassword(input: string) {
  const data = new TextEncoder().encode('hhss-gate:' + input)
  const digest = await crypto.subtle.digest('SHA-256', data)
  const hex = [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
  return hex === GATE_HASH
}

export function isUnlocked() {
  if (!GATE_ENABLED) return true
  try { return localStorage.getItem(GATE_KEY) === GATE_HASH } catch { return false }
}

export function rememberUnlock() {
  try { localStorage.setItem(GATE_KEY, GATE_HASH) } catch { /* 저장 불가 환경: 이번 방문만 통과 */ }
}
