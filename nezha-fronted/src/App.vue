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
    const Timestamp = new Date().getTime()
    const url = 'static/config.json?Timestamp=' + Timestamp
    const result = await this.$http.get(url)
    this.$axios.defaults.baseURL = result.body.baseUrl
    const version = result.body.version
    if (version !== localStorage.getItem('nz-version')) {
      sessionStorage.clear()
      localStorage.clear()
      localStorage.setItem('nz-version', version)
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
