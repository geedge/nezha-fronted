<style scoped>
  .model {
    height: 100%;
  }
</style>
<template>
  <div class="model">
    <left-menu >
      <div slot="content-left" class="slot-content">
      <div class="sidebar-title">{{$t('overall.config')}}</div>
      <div class="sidebar-info">
        <div class="sidebar-info-item sidebar-info-top" @click="jumpTo('account')" id="model-jump-account">
          {{$t('config.account.account')}}
        </div>
        <div class="sidebar-info-item" @click="jumpTo('promServer')" id="model-jump-prom">{{$t('config.promServer.promServerList')}}</div>
        <div class="sidebar-info-item" @click="jumpTo('dc')" id="model-jump-dc">
          {{$t('config.dc.dc')}}
        </div>
        <div class="sidebar-info-item sidebar-info-item-active" id="model-jump-model">
          {{$t('config.model.model')}}
        </div>
        <div class="sidebar-info-item" @click="jumpTo('mib')" id="model-jump-mib">
          {{$t('config.mib.mib')}}
        </div>
        <div class="sidebar-info-item" @click="jumpTo('system')" id="model-jump-system">
          {{$t('config.system.system')}}
        </div>
        <div class="sidebar-info-item" @click="jumpTo('terminallog')" id="modeel-jump-terminallog">
          {{$t('config.terminallog.terminallog')}}
        </div>
        <div class="sidebar-info-item" @click="jumpTo('operationlog')" id="model-jump-operation">
          {{$t('config.operationlog.operationlog')}}
        </div>
      </div>
    </div>
    <div slot="content-right" class="slot-content">
      <div class="top-tools">
        <div class="top-tool-main-right">
          <div class="top-tool-search">
            <search-input :searchMsg="searchMsg" @search="search"></search-input>
          </div>
          <button @click="toAdd" class="nz-btn nz-btn-size-normal nz-btn-style-light  margin-l-20"  :title="$t('overall.createModel')"
                  id="model-add">
                    <i class="nz-icon-create-square nz-icon"></i>
          </button>
        </div>
      </div>
      <el-table :data="tableData" border :height="$tableHeight.normal" style="width: 100%;" ref="modelTable" class="nz-table" v-scrollBar:el-table :cell-class-name="assetStatClassName">
        <el-table-column :resizable="false" v-for="(item, index) in tablelable" v-if="item.show" :width="item.width"
                         :key="`col-${index}`" :label="item.label">
          <template slot-scope="scope" :column="item">
            <template v-if="item.prop == 'vendor'" >{{scope.row[item.prop].value}}</template>
            <template v-else-if="item.prop == 'type'" >{{scope.row[item.prop].value}}</template>
            <template v-else-if="item.prop == 'assetStat' && scope.row.assetStat" >
              <el-popover
                placement="top"
                trigger="hover"
                :content="$t('overall.result.total') + '：' + scope.row.assetStat.total + '，' + $t('asset.createAssetTab.inStock') + '：' + scope.row.assetStat.inStock + '，' + $t('asset.createAssetTab.notInStock') + '：' + scope.row.assetStat.outStock">
                  <div slot="reference" class="dc-asset-states">
                    <span class="dc-asset-state dc-asset-state-total">{{scope.row.assetStat.total}}</span>
                    <span class="dc-asset-state dc-asset-state-in">{{scope.row.assetStat.inStock}}</span>
                    <span class="dc-asset-state dc-asset-state-out">{{scope.row.assetStat.outStock}}</span>
                  </div>
                </el-popover>
            </template>
            <div v-else-if="item.prop == 'option'" class="content-right-options">
              <!--<span :title="$t('overall.view')" @click="detail(scope.row)" class="content-right-option" :id="'model-detail-'+scope.row.id"><i class="nz-icon nz-icon-view"></i></span>-->
              <span :title="$t('overall.edit')" @click="toEdit(scope.row)" class="content-right-option" :id="'model-edit-'+scope.row.id"><i class="nz-icon nz-icon-edit"></i></span>
              <span :title="$t('overall.delete')" @click="del(scope.row)" class="content-right-option" :id="'model-del-'+scope.row.id"><i class="el-icon-delete"></i></span>
            </div>
            <template v-else-if="scope.row[item.prop]">{{scope.row[item.prop]}}</template>
            <template v-else>-</template>
          </template>
        </el-table-column>
        <el-table-column :resizable="false" width="28">
          <template slot="header" slot-scope="scope">
            <span @click.stop="elementsetShow('shezhi',$event)" class="nz-table-gear">
              <i class="nz-icon nz-icon-gear"></i>
            </span>
          </template>
        </el-table-column>
      </el-table>
      <Pagination :tableId="tableId" :pageObj="pageObj" @pageNo='pageNo' @pageSize='pageSize' ref="Pagination"></Pagination>
      <button class="to-top" v-show="showTopBtn" @click="$toTop"><i class="nz-icon nz-icon-top"></i></button>
    </div>
    </left-menu>
    <element-set
      v-clickoutside="elementsetHide"
      :table-title="tableTitle"
      :dropCol="dropCol"
      @tablelable="tablelabelEmit"
      ref="elementset"
    ></element-set>
    <model-box ref="modelBox" :model="model" @reload="getTableData"></model-box>
  </div>

