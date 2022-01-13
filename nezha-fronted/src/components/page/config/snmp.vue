<template>
  <div class="snmp">
    <mib-file v-if="switchTab === 'file'" :switch-tab="switchTab" ></mib-file>
    <mib-browser  v-if="switchTab === 'browser'" :switch-tab="switchTab"></mib-browser>
    <credentials v-if="switchTab === 'credentials'" :switch-tab="switchTab"></credentials>
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
      switchTab: '',
      snmpHasTab: ['snmp_mib_browser', 'snmp_credential_view', 'snmp_mibFile_view']
    }
  },
  computed: {
    buttonList () {
      return this.$store.getters.buttonList
    }
  },
  methods: {
    snmpSwitchTab (tab) {
      this.switchTab = tab
      if (tab !== 'browser') {
        this.updatePath({ tab })
      } else {
        const t = +new Date()
        this.updatePath({ t })
      }
    },
    snmpHas () {
      let flag = false
      this.snmpHasTab.forEach(item => {
        if (flag) {
          return
        }
        if (this.buttonList.indexOf(item) !== -1) {
          flag = true
          if (item === 'snmp_mib_browser') {
            this.switchTab = 'browser'
          } else if (item === 'snmp_credential_view') {
            this.switchTab = 'credentials'
          } else if (item === 'snmp_mibFile_view') {
            this.switchTab = 'file'
          }
        }
      })
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
    this.snmpHas()
    this.switchTab = this.$route.query.switchTab || this.switchTab
  }
}
</script>
