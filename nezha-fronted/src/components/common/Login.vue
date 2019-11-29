<template>
    <div>
        <div>登录</div>
        <el-button @click="jump">默认按钮</el-button>
    </div>
</template>

<script>
  export default {
    name: "login",
    methods:{
      jump(){
        this.$router.push({
          path: "/dashboard",
          query: {
            t: +new Date()
          }
        });
      }
    }
  }
</script>

<style scoped>

</style>