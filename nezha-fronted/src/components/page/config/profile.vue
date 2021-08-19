<template>
  <div class="profile">
    <div class="profile-left">
      <div class="profile-left__header">
        <div class="profile-left__header-img">
          <span>{{username.substr(0, 1)}}</span>
        </div>
        <div class="profile-left__header-username">
          <el-popover
            placement="right-start"
            width="200"
            trigger="hover"
            :content="userList.username">
            <div slot="reference">{{userList.username}}<span class="profile-left__header-username__span">2FA</span></div>
          </el-popover>

          <div>@{{userList.name}}</div>
        </div>
      </div>
      <div v-for="item in tableProfile" :key="item.id" class="profile-left__center">
        <span style="margin:0 18px 0 0"><i :class="item.icon"></i></span>
        <div class="profile-left__center-title">
          <div>{{item.label}}</div>
          <div v-if="item.prop">{{item.prop}}</div>
          <div v-if="item.prop === null || ''">-</div>
        </div>
      </div>
     <div class="profile-left__center">
       <span style="margin:0 10px 10px 0"><i class="nz-icon nz-icon-zhongzhi2FA" style="color: orange"></i></span>
       <div class="profile-left__center-title">
         <div>{{$t('profile.twoFactorAuthentication')}}</div>
       </div>
     </div>
      <div class="profile-left__button table-operation-items">
<!--        <el-button v-show="this.userList.mfaLevel == 0 && this.userList.mfaAuthEnable == 0 ? true : false" size="small" class="profile-left__button-footer__btn footer__btns">-->
<!--          <span>{{$t('profile.enable')}}</span>-->
<!--        </el-button>-->
<!--        <el-button @click="profileDisable" size="small" v-show="this.userList.mfaLevel == 0 && this.userList.mfaAuthEnable == 0 ? false : true" :class="{'table-operation-item&#45;&#45;disable': this.userList.mfaLevel == 2 || this.userList.mfaAuthEnable ==1}" :disabled="this.userList.mfaLevel == 2 || this.userList.mfaAuthEnable == 1" class="profile-left__button-footer__btn footer__btns table-operation-item">-->
<!--          <span>{{$t('profile.close')}}</span>-->
<!--        </el-button>-->
<!--        <el-button @click="profileMfaLevel" size="small" v-show="this.userList.mfaLevel == 0 && this.userList.mfaAuthEnable == 0 ? false : true" :class="{'table-operation-item&#45;&#45;disable': this.userList.mfaLevel == 2 || this.userList.mfaAuthEnable ==1}" class="profile-left__button-footer__btn footer__btn table-operation-item">-->
<!--          <span>{{$t('profile.update')}}</span>-->
<!--        </el-button>-->
        <el-button @click="profileEnable" size="small" class="profile-left__button-footer__btn footer__btns">
          <span>{{$t('profile.enable')}}</span>
        </el-button>
        <el-button @click="profileDisable" size="small" class="profile-left__button-footer__btn footer__btns table-operation-item">
          <span>{{$t('profile.close')}}</span>
        </el-button>
        <el-button @click="profileMfaLevel" size="small" class="profile-left__button-footer__btn footer__btn table-operation-item">
          <span>{{$t('profile.update')}}</span>
        </el-button>
      </div>
      <div class="profile-hr" style="height: 1px;background-color: #E7EAED;width: 320px; margin: 40px auto"></div>
      <div class="profile-left__bottom">
        <div class="profile-left__bottom-title">
          <div>{{$t('profile.lastLoginIp')}}</div>
          <div>{{userList.lastLoginIp}}</div>
        </div>
        <div class="profile-left__bottom-title">
          <div>{{$t('profile.lastLoginTime')}}</div>
          <div>{{userList.lastLoginTime}}</div>
        </div>
      </div>
    </div>
    <operation-record />
  </div>
</template>

<script>
import operationRecord from './operationRecord'
import bus from '@/libs/bus.js'

