<template>
  <div class="sub-box detail-view-sub-box">
      <div class="sub-list__tabs">
      <!--机柜-->
      <cabinet-tab :showTitle="false" v-if="from === fromRoute.dc && targetTab === 'cabinet'" :tabs="tabs.dc.cabinet" v-show="subResizeShow" :obj="obj" @changeTab="changeTab" :targetTab="targetTab"></cabinet-tab>
      <alertMessageTabNew :showTitle="false" v-if="from === fromRoute.dc && targetTab === 'alertMessageTab'" v-show="subResizeShow" :from="from" :obj="obj" :tabs="tabs.dc.alertMessage" :targetTab="targetTab" @changeTab="changeTab"></alertMessageTabNew>
      <!--告警信息-->
      <alert-message-tab :showTitle="false" v-if="((from === fromRoute.alertRule || from === fromRoute.asset || from === fromRoute.endpoint || from === fromRoute.project ) && targetTab === 'alertMessage')" v-show="subResizeShow" :from="from" :obj="obj" @changeTab="changeTab" :targetTab="targetTab"></alert-message-tab>

      <!--terminal-log的记录和回放-->
      <terminal-log-cmd-tab :showTitle="false" v-if="from === fromRoute.terminalLog && targetTab === 'cmdTab'" :from="from" :obj="obj" :tabs="hasTerminalLogTabs" @changeTab="changeTab" :targetTab="targetTab"></terminal-log-cmd-tab>
      <terminal-log-sftp-tab :showTitle="false" v-if="from === fromRoute.terminalLog && targetTab === 'sftpTab' && obj.protocol == 'SSH'" :from="from" :obj="obj" :tabs="hasTerminalLogTabs" @changeTab="changeTab" :targetTab.sync="targetTab"></terminal-log-sftp-tab>
      <terminal-log-record-tab :showTitle="false" v-if="from === fromRoute.terminalLog && targetTab === 'recordTab'" :from="from" :obj="obj" :tabs="hasTerminalLogTabs" @changeTab="changeTab" :targetTab="targetTab"></terminal-log-record-tab>
      <terminal-log-monitor-tab :showTitle="false" v-if="from === fromRoute.terminalLog && targetTab === 'monitorTab'" :from="from" :obj="obj" :tabs="tabs.terminalLog.monitor" @changeTab="changeTab" @exit="closeSubList" :targetTab="targetTab"></terminal-log-monitor-tab>

      <asset-tab :showTitle="false" v-if="from === fromRoute.dc && targetTab === 'asset'" :tabs="tabs.dc.asset" ref="assetTab" :from="from" :obj="obj" @changeTab="changeTab" @exit="closeSubList" :targetTab="targetTab"></asset-tab>

      <!--user列表的两个日志-->
      <operation-log-tab :showTitle="false" v-if="from === fromRoute.user && targetTab === 'operationLogTab'" :from="from" :obj="obj" :tabs="tabs.user.operationLog" @changeTab="changeTab" :targetTab="targetTab"></operation-log-tab>
      <terminal-log-tab :showTitle="false" v-if="from === fromRoute.user && targetTab === 'terminalLogTab'" :from="from" :obj="obj" :tabs="tabs.user.terminalLog" @changeTab="changeTab" :targetTab="targetTab"></terminal-log-tab>
      <!-- asset列表的3个 -->
      <dashboard-tab @getTableData="getTableData" :paramsType="'asset'" :showTitle="false" v-if="from === fromRoute.asset && targetTab === 'dashboardTab'" v-show="subResizeShow" :from="from" :obj="obj" :tabs="assetTabs" :targetTab.sync="targetTab" @changeTab="changeTab"></dashboard-tab>
      <alertMessageTabNew :showTitle="false" v-if="from === fromRoute.asset && targetTab === 'alertMessageTab'" v-show="subResizeShow" :from="from" :obj="obj" :tabs="assetTabs" :targetTab="targetTab" @changeTab="changeTab"></alertMessageTabNew>
      <endpointTabNew :showTitle="false" v-if="from === fromRoute.asset && targetTab === 'endpointTab'" v-show="subResizeShow" :from="from" :obj="obj" :tabs="assetTabs" :targetTab="targetTab" @changeTab="changeTab"></endpointTabNew>
      <log-bottom-tab :showTitle="false" v-if="from === fromRoute.asset && targetTab === 'log'" v-show="subResizeShow" :from="from" :obj="obj" :tabs="assetTabs" :targetTab.sync="targetTab" @changeTab="changeTab"></log-bottom-tab>
      <assetSubTab :showTitle="false" v-if="from === fromRoute.asset && targetTab === 'assetSubTab' && obj.childrenNum" v-show="subResizeShow" :from="from" :obj="obj" :tabs="assetTabs" :targetTab="targetTab" @changeTab="changeTab"></assetSubTab>
      <process-bottom-tab :showTitle="false" v-if="from === fromRoute.asset && targetTab === 'process' && obj.clientState == '1'" v-show="subResizeShow" :from="from" :obj="obj" :tabs="assetTabs" :targetTab="targetTab" @changeTab="changeTab"></process-bottom-tab>
      <network-bottom-tab :showTitle="false" v-if="from === fromRoute.asset && targetTab === 'network' && obj.clientState == '1'" v-show="subResizeShow" :from="from" :obj="obj" :tabs="assetTabs" :targetTab.sync="targetTab" @changeTab="changeTab"></network-bottom-tab>
      <comments-bottom-tab :showTitle="false" v-if="from === fromRoute.asset && targetTab === 'comments'" v-show="subResizeShow" :from="from" :obj="obj" :tabs="assetTabs" @changeTab="changeTab" :targetTab.sync="targetTab"></comments-bottom-tab>
      <vsys-bottom-tab :showTitle="false" v-if="from === fromRoute.asset && targetTab === 'vsys' && obj.model.tsgAppliance == '1'"  v-show="subResizeShow" :from="from" :obj="obj" :tabs="assetTabs" :targetTab.sync="targetTab" @changeTab="changeTab"></vsys-bottom-tab>
      <!--module列表的tab-->
      <endpointTabNew :showTitle="false" v-if="from === fromRoute.module && targetTab === 'endpoint'" v-show="subResizeShow" :from="from" :obj="obj" :tabs="tabs.module.moduleTabTitle" :targetTab="targetTab" @changeTab="changeTab"></endpointTabNew>
      <alertMessageTabNew :showTitle="false" v-if="from === fromRoute.module && targetTab === 'moduleAlertMessage'" v-show="subResizeShow" :from="from" :obj="obj" :tabs="tabs.module.moduleTabTitle" @changeTab="changeTab" :targetTab="targetTab"></alertMessageTabNew>
      <dashboard-tab @getTableData="getTableData" :paramsType="'module'" :showTitle="false" v-if="from === fromRoute.module && targetTab === 'dashboardTab'" v-show="subResizeShow" :from="from" :obj="obj" :tabs="tabs.module.moduleTabTitle" :targetTab.sync="targetTab" @changeTab="changeTab"></dashboard-tab>
      <!--endpoint列表的tab-->
      <dashboard-tab :showTitle="false" v-if="from === fromRoute.endpoint && targetTab === 'dashboardTab'" v-show="subResizeShow" :from="from" :obj="obj" :paramsType="'endpoint'" :tabs="endpointTabs" :targetTab.sync="targetTab" @changeTab="changeTab" @getTableData="getTableData"></dashboard-tab>
      <endpointQuery :showTitle="false" v-if="from === fromRoute.endpoint && targetTab === 'endpointQuery'" v-show="subResizeShow" :from="from" :obj="obj" :tabs="endpointTabs" :targetTab.sync="targetTab" @changeTab="changeTab"></endpointQuery>
      <log-bottom-tab :showTitle="false" v-if="from === fromRoute.endpoint && targetTab === 'log' && hasLogConfig" v-show="subResizeShow" :from="from" :obj="obj" :tabs="endpointTabs" :targetTab.sync="targetTab" @changeTab="changeTab"></log-bottom-tab>
      <alertMessageTabNew  :showTitle="false" v-if="from === fromRoute.endpoint && targetTab === 'endpointAlertMessage'" v-show="subResizeShow" :from="from" :obj="obj" :tabs="endpointTabs" :targetTab="targetTab" @changeTab="changeTab"></alertMessageTabNew>
      <!--chartTemp的Tab-->
      <dashboard-tab @getTableData="getTableData"  :paramsType="'template'" :showTitle="false" v-if="from === fromRoute.chartTemp && targetTab === 'dashboardTab'" v-show="subResizeShow" :from="from" :obj="obj" :tabs="tabs.chartTemp.chartTempTabTitle" :targetTab.sync="targetTab" @changeTab="changeTab"></dashboard-tab>
       <!--alertRule Tab-->
       <alertMessageTabNew v-if="from === fromRoute.alertRule && targetTab === 'alertRuleAlertMessage'" v-show="subResizeShow" :from="from" :obj="obj" :tabs="tabs.alertRule.alertRule" @changeTab="changeTab" :targetTab.sync="targetTab"></alertMessageTabNew>
       <alertRuleEvalLog v-if="from === fromRoute.alertRule && targetTab === 'evalLog'" v-show="subResizeShow" :from="from" :obj="obj" :tabs="tabs.alertRule.alertRule" @changeTab="changeTab" :targetTab.sync="targetTab"></alertRuleEvalLog>
       <!--model 下滑-->
      <asset-tab :showTitle="false" v-if="(from === fromRoute.model) && targetTab === 'asset'" :tabs="tabs.model" ref="assetTab" :from="from" :obj="obj" @changeTab="changeTab" @exit="closeSubList" :targetTab="targetTab"></asset-tab>
    </div>
  </div>
