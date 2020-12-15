<template>
  <span>
    <div class="sub-top-tools">
      <div class="sub-list-tabs">
        <div class="sub-list-tab-title">{{$t("config.dc.dcName")}}：{{obj.name}}</div><div
        class="sub-list-tab sub-list-tab-active">{{$t("config.dc.cabinets")}}</div>
      </div>
      <div class="top-tool-right">
        <div class="top-tool-search">
          <search-input :searchMsg="searchMsg" @search="search" position="cabinet-bottom"></search-input>
        </div>
        <button :title="$t('overall.createCabinet')" @click="add" type="button" v-has="'dc_cabinet_toAdd'"
                class="nz-btn nz-btn-size-normal nz-btn-style-light float-right margin-l-20" id="cab-add">
          <i class="nz-icon-create-square nz-icon"></i>
        </button>
        <delete-button :delete-objs="batchDeleteObjs" @after="getTableData" api="cabinet" v-has="'dc_cabinet_delete'"></delete-button>
      </div>
    </div>
    <el-table
      class="nz-table"
      :data="tableData"
      border
      v-loading="loading"
      ref="cabTable"
      :cell-class-name="assetStatClassName"
      :height="$tableHeight.noPagination"
      style="width: 100%;"
      @selection-change="(selection)=>{this.batchDeleteObjs=selection}"
    >
        <el-table-column
          :resizable="false"
          type="selection"
          width="40"
          align="center">
        </el-table-column>
      <el-table-column
        :resizable="true"
        v-for="(item, index) in tableTitle"
        v-if="item.show"
        :key="`col-${index}`"
        :label="item.label"
      >
        <template slot-scope="scope" :column="item">
          <div v-if="item.prop == 'option'" class="content-right-options">
            <span :id="'dc-edit-'+scope.row.id" :title="$t('overall.edit')" @click="edit(scope.row)" class="content-right-option" v-has="'dc_cabinet_toEdit'"><i class="nz-icon nz-icon-edit"></i></span>
            <span :id="'dc-del-'+scope.row.id" :title="$t('overall.delete')" @click="del(scope.row)" class="content-right-option" v-has="'dc_cabinet_delete'"><i class="nz-icon nz-icon-delete"></i></span>
          </div>
          <template v-else-if="item.prop == 'assetStat'">
            <el-popover
              placement="top-start"
              offset="-100"
              trigger="hover"
              :content="$t('overall.result.total') + '：' + scope.row.assetStat.total + '，' + $t('asset.inStock') + '：' + scope.row.assetStat.inStock + '，' + $t('asset.notInStock') + '：' + scope.row.assetStat.outStock + '，' + $t('asset.suspended') + '：' + scope.row.assetStat.suspended">
              <div slot="reference" class="dc-asset-states">
                <span class="dc-asset-state dc-asset-state-total">{{scope.row.assetStat.total}}</span>
                <span class="dc-asset-state dc-asset-state-in">{{scope.row.assetStat.inStock}}</span>
                <span class="dc-asset-state dc-asset-state-out">{{scope.row.assetStat.outStock}}</span>
                <span class="dc-asset-state dc-asset-state-suspended">{{scope.row.assetStat.suspended}}</span>
              </div>
            </el-popover>

          </template >
          <template v-else-if="item.prop == 'alertStat'">
            <el-popover
              placement="top-start"
              offset="-128"
              trigger="hover"
              :content="$t('overall.result.total') + '：' + scope.row.alertStat.total + '，' + $t('alert.config.P1') + '：' + scope.row.alertStat.P1 + '，' + $t('alert.config.P2') + '：' + scope.row.alertStat.P2+ '，' + $t('alert.config.P3') + '：' + scope.row.alertStat.P3">
              <div slot="reference" class="dc-asset-states">
                <span class="dc-asset-state dc-asset-state-total">{{scope.row.alertStat.total}}</span>
                <span class="dc-asset-state alert-level-P1">{{scope.row.alertStat.P1}}</span>
                <span class="dc-asset-state alert-level-P2">{{scope.row.alertStat.P2}}</span>
                <span class="dc-asset-state alert-level-P3">{{scope.row.alertStat.P3}}</span>
              </div>
            </el-popover>
          </template >
          <template v-else-if="scope.row[item.prop]">{{scope.row[item.prop]}}</template>
          <template v-else>-</template>
        </template>
      </el-table-column>
    </el-table>
    <transition name="right-box">
      <cabinet-box v-if="rightBox.show" :cabinet="cabinet" :current-dc="currentDc" ref="cabinetEditBox" @close="closeRightBox"></cabinet-box>
    </transition>
    <button class="to-top" v-show="showTopBtn" @click="$('ps', 1)"><i class="nz-icon nz-icon-top"></i></button>
  </span>
