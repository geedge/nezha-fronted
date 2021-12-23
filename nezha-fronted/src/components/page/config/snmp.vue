<template>
  <div>
    <mib-file v-if="switchTab === 'file'" :switch-tab="switchTab" @changeShowTab="changeShowTab" @toBrowserTab="changeTab(['mib','browser'],'browser')" @toCredentialTab="changeTab(['mib','credentials'],'credentials')"></mib-file>
    <mib-browser v-if="switchTab === 'browser'" :switch-tab="switchTab" @changeShowTab="changeShowTab" @toCredentialTab="changeTab(['mib','credentials'],'credentials')" @toFileTab="changeTab(['mib','file'],'file')"></mib-browser>
    <credentials v-if="switchTab === 'credentials'" :switch-tab="switchTab" @changeShowTab="changeShowTab" @toBrowserTab="changeTab(['mib','browser'],'browser')" @toFileTab="changeTab(['mib','file'],'file')"></credentials>
  </div>
</template>

<script>
import mibBrowser from './mibBrowser'
import credentials from './credentials'
import mibFile from './mib'
import routerPathParams from '@/components/common/mixin/routerPathParams'
export default {
  name: 'snmp',
  components: {
    credentials,
    mibBrowser,
    mibFile
  },
  mixins: [routerPathParams],
  data () {
    return {
      switchTab: 'browser'
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
      this.switchTab = tab // 此处需要组建中有showTab 属性
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
    changeShowTab (switchTab) {
      this.switchTab = switchTab
      if (switchTab !== 'browser') {
        this.updatePath({ switchTab })
      } else {
        const t = +new Date()
        this.updatePath({ t })
      }
    }
  },
  watch: {
    $routePath: {
      immediate: true,
      handler (n, o) {
        if (n.indexOf('mib') != -1 && this.$route.params.tab) {
          this.$set(this, 'switchTab', this.$route.params.tab)
        }
      }
    }
  },
  created () {
    this.switchTab = this.$route.query.switchTab || 'browser'
  }
}
</script>
