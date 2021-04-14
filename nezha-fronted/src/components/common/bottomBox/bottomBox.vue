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
        <cabinet-tab v-if="from === fromRoute.dc && targetTab === 'cabinet'" v-show="subResizeShow" :obj="obj" @changeTab="changeTab"></cabinet-tab>
        <!--告警信息-->
        <alert-message-tab v-if="((from === fromRoute.rule || from === fromRoute.asset || from === fromRoute.endpoint) && targetTab === 'alertMessage')" v-show="subResizeShow" :from="from" :obj="obj" @changeTab="changeTab"></alert-message-tab>
        <!--asset页的endpoint列表-->
        <endpoint-tab v-if="from === fromRoute.asset && targetTab === fromRoute.endpoint" v-show="subResizeShow" :from="from" :obj="obj" @changeTab="changeTab"></endpoint-tab>
        <!--endpoint-query-->
        <endpoint-query-tab v-if="(from === fromRoute.endpoint && targetTab === 'endpointQuery')" v-show="subResizeShow" ref="endpointQuery" :from="from" :obj="obj" @changeTab="changeTab"></endpoint-query-tab>

        <!-- model-panel/asset-detail/project-overview的panel-->
        <panel-tab v-if="(from === fromRoute.model || from === fromRoute.asset || from === fromRoute.project || from === fromRoute.rule || from === fromRoute.endpoint) && targetTab === 'panel'" v-show="subResizeShow" ref="panelTab" :detail="detail" :from="from"
                   :obj="obj" :targetTab.sync="targetTab" @changeTab="changeTab"></panel-tab>

        <!--terminal-log的记录和回放-->
        <terminal-log-cmd-tab v-if="from === fromRoute.terminalLog && targetTab === 'cmd'" ref="reminalLogCMDTab" :from="from" :obj="obj" @changeTab="changeTab"></terminal-log-cmd-tab>
        <terminal-log-record-tab v-if="from === fromRoute.terminalLog && targetTab === 'record'" ref="reminalLogRecordTab" :from="from" :obj="obj" @changeTab="changeTab"></terminal-log-record-tab>

        <terminal-log-monitor-tab v-if="from === fromRoute.terminalLog && targetTab === 'monitor'" ref="reminalLogRecordTab" :from="from" :obj="obj" @changeTab="changeTab" @exit="closeSubList"></terminal-log-monitor-tab>

        <!--user列表的两个日志-->
        <operation-log-tab v-if="from === fromRoute.user && targetTab === 'operationLogTab'" :from="from" :obj="obj" :tabs="tabs.user.operationLog" @changeTab="changeTab"></operation-log-tab>
        <terminal-log-tab v-if="from === fromRoute.user && targetTab === 'terminalLogTab'" :from="from" :obj="obj" :tabs="tabs.user.terminalLog" @changeTab="changeTab"></terminal-log-tab>
      </div>
    </div>
  </div>
</template>

<script>
import cabinetTab from './tabs/cabinetTab'
import alertMessageTab from './tabs/alertMessageTab'
import endpointQueryTab from './tabs/endpointQueryTab'
import endpointTab from './tabs/endpointTab'
import panelTab from './tabs/panelTab'
import terminalLogRecordTab from './tabs/terminalLogRecordTab'
import terminalLogMonitorTab from './tabs/terminalLogMonitorTab'
import terminalLogCMDTab from './tabs/terminalLogCMDTab'
import operationLogTab from './tabs/operationLogTab'
import terminalLogTab from './tabs/terminalLogTab'
import { fromRoute } from '@/components/common/js/constants'

export default {
  name: 'bottomBox',
  components: {
    cabinetTab,
    alertMessageTab,
    endpointQueryTab,
    endpointTab,
    panelTab,
    terminalLogRecordTab,
    terminalLogMonitorTab,
    operationLogTab,
    terminalLogTab,
    'terminal-log-cmd-tab': terminalLogCMDTab
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
