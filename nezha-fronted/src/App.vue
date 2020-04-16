<template>
  <el-scrollbar class="app">
    <div id="app">
      <keep-alive>
        <router-view style="height: 100%"/>
      </keep-alive>
    </div>
  </el-scrollbar>
</template>

<script>
export default {
  name: 'App',
  mounted() {
    /*this.$http.get("config.json").then((result)=>{
      this.$axios.defaults.baseURL = result.body.baseUrl;
    });*/
    this.$axios.defaults.baseURL = 'http://192.168.40.247:8080/nz-admin';
  }
}
</script>

<style scoped>
#app{
  height: 100%;
  width: 100%;
  min-width: 1300px;
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
