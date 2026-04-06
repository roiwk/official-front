<template>
  <div class="lottery-show">
    <div class="container">
      <div class="header">
        <h1>小红书抽奖活动</h1>
      </div>

      <div class="content">
        <div v-if="!lottery || !lottery.is_configured" class="not-configured-message">
          <div class="icon">⏳</div>
          <h2>抽奖规则设置中</h2>
          <p>活动创建者正在设置抽奖规则<br>请稍后再来查看</p>
        </div>

        <template v-else>
          <!-- 奖品信息 -->
          <div class="prize-highlight">
            <div class="prize-icon">🏆</div>
            <h2>奖品</h2>
            <p>{{ lottery.prize_description }}</p>
            <p style="margin-top: 6px; font-size: 0.9em; color: #666;">
              共 <strong style="color: #d63031; font-size: 1.1em;">{{ lottery.prize_count }}</strong> 份
            </p>
          </div>

          <!-- 参与条件 -->
          <div class="info-section">
            <div class="info-item">
              <div class="label">📋 参与条件</div>
              <div class="value" v-html="formatText(lottery.participate_condition)"></div>
            </div>
          </div>

          <!-- 活动时间 -->
          <div class="info-section">
            <div class="info-item" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
              <div style="flex: 1; min-width: 140px;">
                <div class="label">⏰ 开始时间</div>
                <div class="value">{{ formatDateTime(lottery.start_time) }}</div>
              </div>
              <div style="flex: 1; min-width: 140px;">
                <div class="label">⏱️ 截止时间</div>
                <div class="value">{{ formatDateTime(lottery.end_time) }}</div>
              </div>
            </div>
          </div>

          <!-- 倒计时 -->
          <div v-if="isStarted && !isEnded && !lottery.is_drawn" class="countdown">
            <h3>⏳ 距离开奖还剩</h3>
            <div class="time">{{ countdownText }}</div>
          </div>

          <!-- 中奖名单 -->
          <div v-if="canShowResult && lottery.winners && lottery.winners.length > 0" class="winners-section">
            <h2>🎊 中奖名单</h2>
            <div v-for="(winner, index) in lottery.winners" :key="index" class="winner-card">
              <div class="rank">{{ index + 1 }}</div>
              <img 
                v-if="winner.avatar"
                :src="winner.avatar" 
                :alt="winner.nickname || '用户'"
                class="avatar"
                @error="handleImageError"
              >
              <div v-else class="avatar-placeholder">
                {{ getFirstChar(winner.nickname || '用') }}
              </div>
              <div class="info">
                <div class="nickname">🎉 {{ winner.nickname || '匿名用户' }}</div>
                <div v-if="winner.comment" class="comment">
                  "{{ truncateText(winner.comment, 40) }}"
                </div>
              </div>
            </div>
          </div>

          <!-- 参与按钮 -->
          <a v-if="isStarted && !isEnded && !lottery.is_drawn" :href="lottery.xhs_article_url" class="participate-btn" target="_blank">
            立即参与抽奖 →
          </a>
        </template>
      </div>

      <!-- 公众号宣传 -->
      <div class="footer-promotion">
        <div class="promotion-title">📢 关注公众号： <span style="font-weight:bold;font-size:1.2em">容海</span></div>
        <div class="promotion-desc">更多精彩活动，尽在公众号</div>
      </div>
    </div>
  </div>
</template>

<script>
import { lotteryApi } from '../api'

export default {
  name: 'XhsLotteryShow',
  data() {
    return {
      lottery: null,
      countdownText: '计算中...',
      countdownInterval: null
    }
  },
  computed: {
    isStarted() {
      if (!this.lottery || !this.lottery.start_time) return false
      return new Date(this.lottery.start_time) <= new Date()
    },
    isEnded() {
      if (!this.lottery || !this.lottery.end_time) return false
      return new Date(this.lottery.end_time) <= new Date()
    },
    canShowResult() {
      return this.lottery && (this.isEnded || this.lottery.is_drawn)
    }
  },
  mounted() {
    this.loadLottery()
    if (this.isStarted && !this.isEnded && !this.lottery?.is_drawn) {
      this.startCountdown()
    }
  },
  beforeUnmount() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval)
    }
  },
  methods: {
    async loadLottery() {
      try {
        const params = { lottery_id: this.$route.query.lottery_id }
        const response = await lotteryApi.getShow(params)
        if (response && response.data) {
          this.lottery = response.data.lottery
          if (this.isStarted && !this.isEnded && !this.lottery.is_drawn) {
            this.startCountdown()
          }
        }
      } catch (error) {
        console.error('加载抽奖信息失败:', error)
      }
    },
    startCountdown() {
      if (!this.lottery || !this.lottery.end_time) return
      
      const updateCountdown = () => {
        const endTime = new Date(this.lottery.end_time).getTime()
        const now = new Date().getTime()
        const distance = endTime - now

        if (distance < 0) {
          this.countdownText = '已截止'
          if (this.countdownInterval) {
            clearInterval(this.countdownInterval)
          }
          return
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24))
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((distance % (1000 * 60)) / 1000)

        let timeStr = ''
        if (days > 0) timeStr += days + '天 '
        timeStr += hours.toString().padStart(2, '0') + ':' + 
                   minutes.toString().padStart(2, '0') + ':' + 
                   seconds.toString().padStart(2, '0')

        this.countdownText = timeStr
      }

      updateCountdown()
      this.countdownInterval = setInterval(updateCountdown, 1000)
    },
    formatDateTime(dateTime) {
      if (!dateTime) return ''
      const date = new Date(dateTime)
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    formatText(text) {
      if (!text) return ''
      return text.replace(/\n/g, '<br>')
    },
    truncateText(text, maxLength) {
      if (!text) return ''
      return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
    },
    getFirstChar(text) {
      if (!text) return '用'
      return text.charAt(0)
    },
    handleImageError(event) {
      event.target.style.display = 'none'
      const placeholder = event.target.nextElementSibling
      if (placeholder) {
        placeholder.style.display = 'flex'
      }
    }
  }
}
</script>