</template>

<script>
import cabinetTab from '@/components/common/bottomBox/tabs/cabinetTab'
import alertMessageTab from '@/components/common/bottomBox/tabs/alertMessageTab'
import alertMessageTabNew from '@/components/common/bottomBox/tabs/alertMessageTabNew'
import alertRuleEvalLog from '@/components/common/bottomBox/tabs/alertRuleEvalLog'
import assetSubTab from '@/components/common/bottomBox/tabs/assetSubTab'
import commentsBottomTab from '@/components/common/bottomBox/tabs/commentsBottomTab'
import vsysBottomTab from '@/components/common/bottomBox/tabs/vsysBottomTab'
import endpointQuery from '@/components/common/bottomBox/tabs/endpointQuery'
import endpointTabNew from '@/components/common/bottomBox/tabs/endpointTabNew'
import dashboardTab from '@/components/common/bottomBox/tabs/dashboardTab'
import terminalLogRecordTab from '@/components/common/bottomBox/tabs/terminalLogRecordTab'
import terminalLogSftpTab from '@/components/common/bottomBox/tabs/terminalLogSftpTab'
import terminalLogMonitorTab from '@/components/common/bottomBox/tabs/terminalLogMonitorTab'
import terminalLogCMDTab from '@/components/common/bottomBox/tabs/terminalLogCMDTab'
import operationLogTab from '@/components/common/bottomBox/tabs/operationLogTab'
import terminalLogTab from '@/components/common/bottomBox/tabs/terminalLogTab'
import assetTab from '@/components/common/bottomBox/tabs/assetTab'
import { fromRoute } from '@/components/common/js/constants'
import LogBottomTab from '@/components/common/bottomBox/tabs/logBottomTab'
import processBottomTab from '@/components/common/bottomBox/tabs/processBottomTab'
import networkBottomTab from '@/components/common/bottomBox/tabs/networkBottomTab'
import detailRightTop from './detailRightTop/detailRightTop'
import routerPathParams from '@/components/common/mixin/routerPathParams'

