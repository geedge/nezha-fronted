<template>
  <div class="temp">
    <exprTemp class="template-tab" :show-tab="showTab" v-if="showTab == 'exprTemp'" @changeShowTab="changeShowTab"></exprTemp>
    <chartTemp class="template-tab" :show-tab="showTab" v-if="showTab == 'chartTemp'" @changeShowTab="changeShowTab"></chartTemp>
  </div>
</template>

<script>
import exprTemp from './exprTemp'
import chartTemp from './chartTemp'
export default {
  name: 'v-template',
  components: {
    exprTemp,
    chartTemp
  },
  data () {
    return {
      showTab: ''
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
  mounted () {
    this.$nextTick(()=>{
      this.showTab = 'exprTemp'
    })
  }
}
</script>

<style scoped>
.template-tab{
  height: 100%;
}
</style>
