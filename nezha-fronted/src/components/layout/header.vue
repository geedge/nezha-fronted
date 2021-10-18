<template>
  <div class="header">
    <div class="left-menu--pin" :class="!isShrink?'left-menu--pin-normal':'left-menu--pin-reverse'" @click="shrink"><i :class="{'icon-reverse': isShrink,}" class="el-icon-s-fold"></i></div>
    <el-breadcrumb class="nz-breakcrumb" separator="/">
      <el-breadcrumb-item v-for="crumb in breadcrumb" :key="crumb.code">{{$t(crumb.i18n)}}</el-breadcrumb-item>
    </el-breadcrumb>
    <div class="header-menu">
      <el-dropdown>
        <div class="header-menu__item"><i class="nz-icon nz-icon-more-app"></i></div>
        <el-dropdown-menu slot="dropdown" class="right-public-box-select-top right-public-box-dropdown-top">
          <el-dropdown-item v-for="(item, index) in linkData" :key="index" :index="'0-' + index" v-if="linkData.length">
            <span class="link-title">
              <i class="nz-icon nz-icon-link"></i>
              <a :href='item.url' rel="noopener noreferrer" :title="item.name"  class="nz-a" target="_blank">{{item.name}}</a>
            </span>
          </el-dropdown-item>
          <div v-if="!linkData.length" class="header-link-nodata">
            {{$t('overall.noData')}}
          </div>
        </el-dropdown-menu>
      </el-dropdown>
      <el-dropdown>
        <el-dropdown-menu></el-dropdown-menu>
        <div id="header-open-cli" @click="cli">
          <div class="header-menu__item"><i class="nz-icon nz-icon-terminal"></i></div>
          <span v-show="$store.state.consoleCount>0" class="right-tip">{{$store.state.consoleCount<=10?$store.state.consoleCount:'10+'}}</span>
        </div>
      </el-dropdown>
      <el-dropdown>
        <el-dropdown-menu></el-dropdown-menu>
        <div class="header-menu__item" @click="showGuide = true"><i class="nz-icon nz-icon-guide"></i></div>
      </el-dropdown>
    </div>
    <!--个人操作-->
    <div class="personal">
      <el-dropdown>
        <div class="header-menu--item">
          <i class="nz-icon nz-icon-language-change"></i>
        </div>
        <el-dropdown-menu slot="dropdown" class="right-public-box-select-top right-public-box-dropdown-top">
          <el-dropdown-item>
            <div id="header-to-english" :style="language === 'en'?'color:#f90':''" @click="changeLocal('en')"><i class="nz-icon nz-icon-lang-en"></i>English</div>
          </el-dropdown-item>
          <el-dropdown-item>
            <div id="header-to-chinese" :style="language === 'cn'?'color:#f90':''" @click="changeLocal('cn')"><i class="nz-icon nz-icon-lang-zh"></i>简体中文</div>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
      <el-dropdown>
        <div class="personal-avatar"><span>{{name.substr(0, 1)}}</span>&nbsp;<i class="nz-icon nz-icon-arrow-down"></i></div>
        <el-dropdown-menu  style="width: 142px" class="right-public-box-select-top right-public-box-dropdown-top" slot="dropdown">
          <div class="personal-dropdown">
            <div class="personal-dropdown__username">{{name}}</div>
            <div class="personal-dropdown__name">@{{username}}</div>
          </div>
          <el-dropdown-item>
            <div id="header-to-profile" @click="showPinDialog"><i class="nz-icon nz-icon-user"></i>{{$t('overall.personalCenter')}}</div>
          </el-dropdown-item>
          <el-dropdown-item>
            <div id="header-to-logout" @click="logout"><i class="nz-icon nz-icon-exit"></i>{{$t('overall.signOut')}}</div>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
<!--    <change-password :cur-user="username" :show-dialog="showChangePin" @click="showPinDialog" @dialogClosed="dialogClosed"></change-password>-->
    <guide :show-dialog="showGuide" @dialogClosed="dialogClosed" @close="showGuide = false"></guide>
  </div>
</template>

