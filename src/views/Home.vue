<template>
  <div class="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-600 flex items-center justify-center p-4 md:p-8">
    <div class="bg-white rounded-2xl shadow-2xl p-6 md:p-8 max-w-6xl w-full transition-all duration-200 hover:shadow-3xl">
      <h1 class="text-4xl md:text-5xl font-bold text-center mb-8 md:mb-12 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
        微信公众号管理平台
      </h1>
      
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <div 
          v-for="item in menuItems" 
          :key="item.path"
          @click="goTo(item.path)"
          class="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 p-6 md:p-8 text-white cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
        >
          <div class="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div class="relative z-10">
            <div class="text-5xl md:text-6xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
              {{ item.icon }}
            </div>
            <div class="text-xl md:text-2xl font-bold mb-2">{{ item.title }}</div>
            <div class="text-sm md:text-base opacity-90">{{ item.desc }}</div>
          </div>
          <div class="absolute bottom-0 left-0 right-0 h-1 bg-white/30 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Home',
  data() {
    return {
      menuItems: [
        {
          icon: '📰',
          title: '60秒新闻',
          desc: '每天60秒读懂世界',
          path: '/v2/60s/page'
        },
        {
          icon: '🤖',
          title: 'AI资讯',
          desc: 'AI资讯快报',
          path: '/v2/ai-news/page'
        },
        {
          icon: '🎁',
          title: '小红书抽奖',
          desc: '抽奖活动管理',
          path: '/xhs-lottery/configure'
        },
        {
          icon: '📄',
          title: 'PDF转换',
          desc: 'PDF格式转换工具',
          path: '/pdf/convert'
        },
        {
          icon: '📥',
          title: '文件转PDF',
          desc: '将文件转换为PDF格式',
          path: '/pdf/convert-to-pdf'
        },
        {
          icon: '🎲',
          title: '双色球',
          desc: '双色球彩票预测,开奖结果,摇号',
          path: import.meta.env.VITE_SSQ_URL || 'http://127.0.0.1:8081'
        },
      ]
    }
  },
  methods: {
    goTo(path) {
      if (/^https?:\/\//.test(path)) {
        window.open(path, '_blank')
      } else {
        this.$router.push(path)
      }
    }
  }
}
</script>
