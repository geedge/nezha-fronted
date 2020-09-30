<template>
  <span>
    <div class="sub-top-tools">
      <div class="sub-list-tabs">
        <div class="sub-list-tab-title">{{obj.host}}</div><div
        class="sub-list-tab" @click="changeTab('panel')">{{$t("overall.detail")}}</div><div
        class="sub-list-tab" @click="changeTab('alertMessage')">{{$t("asset.tableTitle.alerts")}}</div><div
        class="sub-list-tab sub-list-tab-active">{{$t("asset.tableTitle.modules")}}</div>
      </div>
      <div class="top-tool-right">
        <div class="top-tool-search">
          <search-input :searchMsg="searchMsg" @search="search"></search-input>
        </div>
        <export-excel
          export-file-name="endpoint"
          export-url="/endpoint/export"
          import-url="/endpoint/import"
          :params="searchLabel"
          @afterImport="getTableData"
          class="margin-l-20"
        >
          <template slot="optionZone">
            <button @click.stop="add" :title="$t('overall.createEndpoint')" class="nz-btn nz-btn-size-normal nz-btn-style-light" id="project-create-project">
              <i class="nz-icon nz-icon-create-square"></i>
            </button>
          </template>
        </export-excel>
      </div>
    </div>
    <!-- 自定义table列 -->
      <transition name="el-zoom-in-top">
        <element-set
          v-if="tools.showCustomTableTitle"
          @close="tools.showCustomTableTitle = false"
          :custom-table-title.sync="tools.customTableTitle"
          :original-table-title="tableTitle"
          ref="customTableTitle"
          :path="'/projectBottom'"
        ></element-set>
      </transition>
    <el-table
      :data="tableData"
      border
      v-loading="tools.loading"
      class="nz-table endpoint-table"
      :height="$tableHeight.noPagination"
      v-scrollBar:el-table="'large'"
      :cell-class-name="messageStyle"
      ref="endpointTable"
      style="width: 100%;"
      @sort-change="tableDataSort"
    >
      <el-table-column
        :resizable="false"
        v-for="(item, index) in tools.customTableTitle"
        v-if="item.show"
        :width="item.width"
        :key="`col-${index}`"
        :label="item.label"
        min-width="110px"
        :sortable="$tableSet.sortableShow(item.prop,'endpointTab')"
        :prop="$tableSet.propTitle(item.prop,'endpointTab')"
        :sort-orders="['ascending', 'descending']"
      >
        <template slot-scope="scope" :column="item">
          <span v-if="item.prop == 'asset' && scope.row[item.prop]" class="link" @click="">{{scope.row[item.prop].host}}</span>
          <span v-else-if="item.prop == 'project' && scope.row[item.prop]">{{scope.row.project.name}}</span>
          <span v-else-if="item.prop == 'module' && scope.row[item.prop]">{{scope.row.module.name}}</span>
          <span v-else-if="item.prop == 'param'">
            <template v-if="scope.row.paramObj">
              <span v-for="(p,i) in scope.row.paramObj">{{p.key}}={{p.value}}<span v-if="i < scope.row.paramObj.length-1">，</span></span>
            </template>
            <template v-else>-</template>
          </span>
          <template v-else-if="item.prop == 'type'">{{scope.row.module.type}}</template>
          <div v-else-if="item.prop == 'option'">&nbsp;
                <span
                  :title="$t('overall.edit')"
                  @click="editEndpoint(scope.row)"
                  class="content-right-option"
                  :id="'edp-edit-'+scope.row.id">
                  <i class="nz-icon nz-icon-edit"></i>
                </span>
          </div>
          <span v-else-if="item.prop == 'lastUpdate'">{{dateFormat(scope.row.lastUpdate)}}</span>
          <span v-else-if="item.prop == 'state'" >
            <el-popover placement="right" trigger="hover" :content="getStateContent(scope.row)" popper-class="small-pop">
              <div slot="reference" style="width: 20px">
                <div :class="{'active-icon green':scope.row.state == '1','active-icon red':scope.row.state == '0'}"></div>
              </div>
            </el-popover>
          </span>
          <template v-else-if="item.prop=='alerts'">
                <el-tooltip :content="scope.row.alertNum+' '+$t('overall.active')" placement="top" effect="light" :disabled=" scope.row.alertNum < 99">
                  <span :id="'endpoint-alerts-'+scope.row.id" >
                    {{(scope.row.alertNum < 99 ? scope.row.alertNum : 99)}}
                      <sup class="linkSup" v-if="scope.row.alertNum > 99">+</sup>
                    {{' ' + $t('overall.active')}}
                  </span>
                </el-tooltip>
              </template>
          <span v-else-if="scope.row[item.prop]">{{scope.row[item.prop]}}</span>
          <template v-else>-</template>
        </template>
      </el-table-column>
      <el-table-column width="28" :resizable="false">
        <template slot="header" slot-scope="scope">
          <span @mousedown.stop="!tools.showCustomTableTitle && (tools.showCustomTableTitle = true)" class="nz-table-gear">
            <i class="nz-icon nz-icon-gear"></i>
          </span>
        </template>
        <template v-slot="scope">
          <button v-if="scope.$index == 0" class="to-top" :style="{top: tools.toTopBtnTop}" :class="{'to-top-is-hover': tools.tableHover}" v-show="tools.showTopBtn" @click="$toTop('ps', 1)"><i class="nz-icon nz-icon-top"></i></button>
        </template>
      </el-table-column>
    </el-table>

    <transition name="right-box">
      <add-endpoint-box v-if="rightBox.add.show" :current-project="currentProject" :current-module="currentModule" @close="closeRightBox" ref="addEndpointBox"></add-endpoint-box>
    </transition>
    <transition name="right-box">
      <edit-endpoint-box v-if="rightBox.edit.show" :current-project="currentProject" :current-module="currentModule" :endpoint="endpoint" @close="closeRightBox" ref="editEndpointBox"></edit-endpoint-box>
    </transition>
    <transition name="right-box">
      <edit-endpoint-box v-if="rightBox.editEndpoint.show" :project="currentProject" :module="currentModule" :endpoint="endpoint" @close="closeEditEndpointRightBox" ref="editEndpointBox"></edit-endpoint-box>
    </transition>
  </span>
