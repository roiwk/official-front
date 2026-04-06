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

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/token-input',
    name: 'TokenInput',
    component: TokenInput
  },
  {
    path: '/pdf/convert',
    name: 'PdfConvert',
    component: PdfConvert,
    beforeEnter: (to, from, next) => {
      // 检查是否有token
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
    beforeEnter: (to, from, next) => {
      // 检查是否有token
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
    component: NewsPage
  },
  {
    path: '/v2/ai-news/page',
    name: 'AiNewsPage',
    component: AiNewsPage
  },
  {
    path: '/xhs-lottery/configure',
    name: 'XhsLotteryConfigure',
    component: XhsLotteryConfigure,
    beforeEnter: (to, from, next) => {
      // 检查是否有token
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
    component: XhsLotteryShow
  },
  {
    path: '/subscribe-me',
    name: 'SubscribeMe',
    component: SubscribeMe
  },
  {
    path: '/download',
    name: 'Download',
    component: Download
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: SubscribeMe
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
