<template>
  <span>
    <!-- 副列表 endpoint query-->
    <div @mousedown="listResize" class="sub-list-resize" v-if="showSubList && !isFullScreen">一</div>
    <div class="sub-list" v-if="showSubList">
      <div class="sub-top-tools" v-show="subResizeShow">
        <div class="sub-list-tabs margin-l-20" style="width: calc(100% - 780px);">
          <div class="sub-list-tab">{{$t("overall.query")}}</div>
          <span class="sub-list-tab-txt">{{$t("asset.createAssetTab.dcName")}}：{{obj.name}}</span>
        </div>
        <div class="top-tool-right">
          <div class="top-tool-search">
            <search-input :searchMsg="searchMsg" @search="search"></search-input>
          </div>
          <button type="button" @click="toAddCabinet" :title="$t('overall.createCabinet')"
                class="nz-btn nz-btn-size-normal nz-btn-style-light float-right margin-l-20" id="cab-add">
            <i class="nz-icon-create-square nz-icon"></i>
          </button>
          <div class="sub-list-window-control">
            <!--半屏-->
            <div class="window-control-btn" v-if="isFullScreen" @click="exitFullScreen"><i class="nz-icon nz-icon-exit-full-screen"></i></div>
            <!--全屏-->
            <div class="window-control-btn" v-if="!isFullScreen" @click="fullScreen"><i class="el-icon-full-screen"></i></div>
            <!--关闭-->
            <div class="window-control-btn" @click="closeSubList"><i class="el-icon-close"></i></div>
          </div>
        </div>
      </div>
      <el-table
        class="nz-table"
        :data="tableData"
        border
        v-loading="loading"
        ref="cabTable"
        v-scrollBar:el-table
        :height="$tableHeight.noPagination"
        style="width: 100%;">
        <el-table-column
          :resizable="false"
          v-for="(item, index) in tableTitle"
          v-if="item.show"
          :width="item.width"
          :key="`col-${index}`"
          :label="item.label"
        >
          <template slot-scope="scope" :column="item">
            <div v-if="item.prop == 'option'" class="content-right-options">
              <span :title="$t('overall.edit')" @click="editCabinet(scope.row)" class="content-right-option" :id="'dc-edit-'+scope.row.id"><i class="nz-icon nz-icon-edit"></i></span>
              &nbsp;
              <span :title="$t('overall.delete')" @click="delCabinet(scope.row)" class="content-right-option" :id="'dc-del-'+scope.row.id"><i class="el-icon-delete"></i></span>
            </div>
            <template v-else-if="item.prop == 'assetStat'">
              <el-popover
                placement="top-start"
                offset="-100"
                trigger="hover"
                :content="$t('overall.result.total') + '：' + scope.row.assetStat.total + '，' + $t('asset.createAssetTab.inStock') + '：' + scope.row.assetStat.inStock + '，' + $t('asset.createAssetTab.notInStock') + '：' + scope.row.assetStat.outStock">
                <div slot="reference" class="dc-asset-states">
                  <span class="dc-asset-state dc-asset-state-total">{{scope.row.assetStat.total}}</span>
                  <span class="dc-asset-state dc-asset-state-in">{{scope.row.assetStat.inStock}}</span>
                  <span class="dc-asset-state dc-asset-state-out">{{scope.row.assetStat.outStock}}</span>
                </div>
              </el-popover>

            </template >
            <template v-else-if="item.prop == 'alertStat'">
              <el-popover
                placement="top-start"
                offset="-128"
                trigger="hover"
                :content="$t('overall.result.total') + '：' + scope.row.alertStat.total + '，' + $t('alert.config.high') + '：' + scope.row.alertStat.high + '，' + $t('alert.config.medium') + '：' + scope.row.alertStat.medium+ '，' + $t('alert.config.low') + '：' + scope.row.alertStat.low">
                <div slot="reference" class="dc-asset-states">
                  <span class="dc-asset-state dc-asset-state-total">{{scope.row.alertStat.total}}</span>
                  <span class="dc-asset-state dc-asset-state-high">{{scope.row.alertStat.high}}</span>
                  <span class="dc-asset-state dc-asset-state-out">{{scope.row.alertStat.medium}}</span>
                  <span class="dc-asset-state dc-asset-state-in">{{scope.row.alertStat.low}}</span>
                </div>
              </el-popover>

            </template >
            <template v-else-if="scope.row[item.prop]">{{scope.row[item.prop]}}</template>
            <template v-else>-</template>
          </template>
        </el-table-column>
      </el-table>
      <cabinet-box :cur-cabinet="currentCabinet" :cur-idc="currentDc" ref="cabinetEditBox" @after="getCabinetList"></cabinet-box>
      <button class="to-top" v-show="showTopBtn && subResizeShow" @click="toTop('ps', 1)"><i class="nz-icon nz-icon-top"></i></button>
    </div>
  </span>
