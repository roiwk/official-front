<template>
  <div class="min-h-screen gradient-bg flex items-center justify-center p-4">
    <div class="card max-w-md w-full">
      <div class="text-center mb-6">
        <div class="text-6xl mb-4">🔑</div>
        <h1 class="text-2xl md:text-3xl font-bold mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          请输入验证码
        </h1>
        <p class="text-gray-600 text-sm">请输入6位数字验证码以继续访问</p>
      </div>

      <div v-if="errorMessage" class="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
        <p class="text-red-800 text-sm text-center">{{ errorMessage }}</p>
      </div>

      <div v-if="tokenInfo" class="mb-4 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
        <p class="text-green-800 text-sm mb-2">✅ 验证码验证成功！</p>
        <div class="text-xs text-gray-600 space-y-1">
          <p v-if="tokenInfo.redirect_title" class="font-semibold text-green-900">
            📄 即将跳转到：{{ tokenInfo.redirect_title }}
          </p>
          <p v-if="tokenInfo.remaining_time">剩余时间: {{ tokenInfo.remaining_time }}</p>
          <p v-if="tokenInfo.type">
            类型: {{ getTypeName(tokenInfo.type) }}
          </p>
        </div>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            6位数字验证码
          </label>
          <input
            v-model="shortToken"
            type="text"
            maxlength="6"
            pattern="[0-9]{6}"
            placeholder="请输入6位数字"
            class="input text-center text-2xl font-mono tracking-widest"
            required
            autofocus
          />
        </div>

        <button
          type="submit"
          :disabled="loading || !shortToken"
          class="btn btn-primary w-full"
        >
          {{ loading ? '验证中...' : '验证并继续' }}
        </button>
      </form>

      <div class="mt-6 pt-6 border-t border-gray-200">
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 class="font-semibold text-blue-900 mb-2 text-sm">💡 如何获取验证码？</h3>
          <div class="text-xs text-blue-800 space-y-2">
            <p><strong>步骤一：</strong>关注微信公众号《容海》</p>
            <p><strong>步骤二：</strong>发送以下命令获取验证码：</p>
            <ul class="list-disc list-inside ml-2 space-y-1">
              <li>发送 "<strong>91</strong>" 或 "<strong>PDF验证码</strong>" 获取PDF转换验证码</li>
              <li>发送 "<strong>911</strong>" 或 "<strong>转PDF验证码</strong>" 获取文件转PDF验证码</li>
              <li>发送 "<strong>92</strong>" 或 "<strong>抽奖验证码</strong>" 获取抽奖验证码</li>
              <li>发送 "<strong>90</strong>" 或 "<strong>验证码</strong>" 查看验证码获取说明</li>
            </ul>
            <p class="mt-2 text-xs text-gray-600">⏰ 验证码有效期为24小时</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '../api'
import { tokenApi } from '../api'
import { getRoutePathByType, getRouteTitleByType, getTypeName } from '../constants/tokenTypes'

export default {
  name: 'TokenInput',
  data() {
    return {
      shortToken: '',
      errorMessage: '',
      tokenInfo: null,
      loading: false
    }
  },
  mounted() {
    // 如果URL中已有token，直接验证
    const token = this.$route.query.token || this.$route.query.t
    if (token && token.length === 6) {
      this.shortToken = token
      this.handleSubmit()
    }
  },
  methods: {
    async handleSubmit() {
      if (!this.shortToken || this.shortToken.length !== 6) {
        this.errorMessage = '请输入6位数字验证码'
        return
      }

      this.loading = true
      this.errorMessage = ''
      this.tokenInfo = null

      try {
        // 验证token
        const response = await tokenApi.validate({
          short_token: this.shortToken
        })

        if (response && response.success) {
          this.tokenInfo = response.data
          
          // 根据token类型获取前端路由路径
          const tokenType = response.data.type
          const redirectPath = getRoutePathByType(tokenType)
          
          if (!redirectPath) {
            this.errorMessage = '未知的token类型，无法跳转'
            return
          }
          
          // 构建查询参数：使用真实token + 后端返回的redirect_params
          // 统一使用 t 作为参数名，与后端保持一致
          const query = {
            t: response.data.real_token,
            ...(response.data.redirect_params || {})
          }
          
          // 添加页面标题信息（用于显示）
          this.tokenInfo.redirect_title = getRouteTitleByType(tokenType)

          // 延迟一下显示成功信息，然后跳转
          setTimeout(() => {
            this.$router.push({
              path: redirectPath,
              query: query
            })
          }, 1500)
        } else {
          this.errorMessage = response?.error || '验证码验证失败'
        }
      } catch (error) {
        console.error('验证码验证失败:', error)
        this.errorMessage = error.response?.data?.error || '验证码不存在或已过期，请重新获取'
      } finally {
        this.loading = false
      }
    },
    getTypeName(type) {
      return getTypeName(type)
    }
  }
}
</script>

<style scoped>
.gradient-bg {
  @apply bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-600;
}
</style>