<style scoped>
.lottery-show {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 50%, #c44569 100%);
  min-height: 100vh;
  padding: 10px;
}

.container {
  max-width: 700px;
  margin: 0 auto;
  background: white;
  border-radius: 15px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  margin-top: 10px;
}

.header {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
  padding: 20px 15px;
  text-align: center;
  color: white;
}

.header h1 {
  font-size: 1.6em;
  margin-bottom: 5px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.content {
  padding: 15px;
}

.not-configured-message {
  text-align: center;
  padding: 30px 15px;
  color: #888;
}

.not-configured-message .icon {
  font-size: 2.5em;
  margin-bottom: 12px;
}

.not-configured-message h2 {
  color: #555;
  margin-bottom: 8px;
  font-size: 1.2em;
}

.not-configured-message p {
  color: #888;
  line-height: 1.6;
  font-size: 0.9em;
}

.prize-highlight {
  background: linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%);
  padding: 12px 15px;
  border-radius: 10px;
  margin: 12px 0;
  text-align: center;
  box-shadow: 0 4px 12px rgba(253, 203, 110, 0.3);
}

.prize-highlight .prize-icon {
  font-size: 1.8em;
  margin-bottom: 5px;
}

.prize-highlight h2 {
  color: #d63031;
  margin-bottom: 6px;
  font-size: 1.3em;
}

.prize-highlight p {
  color: #333;
  font-size: 1em;
  margin: 4px 0;
}

.info-section {
  margin-bottom: 12px;
}

.info-item {
  margin-bottom: 8px;
  padding: 10px 12px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border-left: 3px solid #ff6b6b;
}

.info-item .label {
  font-weight: bold;
  color: #555;
  margin-bottom: 4px;
  font-size: 0.85em;
}

.info-item .value {
  color: #333;
  font-size: 0.95em;
  line-height: 1.5;
}

.countdown {
  background: linear-gradient(135deg, #a29bfe 0%, #6c5ce7 100%);
  color: white;
  padding: 12px 15px;
  border-radius: 10px;
  text-align: center;
  margin: 12px 0;
}

.countdown h3 {
  margin-bottom: 6px;
  font-size: 0.95em;
}

.countdown .time {
  font-size: 1.5em;
  font-weight: bold;
  font-family: 'Courier New', monospace;
}

.winners-section {
  background: linear-gradient(135deg, #55efc4 0%, #00b894 100%);
  padding: 15px;
  border-radius: 10px;
  margin-top: 12px;
}

.winners-section h2 {
  color: white;
  text-align: center;
  margin-bottom: 12px;
  font-size: 1.3em;
}

.winner-card {
  background: white;
  padding: 10px 12px;
  border-radius: 8px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.winner-card .rank {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #fdcb6e 0%, #e17055 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-right: 10px;
  font-size: 1em;
  flex-shrink: 0;
}

.winner-card .avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 10px;
  flex-shrink: 0;
  border: 2px solid white;
}

.winner-card .avatar-placeholder {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255,255,255,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
  flex-shrink: 0;
  font-size: 16px;
  color: white;
  border: 2px solid white;
}

.winner-card .info {
  flex: 1;
}

.winner-card .nickname {
  font-weight: bold;
  color: #333;
  margin-bottom: 2px;
  font-size: 0.9em;
}

.winner-card .comment {
  font-size: 0.8em;
  color: #666;
  margin: 3px 0;
  font-style: italic;
}

.participate-btn {
  display: block;
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
  color: white;
  text-align: center;
  text-decoration: none;
  border-radius: 8px;
  font-size: 1em;
  font-weight: bold;
  margin-top: 12px;
  transition: transform 0.2s ease, box-shadow 0.3s ease;
}

.participate-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 107, 107, 0.4);
}

.footer-promotion {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 15px;
  text-align: center;
  color: white;
  margin-top: 12px;
  border-radius: 0 0 15px 15px;
}

.footer-promotion .promotion-title {
  font-size: 0.9em;
  margin-bottom: 6px;
  font-weight: bold;
}

.footer-promotion .promotion-desc {
  font-size: 0.8em;
  opacity: 0.9;
  margin-top: 4px;
}

@media (max-width: 600px) {
  .lottery-show {
    padding: 5px;
  }
  .header {
    padding: 15px 10px;
  }
  .header h1 {
    font-size: 1.3em;
  }
  .content {
    padding: 12px;
  }
}
</style>
