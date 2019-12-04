<template>
    <div>
        <div>登录</div>
        <el-input v-model="loginData.username" placeholder="请输入内容"></el-input>
        <el-input v-model="loginData.password" placeholder="请输入内容"></el-input>
        <button @click="login">登录</button>
    </div>
</template>

<script>
export default {
  name: "login",
  data() {
    return {
      loginData: {
        username: '',
        password: '',
      },
    }
  },
  methods: {
    login() {
      this.$post('api/sys/login', (this.loginData)).then(res => {
        if (res.code == 200) {
          sessionStorage.setItem("token", res.data.token);
          this.$router.push({
            path: "/asset",
            query: {
              t: +new Date()
            }
          });
        }
      })
    },
  }
}
</script>

<style scoped>

</style>