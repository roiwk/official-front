import axios from 'axios'

let _router = null

export function setRouter(router) {
  _router = router
}

function redirectToSubscribe() {
  if (_router && _router.currentRoute.value.path !== '/subscribe-me') {
    _router.replace('/subscribe-me')
  } else if (window.location.pathname !== '/subscribe-me') {
    window.location.href = '/subscribe-me'
  }
}

const getBaseURL = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL
  }
  if (import.meta.env.DEV) {
    return '/api'
  }
  console.warn('VITE_API_BASE_URL is not set, API requests may fail')
  return ''
}

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use(
  config => config,
  error => Promise.reject(error)
)

api.interceptors.response.use(
  response => {
    const data = response.data
    
    if (data && data.success === false && data.redirect === '/subscribe-me') {
      redirectToSubscribe()
      return Promise.reject(new Error(data.error || 'Token无效或已过期'))
    }
    
    return data
  },
  error => {
    if (error.response) {
      const data = error.response.data
      
      if (data && data.success === false && data.redirect === '/subscribe-me') {
        redirectToSubscribe()
        return Promise.reject(new Error(data.error || 'Token无效或已过期'))
      }
      
      if (error.response.status === 401 && data && data.redirect === '/subscribe-me') {
        redirectToSubscribe()
        return Promise.reject(new Error(data.error || 'Token无效或已过期'))
      }
    }
    
    return Promise.reject(error)
  }
)

// 小红书抽奖API
export const lotteryApi = {
  // 获取抽奖配置页面数据
  getConfigure(params) {
    return api.get('/xhs-lottery/configure', { params })
  },
  // 提交抽奖配置
  submitConfigure(data, params) {
    return api.post('/xhs-lottery/configure', data, { params })
  },
  // 获取抽奖详情
  getShow(params) {
    return api.get('/xhs-lottery/show', { params })
  },
  // 生成备选用户
  generateCandidates(params) {
    return api.post('/xhs-lottery/generate-candidates', null, { params })
  },
  // 手动选择中奖者
  manualSelect(data, params) {
    // FormData 会自动设置 Content-Type，不需要手动设置
    return api.post('/xhs-lottery/manual-select', data, { params })
  },
  // 开奖
  draw(params) {
    return api.post('/xhs-lottery/draw', null, { params })
  }
}

// 60秒新闻API
export const newsApi = {
  // 获取新闻页面数据
  getPage(params) {
    return api.get('/v2/60s/page', { params })
  },
  // 获取新闻数据
  get60sNews(params) {
    return api.get('/v2/60s', { params })
  }
}

// AI资讯API
export const aiNewsApi = {
  // 获取AI资讯页面数据
  getPage(params) {
    return api.get('/v2/ai-news/page', { params })
  },
  // 获取AI资讯数据
  getAiNews(params) {
    return api.get('/v2/ai-news', { params })
  }
}

// PDF转换API
export const pdfApi = {
  // 获取转换页面数据
  getConvert(params) {
    return api.get('/pdf/convert', { params })
  },
  // 提交转换
  commitConvert(data, params) {
    return api.post('/pdf/convert', data, { params })
  },
  // 获取转PDF页面数据
  getConvertToPdf(params) {
    return api.get('/pdf/convert-to-pdf', { params })
  },
  // 提交转PDF
  commitConvertToPdf(data, params) {
    return api.post('/pdf/convert-to-pdf', data, { params })
  },
  // OSS签名
  ossSign(data) {
    return api.post('/oss/sign', data)
  }
}

// Token API
export const tokenApi = {
  // 生成token（测试用）
  generate(params) {
    return api.get('/token/generate', { params })
  },
  // 获取token信息
  getInfo(params) {
    return api.get('/token/info', { params })
  },
  // 验证token
  validate(data) {
    return api.post('/token/validate', data)
  }
}

export default api
