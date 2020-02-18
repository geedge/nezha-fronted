<template>
  <div class="login">
    <div class="model"></div>
    <div class="logo"><img height="155" src="../../assets/img/logo-big.png"></div>
    <div class='login-box'>
      <div class="login-label"></div>
      <div class="login-input">
        <input v-model="loginData.username" ></input>
      </div>
      <div class="login-label"></div>
      <div class="login-input">
        <input v-model="loginData.password" type="password"></input>
      </div>
      <div class="login-foot">
        <button @click="login" class="login-btn" id="login">Login</button>
        <div class="login-foot-langs">
          <i class="nz-icon nz-icon-lang-en"></i><i class="nz-icon nz-icon-arrow-down"></i>
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
        remember: false
      },
      lang: localStorage.getItem("nz-language") ? localStorage.getItem("nz-language") : 'en'
    }
  },
  methods: {
    login() {
      this.$post('sys/login', (this.loginData)).then(res => {
        if (res.code == 200) {
          sessionStorage.setItem("nz-token", res.data.token);
          sessionStorage.setItem("nz-username", this.loginData.username);
          localStorage.setItem("nz-username", this.loginData.username);
          this.$router.push({
            path: "/panel",
            query: {
              t: +new Date()
            }
          });
        }
      })
    },
    changeLang(lang) {
      if (this.lang == lang) {
        return;
      } else {
        localStorage.setItem("nz-language", lang);
        this.lang = lang;
        this.$i18n.locale = lang;
      }
    }
  }
}
</script>

<style scoped lang="scss">
.login {
  background-image: url("../../assets/img/login-background.png");
  background-size: cover;
  position: relative;
}
.model {
  height: 100%;
  width: 100%;
  background-color: rgba(130, 130, 135, 0.4);
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
}

.logo {
  position: absolute;
  top: 25%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2;
}

.login-box {
  width: 460px;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  top: 50%;
  height: 100%;
  z-index: 2;
}

.login-box .login-input {
  padding: 20px 0;
  height: 60px;
}
.login-box .login-input input {
  height: 100%;
  width: calc(100% - 30px);
  background-color: rgba(0, 0, 0, 0.55);
  padding-left: 30px;
  font-size: 20px;
  border: none;
  outline: none;
  color: white;
  border-radius: 4px;
}

.login-foot {
  padding-top: 45px;
  display: flex;
  justify-content: space-between;
}

.login-btn {
  color: white;
  border-radius: 3px;
  background-image: $btn-normal-background-color;
  border: none;
  outline: none;
  height: 44px;
  width: 320px;
  cursor: pointer;
  font-size: 14px;
  box-shadow: 0 2px 3px 2px rgba(0, 0, 0, 0.30);
}

.login-foot-langs {
  position: relative;
  cursor: pointer;
}
.login-foot-langs .nz-icon-lang-en, .login-foot-langs .nz-icon-lang-zh {
  font-size: 40px;
  color: white;
  margin-right: 30px;
}
.nz-icon-arrow-down, .nz-icon-arrow-up {
  position: absolute;
  font-size: 18px;
  color: white;
  top: 50%;
  right: 0;
  transform: translateY(-50%);
}
</style>
