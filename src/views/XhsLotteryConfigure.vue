<template>
  <div class="lottery-configure">
    <div class="container">
      <h1>🎁 小红书抽奖设置</h1>
      <p class="subtitle">配置您的抽奖活动信息</p>

      <div v-if="pageLoading" class="page-loading">
        <div class="page-spinner"></div>
        <p class="page-loading-text">正在加载配置信息...</p>
      </div>

      <template v-else>
      <div v-if="errorMessage" class="message error">{{ errorMessage }}</div>
      <div v-if="successMessage" class="message success">{{ successMessage }}</div>

      <div v-if="successMessage && lottery" class="info-box">
        <h3>✅ 配置成功！</h3>
        <p>您的抽奖展示页面：</p>
        <p><a :href="showUrl" target="_blank">{{ showUrl }}</a></p>
        <p style="margin-top: 10px; color: #888; font-size: 0.9em;">此链接永久有效，可分享给用户查看抽奖详情和结果。</p>
      </div>

      <!-- 已配置状态的显示 -->
      <div v-if="lottery && lottery.is_configured" class="info-box">
        <h3>📋 当前配置信息</h3>
        <p><strong>小红书文章：</strong><a :href="lottery.xhs_article_url" target="_blank">查看文章</a></p>
        <p><strong>奖品：</strong>{{ lottery.prize_description }}</p>
        <p><strong>数量：</strong>{{ lottery.prize_count }} 份</p>
        <p><strong>开始时间：</strong>{{ lottery.start_time }}</p>
        <p><strong>截止时间：</strong>{{ lottery.end_time }}</p>
        <p><strong>抽奖规则：</strong>{{ lottery.unique_by_user ? '用户去重（多次评论算一次）' : '不去重（每条评论都算）' }}</p>
        <p v-if="lottery.is_manual_mode && lottery.is_drawn" style="color: #28a745; font-weight: bold;">✅ 已手动选择中奖者</p>
        <p v-else-if="lottery.is_auto_mode && lottery.is_drawn" style="color: #28a745; font-weight: bold;">✅ 已自动开奖</p>
      </div>

      <!-- 手动选择中奖者区域 -->
      <div v-if="lottery && lottery.is_configured && lottery.can_manual_select" class="info-box manual-select-box">
        <h3>🎯 手动选择中奖者</h3>
        
        <!-- 已选择中奖者显示 -->
        <div v-if="lottery.is_manual_mode && lottery.is_drawn && lottery.winners && lottery.winners.length > 0">
          <p style="color: #28a745; font-weight: bold; margin-bottom: 15px;">✅ 已手动选择中奖者</p>
          <p><strong>已选择的中奖者（共 {{ lottery.winners.length }} 位）：</strong></p>
          <div class="candidates-list" style="max-height: 400px; overflow-y: auto; margin: 15px 0;">
            <div v-for="(winner, index) in lottery.winners" :key="index" class="winner-item">
              <div style="display: flex; align-items: center;">
                <div class="winner-number">{{ index + 1 }}</div>
                <img 
                  v-if="winner.avatar"
                  :src="winner.avatar" 
                  :alt="winner.nickname || '用户'"
                  class="avatar"
                  @error="handleImageError"
                >
                <div v-else class="avatar-placeholder">{{ (winner.nickname || '用').charAt(0) }}</div>
                <div style="flex: 1;">
                  <strong style="color: #155724;">{{ winner.nickname || '匿名用户' }}</strong>
                  <div v-if="winner.comment" class="comment-text">
                    {{ winner.comment.length > 50 ? winner.comment.substring(0, 50) + '...' : winner.comment }}
                  </div>
                  <div v-if="winner.selected_at" class="selected-time">
                    选择时间：{{ winner.selected_at }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 未选择状态：显示备选用户列表 -->
        <div v-else>
          <div class="warning-highlight">
            <p>⚠️ <span style="font-size: 1.15em;">重要提醒</span> ⚠️</p>
            <p>在抽奖截止时间前，您可以手动选择中奖者。</p>
            <p style="font-size: 1.1em; text-shadow: 1px 1px 2px rgba(0,0,0,0.2);">请仔细检查参与条件是否满足，然后选择中奖者！</p>
          </div>
          
          <div v-if="!lottery.candidates || lottery.candidates.length === 0">
            <p style="color: #856404;">暂无备选用户，请先生成备选用户列表。</p>
            <button type="button" @click="generateCandidates" class="submit-btn" :disabled="loadingCandidates" style="margin-top: 10px;">
              {{ loadingCandidates ? '生成中...' : '生成备选用户' }}
            </button>
          </div>
          
          <div v-else>
            <p><strong>备选用户（共 {{ lottery.candidates.length }} 人）：</strong></p>
            <p style="font-size: 0.9em; color: #856404;">请选择 {{ lottery.prize_count }} 位中奖者（可多选）</p>
            
            <div class="candidates-list" style="max-height: 400px; overflow-y: auto; margin: 15px 0;">
              <div v-for="candidate in lottery.candidates" :key="candidate.user_id" class="candidate-item">
                <label class="candidate-label">
                  <input 
                    type="checkbox" 
                    :value="candidate.user_id"
                    v-model="selectedCandidates"
                    class="candidate-checkbox"
                    @change="handleCandidateChange"
                  >
                  <img 
                    v-if="candidate.avatar"
                    :src="candidate.avatar" 
                    :alt="candidate.nickname || '用户'"
                    class="avatar"
                    @error="handleImageError"
                  >
                  <div v-else class="avatar-placeholder">{{ (candidate.nickname || '用').charAt(0) }}</div>
                  <div style="flex: 1;">
                    <strong>{{ candidate.nickname || '匿名用户' }}</strong>
                    <div v-if="candidate.comment" class="comment-text">
                      {{ candidate.comment.length > 50 ? candidate.comment.substring(0, 50) + '...' : candidate.comment }}
                    </div>
                  </div>
                </label>
              </div>
            </div>
            
            <div style="margin-top: 15px;">
              <button type="button" @click="refreshCandidates" class="submit-btn refresh-btn" :disabled="loadingCandidates">
                {{ loadingCandidates ? '刷新中...' : '刷新备选用户' }}
              </button>
              <button type="button" @click="selectWinners" class="submit-btn" :disabled="selectedCandidates.length === 0 || loadingSelect">
                {{ loadingSelect ? '保存中...' : '确认选择中奖者' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 无法修改配置的提示 -->
      <div v-if="lottery && lottery.is_configured && !canEdit" class="message error">
        <strong>⚠️ 无法修改配置</strong><br>
        <span v-if="lottery.is_drawn">抽奖已开奖，无法修改配置。</span>
        <span v-else>
          <span v-if="lottery.seconds_until_end !== null && lottery.seconds_until_end <= 180">
            距离开奖时间不足3分钟，无法修改配置。
            <span v-if="lottery.seconds_until_end > 0">
              剩余时间：{{ formatTimeRemaining(lottery.seconds_until_end) }}
            </span>
          </span>
          <span v-else>当前无法修改配置。</span>
        </span>
      </div>

      <!-- 折叠/展开配置表单 -->
      <div v-if="lottery && lottery.is_configured && canEdit" class="toggle-section">
        <div class="toggle-header" @click="toggleConfigForm">
          <h3>
            <span>⚙️</span>
            <span>修改抽奖配置</span>
          </h3>
          <span class="toggle-icon" :class="{ expanded: showConfigForm }">▼</span>
        </div>
        <div class="toggle-content" :class="{ expanded: showConfigForm }">
          <form @submit.prevent="submitForm" id="config-form">
        <div class="form-group">
          <label>小红书文章链接 <span class="required">*</span></label>
          <textarea 
            v-model="form.xhs_article_url" 
            rows="4" 
            required
            placeholder="可以直接粘贴小红书分享内容，例如：&#10;🎁 | 感谢宝宝们的陪伴和支持 http://xhslink.com/o/7jaDTHxWETY &#10;复制后打开【小红书】查看笔记！&#10;&#10;或者直接粘贴完整链接：&#10;https://www.xiaohongshu.com/explore/..."
            style="min-height: 100px; font-family: monospace;"
          ></textarea>
          <div v-if="extractedUrl" class="url-preview">
            <strong>提取的链接：</strong>
            <span class="extracted-url">{{ extractedUrl }}</span>
          </div>
        </div>
        <div class="form-group">
          <label>奖品描述 <span class="required">*</span></label>
          <textarea 
            v-model="form.prize_description" 
            required
            placeholder="例如：AirPods Pro 第二代，价值 1899 元"
          ></textarea>
          <div class="helper-text">详细描述奖品内容和价值</div>
        </div>
        <div class="form-group">
          <label>奖品数量 <span class="required">*</span></label>
          <input type="number" v-model.number="form.prize_count" min="1" required>
          <div class="helper-text">将抽取的获奖人数</div>
        </div>
        <div class="form-group">
          <label>参与条件 <span class="required">*</span></label>
          <textarea 
            v-model="form.participate_condition" 
            required
            placeholder="例如：关注账号 + 点赞 + 评论区留言"
          ></textarea>
          <div class="helper-text">用户需要满足的参与条件</div>
        </div>
        <div class="form-group">
          <label>开始时间 <span class="required">*</span></label>
          <input type="datetime-local" v-model="form.start_time" required>
        </div>
        <div class="form-group">
          <label>截止时间 <span class="required">*</span></label>
          <input type="datetime-local" v-model="form.end_time" required>
          <div class="helper-text">到达此时间后将自动开奖</div>
        </div>
        <div class="form-group rule-settings">
          <label class="rule-label">🎯 抽奖规则设置</label>
          <div class="rule-item">
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                v-model="form.unique_by_user"
                style="width: auto; margin-right: 10px; cursor: pointer;"
              >
              <span>同一用户多次评论只算一次参与机会</span>
            </label>
            <div class="helper-text" style="margin-left: 30px;">
              勾选后：同一用户的多条评论会去重，只保留第一条评论<br>
              不勾选：用户每条评论都算一次参与机会
            </div>
          </div>
          <div class="rule-item">
            <label class="checkbox-label disabled">
              <input 
                type="checkbox" 
                v-model="form.allow_duplicate"
                disabled
                style="width: auto; margin-right: 10px; cursor: not-allowed;"
              >
              <span style="color: #999;">允许同一用户多次中奖（暂不支持）</span>
            </label>
            <div class="helper-text" style="margin-left: 30px;">
              此选项暂未实现，目前始终为：同一用户只能中奖一次
            </div>
          </div>
        </div>
            <button type="submit" class="submit-btn" :disabled="loading">
              {{ loading ? '保存中...' : (lottery?.is_configured ? '更新配置' : '保存配置') }}
            </button>
          </form>
        </div>
      </div>

      <!-- 未配置或没有成功消息时直接显示表单（不在折叠区域） -->
      <form v-if="(!lottery || !lottery.is_configured || !successMessage) && canEdit && !(lottery && lottery.is_configured)" @submit.prevent="submitForm" id="config-form">
        <div class="form-group">
          <label>小红书文章链接 <span class="required">*</span></label>
          <textarea 
            v-model="form.xhs_article_url" 
            rows="4" 
            required
            placeholder="可以直接粘贴小红书分享内容，例如：&#10;🎁 | 感谢宝宝们的陪伴和支持 http://xhslink.com/o/7jaDTHxWETY &#10;复制后打开【小红书】查看笔记！&#10;&#10;或者直接粘贴完整链接：&#10;https://www.xiaohongshu.com/explore/..."
            style="min-height: 100px; font-family: monospace;"
          ></textarea>
          <div v-if="extractedUrl" class="url-preview">
            <strong>提取的链接：</strong>
            <span class="extracted-url">{{ extractedUrl }}</span>
          </div>
        </div>
        <div class="form-group">
          <label>奖品描述 <span class="required">*</span></label>
          <textarea 
            v-model="form.prize_description" 
            required
            placeholder="例如：AirPods Pro 第二代，价值 1899 元"
          ></textarea>
          <div class="helper-text">详细描述奖品内容和价值</div>
        </div>
        <div class="form-group">
          <label>奖品数量 <span class="required">*</span></label>
          <input type="number" v-model.number="form.prize_count" min="1" required>
          <div class="helper-text">将抽取的获奖人数</div>
        </div>
        <div class="form-group">
          <label>参与条件 <span class="required">*</span></label>
          <textarea 
            v-model="form.participate_condition" 
            required
            placeholder="例如：关注账号 + 点赞 + 评论区留言"
          ></textarea>
          <div class="helper-text">用户需要满足的参与条件</div>
        </div>
        <div class="form-group">
          <label>开始时间 <span class="required">*</span></label>
          <input type="datetime-local" v-model="form.start_time" required>
        </div>
        <div class="form-group">
          <label>截止时间 <span class="required">*</span></label>
          <input type="datetime-local" v-model="form.end_time" required>
          <div class="helper-text">到达此时间后将自动开奖</div>
        </div>
        <div class="form-group rule-settings">
          <label class="rule-label">🎯 抽奖规则设置</label>
          <div class="rule-item">
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                v-model="form.unique_by_user"
                style="width: auto; margin-right: 10px; cursor: pointer;"
              >
              <span>同一用户多次评论只算一次参与机会</span>
            </label>
            <div class="helper-text" style="margin-left: 30px;">
              勾选后：同一用户的多条评论会去重，只保留第一条评论<br>
              不勾选：用户每条评论都算一次参与机会
            </div>
          </div>
          <div class="rule-item">
            <label class="checkbox-label disabled">
              <input 
                type="checkbox" 
                v-model="form.allow_duplicate"
                disabled
                style="width: auto; margin-right: 10px; cursor: not-allowed;"
              >
              <span style="color: #999;">允许同一用户多次中奖（暂不支持）</span>
            </label>
            <div class="helper-text" style="margin-left: 30px;">
              此选项暂未实现，目前始终为：同一用户只能中奖一次
            </div>
          </div>
        </div>
        <button type="submit" class="submit-btn" :disabled="loading">
          {{ loading ? '保存中...' : (lottery?.is_configured ? '更新配置' : '保存配置') }}
        </button>
      </form>

      </template>

      <!-- 自定义弹窗 -->
      <div v-if="modal.show" class="custom-modal" @click.self="closeModal">
        <div class="custom-modal-content">
          <div class="custom-modal-header">
            <div style="display: flex; align-items: center;">
              <span class="modal-icon">{{ modal.icon }}</span>
              <span>{{ modal.title }}</span>
            </div>
            <button class="modal-close" @click="closeModal">×</button>
          </div>
          <div class="custom-modal-body" :class="modal.type">
            <div v-html="modal.message"></div>
          </div>
          <div class="custom-modal-footer">
            <button 
              v-if="modal.type === 'confirm' || modal.type === 'danger'" 
              class="custom-modal-btn custom-modal-btn-secondary" 
              @click="cancelModal"
            >
              取消
            </button>
            <button 
              class="custom-modal-btn custom-modal-btn-primary" 
              @click="confirmModal"
            >
              确定
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { lotteryApi } from '../api'
import { formatDate } from '../utils'

export default {
  name: 'XhsLotteryConfigure',
  data() {
    return {
      pageLoading: true,
      lottery: null,
      errorMessage: '',
      successMessage: '',
      loading: false,
      loadingCandidates: false,
      loadingSelect: false,
      canEdit: true,
      extractedUrl: '',
      showConfigForm: false,
      selectedCandidates: [],
      modal: {
        show: false,
        type: 'info', // info, success, error, warning, confirm, danger
        title: '',
        message: '',
        icon: 'ℹ️',
        resolve: null
      },
      form: {
        xhs_article_url: '',
        prize_description: '',
        prize_count: 1,
        participate_condition: '',
        start_time: '',
        end_time: '',
        allow_duplicate: false,
        unique_by_user: true
      }
    }
  },
  computed: {
    showUrl() {
      if (!this.lottery) return ''
      return `${window.location.origin}/xhs-lottery/show?lottery_id=${this.$route.query.lottery_id}`
    }
  },
  mounted() {
    this.loadData()
    // 监听 URL 输入变化，实时提取链接
    this.$watch('form.xhs_article_url', (newVal) => {
      this.extractUrl(newVal)
    })
  },
  methods: {
    extractUrl(input) {
      if (!input || !input.trim()) {
        this.extractedUrl = ''
        return
      }
      // 简单的URL提取（前端预览）
      const urlPattern = /(?:https?:\/\/)?(?:www\.)?(?:xhslink\.com\/[^\s\)]+|xiaohongshu\.com\/[^\s\)]+)/i
      const match = input.match(urlPattern)
      if (match) {
        let url = match[0].trim()
        url = url.replace(/[.,;!?）)]+$/, '') // 移除尾随标点
        if (!url.match(/^https?:\/\//i)) {
          url = 'https://' + url
        }
        this.extractedUrl = url
      } else {
        this.extractedUrl = ''
      }
    },
    async loadData() {
      try {
        const params = {
          lottery_id: this.$route.query.lottery_id,
          [this.getTokenKey()]: this.$route.query[this.getTokenKey()]
        }
        const response = await lotteryApi.getConfigure(params)
        if (response && response.data) {
          this.lottery = response.data.lottery
          this.canEdit = response.data.can_edit
          if (this.lottery) {
            this.form = {
              xhs_article_url: this.lottery.xhs_article_url || '',
              prize_description: this.lottery.prize_description || '',
              prize_count: this.lottery.prize_count || 1,
              participate_condition: this.lottery.participate_condition || '',
              start_time: formatDate(this.lottery.start_time),
              end_time: formatDate(this.lottery.end_time),
              allow_duplicate: this.lottery.allow_duplicate ?? false,
              unique_by_user: this.lottery.unique_by_user ?? true
            }
            this.extractUrl(this.form.xhs_article_url)
          }
        }
        this.pageLoading = false
      } catch (error) {
        if (error.message && error.message.includes('Token')) return
        console.error('加载失败:', error)
        this.errorMessage = error.message || '加载失败，请重试'
        this.pageLoading = false
      }
    },
    async submitForm() {
      this.loading = true
      this.errorMessage = ''
      try {
        const params = {
          lottery_id: this.$route.query.lottery_id,
          [this.getTokenKey()]: this.$route.query[this.getTokenKey()]
        }
        const response = await lotteryApi.submitConfigure(this.form, params)
        if (response && response.success) {
          this.successMessage = '抽奖配置保存成功！'
          await this.loadData()
        } else {
          this.errorMessage = response?.error || '保存失败'
        }
      } catch (error) {
        // Token 过期已在拦截器中处理跳转，这里不需要额外处理
        if (error.message && error.message.includes('Token')) {
          return
        }
        this.errorMessage = error.response?.data?.error || error.message || '保存失败，请重试'
      } finally {
        this.loading = false
      }
    },
    getTokenKey() {
      // 兼容 token 和 t 两种参数名
      return this.$route.query.t ? 't' : 'token'
    },
    toggleConfigForm() {
      this.showConfigForm = !this.showConfigForm
    },
    formatTimeRemaining(seconds) {
      if (seconds <= 0) return '0秒'
      const minutes = Math.floor(seconds / 60)
      const secs = seconds % 60
      return `${minutes}分${secs}秒`
    },
    handleImageError(event) {
      event.target.style.display = 'none'
      const placeholder = event.target.nextElementSibling
      if (placeholder) {
        placeholder.style.display = 'flex'
      }
    },
    handleCandidateChange() {
      // 限制选择数量
      if (this.selectedCandidates.length > this.lottery.prize_count) {
        this.showAlert(`最多只能选择 ${this.lottery.prize_count} 位中奖者`, 'warning')
        // 移除最后一个选中的
        this.selectedCandidates.pop()
      }
    },
    showAlert(message, type = 'info', title = null) {
      const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
      }
      const titles = {
        success: '成功',
        error: '错误',
        warning: '警告',
        info: '提示'
      }
      
      this.modal = {
        show: true,
        type: type,
        title: title || titles[type] || '提示',
        message: message.replace(/\n/g, '<br>'),
        icon: icons[type] || 'ℹ️',
        resolve: null
      }
    },
    showConfirm(message, type = 'warning', title = null) {
      return new Promise((resolve) => {
        const icons = {
          warning: '⚠️',
          danger: '⚠️',
          confirm: '❓'
        }
        const titles = {
          warning: '确认',
          danger: '确认',
          confirm: '确认'
        }
        
        this.modal = {
          show: true,
          type: type,
          title: title || titles[type] || '确认',
          message: typeof message === 'string' ? message.replace(/\n/g, '<br>') : message,
          icon: icons[type] || '❓',
          resolve: resolve
        }
      })
    },
    closeModal() {
      if (this.modal.resolve) {
        this.modal.resolve(false)
      }
      this.modal.show = false
      this.modal.resolve = null
    },
    cancelModal() {
      if (this.modal.resolve) {
        this.modal.resolve(false)
      }
      this.modal.show = false
      this.modal.resolve = null
    },
    confirmModal() {
      if (this.modal.resolve) {
        this.modal.resolve(true)
      }
      this.modal.show = false
      this.modal.resolve = null
    },
    async generateCandidates() {
      const confirmed = await this.showConfirm('确定要生成备选用户列表吗？这将从小红书获取评论数据。', 'warning')
      if (!confirmed) {
        return
      }
      
      this.loadingCandidates = true
      try {
        const params = {
          lottery_id: this.$route.query.lottery_id,
          [this.getTokenKey()]: this.$route.query[this.getTokenKey()]
        }
        const response = await lotteryApi.generateCandidates(params)
        if (response && response.success) {
          this.showAlert('备选用户生成成功！', 'success')
          await this.loadData()
        } else {
          this.showAlert(`生成失败：${response?.message || '未知错误'}`, 'error')
        }
      } catch (error) {
        console.error('生成失败:', error)
        this.showAlert('生成失败，请重试', 'error')
      } finally {
        this.loadingCandidates = false
      }
    },
    async refreshCandidates() {
      const confirmed = await this.showConfirm('确定要刷新备选用户列表吗？这将重新获取评论数据。', 'warning')
      if (!confirmed) {
        return
      }
      
      await this.generateCandidates()
    },
    async selectWinners() {
      if (this.selectedCandidates.length === 0) {
        this.showAlert('请至少选择一位中奖者', 'warning')
        return
      }

      let finalSelected = [...this.selectedCandidates]
      
      if (finalSelected.length > this.lottery.prize_count) {
        const confirmed = await this.showConfirm(
          `您选择了 ${finalSelected.length} 位，但奖品数量为 ${this.lottery.prize_count} 份。将只保留前 ${this.lottery.prize_count} 位，确定继续吗？`,
          'warning'
        )
        if (!confirmed) {
          return
        }
        finalSelected = finalSelected.slice(0, this.lottery.prize_count)
      }

      // 最终确认
      const finalConfirmMessage = `
        <div style="text-align: center;">
          <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%); color: white; padding: 16px; border-radius: 8px; margin-bottom: 16px; font-weight: bold;">
            ⚠️ 重要提醒：选中后将不能再修改！
          </div>
          <div style="margin-top: 16px; font-size: 1.05em;">
            确定选择这 <strong style="color: #667eea; font-size: 1.2em;">${finalSelected.length}</strong> 位用户为中奖者吗？
          </div>
          <div style="margin-top: 12px; color: #666; font-size: 0.95em;">
            请确认他们是否满足参与条件
          </div>
        </div>
      `
      const finalConfirm = await this.showConfirm(finalConfirmMessage, 'danger', '最终确认')
      if (!finalConfirm) {
        return
      }

      this.loadingSelect = true
      try {
        const params = {
          lottery_id: this.$route.query.lottery_id,
          [this.getTokenKey()]: this.$route.query[this.getTokenKey()]
        }
        // 构建 FormData
        const formData = new FormData()
        finalSelected.forEach(id => {
          formData.append('user_ids[]', id)
        })
        
        const response = await lotteryApi.manualSelect(formData, params)
        if (response && response.success) {
          this.showAlert('中奖者选择成功！', 'success')
          this.selectedCandidates = []
          await this.loadData()
        } else {
          this.showAlert(`选择失败：${response?.message || '未知错误'}`, 'error')
        }
      } catch (error) {
        console.error('选择失败:', error)
        this.showAlert('选择失败，请重试', 'error')
      } finally {
        this.loadingSelect = false
      }
    }
  }
}
</script>