</template>

<script>
  import cabinetBox from "../../common/rightBox/cabinetBox";
  export default {
    name: "cabinetBox",
    components:{
      'cabinet-box':cabinetBox
    },
    props: {
      isFullScreen: false, //是否全屏
      showSubList: Boolean, //是否显示
      subResizeShow: Boolean, //resize时，用v-show="subResizeShow"控制页面内容是否显示
      obj: Object, //关联的实体对象，有："asset"、"alertRule"
    },
    data() {
      return {
        currentCabinet: {
          id:'',
          idcId:'',
          name:'',
          remark:'',
          seq:'',
          uSize:0
        },
        showTopBtn: false, //top按钮是否显示
        loading: false,
        currentDc: {},
        tableTitle: [
          {
            label: 'ID',
            prop: 'id',
            show: true,
            width: 80
          },
          {
            label:this.$t('overall.name'),
            prop:'name',
            show:true
          },
          {
            label:this.$t('asset.createAssetTab.uSize'),
            prop:'uSize',
            show:true
          },
          {
            label:this.$t('config.dc.assets'),
            prop:'assetStat',
            show:true
          },
          {
            label:this.$t('alert.alert'),
            prop:'alertStat',
            show:true
          },
          {
            label:this.$t('config.dc.remark'),
            prop:'remark',
            show:true
          },
          {
            label: this.$t('config.account.option'),
            prop: 'option',
            show: true,
            width: 120
          }
        ],
        searchMsg: { //给搜索框子组件传递的信息
          zheze_none: true,
          searchLabelList: [
            {
              id: 11,
              name: this.$t('overall.name'),
              type: 'input',
              label: 'name',
              disabled: false
            },
            {
              id:12,
              name:this.$t('asset.createAssetTab.uSize'),
              label:'uSize',
              disabled: false
            },
            {
              id:13,
              name:this.$t('config.dc.remark'),
              label:'remark',
              disabled: false
            }
          ],
        },
        searchLabel: { //搜索参数
        },
        tableData: [],
      }
    },
    methods: {
      toAddCabinet:function(){
        this.$refs.cabinetEditBox.show(true,true);
        this.$refs.cabinetEditBox.reset();
      },
      editCabinet(cabinet) {
        this.currentCabinet = JSON.parse(JSON.stringify(cabinet));
        console.info(this.$refs.cabinetEditBox)
        this.$refs.cabinetEditBox.show(true, true);
      },
      getCabinetList() {
        this.tableData = [];
        this.loading = true;
        this.$set(this.searchLabel, "pageNo", 1);
        this.$set(this.searchLabel, "pageSize", -1);
        this.$get("/cabinet", this.searchLabel).then(response => {
          if (response.code == 200) {
            this.loading = false;
            this.tableData = response.data.list;
          }
        });
      },
      search: function (searchObj) {
        this.searchLabel = {idcId: this.currentDc.id, pageNo: 1, pageSize: -1};
        for (let item in searchObj) {
          if (searchObj[item]) {
            this.$set(this.searchLabel, item, searchObj[item]);
          }
        }
        this.getCabinetList();
      },
      exitFullScreen() {
        this.$emit("exitFullScreen");
      },
      fullScreen() {
        this.$emit("fullScreen");
      },
      closeSubList() {
        this.$emit("closeSubList");
        this.tableData = [];
      },
      listResize(e) {
        this.$emit('listResize', e);
      },
      delCabinet:function(cabinet){
        this.$confirm(this.$t("tip.confirmDelete"), {
          confirmButtonText: this.$t("tip.yes"),
          cancelButtonText: this.$t("tip.no"),
          type: 'warning'
        }).then(() => {
          this.$delete('/cabinet?ids='+cabinet.id).then(response=>{
            if(response.code ==  200){
              this.$message({duration: 2000, type: 'success', message: this.$t("tip.saveSuccess")});
              this.getCabinetList();
            }else{
              this.$message.error(response.msg);
            }
          })
        })
      },
    },
    watch: {
      obj: {
        immediate: true,
        deep: true,
        handler(n) {
          if (n) {
            this.currentDc = JSON.parse(JSON.stringify(n));
            this.searchLabel = {idcId: this.currentDc.id};
            this.getCabinetList();
          }
        }
      }
    },
    mounted() {
      this.$nextTick(() => {
        //绑定滚动条事件，控制top按钮
        let el = this.$refs.cabTable.$el.querySelector(".el-table__body-wrapper");
        if (el._ps_) {
          el.addEventListener("ps-scroll-y", () => {
            if (el._ps_.scrollbarYTop > 50) {
              this.showTopBtn = true;
            } else {
              this.showTopBtn = false;
            }
          });
        }
      });
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
