<template>
  <div class="integration-tabs">
    <ul class="integration-tabs-nav">
      <li class="integration-tabs-nav-item" :class="{active:tabId===item.id}"  v-for="item in filterTabs" :key="item.id" @click="tabChange(item.id)">{{item.name}}</li>
    </ul>
    <div class="integration-tabs-content">
      <!-- internal -->
      <automatic v-if="tabId==='automatic'"></automatic>
      <manual v-if="tabId==='manual'"></manual>
      <!-- module -->
      <configuration v-if="tabId==='configuration'" :configuration="$t(detailsObj.configuration)"></configuration>
      <dashboard v-if="tabId==='dashboard'" :tempId="detailsObj.tempId" :time="time"></dashboard>
<!--      <alert v-if="tabId==='alert'" :moduleId="detailsObj.id"></alert>-->
      <metric v-if="tabId==='metric'" :moduleId="detailsObj.id"></metric>
    </div>
  </div>
</template>

<script>
import bus from '../../../../libs/bus'
import manual from './manual.vue'
import automatic from './automatic.vue'
import configuration from './configuration.vue'
import dashboard from './dashboard.vue'
import alert from './alert.vue'
import metric from './metric.vue'
export default {
  name: 'integration-tabs',
  props: {
    detailsObj: Object,
    type: String
  },
  components: {
    manual,
    automatic,
    configuration,
    dashboard,
    alert,
    metric
  },
  computed: {
    filterTabs () {
      return this.tabs.filter(item => item.id !== 'alert')
    }
  },
  data () {
    return {
      tabs: [],
      tabId: '',
      time: bus.getTimezontDateRange()
    }
  },
  methods: {
    tabChange (id) {
      if (this.tabId === id) { return }
      this.tabId = id
    }
  },
  watch: {
    type: {
      immediate: true,
      handler (val) {
        if (val === 'internal') {
          this.tabId = 'automatic'
          this.tabs = [
            { id: 'automatic', name: this.$t('integration.automaticInstallation') },
            { id: 'manual', name: this.$t('integration.manualInstallation') }
          ]
        } else if (val === 'module') {
          this.tabId = 'configuration'
          this.tabs = [
            { id: 'configuration', name: this.$t('project.module.configs') },
            { id: 'dashboard', name: this.$t('overall.dashboard') },
            { id: 'alert', name: this.$t('overall.alert') },
            { id: 'metric', name: this.$t('overall.metric') }
          ]
        }
      }
    }
  }
}
</script>
