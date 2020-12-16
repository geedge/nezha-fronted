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
        <div class="window-control-btn" v-if="isFullScreen" @click="exitFullScreen"><i class="nz-icon nz-icon-exit-full-screen"></i></div>
        <!--全屏-->
        <div class="window-control-btn" v-if="!isFullScreen" @click="fullScreen"><i class="el-icon-full-screen"></i></div>
        <!--关闭-->
        <div class="window-control-btn" @click="closeSubList"><i class="nz-icon nz-icon-close"></i></div>
      </div>

        <!------TAB区------>
        <!--机柜-->
      <cabinet-tab :obj="obj" @changeTab="changeTab" v-if="from == $CONSTANTS.fromRoute.dc && targetTab == 'cabinet'" v-show="subResizeShow"></cabinet-tab>
        <!--告警信息-->
      <alert-message-tab :from="from" :obj="obj" @changeTab="changeTab" v-if="((from == $CONSTANTS.fromRoute.rule || from == $CONSTANTS.fromRoute.asset || from == $CONSTANTS.fromRoute.endpoint) && targetTab == 'alertMessage')" v-show="subResizeShow"></alert-message-tab>
        <!--asset页的endpoint列表-->
      <endpoint-tab :from="from" :obj="obj" @changeTab="changeTab" v-if="from == $CONSTANTS.fromRoute.asset && targetTab == $CONSTANTS.fromRoute.endpoint" v-show="subResizeShow"></endpoint-tab>
        <!--endpoint-query-->
      <endpoint-query-tab :from="from" :obj="obj" @changeTab="changeTab" ref="endpointQuery" v-if="(from == $CONSTANTS.fromRoute.endpoint && targetTab == 'endpointQuery')" v-show="subResizeShow"></endpoint-query-tab>

        <!-- model-panel/asset-detail/project-overview的panel-->
      <panel-tab :from="from" :obj="obj" ref="panelTab" v-if="(from == $CONSTANTS.fromRoute.model || from == $CONSTANTS.fromRoute.asset || from == $CONSTANTS.fromRoute.project || from == $CONSTANTS.fromRoute.rule || from == $CONSTANTS.fromRoute.endpoint) && targetTab == 'panel'" v-show="subResizeShow"
                 @changeTab="changeTab" :targetTab.sync="targetTab" :detail="detail"></panel-tab>

    </div>
  </div>
</template>

<script>
  import cabinetTab from "./tabs/cabinetTab";
  import alertMessageTab from "./tabs/alertMessageTab";
  import endpointQueryTab from "./tabs/endpointQueryTab";
  import endpointTab from "./tabs/endpointTab";
  import panelTab from "./tabs/panelTab";

  export default {
    name: "bottomBox",
    components:{
      'cabinet-tab': cabinetTab,
      'alert-message-tab': alertMessageTab,
      'endpoint-query-tab': endpointQueryTab,
      'endpoint-tab': endpointTab,
      'panel-tab': panelTab,
    },
    props: {
      isFullScreen: false, //是否全屏
      subResizeShow: Boolean, //resize时，用v-show="subResizeShow"控制页面内容是否显示
      obj: Object, //关联的实体对象
      from: String, //来自哪个页面
      tabList: Array, //动态页签列表
      targetTab: String, //展示哪个页签
      detail: Object, //对象详情内容
      detailList: Array, //多个对象详情内容

      assetDetail: Object, //endpoint页的asset详情
    },
    data() {
      return {}
    },
    methods: {
      exitFullScreen() {
        this.$emit("exitFullScreen");
        this.$nextTick(() => {this.afterResize()});
      },
      fullScreen() {
        this.$emit("fullScreen");
        this.$nextTick(() => {this.afterResize()});
      },
      closeSubList() {
        this.$emit("closeSubList");
      },
      listResize(e) {
        this.$emit('listResize', e);
        this.$nextTick(() => {this.afterResize()});
      },
      changeTab(tab) {
        this.$emit('update:targetTab', tab);
      },
      afterResize() {
        if (this.from == this.$CONSTANTS.fromRoute.endpoint && this.targetTab == 'endpointQuery') {
          this.$refs.endpointQuery.tableReload();
        }
      }
    },
  }
</script>
