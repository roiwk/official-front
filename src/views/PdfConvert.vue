<template>
  <div class="pdf-convert">
    <div id="loading-overlay" v-if="loading">
      <div class="loading-container">
        <div class="spinner"></div>
        <div class="progress-text">{{ progressText }}</div>
        <div class="progress-detail">{{ progressDetail }}</div>
        <div class="progress-steps">
          <div :class="['progress-step', { active: currentStep >= 1, completed: currentStep > 1 }]">
            <span class="step-icon">{{ currentStep > 1 ? '✓' : '1' }}</span>
            <span>准备上传</span>
          </div>
          <div :class="['progress-step', { active: currentStep >= 2, completed: currentStep > 2 }]">
            <span class="step-icon">{{ currentStep > 2 ? '✓' : '2' }}</span>
            <span>上传中</span>
          </div>
          <div :class="['progress-step', { active: currentStep >= 3, completed: currentStep > 3 }]">
            <span class="step-icon">{{ currentStep > 3 ? '✓' : '3' }}</span>
            <span>转换中</span>
          </div>
        </div>
      </div>
    </div>

    <div class="container">
      <h1>📄 PDF 转换</h1>

      <div v-if="errorMessage" class="message error">{{ errorMessage }}</div>
      <div v-if="successMessage" class="message success">{{ successMessage }}</div>

      <div v-if="!downloadLink">
        <form @submit.prevent="handleSubmit" id="conversion-form">
          <div class="form-group">
            <label for="pdf_file">1. 选择PDF文件</label>
            <input
              type="file"
              id="pdf_file"
              ref="fileInput"
              accept=".pdf"
              required
              @change="handleFileChange"
            />
            <input type="hidden" :value="maxFileSize" />
          </div>
          <div class="form-group">
            <label for="target_format">2. 选择转换格式</label>
            <select id="target_format" v-model="targetFormat" required>
              <option v-for="(desc, value) in supportedFormats" :key="value" :value="value">
                {{ desc }}
              </option>
            </select>
          </div>
          <button type="submit" class="submit-btn" :disabled="loading || !selectedFile">
            {{ loading ? '处理中...' : '开始转换' }}
          </button>
        </form>
      </div>
      <div v-else class="download-section">
        <p>🎉 转换完成！请及时下载！</p>
        <div class="download-link-container">
          <div class="download-link-text">
            <label>下载链接：</label>
            <input 
              type="text" 
              :value="downloadLink" 
              readonly 
              class="link-input"
              ref="linkInput"
              @click="copyLink"
            />
            <button class="copy-btn" @click="copyLink">📋 复制</button>
          </div>
          <a :href="downloadLink" class="download-link">
            📥 点击下载
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { pdfApi } from '../api'

