<template>
  <div class="header">
    <!-- <div class="left-menu--pin" :class="!isShrink?'left-menu--pin-normal':'left-menu--pin-reverse'" @click="shrink"><i :class="{'icon-reverse': isShrink,}" class="el-icon-s-fold" :title="isShrink ? $t('overall.expandMenu') : $t('overall.collapseMenu')"></i></div> -->
    <el-breadcrumb class="nz-breakcrumb" separator="/">
      <el-breadcrumb-item v-for="crumb in breadcrumb" :key="crumb.code">{{$t(crumb.i18n)}}</el-breadcrumb-item>
    </el-breadcrumb>
    <div class="header-menu" id="step_2">
      <el-dropdown trigger="click">
        <el-dropdown-menu></el-dropdown-menu>
        <div id="header-open-global-search" @click="openGlobalSearch">
          <div class="header-menu__item" :title="$t('globalSearch.placeholder')"><i class="nz-icon nz-icon-search"></i></div>
        </div>
      </el-dropdown>
      <el-dropdown trigger="click">
        <div class="header-menu__item" :title="$t('config.system.link.link')"><i class="nz-icon nz-icon-more-app"></i></div>
        <el-dropdown-menu slot="dropdown" class="right-box-select-top right-public-box-dropdown-top el-dropdown-menu-link">
          <el-dropdown-item v-for="(item, index) in linkData" :key="index" :index="'0-' + index" v-if="linkData.length" class="el-dropdown-menu-link-item">
            <a :href='item.url' rel="noopener noreferrer" target="_blank" class="link-title nz-a">
              <i class="nz-icon nz-icon-link"></i>
              <span class="nz-  a">{{item.name}}</span>
            </a>
          </el-dropdown-item>
          <div v-if="!linkData.length" class="header-link-nodata">
            {{$t('overall.noData')}}
          </div>
        </el-dropdown-menu>
      </el-dropdown>
      <el-dropdown trigger="click">
        <el-dropdown-menu></el-dropdown-menu>
        <div id="header-open-cli" @click="cli">
          <div class="header-menu__item"><i class="nz-icon nz-icon-terminal" :title="$t('guide.webTerminal')"></i></div>
          <span v-show="$store.state.consoleCount>0" class="right-tip">{{$store.state.consoleCount<=10?$store.state.consoleCount:'10+'}}</span>
        </div>
      </el-dropdown>
      <el-dropdown trigger="click">
        <el-dropdown-menu></el-dropdown-menu>
        <div class="header-menu__item" @click="showGuide = true"><i class="nz-icon nz-icon-guide" :title="$t('guide.getStarted')"></i></div>
      </el-dropdown>
    </div>
    <!--个人操作-->
    <div class="personal" id="personal">
      <el-dropdown trigger="click">
        <div class="header-menu--item">
          <i class="nz-icon nz-icon-language-change" :title="$t('config.user.language')"></i>
        </div>
        <el-dropdown-menu slot="dropdown" class="right-box-select-top right-public-box-dropdown-top">
          <el-dropdown-item v-for="lang in langList" :key="lang.value">
            <div :style="language === lang.value ? 'color:#f90' : ''" @click="changeLocal(lang.value)"><i :class="`nz-icon-lang-${lang.value}`" class="nz-icon"></i>{{lang.name}}</div>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
      <el-dropdown trigger="click">
        <div class="personal-avatar"><span>{{name ? name.substr(0, 1) : ''}}</span>&nbsp;<i class="nz-icon nz-icon-arrow-down"></i></div>
        <el-dropdown-menu slot="dropdown" class="personal-dropdown-menu right-public-box-select-top right-public-box-dropdown-top">
          <div class="personal-dropdown">
            <div class="personal-dropdown__username" :title="name">{{name}}</div>
            <div class="personal-dropdown__name" :title="username">@{{username}}</div>
          </div>
          <div class="item-divide"></div>
          <el-dropdown-item>
            <div id="header-to-profile" @click="showPinDialog"><i class="nz-icon nz-icon-user"></i>{{$t('overall.personalCenter')}}</div>
          </el-dropdown-item>
          <div class="notification-dropdown">
            <div class="notification-dropdown-item toggle-item" :class="{'nz-btn-disabled': themeSave}" @click="darkThemeChange(!darkTheme)">
              <div style="display:flex;align-items:center;">
                <i class="nz-icon nz-icon-a-Darktheme" style="font-size:15px;"></i>
                <span>{{$t('overall.darkTheme')}}</span>
              </div>
              <el-switch v-model="darkTheme" @change="darkThemeChange" :disabled="themeSave" @click.native.stop></el-switch>
            </div>
          </div>
          <div class="item-divide"></div>
          <div class="notification-dropdown">
            <div class="notification-dropdown-item">
              <i class="nz-icon nz-icon-Notification" style="font-size:15px;"></i>
              <span style="font-weight: bold;">{{$t('overall.notification')}}</span>
            </div>
            <div class="notification-dropdown-item toggle-item" :class="{'nz-btn-disabled': newAlertMessageSave}" @click="newAlertMessageChange(!newAlertMessage)">
              <span>{{$t('overall.newAlertMessage')}}</span>
              <el-switch v-model="newAlertMessage" @change="newAlertMessageChange" :disabled="newAlertMessageSave" @click.native.stop></el-switch>
            </div>
          </div>
          <div class="item-divide"></div>
          <el-dropdown-item>
            <div id="header-to-logout" @click="logout"><i class="nz-icon nz-icon-exit"></i>{{$t('overall.signOut')}}</div>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <guide :show-dialog="showGuide" @dialogClosed="dialogClosed" @close="showGuide = false"></guide>
    <intro></intro>
    <el-dialog
      class="operationTutorial-dialog"
      :title="$t('overall.tip')"
      :visible.sync="dialogVisible"
      @close='handleClose'
      :append-to-body="true"
    >
      <div class="dialog-header">
        <i class="nz-icon nz-icon-jinggao"></i>
        <span>{{$t('overall.newAlertMessageTip')}}</span>
      </div>
      <img class="operationTutorial-img" :src="imageUrl">
      <div class="operationTutorial-msg">{{$t('overall.operationTutorial')}}</div>
    </el-dialog>
  </div>
