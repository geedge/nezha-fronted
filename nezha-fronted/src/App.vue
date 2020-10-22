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
  mounted() {
     let development=process.env.NODE_ENV == 'development' ? true : false;//用于区分是本地开发还是线上环境
     console.log(process,development);
     if(development){
       this.$axios.defaults.baseURL = 'http://192.168.40.42:8080/nz-admin';
     } else{
       const Timestamp=new Date().getTime();
       this.$http.get("config.json?Timestamp="+Timestamp).then((result)=>{
         this.$axios.defaults.baseURL = result.body.baseUrl;
         const version=result.body.version;
         if(version!==localStorage.getItem('nz-version')){
           sessionStorage.clear();
           localStorage.clear();
           localStorage.setItem('nz-version',version);
         }
       });
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
