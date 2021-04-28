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
<style scoped lang="scss">
  .about {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    background-color: white;
    border: 10px solid #eee;
    box-sizing: border-box;

    .about-label {
      color: #999;
    }

    .app-header {
      display: flex;
      min-width: 360px;

      .header-logo {
        font-size: 0;
        background-color: rgba(0, 0, 0, 0.9);
        border-radius: 2px;
      }

      .header-title {
        padding-left: 20px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;

        .app-name {
          font-weight: bold;
          line-height: 50px;
          font-family: Roboto-Bold;
          font-size: 20px;
          color: #333333;
          font-weight: 700;
        }

        .app-version {
          font-family: Roboto-Regular;
          font-size: 14px;
          color: #333333;
          font-weight: 400;
        }
      }
    }

    .app-component {
      width: 360px;
      margin-top: 35px;

      .component-title {
        color: #999;
        height: 30px;
        font-size: 14px;
        line-height: 30px;
        border-bottom: 1px solid #999;
      }

      .component-content {
        padding-top: 8px;
      }

      .app-component-row {
        line-height: 28px;
        display: flex;
        color: #333;
        font-size: 14px;
        font-family: Roboto-Regular;
        font-size: 16px;
        font-weight: 400;
        justify-content: space-between;
      }
    }
  }
</style>
