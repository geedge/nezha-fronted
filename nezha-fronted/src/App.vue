<template>
  <div id="app">
    <router-view style="height: 100%"/>
  </div>
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
    overflow: hidden;
}
</style>
