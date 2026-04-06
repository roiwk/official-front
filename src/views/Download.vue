<template>
  <div class="download-page">
    <div v-if="isWeChat" class="wechat-tip">
      <div class="tip-icon">📱</div>
      <h2>微信内无法直接下载</h2>
      <p>请点击右上角菜单<br>选择【在浏览器中打开】</p>
    </div>
    <div v-else-if="!downloadUrl" class="error-message">
      <div class="error-icon">⚠️</div>
      <p>缺少下载链接</p>
    </div>
    <div v-else class="loading-message">
      <div class="spinner"></div>
      <p>正在跳转到下载页面...</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Download',
  data() {
    return {
      downloadUrl: '',
      isWeChat: false
    }
  },
  mounted() {
    // 从 URL 参数获取下载链接
    this.downloadUrl = this.$route.query.url || ''
    
    // 检测是否在微信浏览器中
    this.isWeChat = /MicroMessenger/i.test(navigator.userAgent)
    
    // 如果不在微信中且有下载链接，直接跳转
    if (!this.isWeChat && this.downloadUrl) {
      // 延迟一小段时间显示加载提示，然后跳转
      setTimeout(() => {
        window.location.href = this.downloadUrl
      }, 500)
    }
  }
}
</script>

<style scoped>
.download-page {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background: #f5f5f5;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  text-align: center;
  padding: 20px;
  box-sizing: border-box;
}

.wechat-tip {
  background: white;
  padding: 40px 30px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  width: 100%;
}

.tip-icon {
  font-size: 4em;
  margin-bottom: 20px;
}

.wechat-tip h2 {
  margin-bottom: 20px;
  font-size: 1.5em;
  color: #333;
  font-weight: 600;
}

.wechat-tip p {
  font-size: 1.1em;
  line-height: 1.8;
  color: #666;
  margin: 0;
}

.error-message {
  background: white;
  padding: 40px 30px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  width: 100%;
}

.error-icon {
  font-size: 4em;
  margin-bottom: 20px;
}

.error-message p {
  margin: 0;
  color: #ea4335;
  font-size: 1.2em;
  font-weight: 500;
}

.loading-message {
  background: white;
  padding: 40px 30px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  width: 100%;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #1a73e8;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-message p {
  margin: 0;
  color: #666;
  font-size: 1.1em;
}
</style>
