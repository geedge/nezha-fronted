<template>
  <div style="width: 100%;height: 100%" :id="'chartUrl' + chartInfo.id" class="mt-10 url-container" v-show="firstShow">
    <iframe :id="'urlContainer' + chartInfo.id" frameborder="0" width="100%" height="100%" name="showHere" scrolling=auto style="z-index:5000;padding-bottom:6px;"></iframe>
  </div>
</template>

<script>
export default {
  name: 'chart-url',
  props: {
    chartInfo: {},
    chartData: {}
  },
  data () {
    return {
      firstShow: false
    }
  },
  methods: {
    setLoadFrame (data) {
      const that = this
      this.$nextTick(() => {
        const iframe = document.querySelector('#urlContainer' + this.chartInfo.id)
        // 处理兼容行问题
        if (iframe.attachEvent) {
          iframe.attachEvent('onload', function () {
            // iframe加载完毕以后执行操作
            that.firstShow = true
            // console.log('iframe已加载完毕');
          })
        } else {
          iframe.onload = function () {
            // iframe加载完毕以后执行操作
            that.firstShow = true
            // console.log('iframe已加载完毕');
          }
        }
        iframe.src = data
      })
    }
  },
  watch: {
    chartInfo: {
      deep: true,
      immediate: true,
      handler (n) {
        this.setLoadFrame(n.param.url)
      }
    }
  }
}
</script>

<style scoped>

</style>
