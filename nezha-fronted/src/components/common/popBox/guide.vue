<template>
  <el-dialog
    :title="$t('guide.title')"
    :visible.sync="visible"
    custom-class="guild-pop"
    width="1000px"
    @close="close"
  >
    <div class="guide-list">
      <div ref="guideShadow" class="guide-shadow"></div>
      <div v-for="(guide, index) in guideList" :key="index" :class="{'guide-item--active': index === activeIndex}" class="guide-item"
           @mouseenter="enter(index)"  @mouseleave="leave(index)"
      >
        <div class="item__title">{{guide.title}}</div>
        <div class="item__icon" @click="jump(guide.route)"><i :class="guide.icon"></i></div>
      </div>
    </div>
    <div class="guide-desc">
      <template v-if="activeIndex === 0">
        <div class="desc-text">{{$t('guide.dcTip')}}</div>
        <div class="guide__btn-group">
          <button class="guide__btn" type="button" :class="{'nz-btn-permissions': !hasButton('dc_add')}" @click="jumpAndOpen('dc')">{{$t('guide.addDc')}}</button>
          <button class="guide__btn" type="button" :class="{'nz-btn-permissions': !hasButton('dc_add')}" @click="jumpAndOpen('cabinet')">{{$t('guide.addCabinet')}}</button>
        </div>
      </template>
      <template v-if="activeIndex === 1">
        <div class="desc-text">{{$t('guide.agentTip')}}</div>
        <div class="guide__btn-group">
          <button class="guide__btn" type="button" :class="{'nz-btn-permissions': !hasButton('agent_add')}" @click="jumpAndOpen('agent')">{{$t('guide.addAgent')}}</button>
          <button class="guide__btn" type="button" :class="{'nz-btn-permissions': !hasButton('agent_add')}" @click="downloadAgent">{{$t('guide.downloadAgent')}}</button>
        </div>
      </template>
      <template v-if="activeIndex === 2">
        <div class="desc-text">{{$t('guide.assetTip')}}</div>
        <div class="guide__btn-group">
          <button class="guide__btn" type="button" :class="{'nz-btn-permissions': !hasButton('asset_add')}" @click="jumpAndOpen('asset')">{{$t('guide.addAsset')}}</button>
          <button class="guide__btn" type="button" :class="{'nz-btn-permissions': !hasButton('asset_add')}" @click="jumpAndOpen('importAsset')">{{$t('guide.importAsset')}}</button>
          <button class="guide__btn" type="button" :class="{'nz-btn-permissions': !hasButton('asset_add')}" @click="openTerminal">{{$t('guide.webTerminal')}}</button>
        </div>
      </template>
      <template v-if="activeIndex === 3">
        <div class="desc-text">{{$t('guide.monitorTip')}}</div>
        <div class="guide__btn-group">
          <button class="guide__btn" type="button" :class="{'nz-btn-permissions': !hasButton('project_add')}" @click="jumpAndOpen('project')">{{$t('guide.addProject')}}</button>
          <button class="guide__btn" type="button" :class="{'nz-btn-permissions': !hasButton('monitor_module_add')}" @click="jumpAndOpen('module')">{{$t('guide.addModule')}}</button>
          <button class="guide__btn" type="button" :class="{'nz-btn-permissions': !hasButton('monitor_endpoint_add')}" @click="jumpAndOpen('endpoint')">{{$t('guide.addEndpoint')}}</button>
          <button class="guide__btn" type="button" :class="{'nz-btn-permissions': !hasButton('monitor_endpoint_add')}" @click="jumpAndOpen('importEndpoint')">{{$t('guide.importEndpoint')}}</button>
        </div>
      </template>
      <template v-if="activeIndex === 4">
        <div class="desc-text">{{$t('guide.visualizationTip')}}</div>
        <div class="guide__btn-group">
          <button class="guide__btn" type="button" :class="{'nz-btn-permissions': !hasButton('panel_add')}" @click="jumpAndOpen('panel')">{{$t('guide.addPanel')}}</button>
          <button class="guide__btn" type="button" :class="{'nz-btn-permissions': !hasButton('panel_chart_add')}" @click="jumpAndOpen('chart')">{{$t('guide.addChart')}}</button>
        </div>
      </template>
      <template v-if="activeIndex === 5">
        <div class="desc-text">{{$t('guide.alertTip')}}</div>
        <div class="guide__btn-group">
          <button class="guide__btn" type="button" :class="{'nz-btn-permissions': !hasButton('alertRule_add')}" @click="jumpAndOpen('alertRule')">{{$t('guide.addAlertRule')}}</button>
        </div>
      </template>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'guide',
  props: {
    showDialog: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      visible: false,
      activeIndex: 0, // 当前激活的guideList的index
      guideList: [
        {
          route: '/dc',
          title: this.$t('guide.dc'),
          icon: 'nz-icon nz-icon-datacenter1',
          tip: this.$t('guide.dcTip'),
          buttonPermissions: 'dc_add'
        },
        {
          route: '/agent',
          title: this.$t('guide.agent'),
          icon: 'nz-icon nz-icon-agent',
          tip: this.$t('guide.agentTip'),
          buttonPermissions: 'agent_add'
        },
        {
          route: '/asset',
          title: this.$t('guide.asset'),
          icon: 'nz-icon nz-icon-menu-assets',
          tip: this.$t('guide.assetTip'),
          buttonPermissions: 'asset_add'
        },
        {
          route: '/monitor/project',
          title: this.$t('guide.monitor'),
          icon: 'nz-icon nz-icon-menu-project',
          tip: this.$t('guide.monitorTip'),
          buttonPermissions: 'project_add'
        },
        {
          route: '/panel',
          title: this.$t('guide.visualization'),
          icon: 'nz-icon nz-icon-visualization',
          tip: this.$t('guide.visualizationTip'),
          buttonPermissions: 'panel_add'
        },
        {
          route: '/alertRule',
          title: this.$t('guide.alert'),
          icon: 'nz-icon nz-icon-menu-alert',
          tip: this.$t('guide.alertTip'),
          buttonPermissions: "alertRule_add"
        }
      ],
      interval: null
    }
  },
  methods: {
    close () {
      this.$emit('close')
    },
    enter (index) {
      this.interval = setInterval(() => {
        this.activeIndex = index
      }, 300)
    },
    leave (index) {
      this.interval && clearInterval(this.interval)
    },
    downloadAgent () {
      this.$emit('close')
      this.$router.push({
        path: '/agent',
        query: {
          t: +new Date(),
          download: 'agent'
        }
      })
    },
    openTerminal () {
      this.$emit('close')
      this.$router.push({
        path: '/asset',
        query: {
          t: +new Date()
        }
      })
      this.$store.commit('openConsole')
    },
    jump (route) {
      let buttonPermissions = true
      this.guideList.forEach(ele => {
        if (!this.hasButton(ele.buttonPermissions)){
          buttonPermissions = false
        }
      })
      if (!buttonPermissions){
        return
      }
      this.$emit('close')
      this.$router.push({
        path: route,
        query: {
          t: +new Date()
        }
      })
    },
    jumpAndOpen (cmd, open) {
      this.$emit('close')
      switch (cmd) {
        case 'dc': {
          this.$router.push({
            path: '/dc',
            query: {
              t: +new Date(),
              add: 'dc'
            }
          })
          break
        }
        case 'agent': {
          this.$router.push({
            path: '/agent',
            query: {
              t: +new Date(),
              add: 'agent'
            }
          })
          break
        }
        case 'asset': {
          this.$router.push({
            path: '/asset',
            query: {
              t: +new Date(),
              add: 'asset'
            }
          })
          break
        }
        case 'importAsset': {
          this.$router.push({
            path: '/asset',
            query: {
              t: +new Date(),
              importAsset: 'importAsset'
            }
          })
          break
        }
        case 'project': {
          this.$router.push({
            path: '/monitor/project',
            query: {
              t: +new Date(),
              add: 'project'
            }
          })
          break
        }
        case 'module': {
          this.$router.push({
            path: '/monitor/module',
            query: {
              t: +new Date(),
              add: 'module'
            }
          })
          break
        }
        case 'endpoint': {
          this.$router.push({
            path: '/monitor/endpoint',
            query: {
              t: +new Date(),
              add: 'endpoint'
            }
          })
          break
        }
        case 'importEndpoint': {
          this.$router.push({
            path: '/monitor/endpoint',
            query: {
              t: +new Date(),
              importEndpoint: 'importEndpoint'
            }
          })
          break
        }
        case 'panel': {
          this.$router.push({
            path: '/panel',
            query: {
              t: +new Date(),
              add: 'panel'
            }
          })
          break
        }
        case 'chart': {
          this.$router.push({
            path: '/panel',
            query: {
              t: +new Date(),
              add: 'chart'
            }
          })
          break
        }
        case 'alertRule': {
          this.$router.push({
            path: '/alertRule',
            query: {
              t: +new Date(),
              add: 'alertRule'
            }
          })
          break
        }
        case 'cabinet': {
          this.$router.push({
            path: '/dc',
            query: {
              t: +new Date(),
              add: 'cabinet'
            }
          })
          break
        }
        default: break
      }
      // location.reload()
    }
  },
  watch: {
    showDialog (n, o) {
      this.visible = n
    },
    activeIndex (n) {
      this.$refs.guideShadow.style.left = `${n * this.$refs.guideShadow.offsetWidth}px`
    }
  }
}
</script>

