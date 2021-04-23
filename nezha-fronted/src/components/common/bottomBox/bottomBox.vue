<template>
  <div class="sub-box">
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
        <!--告警信息-->
        <alert-message-tab v-if="((from === fromRoute.rule || from === fromRoute.asset || from === fromRoute.endpoint || from === fromRoute.project ) && targetTab === 'alertMessage')" v-show="subResizeShow" :from="from" :obj="obj" @changeTab="changeTab"></alert-message-tab>
        <!--asset页的endpoint列表-->
        <endpoint-tab v-if="from === fromRoute.asset && targetTab === fromRoute.endpoint" v-show="subResizeShow" :from="from" :obj="obj" @changeTab="changeTab"></endpoint-tab>
        <!--endpoint-query-->
<!--        <endpoint-query-tab v-if="(from === fromRoute.endpoint && targetTab === 'endpointQuery')" v-show="subResizeShow" ref="endpointQuery" :from="from" :obj="obj" @changeTab="changeTab"></endpoint-query-tab>-->

        <!-- model-panel/asset-detail/project-overview的panel-->
<!--        <panel-tab v-if="(from === fromRoute.model || from === fromRoute.asset || from === fromRoute.project || from === fromRoute.rule || from === fromRoute.endpoint) && targetTab === 'panel'" v-show="subResizeShow" ref="panelTab" :detail="detail" :from="from"-->
<!--                   :obj="obj" :targetTab.sync="targetTab" @changeTab="changeTab"></panel-tab>-->

        <!--terminal-log的记录和回放-->
        <terminal-log-cmd-tab v-if="from === fromRoute.terminalLog && targetTab === 'cmd'" ref="reminalLogCMDTab" :from="from" :obj="obj" @changeTab="changeTab"></terminal-log-cmd-tab>
        <terminal-log-record-tab v-if="from === fromRoute.terminalLog && targetTab === 'record'" ref="reminalLogRecordTab" :from="from" :obj="obj" @changeTab="changeTab"></terminal-log-record-tab>

        <terminal-log-monitor-tab v-if="from === fromRoute.terminalLog && targetTab === 'monitor'" ref="reminalLogRecordTab" :from="from" :obj="obj" @changeTab="changeTab" @exit="closeSubList"></terminal-log-monitor-tab>

        <asset-tab v-if="from === fromRoute.dc && targetTab === 'asset'" :tabs="tabs.dc.asset" ref="assetTab" :from="from" :obj="obj" @changeTab="changeTab" @exit="closeSubList"></asset-tab>

        <!--user列表的两个日志-->
        <operation-log-tab v-if="from === fromRoute.user && targetTab === 'operationLogTab'" :from="from" :obj="obj" :tabs="tabs.user.operationLog" @changeTab="changeTab"></operation-log-tab>
        <terminal-log-tab v-if="from === fromRoute.user && targetTab === 'terminalLogTab'" :from="from" :obj="obj" :tabs="tabs.user.terminalLog" @changeTab="changeTab"></terminal-log-tab>

        <!--module列表的tab-->
        <endpointTabNew v-if="from === fromRoute.module && targetTab === fromRoute.endpoint" v-show="subResizeShow" :from="from" :obj="obj" :tabs="tabs.module.moduleTabTitle" @changeTab="changeTab" :targetTab="targetTab"></endpointTabNew>
        <alertMessageTabNew v-if="from === fromRoute.module && targetTab === 'moduleAlertMessage'" v-show="subResizeShow" :from="from" :obj="obj" :tabs="tabs.module.moduleTabTitle" @changeTab="changeTab" :targetTab="targetTab"></alertMessageTabNew>
        <panel-tab-new v-if="from === fromRoute.module && targetTab === 'panel'" v-show="subResizeShow" :detail="detail" :from="from" :obj="obj" :tabs="tabs.module.moduleTabTitle" :targetTab.sync="targetTab" @changeTab="changeTab"></panel-tab-new>
        <!--endpoint列表的tab-->
        <endpointQuery v-if="from === fromRoute.endpoint && targetTab === 'endpointQuery'" v-show="subResizeShow" :from="from" :obj="obj" :tabs="tabs.endpoint.endpointTabTitle" @changeTab="changeTab" :targetTab="targetTab"></endpointQuery>
        <alertMessageTabNew v-if="from === fromRoute.endpoint && targetTab === 'endpointAlertMessage'" v-show="subResizeShow" :from="from" :obj="obj" :tabs="tabs.endpoint.endpointTabTitle" @changeTab="changeTab" :targetTab="targetTab"></alertMessageTabNew>
        <panel-tab-new v-if="from === fromRoute.endpoint && targetTab === 'panel'" v-show="subResizeShow" :detail="detail" :from="from" :tabs="tabs.endpoint.endpointTabTitle" :obj="obj" :targetTab.sync="targetTab" @changeTab="changeTab"></panel-tab-new>
      </div>
    </div>
  </div>
