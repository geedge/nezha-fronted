<template>
  <div>
    <div class="alert-message-info-tool">
      <button class="top-tool-btn" v-if="activeName==='asset'" @click="snapshot">
        <i class="nz-icon nz-icon-kuaizhao" style="fontSize:16px;"></i>
      </button>
      <el-dropdown trigger="click" size="small" class="nz-el-dropdown" v-if="infoData.alertRule&&infoData.alertRule.param.dataLink.length">
        <button class="top-tool-btn  margin-l-10">
          <i class="nz-icon nz-icon-wailian"></i>
        </button>
        <el-dropdown-menu slot="dropdown" class="right-box-select-top right-public-box-dropdown-top nz-el-dropdown-menu">
          <el-dropdown-item v-for="(item,index) in infoData.alertRule.param.dataLink" :key="index">
            <div @click="linkClick(item)" class="alert-message-dataLink">
              <i class="nz-icon nz-icon-link"></i>
              <span>{{item.title}}</span>
            </div>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <el-tabs v-model="activeName" v-if="!nodata">
      <el-tab-pane v-for="item in cardNames" :label="item.label" :name="item.key" :key="item.key">
        <div v-if="item.key === 'detail' && activeName === 'detail'">
          <alert-message-info-detail v-my-loading="loading" :info-data="infoData" :now-time="nowTime"/>
          <ul class="messgae-info-list">
            <alertDetail
              v-for="(item,index) in detailArr" :key="index"
              :id="infoData[item.key].id"
              :severity-data="severityData"
              :that="findData2(item.key)"
              :type="item.key"
            />
          </ul>
        </div>
        <div v-else-if="item.key === 'asset' && activeName === 'asset'" class="alert-message-info-dashboard">
          <dashboard
            ref="dashboard"
            :temp-id="infoData.assetId"
            :showImport="false"
            :showName="false"
            :url-type="'asset'"
            :time="timeRange"
            :from="fromRoute.alertMessage"
            :chartDetailInfo="infoData.asset"
            class="message-info-dashboard">
          </dashboard>
        </div>
        <!-- <div v-else-if="item.key === 'dashboard' && activeName === 'dashboard'" class="alert-message-info-dashboard">
          <dashboard :temp-id="infoData.alertRule.dashboardId" :showImport="false" :showName="false" :url-type="'dashboard'" :time="timeRange" class="message-info-dashboard" :from="fromRoute.dashboard"></dashboard>
        </div> -->
        <div v-else-if="item.key === 'trbShot' && activeName === 'trbShot'">
          <div class="rich-text-editor" v-html="infoData.alertRule.trbShot" v-if="infoData.alertRule.trbShot"></div>
        </div>
      </el-tab-pane>
    </el-tabs>
    <div v-else class="table-no-data">
      <svg class="icon" aria-hidden="true">
        <use xlink:href="#nz-icon-no-data-list"></use>
      </svg>
      <div class="table-no-data__title">No results found</div>
    </div>
    <!-- 快照进度 -->
    <snapshotProgress v-if="snapshotVisible" :showPanel="showPanel" :searchTime="timeRange" :snapshotVisible.sync="snapshotVisible" api="dashboard"></snapshotProgress>
  </div>
</template>

<script>
import alertMessageInfoDetail from '@/components/common/alert/alertMessageInfoDetail'
import alertDetail from '@/components/common/alert/alertDetail'
import dashboard from '@/components/page/integration/integration-tabs/dashboard'
import { fromRoute } from '@/components/common/js/constants'
import snapshotProgress from '@/components/common/snapshotProgress/snapshotProgress.vue'
// import alertLabelMixin from '@/components/common/mixin/alertLabelMixin'
export default {
  name: 'alertMessageInfoTab',
  components: {
    alertMessageInfoDetail,
    alertDetail,
    dashboard,
    snapshotProgress // 快照进度
  },
  // mixins: [alertLabelMixin],
  props: {
    infoData: {
      type: Object
    },
    nodata: {
      type: Boolean,
      default: false
    },
    time: {},
    nowTime: {
      type: String
    },
    loading: Boolean
  },
  computed: {
    severityData () {
      return this.$store.getters.severityData
    }
  },
  data () {
    return {
      fromRoute,
      activeName: 'detail',
      cardNames: [{
        key: 'detail',
        label: this.$t('overall.detail')
      }],
      sysArr: [{
        key: 'alertRule',
        label: this.$t('alert.rule')
      }, {
        key: 'dc',
        label: this.$t('overall.dc')
      }, {
        key: 'asset',
        label: this.$t('asset.asset')
      }, {
        key: 'project',
        label: this.$t('project.project.projectName')
      }, {
        key: 'module',
        label: this.$t('overall.module')
      }, {
        key: 'endpoint',
        label: this.$t('asset.endpoint')
      }],
      detailArr: [],
      timeRange: [],
      snapshotVisible: false,
      showPanel: {}
    }
  },
  watch: {
    infoData: {
      immediate: true,
      handler (n) {
        if (n) {
          if (n.alertRule && !n.alertRule.param) {
            n.alertRule.param = {
              dataLink: []
            }
          } else if (n.alertRule) {
            n.alertRule.param = JSON.parse(n.alertRule.param)
          }
          this.cardNames = [{
            key: 'detail',
            label: this.$t('overall.detail')
          }]
          if (n.assetId && n.assetId !== -1) {
            this.cardNames.push(
              {
                key: 'asset',
                label: this.$t('asset.assetDashboard')
              }
            )
          }
          // && n.alertRule.dashboardId
          // n.alertRule && (n.alertRule.dashboardId = 101534)
          // if (n.alertRule && n.alertRule.dashboardId && n.alertRule.dashboardId != -1) {
          //   //
          //   this.cardNames.push({
          //     key: 'dashboard',
          //     label: this.$t('overall.dashboard')
          //   })
          // }
          if (n.alertRule && n.alertRule.trbShot && n.alertRule.trbShot != '<div  class="editor-core ql-container ql-snow"><div class="ql-editor"><p><br></p></div></div>') {
            this.cardNames.push({
              key: 'trbShot',
              label: this.$t('alert.config.trbShot')
            })
          }

          this.detailArr = []
          this.sysArr.forEach(item => {
            if (n[item.key] && n[item.key].id != -1) {
              this.detailArr.push(item)
            }
          })
        }
      }
    },
    time: {
      immediate: true,
      handler (n) {
        if (n && n.length) {
          this.timeRange = [this.timeFormate(n[0] * 1000), this.timeFormate(n[1] * 1000)]
        }
      }
    }
  },
  mounted () {

  },
  methods: {
    snapshot () {
      this.showPanel = this.$refs.dashboard[0].showPanel
      this.snapshotVisible = true
    },
    linkClick (data) {
      if (data.openIn === 'newTab') {
        window.open(data.url)
      } else {
        window.location.href = data.url
      }
    },
    findData (key) {
      if (key) {
        const obj = {
          ...this.$lodash.cloneDeep(this.infoData[key]),
          type: key
        }
        if (key === 'dc') {
          obj.type = 'datacenter'
        } else if (key === 'alertRule') {
          obj.type = 'alertrule'
        }
        return { ...obj }
      }
    },
    findData2 (key) {
      if (key) {
        const obj = {
          ...this.$lodash.cloneDeep(this.infoData[key]),
          type: key,
          position: {
            top: 0,
            left: 0
          }
        }
        return { ...obj }
      }
    }
  }
}
</script>
