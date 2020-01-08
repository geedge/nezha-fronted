<template>
  <div class="login">
    <div class="model">
      <div class='login-right'>
        <div class="login-content">
          <div class="login-title">NEZHA</div>
          <div class="login-label" style="padding-top: 35px;">User Name</div>
          <div class="login-input">
            <input v-model="loginData.username" class="inputL"></input>
          </div>
          <div class="login-label">Password</div>
          <div class="login-input">
            <input v-model="loginData.password" type="password" class="inputL" @keyup.enter="login"></input>
          </div>
          <div class="login-button">
            <button @click="login">Login</button>
          </div>
          <div class="login-foot">
            <div class="login-foot-remember"></div>
            <div class="login-foot-langs">
              <div @click="changeLang('en')" class="login-foot-lang" :class="{'login-foot-lang-active': lang == 'en'}">
                <img v-if="lang == 'en'" src="../../assets/img/lang-box-active.svg"/>
                <img v-if="lang != 'en'" src="../../assets/img/lang-box.svg"/>
                <span class="lang-name lang-name-en">EN</span>
                <div v-if="lang == 'en'" class="lang-active-model"></div>
              </div>
              <div @click="changeLang('cn')" class="login-foot-lang" :class="{'login-foot-lang-active': lang == 'cn'}">
                <img v-if="lang == 'cn'" src="../../assets/img/lang-box-active.svg"/>
                <img v-if="lang != 'cn'" src="../../assets/img/lang-box.svg"/>
                <span class="lang-name">中</span>
                <div v-if="lang == 'cn'" class="lang-active-model"></div>
              </div>
            </div>
          </div>
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
            path: "/dashboard",
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

<style scoped>
.login {
  background-image: url("../../assets/img/login-background.png");
  background-size: 100% 100%;
}
.model {
  height: 100%;
  width: 100%;
  background-color: rgba(0, 0, 0, 0.737);
}
button {
  width: 80%;
  padding-top: 10px;
  padding-bottom: 12px;
  background: #31759c;
  border-radius: 270px;
  font-size: 18px;
  box-shadow: none;
  outline: none;
  border: none;
  color: #fff;
  display: block;
  margin: 0 auto;
  margin-top: 50px;
  cursor: pointer;
}
button:hover {
  background-color: #5c9fc4;
}

.login-right {
  position: relative;
  width: 500px;
  height: 475px;
  margin: auto;
  overflow: hidden;
  padding: 250px 0 0 0;
}
.login-title {
  position: absolute;
  font-size: 90px;
  font-weight: 400;
  color: white;
  top: 60px;
  width: 100%;
  text-align: center;
}
.login-label {
  margin-left: 10%;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.6);
}
.login-input {
  height: 30px;
  margin: 28px 0 16px 10%;
  width: 80%;
  border-bottom: 2px solid rgba(0, 0, 0, 0.6);
}
.login-foot {
  position: absolute;
  bottom: 30px;
  width: 100%;
}
.login-foot>div {
  display: inline-block;
}
.login-foot-langs {
  float: right;
  padding-right: 10%;
}
.login-foot-lang {
  display: inline-block;
  margin-left: 8px;
  cursor: pointer;
  position: relative;
}
.lang-active-model {
  width: 19px;
  height: 16px;
  position: absolute;
  border-radius: 2px;
  background-color: rgba(49, 117, 156, 0.27);
  top: 8px;
  left: 9px;
}
.lang-name {
  position: absolute;
  left: 6px;
  top: 7px;
  font-size: 13px;
  font-weight: bold;
  color: #656565;
}
.lang-name-en {
  left: 4px;
}
.login-foot-lang-active .lang-name {
  color: #31759c;
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
  border-radius: 10px;
}
</style>
