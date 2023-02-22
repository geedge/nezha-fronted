<template>
  <div class="integration-tabs">
    <ul class="integration-tabs-nav">
      <li class="integration-tabs-nav-item" :class="{active:tabId===item.id}"  v-for="item in tabs" :key="item.id" @click="tabChange(item.id)">{{item.name}}</li>
    </ul>
    <div class="integration-tabs-content">
      <configuration v-if="tabId==='configuration'" :configuration="detailsObj.configuration"></configuration>
      <dashboard v-if="tabId==='dashboard'" :dashboardTemplate="detailsObj.dashboardTemplate"></dashboard>
      <alert v-if="tabId==='alert'"></alert>
      <metric v-if="tabId==='metric'"></metric>
    </div>
  </div>
</template>

<script>
import configuration from './configuration.vue'
import dashboard from './dashboard.vue'
import alert from './alert.vue'
import metric from './metric.vue'
export default {
  name: 'integration-tabs',
  props: {
    detailsObj: {
      type: Object
    }
  },
  components: {
    configuration,
    dashboard,
    alert,
    metric
  },
  data () {
    return {
      tabs:
      [
        { id: 'configuration', name: this.$t('project.module.configs') },
        { id: 'dashboard', name: this.$t('overall.dashboard') },
        { id: 'alert', name: this.$t('overall.alert') },
        { id: 'metric', name: this.$t('overall.metric') }
      ],
      tabId: 'configuration'
    }
  },
  methods: {
    tabChange (id) {
      if (this.tabId === id) { return }
      this.tabId = id
    }
  }
}
</script>
