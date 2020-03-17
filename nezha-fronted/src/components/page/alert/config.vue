<style scoped>
  .config {
    height: 100%;
  }
</style>
<template>
  <div class="config">
    <div class="content-left">
      <div class="sidebar-title">{{$t('alert.alert')}}</div>
      <div class="sidebar-info">
        <div class="sidebar-info-item sidebar-info-top" @click="jumpTo('alertList')" id="alert-jump-alertlist">
          {{$t('alert.alertList')}}
        </div>
        <div class="sidebar-info-item sidebar-info-item-active">{{$t('alert.alertConfig')}}</div>
      </div>
    </div>
    <div class="content-right">
      <div class="top-tools">
        <div>

        </div>
        <div>
          <button id="alert-add" @click="toAdd"  :title="$t('overall.createAlertRule')"
                  class="nz-btn nz-btn-size-normal nz-btn-style-light float-right margin-l-20">
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
        ref="alertRuleTable"
        tooltip-effect="light"
        :height="$tableHeight.normal"
        v-scrollBar:el-table
        style="width: 100%;">
        <el-table-column
          :resizable="false"
          v-for="(item, index) in tablelable"
          v-if="item.show"
          :width="item.width"
          :key="`col-${index}`"
          :label="item.label"
          show-overflow-tooltip
          min-width="110px"
        >
          <template slot-scope="scope" :column="item">
            <div v-if="item.prop == 'option'" class="content-right-options">
              <span :title="$t('overall.view')" @click="detail(scope.row)" class="content-right-option" :id="'alert-detail-'+scope.row.id"><i class="nz-icon nz-icon-view"></i></span>
              <span v-if="scope.row.buildIn != 1" :title="$t('overall.edit')" @click="toEdit(scope.row)" class="content-right-option" :id="'alert-edit-'+scope.row.id"><i class="nz-icon nz-icon-edit"></i></span>
              <span :title="$t('overall.delete')" @click="del(scope.row)" class="content-right-option" :id="'alert-del-'+scope.row.id"><i  class="el-icon-delete"></i></span>
            </div>
            <span v-else-if="item.prop == 'severity'">
              <span v-if="scope.row[item.prop] == 'high'"><i class="el-icon-arrow-up"></i>&nbsp;{{severityData[1].value}}</span>
              <span style="padding-left: 18px;" v-if="scope.row[item.prop] == 'medium'">{{severityData[0].value}}</span>
              <span v-if="scope.row[item.prop] == 'low'"><i class="el-icon-arrow-down"></i>&nbsp;{{severityData[2].value}}</span>
            </span>
            <span v-else-if="item.prop == 'type'">
              <template v-for="type in typeData" v-if="type.key == scope.row[item.prop]">{{type.value}}</template>
            </span>
            <!--                        <span v-else-if="item.prop == 'linkObject' && scope.row[item.prop]">{{scope.row.type != 3 && scope.row.linkObject ? scope.row[item.prop].name : scope.row[item.prop].host}}</span>-->
            <template v-else-if="item.prop == 'linkObject'">
              <span v-if="(scope.row['type'] == 1 || scope.row['type'] == 2) && scope.row[item.prop]" class="link too-long-split"
                    @click="viewAlertType(scope.row['type'],scope.row[item.prop])" style="max-width: 125px;">{{scope.row[item.prop].name}}</span>
              <span v-else-if="scope.row['type'] == 3 && scope.row[item.prop]" class="link"
                    @click="viewAlertType(scope.row['type'],scope.row[item.prop].id)">{{scope.row[item.prop].host}}</span>
              <span v-else>-</span>
            </template>
            <template v-else-if="item.prop == 'alertName'">{{scope.row.alertName}}</template>
            <span v-else-if="scope.row[item.prop]">{{scope.row[item.prop]}}</span>
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
      <Pagination :tableId="tableId" :pageObj="pageObj" @pageNo='pageNo' @pageSize='pageSize' ref="Pagination"></Pagination>
      <button class="to-top" v-show="showTopBtn" @click="toTop"><i class="nz-icon nz-icon-top"></i></button>
    </div>
    <alert-config-box :parentAlertRule="alertRule" @reload="getTableData" ref="alertConfigBox"></alert-config-box>
    <project-box :project="viewProjectData" ref="projectBox" @reload="getTableData"></project-box>
    <module-box :module="viewModuleData" @reload="getTableData" ref="moduleBox"></module-box>
    <asset-edit-unit :edit-unit-show='viewAsset' @refreshData="getTableData" @sendStateData="tabControl"
                     ref="assetEditUnit"></asset-edit-unit>
    <element-set
      v-clickoutside="elementsetHide"
      :table-title="tableTitle"
      :dropCol="dropCol"
      @tablelable="tablelabelEmit"
      ref="elementset"
    ></element-set>
  </div>