</template>
<script>
  import bus from '../../../libs/bus';
  export default {
    name: "model",
    data() {
      return {
        tableId: 'modelTable', //需要分页的table的id，用于记录每页数量
        showTopBtn: false,
        model: {
          id: '',
          name: '',
          vendor: {id: '', value: '', code: '', type: ''},
          type: {id: '', value: '', code: '', type: ''},
          assetStat: {total: '', inStock: '', outStock: ''},
          remark: '',
          vendorCode: '',
          typeCode: '',
          uSize:1,
        },
        pageObj: {
          pageNo: 1,
          pageSize: 20,
          total: 0
        },
        tableTitle: [
          {
            label: 'ID',
            prop: 'id',
            show: true,
            width: 80
          }, {
            label: this.$t('overall.name'),
            prop: 'name',
            show: true,
          }, {
            label: this.$t('overall.type'),
            prop: 'type',
            show: true,
          }, {
            label: this.$t('config.model.vendor'),
            prop: 'vendor',
            show: true,
          }, {
            label: this.$t("config.model.assets"),
            prop: 'assetStat',
            show: true,
          }, {
            label: this.$t('config.account.option'),
            prop: 'option',
            show: true,
            width: 120
          }
        ],
        tablelable: [],
        dropCol: [],
        tableData: [],
        searchMsg: { //给搜索框子组件传递的信息
          zheze_none: true,
          searchLabelList: [{
            id: 1,
            name: 'ID',
            type: 'input',
            label: 'id',
            disabled: false
          }, {
            id: 5,
            name: 'DC',
            type: 'dc',
            label: 'dc',
            disabled: false
          }],
        },
        searchLabel: {}, //搜索参数
      }
    },
    methods: {
      elementsetShow(s, e) {
        var eventfixed = {
          shezhi: 0,
          screen: 0
        };
        eventfixed[s] = 1;
        e.preventDefault();
        this.$store.commit('setHeaderTable', this.tablelable);
        this.$store.commit('setEventfixed', eventfixed);
        const h = document.documentElement.clientHeight;
        const w = document.documentElement.clientWidth;
        const dw = this.$refs.elementset.$el.offsetWidth;
        const dh = this.$refs.elementset.$el.offsetHeight;
        let positionx =
          e.clientX + dw <= w - 10 ? e.clientX + 14 : e.clientX + 14 - dw;
        let positiony =
          e.clientY + dh <= h - 10
            ? e.clientY + 20
            : e.clientY + 20 - (e.clientY + dh - h);
        this.$store.commit('setPosition', {positionx, positiony});
      },
      elementsetHide() {
        //悬浮点击空白隐藏
        this.$refs.elementset.elementsetHide();
      },
      assetStatClassName(param) {
        if (param.column.label == this.$t("config.model.assets")) {
          return "asset-state";
        }
        return "";
      },
      tablelabelEmit(data) {
        //获取子组件传过来的参数
        this.$store.commit('setHeaderTable', data);
        this.tablelable = data;
      },
      clickos() {
        this.rightBox.show = false;
      },
      toEdit: function (u) {
        this.model = Object.assign({}, u);
        this.$refs.modelBox.show(true, true);
      },
      del: function (u) {
        this.$confirm(this.$t("tip.confirmDelete"), {
          confirmButtonText: this.$t("tip.yes"),
          cancelButtonText: this.$t("tip.no"),
          type: 'warning'
        }).then(() => {
          this.$delete("model?ids=" + u.id).then(response => {
            if (response.code === 200) {
              this.$message({duration: 1000, type: 'success', message: this.$t("tip.deleteSuccess")});
              this.getTableData();
              this.rightBox.show = false;
            } else {
              this.$message.error(response.msg);
            }
          })
        });
      },
      detail: function (u) {
        this.model = Object.assign({}, u);
        this.$refs.modelBox.show(true, false);
      },
      toAdd: function () {
        this.cleanModel();
        this.$refs.modelBox.show(true, true);
      },
      esc: function () {
        this.rightBox.show = false;
      },
      jumpTo(data, id) {
        bus.$emit("menu-change", data);
        this.$router.push({
          path: "/" + data,
          query: {
            t: +new Date()
          }
        });
      },
      getTableData: function () {
        this.tableData = [];
        this.$set(this.searchLabel, "pageNo", this.pageObj.pageNo);
        this.$set(this.searchLabel, "pageSize", this.pageObj.pageSize);
        this.$set(this.searchLabel, "stat", 1);
        this.$get('model', this.searchLabel).then(response => {
          if (response.code === 200) {
            this.tableData = response.data.list;
            this.pageObj.total = response.data.total
          }
        })
      },
      pageNo(val) {
        this.pageObj.pageNo = val;
        this.getTableData();
      },
      pageSize(val) {
        this.pageObj.pageSize = val;
        localStorage.setItem('nz-pageSize-' + localStorage.getItem('nz-username') + '-' + this.tableId, val);
        this.getTableData();
      },
      search: function (searchObj) {
        this.pageObj.pageNo = 1;
        this.searchLabel = {};
        for (let item in searchObj) {
          if (searchObj[item]) {
            this.$set(this.searchLabel, item, searchObj[item]);
          }
        }
        this.getTableData();
      },
      cleanModel() {
        this.model = {
          id: '',
          name: '',
          vendor: {id: '', value: '', code: '', type: ''},
          type: {id: '', value: '', code: '', type: ''},
          assetStat: {total: '', inStock: '', outStock: ''},
          remark: '',
          vendorCode: '',
          typeCode: '',
          uSize:1,
        };
      }
    },
    mounted: function () {
      //是否存在分页缓存
      let pageSize = localStorage.getItem('nz-pageSize-' + localStorage.getItem('nz-username') + '-' + this.tableId);
      if (pageSize != 'undefined' && pageSize != null) {
        this.pageObj.pageSize = pageSize
      }

      this.getTableData();
      this.$nextTick(() => {
        //绑定滚动条事件，控制top按钮
        let el = this.$refs.modelTable.$el.querySelector(".el-table__body-wrapper");
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
      this.tablelable = localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-" + this.$route.path)
        ? JSON.parse(localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-" + this.$route.path))
        : this.tableTitle;
      this.dropCol = localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-" + this.$route.path)
        ? JSON.parse(localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-" + this.$route.path))
        : this.tableTitle;
    },
    watch: {
    }
  }
</script>