<style scoped>
.lottery-configure {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  margin: 0;
  padding: 20px;
  min-height: 100vh;
  color: #333;
}

.container {
  background-color: #ffffff;
  padding: 30px;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  margin: 0 auto;
}

h1 {
  text-align: center;
  color: #667eea;
  margin-bottom: 10px;
  font-size: 2em;
}

.subtitle {
  text-align: center;
  color: #666;
  margin-bottom: 30px;
  font-size: 0.95em;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #555;
}

.required {
  color: #e74c3c;
}

input, textarea {
  width: 100%;
  padding: 12px;
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  box-sizing: border-box;
  font-size: 1em;
  transition: border-color 0.3s ease;
}

input:focus,
textarea:focus {
  outline: none;
  border-color: #667eea;
}

textarea {
  resize: vertical;
  min-height: 100px;
}

.helper-text {
  font-size: 0.85em;
  color: #888;
  margin-top: 5px;
}

.url-preview {
  margin-top: 10px;
  padding: 10px;
  background: #f0f0f0;
  border-radius: 5px;
  font-size: 0.9em;
}

.extracted-url {
  color: #667eea;
  word-break: break-all;
  font-family: monospace;
}

.rule-settings {
  border-top: 2px dashed #e1e8ed;
  padding-top: 20px;
  margin-top: 20px;
}