<script>
import bus from '../../libs/bus'
import { mapActions } from 'vuex'
// import changePin from '../page/config/changePin'
import guide from '@/components/common/popBox/guide'
export default {
  name: 'Header',
  components: {
    // 'change-password': changePin,
    guide
  },
  data () {
    return {
      username: sessionStorage.getItem('nz-username'),
      name: localStorage.getItem('nz-user-name'),
      language: localStorage.getItem('nz-language') ? localStorage.getItem('nz-language') : 'en',
      // 顶部菜单相关
      createMenu: [ // 新增按钮内容
        {
          label: this.$t('project.project.projectName'),
          url: 'project',
          type: 1,
          permission: 'header_add_project'
        },
        {
          label: this.$t('project.module.module'),
          url: 'project',
          type: 2,
          permission: 'header_add_module'
        },
        {
          label: this.$t('project.endpoint.endpoint'),
          url: 'project',
          type: 3,
          permission: 'header_add_endpoint'
        },
        {
          label: this.$t('asset.asset'),
          url: 'asset',
          type: 4,
          permission: 'header_add_asset'
        },
        {
          label: this.$t('alert.config.alertConfig'),
          url: 'alertConfig',
          type: 5,
          permission: 'header_add_rule'
        }
      ],
      showGuide: false
    }
  },
  methods: {
    ...mapActions(['logoutSuccess']),
    cli () {
      this.$store.commit('openConsole')
    },

    /**
       * @param route 路由地址
       * @param parentMenu 菜单大类
       * */
    jumpTo (route) {
      this.$router.push({
        path: route,
        query: {
          t: +new Date()
        }
      })
    },
    getLinkData () {
      this.$get('link').then(response => {
        this.$store.commit('setLinkData', response.data.list)
        // this.linkData = response.data.list
      })
    },
    changeLocal (lang) {
      if (lang != localStorage.getItem('nz-language')) {
        localStorage.setItem('nz-language', lang)
        this.$i18n.locale = lang
        window.location.reload()
      }
    },
    logout () {
      this.$get('logout').then(() => {
        this.logoutSuccess()
        document.location.href = '/'
      })
    },
    // refreshLang () {
    //   this.language = localStorage.getItem('nz-language')
    //   this.$i18n.locale = this.language
    //   this.$nextTick(() => {
    //     // window.location.reload()
    //   })
    // },
    showPinDialog () {
      this.$router.push({
        path: '/profile',
        query: {
          t: +new Date()
        }
      })
    },
    dialogClosed () {
      this.showGuide = false
    },
    cancel () {
      this.jumpTo(this.$route.path.slice(1, this.$route.path.length))
    },

    initEvent () {
      bus.$on('login', () => {
        this.username = sessionStorage.getItem('nz-username')
        // this.refreshLang()
      })
      if (window.history && window.history.pushState) {
        history.pushState(null, null, document.URL)
        window.addEventListener('popstate', this.cancel, false)
      }
      bus.$on('link-data-change', () => {
        this.getLinkData()
      })
    },
    shrink () {
      this.$store.commit('isShrink')
    }
  },
  mounted () {
    this.$i18n.locale = this.language
    if (sessionStorage.getItem('nz-token')) {
      this.initEvent()
      this.getLinkData()
    }
  },
  computed: {
    linkData () {
      return this.$store.getters.getLinkData
    },
    route () {
      return this.$route.path
    },
    breadcrumb () {
      if (this.$route.path === '/profile') {
        return [
          {
            code: 'profile',
            i18n: 'overall.personalCenter',
            icon: '',
            id: 2,
            name: 'profile',
            orderNum: 1,
            parentId: 1,
            perms: '',
            required: '',
            route: '/profile',
            type: 1
          }
        ]
      } else {
        const vm = this
        const menuList = this.$store.getters.menuList
        const breadcrumb = []
        getBreadCrumb(menuList, breadcrumb)
        function getBreadCrumb (list, crumb) {
          for (let i = 0; i < list.length; i++) {
            if (list[i].route === vm.$route.path) {
              crumb.unshift(list[i])
              return true
            } else {
              if (getBreadCrumb(list[i].children, crumb)) {
                crumb.unshift(list[i])
                return true
              }
            }
          }
        }
        return breadcrumb
      }
    },
    isShrink () {
      return this.$store.getters.getIsShrink
    }
  },
  beforeDestroy () {
    bus.$off('login')
  },
  destroyed () {
    window.removeEventListener('popstate', this.cancel, false)
  }
}
</script>

<style lang="scss">
.header {
  display: flex;
  height: 50px;
  .personal-avatar {
    cursor: pointer;
    span {
      width: 32px;
      height: 32px;
      display: inline-block;
      line-height: 32px;
      background: rgba(60,146,241,0.10);
      font-family: PingFangSC-Medium;
      font-size: 14px;
      color: #3C92F1;
      letter-spacing: 0;
      font-weight: 500;
      text-transform: capitalize;
      border-radius: 100%;
    }
  }
  .header-menu {
    display: flex;
    justify-content: flex-end;
    flex-grow: 1;

    .el-dropdown {
      width: 60px;
      text-align: center;
      height: 36px;
      line-height: 50px;
      .el-dialog{
        width: 1000px;
        height: 70px;
        .el-dialog__header{
          background-color: orange;
          .el-dialog__title{
            color: #fff;
          }
          .el-dialog__close{
            color: #fff;
            line-height: 50px;
            font-size: 30px;
          }
        }
      }

    }
  }
  .header-menu--item {
    color: #778391;
    cursor: pointer;
    transition: color linear .2s;
    i {
      font-size: 18px;
    }
  }
  .header-menu--item:hover {
    color: #313336;
  }
  .header-menu__item {
    i {
      font-size: 20px;
      cursor: pointer;
    }
  }
  .personal {
    display: flex;
    .el-dropdown {
      margin: 0 20px;
      height: 36px;
      line-height: 50px;
      text-align: center;
    }
    .login-user {
      color: #333;
      i {
        color: #999;
        font-size: 12px;
      }
    }
  }
  .right-tip {
    position: absolute;
    left: 30px;
    top: 10px;
    padding: 0 6px;
    line-height: 15px;
    height: 15px;
    background-color: #ba3939;
    opacity: .9;
    border-radius: 7px;
    color: white;
    font-size: 6px;
  }
  .left-menu--pin {
    width: 20px;
    font-size: 20px;
    font-weight: 100;
    color: #999999;
    transition: all .4s;
    height: 100%;
    line-height: 50px;
    margin-left: 10px;
    i {
      transform: rotateY(0);
      transition: transform .4s;
      cursor: pointer;
    }
    i.icon-reverse {
      transform: rotateY(180deg);
    }
  }
  .left-menu--pin-normal{
  }
  .left-menu--pin-reverse{
  }
}
.link-title a {
  color: inherit;
  text-decoration: none;
}
.nz-breakcrumb {
  padding-left: 15px;
  line-height: 50px;

  .el-breadcrumb__item .el-breadcrumb__inner {
    color: #999;
  }
}
.header-link-nodata{
  color: #999999;
  padding: 20px 20px;
}
</style>
