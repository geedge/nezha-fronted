<template>
    <div>
        <div class='login-right'>
            <div class="login-content">
                <div class="login-title">
                    <h1>NeZha</h1>
                    <div></div>
                </div>
                <div class="login-input" style="margin-top: 20px;">
                    <input v-model="loginData.username" class="inputL" placeholder="username" ></input>
                </div>

                <div class="login-input">
                    <input v-model="loginData.password" type="password" class="inputL" @keyup.enter="login" placeholder="password" ></input>
                </div>
                <div class="login-button">
                    <button @click="login">登录</button>
                </div>
            </div>
        </div>
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
      this.$post('sys/login', (this.loginData)).then(res => {
        if (res.code == 200) {
          sessionStorage.setItem("token", res.data.token);
          this.$router.push({
            path: "/dashboard",
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
button {
    width:180px;
    padding-top: 10px;
    padding-bottom: 12px;
    background: #17558e !important;
    border-radius: 5px;
    font-size: 18px;
    box-shadow: none;
    outline: none;
    border: none;
    color: #fff;
    display: block;
    margin: 0 auto;
    margin-top: 50px;
}

.login-right {
    width: 400px;
    height: 330px;
    position: absolute;
    top: 50%;
    transform: translateY(-60%);
    right: 42%;
    background: #356b9d;
    overflow: hidden;
    padding: 2px;
}
.login-input {
    height: 40px;
    margin-bottom: 20px;
    padding: 0 20px;
}

.login-input input {
    outline: none;
    border: none;
    width: 100%;
    height: 100%;
    font-size: 14px;
}

.login-content {
    background: #fff;
    width: 100%;
    height: 100%;
}
.login-content .login-title{
    text-align: center;
    padding-top: 20px;
}
.login-content .login-title h1{
    color: rgb(23, 85, 142);
    font-size: 26px;
}
.login-content .login-title div{
    width: 260px;
    margin: 0 auto;
    margin-top: 25px;
    margin-bottom: 20px;
    height: 1px;
    background: #507faa;
}
.login-content .login-content{
    text-align: center;
    padding-top: 20px;
}
.login-input{
    border: 2px solid #507faa;
    width: 70%;
    margin-left: 10%;
    border-radius: 5px;
}
</style>