export default {
  name: 'PdfConvert',
  data() {
    return {
      selectedFile: null,
      targetFormat: 'doc',
      maxFileSize: 20 * 1024 * 1024,
      supportedFormats: {},
      downloadLink: '',
      errorMessage: '',
      successMessage: '',
      loading: false,
      currentStep: 1,
      progressText: '正在处理中...',
      progressDetail: '请稍候，这可能需要几分钟时间'
    }
  },
  mounted() {
    this.loadPageData()
  },
  methods: {
    async loadPageData() {
      try {
        // 兼容 token 和 t 两种参数名
        const token = this.$route.query.t || this.$route.query.token || ''
        const params = { t: token }
        const response = await pdfApi.getConvert(params)
        if (response && response.success) {
          this.maxFileSize = response.data.max_file_size
          this.supportedFormats = response.data.supportedFormats || {}
        }
      } catch (error) {
        console.error('加载页面数据失败:', error)
      }
    },
    handleFileChange(event) {
      const file = event.target.files[0]
      if (file) {
        if (file.size > this.maxFileSize) {
          this.errorMessage = `文件大小不能超过 ${(this.maxFileSize / 1024 / 1024).toFixed(2)} MB`
          this.selectedFile = null
          return
        }
        this.selectedFile = file
        this.errorMessage = ''
      }
    },
    async handleSubmit() {
      if (!this.selectedFile) {
        this.errorMessage = '请选择一个 PDF 文件'
        return
      }

      this.loading = true
      this.errorMessage = ''
      this.successMessage = ''
      this.currentStep = 1
      this.progressText = '准备上传中...'
      this.progressDetail = '正在连接服务器'

      try {
        // 兼容 token 和 t 两种参数名
        const token = this.$route.query.t || this.$route.query.token || ''
        
        // 步骤1: 获取OSS签名
        const signFormData = new FormData()
        signFormData.append('filename', this.selectedFile.name)
        signFormData.append('token', token)

        const signData = await pdfApi.ossSign(signFormData)

        if (!signData || !signData.host) {
          throw new Error('获取签名失败')
        }

        // 检查响应中是否有 token 过期提示
        if (signData.success === false && signData.redirect === '/subscribe-me') {
          window.location.href = '/subscribe-me'
          return
        }

        // 步骤2: 上传文件到OSS
        this.currentStep = 2
        this.progressText = '(2/3) 上传中...'
        this.progressDetail = `文件大小: ${(this.selectedFile.size / 1024 / 1024).toFixed(2)} MB，请耐心等待`

        const uploadFormData = new FormData()
        uploadFormData.append('success_action_status', '200')
        uploadFormData.append('policy', signData.policy)
        uploadFormData.append('x-oss-signature', signData.signature)
        uploadFormData.append('x-oss-signature-version', signData.x_oss_signature_version)
        uploadFormData.append('x-oss-credential', signData.x_oss_credential)
        uploadFormData.append('x-oss-date', signData.x_oss_date)
        uploadFormData.append('key', signData.dir + this.selectedFile.name)
        uploadFormData.append('file', this.selectedFile)

        const uploadResponse = await fetch(signData.host, {
          method: 'POST',
          body: uploadFormData,
          mode: 'cors'
        })

        if (!uploadResponse.ok) {
          throw new Error('文件上传失败')
        }

        // 步骤3: 提交转换请求
        this.currentStep = 3
        this.progressText = '(3/3) 转换中...'
        this.progressDetail = '正在生成下载文件，这可能需要几分钟时间，请勿关闭页面'

        const convertResponse = await pdfApi.commitConvert(
          {
            pdf_file: signData.dir + this.selectedFile.name,
            target_format: this.targetFormat
          },
          { t: token }
        )

        if (convertResponse && convertResponse.success) {
          this.successMessage = '转换成功~~~'
          this.downloadLink = convertResponse.data.download_link
        } else {
          throw new Error(convertResponse?.error || '转换失败')
        }
      } catch (error) {
        console.error('转换失败:', error)
        // 如果错误信息包含 token 相关，不显示错误（因为已经跳转）
        if (error.message && error.message.includes('Token')) {
          // 已经在拦截器中处理跳转，这里不需要额外处理
          return
        }
        this.errorMessage = error.message || '转换失败，请重试'
      } finally {
        this.loading = false
      }
    },
    copyLink(event) {
      if (this.downloadLink) {
        // 选中输入框中的文本
        if (this.$refs.linkInput) {
          this.$refs.linkInput.select()
          // 复制到剪贴板
          navigator.clipboard.writeText(this.downloadLink).then(() => {
            // 显示复制成功提示
            const btn = event?.target
            if (btn && btn.classList.contains('copy-btn')) {
              const originalText = btn.textContent
              btn.textContent = '✓ 已复制'
              setTimeout(() => {
                btn.textContent = originalText
              }, 2000)
            }
          }).catch(() => {
            // 如果复制失败，尝试使用传统方法
            try {
              document.execCommand('copy')
              const btn = event?.target
              if (btn && btn.classList.contains('copy-btn')) {
                const originalText = btn.textContent
                btn.textContent = '✓ 已复制'
                setTimeout(() => {
                  btn.textContent = originalText
                }, 2000)
              }
            } catch (e) {
              console.error('复制失败:', e)
            }
          })
        }
      }
    }
  }
}
</script>

