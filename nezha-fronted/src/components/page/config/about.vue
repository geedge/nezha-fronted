<template>
  <div class="about">
    <div class="app-header">
      <div class="header-logo"><img width="88" height="88" src="../../../assets/img/logo1-2.png"></div>
      <div class="header-title">
        <div class="app-name">{{version.nezha.name}}</div>
        <div class="app-version"><span class="about-label">{{$t("overall.version")}}&nbsp;&nbsp;&nbsp;</span><span>{{version.nezha.version}}</span></div>
      </div>
    </div>
    <div class="app-component">
      <div class="component-title">{{$t("overall.components")}}</div>
      <div class="component-content">
        <div class="app-component-row" v-for="(item, index) in version.components" :key="index">
          <div class="component-name">{{item.name}}</div>
          <div class="component-version">{{item.version}}</div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'about',
  data () {
    return {
      version: {
        nezha: { name: '', version: '' },
        components: [{ name: '', version: '' }]
      }
    }
  },
  methods: {
    getVersion () {
      this.$get('/about').then(response => {
        this.version = response.data
      })
    }
  },
  mounted () {
    this.getVersion()
  }
}
</script>
