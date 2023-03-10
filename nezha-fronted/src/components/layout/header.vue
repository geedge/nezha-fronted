<template>
  <div class="header">
    <div class="left-menu--pin" :class="!isShrink?'left-menu--pin-normal':'left-menu--pin-reverse'" @click="shrink"><i :class="{'icon-reverse': isShrink,}" class="el-icon-s-fold" :title="isShrink ? $t('overall.expandMenu') : $t('overall.collapseMenu')"></i></div>
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
        <el-dropdown-menu  slot="dropdown" class="right-public-box-select-top right-public-box-dropdown-top" style="width: 142px; line-height: 36px;">
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
    <guide :show-dialog="showGuide" @dialogClosed="dialogClosed" @close="showGuide = false"></guide>
    <intro></intro>
<!--    <span v-for="item in fontData" :key="item">-->
<!--      <span class="temp-dom" :class="`temp-dom&#45;&#45;${fontSzie}`" v-for="fontSzie in [12,13,14,15]" :key="fontSzie">{{item}}</span>-->
<!--    </span>-->
  </div>
</template>

<script>
import bus from '../../libs/bus'
import { mapActions } from 'vuex'
import guide from '@/components/common/popBox/guide'
import intro from '@/components/common/intro'
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
      ]
      // fontData: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, ' ', '@', '$', '-']
    }
  },
  methods: {
    ...mapActions(['logoutSuccess']),
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
      localStorage.setItem('nz-language', lang)
      this.$store.commit('setLanguage', lang)
      this.$i18n.locale = lang
      setTimeout(() => {
        window.location.reload()
      }, 800)
    },
    logout () {
      this.$get('logout').then(() => {
        this.$router.replace({ path: '/', query: {} }).catch(err => {})
        this.logoutSuccess()
        window.location.href = '/'
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
        this.username = localStorage.getItem('nz-username')
        this.name = localStorage.getItem('nz-username')
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
      if (this.username != localStorage.getItem('nz-username')) {
        this.$router.go(0)
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
    this.name = localStorage.getItem('nz-username')
    this.username = localStorage.getItem('nz-username')
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
  },
  destroyed () {
    window.removeEventListener('popstate', this.cancel, false)
  }
}
</script>
