<template>
  <div class="snmp">
    <div class="snmp-tab">
      <div id="module-type-7" v-has="'mibBrowser'"  class="nz-tab-item-box" @click="snmpSwitchTab('browser')">
        <div class="nz-tab-item" :class="{'nz-tab-item-active': switchTab === 'browser'}">{{$t("config.mib.mibBrowser")}}</div>
      </div>
      <div id="module-type-8" v-has="'snmp_credential_view'" class="nz-tab-item-box" @click="snmpSwitchTab('credentials')">
        <div class="nz-tab-item" :class="{'nz-tab-item-active': switchTab === 'credentials'}">{{$t("config.mib.credentials")}}</div>
      </div>
      <div id="module-type-6" v-has="'snmp_mibFile_view'" class="nz-tab-item-box" @click="snmpSwitchTab('file')">
        <div class="nz-tab-item" :class="{'nz-tab-item-active': switchTab === 'file'}">{{$t("config.mib.mibFiles")}}</div>
      </div>
    </div>
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
      switchTab: 'browser',
      snmpHasTab: '',
      snmpHasTabBrowser: '',
      snmpHasTabFile: '',
      snmpHasTabCredentials: ''
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
      const date = JSON.parse(localStorage.getItem('nz-user-permissions'))
      date.map(e => {
        if (e === 'mibBrowser') {
          this.snmpHasTabBrowser = 'browser'
          this.snmpHasTab = this.snmpHasTabBrowser
        } else if (e === 'snmp_credential_view') {
          this.snmpHasTabCredentials = 'credentials'
          this.snmpHasTab = this.snmpHasTabCredentials
        } else if (e === 'snmp_mibFile_view') {
          this.snmpHasTabFile = 'file'
          this.snmpHasTab = this.snmpHasTabFile
        }
      })
      if (this.snmpHasTabCredentials && this.snmpHasTabFile && this.snmpHasTabBrowser) {
        this.snmpHasTab = this.snmpHasTabBrowser
      } else if (this.snmpHasTabCredentials && this.snmpHasTabBrowser) {
        this.snmpHasTab = this.snmpHasTabBrowser
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
    this.snmpHas()
    this.switchTab = this.$route.query.switchTab || this.snmpHasTab
  }
}
</script>
