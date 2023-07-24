<template>
  <transition name="el-zoom-in-center">
    <div v-show="browserWindowZoom" class="zoom" style="z-index: 1001;">
      <i class="nz-icon nz-icon-about-full"></i>
      <span>{{$t('tip.zoomStatusPrompt')}}</span>
      <button class="zoom-button" @click="doNotAskAgain">{{$t('tip.doNotAskAgain')}}</button>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'browserWindowZoom',
  data () {
    return {
      browserWindowZoom: false,
      timer: null,
      flag: true
    }
  },
  mounted () {
    // 获取localStorage中的key值
    const data = localStorage.getItem('browserZoom')
    // 判断是否执行缩放弹框功能
    if (data != 0) {
      window.addEventListener('resize', this.browserZoom)
      document.addEventListener('DOMContentLoaded', this.browserZoom)
    }
  },
  beforeDestroy () {
    // 移除定时器
    clearInterval(this.timer)
  },
  methods: {
    doNotAskAgain () {
      // 点击事件隐藏弹框
      this.browserWindowZoom = false
      // 存储localStorage的key值
      localStorage.setItem('browserZoom', 0)
      // 移除事件
      window.removeEventListener('resize', this.browserZoom)
      document.removeEventListener('DOMContentLoaded', this.browserZoom)
    },
    browserZoom () {
      // 初始缩放比例
      let originPixelRatio = localStorage.devicePixelRatio
      if (!originPixelRatio) {
        originPixelRatio = window.devicePixelRatio
        // 整数才保存
        if (Number.isInteger(originPixelRatio)) {
          localStorage.devicePixelRatio = originPixelRatio
        }
      }
      let lastPixelRatio = originPixelRatio
      const currentPixelRatio = window.devicePixelRatio
      if (currentPixelRatio !== lastPixelRatio) {
        // 计算缩放百分比
        const zoom = Math.round(1000 * (currentPixelRatio / originPixelRatio)) / 10 + '%'
        if (zoom != '100%') {
          // 缩放时显示弹框
          this.browserWindowZoom = true
          // 定义开关防止重复触发
          let flag = true
          // 定时器5秒后隐藏弹框
          if (flag === true) {
            // 设置定时器
            this.timer = setTimeout(() => {
              this.browserWindowZoom = false
            }, 5000)
            // 关闭
            flag = false
          }
          // 打开
          flag = true
        }
      }
      // 记住上一次的设备像素比
      lastPixelRatio = currentPixelRatio
    }
  }
}
</script>