export default {
  name: 'detailViewRight',
  mixins: [routerPathParams],
  components: {
    LogBottomTab,
    cabinetTab,
    alertMessageTab,
    terminalLogRecordTab,
    terminalLogSftpTab,
    terminalLogMonitorTab,
    operationLogTab,
    terminalLogTab,
    'terminal-log-cmd-tab': terminalLogCMDTab,
    endpointTabNew,
    alertMessageTabNew,
    endpointQuery,
    dashboardTab,
    assetTab,
    assetSubTab,
    'detail-right-top': detailRightTop,
    alertRuleEvalLog,
    processBottomTab,
    networkBottomTab,
    commentsBottomTab,
    vsysBottomTab
  },
  props: {
    isFullScreen: Boolean, // 是否全屏
    subResizeShow: {
      type: Boolean,
      default: true
    }, // resize时，用v-show="subResizeShow"控制页面内容是否显示
    obj: Object, // 关联的实体对象
    from: String, // 来自哪个页面
    tabList: Array // 动态页签列表
    // targetTab: String // 展示哪个页签
  },
  watch: {
    from: {
      immediate: true,
      handler (n) {
        this.setTargetTab(true)
      }
    },
    obj: {
      immediate: true,
      handler (n) {
        this.setTargetTab()
      }
    }
  },
  data () {
    return {
      fromRoute: fromRoute,
      targetTab: '',
      tabs: {
        terminalLog: {
          monitor: [
            { prop: 'monitorTab', name: this.$t('config.terminallog.monitor.monitor'), active: true }
          ]
          // cmd: [
          //   { prop: 'cmdTab', name: this.$t('config.terminallog.cmd.cmd'), active: true },
          //   { prop: 'recordTab', name: this.$t('config.terminallog.record.record'), active: false }
          // ],
          // record: [
          //   { prop: 'cmdTab', name: this.$t('config.terminallog.cmd.cmd'), active: false },
          //   { prop: 'recordTab', name: this.$t('config.terminallog.record.record'), active: true }
          // ]
        },
        user: {
          operationLog: [
            { prop: 'operationLogTab', name: this.$t('profile.operationRecord'), active: true },
            { prop: 'terminalLogTab', name: this.$t('overall.terminallog'), active: false }
          ],
          terminalLog: [
            { prop: 'operationLogTab', name: this.$t('profile.operationRecord'), active: false },
            { prop: 'terminalLogTab', name: this.$t('overall.terminallog'), active: true }
          ]
          // module tab
        },
        asset: {
          assetTabTitle: [
            { prop: 'dashboardTab', name: this.$t('overall.dashboard') },
            { prop: 'alertMessageTab', name: this.$t('overall.alert') },
            { prop: 'endpointTab', name: this.$t('asset.endpoint') },
            { prop: 'log', name: this.$t('dashboard.dashboard.chartForm.typeVal.log.label') }
          ]
        },
        module: {
          moduleTabTitle: [
            { prop: 'endpoint', name: this.$t('asset.endpoint') },
            { prop: 'moduleAlertMessage', name: this.$t('overall.alert') }
          ]
        },
        endpoint: {
          endpointTabTitle: [
            { prop: 'dashboardTab', name: this.$t('overall.dashboard') },
            { prop: 'endpointAlertMessage', name: this.$t('overall.alert') },
            { prop: 'endpointQuery', name: this.$t('overall.metric') },
            { prop: 'log', name: this.$t('dashboard.dashboard.chartForm.typeVal.log.label') }
          ]
        },
        chartTemp: {
          chartTempTabTitle: [
            { prop: 'dashboardTab', name: this.$t('overall.tempPrev') }
          ]
        },
        alertRule: {
          alertRule: [
            { prop: 'alertRuleAlertMessage', name: this.$t('overall.alert') },
            { prop: 'evalLog', name: this.$t('overall.alertRuleEvalLog') }
          ]
        },
        model: [
          { prop: 'asset', name: this.$t('asset.asset'), active: true }
        ],
        dc: {
          cabinet: [
            { prop: 'cabinet', name: this.$t('asset.cabinet'), active: true },
            { prop: 'asset', name: this.$t('asset.asset'), active: false },
            { prop: 'alertMessageTab', name: this.$t('overall.alert'), active: false }
          ],
          asset: [
            { prop: 'cabinet', name: this.$t('asset.cabinet'), active: false },
            { prop: 'asset', name: this.$t('asset.asset'), active: true },
            { prop: 'alertMessageTab', name: this.$t('overall.alert'), active: false }
          ],
          alertMessage: [
            { prop: 'cabinet', name: this.$t('asset.cabinet'), active: false },
            { prop: 'asset', name: this.$t('asset.asset'), active: false },
            { prop: 'alertMessageTab', name: this.$t('overall.alert'), active: true }
          ]
        }

      }
    }
  },
  computed: {
    hasTerminalLogTabs () {
      const hasSftp = this.obj && this.obj.protocol == 'SSH'
      const tabs = [
        { prop: 'cmdTab', name: this.$t('config.terminallog.cmd.cmd') },
        { prop: 'recordTab', name: this.$t('config.terminallog.record.record') }
      ]
      if (hasSftp) {
        tabs.splice(1, 0, { prop: 'sftpTab', name: 'SFTP ' })
      }
      return tabs
    },
    hasLogConfig () {
      const config = this.obj.configs.find(c => c.type === 'logs')
      return config && config.enable === 1
    },
    assetTabs () {
      const hasSub = this.obj && this.obj.childrenNum
      const hasProcess = this.obj && this.obj.clientState == '1'
      const hasVays = this.obj && this.obj.model && this.obj.model.tsgAppliance == '1'
      const tabs = [
        { prop: 'dashboardTab', name: this.$t('overall.dashboard') },
        { prop: 'alertMessageTab', name: this.$t('overall.alert') },
        { prop: 'endpointTab', name: this.$t('asset.endpoint') },
        { prop: 'log', name: this.$t('dashboard.dashboard.chartForm.typeVal.log.label') }
      ]
      if (hasSub) {
        tabs.push({ prop: 'assetSubTab', name: this.$t('overall.assetSubTab') })
      }
      if (hasProcess) {
        tabs.push({ prop: 'process', name: this.$t('overall.process') }, { prop: 'network', name: this.$t('overall.network') })
      }
      tabs.push({ prop: 'comments', name: this.$t('overall.comments') })
      if (hasVays) {
        tabs.push({ prop: 'vsys', name: this.$t('asset.vsys') })
      }

      return tabs
    },
    endpointTabs () {
      const config = this.obj.configs.find(c => c.type === 'logs')
      const hasLog = config && config.enable === 1
      const tabs = [
        { prop: 'dashboardTab', name: this.$t('overall.detail') },
        { prop: 'endpointAlertMessage', name: this.$t('overall.alert') },
        { prop: 'endpointQuery', name: this.$t('overall.metrics') }
      ]
      if (hasLog) {
        tabs.push({ prop: 'log', name: this.$t('dashboard.dashboard.chartForm.typeVal.log.label') })
      }
      return tabs
    }
  },
  methods: {
    exitFullScreen () {
      this.$emit('exitFullScreen')
      this.$nextTick(() => { this.afterResize() })
    },
    fullScreen () {
      this.$emit('fullScreen')
      this.$nextTick(() => { this.afterResize() })
    },
    closeSubList () {
      this.$emit('closeSubList')
    },
    listResize (e) {
      this.$emit('listResize', e)
      this.$nextTick(() => { this.afterResize() })
    },
    changeTab (tab) {
      this.targetTab = tab
      this.$nextTick(() => {
        this.updatePath(this.$route.query, this.$route.path, 'bottomBox')
      })
    },
    afterResize () {
      if (this.from === this.fromRoute.endpoint && this.targetTab === 'endpointQuery') {
        this.$refs.endpointQuery.tableReload()
      } else if (this.from === this.fromRoute.terminalLog && this.targetTab === 'record') {
        setTimeout(() => {
          this.$refs.reminalLogRecordTab.consoleResize()
        }, 600)
      }
    },
    getTableData () {
      this.$emit('getTableData')
    },
    setTargetTab (flag) {
      if (this.$route.query.targetTab && flag) {
        this.$nextTick(() => {
          this.targetTab = this.$route.query.targetTab
        })
        return
      }
      if (this.from === fromRoute.asset) {
        this.targetTab = 'dashboardTab'
      } else if (this.from === fromRoute.endpoint) {
        this.targetTab = 'dashboardTab'
      } else if (this.from === fromRoute.module) {
        this.targetTab = 'endpoint'
      } else if (this.from === fromRoute.alertRule) {
        this.targetTab = 'alertRuleAlertMessage'
      } else if (this.from === fromRoute.dc) {
        this.targetTab = 'cabinet'
      } else if (this.from === fromRoute.terminalLog) {
        this.targetTab = 'cmdTab'
      } else if (this.from === fromRoute.user) {
        this.targetTab = 'operationLogTab'
      }
      this.updatePath(this.$route.query, this.$route.path, 'bottomBox')
    }
  }
}
</script>
