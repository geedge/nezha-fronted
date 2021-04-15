<template>
    <div>
      <mib-file :show-tab="showTab" v-if="showTab == 'file'" @toCredentialTab="changeTab(['mib','credentials'],'credentials')" @toBrowserTab="changeTab(['mib','browser'],'browser')"></mib-file>
      <mib-browser :show-tab="showTab" v-if="showTab == 'browser'" @toFileTab="changeTab(['mib','file'],'file')" @toCredentialTab="changeTab(['mib','credentials'],'credentials')"></mib-browser>
      <credentials :show-tab="showTab" v-if="showTab == 'credentials'" @toFileTab="changeTab(['mib','file'],'file')" @toBrowserTab="changeTab(['mib','browser'],'browser')"></credentials>
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
    }
  },
  watch: {
    route: {
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
