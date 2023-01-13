<template>
  <div class="sub-box bottom-box" :style="{height: isFullScreen ? '100%' : ''}">
    <div class="resize-modal">
      <div class="sub-list-resize-copy">一</div>
    </div>
    <!-- 副列表 -->
    <div @mousedown="listResize" class="sub-list-resize" v-if="!isFullScreen">一</div>
    <div class="sub-list">
        <!--窗口大小控制-->
      <div class="sub-list-window-control">
        <!--退出全屏-->
        <div class="window-control-btn" v-if="isFullScreen" @click="exitFullScreen" :id="from+'-bottom-exit-full'" :title="$t('dashboard.screen.exit')"><i class="nz-icon nz-icon-exit-full-screen" ></i></div>
        <!--全屏-->
        <div v-if="!isFullScreen" :id="from+'-bottom-full'" class="window-control-btn" @click="fullScreen" :title="$t('dashboard.screen')"><i class="nz-icon nz-icon-full-screen"></i></div>
        <!--关闭-->
        <div class="window-control-btn" @click="closeSubList" :id="from+'-bottom-close'" :title="$t('overall.close')"><i class="nz-icon nz-icon-close"></i></div>
      </div>

      <!------TAB区------>
      <div class="sub-list__tabs">
        <!--机柜-->
        <cabinet-tab v-if="from === fromRoute.dc && targetTab === 'cabinet'" :tabs="tabs.dc.cabinet" v-show="subResizeShow" :obj="obj" @changeTab="changeTab" :targetTab.sync="targetTab"></cabinet-tab>
        <alertMessageTabNew v-if="from === fromRoute.dc && targetTab === 'alertMessageTab'" v-show="subResizeShow" :from="from" :obj="obj" :tabs="tabs.dc.alertMessage" @changeTab="changeTab" :targetTab.sync="targetTab"></alertMessageTabNew>
        <!--告警信息-->
        <alert-message-tab v-if="((from === fromRoute.alertRule || from === fromRoute.asset || from === fromRoute.endpoint || from === fromRoute.project ) && targetTab === 'alertMessage')" v-show="subResizeShow" :from="from" :obj="obj" @changeTab="changeTab" :targetTab.sync="targetTab"></alert-message-tab>
        <!--asset页的endpoint列表-->
        <endpoint-tab v-if="from === fromRoute.asset && targetTab === fromRoute.endpoint" v-show="subResizeShow" :from="from" :obj="obj" @changeTab="changeTab" :targetTab.sync="targetTab"></endpoint-tab>

        <!--terminal-log的记录和回放-->
        <terminal-log-cmd-tab v-if="from === fromRoute.terminalLog && targetTab === 'cmdTab'" :from="from" :obj="obj" :tabs="hasTerminalLogTabs" @changeTab="changeTab" :targetTab.sync="targetTab"></terminal-log-cmd-tab>
        <terminal-log-sftp-tab v-if="from === fromRoute.terminalLog && targetTab === 'sftpTab' && obj.protocol == 'SSH'" :from="from" :obj="obj" :tabs="hasTerminalLogTabs" @changeTab="changeTab" :targetTab.sync="targetTab"></terminal-log-sftp-tab>
        <terminal-log-record-tab v-if="from === fromRoute.terminalLog && targetTab === 'recordTab'" ref="reminalLogRecordTab" :from="from" :obj="obj" :tabs="hasTerminalLogTabs" @changeTab="changeTab" :targetTab.sync="targetTab"></terminal-log-record-tab>
        <terminal-log-monitor-tab v-if="from === fromRoute.terminalLog && targetTab === 'monitorTab'" :from="from" :obj="obj" :tabs="tabs.terminalLog.monitor" @changeTab="changeTab" @exit="closeSubList" :targetTab.sync="targetTab"></terminal-log-monitor-tab>

        <asset-tab v-if="from === fromRoute.dc && targetTab === 'asset'" :tabs="tabs.dc.asset" ref="assetTab" :from="from" :obj="obj" @changeTab="changeTab" @exit="closeSubList" :targetTab.sync="targetTab"></asset-tab>

        <!--user列表的两个日志-->
        <operation-log-tab v-if="from === fromRoute.user && targetTab === 'operationLogTab'" :from="from" :obj="obj" :tabs="tabs.user.operationLog" @changeTab="changeTab" :targetTab.sync="targetTab"></operation-log-tab>
        <terminal-log-tab v-if="from === fromRoute.user && targetTab === 'terminalLogTab'" :from="from" :obj="obj" :tabs="tabs.user.terminalLog" @changeTab="changeTab" :targetTab.sync="targetTab"></terminal-log-tab>
        <!-- asset列表的3个 -->
        <panel-tab-new @exit="closeSubList" @getTableData="getTableData" :paramsType="'asset'" v-if="from === fromRoute.asset && targetTab === 'panelTab'" v-show="subResizeShow" :from="from" :obj="obj" :tabs="assetTabs" :targetTab.sync="targetTab" @changeTab="changeTab"></panel-tab-new>
        <alertMessageTabNew v-if="from === fromRoute.asset && targetTab === 'alertMessageTab'" v-show="subResizeShow" :sign="sign+'alert'" :from="from" :obj="obj" :tabs="assetTabs" :targetTab.sync="targetTab" @changeTab="changeTab" ></alertMessageTabNew>
        <endpointTabNew v-if="from === fromRoute.asset && targetTab === 'endpointTab'" v-show="subResizeShow" :from="from" :obj="obj" :tabs="assetTabs" :targetTab.sync="targetTab" @changeTab="changeTab"></endpointTabNew>
        <log-bottom-tab v-if="from === fromRoute.asset && targetTab === 'log'" v-show="subResizeShow" :sign="sign+'log'" :from="from" :obj="obj" :tabs="assetTabs" :targetTab.sync="targetTab" @changeTab="changeTab"></log-bottom-tab>
        <process-bottom-tab v-if="from === fromRoute.asset && targetTab === 'process' && obj.clientState == '1'" v-show="subResizeShow" :from="from" :obj="obj" :tabs="assetTabs" :targetTab.sync="targetTab" @changeTab="changeTab"></process-bottom-tab>
        <assetSubTab v-if="from === fromRoute.asset && targetTab === 'assetSubTab' && obj.childrenNum" v-show="subResizeShow" :from="from" :obj="obj" :tabs="assetTabs" @changeTab="changeTab" :targetTab.sync="targetTab"></assetSubTab>
        <network-bottom-tab v-if="from === fromRoute.asset && targetTab === 'network' && obj.clientState == '1'" v-show="subResizeShow" :from="from" :obj="obj" :tabs="assetTabs" :targetTab.sync="targetTab" @changeTab="changeTab"></network-bottom-tab>
        <comments-bottom-tab v-if="from === fromRoute.asset && targetTab === 'comments'" v-show="subResizeShow" :from="from" :obj="obj" :tabs="assetTabs" @changeTab="changeTab" :targetTab.sync="targetTab"></comments-bottom-tab>
        <vsys-bottom-tab v-if="from === fromRoute.asset && targetTab === 'vsys' && obj.model.tsgAppliance == '1'"  v-show="subResizeShow" :from="from" :obj="obj" :tabs="assetTabs" :targetTab.sync="targetTab" @changeTab="changeTab"></vsys-bottom-tab>
        <!--module列表的tab-->
        <endpointTabNew v-if="from === fromRoute.module && targetTab === 'endpoint'" v-show="subResizeShow" :from="from" :obj="obj" :tabs="tabs.module.moduleTabTitle" :targetTab="targetTab" @changeTab="changeTab"></endpointTabNew>
        <alertMessageTabNew v-if="from === fromRoute.module && targetTab === 'moduleAlertMessage'" v-show="subResizeShow" :from="from" :obj="obj" :tabs="tabs.module.moduleTabTitle" @changeTab="changeTab" :targetTab="targetTab"></alertMessageTabNew>
        <panel-tab-new @exit="closeSubList" @getTableData="getTableData" :paramsType="'module'" v-if="from === fromRoute.module && targetTab === 'panel'" v-show="subResizeShow" :from="from" :obj="obj" :tabs="tabs.module.moduleTabTitle" :targetTab.sync="targetTab" @changeTab="changeTab"></panel-tab-new>
        <!--endpoint列表的tab-->
        <panel-tab-new @exit="closeSubList" v-if="from === fromRoute.endpoint && targetTab === 'panelTab'" v-show="subResizeShow" :from="from" :obj="obj" :paramsType="'endpoint'" :tabs="endpointTabs" :targetTab.sync="targetTab" @changeTab="changeTab" @getTableData="getTableData"></panel-tab-new>
        <endpointQuery v-if="from === fromRoute.endpoint && targetTab === 'Metrics'"  v-show="subResizeShow" :from="from" :obj="obj" :tabs="endpointTabs" :targetTab.sync="targetTab" @changeTab="changeTab"></endpointQuery>
        <log-bottom-tab v-if="from === fromRoute.endpoint && targetTab === 'log' && hasLogConfig" :sign="sign+'log'" v-show="subResizeShow" :from="from" :obj="obj" :tabs="endpointTabs" :targetTab.sync="targetTab" @changeTab="changeTab"></log-bottom-tab>
        <alertMessageTabNew  v-if="from === fromRoute.endpoint && targetTab === 'endpointAlertMessage'" :sign="sign+'alert'" v-show="subResizeShow" :from="from" :obj="obj" :tabs="endpointTabs" :targetTab.sync="targetTab" @changeTab="changeTab"></alertMessageTabNew>
        <!--chartTemp的Tab-->
        <panel-tab-new @exit="closeSubList" @getTableData="getTableData" :paramsType="'template'" v-if="from === fromRoute.chartTemp && targetTab === 'panel'" v-show="subResizeShow" :from="from" :obj="obj" :tabs="tabs.chartTemp.chartTempTabTitle" :targetTab.sync="targetTab" @changeTab="changeTab"></panel-tab-new>
        <!--dashboardTemp的Tab-->
        <panel-tab-new @exit="closeSubList" @getTableData="getTableData" :paramsType="'template'" v-if="from === fromRoute.dashboardTemp && targetTab === 'panel'" v-show="subResizeShow" :from="from" :obj="obj" :tabs="tabs.dashboardTemp.dashboardTempTabTitle" :targetTab.sync="targetTab" @changeTab="changeTab"></panel-tab-new>
        <!--alertRule Tab-->
        <alertMessageTabNew v-if="from === fromRoute.alertRule && targetTab === 'alertRuleAlertMessage'" v-show="subResizeShow" :from="from" :obj="obj" :tabs="tabs.alertRule.alertRule" @changeTab="changeTab" :targetTab.sync="targetTab"></alertMessageTabNew>
        <alertRuleEvalLog v-if="from === fromRoute.alertRule && targetTab === 'evalLog'" v-show="subResizeShow" :from="from" :obj="obj" :tabs="tabs.alertRule.alertRule" @changeTab="changeTab" :targetTab.sync="targetTab"></alertRuleEvalLog>
        <!--model 下滑-->
        <asset-tab v-if="(from === fromRoute.model) && targetTab === 'asset'" :tabs="tabs.model" ref="assetTab" :from="from" :obj="obj" @changeTab="changeTab" @exit="closeSubList" :targetTab.sync="targetTab"></asset-tab>
        <!-- agent 下滑-->
        <scrape-endpoint v-if="from === fromRoute.agent && targetTab === 'scrapeEndpoint'" :from="from" :obj="obj" :tabs="tabs.agent.scrapeEndpoint" @changeTab="changeTab" :targetTab.sync="targetTab"></scrape-endpoint>
        <cortex-detail v-if="from === fromRoute.agent && targetTab === 'cortexDetail'" :from="from" :obj="obj" :tabs="tabs.agent.cortexDetail" @changeTab="changeTab" :targetTab.sync="targetTab"></cortex-detail>
        <!-- ipam -->
        <ip-details v-if="from === fromRoute.ipam && targetTab === 'ipam'" :from="from" :obj="obj" :tabs="tabs.ipam" @changeTab="changeTab" :targetTab.sync="targetTab"></ip-details>
        <!-- recordRule  下滑-->
        <record-rule-eval-log v-if="from === fromRoute.recordRule && targetTab === 'recordRule'" :from="from" :obj="obj" :tabs="tabs.recordRule.evalLog" @changeTab="changeTab" :targetTab.sync="targetTab"></record-rule-eval-log>
        <recordRulesQuery v-if="from === fromRoute.recordRule && targetTab === 'Metrics'" :from="from" :obj="obj" :tabs="tabs.recordRule.Metrics" @changeTab="changeTab" :targetTab.sync="targetTab"></recordRulesQuery>
        <!--alertRule Tab-->
        <alertMessageTabNew v-if="from === fromRoute.alertSilence && targetTab === 'alertMessageTab'" v-show="subResizeShow" :from="from" :obj="obj" :tabs="tabs.alertSilence" @changeTab="changeTab" :targetTab.sync="targetTab"></alertMessageTabNew>
        <!--issue Tab-->
        <!-- <issueTab v-if="from === fromRoute.issue && targetTab === 'issue'" v-show="subResizeShow" :from="from" :obj="obj" :tabs="tabs.alertSilence" @changeTab="changeTab" :targetTab.sync="targetTab"></issueTab> -->
      </div>
    </div>
  </div>
