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
        <div class="window-control-btn" @click="closeSubList"><i class="el-icon-close"></i></div>
      </div>

        <!------TAB区------>
        <!--机柜-->
      <cabinet-tab v-show="subResizeShow" v-if="from == 'dc' && targetTab == 'cabinet'" :obj="obj" @changeTab="changeTab"></cabinet-tab>
        <!--告警信息-->
      <alert-message-tab v-show="subResizeShow" v-if="((from == 'alertRule' || from == 'asset') && targetTab == 'alertMessage')" :from="from" :obj="obj" @changeTab="changeTab"></alert-message-tab>
        <!--asset页的endpoint列表-->
      <endpoint-tab v-show="subResizeShow" v-if="from == 'asset' && targetTab == 'endpoint'" :from="from" :obj="obj" @changeTab="changeTab"></endpoint-tab>
        <!--endpoint-query-->
      <endpoint-query-tab v-show="subResizeShow" v-if="(from == 'endpoint' && targetTab == 'endpointQuery')" :from="from" :obj="obj" @changeTab="changeTab" ref="endpointQuery"></endpoint-query-tab>

        <!-- model-panel/asset-detail/project-overview的panel-->
      <panel-tab v-if="(from == 'model' || from == 'asset' || from == 'project' || from == 'alertRule' || from == 'endpoint') && targetTab == 'panel'" v-show="subResizeShow" :from="from" :obj="obj" ref="panelTab"
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
        let vm = this;

        if (this.from == 'endpoint' && this.targetTab == 'endpointQuery') {
          this.$refs.endpointQuery.tableReload();
        }

        //刷新滚动条
        let intervalFunc = setInterval(function(){
          if (!window.resizing) {
            let pss = document.querySelectorAll(".el-table__body-wrapper");
            if (pss) {
              pss.forEach(ps => {
                ps._ps_ && ps._ps_.update();
              });
            }
            vm.$refs.panelTab && vm.$refs.panelTab.$refs.dashboardScrollbar.update();
            clearInterval(intervalFunc);
          }
        }, 500);
      }
    }
  }
</script>