<style scoped>
.pdf-convert {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background-color: #f0f2f5;
  margin: 0;
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  color: #333;
}

.container {
  background-color: #ffffff;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 500px;
  box-sizing: border-box;
}

h1 {
  text-align: center;
  color: #1a73e8;
  margin-bottom: 25px;
  font-size: 1.8em;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
}

input[type="file"],
select {
  width: 100%;
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-sizing: border-box;
  font-size: 1em;
}

input[type="file"] {
  cursor: pointer;
}

.submit-btn {
  width: 100%;
  padding: 14px;
  background-color: #1a73e8;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1em;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.submit-btn:hover:not(:disabled) {
  background-color: #155ab6;
}

.submit-btn:disabled {
  background-color: #a0c3ff;
  cursor: not-allowed;
  opacity: 0.7;
}

.message {
  text-align: center;
  padding: 15px;
  margin-top: 20px;
  border-radius: 8px;
  font-size: 1em;
}

.message.success {
  background-color: #e6f4ea;
  color: #34a853;
  border: 1px solid #cce8d2;
}

.message.error {
  background-color: #fce8e6;
  color: #ea4335;
  border: 1px solid #f9d6d3;
}

.download-section {
  text-align: center;
  margin-top: 25px;
  padding: 20px;
  border: 2px dashed #1a73e8;
  border-radius: 8px;
  background-color: #e8f0fe;
}

.download-link-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
  align-items: center;
}

.download-link-text {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  max-width: 100%;
}

.download-link-text label {
  font-weight: 600;
  color: #333;
  white-space: nowrap;
}

.link-input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 0.9em;
  background-color: white;
  cursor: text;
  min-width: 0;
}

.link-input:focus {
  outline: none;
  border-color: #1a73e8;
}

.copy-btn {
  padding: 10px 15px;
  background-color: #1a73e8;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.9em;
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 0.3s ease;
}

.copy-btn:hover {
  background-color: #155ab6;
}

.download-link {
  display: inline-block;
  padding: 12px 25px;
  background-color: #34a853;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: bold;
  transition: background-color 0.3s ease;
}

.download-link:hover {
  background-color: #2b8a44;
}

#loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.loading-container {
  background-color: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  text-align: center;
  max-width: 400px;
}

.spinner {
  width: 60px;
  height: 60px;
  border: 8px solid #f3f3f3;
  border-top: 8px solid #1a73e8;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.progress-text {
  font-size: 1.2em;
  font-weight: bold;
  color: #1a73e8;
  margin-bottom: 15px;
}

.progress-detail {
  font-size: 0.95em;
  color: #666;
  line-height: 1.6;
  margin-bottom: 20px;
}

.progress-steps {
  margin-top: 20px;
  text-align: left;
}

.progress-step {
  padding: 8px 0;
  font-size: 0.9em;
  color: #999;
  display: flex;
  align-items: center;
}

.progress-step.active {
  color: #1a73e8;
  font-weight: bold;
}

.progress-step.completed {
  color: #34a853;
}

.step-icon {
  display: inline-block;
  width: 24px;
  height: 24px;
  line-height: 24px;
  text-align: center;
  margin-right: 10px;
  border-radius: 50%;
  background-color: #f0f0f0;
  font-size: 0.85em;
}

.progress-step.active .step-icon {
  background-color: #1a73e8;
  color: white;
}

.progress-step.completed .step-icon {
  background-color: #34a853;
  color: white;
}

@media (min-width: 600px) {
  .container {
    padding: 40px;
  }
  h1 {
    font-size: 2.2em;
  }
}
</style>
