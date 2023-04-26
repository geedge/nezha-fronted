<template>
  <div>
    <el-tabs v-model="activeName" type="card" v-if="!nodata">
      <el-tab-pane v-for="item in cardNames" :label="item.label" :name="item.key" :key="item.key">
        <div v-if="item.key === 'detail' && activeName === 'detail'">
          <alert-message-info-detail :info-data="infoData"/>
        </div>
        <div v-else-if="item.key === 'dashboard' && activeName === 'dashboard'" class="alert-message-info-dashboard">
          <dashboard :temp-id="infoData.alertRule.dashboardId" :showImport="false" :showName="false" :url-type="'dashboard'" :time="timeRange" :from="fromRoute.dashboard"></dashboard>
        </div>
        <div v-else-if="(activeName === item.key) && infoData[item.key]" class="no-position-alert-label">
<!--          <searchItemInfo :obj="findData(item.key)" :severityData="severityData" :fa-loading="false"></searchItemInfo>-->
          <alertLabel
            class="alert"
            v-if="item.key !=='alertRule'"
            :id="infoData[item.key].id"
            :that="findData2(item.key)"
            :alertTableDialog="true"
            :type="item.key"/>
          <alertRuleInfo
            class="alert"
            v-else
            :id="infoData[item.key].id"
            :severity-data="severityData"
            :that="findData2(item.key)"
          />
        </div>
        <div v-else-if="item.key === 'trbShot' && activeName === 'trbShot'">
          <div v-html="infoData.alertRule.trbShot" v-if="infoData.alertRule.trbShot">
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
    <div v-else class="table-no-data">
      <svg class="icon" aria-hidden="true">
        <use xlink:href="#nz-icon-no-data-list"></use>
      </svg>
      <div class="table-no-data__title">No results found</div>
    </div>
  </div>
</template>

<script>
import alertMessageInfoDetail from '@/components/common/alert/alertMessageInfoDetail'
import searchItemInfo from '@/components/common/globalSearch/searchItemInfo'
import alertLabel from '@/components/common/alert/alertLabel3'
import alertRuleInfo from '@/components/common/alert/alertRuleInfo2'
import dashboard from '@/components/page/integration/integration-tabs/dashboard'
import { fromRoute } from '@/components/common/js/constants'
// import alertLabelMixin from '@/components/common/mixin/alertLabelMixin'
export default {
  name: 'alertMessageInfoTab',
  components: {
    alertMessageInfoDetail,
    searchItemInfo,
    alertLabel,
    alertRuleInfo,
    dashboard
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
    time: {}
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
        key: 'endpoint',
        label: this.$t('asset.endpoint')
      }, {
        key: 'module',
        label: this.$t('overall.module')
      }, {
        key: 'project',
        label: this.$t('project.project.projectName')
      }],
      timeRange: []
    }
  },
  watch: {
    infoData: {
      immediate: true,
      handler (n) {
        if (n) {
          this.cardNames = [{
            key: 'detail',
            label: this.$t('overall.detail')
          }]
          this.sysArr.forEach(item => {
            if (n[item.key]) {
              this.cardNames.push(item)
            }
          })
          // && n.alertRule.dashboardId
          n.alertRule && (n.alertRule.dashboardId = 102224)
          if (n.alertRule && n.alertRule.dashboardId) {
            //
            this.cardNames.push({
              key: 'dashboard',
              label: this.$t('overall.dashboard')
            })
          }
          if (n.alertRule && n.alertRule.trbShot && n.alertRule.trbShot != '<div  class="editor-core ql-container ql-snow"><div class="ql-editor"><p><br></p></div></div>') {
            this.cardNames.push({
              key: 'trbShot',
              label: this.$t('alert.config.trbShot')
            })
          }
        }
      }
    },
    time: {
      immediate: true,
      handler (n) {
        if (n && n.length) {
          this.timeRange = [n[0] * 1000, n[1] * 1000]
        }
      }
    }
  },
  mounted () {

  },
  methods: {
    findData (key) {
      if (key) {
        const obj = {
          ...this.$loadsh.cloneDeep(this.infoData[key]),
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
          ...this.$loadsh.cloneDeep(this.infoData[key]),
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
