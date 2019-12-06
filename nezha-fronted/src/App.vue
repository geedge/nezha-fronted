<template>
  <div id="app">
    <router-view style="height: 100%"/>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style scoped>
#app{
    height: 100%;
    width: 100%;
    overflow: hidden;
}
</style>
