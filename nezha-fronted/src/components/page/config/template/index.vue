<template>
  <div>
    <exprTemp class="template-tab" :show-tab="showTab" v-if="showTab == 'exprTemp'" @changeShowTab="changeShowTab" @toCredentialTab="changeTab(['mib','credentials'],'credentials')" @toBrowserTab="changeTab(['mib','browser'],'browser')"></exprTemp>
    <chartTemp class="template-tab" :show-tab="showTab" v-if="showTab == 'chartTemp'" @changeShowTab="changeShowTab" @toCredentialTab="changeTab(['mib','credentials'],'credentials')" @toBrowserTab="changeTab(['mib','browser'],'browser')"></chartTemp>
  </div>
</template>

<script>
import exprTemp from './exprTemp'
import chartTemp from './chartTemp'
export default {
  name: 'template',
  components: {
    exprTemp,
    chartTemp
  },
  data () {
    return {
      showTab: 'exprTemp'
    }
  },
  methods: {
    changeTab: function (paths, tab) {
      let path = '/'
      if (paths && paths instanceof Array) {
        paths.forEach(p => {
          path += p + '/'
        })
        path = path.substring(0, path.length - 1)
      } else {
        path = paths
      }
      this.showTab = tab // 此处需要组建中有showTab 属性
      this.toPath(path)
    },
    toPath: function (path) {
      this.$router.push({
        path: path,
        query: {
          t: +new Date()
        }
      })
    },
    changeShowTab (showTab) {
      this.showTab = showTab
    }
  },
  watch: {
    $routePath: {

      immediate: true,
      handler (n, o) {
        if (n.indexOf('mib') != -1 && this.$route.params.tab) {
          this.$set(this, 'showTab', this.$route.params.tab)
        }
      }
    }
  }
}
</script>

<style scoped>
.template-tab{
  height: 100%;
}
</style>
