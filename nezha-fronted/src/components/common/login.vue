<template>
  <div class="login" @click="langListShow = false">
    <div class="model"></div>
    <div class="logo"><img src="../../assets/img/logo-big.png"></div>
    <div class='login-box'>
      <div class="login-label"></div>
      <div class="login-input">
        <i class="nz-icon nz-icon-user"></i>
        <input id="usernameInput" v-model="loginData.username" name="userName" autocomplete="on" :placeholder="$t('login.username')"></input>
      </div>
      <div class="login-label"></div>
      <div class="login-input">
        <i class="nz-icon nz-icon-password"></i>
        <input v-model="loginData.pin" type="password" name="password" autocomplete="on" :placeholder="$t('login.pin')"></input>
      </div>
      <div class="login-foot">
        <button id="login" v-loading="loading" :class="{'nz-btn-disabled': !license.valid}" class="login-btn" @click="login">{{$t("login.login")}}</button>
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
      <div class="login-license">
        <div class="license-warn" v-if="license.warnInfo">{{license.warnInfo}}</div>
        <div v-if="!license.valid" class="license-info">INSTALLATION ID:&nbsp;{{license.token}}</div>
        <div class="license-upload" v-if="!license.valid">
          <el-upload
            ref="upload"
            accept=".xml"
            action=""
            :file-list="uploadFileList"
            :auto-upload="false"
            :on-change="handleChange"
            >
            <button type="button" class="login-btn" ><span style="margin-right: 5px"><i class="nz-icon nz-icon-upload"></i></span>{{$t('login.upload')}}</button>
          </el-upload>
        </div>
      </div>
    </div>
    <div class="login-foot-buildOn">
      <span><a target="_blank" rel="noopener noreferrer" href='https://prometheus.io'>Build on Prometheus</a></span>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
export default {
  name: 'login',
  data () {
    return {
      loginData: {
        username: '',
        pin: '',
        remember: false
      },
      license: {
        warnInfo: '',
        token: '',
        valid: false
      },
      uploadFileList: [],
      uploadFile: { file: '', path: '', uuid: '' },
      loading: false,
      lang: localStorage.getItem('nz-language') ? localStorage.getItem('nz-language') : 'en', // en/cn
      langListShow: false
    }
  },
  methods: {
    ...mapActions(['loginSuccess']),
    login () {
      if (this.loading || !this.license.valid) {
        return
      }
      // if (this.license.valid && this.validateLogin() && (this.$route.path == '/' || this.$route.path == '/login')) {
      if (this.validateLogin() && (this.$route.path == '/' || this.$route.path == '/login')) {
        this.loading = true
        this.$post('sys/login', this.loginData).then(res => {
          if (res.code == 200) {
            // 登录成功，记录用户名、token和lang
            sessionStorage.setItem('nz-username', this.loginData.username)
            localStorage.setItem('nz-username', this.loginData.username)
            localStorage.setItem('nz-prometheus-federation-enabled', res.data.prometheusFederationEnabled)
            localStorage.setItem('nz-language', this.lang)
            this.$i18n.locale = this.lang
            this.loginSuccess(res)
          } else {
            this.$message.error(res.msg)
          }
        }).finally(() => {
          this.loading = false
        })
      }
    },
    changeLang (lang) {
      this.lang = lang
      this.langListShow = false
      this.$i18n.locale = this.lang
      localStorage.setItem('nz-language', this.lang)
    },
    validateLogin () {
      if (!this.loginData.username || !this.loginData.pin) {
        this.$message.error('Empty username or password')
        return false
      } else {
        return true
      }
    },
    licenseStat () {
      /* this.license.valid = false
      this.license.warnInfo = 'hehehe'
      this.license.token = 'dRqrWja/PzI8FrWVJeGqLw==' */
      this.$get('/sys/license/state').then(response => {
        if (response.code && response.code === 200) {
          this.license.warnInfo = ''
          this.license.valid = true
        } else {
          this.license.valid = false
          this.license.warnInfo = response.msg
        }
        this.license.token = response.token
      })
    },
    handleChange (file, fileList) {
      if (fileList.length > 0) {
        this.uploadFileList = [fileList[fileList.length - 1]]
      }
      this.uploadFile.file = this.uploadFileList[0]
      this.upload()
    },
    upload () {
      const form = new FormData()
      form.append('file', this.uploadFile.file.raw)
      this.$post('/sys/license/upload', form, { 'Content-Type': 'multipart/form-data' }).then(res => {
        if (res.code == 200) {
          this.licenseStat()
        } else {
          this.$message.error(res.msg)
        }
      })
    }
  },
  watch: {
    /* 'loginData.username'(n, o) {
      let lang = localStorage.getItem('nz-language-' + n);
      if (lang) {
        this.lang = lang;
        this.$i18n.locale = this.lang;
      }
    } */
  },
  mounted () {
    const _this = this
    this.$i18n.locale = this.lang
    document.onkeydown = function (e) {
      if (e.key === 'Enter') {
        _this.login()
      }
    }
    document.getElementById('usernameInput').focus()
    this.licenseStat()
  }
}
</script>

<style scoped lang="scss">
.login {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  background-image: url("../../assets/img/login-background.png");
  background-size: cover;
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
  z-index: 2;
  width: 460px;
  img{
    width: 100%;
  }
}

.login-box {
  z-index: 2;
  width: 460px;
}

.login-box .login-input {
  padding: 12px 0;
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
  border-radius: $--button-border-radius;
  background-color: var(--theme-color-light-20);
  border: none;
  outline: none;
  height: 44px;
  width: 320px;
  cursor: pointer;
  font-size: 14px;
  transition: all linear .2s;
}
.login-btn:not(.nz-btn-disabled):hover {
  background-color: var(--theme-color-light-30);
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
.login-foot .el-loading-spinner {
  width: 36px;
  height: 36px;
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
.login-foot-buildOn{
  position: absolute;
  bottom: 20px;
  z-index: 100;
  left: 50%;
  transform: translateX(-50%);
  a{
    font-size: 14px;
    color: #eee;
    text-shadow: 1px 1px 3px #333;
    text-decoration: none;
  }
}
.nz-icon-arrow-down, .nz-icon-arrow-up {
  position: absolute;
  font-size: 18px;
  color: white;
  top: 50%;
  right: 0;
  transform: translateY(-50%);
}
.login-license{
  margin-top: 40px;
  text-align: center;
  line-height: 30px;
  .license-warn{
    color: #d92926;
    text-shadow: 1px 1px 3px #ddd;
  }
  .license-info {
    margin-bottom: 10px;
    color: white;
    text-shadow: 1px 1px 3px #333;
    white-space: nowrap;
  }
  .login-btn{
    height: 40px;
    width: auto;
    padding: 0 20px;
  }
}
</style>
<style>
  .license-upload .el-upload-list{
    display: none;
  }
</style>
