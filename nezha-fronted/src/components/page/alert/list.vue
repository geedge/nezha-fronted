<style scoped>
  .list {
    height: 100%;
  }
</style>
<template>
  <div class="list">
    <div class="content-left">
      <div class="sidebar-title">{{$t('alert.alert')}}</div>
      <div class="sidebar-info">
        <div class="sidebar-info-item sidebar-info-top sidebar-info-item-active">{{$t('alert.alertList')}}</div>
        <div class="sidebar-info-item" @click="jumpTo('alertConfig')" id="alert-jump-config">
          {{$t('alert.alertConfig')}}
        </div>
      </div>
    </div>
    <div class="content-right">
      <div class="top-tools">
        <div></div>
        <div class="top-tool-search float-right">
          <search-input :searchMsg="searchMsg" @search="search"></search-input>
        </div>
      </div>
      <el-table
        class="nz-table"
        :data="tableData"
        border
        ref="alertListTable"
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
            <template v-if="item.prop == 'alertRule'">
              <div class="link too-long-split"
                 @click="viewRule(scope.row[item.prop].id)" :id="'view-rule-'+scope.row[item.prop].id"
                 v-if="scope.row[item.prop].alertName">{{scope.row[item.prop].alertName}}</div>
              <template v-else>-</template>
            </template>
            <div v-else-if="item.prop == 'type'" class="content-right-options">
              <span v-if="scope.row[item.prop] == 1">Project</span>
              <span v-if="scope.row[item.prop] == 2">Module</span>
              <span v-if="scope.row[item.prop] == 3">Device</span>
            </div>
            <template v-else-if="item.prop == 'summary'">
              <template v-if="scope.row[item.prop]">{{scope.row[item.prop]}}</template>
              <template v-else>-</template>
            </template>
            <template v-else-if="item.prop == 'description'">
              <template v-if="scope.row[item.prop]">{{scope.row[item.prop]}}</template>
              <span v-else>-</span>
            </template>
            <span v-else-if="item.prop == 'severity'">
              <span v-if="scope.row[item.prop] == 'high'"><i class="el-icon-arrow-up"></i>&nbsp;{{severityData[1].value}}</span>
              <span style="padding-left: 18px;" v-if="scope.row[item.prop] == 'medium'">{{severityData[0].value}}</span>
              <span v-if="scope.row[item.prop] == 'low'"><i class="el-icon-arrow-down"></i>&nbsp;{{severityData[2].value}}</span>
            </span>
            <div v-else-if="item.prop == 'linkObject'">
              <span v-if="(scope.row['type'] == 1 || scope.row['type'] == 2) && scope.row[item.prop]" class="link too-long-split"
                    @click="viewAlertType(scope.row['type'],scope.row[item.prop])" style="max-width: 125px;"
                    :id="'link-obj-'+scope.row['type']+'-'+scope.row[item.prop].id">{{scope.row[item.prop].name}}</span>
              <span v-else-if="scope.row['type'] == 3 && scope.row[item.prop]" class="link"
                    @click="viewAlertType(scope.row['type'],scope.row[item.prop].id)"
                    :id="'link-obj-'+scope.row['type']+'-'+scope.row[item.prop].id">{{scope.row[item.prop].host}}</span>
              <span v-else>-</span>
            </div>
            <div v-else-if="item.prop == 'state'">
              <span class="">
                {{scope.row['state'] == 1 ? "Pending" : ""}}
                {{scope.row['state'] == 2 ? "Expired" : ""}}
              </span>
            </div>
            <span v-else>{{scope.row[item.prop]}}</span>
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
      <button class="to-top" v-show="showTopBtn" @click="toTop()"><i class="nz-icon nz-icon-top"></i></button>
    </div>
    <alert-config-box :parentAlertRule="viewRuleData" @reload="getAlertList" ref="alertConfigBox"></alert-config-box>
    <project-box :project="viewProjectData" ref="projectBox" @reload="getAlertList"></project-box>
    <module-box :module="viewModuleData" @reload="getAlertList" ref="moduleBox"></module-box>
    <asset-edit-unit :edit-unit-show='viewAssetState' @refreshData="getAlertList" @sendStateData="tabControl"
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
    name: "alertList",
    data() {
      return {
        tableId: 'alertListTable', //需要分页的table的id，用于记录每页数量
        showTopBtn: false,
        pageObj: {
          pageNo: 1,
          pageSize: 20,
          total: 13
        },
        tableTitle: [
          {
            label: this.$t("alert.alertName"),
            prop: 'alertRule',
            show: true,
            width: 180
          }, {
            label: this.$t("alert.list.type"),
            prop: 'type',
            show: true,
            width: 100
          }, {
            label: this.$t("alert.list.linked"),
            prop: 'linkObject',
            show: true,
            width: 140
          }, {
            label: this.$t("alert.severity"),
            prop: 'severity',
            show: true,
            width: 100
          }, {
            label: this.$t('alert.summary'),
            prop: 'summary',
            show: true
          }, {
            label: this.$t('alert.description'),
            prop: 'description',
            show: true
          }, {
            label: this.$t('alert.list.state'),
            prop: 'state',
            show: true,
            width: 100
          }, {
            label: this.$t("alert.startAt"),
            prop: 'startAt',
            show: true,
          }, {
            label: this.$t('alert.endAt'),
            prop: 'endAt',
            show: true,
          }
        ],
        searchMsg: { //给搜索框子组件传递的信息
          zheze_none: true,
          searchLabelList: [{
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
          }, {
            id: 11,
            name: this.$t('asset.asset'),
            type: 'asset',
            label: 'asset',
            disabled: true
          }],
        },
        searchLabel: { //搜索参数

        },
        tablelable: [],
        dropCol: [],
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
        tableData: [],
        viewRuleData: {
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
        viewProjectData: {id: '', name: '', remark: ''},
        viewModuleData: {id: '', name: '', project: {}, port: '', path: '', param: '', paramObj: []},
        viewAssetState: false,
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
      getAlertList: function () {
        this.$set(this.searchLabel, "pageNo", this.pageObj.pageNo);
        this.$set(this.searchLabel, "pageSize", this.pageObj.pageSize);
        this.$get('alert/message', this.searchLabel).then(response => {
          if (response.code == 200) {
            this.tableData = response.data.list
            this.pageObj.total = response.data.total
          }
        })
      },
      //asset弹框控制
      tabControl(data) {
        if (data === 'close') {
          this.viewAssetState = false
          this.$refs['assetEditUnit'].tabView = false
        }
      },
      jumpTo(data, id) {
        this.$store.state.assetData.moduleData = data
        this.$store.state.assetData.selectedData = id
        this.$router.push({
          path: "/" + data,
          query: {
            t: +new Date()
          }
        });
      },
      pageNo(val) {
        this.pageObj.pageNo = val;
        this.getAlertList();
      },
      pageSize(val) {
        this.pageObj.pageSize = val;
        localStorage.setItem('nz-pageSize-' + localStorage.getItem('nz-username') + '-' + this.tableId, val);
        this.getAlertList();
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
        this.getAlertList();
      },
      viewRule: function (id) {
        this.closeViews();
        this.$get('alert/rule', {"id": id}).then(response => {
          if (response.code == 200) {
            this.viewRuleData = response.data.list[0];
            this.$refs.alertConfigBox.show(true);
          }
        })
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
            let tempObj = JSON.parse(typeObj.param)
            this.$set(typeObj, 'paramObj', []);
            for (let k in tempObj) {
              typeObj.paramObj.push({key: k, value: tempObj[k]});
            }
            this.viewModuleData = JSON.parse(JSON.stringify(typeObj));

            this.$refs.moduleBox.show(true);
            break;
          case 3:
            this.viewAssetState = true;
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
        this.viewAssetState = false;
      }
    },
    mounted() {
      //是否存在分页缓存
      let pageSize = localStorage.getItem('nz-pageSize-' + localStorage.getItem('nz-username') + '-' + this.tableId);
      if (pageSize) {
        this.pageObj.pageSize = pageSize
      }

      this.getAlertList();
      this.$nextTick(() => {
        //绑定滚动条事件，控制top按钮
        let el = this.$refs.alertListTable.$el.querySelector(".el-table__body-wrapper");
        if (el._ps_) {
          el.addEventListener("ps-scroll-y", () => {
            if (el._ps_.scrollbarYTop > 50) {
              this.showTopBtn = true;
            } else {
              this.showTopBtn = false;
            }
          });
        }
        this.$nextTick(() => {
          this.gutterHandler(".nz-table");
        });
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
