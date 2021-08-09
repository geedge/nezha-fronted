<template>
  <transition name="el-zoom-in-center">
    <div v-show="browserWindowZoom" class="zoom">
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
        // console.log('缩放比例是：' + Math.round(1000 * (currentPixelRatio / originPixelRatio)) / 10 + '%');
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

<style lang="scss" scoped>
  .transition-box {
    margin-bottom: 10px;
    width: 200px;
    height: 100px;
    border-radius: 4px;
    background-color: #409EFF;
    text-align: center;
    color: #fff;
    padding: 40px 20px;
    box-sizing: border-box;
    margin-right: 20px;
  }
  .zoom {
    background: #F9F9F9;
    border: 1px solid #DBDBDB;
    border-radius: 2px;
    width: 400px;
    height: 108px;
    position: absolute;
    z-index: 1;
    left: 50%;
    top: 50px;
    margin-left: -186px;
    span {
      font-family: Roboto-Regular;
      margin-top: 15px;
      font-size: 14px;
      color: #666666;
      line-height: 20px;
      font-weight: 400;
      width: 350px;
      height: 40px;
      margin-left: 40px;
      display: inline-block;
    }
    i {
      position: absolute;
      color: #FA901C;
      top: 15px;
      left: 12px;
    }
    .zoom-button {
      margin-top: 10px;
      margin-left: 39px;
      border: 1px solid #DBDBDB;
      border-radius: 4px;
      background-color: #F9F9F9;
      color: #000;
      font-style: italic;
      font-weight: 900;
      padding: 4px 10px;
    }
  }
</style>
