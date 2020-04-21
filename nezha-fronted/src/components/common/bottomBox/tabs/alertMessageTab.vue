<template>
  <span class="sub-list">
    <div class="sub-top-tools">
      <div class="sub-list-tabs">
        <div class="sub-list-tab-title">
          <template v-if="from == 'asset'">{{$t("project.endpoint.asset")}}：{{obj.host}}</template>
          <template v-if="from == 'alertRule'">{{$t("alert.alertName")}}：{{obj.alertName}}</template>
        </div><div
        class="sub-list-tab" @click="changeTab('detail')">{{$t("overall.detail")}}</div><div
        class="sub-list-tab sub-list-tab-active">{{$t("asset.tableTitle.alerts")}}</div><div v-if="from == 'asset'"
        class="sub-list-tab" @click="changeTab('endpoint')">{{$t("asset.tableTitle.modules")}}</div>
      </div>
      <div class="top-tool-right">
        <div class="top-tool-search">
          <search-input :default-item="'alertMessageState'" :default-value="defaultSearchValue" :searchMsg="searchMsg" @search="search"></search-input>
        </div>
        <button type="button" @click="importBox.show = true" :title="$t('overall.exportExcelLower')"
            class="nz-btn nz-btn-size-normal nz-btn-style-light margin-l-20" id="alert-list-export">
          <i class="el-icon-download"></i>
        </button>
      </div>
    </div>
    <!--删除message按钮-->
    <div class="el-popover alert-clean-pop" @click="toDeleteMessage" v-if="deleteBox.ids.length > 0">
      <i style="cursor: pointer" class="el-icon-delete"></i>
    </div>

    <el-table
      class="nz-table"
      :data="tableData"
      border
      v-loading="loading"
      ref="alertMessageSubList"
      tooltip-effect="light"
      v-scrollBar:el-table="'large'"
      :height="$tableHeight.openSubList.subList"
      :cell-class-name="labelsClassName"
      @selection-change="selectChange"
      style="width: 100%;">
      <el-table-column
        :resizable="false"
        type="selection"
        width="38"
        align="center"
      >
      </el-table-column>
      <el-table-column
        :resizable="false"
        v-for="(item, index) in tablelable"
        v-if="item.show"
        :width="item.width"
        :key="`col-${index}`"
        :label="item.label"
        :show-overflow-tooltip="item.prop != 'labels'"
        min-width="110px"
      >
        <template slot-scope="scope" :column="item">
          <template v-if="item.prop == 'alertRule'">
            <div class="too-long-split" :id="'view-rule-'+scope.row[item.prop].id"
                 v-if="scope.row[item.prop].alertName">{{scope.row[item.prop].alertName + ' ' + $t('overall.active')}}</div>
            <template v-else>-</template>
          </template>
          <!--<div v-else-if="item.prop == 'type'" class="content-right-options">
            <span v-if="scope.row[item.prop] == 1">Project</span>
            <span v-if="scope.row[item.prop] == 2">Module</span>
            <span v-if="scope.row[item.prop] == 3">Device</span>
          </div>-->
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
          <!--<div v-else-if="item.prop == 'linkObject'">
            <span v-if="(scope.row['type'] == 1 || scope.row['type'] == 2) && scope.row[item.prop]" class="link too-long-split"
                  @click="viewAlertType(scope.row['type'],scope.row[item.prop])" style="max-width: 125px;"
                  :id="'link-obj-'+scope.row['type']+'-'+scope.row[item.prop].id">{{scope.row[item.prop].name}}</span>
            <span v-else-if="scope.row['type'] == 3 && scope.row[item.prop]" :class="{'link': from == 'alertRule'}"
                  @click="viewAlertType(scope.row['type'],scope.row[item.prop].id)"
                  :id="'link-obj-'+scope.row['type']+'-'+scope.row[item.prop].id">{{scope.row[item.prop].host}}</span>
            <span v-else>-</span>
          </div>-->
          <template v-else-if="item.prop == 'labels'">
            <el-tag v-if="key != 'alertname' && key != 'severity' && key != 'linkId'"
                    :key="key"
                    type="info"
                    size="mini" v-for="(value, key) in scope.row.labels" class="alert-message-tag">{{tagValue(key, value)}}</el-tag>
          </template>
          <div v-else-if="item.prop == 'state'">
            <span class="">
              {{scope.row['state'] == 1 ? "Pending" : ""}}
              {{scope.row['state'] == 2 ? "Expired" : ""}}
            </span>
          </div>
          <span v-else-if="scope.row[item.prop]">{{scope.row[item.prop]}}</span>
          <template v-else>-</template>
        </template>
      </el-table-column>
      <el-table-column width="28" :resizable="false">
        <template slot="header" slot-scope="scope">
          <span @click.stop="elementsetShow('shezhi',$event)" class="nz-table-gear">
            <i class="nz-icon nz-icon-gear"></i>
          </span>
        </template>
        <template v-slot="scope">
          <button v-if="scope.$index == 0" :class="{'to-top-is-hover': tableHover}" class="to-top" v-show="showTopBtn" @click="$toTop('ps', 1)"><i class="nz-icon nz-icon-top"></i></button>
        </template>
      </el-table-column>
    </el-table>
    <Pagination :tableId="tableId" :pageObj="pageObj" @pageNo='pageNo' @pageSize='pageSize' ref="Pagination"></Pagination>

    <project-box :project="viewProjectData" ref="projectBox" @reload="getAlertList"></project-box>
    <module-box :module="viewModuleData" @reload="getAlertList" ref="moduleBox"></module-box>
    <asset-box :edit-unit-show='viewAssetState' @refreshData="getAlertList" @sendStateData="tabControl" ref="assetEditUnit"></asset-box>
    <element-set
      v-if="showElementSet"
      v-clickoutside="elementsetHide"
      :table-title="tableTitle"
      :dropCol="dropCol"
      :path="'/alertList'"
      @close="elementsetHide"
      @tablelable="tablelabelEmit"
      ref="elementset"
    ></element-set>
    <!--导出-->
    <div class="export-xlsx">
      <el-dialog :visible.sync="importBox.show" :title="importBox.title" :modal-append-to-body='false' :show-close="true" width="300px" @close="importBox.show = false" class="nz-dialog">
        <div class="upload-body">
          <button @click="exportCur" class="el-button el-button--default el-button--small">
            <span>{{$t('overall.exportCur')}}</span>
          </button>
          <button @click="exportAll" class="el-button el-button--default el-button--small">
            <span>{{$t('overall.exportAll')}}</span>
          </button>
        </div>
      </el-dialog>
    </div>
    <!--删除确认提示-->
    <div class="export-xlsx">
      <el-dialog :visible.sync="deleteBox.show" :title="$t('overall.delete')" :modal-append-to-body='false' :show-close="true" width="300px" @close="deleteBox.show = false" class="nz-message">
        <div class="upload-body">
          <el-input type="textarea" :placeholder="$t('alert.description')" v-model="deleteBox.remark"></el-input>
          <div style="text-align: right; margin-top: 10px;">
            <button @click="deleteBox.show = false" class="el-button el-button--default el-button--small">
              <span>{{$t('tip.no')}}</span>
            </button>
            <button @click="deleteMessage" class="el-button el-button--default el-button--small el-button--primary">
              <span>{{$t('tip.yes')}}</span>
            </button>
          </div>
        </div>
      </el-dialog>
    </div>
  </span>
