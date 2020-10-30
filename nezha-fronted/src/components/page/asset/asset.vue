<template>
  <div class="asset" ref="asset">
    <div class="main-list" :class="{'main-list-with-sub': bottomBox.showSubList}">
      <div class="main-modal"></div>
      <div class="top-tools" v-show="bottomBox.mainResizeShow">
        <div class="top-tool-main-right" :class="{'top-tool-main-right-to-left': bottomBox.showSubList}">
          <div class="top-tool-search margin-r-20"><search-input :searchMsg="searchMsg" @search="search" :inTransform="bottomBox.inTransform"></search-input></div>
          <export-excel
            export-file-name="asset"
            export-url="/asset/export"
            import-url="/asset/import"
            :params="searchLabel"
            @afterImport="afterTableListChange"
          >
            <template slot="optionZone">
              <button @click.stop="add" :title="$t('overall.createAsset')" class="nz-btn nz-btn-size-normal nz-btn-style-light" id="asset-create-asset">
                <i class="nz-icon nz-icon-create-square"></i></button>
            </template>
          </export-excel>
          <delete-button :delete-objs="batchDeleteObjs" api="asset" @after="afterTableListChange"></delete-button>
        </div>
        <div class="pagination-top pagination-top-hide display-none"></div>
      </div>
      <!-- 自定义table列 -->
      <transition name="el-zoom-in-top">
        <element-set
          v-if="tools.showCustomTableTitle"
          @close="tools.showCustomTableTitle = false"
          :custom-table-title.sync="tools.customTableTitle"
          :original-table-title="tableTitle"
          ref="customTableTitle"
        ></element-set>
      </transition>
      <el-table
        class="nz-table"
        :height="mainTableHeight"
        style="width: 100%;"
        :data="tableData"
        v-scrollBar:el-table="'large'"
        v-show="bottomBox.mainResizeShow"
        border
        v-loading="tools.loading"
        tooltip-effect="light"
        ref="assetTable"
        :cell-class-name="messageStyle"
        @sort-change="tableDataSort"
        @row-dblclick="detail"
        @selection-change="(selection)=>{this.batchDeleteObjs=selection}"
      >
        <el-table-column
          :resizable="false"
          type="selection"
          width="40"
          align="center">
        </el-table-column>
        <el-table-column
          :resizable="false"
          v-for="(item, index) in tools.customTableTitle"
          v-if="item.show"
          :width="item.width"
          :key="`col_${index}`"
          :label="item.label"
          :fixed="item.fixed"
          :show-overflow-tooltip="item.prop != 'Alert' || item.prop != 'Module'"
          min-width="110px"
          :class-name="item.prop == 'option' ? 'content-right-options' : ''"
          :sortable="$tableSet.sortableShow(item.prop,'asset')"
          :prop="$tableSet.propTitle(item.prop,'asset')"
          :sort-orders="['ascending', 'descending']"
        >
          <template slot-scope="scope" slot="header">
            <span v-if="item.type == 'tag'" class="tag-header" :title="item.label"><span class="tag-value">{{item.label}}</span><span class="tag-mark">&nbsp;[Tag]</span></span>
            <span v-else><span>{{item.label}}</span></span>
          </template>
          <template slot-scope="scope" :column="item">
            <div v-if="item.prop=='ID'">
              <span>{{scope.row.id}}</span>
            </div>
            <div v-if="item.prop=='assetType'">
              <span>{{scope.row.model.type.value}}</span>
            </div>
            <template v-if="item.prop=='SN'">{{scope.row.sn}}</template>
            <div v-if="item.prop=='HOST'">
              <span>{{scope.row.host}}</span>
            </div>
            <div v-if="item.prop=='state'">
              <span>{{scope.row.state==1 ? $t('asset.inStock') : $t('asset.notInStock')}}</span>
            </div>
          <div v-if="item.prop == 'pingStatus'">
            <el-popover
              placement="right"
              width="200"
              trigger="hover"
              :content="formatPingTime(scope.row.pingLastUpdate)">
              <div slot="reference" style="width: 20px">
                <div :class="{'active-icon green':scope.row.pingState == 1,'active-icon red':scope.row.pingState == 0}"></div><span>{{scope.row.pingRtt?scope.row.pingRtt+'ms':''}}</span>
              </div>
            </el-popover>
          </div>
          <template v-if="item.prop=='Module'">
            <el-tooltip placement="right" effect="light">
              <div slot="content">
                {{scope.row.endpointNum-scope.row.endpointDownNum}}&nbsp;{{$t('asset.endpointUpNum')}}<br/>
                {{scope.row.endpointNum}}&nbsp;{{$t('asset.endpointNum')}}
              </div>
              <span class="link" @click="showEndpoint(scope.row)" style="padding: 2px 8px">{{scope.row.endpointNum-scope.row.endpointDownNum}}/{{scope.row.endpointNum}}</span>
            </el-tooltip>
          </template>
          <template v-if="item.prop=='Alert'">
            <el-tooltip :content="scope.row.alertNum+' '+$t('overall.active')" placement="top" effect="light" :disabled=" scope.row.alertNum < 99">
              <span :id="'asset-alerts-'+scope.row.id" @click="jumpToAlertMsg(scope.row)" class="link">
                {{(scope.row.alertNum < 99 ? scope.row.alertNum : 99)}}
                  <sup class="linkSup" v-if="scope.row.alertNum > 99">+</sup>
                {{' ' + $t('overall.active')}}
              </span>
            </el-tooltip>
          </template>
          <div v-if="item.prop=='dataCenter'">
            <span  >{{scope.row.idc.name}}</span>
          </div>
          <template v-if="item.prop=='cabinet'">
            <span v-if="scope.row.cabinet && scope.row.cabinet != '--'">{{returnData(scope.row.cabinet).name}}</span>
            <span v-else >{{returnData(scope.row.cabinet)}}</span>
          </template>
          <div v-if="item.prop=='model'">
            <span>{{scope.row.model.name}}</span>
          </div>
          <div v-if="item.prop=='vendor'">
            <span>{{scope.row.model.vendor.value}}</span>
          </div>
          <div v-if="item.prop=='purchaseDate'">
            <span>{{returnData(scope.row.purchaseDate)}}</span>
          </div>
          <div v-if="item.prop=='principal'">
            <span>{{getPrincipalName(scope.row.idc.principal)}}</span>
          </div>
          <div v-if="item.prop=='tel'">
            <span>{{scope.row.idc.tel}}</span>
          </div>
          <template v-if="item.prop == 'tags'">
            <span>{{filterTags(scope)}}</span>
          </template>
          <template v-if="item.prop == 'option'">
            <span :title="$t('overall.view')" @click.stop="detail(scope.row)" class="content-right-option" :id="'asset-detail-'+scope.row.id"><i
              class="nz-icon nz-icon-view"></i>
            </span>
              &nbsp;
              <span :title="$t('overall.edit')" @click.stop="edit(scope.row)" class="content-right-option" :id="'asset-edit-'+scope.row.id"><i
                class="nz-icon nz-icon-edit"></i>
            </span>
              &nbsp;
              <span :title="$t('overall.delete')" @click.stop="del(scope.row)" class="content-right-option" :id="'asset-del-'+scope.row.id"><i
                class="nz-icon nz-icon-delete"></i>
            </span>
              &nbsp;
              <el-dropdown trigger="hover" @command="cli">
              <span title="CLI" class="content-right-option" :id="'asset-ssh-'+scope.row.id"><i
                class="nz-icon nz-icon-cli" :class="{'gray-filter': !scope.row.accounts || scope.row.accounts.length == 0 || (scope.row.accounts.length==1&&scope.row.accounts.find(t=>t.protocol == 'SNMP'))}"></i>
              </span>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item v-for="(account, index) in scope.row.accounts" v-if="account && account.protocol != 'SNMP'" :key="index" :command="[scope.row.id ,scope.row.host, account]">{{account.protocol}}</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>

            </template>
          </template>
        </el-table-column>
        <el-table-column width="28" fixed="right" :resizable="false">
          <template slot="header" slot-scope="scope">
          <span @mousedown.stop="!tools.showCustomTableTitle && (tools.showCustomTableTitle = true)" class="nz-table-gear">
            <i class="nz-icon nz-icon-gear"></i>
          </span>
          </template>
          <template v-slot="scope">
            <button v-if="scope.$index == 0" class="to-top" :style="{top: tools.toTopBtnTop}" :class="{'to-top-is-hover': tools.tableHover}" v-show="tools.showTopBtn && bottomBox.mainResizeShow" @click="$toTop('ps', 0)"><i class="nz-icon nz-icon-top"></i></button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-bottom" v-show="!bottomBox.showSubList">
        <Pagination :tableId="tableId" :pageObj="pageObj" @pageNo='pageNo' @pageSize='pageSize' ref="Pagination"></Pagination>
      </div>
    </div>
    <transition name="el-zoom-in-bottom">
      <bottom-box v-if="bottomBox.showSubList" :sub-resize-show="bottomBox.subResizeShow" :obj="bottomBox.asset" :isFullScreen="bottomBox.isFullScreen" :from="'asset'" :targetTab.sync="bottomBox.targetTab" :detail="bottomBox.assetDetail"
                  @reload="getTableData"
                  @closeSubList="bottomBox.showSubList = false"
                  @fullScreen="fullScreen"
                  @exitFullScreen="exitFullScreen"
                  @listResize="listResize" ></bottom-box>
    </transition>
    <transition name="right-box">
      <asset-box v-if="rightBox.show" :asset="asset" @refresh="getTableData" ref="assetBox" @close="closeRightBox"></asset-box>
    </transition>
  </div>
