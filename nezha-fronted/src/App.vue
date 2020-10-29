<template>
  <div id="app">
    <keep-alive>
      <router-view style="height: 100%"/>
    </keep-alive>
  </div>
</template>

<script>
export default {
  name: 'App',
  async created(){
    const Timestamp=new Date().getTime();
    let url="static/config.json?Timestamp="+Timestamp;
    let result= await this.$http.get(url);
    this.$axios.defaults.baseURL = result.body.baseUrl;
    const version=result.body.version;
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
