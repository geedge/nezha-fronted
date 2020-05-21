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
          :params="searchLabel"
          @afterImport="getTableData"
          class="margin-l-20"
        >
          <template slot="optionZone">
            <button @click.stop="toAdd" :title="$t('overall.createProject')" class="nz-btn nz-btn-size-normal nz-btn-style-light" id="project-create-project">
              <i class="nz-icon nz-icon-create-square"></i>
            </button>
          </template>
        </export-excel>
      </div>
    </div>
    <el-table
      :data="tableData"
      border
      v-loading="loading"
      class="nz-table endpoint-table"
      :height="$tableHeight.noPagination"
      v-scrollBar:el-table="'large'"
      ref="endpointTable"
      style="width: 100%;">
      <el-table-column
        :resizable="false"
        v-for="(item, index) in tablelable"
        v-if="item.show"
        :width="item.width"
        :key="`col-${index}`"
        :label="item.label"
        min-width="110px"
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
          <div v-else-if="item.prop == 'option'">-</div>
          <span v-else-if="item.prop == 'lastUpdate'">{{dateFormat(scope.row.lastUpdate)}}</span>
          <span v-else-if="item.prop == 'state'" >
            <el-popover placement="right" trigger="hover" :content="getStateContent(scope.row)" popper-class="small-pop">
              <div slot="reference" style="width: 20px">
                <div :class="{'active-icon green':scope.row.state == '1','active-icon red':scope.row.state == '0'}"></div>
              </div>
            </el-popover>
          </span>
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
          <button v-if="scope.$index == 0" class="to-top" :style="{top: toTopBtnTop}" :class="{'to-top-is-hover': tableHover}" v-show="showTopBtn" @click="$toTop('ps', 1)"><i class="nz-icon nz-icon-top"></i></button>
        </template>
      </el-table-column>
    </el-table>

    <element-set
      v-clickoutside="elementsetHide"
      :table-title="tableTitle"
      :dropCol="dropCol"
      @tablelable="tablelabelEmit"
      :path="'/assetEndpoint'"
      ref="elementset"
    ></element-set>
    <add-endpoint-box :currentProject="currentProject" :module="currentModule" @reload="getTableData" ref="addEndpointBox"></add-endpoint-box>
    <edit-endpoint-box @close="closeEditEndpoint" v-if="editBoxShow" :currentProject="endpoint.project" :currentModule="endpoint.module" :endpoint="endpoint" @reload="getTableData" ref="editEndpointBox"></edit-endpoint-box>
  </span>
</template>

<script>
  import exportXLSX from "../../exportXLSX";
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
        showAddBox: false,
        editBoxShow: false,
        endpoint: {}, //用来查看详情和编辑的对象
        endpointDetail: {}, //用来查看详情的对象
        asset: {}, //对应props的obj
        showTopBtn: false, //top按钮是否显示
        toTopBtnTop: this.$tableHeight.toTopBtnTop, //to-top按钮的top属性
        tableHover: false, //控制滚动条和top按钮同时出现

        loading: false,
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
        this.loading = true;
        this.$get('/endpoint?assetId=' + this.asset.id + 'pageSize=-1').then(response => {
          this.loading = false;
          if (response.code === 200) {
            this.tableData = response.data.list;
            this.$emit("reload");
          }
        });
      },
      query(endpoint) {

      },
      detail(endpoint) {

      },
      closeEditEndpoint() {
        this.editBoxShow = false;
      },
      toEdit(endpoint) {
        this.endpoint = JSON.parse(JSON.stringify(endpoint));
        if (!this.endpoint.paramObj) {
          this.$set(this.endpoint, 'paramObj', []);
        }
        this.editBoxShow = true;
        this.$nextTick(() => {
          this.$refs.editEndpointBox.show(true);
          this.$refs.editEndpointBox.toEdit(true, this.endpoint.id);
        });
      },
      toAdd() {
        this.$refs.addEndpointBox.show(true);
        this.$refs.addEndpointBox.clearEndpoints();
      },
      search: function (searchObj) {
        /*this.searchLabel = {idcId: this.currentDc.id, pageNo: 1, pageSize: -1};
        for (let item in searchObj) {
          if (searchObj[item]) {
            this.$set(this.searchLabel, item, searchObj[item]);
          }
        }*/
        this.getTableData();
      },
      closeSubList() {
        this.tableData = [];
        this.$emit("closeSubList");
      },
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
        this.$store.commit('setPosition', { positionx, positiony });
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
    },
    watch: {
      obj: {
        immediate: true,
        deep: true,
        handler(n) {
          if (n) {
            this.asset = JSON.parse(JSON.stringify(n));
            this.getTableData();
          }
        }
      }
    },
    mounted() {
      this.tablelable = localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-/assetEndpoint")
        ? JSON.parse(localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-/assetEndpoint"))
        : this.tableTitle;
      this.dropCol = localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-/assetEndpoint")
        ? JSON.parse(localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-/assetEndpoint"))
        : this.tableTitle;

      this.$nextTick(() => {
        //绑定滚动条事件，控制top按钮
        let el = this.$refs.endpointTable.$el.querySelector(".el-table__body-wrapper");
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
    }
  }
</script>

<style scoped>

</style>
