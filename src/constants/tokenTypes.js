/**
 * Token类型枚举
 * 与后端 app\enum\TokenType 保持一致
 */
export const TokenType = {
  /** PDF转换 */
  PDF_CONVERT: 'pdf_convert',
  /** 文件转PDF */
  PDF_CONVERT_TO_PDF: 'pdf_convert_to_pdf',
  /** 小红书抽奖 */
  LOTTERY: 'lottery'
}

/**
 * Token类型到前端路由路径的映射
 */
export const TokenTypeRouteMap = {
  [TokenType.PDF_CONVERT]: {
    path: '/pdf/convert',
    title: 'PDF转换'
  },
  [TokenType.PDF_CONVERT_TO_PDF]: {
    path: '/pdf/convert-to-pdf',
    title: '文件转PDF'
  },
  [TokenType.LOTTERY]: {
    path: '/xhs-lottery/configure',
    title: '小红书抽奖配置'
  }
}

/**
 * 获取类型对应的路由路径
 * @param {string} type Token类型
 * @returns {string|null} 路由路径，不存在返回null
 */
export function getRoutePathByType(type) {
  return TokenTypeRouteMap[type]?.path || null
}

/**
 * 获取类型对应的页面标题
 * @param {string} type Token类型
 * @returns {string} 页面标题
 */
export function getRouteTitleByType(type) {
  return TokenTypeRouteMap[type]?.title || type
}

/**
 * 获取类型的中文名称
 * @param {string} type Token类型
 * @returns {string} 中文名称
 */
export function getTypeName(type) {
  const nameMap = {
    [TokenType.PDF_CONVERT]: 'PDF转换',
    [TokenType.PDF_CONVERT_TO_PDF]: '文件转PDF',
    [TokenType.LOTTERY]: '抽奖活动'
  }
  return nameMap[type] || type
}
