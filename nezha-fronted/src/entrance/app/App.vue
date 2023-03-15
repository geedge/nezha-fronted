<template>
  <div id="app">
    <browser-window-zoom />
    <keep-alive exclude="login">
      <router-view style="height: 100%"/>
    </keep-alive>
  </div>
</template>

<script>
import browserWindowZoom from '@/components/common/browserWindowZoom'
export default {
  name: 'App',
  components: {
    browserWindowZoom
  },
  async created () {
    const herfSpiltArr = window.location.href.split('/')
    // if (herfSpiltArr[3] !== '#') {
    //   herfSpiltArr[3] = '#'
    //   window.location.href = herfSpiltArr.join('/')
    // }
    const Timestamp = new Date().getTime()
    const url = '/static/config.json?Timestamp=' + Timestamp
    const result = await this.$http.get(url) // 获取本地的config.json 判断是否需要清空localStorage 以及设备的宽 和 axios的baseUrl
    this.$axios.defaults.baseURL = result.body.baseUrl
    const version = result.body.version
    const baseUrl = result.body.baseUrl
    localStorage.setItem('nz-baseURL', baseUrl)
    const defaultWindowWidth = result.body.width || 1024
    if (version !== localStorage.getItem('nz-version')) {
      localStorage.clear()
      localStorage.setItem('nz-version', version)
      localStorage.setItem('nz-baseURL', baseUrl)
      herfSpiltArr[2] = herfSpiltArr[2] + '?t=' + new Date().getTime()
      window.location.href = herfSpiltArr[0] + '//' + herfSpiltArr[2]
    }
    if (window.outerWidth <= defaultWindowWidth) { // outerWidth 获取设备宽度
      document.querySelector('meta[name=viewport]').setAttribute('content', `width=device-width, initial-scale=${window.outerWidth / (defaultWindowWidth * window.devicePixelRatio)}, maximum-scale=1.0, user-scalable=0`)
    }
  }
}
</script>

<style scoped>
#app{
  height: 100%;
  width: 100%;
}
</style>