</template>

<script>
import cabinetTab from './tabs/cabinetTab'
import alertMessageTab from './tabs/alertMessageTab'
import alertMessageTabNew from './tabs/alertMessageTabNew'
import issueTab from './tabs/issueTab'
import alertRuleEvalLog from './tabs/alertRuleEvalLog'
import assetSubTab from './tabs/assetSubTab'
import commentsBottomTab from './tabs/commentsBottomTab'
import vsysBottomTab from './tabs/vsysBottomTab'
import endpointQuery from './tabs/endpointQuery'
import recordRulesQuery from './tabs/recordRulesQuery'
import endpointTab from './tabs/endpointTab'
import endpointTabNew from './tabs/endpointTabNew'
import panelTabNew from './tabs/panelTabNew'
import terminalLogRecordTab from './tabs/terminalLogRecordTab'
import terminalLogSftpTab from './tabs/terminalLogSftpTab'
import terminalLogMonitorTab from './tabs/terminalLogMonitorTab'
import terminalLogCMDTab from './tabs/terminalLogCMDTab'
import operationLogTab from './tabs/operationLogTab'
import terminalLogTab from './tabs/terminalLogTab'
import assetTab from '@/components/common/bottomBox/tabs/assetTab'
import { fromRoute } from '@/components/common/js/constants'
import LogBottomTab from '@/components/common/bottomBox/tabs/logBottomTab'
import processBottomTab from '@/components/common/bottomBox/tabs/processBottomTab'
import networkBottomTab from '@/components/common/bottomBox/tabs/networkBottomTab'
import scrapeEndpoint from '@/components/common/bottomBox/tabs/scrapeEndpoint'
import cortexDetail from '@/components/common/bottomBox/tabs/cortexDetail'
import IpDetails from '@/components/common/bottomBox/tabs/IpDetails'
import recordRuleEvalLog from '@/components/common/bottomBox/tabs/recordRuleEvalLog'
import routerPathParams from '@/components/common/mixin/routerPathParams'