</template>

<script>
// import { theme } from '@/components/common/js/constants'
import bus from '../../libs/bus'
import { mapActions } from 'vuex'
import guide from '@/components/common/popBox/guide'
import intro from '@/components/common/intro'
import imageUrl from '@/assets/img/system-sound-settings.gif'
import audioUrl from '@/assets/audio/new_alert_message.mp3'
export default {
  name: 'Header',
  components: {
    guide,
    intro
  },
  data () {
    return {
      username: '',
      name: '',
      language: 'en',
      showIntro: 'true',
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
          label: this.$t('alert.rule'),
          url: 'alertConfig',
          type: 5,
          permission: 'header_add_rule'
        }
      ],
      showGuide: false,
      steps: [
        {
          element: '#personal',
          intro: '步骤1：对应class为.step_1的元素进⾏选择提⽰! 󰀀',
          position: 'right'
        },
        {
          element: '#step_2',
          intro: '步骤2：对应Id为#step_2的元素进⾏选择提⽰! 󰀀',
          position: 'right'
        }
      ],
      // fontData: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, ' ', '@', '$', '-']
      darkTheme: false,
      newAlertMessage: false,
      themeSave: false,
      newAlertMessageSave: false,
      dialogVisible: false,
      imageUrl,
      operationTutorial: false
    }
  },
  created () {
    const userId = localStorage.getItem('nz-user-id')
    const theme = localStorage.getItem(`nz-user-${userId}-theme`)
    const newAlertMessage = localStorage.getItem(`nz-notification-${userId}`)
    this.darkTheme = theme == 'dark'
    this.newAlertMessage = newAlertMessage == 1
    bus.$on('themeChange', this.themeChange)
    this.testAutoplay()
  },
  methods: {
    fn () {
      console.log(666)
    },
    ...mapActions(['logoutSuccess']),
    // 测试是否能自动播放 若不能 点击开关时弹窗
    testAutoplay () {
      const audio = new Audio(audioUrl)
      audio.muted = true
      audio.play().then(() => {
        console.log('autoplay')
        this.operationTutorial = false
      }).catch((err) => {
        console.log(err)
        this.operationTutorial = true
      })
    },
    handleClose () {
      this.operationTutorial = false
    },
    themeChange (theme) {
      this.darkTheme = theme == 'dark'
    },
    darkThemeChange (val) {
      if (this.themeSave) {
        return
      }
      this.themeSave = true
      this.darkTheme = val
      this.$get('/sys/user/profile').then(response => {
        if (response.code === 200) {
          const userInfo = response.user
          userInfo.roleIds = userInfo.roles[0].id
          userInfo.theme = val ? 2 : 1
          this.$put('sys/user/profile', userInfo).then(res => {
            this.themeSave = false
            if (res.code === 200) {
              const currentTheme = val ? 'dark' : 'light'
              localStorage.setItem(`nz-user-${localStorage.getItem('nz-user-id')}-theme`, currentTheme)
              const body = document.getElementsByTagName('body')[0]
              body.setAttribute('class', `theme-${currentTheme}`)
              this.$message.success(this.$t('tip.saveSuccess'))
            } else {
              this.$message.error(res.msg)
            }
          })
        } else {
          this.$message.error(response.msg)
        }
      })
    },
    newAlertMessageChange (val) {
      if (this.newAlertMessageSave) {
        return
      }
      this.newAlertMessageSave = true
      this.newAlertMessage = val
      const param = {
        newAlertMessage: {
          enable: val
        }
      }
      if (val && this.operationTutorial) {
        this.dialogVisible = true
      }
      this.$put('/sys/user/preference', { notification: JSON.stringify(param) }).then(res => {
        this.newAlertMessageSave = false
        if (res.code === 200) {
          const userId = localStorage.getItem('nz-user-id')
          localStorage.setItem(`nz-notification-${userId}`, val ? 1 : 0)
          if (val) {
            bus.openNotification(res.time)
          } else {
            bus.closeNotification()
          }
          this.$message.success(this.$t('tip.saveSuccess'))
        } else {
          this.$message.error(res.msg || res.error)
        }
      })
    },
    cli () {
      // this.$store.commit('openConsole')
      if (!this.externalTerminal) {
        this.$store.dispatch('dispatchExternalTerminal')
      } else {
        this.$store.dispatch('dispatchOpenExternalTerminalWindow')
      }
    },
    // 打开全局搜索
    openGlobalSearch () {
      this.$store.commit('setGlobalShow', true)
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
      })
    },
    changeLocal (lang) {
      this.$get('/sys/user/profile').then(response => {
        if (response.code === 200) {
          const userInfo = response.user
          userInfo.roleIds = userInfo.roles[0].id
          userInfo.lang = lang
          this.$put('sys/user/profile', userInfo).then(res => {
            this.prevent_opt.save = false
            if (res.code === 200) {
              localStorage.setItem('nz-language', lang)
              this.$store.commit('setLanguage', lang)
              this.$i18n.locale = lang
              this.$message.success(this.$t('tip.saveSuccess'))
              setTimeout(() => {
                window.location.reload()
              }, 800)
            } else {
              this.$message.error(res.msg)
            }
          })
        } else {
          this.$message.error(response.msg)
        }
      })
    },
    logout () {
      this.$get('logout').then(() => {
        sessionStorage.setItem('nz-is-logout', '1')
        this.logoutSuccess()
        // document.location.href = '/'
      })
    },
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
        const userInfo = localStorage.getItem('nz-userInfo') ? JSON.parse(localStorage.getItem('nz-userInfo')) : {}
        this.username = userInfo.username
        this.name = userInfo.name
        // this.refreshLang()
      })
      // if (window.history && window.history.pushState) {
      //   history.pushState(null, null, document.URL)
      //   window.addEventListener('popstate', this.cancel, false)
      // }
      bus.$on('link-data-change', () => {
        this.getLinkData()
      })
    },
    shrink () {
      this.$store.commit('isShrink')
    },
    testUser () {
      const userInfo = localStorage.getItem('nz-userInfo') ? JSON.parse(localStorage.getItem('nz-userInfo')) : {}
      if (this.name != userInfo.name) {
        this.$router.go(0)
      }
      if (this.$store.getters.getLanguage && (this.$store.getters.getLanguage !== localStorage.getItem('nz-language'))) {
        localStorage.setItem('nz-language', this.$store.getters.getLanguage)
      }
    }
  },
  mounted () {
    // for (let i = 65; i < 91; i++) {
    //   this.fontData.push(String.fromCharCode(i))
    // }
    // for (let i = 97; i < 123; i++) {
    //   this.fontData.push(String.fromCharCode(i))
    // }
    const userInfo = localStorage.getItem('nz-userInfo') ? JSON.parse(localStorage.getItem('nz-userInfo')) : {}
    this.name = userInfo.name
    this.username = userInfo.username
    this.language = localStorage.getItem('nz-language') ? localStorage.getItem('nz-language') : 'en'
    this.$i18n.locale = this.language
    if (localStorage.getItem('nz-token')) {
      this.initEvent()
      this.getLinkData()
    }
    window.addEventListener('visibilitychange', this.testUser)
  },
  computed: {
    linkData () {
      return this.$store.getters.getLinkData
    },
    route () {
      return this.$route.path
    },
    langList () {
      return this.$store.getters.getLangList
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
    },
    externalTerminal () {
      return this.$store.getters.getExternalTerminal
    }
  },
  beforeDestroy () {
    bus.$off('login')
    bus.$off('link-data-change')
    bus.$off('themeChange', this.themeChange)
  },
  destroyed () {
    window.removeEventListener('popstate', this.cancel, false)
  }
}
</script>
