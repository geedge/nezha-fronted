<template>
  <div id="app">
    <keep-alive>
      <router-view style="height: 100%"/>
    </keep-alive>
  </div>
</template>

<script>
import config from '../static/config.json'
export default {
  name: 'App',
  mounted() {
    this.$axios.defaults.baseURL =config.baseUrl;
    const version=config.version;
    if(version!==localStorage.getItem('nz-version')){
      sessionStorage.clear();
      localStorage.clear();
      localStorage.setItem('nz-version',version);
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