export default {
  name: 'profile',
  components: {
    operationRecord
  },
  data () {
    return {
      username: sessionStorage.getItem('nz-username'),
      // 右侧列表
      tableProfile: [
        {
          id: 1,
          label: this.$t('profile.role'),
          prop: '',
          icon: 'nz-icon nz-icon-role profile-role'
        },
        {
          id: 2,
          label: this.$t('profile.email'),
          prop: '',
          icon: 'nz-icon nz-icon-email profile-email'
        },
        {
          id: 3,
          label: this.$t('profile.mobile'),
          prop: '',
          icon: 'nz-icon nz-icon-mobile profile-mobile'
        },
        {
          id: 4,
          label: this.$t('profile.source'),
          prop: '',
          icon: 'nz-icon nz-icon-laiyuan profile-laiyuan'
        }
      ],
      // 后台数据
      userList: {},
      rules: {
        oldPassword: [
          { required: true, message: this.$t('validate.required') }
        ],
        // newPassword: [
        //   { required: true, message: this.$t('validate.required'), trigger: 'change' }
        // ],
        confirmPassword: [
          { required: true, message: this.$t('validate.required'), trigger: 'change' }
        ]
      }
    }
  },
  mounted () {
    this.personalCenter()
  },
  methods: {
    // 请求后端数据
    personalCenter () {
      return new Promise(resolve => {
        this.$get('/sys/user/profile').then(response => {
          if (response.code === 200) {
            this.userList = response.user
            this.tableProfile[0].prop = this.userList.roles[0].i18n
            this.tableProfile[1].prop = this.userList.email
            this.tableProfile[2].prop = this.userList.mobile
            this.tableProfile[3].prop = this.userList.source
            localStorage.setItem('nz-user-id', this.userList.id)
          }
          resolve()
        })
      })
    },
    profileMfaLevel () {
      return new Promise(resolve => {
        this.$post('/mfa/genkey').then(response => {
          if (response.code === 200) {
            console.log(bus.$emit('profile-dialog'))
          }
          resolve()
        })
      })
    },
    profileEnable () {
      return new Promise(resolve => {
        const mfaLevelList = {
          mfaLevel: 1
        }
        this.$post('/mfa/genkey', mfaLevelList).then(response => {
          if (response.code === 200) {
            bus.$emit('profile-dialog')
            console.log(bus.$emit('profile-dialog'))
          }
          resolve()
        })
      })
    },
    profileDisable () {
      return new Promise(resolve => {
        this.$get('/sys/user/disableMfa').then(response => {
          if (response.code === 200) {
            console.log(response)
          }
          resolve()
        })
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.profile {
  display: flex;
  height: 100%;
  height: calc(100% - 20px);
  .profile-left {
    margin: 10px 0 10px 10px;
    background: #FFFFFF;
    box-shadow: 0 1px 2px 0 rgba(0,0,0,0.06);
    border-radius: 2px;
    height: 100%;
    width: 360px;
    .profile-left__header {
      height: 200px;
      width: 100%;
      margin: 10px 0;
      text-align: center;
      display: flex;
      justify-content: flex-start;
      align-items: center;
      .profile-left__header-img {
        height: 80px;
        width: 80px;
        line-height: 80px;
        margin-left: 20px;
        span {
          display: inline-block;
          background: rgba(60,146,241,0.10);
          font-family: PingFangSC-Medium;
          text-transform: capitalize;
          width: 100%;
          height: 100%;
          font-size: 30px;
          color: #3C92F1;
          letter-spacing: 0;
          font-weight: 500;
          border-radius: 100%;
        }
      }
      .profile-left__header-username {
        height: 80px;
        padding-left: 15px;
        text-align: left;
        div:nth-of-type(1) {
          font-family: Roboto-Medium;
          width: 200px;
          text-overflow: ellipsis;
          overflow: hidden;
          white-space: nowrap;
          font-size: 18px;
          color: #333333;
          letter-spacing: 0;
          line-height: 22px;
          font-weight: 500;
          padding: 10px 0 8px 0;
        }
        div:nth-of-type(2) {
          font-family: Roboto-Regular;
          font-size: 18px;
          color: #666666;
          letter-spacing: 0;
          line-height: 22px;
          font-weight: 400;
        }
        .profile-left__header-username__span {
          display: inline-block;
          text-align: center;
          width: 42px;
          height: 24px;
          line-height: 25px;
          margin-left: 10px;
          background-color: #ecf5ff;
          border-color: #d9ecff;
          border-radius: 10px;
          font-family: Roboto-Regular;
          font-size: 14px;
          color: #409EFF;
          letter-spacing: 0;
          font-weight: 400;
        }
      }
    }
    .profile-left__center:nth-of-type(6) {
      margin-bottom: 0;
    }
    .profile-left__center {
      margin: 0 0 20px 26px;
      /*border: 1px solid red;*/
      display: flex;
      justify-content: flex-start;
      .profile-role {
        color: #00C398;
      }
      .profile-email {
        color: #0093F8;
      }
      .profile-mobile {
        color: #EC7F66;
      }
      .profile-laiyuan {
        color: #8871DB;
      }
      .profile-left__center-title {
        margin-left: 8px;
        margin-top: 1px;
        div:nth-of-type(1) {
          padding-bottom: 5px;
          ont-family: Roboto-Regular;
          font-size: 14px;
          color: #666666;
          letter-spacing: 0;
          font-weight: 400;
        }
        div:nth-of-type(2) {
          ont-family: Roboto-Regular;
          font-size: 14px;
          color: #333333;
          letter-spacing: 0;
          font-weight: 400;
        }
      }
    }
    .profile-left__button {
      margin-left: 45px;
      .profile-left__button-footer__btn {
        margin: 0 10px;
        height: 30px;
        min-width: 74px;
        padding: 0 15px;
        border-radius: 4px;
      }
      .footer__btn {
        background-color: #FA901C;
        color: white;
        border: 1px solid #fff;
      }
      .footer__btns {
        background-color: #fff;
        color: #333;
        border: 1px solid #ccc;
      }
      .footer__btns:hover {
        opacity: .6;
        color: #FA901C;
        border: 1px solid #FA901C;
      }
      .footer__btn:hover {
        opacity: .6;
      }
    }
    .profile-left__bottom {
      width: 320px;
      margin: 0 10px 15px;
      .profile-left__bottom-title {
        width: 275px;
        margin: auto;
        padding: 0 0 30px 0;
        div:nth-of-type(1) {
          ont-family: Roboto-Regular;
          font-size: 14px;
          color: #666666;
          letter-spacing: 0;
          line-height: 25px;
          font-weight: 400;
        }
        div:nth-of-type(2) {
          ont-family: Roboto-Regular;
          font-size: 14px;
          color: #333333;
          letter-spacing: 0;
          line-height: 25px;
          font-weight: 400;
        }
      }
    }
  }
}
</style>