</template>

<script>
  import cabinetBox from "../../rightBox/cabinetBox";
  import deleteButton from "../../deleteButton";
  export default {
    name: "cabinetTab",
    components: {
      "cabinet-box": cabinetBox,
      'delete-button':deleteButton,
    },
    props: {
      obj: Object, //关联的实体对象
    },
    data() {
      return {
        cabinet: {},
        blankCabinet: {
          id:'',
          idcId:'',
          name:'',
          remark:'',
          seq:'',
          uSize:1
        },
        batchDeleteObjs:[],
        rightBox: {show: false},
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
            label:this.$t('asset.uSize'),
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
              name:this.$t('asset.uSize'),
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
      // 切换tab
      changeTab(tab) {
        this.$emit('changeTab', tab);
      },
      add() {
        this.cabinet = this.newCabinet();
        this.rightBox.show = true;
      },
      closeRightBox(refresh) {
        this.rightBox.show = false;
        if (refresh) {
          this.getTableData();
        }
      },
      newCabinet() {
        return JSON.parse(JSON.stringify(this.blankCabinet));
      },
      edit(cabinet) {
        this.cabinet = JSON.parse(JSON.stringify(cabinet));
        this.rightBox.show = true;
      },
      getTableData() {
        if (!this.hasButton('dc_cabinet_view')) {
          this.$message.error(this.$t("tip.noAccess"));
          return;
        }
        this.tableData = [];
        this.loading = true;
        this.$set(this.searchLabel, "pageNo", 1);
        this.$set(this.searchLabel, "pageSize", -1);
        this.$get("/cabinet", this.searchLabel).then(response => {
          this.loading = false;
          if (response.code == 200) {
            this.tableData = response.data.list;
          }
        });
      },
      search(searchObj) {
        this.searchLabel = {idcId: this.currentDc.id, pageNo: 1, pageSize: -1};
        for (let item in searchObj) {
          if (searchObj[item]) {
            this.$set(this.searchLabel, item, searchObj[item]);
          }
        }
        if(this.$refs.cabTable&&this.$refs.cabTable.bodyWrapper){
          this.$refs.cabTable.bodyWrapper.scrollTop = 0;
        }
        this.getTableData();
      },
      assetStatClassName(param) {
        if (param.column.label == this.$t("config.model.assets") || param.column.label == this.$t("alert.alert")) {
          return "asset-state";
        }
        return "";
      },
      del:function(cabinet){
        this.$confirm(this.$t("tip.confirmDelete"), {
          confirmButtonText: this.$t("tip.yes"),
          cancelButtonText: this.$t("tip.no"),
          type: 'warning'
        }).then(() => {
          this.$delete('/cabinet?ids='+cabinet.id).then(response=>{
            if(response.code ==  200){
              this.$message({duration: 2000, type: 'success', message: this.$t("tip.saveSuccess")});
              this.getTableData();
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
            this.getTableData();
          }
        }
      },
    },
  }
</script>

<style scoped>

</style>
