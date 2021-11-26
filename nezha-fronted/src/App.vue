<template>
  <div id="app">
    <browser-window-zoom />
    <keep-alive>
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
    if (herfSpiltArr[3] !== '#') {
      herfSpiltArr[3] = '#'
      window.location.href = herfSpiltArr.join('/')
    }
    const Timestamp = new Date().getTime()
    const url = 'static/config.json?Timestamp=' + Timestamp
    const result = await this.$http.get(url)
    this.$axios.defaults.baseURL = result.body.baseUrl
    const version = result.body.version
    if (version !== localStorage.getItem('nz-version')) {
      sessionStorage.clear()
      localStorage.clear()
      localStorage.setItem('nz-version', version)
      window.location.reload(true) // 饶过缓存刷新
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
<style>
  .app {
    height: 100%;
    overflow-y: hidden;
  }
  .app>.el-scrollbar__wrap>.el-scrollbar__view {
    height: 100%;
  }
  .app>.el-scrollbar__bar.is-vertical {
    display: none;
  }
</style>