export default {
  name: 'bottomBox',
  mixins: [routerPathParams],
  components: {
    scrapeEndpoint,
    cortexDetail,
    LogBottomTab,
    processBottomTab,
    networkBottomTab,
    cabinetTab,
    alertMessageTab,
    endpointTab,
    terminalLogRecordTab,
    terminalLogSftpTab,
    terminalLogMonitorTab,
    operationLogTab,
    terminalLogTab,
    'terminal-log-cmd-tab': terminalLogCMDTab,
    endpointTabNew,
    alertMessageTabNew,
    endpointQuery,
    panelTabNew,
    assetTab,
    assetSubTab,
    alertRuleEvalLog,
    IpDetails,
    recordRuleEvalLog,
    recordRulesQuery,
    issueTab,
    commentsBottomTab,
    vsysBottomTab
  },
  props: {
    isFullScreen: Boolean, // 是否全屏
    subResizeShow: Boolean, // resize时，用v-show="subResizeShow"控制页面内容是否显示
    obj: Object, // 关联的实体对象
    from: String, // 来自哪个页面
    tabList: Array, // 动态页签列表
    targetTab: String, // 展示哪个页签
    sign: [Number, String] // pickTime历史记录的唯一标识
  },
  watch: {
    obj: {
      immediate: true,
      handler (n) {
      }
    }
  },
  data () {
    return {
      fromRoute: fromRoute,
      tabs: {
        terminalLog: {
          monitor: [
            { prop: 'monitorTab', name: this.$t('config.terminallog.monitor.monitor'), active: true }
          ]
        //   // cmd: [
        //   //   { prop: 'cmdTab', name: this.$t('config.terminallog.cmd.cmd'), active: true },
        //   //   { prop: 'recordTab', name: this.$t('config.terminallog.record.record'), active: false }
        //   // ],
        //   // record: [
        //   //   { prop: 'cmdTab', name: this.$t('config.terminallog.cmd.cmd'), active: false },
        //   //   { prop: 'recordTab', name: this.$t('config.terminallog.record.record'), active: true }
        //   // ]
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
            { prop: 'panelTab', name: this.$t('overall.dashboard') },
            { prop: 'alertMessageTab', name: this.$t('overall.alert') },
            { prop: 'endpointTab', name: this.$t('asset.endpoint') },
            { prop: 'log', name: this.$t('dashboard.panel.chartForm.typeVal.log.label') }
          ]
        },
        module: {
          moduleTabTitle: [
            // { prop: 'panel', name: 'Detail' },
            { prop: 'endpoint', name: this.$t('asset.endpoint') },
            { prop: 'moduleAlertMessage', name: this.$t('overall.alert') }
          ]
        },
        endpoint: {
          endpointTabTitle: [
            { prop: 'panelTab', name: this.$t('overall.dashboard') },
            { prop: 'endpointAlertMessage', name: this.$t('overall.alert') },
            { prop: 'Metrics', name: this.$t('overall.metric') },
            { prop: 'log', name: this.$t('dashboard.panel.chartForm.typeVal.log.label') }
          ]
        },
        chartTemp: {
          chartTempTabTitle: [
            { prop: 'panel', name: this.$t('overall.tempPrev') }
          ]
        },
        dashboardTemp: {
          dashboardTempTabTitle: [
            { prop: 'panel', name: this.$t('overall.dashboardTemp') }
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
        },
        agent: {
          scrapeEndpoint: [
            { prop: 'scrapeEndpoint', name: this.$t('config.agent.scrapeEndpoint'), active: true },
            { prop: 'cortexDetail', name: this.$t('config.agent.cortexDetail'), active: false }
          ],
          cortexDetail: [
            { prop: 'scrapeEndpoint', name: this.$t('config.agent.scrapeEndpoint'), active: false },
            { prop: 'cortexDetail', name: this.$t('config.agent.cortexDetail'), active: true }
          ]
        },
        ipam: [
          { prop: 'ipam', name: this.$t('ipam.subnet.ipDetails'), active: true }
        ],
        recordRule: {
          Metrics: [
            { prop: 'Metrics', name: this.$t('overall.metric'), active: true },
            { prop: 'recordRule', name: this.$t('overall.alertRuleEvalLog'), active: false }
          ],
          evalLog: [
            { prop: 'Metrics', name: this.$t('overall.metric'), active: false },
            { prop: 'recordRule', name: this.$t('overall.alertRuleEvalLog'), active: true }
          ]
        },
        alertSilence: [
          { prop: 'alertMessageTab', name: this.$t('overall.alert'), active: true }
        ],
        issue: [
          // { prop: 'issue', name: this.$t('overall.issue'), active: true }
        ]
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
        { prop: 'panelTab', name: this.$t('overall.dashboard') },
        { prop: 'alertMessageTab', name: this.$t('overall.alert') },
        { prop: 'endpointTab', name: this.$t('asset.endpoint') },
        { prop: 'log', name: this.$t('dashboard.panel.chartForm.typeVal.log.label') }
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
        { prop: 'panelTab', name: this.$t('overall.dashboard') },
        { prop: 'endpointAlertMessage', name: this.$t('overall.alert') },
        { prop: 'Metrics', name: this.$t('overall.metric') }
      ]
      if (hasLog) {
        tabs.push({ prop: 'log', name: this.$t('dashboard.panel.chartForm.typeVal.log.label') })
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
      this.$emit('listResize', e, this.afterResize)
      this.$nextTick(() => { this.afterResize() })
    },
    changeTab (tab) {
      this.$emit('update:targetTab', tab)
      this.$nextTick(() => {
        this.updatePath(this.$route.query, this.$route.path, 'bottomBox')
      })
    },
    afterResize () {
      if (this.from === this.fromRoute.endpoint && this.targetTab === 'endpointQuery') {
        this.$refs.endpointQuery.tableReload()
      } else if (this.from === this.fromRoute.terminalLog && this.targetTab === 'recordTab') {
        setTimeout(() => {
          this.$refs.reminalLogRecordTab.consoleResize()
        }, 600)
      }
      const subListDom = document.querySelector('.sub-list') // 副列表
      if (subListDom.offsetHeight < 505) {
        this.$store.dispatch('dispatchTimeBoxClass', 'date-range-panel--top')
      } else {
        this.$store.dispatch('dispatchTimeBoxClass', '')
      }
    },
    getTableData () {
      this.$emit('getTableData')
    }
  },
  beforeDestroy () {
    this.$store.dispatch('dispatchTimeBoxClass', '')
  }
}
</script>
