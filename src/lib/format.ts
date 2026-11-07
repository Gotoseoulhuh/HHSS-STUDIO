// 날짜는 UTC로 저장하고 화면에는 한국 시간으로 표시한다.
const dateFmt = new Intl.DateTimeFormat('ko-KR', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' })

export const formatDate = (iso: string) => dateFmt.format(new Date(iso)).replace(/\.\s?/g, '.').replace(/\.$/, '')

export const pad2 = (n: number) => String(n).padStart(2, '0')

export const formatBytes = (b: number) => {
  if (b < 1024) return `${b} B`
  if (b < 1024 ** 2) return `${(b / 1024).toFixed(1)} KB`
  return `${(b / 1024 ** 2).toFixed(1)} MB`
}