.rule-label {
  color: #667eea;
  font-size: 1.1em;
  margin-bottom: 15px;
  display: block;
}

.rule-item {
  margin-bottom: 15px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  font-weight: normal;
  cursor: pointer;
}

.checkbox-label.disabled {
  cursor: default;
}

.submit-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1em;
  font-weight: bold;
  cursor: pointer;
}

.submit-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.message {
  text-align: center;
  padding: 15px;
  margin-bottom: 20px;
  border-radius: 8px;
}

.message.success {
  background-color: #d4edda;
  color: #155724;
}

.message.error {
  background-color: #f8d7da;
  color: #721c24;
}

.info-box {
  background-color: #e7f3ff;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  border-left: 4px solid #667eea;
}

.info-box h3 {
  margin-top: 0;
  color: #667eea;
  font-size: 1.1em;
}

.info-box p {
  margin: 5px 0;
  font-size: 0.95em;
  color: #555;
}

.info-box a {
  color: #667eea;
  text-decoration: none;
  word-break: break-all;
}

.info-box a:hover {
  text-decoration: underline;
}

.manual-select-box {
  background-color: #fff3cd;
  border-left-color: #ffc107;
}

.warning-highlight {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
  color: white;
  padding: 16px;
  border-radius: 8px;
  margin: 16px 0;
  font-weight: bold;
  text-align: center;
  font-size: 1.1em;
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
}

