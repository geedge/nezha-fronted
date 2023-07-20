<template>
  <div class="left-menu">
    <el-menu :collapse="isShrink" active-text-color="#ffffff" class="header-logo" text-color="#ffffff">
      <el-menu-item index="logo">
        <div id="home-to-overview" class="logo link">
          <img alt="loading..." height="26" :src="logo?logo:imgUrl"/>
          <span class="system-name">{{systemName && systemName !== 'undefined' ? systemName : $t('dashboard.overview.contentTitle')}}</span>
        </div>
      </el-menu-item>
    </el-menu>
    <el-menu :collapse="isShrink" :default-active="route" active-text-color="#FA901C" class="menu-list" mode="vertical" text-color="#BEBEBE" unique-opened @select="jump">
      <template v-for="(menu, index) in menuList">
        <el-submenu v-if="menu.children && menu.children.length > 0" :key="index" :index="`${index}`">
          <template slot="title">
            <i :class="menu.icon"></i>
            <span slot="title">{{$t(menu.i18n)}}</span>
          </template>
          <template v-for="(secondMenu, secondIndex) in menu.children">
            <el-submenu v-if="secondMenu.children && secondMenu.children.length > 0" :key="secondIndex" :index="`${index}-${secondIndex}`">
              <span slot="title" class="data-column__span">{{$t(secondMenu.i18n)}}</span>
              <el-menu-item v-for="(thirdMenu, thirdIndex) in secondMenu.children" :key="`${index}-${secondIndex}-${thirdIndex}`" :index="thirdMenu.route">{{$t(thirdMenu.i18n)}}</el-menu-item>
            </el-submenu>
            <el-menu-item v-else :key="secondIndex" :index="secondMenu.route">{{$t(secondMenu.i18n)}}</el-menu-item>
          </template>
        </el-submenu>
        <el-menu-item v-else :key="index" :index="menu.route">
          <i :class="menu.icon"></i>
          <span slot="title" class="data-column__span">{{$t(menu.i18n)}}</span>
        </el-menu-item>
      </template>
    </el-menu>
    <!-- collapse -->
    <div class="collapse-btn" :class="{'isCollapse-btn':isShrink}" :style="{height:copyright==1?'52px':'46px'}" @click="shrink">
      <template v-if="copyright==1">
        <div class="copy-right" v-show="!isShrink">
          <span>Copyright © 2019 - 2023</span>
          <span>Geedge Networks. All rights reserved.</span>
        </div>
      </template>
      <template v-else>
        <div class="collapse-text" v-show="!isShrink">
          <span>Collapse sidebar</span>
        </div>
      </template>
      <i class="collapse-icon nz-icon nz-icon-drop-down"></i>
    </div>
  </div>
</template>

<script>
import imgUrl from '@/assets/img/logo1-2.png'
export default {
  name: 'leftMenu',
  props: {
  },
  data () {
    return {
      imgUrl,
      systemName: localStorage.getItem('nz-sys-name'),
      copyright: localStorage.getItem('nz-copyright'),
      logo: ''
    }
  },
  created () {
    const self = this
    window.addEventListener('setItemEvent', function (e) {
      if (e.key == 'nz-sys-logo' && e.value) {
        self.logo = e.value
      }
    })
    this.logo = localStorage.getItem('nz-sys-logo')
  },
  computed: {
    menuList () {
      let allMenu = this.$store.getters.menuList
      allMenu = allMenu.filter(menu => {
        return menu.code !== 'header'
      })
      excludeButtonAndMenu(allMenu)
      return allMenu
      function excludeButtonAndMenu (menu) {
        for (let i = 0; i < menu.length; i++) {
          if (menu[i].type === 2 || menu[i].type === 3) {
            menu.splice(i, 1)
            i--
          } else {
            if (menu[i].children && menu[i].children.length > 0) {
              excludeButtonAndMenu(menu[i].children)
            }
          }
        }
      }
    },
    route () {
      return this.$route.path
    },
    isShrink () {
      return this.$store.getters.getIsShrink
    }
  },
  methods: {
    shrink () {
      this.$store.commit('isShrink')
    },
    jump (route) {
      this.$store.commit('setTimePickerRange', []) // 切换路由时清空已选择的时间
      if (route === this.route) {
        this.refresh()
      }
      this.$router.push({
        path: route,
        query: {
          t: +new Date()
        }
      })
    },
    refresh () {
      this.$emit('refresh')
    },
    getIcon (menu) {
      let className = ''
      switch (menu.code) {
        case 'dashboard': {
          className = 'nz-icon nz-icon-menu-dashboard'
          break
        }
        case 'asset': {
          className = 'nz-icon nz-icon-menu-assets'
          break
        }
        case 'monitor': {
          className = 'nz-icon nz-icon-menu-project'
          break
        }
        case 'alert': {
          className = 'nz-icon nz-icon-menu-alert'
          break
        }
        case 'settings': {
          className = 'nz-icon nz-icon-menu-setting'
          break
        }
        default:
          break
      }
      return className
    }
  }
}
</script>
