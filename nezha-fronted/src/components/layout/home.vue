<template>
  <div class="home">
    <left-menu @refresh="refresh"></left-menu>
    <div ref="body" class="body">
      <Header></Header>
      <container v-if="containerShow" ref="container" v-my-loading:ldsFacebook="myLoading"></container>
    </div>
    <!--web-ssh-->
    <web-ssh ref="webSsh"></web-ssh>
    <!--global-search-->
    <global-search ref="globalSearch"></global-search>
    <!--table悬浮提示容器-->
    <span class="el-popover table-tooltip"></span>
    <!-- 临时文本dom，用来计算文本长度 -->
    <span class="temp-dom"></span>
    <span class="temp-dom--12"></span>
  </div>
</template>

<script>
import Header from './header'
import webSSH from '../cli/webSSH'
import leftMenu from './leftMenu'
import container from './container'
import globalSearch from '@/components/common/globalSearch/globalSearch'

export default {
  name: 'home',
  components: {
    Header,
    leftMenu,
    container,
    'web-ssh': webSSH,
    globalSearch
  },
  data () {
    return {
      containerShow: true,
      myLoading: true
    }
  },
  methods: {
    refresh () {
      this.$store.commit('setIsRouteLive')
    }
  },
  mounted () {
    // setInterval(() => {
    //   this.myLoading = !this.myLoading
    // }, 1000)
  },
  destroyed () {
    localStorage.removeItem('moduleProjectId')
    localStorage.removeItem('endpointProjectId')
  }
}
</script>