.warning-highlight p {
  margin: 5px 0;
  color: white;
}

.candidates-list {
  max-height: 400px;
  overflow-y: auto;
  margin: 15px 0;
}

.candidate-item, .winner-item {
  padding: 10px;
  margin: 5px 0;
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  background: white;
}

.winner-item {
  border-color: #28a745;
  background: #f0fff4;
}

.candidate-label {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.candidate-checkbox {
  width: auto;
  margin-right: 10px;
  cursor: pointer;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 10px;
  flex-shrink: 0;
  border: 2px solid #e1e8ed;
}

.winner-item .avatar {
  border-color: #28a745;
}

.avatar-placeholder {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #e1e8ed;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
  flex-shrink: 0;
  font-size: 18px;
  color: #999;
  border: 2px solid #e1e8ed;
}

.winner-item .avatar-placeholder {
  background: #d4edda;
  color: #155724;
  border-color: #28a745;
}

.winner-number {
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
  flex-shrink: 0;
  font-size: 14px;
}

.comment-text {
  font-size: 0.85em;
  color: #666;
  margin-top: 3px;
}

.selected-time {
  font-size: 0.8em;
  color: #888;
  margin-top: 3px;
}

.refresh-btn {
  background: #6c757d;
  margin-bottom: 10px;
}

.toggle-section {
  margin-top: 20px;
}

.toggle-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 0;
}

