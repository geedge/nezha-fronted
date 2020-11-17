<template>
  <div class="about">
    <div class="app-header">
      <div class="header-logo"><img width="70" height="70" src="../../../assets/img/logo1-2.png"></div>
      <div class="header-title">
        <div class="app-name">Nezha monitoring System</div>
        <div class="app-version"><span class="about-label">{{$t("overall.version")}}&nbsp;&nbsp;&nbsp;</span><span>1.2.1</span></div>
      </div>
    </div>
    <div class="app-component">
      <div class="component-title">{{$t("overall.components")}}</div>
      <div class="component-content">
        <div class="app-component-row">
          <div class="component-name">Maria DB</div>
          <div class="component-version">{{version.mariadb}}</div>
        </div>
        <div class="app-component-row">
          <div class="component-name">Redis</div>
          <div class="component-version">{{version.redis}}</div>
        </div>
        <div class="app-component-row">
          <div class="component-name">Prometheus</div>
          <div class="component-version">{{version.prometheus}}</div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  export default {
    name: "about",
    data() {
      return {
        version: {
          main: "1.2.1",
          mariadb: "10.5.5-log",
          redis: "4.1.2",
          prometheus: "2.21.1"
        }
      }
    },
  }
</script>
<style scoped lang="scss">
  .about {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;

    .about-label {
      color: #999;
    }

    .app-header {
      display: flex;

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
          font-size: 18px;
          line-height: 50px;
        }

        .app-version {
          font-size: 12px;
        }
      }
    }

    .app-component {
      width: 325px;
      margin-top: 35px;

      .component-title {
        color: #999;
        height: 30px;
        font-size: 12px;
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
        justify-content: space-between;
      }
    }
  }
</style>
