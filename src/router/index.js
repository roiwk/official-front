import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import PdfConvert from '../views/PdfConvert.vue'
import PdfConvertToPdf from '../views/PdfConvertToPdf.vue'
import NewsPage from '../views/NewsPage.vue'
import AiNewsPage from '../views/AiNewsPage.vue'
import XhsLotteryConfigure from '../views/XhsLotteryConfigure.vue'
import XhsLotteryShow from '../views/XhsLotteryShow.vue'
import SubscribeMe from '../views/SubscribeMe.vue'
import TokenInput from '../views/TokenInput.vue'
import Download from '../views/Download.vue'

const appTitle = import.meta.env.VITE_APP_TITLE || '公众平台'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { title: '首页' }
  },
  {
    path: '/token-input',
    name: 'TokenInput',
    component: TokenInput,
    meta: { title: '验证码输入' }
  },
  {
    path: '/pdf/convert',
    name: 'PdfConvert',
    component: PdfConvert,
    meta: { title: 'PDF转换' },
    beforeEnter: (to, from, next) => {
      if (!to.query.t && !to.query.token) {
        next({ name: 'TokenInput', query: { redirect: to.path, ...to.query } })
      } else {
        next()
      }
    }
  },
  {
    path: '/pdf/convert-to-pdf',
    name: 'PdfConvertToPdf',
    component: PdfConvertToPdf,
    meta: { title: '文件转PDF' },
    beforeEnter: (to, from, next) => {
      if (!to.query.t && !to.query.token) {
        next({ name: 'TokenInput', query: { redirect: to.path, ...to.query } })
      } else {
        next()
      }
    }
  },
  {
    path: '/v2/60s/page',
    name: 'NewsPage',
    component: NewsPage,
    meta: { title: '60秒新闻' }
  },
  {
    path: '/v2/ai-news/page',
    name: 'AiNewsPage',
    component: AiNewsPage,
    meta: { title: 'AI资讯' }
  },
  {
    path: '/xhs-lottery/configure',
    name: 'XhsLotteryConfigure',
    component: XhsLotteryConfigure,
    meta: { title: '小红书抽奖配置' },
    beforeEnter: (to, from, next) => {
      if (!to.query.t && !to.query.token) {
        next({ name: 'TokenInput', query: { redirect: to.path, ...to.query } })
      } else {
        next()
      }
    }
  },
  {
    path: '/xhs-lottery/show',
    name: 'XhsLotteryShow',
    component: XhsLotteryShow,
    meta: { title: '抽奖详情' }
  },
  {
    path: '/subscribe-me',
    name: 'SubscribeMe',
    component: SubscribeMe,
    meta: { title: '关注公众号' }
  },
  {
    path: '/download',
    name: 'Download',
    component: Download,
    meta: { title: '文件下载' }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: SubscribeMe,
    meta: { title: '页面未找到' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.afterEach((to) => {
  const pageTitle = to.meta.title
  document.title = pageTitle ? `${pageTitle} - ${appTitle}` : appTitle
})

export default router
