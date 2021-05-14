<template>
  <div class="left-menu">
    <el-menu :collapse="isShrink" active-text-color="#ffffff" class="header-logo" text-color="#ffffff">
      <el-menu-item index="logo">
        <div id="home-to-overview" class="logo link">
          <img alt="loading..." height="26" :src="logo?logo:require('../../assets/img/logo1-2.png')"/>
          <span class="system-name">{{systemName && systemName !== 'undefined' ? systemName : $t('dashboard.overview.contentTitle')}}</span>
        </div>
      </el-menu-item>
    </el-menu>
    <el-menu :collapse="isShrink" :default-active="route" active-text-color="#FA901C" background-color="#202F3F" class="menu-list" mode="vertical" text-color="#BEBEBE" unique-opened @select="jump">
      <template v-for="(menu, index) in menuList">
        <el-submenu v-if="menu.children && menu.children.length > 0" :key="index" :index="`${index}`">
          <template slot="title">
            <i :class="menu.icon"></i>
            <span slot="title">{{$t(menu.i18n)}}</span>
          </template>
          <template v-for="(secondMenu, secondIndex) in menu.children">
            <el-submenu v-if="secondMenu.children && secondMenu.children.length > 0" :key="secondIndex" :index="`${index}-${secondIndex}`">
              <span slot="title">{{$t(secondMenu.i18n)}}</span>
              <el-menu-item v-for="(thirdMenu, thirdIndex) in secondMenu.children" :key="`${index}-${secondIndex}-${thirdIndex}`" :index="thirdMenu.route">{{$t(thirdMenu.i18n)}}</el-menu-item>
            </el-submenu>
            <el-menu-item v-else :key="secondIndex" :index="secondMenu.route">{{$t(secondMenu.i18n)}}</el-menu-item>
          </template>
        </el-submenu>
        <el-menu-item v-else :key="index" :index="menu.route">
          <i :class="menu.icon"></i>
          <span slot="title">{{$t(menu.i18n)}}</span>
        </el-menu-item>
      </template>
    </el-menu>
  </div>
</template>

<script>
export default {
  name: 'leftMenu',
  props: {
  },
  data () {
    return {
      systemName: localStorage.getItem('nz-sys-name'),
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
    jump (route) {
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

<style lang="scss">
.left-menu {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #202F3F;

  .el-menu-item .nz-icon, .el-submenu .nz-icon {
    display: inline-block;
    vertical-align: middle;
    margin-right: 5px;
    width: 24px;
    text-align: center;
    font-size: 18px;
  }
  >.el-menu:not(.el-menu--collapse) {
    width: 240px;
  }
  >.el-menu.menu-list {
    height: calc(100% - 110px);
    border-right: none;
    overflow: auto;

    >.el-submenu.is-active .el-submenu__title {
      background-color: #101B27 !important;
    }
    .el-submenu.is-active .el-submenu__title, .el-submenu.is-active .el-submenu__title>i {
      color: white !important;
    }
    .el-submenu.is-opened .el-menu-item:not(.is-active), .el-submenu.is-opened .el-submenu__title {
      background-color: #182534 !important;
    }
    .el-menu-item.is-active {
      background-color: #101B27 !important;
    }
    .el-menu-item, .el-submenu__title {
      height: 46px;
      line-height: 46px;
    }
  }

  /*---滚动条默认显示样式--*/
  >.el-menu::-webkit-scrollbar-thumb {
    background-color: rgba(255,255,255,.4);
    border-radius: 2px;
    border: none;
  }
  /*---鼠标点击滚动条显示样式--*/
  >.el-menu::-webkit-scrollbar-thumb:hover {
    background-color: rgba(255,255,255,.3);
    border-radius: 2px;
  }
  /*---滚动条大小--*/
  >.el-menu::-webkit-scrollbar {
    width: 6px;
    height: 14px;
  }
  >.el-menu.header-logo {
    border-right: none;
    >.el-menu-item {
      padding: 13px 0 0 18px !important;
      height: 50px;
      border-right: 1px solid #202F3F;
      box-sizing: border-box;
      background-color: #182534 !important;

      .logo {
        display: flex;
        box-sizing: border-box;

        img {
          box-shadow: 0 0 2px 0 rgba(0,0,0,0.50);
        }

        .system-name {
          padding-left: 5px;
          color: white;
          font-size: 12px;
          letter-spacing: 0;
          line-height: 34px;
          font-weight: 400;
        }
      }
    }
  }
}
.el-menu--popup {
  .el-menu-item {
    height: 49px;
    line-height: 49px;
  }
  .el-menu-item.is-active {
    background-color: #101B27 !important;
  }
}
</style>
