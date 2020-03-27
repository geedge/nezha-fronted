<template>
  <span>
    <!-- 副列表 endpoint query-->
    <div @mousedown="listResize" class="sub-list-resize" v-if="showSubList && !isFullScreen">一</div>
    <div class="sub-list" v-if="showSubList">
      <!--窗口大小控制-->
      <div class="sub-list-window-control">
        <!--半屏-->
        <div class="window-control-btn" v-if="isFullScreen" @click="exitFullScreen"><i class="nz-icon nz-icon-exit-full-screen"></i></div>
        <!--全屏-->
        <div class="window-control-btn" v-if="!isFullScreen" @click="fullScreen"><i class="el-icon-full-screen"></i></div>
        <!--关闭-->
        <div class="window-control-btn" @click="closeSubList"><i class="el-icon-close"></i></div>
      </div>

      <!------TAB区------>
      <!--通用详情-->
      <common-detail-tab v-show="subResizeShow" :obj="obj" :from="from" :detail="detail"
                         v-if="targetTab == 'detail'"
                         @changeTab="changeTab"
      ></common-detail-tab>
      <!--机柜-->
      <cabinet-tab v-show="subResizeShow" v-if="from == 'dc' && targetTab == 'cabinet'" :obj="obj" @changeTab="changeTab"></cabinet-tab>
    </div>
  </span>
</template>

<script>
  import commonDetailTab from "./tabs/commonDetailTab"
  import cabinetTab from "./tabs/cabinetTab";

  export default {
    name: "cabinetBox",
    components:{
      'common-detail-tab': commonDetailTab,
      'cabinet-tab': cabinetTab,
    },
    props: {
      isFullScreen: false, //是否全屏
      showSubList: Boolean, //是否显示
      subResizeShow: Boolean, //resize时，用v-show="subResizeShow"控制页面内容是否显示
      obj: Object, //关联的实体对象
      from: String, //来自哪个页面
      targetTab: String, //展示哪个页签
      detail: Array, //对象详情内容
    },
    data() {
      return {}
    },
    methods: {
      exitFullScreen() {
        this.$emit("exitFullScreen");
      },
      fullScreen() {
        this.$emit("fullScreen");
      },
      closeSubList() {
        this.$emit("closeSubList");
      },
      listResize(e) {
        this.$emit('listResize', e);
      },
      changeTab(tab) {
        this.targetTab = tab;
      }
    }
  }
</script>

<style lang="scss">
  /*重写el-loading样式*/
  .nz-table .el-loading-spinner .circular{
    width: 42px;
    height: 42px;
    animation: loading-rotate 2s linear infinite;
    display: none;
  }
  .nz-table .el-loading-spinner{
    background: url(../../../assets/img/loading.gif) no-repeat;
    background-size: 48px 48px;
    width: 100%;
    height: 100%;
    position: relative;
    top: 50%;
    left: 48.5%;
  }
</style>
