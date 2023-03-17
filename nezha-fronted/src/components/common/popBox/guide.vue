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
        <div :class="{'item__icon--disabled': !hasButton(guide.permissionCode)}" class="item__icon" @click="jump(guide)"><i :class="guide.icon"></i></div>
      </div>
    </div>
    <div class="guide-desc">
      <template v-if="activeIndex === 0">
        <div class="desc-text">{{$t('guide.dcTip')}}</div>
        <div class="guide__btn-group">
          <button :class="{'guide__btn--disabled': !hasButton('dc_add')}" class="guide__btn" type="button" @click="jumpAndOpen('dc')">{{$t('overall.createDatacenter')}}</button>
          <button :class="{'guide__btn--disabled': !hasButton('dc_add')}" class="guide__btn" type="button" @click="jumpAndOpen('cabinet')">{{$t('overall.createCabinet')}}</button>
        </div>
      </template>
      <template v-if="activeIndex === 1">
        <div class="desc-text">{{$t('guide.agentTip')}}</div>
        <div class="guide__btn-group">
          <button :class="{'guide__btn--disabled': !hasButton('agent_add')}" class="guide__btn" type="button" @click="jumpAndOpen('agent')">{{$t('overall.createPrometheusServer')}}</button>
          <button :class="{'guide__btn--disabled': !hasButton('agent_add')}" class="guide__btn" type="button" @click="downloadAgent">{{$t('guide.downloadAgent')}}</button>
        </div>
      </template>
      <template v-if="activeIndex === 2">
        <div class="desc-text">{{$t('guide.assetTip')}}</div>
        <div class="guide__btn-group">
          <button :class="{'guide__btn--disabled': !hasButton('asset_add')}" class="guide__btn" type="button" @click="jumpAndOpen('asset')">{{$t('asset.createAsset')}}</button>
          <button :class="{'guide__btn--disabled': !hasButton('asset_add')}" class="guide__btn" type="button" @click="jumpAndOpen('importAsset')">{{$t('guide.importAsset')}}</button>
          <button :class="{'guide__btn--disabled': !hasButton('asset_add')}" class="guide__btn" type="button" @click="openTerminal">{{$t('guide.webTerminal')}}</button>
        </div>
      </template>
      <template v-if="activeIndex === 3">
        <div class="desc-text">{{$t('guide.monitorTip')}}</div>
        <div class="guide__btn-group">
          <button :class="{'guide__btn--disabled': !hasButton('project_add')}" class="guide__btn" type="button" @click="jumpAndOpen('project')">{{$t('overall.createProject')}}</button>
          <button :class="{'guide__btn--disabled': !hasButton('monitor_module_add')}" class="guide__btn" type="button" @click="jumpAndOpen('module')">{{$t('overall.createModule')}}</button>
          <button :class="{'guide__btn--disabled': !hasButton('monitor_endpoint_add')}" class="guide__btn" type="button" @click="jumpAndOpen('endpoint')">{{$t('guide.addEndpoint')}}</button>
          <button :class="{'guide__btn--disabled': !hasButton('monitor_endpoint_add')}" class="guide__btn" type="button" @click="jumpAndOpen('importEndpoint')">{{$t('guide.importEndpoint')}}</button>
        </div>
      </template>
      <template v-if="activeIndex === 4">
        <div class="desc-text">{{$t('guide.visualizationTip')}}</div>
        <div class="guide__btn-group">
          <button :class="{'guide__btn--disabled': !hasButton('main_add')}" class="guide__btn" type="button" @click="jumpAndOpen('dashboard')">{{$t('dashboard.dashboard.createDashboardTitleSec')}}</button>
          <button :class="{'guide__btn--disabled': !hasButton('main_add')}" class="guide__btn" type="button" @click="jumpAndOpen('chart')">{{$t('overall.createChart')}}</button>
        </div>
      </template>
      <template v-if="activeIndex === 5">
        <div class="desc-text">{{$t('guide.alertTip')}}</div>
        <div class="guide__btn-group">
          <button :class="{'guide__btn--disabled': !hasButton('alertRule_add')}" class="guide__btn" type="button" @click="jumpAndOpen('alertRule')">{{$t('overall.createAlertRule')}}</button>
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
          title: this.$t('overall.dc'),
          icon: 'nz-icon nz-icon-datacenter1',
          tip: this.$t('guide.dcTip'),
          permissionCode: 'dc_view'
        },
        {
          route: '/agent',
          title: this.$t('overall.agent'),
          icon: 'nz-icon nz-icon-agent',
          tip: this.$t('overall.agentTip'),
          permissionCode: 'agent_view'
        },
        {
          route: '/asset',
          title: this.$t('asset.asset'),
          icon: 'nz-icon nz-icon-menu-assets',
          tip: this.$t('guide.assetTip'),
          permissionCode: 'asset_view'
        },
        {
          route: '/project',
          title: this.$t('overall.monitor'),
          icon: 'nz-icon nz-icon-menu-project',
          tip: this.$t('guide.monitorTip'),
          permissionCode: 'project_view'
        },
        {
          route: '/dashboard',
          title: this.$t('guide.visualization'),
          icon: 'nz-icon nz-icon-visualization',
          tip: this.$t('guide.visualizationTip'),
          permissionCode: 'dashboard_view'
        },
        {
          route: '/alertRule',
          title: this.$t('overall.alert'),
          icon: 'nz-icon nz-icon-menu-alert',
          tip: this.$t('guide.alertTip'),
          permissionCode: 'alertRule_view'
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
      if (!this.hasButton('agent_add')) {
        return
      }
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
      if (!this.hasButton('asset_connect')) {
        return
      }
      this.$emit('close')
      this.$router.push({
        path: '/asset',
        query: {
          t: +new Date()
        }
      })
      this.$store.commit('openConsole')
    },
    jump (guide) {
      if (!this.hasButton(guide.permissionCode)) {
        return
      }
      this.$emit('close')
      this.$router.push({
        path: guide.route,
        query: {
          t: +new Date()
        }
      })
    },
    jumpAndOpen (cmd, open) {
      switch (cmd) {
        case 'dc': {
          if (!this.hasButton('dc_add')) {
            return
          }
          this.$emit('close')
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
          if (!this.hasButton('agent_add')) {
            return
          }
          this.$emit('close')
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
          if (!this.hasButton('asset_add')) {
            return
          }
          this.$emit('close')
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
          if (!this.hasButton('asset_add')) {
            return
          }
          this.$emit('close')
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
          if (!this.hasButton('project_add')) {
            return
          }
          this.$emit('close')
          this.$router.push({
            path: '/project',
            query: {
              t: +new Date(),
              add: 'project'
            }
          })
          break
        }
        case 'module': {
          if (!this.hasButton('monitor_module_add')) {
            return
          }
          this.$emit('close')
          this.$router.push({
            path: '/module',
            query: {
              t: +new Date(),
              add: 'module'
            }
          })
          break
        }
        case 'endpoint': {
          if (!this.hasButton('monitor_endpoint_add')) {
            return
          }
          this.$emit('close')
          this.$router.push({
            path: '/endpoint',
            query: {
              t: +new Date(),
              add: 'endpoint'
            }
          })
          break
        }
        case 'importEndpoint': {
          if (!this.hasButton('monitor_endpoint_add')) {
            return
          }
          this.$emit('close')
          this.$router.push({
            path: '/endpoint',
            query: {
              t: +new Date(),
              importEndpoint: 'importEndpoint'
            }
          })
          break
        }
        case 'dashboard': {
          if (!this.hasButton('main_add')) {
            return
          }
          this.$emit('close')
          this.$router.push({
            path: '/dashboard',
            query: {
              t: +new Date(),
              add: 'dashboard'
            }
          })
          break
        }
        case 'chart': {
          if (!this.hasButton('main_add')) {
            return
          }
          this.$emit('close')
          this.$router.push({
            path: '/dashboard',
            query: {
              t: +new Date(),
              add: 'chart'
            }
          })
          break
        }
        case 'alertRule': {
          if (!this.hasButton('alertRule_add')) {
            return
          }
          this.$emit('close')
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
          if (!this.hasButton('dc_add')) {
            return
          }
          this.$emit('close')
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