<style lang="scss">
.guild-pop {
  .el-dialog__header {
    padding: 22px;
    background-color: var(--theme-color-light-10);
    text-align: center;

    .el-dialog__title {
      color: white;
      font-size: 24px;
    }

    .el-dialog__headerbtn {
      top: 29px;

      i {
        color: white;
        font-size: 24px;
      }
    }
  }

  .el-dialog__body {
    display: flex;
    flex-direction: column;
    padding: 30px 30px 43px;
    box-sizing: border-box;

    .guide-list {
      display: flex;
      position: relative;
      width: 100%;
      height: 170px;

      .guide-shadow {
        position: absolute;
        height: 100%;
        width: 16.67%;
        top: -1px;
        left: 0;
        transition: all linear .3s;
        border-bottom: 3px solid #101B27;
        background-color: #F6F6F6;
      }

      .guide-shadow:after {
        position: absolute;
        z-index: 11;
        content: '';
        border-style: solid;
        transition-duration: .3s;
        transition-property: bottom;
        left: calc(50% - 6px);
        bottom: -9px;
        border-width: 6px 6px 0;
        border-color: #424242 transparent transparent transparent;
      }

      .guide-item {
        flex: 1;
        position: relative;

        &:not(:nth-of-type(2)):before {
          top: 100px;
          width: 50%;
          height: 2px;
          background-color: #d8d8d8;
          position: absolute;
          left: 0;
          content: "";
        }
        &:not(:last-of-type):after {
          top: 100px;
          width: 50%;
          height: 2px;
          background-color: #d8d8d8;
          position: absolute;
          right: 0;
          content: "";
        }

        &.guide-item--active {
          .item__title {
            color: #101B27;
            font-weight: bold;
          }
          .item__icon {
            border-color: #ABABAB;
            background-color: white;
            cursor: pointer;
            i {
              color: #ABABAB;
            }
          }
        }
        .item__title {
          padding-top: 20px;
          color: #666;
          text-align: center;
          font-size: 16px;
          transition: all linear .3s;
        }
        .item__icon {
          position: relative;
          top: 23px;
          left: 50%;
          transform: translateX(-50%);
          height: 62px;
          width: 62px;
          border: 1px solid #E0E0E0;
          border-radius: 50%;
          box-sizing: border-box;
          background-color: #F6F6F6;
          transition: all linear .3s;
          z-index: 1;

          i {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: #BEBEBE;
            font-size: 30px;
            transition: all linear .3s;
          }
        }
      }
    }
    .guide-desc {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 200px;
      padding-bottom: 32px;
      box-sizing: border-box;
      border: 1px solid #999;

      .desc-text {
        flex: auto;
        padding: 0 30px;

        display: flex;
        align-items: center;
        color: #101B27;
        font-size: 18px;
        word-break: keep-all;
      }

      .guide__btn-group {
        display: flex;
        justify-content: center;
        height: 46px;

        .guide__btn {
          margin: 0 15px;
          padding: 0 15px;
          height: 100%;
          color: white;
          border: none;
          border-radius: $--primary-border-radius;
          background-color: #666;
          font-size: 18px;
          outline: none;
          cursor: pointer;
          opacity: 1;
          transition: all linear .2s;
        }
        .guide__btn:hover {
          opacity: .9;
        }
        .nz-btn-permissions {
          pointer-events: none;
          cursor: default;
          opacity: 0.4;
        }
      }
    }
  }
}
</style>
