<template>
  <div class="container">
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'container',
  data () {
    return {
    }
  }
}
</script>

<style lang="scss">
.container {
  padding: 10px;
  box-sizing: border-box;
  height: calc(100% - 50px);
  background-color: #f6f6f6;

  &>div {
    height: 100%;
  }
}
</style>