</template>

<script>
import cabinetTab from './tabs/cabinetTab'
import alertMessageTab from './tabs/alertMessageTab'
import alertMessageTabNew from './tabs/alertMessageTabNew'
import endpointQuery from './tabs/endpointQuery'
import endpointTab from './tabs/endpointTab'
import endpointTabNew from './tabs/endpointTabNew'
import panelTab from './tabs/panelTab'
import panelTabNew from './tabs/panelTabNew'
import terminalLogRecordTab from './tabs/terminalLogRecordTab'
import terminalLogMonitorTab from './tabs/terminalLogMonitorTab'
import terminalLogCMDTab from './tabs/terminalLogCMDTab'
import operationLogTab from './tabs/operationLogTab'
import terminalLogTab from './tabs/terminalLogTab'
import assetTab from "@/components/common/bottomBox/tabs/assetTab";
import { fromRoute } from '@/components/common/js/constants'

export default {
  name: 'bottomBox',
  components: {
    cabinetTab,
    alertMessageTab,
    endpointTab,
    panelTab,
    terminalLogRecordTab,
    terminalLogMonitorTab,
    operationLogTab,
    terminalLogTab,
    'terminal-log-cmd-tab': terminalLogCMDTab,
    endpointTabNew,
    alertMessageTabNew,
    endpointQuery,
    panelTabNew,
    assetTab
  },
  props: {
    isFullScreen: Boolean, // 是否全屏
    subResizeShow: Boolean, // resize时，用v-show="subResizeShow"控制页面内容是否显示
    obj: Object, // 关联的实体对象
    from: String, // 来自哪个页面
    tabList: Array, // 动态页签列表
    targetTab: String, // 展示哪个页签
    detail: Object, // 对象详情内容
    detailList: Array, // 多个对象详情内容

    assetDetail: Object // endpoint页的asset详情
  },
  data () {
    return {
      fromRoute: fromRoute,
      tabs: {
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
        module: {
          moduleTabTitle: [
            { prop: 'endpoint', name: this.$t('asset.tableTitle.endpoint') },
            { prop: 'moduleAlertMessage', name: 'Alerts' },
            { prop: 'panel', name: 'Detail' }
          ]
        },
        endpoint: {
          endpointTabTitle: [
            { prop: 'panel', name: 'Detail' },
            { prop: 'endpointQuery', name: 'Query' },
            { prop: 'endpointAlertMessage', name: 'Alerts' }
          ]
        },
        dc: {
          cabinet: [
            { prop: 'asset', name: this.$t('asset.assets'), active: false },
            { prop: 'cabinet', name: this.$t('config.dc.cabinets'), active: true }
          ],
          asset:[
            { prop: 'asset', name: this.$t('asset.assets'), active: true },
            { prop: 'cabinet', name: this.$t('config.dc.cabinets'), active: false }
          ]
        }

      }
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
    }
  }
}
</script>
