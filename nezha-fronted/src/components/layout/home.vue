<template>
  <div class="home">
    <left-menu @refresh="refresh"></left-menu>
    <div ref="body" class="body">
      <Header></Header>
      <container v-if="containerShow" ref="container"></container>
    </div>
    <!--菜单列表-->
    <menus v-if="isMenuPage"></menus>
    <!--web-ssh-->
    <web-ssh ref="webSsh"></web-ssh>
    <!--table悬浮提示容器-->
    <span class="el-popover table-tooltip"></span>
  </div>
</template>

<script>
import Header from './header'
import webSSH from '../cli/webSSH'
import leftMenu from './leftMenu'
import menus from '../page/config/menus'
import container from './container'
export default {
  name: 'home',
  components: {
    Header,
    menus,
    leftMenu,
    container,
    'web-ssh': webSSH
  },
  data () {
    return {
      containerShow: true
    }
  },
  computed: {
    isMenuPage: function () {
      return this.$route.path === '/menu'
    }
  },
  methods: {
    refresh () {
      this.containerShow = false
      this.$nextTick(() => { this.containerShow = true })
    }
  }
}
</script>

<style lang="scss">
.home {
  display: flex;
  transition: all .2s;
  .body {
    display: flex;
    flex-direction: column;
    flex: auto;
    transition: all .2s;
  }
}
</style>
