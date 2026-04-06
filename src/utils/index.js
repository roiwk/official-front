// 工具函数
export function formatDateTime(dateTime) {
  if (!dateTime) return ''
  const date = new Date(dateTime)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function formatDate(dateTime) {
  if (!dateTime) return ''
  const date = new Date(dateTime)
  return date.toISOString().slice(0, 16)
}

export function showAlert(message, type = 'info') {
  // 简单的alert实现，可以后续替换为更优雅的组件
  alert(message)
}

export function showConfirm(message) {
  return confirm(message)
}

export function extractXhsUrl(text) {
  if (!text) return ''
  const urlPattern = /(?:https?:\/\/)?(?:www\.)?(?:xhslink\.com\/[^\s\)]+|xiaohongshu\.com\/[^\s\)]+)/i
  const match = text.match(urlPattern)
  if (match) {
    let url = match[0].trim()
    url = url.replace(/[.,;!?）)]+$/, '')
    if (!url.match(/^https?:\/\//i)) {
      url = 'https://' + url
    }
    return url
  }
  return ''
}
