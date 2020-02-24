<style scoped>
  .dc {
    height: 100%;
  }
</style>
<template>
  <div class="dc">
    <div class="content-left">
      <div class="sidebar-title">{{$t('overall.config')}}</div>
      <div class="sidebar-info">
        <div class="sidebar-info-item sidebar-info-top" @click="jumpTo('account')" id="prom-jump-account">
          {{$t('config.account.account')}}
        </div>
        <div class="sidebar-info-item" @click="jumpTo('promServer')" id="account-jump-promserver">
          {{$t('config.promServer.promServerList')}}
        </div>
        <div class="sidebar-info-item sidebar-info-item-active"  id="account-jump-dc">
          {{$t('config.dc.dc')}}
        </div>
      </div>
    </div>
    <div class="content-right">
      <div class="top-tools">
        <div></div>
        <div>
          <button type="button" @click=""  :title="$t('overall.createDatacenter')"
                  class="nz-btn nz-btn-size-normal nz-btn-style-light float-right " id="dc-add">
                  <i class="nz-icon-create-square nz-icon"></i>
          </button>
          <div class="top-tool-search float-right">
            <search-input :searchMsg="searchMsg" @search="search"></search-input>
          </div>
        </div>
      </div>
      <el-table
        class="nz-table"
        :data="tableData"
        border
        height="calc(100% - 160px)"
        style="width: 100%;">
        <el-table-column
          :resizable="false"
          v-for="(item, index) in tablelable"
          v-if="item.show"
          :width="item.width"
          :key="`col-${index}`"
          :label="item.label"
        >
          <template slot-scope="scope" :column="item">
            <div v-if="item.prop == 'option'" class="content-right-options">
              <span :title="$t('overall.view')" @click="detail(scope.row)" class="content-right-option" :id="'dc-detail-'+scope.row.id"><i class="nz-icon nz-icon-view"></i></span>
              &nbsp;
              <span :title="$t('overall.edit')" @click="edit(scope.row)" class="content-right-option" :id="'dc-edit-'+scope.row.id"><i class="nz-icon nz-icon-edit"></i></span>
              &nbsp;
              <span :title="$t('overall.delete')" @click="del(scope.row)" class="content-right-option" :id="'dc-del-'+scope.row.id"><i class="el-icon-delete"></i></span>
            </div>
            <template v-else-if="item.prop == 'principal'">
              <template v-for="item in userData">
                <template v-if="scope.row.principal == item.userId">{{item.username}}</template>
              </template>
            </template>
            <template v-else-if="item.prop == 'area'">
              <template v-if="scope.row.area">{{scope.row.area.name}}</template>
              <template v-else>-</template>
            </template>
            <template v-else-if="scope.row[item.prop]">{{scope.row[item.prop]}}</template>
            <template v-else>-</template>
          </template>
        </el-table-column>
        <el-table-column width="28">
          <template slot="header" slot-scope="scope">
            <span @click.stop="elementsetShow('shezhi',$event)" class="nz-table-gear">
              <i class="nz-icon nz-icon-gear"></i>
            </span>
          </template>
        </el-table-column>
      </el-table>
      <Pagination :pageObj="pageObj" @pageNo='pageNo' @pageSize='pageSize' ref="Pagination"></Pagination>
    </div>

    <element-set
      v-clickoutside="elementsetHide"
      :dropCol="dropCol"
      @tablelable="tablelabelEmit"
      :table-title="tableTitle"
      ref="elementset"
    ></element-set>

    <dc-box ref="dcBox" :dc="currentDc" :user-data="userData"></dc-box>
  </div>
</template>
<script>
  export default {
    name: "dc",
    data() {
      return {
        dc: {
          id: '',
          name: '',
          location: '',
          tel: '',
          principal: '',
          areaId: ''
        },
        currentDc: {
          id: '',
          name: '',
          location: '',
          tel: '',
          principal: '',
          areaId: ''
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
            label: this.$t("overall.name"),
            prop: 'name',
            show: true,
          }, {
            label: this.$t("config.dc.cabinetNum"),
            prop: 'cabinetNum',
            show: true,
          }, {
            label: this.$t("asset.createAssetTab.location"),
            prop: 'location',
            show: true,
          }, {
            label: this.$t('asset.createAssetTab.tel'),
            prop: 'tel',
            show: true,
          }, {
            label: this.$t('asset.createAssetTab.principal'),
            prop: 'principal',
            show: true
          }, {
            label: this.$t('config.dc.area'),
            prop: 'area',
            show: true
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
        userData: [],
        searchMsg: { //给搜索框子组件传递的信息
          zheze_none: true,
          searchLabelList: [{
            id: 10,
            name: this.$t('overall.name'),
            type: 'input',
            label: 'name',
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
      tablelabelEmit(data) {
        //获取子组件传过来的参数
        this.$store.commit('setHeaderTable', data);
        this.tablelable = data;
      },
      jumpTo(data, id) {
        this.$router.push({
          path: "/" + data,
          query: {
            t: +new Date()
          }
        });
      },
      edit: function (u) {
        this.currentDc = JSON.parse(JSON.stringify(u));
        this.$refs.dcBox.show(true, true);
      },
      detail(u) {
        this.currentDc = JSON.parse(JSON.stringify(u));
        this.$refs.dcBox.show(true, false);
      },
      del: function (u) {
        this.$confirm(this.$t("tip.confirmDelete"), {
          confirmButtonText: this.$t("tip.yes"),
          cancelButtonText: this.$t("tip.no"),
          type: 'warning'
        }).then(() => {
          this.$delete("idc/ids=" + u.userId).then(response => {
            if (response.code === 200) {
              this.$message({duration: 1000, type: 'success', message: this.$t("tip.deleteSuccess")});
              this.getTableData();
            } else {
              this.$message.error(response.msg);
            }
          });
        });
      },
      getTableData: function () {
        this.$set(this.searchLabel, "pageNo", this.pageObj.pageNo);
        this.$set(this.searchLabel, "pageSize", this.pageObj.pageSize);
        this.$get('idc', this.searchLabel).then(response => {
          if (response.code === 200) {
            this.tableData = response.data.list;
            this.pageObj.total = response.data.total
          }
        })
      },
      getUserData() {
        this.$get('sys/user/list', {pageSize: -1, pageNo: 1}).then(response => {
          if (response.code === 200) {
            this.userData = response.data.list;
          }
        })
      },
      pageNo(val) {
        this.pageObj.pageNo = val;
        this.getTableData();
      },
      pageSize(val) {
        this.pageObj.pageSize = val;
        this.getTableData();
      },
      search: function (searchObj) {
        this.searchLabel = {};
        this.pageObj.pageNo = 1;
        for (let item in searchObj) {
          if (searchObj[item]) {
            this.$set(this.searchLabel, item, searchObj[item]);
          }
        }
        this.getTableData();
      }
    },
    computed: {
    },
    mounted() {
      this.getTableData();
      this.$nextTick(function(){
        this.getUserData();
      });
      this.tablelable = localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-" + this.$route.path)
        ? JSON.parse(localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-" + this.$route.path))
        : this.tableTitle;
      this.dropCol = localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-" + this.$route.path)
        ? JSON.parse(localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-" + this.$route.path))
        : this.tableTitle;
    }
  }
</script>