</template>

<script>
  import axios from 'axios'
  export default {
    name: "alertMessageTab",
    components: {
    },
    props: {
      from: String, //来自哪个主页面，有："asset"、"alertRule"
      obj: Object, //关联的实体对象
    },
    data() {
      return {
        defaultSearchValue: this.obj.alertNum ? 1 : 0,
        showElementSet: false,
        tableId: 'alertListTable', //需要分页的table的id，用于记录每页数量
        showTopBtn: false, //top按钮是否显示
        loading: false,
        pageObj: {
          pageNo: 1,
          pageSize: 20,
          total: 0
        },

        tableHover: false, //控制滚动条和top按钮同时出现

        importBox: {show: false, title:this.$t('overall.exportExcel')},
        deleteBox: {show: false, ids: "", remark: '', state: 2},

        tableTitle: [
          {
            label: this.$t("alert.alertName"),
            prop: 'alertRule',
            show: true,
            width: 180
          }, {
            label: this.$t("alert.list.labels"),
            prop: 'labels',
            show: true,
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
            name: this.$t('project.project.project'),
            type: 'project',
            label: 'project',
            disabled: false
          }, {
            name: this.$t('project.module.module'),
            type: 'module',
            label: 'module',
            disabled: false
          }, {
            name: this.$t('project.endpoint.endpoint'),
            type: 'input',
            label: 'endpointId',
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
            disabled: false
          }, {
            id: 12,
            name: this.$t('alert.list.state'),
            type: 'select',
            label: 'alertMessageState',
            disabled: false
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
        viewProjectData: {id: '', name: '', remark: ''},
        viewModuleData: {id: '', name: '', project: {}, port: '', path: '', param: '', paramObj: []},
        viewAssetState: false,
      }
    },
    computed: {
      tagValue() {
        return (key, value) => {
          if (key == 'type') {
            if (value ==  1) {
              value = this.$t("project.project.project");
            } else if (value == 2) {
              value = this.$t("module.module.module");
            } else if (value == 3) {
              value = this.$t("asset.asset");
            }
          }
          return key + "：" + value;
        }
      }
    },
    methods: {
      elementsetShow(s, e) {
        this.showElementSet = true;
        this.$nextTick(() => {
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
              ? e.clientY
              : e.clientY - (e.clientY + dh - h);
          this.$store.commit('setPosition', {positionx, positiony});
        });
      },
      elementsetHide() {
        //悬浮点击空白隐藏
        //this.$refs.elementset.elementsetHide();
        this.showElementSet = false;
      },
      tablelabelEmit(data) {
        //获取子组件传过来的参数
        this.$store.commit('setHeaderTable', data);
        this.tablelable = data;
        this.dropCol = data;
      },
      // 切换tab
      changeTab(tab) {
        this.$emit('changeTab', tab);
      },
      toDeleteMessage() {
        this.deleteBox.show = true;
      },
      deleteMessage() {
        this.$put("alert/message", this.deleteBox).then(res => {
          if (res.code === 200) {
            this.$message({duration: 2000, type: 'success', message: this.$t("tip.deleteSuccess")});
            this.deleteBox.show = false;
            this.getAlertList();
          } else {
            this.$message.error(res.msg);
          }
        })
      },
      selectChange(s) {
        let ids = [];
        this.deleteBox.ids = "";
        s.forEach(item => {
          ids.push(item.id);
        });
        this.deleteBox.ids = ids.join(",");
      },
      exportCur:function(){
        this.exportExcel(this.searchLabel);
        this.importBox.show = false;
      },
      getTimeString:function(){
        let split='-';
        let date=new Date();
        let year=date.getFullYear();
        let month=this.formatNum(date.getMonth()+1);
        let day=this.formatNum(date.getDate());
        let hours=this.formatNum(date.getHours());
        let minutes=this.formatNum(date.getMinutes());
        let seconds=this.formatNum(date.getSeconds());
        return year + split + month + split + day + ' ' + hours + split + minutes + split + seconds;
      },
      formatNum:function(num){
        return num>9?num:'0'+num;
      },
      exportAll:function(){
        let temp = JSON.parse(JSON.stringify(this.searchLabel));
        temp.pageSize = -1;
        this.exportExcel(temp);
        this.importBox.show = false;
      },
      exportExcel:function(params){
        let temp=this;
        if(!params){
          params=temp.params;
        }
        axios.get("alert/message/export", {responseType:'blob', params: params}).then(res=>{
          let fileName = 'alert-message-'+temp.getTimeString()+'.xlsx';
          if(window.navigator.msSaveOrOpenBlob){
            // 兼容ie11
            let blobObject = new Blob([res.data]);
            window.navigator.msSaveOrOpenBlob(blobObject, fileName);
          }else{
            let url = URL.createObjectURL(new Blob([res.data]));
            let a = document.createElement('a');
            document.body.appendChild(a); //此处增加了将创建的添加到body当中
            a.href = url;
            a.download = fileName;
            a.target = '_blank';
            a.click();
            a.remove(); //将a标签移除
          }
        })
      },
      getAlertList() {
        this.tableData = [];
        this.loading = true;
        this.$set(this.searchLabel, "pageNo", this.pageObj.pageNo);
        this.$set(this.searchLabel, "pageSize", this.pageObj.pageSize);
        setTimeout(() => {
          this.$get('alert/message', this.searchLabel).then(response => {
            this.loading = false;
            if (response.code == 200) {
              this.tableData = response.data.list;
              this.tableData.forEach((item) => {
                item.labels = JSON.parse(item.labels);
              });
              this.pageObj.total = response.data.total;
            }
          });
        }, 1000);
      },
      pageNo(val) {
        this.pageObj.pageNo = val;
        this.getAlertList();
      },
      pageSize(val) {
        this.pageObj.pageSize = val;
        localStorage.setItem('nz-pageSize-' + localStorage.getItem('nz-username') + '-' + this.tableId, val);
        this.getAlertList();
      },
      viewAlertType(type, typeObj) {
        this.closeViews();
        switch (type) {
          case 1:
            this.viewProjectData = JSON.parse(JSON.stringify(typeObj));
            this.$refs.projectBox.show(true);
            break;
          case 2:
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
      labelsClassName(row) {
        if (row.columnIndex == 2) {
          return "alert-message-list-labels";
        } else {
          return "";
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
        this.$refs.projectBox.show(false, false);
        this.$refs.moduleBox.show(false, false);
        this.viewAssetState = false;
      },
      search: function (searchObj) {
        this.searchLabel = {};
        if (this.from == "alertRule") {
          this.searchLabel.ruleId = this.obj.id;
        } else if (this.from == "asset") {
          this.searchLabel.assetId = this.obj.id;
        }
        this.pageObj.pageNo = 1;
        for (let item in searchObj) {
          if (searchObj[item]) {
            this.$set(this.searchLabel, item, searchObj[item]);
          }
        }
        this.getAlertList();
      },
      closeSubList() {
        this.$emit("closeSubList");
        this.tableData = [];
      },
      //asset弹框控制
      tabControl(data) {
        if (data === 'close') {
          this.viewAssetState = false
          this.$refs['assetEditUnit'].tabView = false
        }
      }
    },
    watch: {
      obj: {
        immediate: true,
        deep: true,
        handler(n) {
          if (this.from == "alertRule") {
            this.searchMsg.searchLabelList = this.searchMsg.searchLabelList.filter((item, index) => {
              return item.label != "alertName" && item.label != "severity"
            });
            this.searchLabel.ruleId = n.id;
          } else if (this.from == "asset") {
            this.searchMsg.searchLabelList = this.searchMsg.searchLabelList.filter((item, index) => {
              return item.label != "alertType" && item.label != "asset"
            });
            this.searchLabel.type = 3;
            this.searchLabel.linkId = n.id;
          }
          if (n.alertNum) {
            this.defaultSearchValue = 1;
          }
          this.getAlertList();
        }
      }
    },
    mounted() {
      //是否存在分页缓存
      let pageSize = localStorage.getItem('nz-pageSize-' + localStorage.getItem('nz-username') + '-' + this.tableId);
      if (pageSize) {
        this.pageObj.pageSize = pageSize
      }
      this.$nextTick(() => {
        //绑定滚动条事件，控制top按钮
        let el = this.$refs.alertMessageSubList.$el.querySelector(".el-table__body-wrapper");
        if (el._ps_) {
          el.addEventListener("ps-scroll-y", () => {
            if (el._ps_.scrollbarYTop > 50) {
              this.showTopBtn = true;
            } else {
              this.showTopBtn = false;
            }
          });
          el.addEventListener("mouseenter", () => {
            this.tableHover = true;
          });
          el.addEventListener("mouseleave", () => {
            this.tableHover = false;
          });
        }
      });
      this.tablelable = localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-/alertList")
        ? JSON.parse(localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-/alertList"))
        : this.tableTitle;
      this.dropCol = localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-/alertList")
        ? JSON.parse(localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-/alertList"))
        : this.tableTitle;
    }
  }
</script>

<style scoped>

</style>
