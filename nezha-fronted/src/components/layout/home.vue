<template>
  <div class="home" :class="mode" v-my-loading.dark="loading" >
    <left-menu @refresh="refresh" v-show="showMenu"></left-menu>
    <div ref="body" class="body">
      <Header v-show="showHeader"></Header>
      <container v-if="containerShow" ref="container"></container>
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
    <span class="temp-dom--16"></span>
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
      containerShow: true
    }
  },
  computed: {
    // 查看模式
    mode () {
      return this.$store.state.panel.mode
    },
    loading () {
      return this.$store.getters.getHomeLoading
    },
    showMenu () {
      return !this.$route.meta.hideMenu
    },
    showHeader () {
      return !this.$route.meta.hideHeader
    }
  },
  methods: {
    refresh () {
      this.$store.commit('setIsRouteLive')
    }
  },
  mounted () {
    console.log(this.$router, this.$route)
  },
  destroyed () {
    localStorage.removeItem('moduleProjectId')
    localStorage.removeItem('endpointProjectId')
  }
}
</script>