</template>
<script>
  export default {
    name: "alert-config",
    data() {
      return {
        tableId: 'alertRuleTable', //需要分页的table的id，用于记录每页数量
        showTopBtn: false,
        searchMsg: { //给搜索框子组件传递的信息
          zheze_none: true,
          searchLabelList: [{
            id: 1,
            name: 'ID',
            type: 'input',
            label: 'id',
            disabled: false
          }, {
            id: 2,
            name: this.$t('alert.alertName'),
            type: 'input',
            label: 'alertName',
            disabled: false
          }, {
            id: 3,
            name: this.$t('alert.list.type'),
            type: 'select',
            label: 'alertType',
            disabled: false
          }, {
            id: 4,
            name: this.$t('alert.severity'),
            type: 'selectString',
            label: 'severity',
            disabled: false
          }],
        },
        searchLabel: { //搜索参数

        },

        alertRule: {
          id: '',
          alertName: '',
          type: '',
          linkObject: {id: '', name: ''},
          linkId: '',
          expr: '',
          last: '',
          severity: '',
          summary: '',
          description: '',
          receiver: '',
        },
        tablelable: [],
        dropCol: [],
        pageObj: {
          pageNo: 1,
          pageSize: 20,
          total: 0
        },
        severityData: [
          {
            key: 'medium',
            value: this.$t("alert.config.medium")
          },
          {
            key: 'high',
            value: this.$t("alert.config.high")
          },
          {
            key: 'low',
            value: this.$t("alert.config.low")
          }
        ],
        typeData: [
          {
            key: 1,
            value: this.$t('alert.config.typeOption.project')
          },
          {
            key: 2,
            value: this.$t('alert.config.typeOption.module')
          },
          {
            key: 3,
            value: this.$t('alert.config.typeOption.asset')
          }
        ],
        tableTitle: [
          {
            label: 'ID',
            prop: 'id',
            show: true,
            width: 80
          }, {
            label: this.$t("alert.alertName"),
            prop: 'alertName',
            show: true,
            width: 120
          }, {
            label: this.$t("alert.config.expr"),
            prop: 'expr',
            show: true,
          }, {
            label: this.$t("alert.list.type"),
            prop: 'type',
            show: true,
          }, {
            label: this.$t("alert.config.link"),
            prop: 'linkObject',
            show: true,
            width: 140
          }, {
            label: this.$t("alert.config.for"),
            prop: 'last',
            show: true,
          }, {
            label: this.$t('alert.severity'),
            prop: 'severity',
            show: true,
          }, {
            label: this.$t('alert.description'),
            prop: 'description',
            show: true,
          }, /*{
            label: this.$t('alert.config.receiver'),
            prop: 'receiver',
            show: true,
          }, */{
            label: this.$t('alert.config.option'),
            prop: 'option',
            show: true,
            width: 120
          }
        ],
        tableData: [],
        viewProjectData: {},
        viewModuleData: {},
        viewAsset: false,
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
      toEdit: function (u) {
        this.alertRule = Object.assign({}, u);
        this.$refs.alertConfigBox.show(true, true);
      },
      del: function (u) {
        this.$confirm(this.$t("tip.confirmDelete"), {
          confirmButtonText: this.$t("tip.yes"),
          cancelButtonText: this.$t("tip.no"),
          type: 'warning'
        }).then(() => {
          this.$delete("alert/rule?ids=" + u.id).then(response => {
            if (response.code === 200) {
              this.$message({type: 'success', message: this.$t("tip.deleteSuccess")});
              this.getTableData();
            } else {
              this.$message.error(response.msg);
            }
          })
        });
      },
      //asset弹框控制
      tabControl(data) {
        if (data === 'close') {
          this.viewAsset = false
          this.$refs['assetEditUnit'].tabView = false
        }
      },
      toAdd: function () {
        this.cleanAlertRule();
        this.$refs.alertConfigBox.show(true, true);
      },
      detail: function (u) {
        this.alertRule = Object.assign({}, u);
        this.$refs.alertConfigBox.show(true, false);
      },

      getTableData: function () {
        this.$set(this.searchLabel, "pageNo", this.pageObj.pageNo);
        this.$set(this.searchLabel, "pageSize", this.pageObj.pageSize);
        this.$get('alert/rule', this.searchLabel).then(response => {
          if (response.code == 200) {
            this.tableData = response.data.list;
            this.pageObj.total = response.data.total;
          }
        })
      },
      updateReceiverName: function (item) {
        //TODO 请求接口改名
        var code = 200;
        //this.$set(item, 'errorMessage', 'err');
        item.errorMessage = '';
        item.oldName = item.name;
        return code;
      },
      cleanAlertRule: function () {
        this.alertRule = {
          id: '',
          alertName: '',
          type: '',
          linkId: '',
          linkObject: {id: '', name: ''},
          expr: '',
          last: '',
          severity: '',
          summary: '',
          description: '',
          receiver: '',
        }
      },
      jumpTo(data, id) {
        this.$router.push({
          path: "/" + data,
          query: {
            t: +new Date()
          }
        });
      },
      pageNo(val) {
        this.pageObj.pageNo = val;
        this.getTableData();
      },
      pageSize(val) {
        this.pageObj.pageSize = val;
        localStorage.setItem('nz-pageSize-' + localStorage.getItem('nz-username') + '-' + this.tableId, val);
        this.getTableData();
        this.$nextTick(() => {
          this.gutterHandler(".nz-table");
        });
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
      },
      viewAlertType: function (type, typeObj) {
        this.closeViews();
        switch (type) {
          case 1:
            this.viewProjectData = JSON.parse(JSON.stringify(typeObj));
            this.$refs.projectBox.show(true);
            break;
          case 2:
            // this.fillProject(typeObj);
            if (typeObj.param) {
              let tempObj = JSON.parse(typeObj.param);
              this.$set(typeObj, 'paramObj', []);
              for (let k in tempObj) {
                typeObj.paramObj.push({key: k, value: tempObj[k]});
              }
            }
            this.viewModuleData = JSON.parse(JSON.stringify(typeObj));
            this.$refs.moduleBox.show(true);
            break;
          case 3:
            this.viewAsset = true;
            this.$refs.assetEditUnit.getAssetData(typeObj);
            this.$refs.assetEditUnit.tabView = true;
            break;
        }
      },
      fillProject: function (module) {
        this.$get('project', {"id": module.projectId}).then(response => {
          if (response.code == 200) {
            module.project = response.data.list[0];
          }
        })
      },
      closeViews: function () {
        this.$refs.alertConfigBox.show(false, false);
        this.$refs.projectBox.show(false, false);
        this.$refs.moduleBox.show(false, false);
        this.viewAsset = false;
      }
    },
    mounted() {
      //是否存在分页缓存
      let pageSize = localStorage.getItem('nz-pageSize-' + localStorage.getItem('nz-username') + '-' + this.tableId);
      if (pageSize != 'undefined') {
        this.pageObj.pageSize = pageSize
      }

      this.getTableData();
      this.$nextTick(() => {
        this.gutterHandler(".nz-table");
        //绑定滚动条事件，控制top按钮
        let el = this.$refs.alertRuleTable.$el.querySelector(".el-table__body-wrapper");
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
    }
  }
</script>
