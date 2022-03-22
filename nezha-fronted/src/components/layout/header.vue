<template>
  <div class="header">
    <div class="left-menu--pin" :class="!isShrink?'left-menu--pin-normal':'left-menu--pin-reverse'" @click="shrink"><i :class="{'icon-reverse': isShrink,}" class="el-icon-s-fold"></i></div>
    <el-breadcrumb class="nz-breakcrumb" separator="/">
      <el-breadcrumb-item v-for="crumb in breadcrumb" :key="crumb.code">{{$t(crumb.i18n)}}</el-breadcrumb-item>
    </el-breadcrumb>
    <div class="header-menu">
      <el-dropdown trigger="click">
        <el-dropdown-menu></el-dropdown-menu>
        <div id="header-open-global-search" @click="openGlobalSearch">
          <div class="header-menu__item"><i class="nz-icon nz-icon-search"></i></div>
        </div>
      </el-dropdown>
      <el-dropdown trigger="click">
        <div class="header-menu__item"><i class="nz-icon nz-icon-more-app"></i></div>
        <el-dropdown-menu slot="dropdown" class="right-box-select-top right-public-box-dropdown-top">
          <el-dropdown-item v-for="(item, index) in linkData" :key="index" :index="'0-' + index" v-if="linkData.length">
            <span class="link-title">
              <i class="nz-icon nz-icon-link"></i>
              <a :href='item.url' rel="noopener noreferrer" :title="item.name"  class="nz-  a" target="_blank">{{item.name}}</a>
            </span>
          </el-dropdown-item>
          <div v-if="!linkData.length" class="header-link-nodata">
            {{$t('overall.noData')}}
          </div>
        </el-dropdown-menu>
      </el-dropdown>
      <el-dropdown trigger="click">
        <el-dropdown-menu></el-dropdown-menu>
        <div id="header-open-cli" @click="cli">
          <div class="header-menu__item"><i class="nz-icon nz-icon-terminal"></i></div>
          <span v-show="$store.state.consoleCount>0" class="right-tip">{{$store.state.consoleCount<=10?$store.state.consoleCount:'10+'}}</span>
        </div>
      </el-dropdown>
      <el-dropdown trigger="click">
        <el-dropdown-menu></el-dropdown-menu>
        <div class="header-menu__item" @click="showGuide = true"><i class="nz-icon nz-icon-guide"></i></div>
      </el-dropdown>
    </div>
    <!--个人操作-->
    <div class="personal">
      <el-dropdown trigger="click">
        <div class="header-menu--item">
          <i class="nz-icon nz-icon-language-change"></i>
        </div>
        <el-dropdown-menu slot="dropdown" class="right-box-select-top right-public-box-dropdown-top">
          <el-dropdown-item v-for="lang in langList" :key="lang.value">
            <div :style="language === lang.value ? 'color:#f90' : ''" @click="changeLocal(lang.value)"><i :class="`nz-icon-lang-${lang.value}`" class="nz-icon"></i>{{lang.name}}</div>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
      <el-dropdown trigger="click">
        <div class="personal-avatar"><span>{{name.substr(0, 1)}}</span>&nbsp;<i class="nz-icon nz-icon-arrow-down"></i></div>
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
  </div>
</template>

<script>
import bus from '../../libs/bus'
import { mapActions } from 'vuex'
import guide from '@/components/common/popBox/guide'
export default {
  name: 'Header',
  components: {
    guide
  },
  data () {
    return {
      username: localStorage.getItem('nz-username'),
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
        this.logoutSuccess()
        document.location.href = '/'
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
    },
    testUser () {
      if (this.username != localStorage.getItem('nz-username')) {
        window.location.reload()
      }
    }
  },
  mounted () {
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