.toggle-header:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.toggle-header h3 {
  margin: 0;
  font-size: 1.1em;
  display: flex;
  align-items: center;
  gap: 10px;
}

.toggle-icon {
  transition: transform 0.3s ease;
  font-size: 1.2em;
}

.toggle-icon.expanded {
  transform: rotate(180deg);
}

.toggle-content {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease-out;
  background: white;
  border-radius: 0 0 8px 8px;
  margin-top: 0;
}

.toggle-content.expanded {
  max-height: 5000px;
  padding: 20px;
  border: 1px solid #e1e8ed;
  border-top: none;
}

/* 自定义弹窗样式 */
.custom-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.custom-modal-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.custom-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid #e1e8ed;
  font-size: 1.1em;
  font-weight: bold;
}

.modal-icon {
  font-size: 1.3em;
  margin-right: 10px;
}

.modal-close {
  background: none;
  border: none;
  font-size: 28px;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: #f0f0f0;
  color: #333;
}

.custom-modal-body {
  padding: 20px;
  font-size: 1em;
  line-height: 1.6;
  color: #333;
}

.custom-modal-body.success {
  color: #155724;
}

.custom-modal-body.error {
  color: #721c24;
}

.custom-modal-body.warning {
  color: #856404;
}

.custom-modal-body.danger {
  color: #721c24;
}

.custom-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 20px;
  border-top: 1px solid #e1e8ed;
}

.custom-modal-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 1em;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 80px;
}

.custom-modal-btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.custom-modal-btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.custom-modal-btn-secondary {
  background: #6c757d;
  color: white;
}

.custom-modal-btn-secondary:hover {
  background: #5a6268;
  transform: translateY(-2px);
}

.page-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}

.page-spinner {
  width: 44px;
  height: 44px;
  border: 4px solid #e8edf2;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: pageSpin 0.8s linear infinite;
  margin-bottom: 16px;
}

.page-loading-text {
  color: #666;
  font-size: 0.95em;
}

@keyframes pageSpin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
