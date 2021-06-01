<template>
  <div>
    <mib-file v-if="showTab === 'file'" :show-tab="showTab" @changeShowTab="changeShowTab" @toBrowserTab="changeTab(['mib','browser'],'browser')" @toCredentialTab="changeTab(['mib','credentials'],'credentials')"></mib-file>
    <mib-browser v-if="showTab === 'browser'" :show-tab="showTab" @changeShowTab="changeShowTab" @toCredentialTab="changeTab(['mib','credentials'],'credentials')" @toFileTab="changeTab(['mib','file'],'file')"></mib-browser>
    <credentials v-if="showTab === 'credentials'" :show-tab="showTab" @changeShowTab="changeShowTab" @toBrowserTab="changeTab(['mib','browser'],'browser')" @toFileTab="changeTab(['mib','file'],'file')"></credentials>
  </div>
</template>

<script>
import mibBrowser from './mibBrowser'
import credentials from './credentials'
import mibFile from './mib'
export default {
  name: 'snmp',
  components: {
    credentials,
    mibBrowser,
    mibFile
  },
  data () {
    return {
      showTab: 'file'
    }
  },
  methods: {
    changeTab: function (paths, tab) {
      /* let path = '/'
      if (paths && paths instanceof Array) {
        paths.forEach(p => {
          path += p + '/'
        })
        path = path.substring(0, path.length - 1)
      } else {
        path = paths
      } */
      this.showTab = tab // 此处需要组建中有showTab 属性
      // this.toPath(path)
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

</style>
