<template>
  <div class="login" @click="langListShow = false">
    <div class="model"></div>
    <div class="logo"><img height="155" src="../../assets/img/logo-big.png"></div>
    <div class='login-box'>
      <div class="login-label"></div>
      <div class="login-input">
        <i class="nz-icon nz-icon-user"></i>
        <input v-model="loginData.username" autocomplete="new-password" placeholder="Username"></input>
      </div>
      <div class="login-label"></div>
      <div class="login-input">
        <i class="nz-icon nz-icon-password"></i>
        <input v-model="loginData.password" type="password" autocomplete="new-password" placeholder="Password"></input>
      </div>
      <div class="login-foot">
        <button @click="login" class="login-btn" id="login">Login</button>
        <div class="login-foot-lang" @click.stop="langListShow = !langListShow">
          <i v-if="lang == 'en'" class="nz-icon nz-icon-lang-en"></i>
          <i v-else-if="lang == 'cn'" class="nz-icon nz-icon-lang-zh"></i>
          <i class="nz-icon nz-icon-arrow-down"></i>
        </div>
        <div class="login-foot-lang-list" v-show="langListShow">
          <i v-if="lang != 'en'" @click="changeLang('en')" class="nz-icon nz-icon-lang-en"></i>
          <i v-if="lang != 'cn'" @click="changeLang('cn')" class="nz-icon nz-icon-lang-zh"></i>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import bus from '../../libs/bus';
export default {
  name: "login",
  data() {
    return {
      loginData: {
        username: '',
        password: '',
        remember: false
      },
      lang: 'en', //en/cn
      langListShow: false,
    }
  },
  methods: {
    login() {
      if (this.validateLogin()) {
        this.$post('sys/login', (this.loginData)).then(res => {
          if (res.code == 200) {
            //登录成功，记录用户名、token和lang
            sessionStorage.setItem("nz-token", res.data.token);
            sessionStorage.setItem("nz-username", this.loginData.username);
            localStorage.setItem("nz-username", this.loginData.username);
            localStorage.setItem('nz-language-' + this.loginData.username, this.lang);
            this.$i18n.locale = this.lang;
            bus.$emit('login');
            this.$router.push({
              path: "/panel",
              query: {
                t: +new Date()
              }
            });
          } else {
            this.$message.error(res.msg);
          }
        });
      }
    },
    changeLang(lang) {
      this.lang = lang;
      this.langListShow = false;
    },
    validateLogin() {
      if (!this.loginData.username || !this.loginData.password) {
        this.$message.error("Empty username or password");
        return false;
      } else {
        return true;
      }
    }
  },
  watch: {
    'loginData.username': function(n, o) {
      let lang = localStorage.getItem('nz-language-' + n);
      if (lang) {
        this.lang = lang;
      }
    }
  },
  mounted() {
    const _this = this;
    document.onkeydown = function(e) {
      if(e.key === 'Enter'){
        _this.login();
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
  position: relative;
}
.login-box .login-input .nz-icon {
  position: absolute;
  left: 18px;
  top: 50%;
  transform: translateY(-50%);
  color: white;
  font-size: 20px;
}
.login-box .login-input input {
  height: 100%;
  width: calc(100% - 60px);
  background-color: rgba(0, 0, 0, 0.55);
  padding-left: 60px;
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
  position: relative;
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

.login-foot-lang {
  position: relative;
  cursor: pointer;
}
.login-foot-lang .nz-icon:not(.nz-icon-arrow-up):not(.nz-icon-arrow-down) {
  font-size: 30px;
  color: white;
  margin-right: 30px;
  line-height: 45px;
}
.login-foot-lang-list {
  position: absolute;
  height: 25px;
  padding: 12px;
  background-color: rgba(0, 0, 0, 0.55);
  top: 107px;
  right: 0;
  border-radius: 4px;
}
.login-foot-lang-list .nz-icon {
  font-size: 25px;
  color: white;
  cursor: pointer;
}
.login-foot-lang-list::before {
  content: " ";
  width: 0px;
  height: 0px;
  border-width: 10px;
  border-style: solid;
  border-color: transparent transparent rgba(0, 0, 0, 0.55) transparent;
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
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