</template>

<script>
  import exportXLSX from "../../exportXLSX";
  import bus from '@/libs/bus'
  export default {
    name: "endpointTab",
    components: {
      'export-excel': exportXLSX
    },
    props: {
      obj: Object, //关联的实体对象
    },
    data() {
      return {
        rightBox: {
          add: {show: false},
          edit: {show: false},
          editEndpoint: {show: false},
        },
        /*工具参数*/
        tools: {
          loading: false, //是否显示table加载动画
          toTopBtnTop: this.$tableHeight.toTopBtnTop, //to-top按钮的top属性
          tableHover: false, //控制滚动条和top按钮同时出现
          showTopBtn: false, //显示To top按钮
          showCustomTableTitle: false, //自定义列弹框是否显示
          customTableTitle: [], //自定义列工具的数据
        },
        endpoint: {}, //用来查看详情和编辑的对象
        endpointSearchLabel:{

        },
        tableTitle: [
          {
            label: this.$t("project.endpoint.endpointId"),
            prop: 'id',
            show: true,
          },{
            label: this.$t("project.project.project"),
            prop: 'project',
            show: true,
          },{
            label: this.$t("project.module.module"),
            prop: 'module',
            show: true,
          },{
            label: this.$t("project.endpoint.asset"),
            prop: 'asset',
            show: true,
          },{
            label: this.$t("project.endpoint.host"),
            prop: 'host',
            show: true,
          },{
            label: this.$t("project.endpoint.port"),
            prop: 'port',
            show: true,
          },{
            label: this.$t("overall.type"),
            prop: 'type',
            show: false,
          },{
            label: this.$t("project.endpoint.param"),
            prop: 'param',
            show: true,
          },{
            label: this.$t("project.endpoint.path"),
            prop: 'path',
            show: true,
          },{
            label: this.$t("alert.list.state"),
            prop: 'state',
            show: true,
          },{
            label: this.$t("project.endpoint.alerts"),
            prop: 'alerts',
            show: true,
          },
          /*{
            label: this.$t("project.endpoint.lastUpdate"),
            prop: 'lastUpdate',
            show: true,
          },*/
          {
            label: this.$t('config.account.option'),
            prop: 'option',
            show: true,
            width: 120
          }
        ],
        tablelable: [],
        dropCol: [],
        currentProject: {id: '', name: '', remark: ''}, //endpoint弹框、module列表用来回显project
        currentModule: {id: '', name: '', project: {}, port: '', path: '', param: '', paramObj: []}, //endpoint弹框用来回显module
        searchMsg: { //给搜索框子组件传递的信息
          zheze_none: true,
          searchLabelList: [{
            id: 1,
            name: "ID",
            type: 'input',
            label: 'id',
            disabled: false
          }, {
            id: 11,
            name: this.$t('asset.asset'),
            type: 'asset',
            label: 'asset',
            disabled: false
          }],
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
      getTableData() {
        this.tools.loading = true;
        this.$set(this.endpointSearchLabel, "assetId", this.asset.id);
        this.$set(this.endpointSearchLabel, "pageSize", '-1');
        this.$get('/endpoint',this.endpointSearchLabel).then(response => {
          this.tools.loading = false;
          if (response.code === 200) {
            for (let i = 0; i < response.data.list.length; i++) {
              try {
                let tempObj = JSON.parse(response.data.list[i].param);
                response.data.list[i].paramObj = [];
                for (let k in tempObj) {
                  response.data.list[i].paramObj.push({key: k, value: tempObj[k]})
                }
              } catch (err) {
                //console.error(response.data.list[i], err);
              }
            }
            this.tableData = response.data.list;
            this.$emit("reload");
          }
        });
      },
      closeRightBox(refresh) {
        this.rightBox.add.show = false;
        this.rightBox.edit.show = false;
        if (refresh) {
          this.getTableData();
        }
      },
      toEdit(endpoint) {
        this.endpoint = JSON.parse(JSON.stringify(endpoint));
        if (!this.endpoint.paramObj) {
          this.$set(this.endpoint, 'paramObj', []);
        }
        this.rightBox.edit = true;
        this.$nextTick(() => {
          this.$refs.editEndpointBox.show(true);
          this.$refs.editEndpointBox.toEdit(true, this.endpoint.id);
        });
      },
      editEndpoint(endpoint) {
        console.log(endpoint);
        this.endpoint = JSON.parse(JSON.stringify(endpoint));
        this.$set(this.endpoint,'projectId',this.endpoint.project.id);
        this.$set(this.endpoint,'moduleId',this.endpoint.moduleId);

        this.rightBox.editEndpoint.show = true;
        if (!this.endpoint.paramObj) {
          this.$set(this.endpoint, 'paramObj', []);
        }
      },
      closeEditEndpointRightBox(refresh) {
        this.rightBox.editEndpoint.show = false;
        if (refresh) {
          this.getTableData();
        }
      },
      add() {
        this.rightBox.add.show = true;
      },
      search(searchObj) {
        let orderBy = '';
        if(this.searchLabel.orderBy){
          orderBy=this.searchLabel.orderBy
        }
        this.searchLabel = {};
        this.pageObj.pageNo = 1;
        for (let item in searchObj) {
          if (searchObj[item]) {
            this.$set(this.searchLabel, item, searchObj[item]);
          }
        }
        if(orderBy){
          this.$set(this.searchLabel, 'orderBy', orderBy);
        }
        this.getTableData();
      },
      dateFormat(time) {
        if (!time) {
          return '-';
        }
        let date = new Date(time * 1000);
        let year = date.getFullYear();
        let month = date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1;
        let day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
        let hours = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
        let minutes = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
        let seconds = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();

        return year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;
      },
      getStateContent:function(row){
        if(row){
          if(row.state == 1){
            return 'up';
            //return 'up'+'['+this.formatUpdateTime(row.lastUpdate)+']';
          }else{
            return 'down';
            //return 'down'+'['+this.getStateErrorMsg(row)+']';
          }
        }
      },
      formatUpdateTime:function(date){
        let time=new Date(date);
        let hours=time.getHours()>9?time.getHours():'0'+time.getHours();
        let minutes=time.getMinutes()>9?time.getMinutes():'0'+time.getMinutes();

        return hours+':'+minutes;
      },
      getStateErrorMsg:function(row){
        let errCodes=[230009,230010,230011];
        if(row){
          if(row.state == 0){
            if(errCodes.find((item)=>{return row.stateInfo.code == item})){
              return this.$t('project.endpoint.stateInfo_'+row.stateInfo.code)
            }else{
              return row.stateInfo.msg;
              this.$message.error('state code error');
            }
          }
        }
      },
      initEvent() {
        bus.$on("current-project-change", project => {
          this.currentProject = project;
        });
        bus.$on("current-module-change", module => {
          this.currentModule = module;
        });
        // bus.$on("endpoint-list-change", menu => {
        //   this.getEndpointTableData();
        // });
      },
      // 数据排序
      tableDataSort(item){
        let orderBy='';
        if(item.order==='ascending'){
          orderBy=item.prop;
        }
        if(item.order==='descending'){
          orderBy='-'+item.prop;
        }
        this.$set(this.endpointSearchLabel, "orderBy", orderBy);
        this.getTableData();
      },
      messageStyle(e) {
        if (e.column.label == 'Alerts' || e.column.label == this.$t("project.endpoint.alerts")) {
          if (e.row.alertNum > 0) {
            return 'danger';
          } else {
            return 'success';
          }
        }
        return '';
      },
    },
    watch: {
      obj: {
        immediate: true,
        deep: true,
        handler(n) {
          if (n) {
            this.asset = JSON.parse(JSON.stringify(n));
            this.$nextTick(()=>{
              this.getTableData();
            })
          }
        }
      }
    },
    mounted() {
      //初始化表头
      this.tools.customTableTitle = localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-/projectBottom")
        ? JSON.parse(localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-/projectBottom"))
        : this.tableTitle;

      this.$nextTick(() => {
        //绑定滚动条事件，控制top按钮
        let el = this.$refs.endpointTable.$el.querySelector(".el-table__body-wrapper");
        if (el._ps_) {
          el.addEventListener("ps-scroll-y", () => {
            if (el._ps_.scrollbarYTop > 50) {
              this.tools.showTopBtn = true;
            } else {
              this.tools.showTopBtn = false;
            }
          });
          el.addEventListener("mouseenter", () => {
            this.tools.tableHover = true;
          });
          el.addEventListener("mouseleave", () => {
            this.tools.tableHover = false;
          });
        }
      });
      this.initEvent();
    }
  }
</script>

<style scoped>

</style>
