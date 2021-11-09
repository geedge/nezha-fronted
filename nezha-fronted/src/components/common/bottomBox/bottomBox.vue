<template>
  <div class="sub-box bottom-box">
    <div class="resize-modal">
      <div class="sub-list-resize-copy">一</div>
    </div>
    <!-- 副列表 -->
    <div @mousedown="listResize" class="sub-list-resize" v-if="!isFullScreen">一</div>
    <div class="sub-list">
        <!--窗口大小控制-->
      <div class="sub-list-window-control">
        <!--退出全屏-->
        <div class="window-control-btn" v-if="isFullScreen" @click="exitFullScreen" :id="from+'-bottom-exit-full'"><i class="nz-icon nz-icon-exit-full-screen" ></i></div>
        <!--全屏-->
        <div v-if="!isFullScreen" :id="from+'-bottom-full'" class="window-control-btn" @click="fullScreen"><i class="nz-icon nz-icon-full-screen"></i></div>
        <!--关闭-->
        <div class="window-control-btn" @click="closeSubList" :id="from+'-bottom-close'"><i class="nz-icon nz-icon-close"></i></div>
      </div>

      <!------TAB区------>
      <div class="sub-list__tabs">
        <!--机柜-->
        <cabinet-tab v-if="from === fromRoute.dc && targetTab === 'cabinet'" :tabs="tabs.dc.cabinet" v-show="subResizeShow" :obj="obj" @changeTab="changeTab"></cabinet-tab>
        <alertMessageTabNew v-if="from === fromRoute.dc && targetTab === 'alertMessageTab'" v-show="subResizeShow" :from="from" :obj="obj" :tabs="tabs.dc.alertMessage" :targetTab="targetTab" @changeTab="changeTab"></alertMessageTabNew>
        <!--告警信息-->
        <alert-message-tab v-if="((from === fromRoute.alertRule || from === fromRoute.asset || from === fromRoute.endpoint || from === fromRoute.project ) && targetTab === 'alertMessage')" v-show="subResizeShow" :from="from" :obj="obj" @changeTab="changeTab"></alert-message-tab>
        <!--asset页的endpoint列表-->
        <endpoint-tab v-if="from === fromRoute.asset && targetTab === fromRoute.endpoint" v-show="subResizeShow" :from="from" :obj="obj" @changeTab="changeTab"></endpoint-tab>

        <!--terminal-log的记录和回放-->
        <terminal-log-cmd-tab v-if="from === fromRoute.terminalLog && targetTab === 'cmdTab'" :from="from" :obj="obj" :tabs="tabs.terminalLog.cmd" @changeTab="changeTab"></terminal-log-cmd-tab>
        <terminal-log-record-tab v-if="from === fromRoute.terminalLog && targetTab === 'recordTab'" :from="from" :obj="obj" :tabs="tabs.terminalLog.record" @changeTab="changeTab"></terminal-log-record-tab>
        <terminal-log-monitor-tab v-if="from === fromRoute.terminalLog && targetTab === 'monitorTab'" :from="from" :obj="obj" :tabs="tabs.terminalLog.monitor" @changeTab="changeTab" @exit="closeSubList"></terminal-log-monitor-tab>

        <asset-tab v-if="from === fromRoute.dc && targetTab === 'asset'" :tabs="tabs.dc.asset" ref="assetTab" :from="from" :obj="obj" @changeTab="changeTab" @exit="closeSubList" :targetTab.sync="targetTab"></asset-tab>

        <!--user列表的两个日志-->
        <operation-log-tab v-if="from === fromRoute.user && targetTab === 'operationLogTab'" :from="from" :obj="obj" :tabs="tabs.user.operationLog" @changeTab="changeTab"></operation-log-tab>
        <terminal-log-tab v-if="from === fromRoute.user && targetTab === 'terminalLogTab'" :from="from" :obj="obj" :tabs="tabs.user.terminalLog" @changeTab="changeTab"></terminal-log-tab>
        <!-- asset列表的3个 -->
        <panel-tab-new @getTableData="getTableData" :paramsType="'asset'" v-if="from === fromRoute.asset && targetTab === 'panelTab'" v-show="subResizeShow" :from="from" :obj="obj" :tabs="tabs.asset.panel" :targetTab.sync="targetTab" @changeTab="changeTab"></panel-tab-new>
        <alertMessageTabNew v-if="from === fromRoute.asset && targetTab === 'alertMessageTab'" v-show="subResizeShow" :from="from" :obj="obj" :tabs="tabs.asset.alertMessage" :targetTab="targetTab" @changeTab="changeTab"></alertMessageTabNew>
        <endpointTabNew v-if="from === fromRoute.asset && targetTab === 'endpointTab'" v-show="subResizeShow" :from="from" :obj="obj" :tabs="tabs.asset.endpoint" :targetTab="targetTab" @changeTab="changeTab"></endpointTabNew>
        <log-bottom-tab v-if="from === fromRoute.asset && targetTab === 'log'" v-show="subResizeShow" :from="from" :obj="obj" :tabs="tabs.asset.log" :targetTab.sync="targetTab" @changeTab="changeTab"></log-bottom-tab>
        <assetSubTab v-if="from === fromRoute.asset && targetTab === 'assetSubTab' && obj.childrenNum" v-show="subResizeShow" :from="from" :obj="obj" :tabs="tabs.asset.alertMessageSub" :targetTab="targetTab" @changeTab="changeTab"></assetSubTab>
        <!--module列表的tab-->
        <endpointTabNew v-if="from === fromRoute.module && targetTab === 'endpoint'" v-show="subResizeShow" :from="from" :obj="obj" :tabs="tabs.module.moduleTabTitle" :targetTab="targetTab" @changeTab="changeTab"></endpointTabNew>
        <alertMessageTabNew v-if="from === fromRoute.module && targetTab === 'moduleAlertMessage'" v-show="subResizeShow" :from="from" :obj="obj" :tabs="tabs.module.moduleTabTitle" @changeTab="changeTab" :targetTab="targetTab"></alertMessageTabNew>
        <panel-tab-new @getTableData="getTableData" :paramsType="'module'" v-if="from === fromRoute.module && targetTab === 'panel'" v-show="subResizeShow" :from="from" :obj="obj" :tabs="tabs.module.moduleTabTitle" :targetTab.sync="targetTab" @changeTab="changeTab"></panel-tab-new>
        <!--endpoint列表的tab-->
        <panel-tab-new v-if="from === fromRoute.endpoint && targetTab === 'panelTab'" v-show="subResizeShow" :from="from" :obj="obj" :paramsType="'endpoint'" :tabs="endpointTabs" :targetTab.sync="targetTab" @changeTab="changeTab" @getTableData="getTableData"></panel-tab-new>
        <endpointQuery v-if="from === fromRoute.endpoint && targetTab === 'endpointQuery'" v-show="subResizeShow" :from="from" :obj="obj" :tabs="endpointTabs" :targetTab.sync="targetTab" @changeTab="changeTab"></endpointQuery>
        <log-bottom-tab v-if="from === fromRoute.endpoint && targetTab === 'log' && hasLogConfig" v-show="subResizeShow" :from="from" :obj="obj" :tabs="endpointTabs" :targetTab.sync="targetTab" @changeTab="changeTab"></log-bottom-tab>
        <alertMessageTabNew  v-if="from === fromRoute.endpoint && targetTab === 'endpointAlertMessage'" v-show="subResizeShow" :from="from" :obj="obj" :tabs="endpointTabs" :targetTab.sync="targetTab" @changeTab="changeTab"></alertMessageTabNew>
        <!--chartTemp的Tab-->
        <panel-tab-new @getTableData="getTableData"  :paramsType="'template'" v-if="from === fromRoute.chartTemp && targetTab === 'panel'" v-show="subResizeShow" :from="from" :obj="obj" :tabs="tabs.chartTemp.chartTempTabTitle" :targetTab.sync="targetTab" @changeTab="changeTab"></panel-tab-new>
        <!--alertRule Tab-->
        <alertMessageTabNew v-if="from === fromRoute.alertRule && targetTab === 'alertRuleAlertMessage'" v-show="subResizeShow" :from="from" :obj="obj" :tabs="tabs.alertRule.alertRule" @changeTab="changeTab" :targetTab.sync="targetTab"></alertMessageTabNew>
        <alertRuleEvalLog v-if="from === fromRoute.alertRule && targetTab === 'evalLog'" v-show="subResizeShow" :from="from" :obj="obj" :tabs="tabs.alertRule.alertRule" @changeTab="changeTab" :targetTab.sync="targetTab"></alertRuleEvalLog>
        <!--model 下滑-->
        <asset-tab v-if="(from === fromRoute.model) && targetTab === 'asset'" :tabs="tabs.model" ref="assetTab" :from="from" :obj="obj" @changeTab="changeTab" @exit="closeSubList" :targetTab.sync="targetTab"></asset-tab>
      </div>
    </div>
  </div>