</template>

<script>
  import bus from "../../../libs/bus";
  import exportXLSX from "../../common/exportXLSX";
  import endpointStatusPop from "./endpointStatusPop";
  import deleteButton from "../../common/deleteButton";
  export default {
    name: "asset",
    components:{
      'export-excel':exportXLSX,
      'endpoint-status-pop':endpointStatusPop,
      'delete-button':deleteButton,
    },
    data() {
      return {
        //侧滑
        rightBox: {
          show: false,
        },
        /*二级页面相关*/
        bottomBox: {
          assetDetail: {}, //asset详情
          asset: {}, //告警信息对应的asset对象
          mainResizeShow: true, //dom高度改变时是否展示|隐藏
          subResizeShow: true,
          isFullScreen: false, //全屏状态
          showSubList: false, //是否显示二级列表
          targetTab: '', //显示二级列表中的哪个页签
          inTransform: false, //搜索框相关，搜索条件下拉框是否在transform里
        },

        mainTableHeight: this.$tableHeight.normal, //主列表table高度

        /*工具参数*/
        tools: {
          loading: false, //是否显示table加载动画
          toTopBtnTop: this.$tableHeight.toTopBtnTop, //to-top按钮的top属性
          tableHover: false, //控制滚动条和top按钮同时出现
          showTopBtn: false, //显示To top按钮
          showCustomTableTitle: false, //自定义列弹框是否显示
          customTableTitle: [], //自定义列工具的数据
        },
        batchDeleteObjs:[],
        asset: {},
        blankAsset: {
          id: '',
          sn: '',
          host: '',
          state: '',
          purchaseDate: '',
          idcId: '',
          cabinetId: '',
          modelId: '',
          model: {type: {code: ""}},
          assetType: '',
          impi:{
            host:'',
            port:'',
          },
          tags: [],
          accounts: [],
        },
        tableId: 'assetTable', //需要分页的table的id，用于记录每页数量
        searchMsg: { //给搜索框子组件传递的信息
          zheze_none: true,
          searchLabelList: [{
            id: 1,
            name: 'ID',
            type: 'input',
            label: 'id',
            disabled: false
          },{
            id: 20,
            name: 'SN',
            type: 'input',
            label: 'sn',
            disabled: false
          },{
            id: 21,
            name: 'Host',
            type: 'input',
            label: 'host',
            disabled: false
          },{
            id: 22,
            name: this.$t("asset.state"),
            type: 'select',
            label: 'assetState',
            disabled: false
          },{
            id: 23,
            name: "pingStatus",
            type: 'select',
            label: 'pingStatus',
            disabled: false
          }],
        },

        searchLabel: {}, //搜索参数
        activeType: 'dataCenter',

        tableTitle: [
          {
            label: this.$t("asset.tableTitle.host"),
            prop: 'HOST',
            show: true,
            width: 130,
            fixed:'left'
          },
          {
            label: this.$t("asset.tableTitle.id"),
            prop: 'ID',
            show: false,
            allowed:true,
            // width: 110
          }, {
            label: this.$t("asset.tableTitle.assetType"),
            prop: 'assetType',
            show: true,
          }, {
            label: this.$t("asset.tableTitle.device"),
            prop: 'SN',
            show: true,
            width: 130
          },  {
            label: this.$t("asset.tableTitle.assetState"),
            prop: 'state',
            show: true,
          }, {
            label:this.$t('asset.tableTitle.assetPing'),
            prop:'pingStatus',
            show:true,
          },{
            label: this.$t("asset.tableTitle.modules"),
            prop: 'Module',
            show: true,
            width: 105
          }, {
            label: this.$t("asset.tableTitle.alerts"),
            prop: 'Alert',
            show: true,
            width: 100
          }, {
            label: this.$t("asset.tableTitle.dataCenter"),
            prop: 'dataCenter',
            show: true,
          }, {
            label: this.$t("asset.tableTitle.cabinet"),
            prop: 'cabinet',
            show: true,
          }, {
            label: this.$t("asset.tableTitle.model"),
            prop: 'model',
            show: true,
          }, {
            label: this.$t("asset.tableTitle.vendor"),
            prop: 'vendor',
            show: true,
          }, {
            label: this.$t("asset.tableTitle.procurementDate"),
            prop: 'purchaseDate',
            show: false,
          }, {
            label: this.$t("asset.tableTitle.principal"),
            prop: 'principal',
            show: false,
          }, {
            label: this.$t("asset.tableTitle.principalTel"),
            prop: 'tel',
            show: false,
            width: 115
          }, {
            label: this.$t('config.account.option'),
            prop: 'option',
            show: true,
            width: 150,
            fixed:'right'
          }],
        tableData: [],

        pageObj: {
          id: '',
          pageNo: 1,
          pageSize: 50,
          total: 0,
          idcId: '',
          idcIds: ''
        },

        assetPingSwitch: localStorage.getItem('nz-sys-asset-ping-switch'),
        tagKeys:[],
      }
    },
    computed:{
      headerCurrentDc:function(){
        return this.$store.state.currentDc;
      }
    },
    watch: {
      'bottomBox.showSubList': function(n) {
        let vm = this;
        this.$bottomBoxWindow.showSubListWatch(vm, n);
      },
      'bottomBox.asset': {
        deep: true,
        handler(n) {
          if (n.id) {
            this.bottomBox.assetDetail = this.convertToDetail(n);
            if (n.model.id) {
              n.modelId = n.model.id;
            }
          }
        }
      },
      'tools.customTableTitle':{
        deep:true,
        immediate:true,
        handler(n,o){
          let pingTitle=n.find(item=>{return item.prop=='pingStatus'})
          if(pingTitle){
            this.dispatchEvent('asset-ping-switch-change',pingTitle.show)
          }
        }
      }
    },
    methods: {
      fullScreen() {
        let vm = this;
        this.$bottomBoxWindow.fullScreen(vm);
      },
      exitFullScreen() {
        let vm = this;
        this.$bottomBoxWindow.exitFullScreen(vm);
      },
      listResize(e) {
        let vm = this;
        this.$bottomBoxWindow.listResize(vm, e);
      },
      cli([id,host,account]){
        const consoleParam = {
          id: id,
          host: host,
          accountId: account.id,
          port: account.port,
        };
        this.$store.commit('addConsole', consoleParam);
      },
      jumpToAlertMsg(asset) {
        this.bottomBox.targetTab = 'alertMessage';
        this.bottomBox.asset = JSON.parse(JSON.stringify(asset));
        this.bottomBox.showSubList = true;
      },
      checkSearchLabel(n, o) {
        let nKeys = Object.keys(n);
        let oKeys = Object.keys(o);
        if (nKeys.length != oKeys.length) {
          return true;
        } else {
          let flag = false;
          nKeys.forEach(key => {
            n[key] != o[key] && (flag = true);
          });
          return flag;
        }
      },
      getTableData() {
        let oldSearchLabel = JSON.parse(JSON.stringify(this.searchLabel));
        this.searchLabel = Object.assign(this.searchLabel, this.pageObj);
        this.tools.loading = true;
        if(this.searchLabel.tags && this.searchLabel.tags!=''){
          this.searchLabel.tags=encodeURIComponent(this.searchLabel.tags)
        }
        this.$get('asset', this.searchLabel).then(response => {
          this.tools.loading = false;
          if (response.code === 200) {
            this.tableData = response.data.list;
            this.pageObj.total = response.data.total
          }
        });
      },
      getUserData() {
        return new Promise(resolve => {
          this.$get('sys/user/list').then(response => {
            if (response.code === 200) {
              this.userData = response.data.list;
            }
            resolve(this.userData);
          });
        });
      },
      messageStyle(e) {
        if (e.column.label == 'Alerts' || e.column.label == this.$t("asset.tableTitle.alerts")) {
          if (e.row.alertNum > 0) {
            return 'danger';
          } else {
            return 'success';
          }
        }
        if(e.column.label == 'Module' || e.column.label == this.$t("asset.tableTitle.modules")){
          if (e.row.endpointDownNum > 0) {
            return 'danger';
          } else {
            return 'success';
          }
        }
        return '';
      },
      edit(asset) {
        this.asset = JSON.parse(JSON.stringify(asset));
        this.rightBox.show = true;
      },
      detail(asset) {
        this.bottomBox.asset = JSON.parse(JSON.stringify(asset));
        this.bottomBox.targetTab = "panel";
        this.bottomBox.showSubList = true;
      },
      del(asset) {
        this.$confirm(this.$t("tip.confirmDelete"), {
          confirmButtonText: this.$t("tip.yes"),
          cancelButtonText: this.$t("tip.no"),
          type: 'warning'
        }).then(() => {
          this.$delete("asset?ids=" + asset.id).then(response => {
            if (response.code === 200) {
              this.$message({duration: 2000, type: 'success', message: this.$t("tip.deleteSuccess")});
             this.afterTableListChange()
            } else {
              this.$message.error(response.msg);
            }
          })
        });
      },
      markOptionData(data) {
        data.forEach(item => {
          this.$set(item, 'isEdit', false);
          this.$set(item, 'oldName', item.value);
          this.$set(item, item.name, false)
          this.$set(item, item.id, false)
          this.$set(item, item.id + item.name, false)
        })
      },
      showEndpoint(asset) {
        this.bottomBox.asset = Object.assign({}, asset);
        this.bottomBox.targetTab = "endpoint";
        this.bottomBox.showSubList = true;
      },
      add() {
        this.asset = this.newAsset();
        this.rightBox.show = true;
      },
      newAsset() {
        return JSON.parse(JSON.stringify(this.blankAsset));
      },
      closeRightBox(refresh) {
        this.rightBox.show = false;
        if (refresh) {
         this.afterTableListChange()
          this.loadKeys();
        }
      },
      afterTableListChange:function(){
        this.getTableData();
        bus.$emit('asset-list-change')
      },
      pageNo(val) {
        this.pageObj.pageNo = val;
        this.getTableData()
      },
      pageSize(val) {
        this.pageObj.pageSize = val;
        localStorage.setItem('nz-pageSize-' + localStorage.getItem('nz-username') + '-' + this.tableId, val);
        this.getTableData();
      },
      getPrincipalName(data) {
        for (let item in this.userData) {
          if (this.userData[item].userId === data) {
            return this.userData[item].username
          }
        }
      },
      returnData(data) {
        if (data && data !== '--') {
          return data;
        } else if (data === '--') {
          return '--';
        } else {
          return "--";
        }
      },
      closeAllPop() {
        this.$refs.idcConfigBox.forEach((item) => {
          item.show(false);
        });
        this.$refs.cabinetConfigBox.forEach((item) => {
          item.show(false);
        });
      },
      search(searchObj) {
        let orderBy = '';
        if(this.searchLabel.orderBy){
          orderBy = this.searchLabel.orderBy
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
      convertToDetail(obj) {
        let detail = JSON.parse(JSON.stringify(obj));
        detail.state = obj.state == 1 ? this.$t('asset.inStock'): this.$t('asset.notInStock');
        detail.assetType = obj.model.type.value;
        detail.vendorModel = obj.model.vendor.value + " " + obj.model.name;
        detail.dataCenter = obj.idc ? obj.idc.name : "";
        detail.location = obj.idc ? obj.idc.location : "";
        detail.principal = obj.idc ? this.getPrincipalName(obj.idc.principal) : "";
        detail.tel = obj.idc ? obj.idc.tel : "";
        detail.cabinet = obj.cabinet ? obj.cabinet.name : "";
        detail.uSize = obj.cabinet ? obj.cabinet.uSize : "";
        detail.remark = obj.idc ? obj.idc.remark : "";
        if (obj.accounts && obj.accounts.length > 0) {
          let account = obj.accounts[0];
          detail.protocol = account.protocol;
          detail.account = account.user;
          let loginType = "";
          if (account.authType == 1) {
            loginType = this.$t('asset.password');
          } else if (account.authType == 2) {
            loginType = this.$t('asset.ssh');
          }
          detail.loginType = loginType;
          detail.port = account.port;
        }

        return detail;
      },
      formatPingTime:function(str){
        if(!str || str == ''){
          return this.$t('asset.assetStatPre')+this.$t('asset.assetStatDown');
        }
        let ds='-';
        let ts=':';
        let time=new Date(bus.UTCTimeToConfigTimezone(str));
        let year=time.getFullYear();
        let month=time.getMonth()+1 > 9 ? time.getMonth()+1 : ('0'+(time.getMonth()+1));
        let day=time.getDate() > 9 ? time.getDate():('0'+time.getDate());
        let hours=time.getHours() > 9? time.getHours():('0'+time.getHours());
        let minutes=time.getMinutes() > 9 ?time.getMinutes():('0'+time.getMinutes());
        let seconds=time.getSeconds() > 9 ? time.getSeconds():('0'+time.getSeconds());
        return this.$t('asset.assetStatPre')+year+ds+month+ds+day+' '+hours+ts+minutes+ts+seconds;

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
        this.$set(this.searchLabel, "orderBy", orderBy);
        this.getTableData();
      },
      initEvent() {
        bus.$on("asset-filter-change", (column, content) => {
          let oldPageObj = JSON.parse(JSON.stringify(this.pageObj));
          if(column == 'multiParam'){
            let $self=this;
            if(content instanceof Array && content.length>0){
              content.forEach(item=>{
                $self.pageObj[item.key] = item.value;
              })
            }
          }else{
            this.pageObj[column] = content;
          }
          let isSame = this.checkSearchLabel(JSON.parse(JSON.stringify(this.pageObj)), oldPageObj);
          isSame && this.getTableData();
        });
      },
      dispatchEvent(event,param){
        this.$nextTick(()=>{
          bus.$emit(event,param)
        })
      },
      loadKeys:function(){
        this.$get('/asset/tagKey').then(res=>{
          if(res.code == 200){
            this.tagKeys = res.data.list.map(item=>{
              return {label:item,prop:'tags',show:false,allowed: true,type:'tag'}

            })
            this.resetTableTitle()
          }
        })
      },
      resetTableTitle:function(){
        let title = this.tools.customTableTitle;

        let tableTitle = title.slice(0,this.tableTitle.length);

        let tagTitle = title.slice(this.tableTitle.length,title.length);

        let $self=this;
        let newTags = this.tagKeys.filter(item=>{ return !tagTitle.find(t =>{return item.label == t.label})})
        let keepTags = tagTitle.filter(item=>{ return $self.tagKeys.find(t =>{return item.label == t.label})})

        let result = tableTitle.concat([{label:'Tag',show:false,NotSet:true,type:'title',prop:'table-tag'}])

        result = result.concat(keepTags).concat(newTags)

        this.tools.customTableTitle = JSON.parse(JSON.stringify(result))

      },
      filterTags:function(scope){
        let tag=scope.column.label.split(' [Tag]')[0]
        let tagVals=scope.row.tags
        if(tagVals){
          let showTag=tagVals.find(item=>{return item.tag == tag})
          if(showTag){
            return showTag.value
          }
        }
      }
    },

    mounted() {
      //初始化表头
      let tableTitle = localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-" + this.$route.path)
        ? JSON.parse(localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-" + this.$route.path))
        : this.tableTitle;

      if (this.assetPingSwitch == 'off') {
        this.dispatchEvent('asset-ping-switch-change',false)
        for (let i in tableTitle) {
          let label = tableTitle[i];
          if (label.prop == 'pingStatus') {
            label.show=false;
            label.NotSet=true;
            break;
          }
        }
      }else{
        for (let i in tableTitle) {
          let label = tableTitle[i];
          if (label.prop == 'pingStatus') {
            label.show=true;
            label.NotSet=false;
            break;
          }
        }
      }
      this.tools.customTableTitle = tableTitle;

      this.loadKeys();

      //console.log('load end')

      //初始化数据
      this.getUserData();

      this.pageObj.idcId=this.headerCurrentDc;

      this.getTableData();
      //是否存在分页缓存
      let pageSize = localStorage.getItem('nz-pageSize-' + localStorage.getItem('nz-username') + '-' + this.tableId);
      if (pageSize != 'undefined' && pageSize != null) {
        this.pageObj.pageSize = pageSize
      }
      this.initEvent();
      this.$nextTick(() => {
        //绑定滚动条事件，控制top按钮
        let el = this.$refs.assetTable.$el.querySelector(".el-table__body-wrapper");
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
        //resize时刷新左侧列表滚动条
        let vm = this;
        window.onresize = function () {
          // vm.$refs.leftScrollbar.update();
          el._ps_.update();
        };
      });
    },
    destroyed() {
      window.onresize = null;
    }
  }
</script>

<style scoped lang="scss">
  .asset {
    height: 100%;
  }
  /deep/ .el-table .cell.el-tooltip{
    min-width: 88px;
  }
  .linkSup{
    position: absolute;
    top: -15px;
    left: 17px;
  }
  .link{
    position: relative;
  }

  .mark{
    vertical-align: middle;
    display: inline-flex;
  }
  .tag-header{
    display: flex; width: 100%; align-items: center; flex-wrap: nowrap;
    .tag-value{
      max-width: calc(100% - 40px); min-width: 20px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;
    }
    .tag-mark{
      color:orange; width: 42px;
    }
  }
  /*/deep/ .sidebar-info-item .el-checkbox__label{*/
    /*padding-right: 15px;*/
    /*width: calc(100% - 32px);*/
  /*}*/
</style>
