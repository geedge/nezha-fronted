<template>
  <div class="temp">
    <exprTemp class="template-tab" :switch-tab="switchTab" v-if="switchTab == 'exprTemp'" @changeShowTab="changeShowTab"></exprTemp>
    <chartTemp class="template-tab" :switch-tab="switchTab" v-if="switchTab == 'chartTemp'" @changeShowTab="changeShowTab"></chartTemp>
  </div>
</template>

<script>
import exprTemp from './exprTemp'
import chartTemp from './chartTemp'
import routerPathParams from '@/components/common/mixin/routerPathParams'
export default {
  name: 'v-template',
  components: {
    exprTemp,
    chartTemp
  },
  mixins: [routerPathParams],
  data () {
    return {
      switchTab: 'exprTemp'
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
      this.switchTab = tab // 此处需要组建中有showTab 属性
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
    changeShowTab (switchTab) {
      this.switchTab = switchTab
      this.updatePath({ switchTab })
    }
  },
  created () {
    this.switchTab = this.$route.query.switchTab || 'exprTemp'
  },
  mounted () {
  }
}
</script>

<style scoped>
.template-tab{
  height: 100%;
}
</style>
