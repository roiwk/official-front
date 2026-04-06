<template>
  <div class="min-h-screen gradient-bg p-4 md:p-6 lg:p-8">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="card mb-6">
        <h1 class="text-3xl md:text-4xl font-bold text-center mb-6 bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
          📰 每天 60 秒读懂世界
        </h1>
        <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <input 
            type="date" 
            v-model="currentDate" 
            @change="loadContent"
            class="input max-w-xs"
          />
          <button @click="loadContent" class="btn btn-primary whitespace-nowrap">
            加载新闻
          </button>
        </div>
      </div>

      <!-- Error Message -->
      <div v-if="errorMessage" class="card bg-red-50 border-2 border-red-200 mb-6">
        <p class="text-red-800 text-center">❌ {{ errorMessage }}</p>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="card text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent mb-4"></div>
        <p class="text-gray-600">正在加载...</p>
      </div>

      <!-- Content -->
      <template v-else-if="newsData">
        <!-- Tabs -->
        <div class="card mb-6">
          <div class="flex flex-wrap gap-2 border-b-2 border-gray-200 pb-2 mb-4 overflow-x-auto">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              :class="[
                'px-4 py-2 rounded-lg font-medium transition-all duration-200',
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              ]"
              @click="showTab(tab.id)"
            >
              {{ tab.label }}
            </button>
          </div>

          <!-- Text Tab -->
          <div v-if="activeTab === 'text'" class="mt-4">
            <div class="flex flex-wrap gap-2 mb-4">
              <button @click="copyText" class="btn btn-primary">复制文本</button>
              <button @click="downloadText" class="btn btn-success">下载文本文件</button>
            </div>
            <div class="bg-gray-50 border-2 border-gray-200 rounded-xl p-4 md:p-6 max-h-[600px] overflow-y-auto font-mono text-sm whitespace-pre-wrap break-words">
              {{ textContent }}
            </div>
          </div>

          <!-- Image Tab -->
          <div v-if="activeTab === 'image'" class="mt-4">
            <div class="flex flex-wrap gap-2 mb-4">
              <button @click="generateImage" class="btn btn-primary">生成图片</button>
              <button @click="downloadImage" class="btn btn-success" :disabled="!imageGenerated">下载图片</button>
              <button @click="copyImageToClipboard" class="btn btn-secondary" :disabled="!imageGenerated">复制图片</button>
            </div>
            <div class="bg-white border-2 border-gray-200 rounded-xl p-6 text-center">
              <canvas id="newsCanvas" class="hidden"></canvas>
              <img 
                v-if="imageGenerated" 
                id="generatedImage" 
                :src="generatedImageUrl" 
                alt="生成的图片"
                class="max-w-full h-auto rounded-xl shadow-lg mx-auto"
              />
              <div v-else class="text-gray-500">
                点击"生成图片"按钮以创建报纸风格的图片
              </div>
            </div>
          </div>

          <!-- Markdown Tab -->
          <div v-if="activeTab === 'markdown'" class="mt-4">
            <div class="flex flex-wrap gap-2 mb-4">
              <button @click="copyMarkdown" class="btn btn-primary">复制 Markdown</button>
              <button @click="downloadMarkdown" class="btn btn-success">下载 Markdown 文件</button>
            </div>
            <div class="bg-gray-50 border-2 border-gray-200 rounded-xl p-4 md:p-6 max-h-[600px] overflow-y-auto font-mono text-sm whitespace-pre-wrap break-words">
              {{ markdownContent }}
            </div>
          </div>

          <!-- JSON Tab -->
          <div v-if="activeTab === 'json'" class="mt-4">
            <div class="flex flex-wrap gap-2 mb-4">
              <button @click="copyJson" class="btn btn-primary">复制 JSON</button>
              <button @click="downloadJson" class="btn btn-success">下载 JSON 文件</button>
            </div>
            <div class="bg-gray-900 text-gray-100 rounded-xl p-4 md:p-6 max-h-[600px] overflow-x-auto font-mono text-sm">
              <pre>{{ jsonContent }}</pre>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import { newsApi } from '../api'

