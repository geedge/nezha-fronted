<template>
  <div class="home">
    <left-menu @refresh="refresh"></left-menu>
    <div ref="body" class="body">
      <Header></Header>
      <container v-if="containerShow" ref="container"></container>
    </div>
    <!--web-ssh-->
    <web-ssh ref="webSsh"></web-ssh>
    <!--table悬浮提示容器-->
    <span class="el-popover table-tooltip"></span>
    <!-- 临时文本dom，用来计算文本长度 -->
    <span class="temp-dom"></span>
  </div>
</template>

<script>
import Header from './header'
import webSSH from '../cli/webSSH'
import leftMenu from './leftMenu'
import container from './container'
export default {
  name: 'home',
  components: {
    Header,
    leftMenu,
    container,
    'web-ssh': webSSH
  },
  data () {
    return {
      containerShow: true
    }
  },
  methods: {
    refresh () {
      this.containerShow = false
      this.$nextTick(() => { this.containerShow = true })
    }
  },
  destroyed () {
    localStorage.removeItem('moduleProjectId')
    localStorage.removeItem('endpointProjectId')
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
    width: calc(100% - 240px);
    transition: all .2s;
  }
}
.temp-dom {
  visibility: hidden;
  font-size: 14px;
  position: fixed;
}
</style>