</template>

<script>
import cabinetTab from './tabs/cabinetTab'
import alertMessageTab from './tabs/alertMessageTab'
import alertMessageTabNew from './tabs/alertMessageTabNew'
import alertRuleEvalLog from './tabs/alertRuleEvalLog'
import assetSubTab from './tabs/assetSubTab'
import endpointQuery from './tabs/endpointQuery'
import endpointTab from './tabs/endpointTab'
import endpointTabNew from './tabs/endpointTabNew'
import panelTabNew from './tabs/panelTabNew'
import terminalLogRecordTab from './tabs/terminalLogRecordTab'
import terminalLogMonitorTab from './tabs/terminalLogMonitorTab'
import terminalLogCMDTab from './tabs/terminalLogCMDTab'
import operationLogTab from './tabs/operationLogTab'
import terminalLogTab from './tabs/terminalLogTab'
import assetTab from '@/components/common/bottomBox/tabs/assetTab'
import { fromRoute } from '@/components/common/js/constants'
import LogBottomTab from '@/components/common/bottomBox/tabs/logBottomTab'

export default {
  name: 'bottomBox',
  components: {
    LogBottomTab,
    cabinetTab,
    alertMessageTab,
    endpointTab,
    terminalLogRecordTab,
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
    alertRuleEvalLog
  },
  props: {
    isFullScreen: Boolean, // 是否全屏
    subResizeShow: Boolean, // resize时，用v-show="subResizeShow"控制页面内容是否显示
    obj: Object, // 关联的实体对象
    from: String, // 来自哪个页面
    tabList: Array, // 动态页签列表
    targetTab: String // 展示哪个页签
  },
  watch: {
    obj: {
      immediate: true,
      handler (n) {
        if ((this.from === fromRoute.asset) && n) {
          const assetSub = { prop: 'assetSubTab', name: this.$t('overall.assetSubTab'), active: false }
          if (n.childrenNum) {
            if (!this.tabs.asset.panel.find(item => item.prop === assetSub.prop)) {
              this.tabs.asset.panel.push(assetSub)
              this.tabs.asset.alertMessage.push(assetSub)
              this.tabs.asset.endpoint.push(assetSub)
              this.tabs.asset.log.push(assetSub)
            }
          } else if (this.tabs.asset.panel.find(item => item.prop === assetSub.prop)) {
            this.tabs.asset.panel = this.tabs.asset.panel.filter(item => item.prop !== assetSub.prop)
            this.tabs.asset.alertMessage = this.tabs.asset.alertMessage.filter(item => item.prop !== assetSub.prop)
            this.tabs.asset.endpoint = this.tabs.asset.endpoint.filter(item => item.prop !== assetSub.prop)
            this.tabs.asset.log = this.tabs.asset.log.filter(item => item.prop !== assetSub.prop)
          }
        }
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
          ],
          cmd: [
            { prop: 'cmdTab', name: this.$t('config.terminallog.cmd.cmd'), active: true },
            { prop: 'recordTab', name: this.$t('config.terminallog.record.record'), active: false }
          ],
          record: [
            { prop: 'cmdTab', name: this.$t('config.terminallog.cmd.cmd'), active: false },
            { prop: 'recordTab', name: this.$t('config.terminallog.record.record'), active: true }
          ]
        },
        user: {
          operationLog: [
            { prop: 'operationLogTab', name: this.$t('config.operationlog.operationlog'), active: true },
            { prop: 'terminalLogTab', name: this.$t('config.terminallog.terminallog'), active: false }
          ],
          terminalLog: [
            { prop: 'operationLogTab', name: this.$t('config.operationlog.operationlog'), active: false },
            { prop: 'terminalLogTab', name: this.$t('config.terminallog.terminallog'), active: true }
          ]
          // module tab
        },
        asset: {
          panel: [
            { prop: 'panelTab', name: this.$t('overall.detail'), active: true },
            { prop: 'alertMessageTab', name: this.$t('overall.alert'), active: false },
            { prop: 'endpointTab', name: 'Endpoint', active: false },
            { prop: 'log', name: 'Log', active: false }
          ],
          alertMessage: [
            { prop: 'panelTab', name: this.$t('overall.detail'), active: false },
            { prop: 'alertMessageTab', name: this.$t('overall.alert'), active: true },
            { prop: 'endpointTab', name: 'Endpoint', active: false },
            { prop: 'log', name: 'Log', active: false }
          ],
          endpoint: [
            { prop: 'panelTab', name: this.$t('overall.detail'), active: false },
            { prop: 'alertMessageTab', name: this.$t('overall.alert'), active: false },
            { prop: 'endpointTab', name: 'Endpoint', active: true },
            { prop: 'log', name: 'Log', active: false }
          ],
          log: [
            { prop: 'panelTab', name: this.$t('overall.detail'), active: false },
            { prop: 'alertMessageTab', name: this.$t('overall.alert'), active: false },
            { prop: 'endpointTab', name: 'Endpoint', active: false },
            { prop: 'log', name: 'Log', active: true }
          ],
          alertMessageSub: [
            { prop: 'panelTab', name: this.$t('overall.detail'), active: false },
            { prop: 'alertMessageTab', name: this.$t('overall.alert'), active: false },
            { prop: 'endpointTab', name: 'Endpoint', active: false },
            { prop: 'log', name: 'Log', active: false },
            { prop: 'assetSubTab', name: this.$t('overall.assetSubTab'), active: true }
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
            { prop: 'panelTab', name: this.$t('overall.detail') },
            { prop: 'endpointAlertMessage', name: this.$t('overall.alert') },
            { prop: 'endpointQuery', name: 'Metrics' },
            { prop: 'log', name: 'Log' }
          ]
        },
        chartTemp: {
          chartTempTabTitle: [
            { prop: 'panel', name: this.$t('overall.tempPrev') }
          ]
        },
        alertRule: {
          alertRule: [
            { prop: 'alertRuleAlertMessage', name: this.$t('overall.alert') },
            { prop: 'evalLog', name: this.$t('overall.alertRuleEvalLog') }
          ]
        },
        model: [
          { prop: 'asset', name: this.$t('asset.assets'), active: true }
        ],
        dc: {
          cabinet: [
            { prop: 'cabinet', name: this.$t('config.dc.cabinets'), active: true },
            { prop: 'asset', name: this.$t('asset.assets'), active: false },
            { prop: 'alertMessageTab', name: this.$t('overall.alert'), active: false }
          ],
          asset: [
            { prop: 'cabinet', name: this.$t('config.dc.cabinets'), active: false },
            { prop: 'asset', name: this.$t('asset.assets'), active: true },
            { prop: 'alertMessageTab', name: this.$t('overall.alert'), active: false }
          ],
          alertMessage: [
            { prop: 'cabinet', name: this.$t('config.dc.cabinets'), active: false },
            { prop: 'asset', name: this.$t('asset.assets'), active: false },
            { prop: 'alertMessageTab', name: this.$t('overall.alert'), active: true }
          ]
        }

      }
    }
  },
  computed: {
    hasLogConfig () {
      const config = this.obj.configs.find(c => c.type === 'logs')
      return config && config.enable === 1
    },
    endpointTabs () {
      const config = this.obj.configs.find(c => c.type === 'logs')
      const hasLog = config && config.enable === 1
      const tabs = [
        { prop: 'panelTab', name: this.$t('overall.detail') },
        { prop: 'endpointAlertMessage', name: this.$t('overall.alert') },
        { prop: 'endpointQuery', name: 'Metrics' }
      ]
      if (hasLog) {
        tabs.push({ prop: 'log', name: 'Log' })
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
      this.$emit('update:targetTab', tab)
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
    }
  }
}
</script>
<style lang="scss">
/* begin--二级顶部工具栏*/
.sub-top-tools {
  display: flex;
  height: 32px;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid #DCDFE6;
  border-bottom: 1px solid #E4E7ED;
  margin: 0 -6px;
  padding-right: 80px;
  background-color: $content-right-background-color;
  margin-bottom: 10px;
}
.sub-top-tools>div {
  margin-top: 2px;
}
.sub-top-tools .top-tool-search {
  width: 260px;
  margin: -1px 0 0 0;
  .select_input input {
    background-color: white;
  }
}
.bottom-data-list .sub-container {
  padding: 10px;
  height: calc(100% - 64px);
  background-color: #f6f6f6;
  overflow-y: auto;
  &>div {
    background-color: white;
  }
  &>.nz-table2 {
    height: 100%;
    padding-top: 20px !important;
  }
}
.sub-top-tools .top-tool-btn-txt .nz-icon{
  display: inline-block;
  font-size: 12px;
  margin-right: 6px;
}
.sub-top-tool-right {
  display: flex;
  align-content: center;
}
.has-sub-popper {
  color: $danger-color;
}
.sub-box {
  height: 50%;
  position: relative;
}
.sub-list {
  height: calc(100% - 9px);
  position: absolute;
  width: 100%;
  z-index: 1;
  top: 9px;

  .sub-list__tabs {
    height: 100%;
    background-color: white;

    &>div {
      height: 100%;
      background-color: #f6f6f6;

      &>.nz-table2 {
        height: calc(100% - 92px);
        padding: 20px 20px 0;
      }
    }
    .chart-list{
      .nz-table2 {
        box-sizing: border-box;
        padding: 0;
      }
    }
  }
}
.main-and-sub-transition {
  transition: .4s height;
}

.bottom-panel {
  padding-top: 15px;
  background-color: white;
  /*padding-bottom: 50px;*/
  /*height: calc(100% - 50px);*/
  padding-bottom: 10px;
  height: calc(100% - 30px);
}
.bottom-log {
  padding: 15px;
}
.bottom-common {
  padding: 20px;
  height: 100%;
  box-sizing: border-box;
}
.chart-temp{
  height: calc(100% - 20px);
  overflow-y: auto;
}
.resize-modal {
  width: calc(100% - 240px);
  opacity: 0.6;
  background-color: #f5f9ff;
  border: 1px solid #a7d0f7;
  box-sizing: border-box;
  position: fixed;
  cursor: ns-resize;
  display: none;
  z-index: 20;
  vertical-align: bottom;
  bottom: 0;
}
.bottom-box .sub-container{
  height: calc(100% - 64px);
}
.bottom-box .sub-container .nz-table2{
  height: calc(100% - 20px);
}
.asset-detail .sub-container .nz-table2 {
  height: 100%;
}
.endpoint-tab-new .sub-container .nz-table2 {
  height: 100%;
}
/* end--二级顶部工具栏*/
</style>