export default {
  name: 'NewsPage',
  data() {
    return {
      currentDate: new Date().toISOString().split('T')[0],
      newsData: null,
      textContent: '',
      markdownContent: '',
      imageUrl: '',
      errorMessage: '',
      loading: false,
      activeTab: 'text',
      imageGenerated: false,
      generatedImageUrl: '',
      tabs: [
        { id: 'text', label: '📝 文本' },
        { id: 'image', label: '📷 图片' },
        { id: 'markdown', label: '📄 Markdown' },
        { id: 'json', label: '🔧 JSON' }
      ]
    }
  },
  computed: {
    jsonContent() {
      return JSON.stringify(this.newsData, null, 2)
    }
  },
  mounted() {
    this.loadContent()
  },
  methods: {
    async loadContent() {
      this.loading = true
      this.errorMessage = ''
      try {
        const params = this.currentDate ? { date: this.currentDate } : {}
        const response = await newsApi.getPage(params)
        if (response && response.success) {
          this.newsData = response.data.news_data
          this.textContent = response.data.text_content || ''
          this.markdownContent = response.data.markdown_content || ''
          this.imageUrl = response.data.image_url || ''
          this.currentDate = response.data.current_date || this.currentDate
        } else {
          this.errorMessage = response?.error || '获取新闻失败'
        }
      } catch (error) {
        this.errorMessage = error.response?.data?.error || '获取新闻失败，请稍后重试'
      } finally {
        this.loading = false
      }
    },
    showTab(tabId) {
      this.activeTab = tabId
    },
    copyText() {
      this.copyToClipboard(this.textContent, '文本已复制到剪贴板！')
    },
    copyMarkdown() {
      this.copyToClipboard(this.markdownContent, 'Markdown 已复制到剪贴板！')
    },
    copyJson() {
      this.copyToClipboard(this.jsonContent, 'JSON 已复制到剪贴板！')
    },
    copyToClipboard(text, successMessage) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
          alert(successMessage)
        }).catch(() => {
          this.fallbackCopyTextToClipboard(text, successMessage)
        })
      } else {
        this.fallbackCopyTextToClipboard(text, successMessage)
      }
    },
    fallbackCopyTextToClipboard(text, successMessage) {
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.top = '0'
      textArea.style.left = '0'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      try {
        document.execCommand('copy')
        alert(successMessage)
      } catch (err) {
        alert('复制失败，请手动选择文本复制。')
      }
      document.body.removeChild(textArea)
    },
    downloadText() {
      this.downloadFile(this.textContent, `60s-news-${this.currentDate}.txt`, 'text/plain;charset=utf-8')
    },
    downloadMarkdown() {
      this.downloadFile(this.markdownContent, `60s-news-${this.currentDate}.md`, 'text/markdown;charset=utf-8')
    },
    downloadJson() {
      this.downloadFile(this.jsonContent, `60s-news-${this.currentDate}.json`, 'application/json;charset=utf-8')
    },
    downloadFile(content, filename, contentType) {
      const blob = new Blob([content], { type: contentType })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    },
    generateImage() {
      if (this.imageUrl) {
        this.generatedImageUrl = this.imageUrl
        this.imageGenerated = true
      } else {
        alert('暂无图片数据')
      }
    },
    downloadImage() {
      if (!this.imageGenerated || !this.generatedImageUrl) {
        alert('请先生成图片')
        return
      }
      const a = document.createElement('a')
      a.href = this.generatedImageUrl
      a.download = `60s-news-${this.currentDate}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    },
    copyImageToClipboard() {
      if (!this.imageGenerated || !this.generatedImageUrl) {
        alert('请先生成图片')
        return
      }
      fetch(this.generatedImageUrl)
        .then(res => res.blob())
        .then(blob => {
          if (!navigator.clipboard || !navigator.clipboard.write) {
            alert('您的浏览器不支持复制图片到剪贴板，请长按图片保存')
            return
          }
          const item = new ClipboardItem({ 'image/png': blob })
          navigator.clipboard.write([item]).then(() => {
            alert('图片已复制到剪贴板！')
          }).catch(() => {
            alert('复制失败，请尝试长按图片保存')
          })
        })
    }
  }
}
</script>
