<style lang="scss">
  @import '../../charts/chart';

  .project-calendar .el-input__inner {
    height: 24px;
  }

  .change-time-height {
    height: 23px;
  }

  .date-pick-group {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .date-pick-group button:first-of-type {
    margin-right: 4px;
  }

  .date-pick-group button:last-of-type {
    margin-left: 4px;
  }
</style>
<template>
  <div class="project">
    <template v-if="pageType == 'endpoint'">
      <div class="main-list" :class="{'main-list-with-sub': bottomBox.showSubList}">
        <div class="main-modal"></div>
        <div class="top-tools" v-show="bottomBox.mainResizeShow">
          <div class="top-tool-main-right" :class="{'top-tool-main-right-to-left': bottomBox.showSubList}">
            <div class="top-tool-search">
              <search-input :searchMsg="endpointSearchMsg" @search="endpointSearch" ref="projectSearch"></search-input>
            </div>
            <export-excel
              id="endpoint-list"
              export-file-name="endpoint"
              export-url="/endpoint/export"
              import-url="/endpoint/import"
              :params="endpointSearchLabel"
              :permissions="{import: 'project_endpoint_import', export: 'project_endpoint_export'}"
              @afterImport="afterCloseImport"
              class="margin-l-20"
            >
              <template slot="optionZone">
                <button :title="$t('overall.createEndpoint')" @click.stop="addEndpoint" v-has="'project_endpoint_toAdd'"
                        class="nz-btn nz-btn-size-normal nz-btn-style-light" id="project-create-project">
                  <i class="nz-icon nz-icon-create-square"></i>
                </button>
              </template>
            </export-excel>
            <delete-button :delete-objs="batchDeleteObjs" @after="afterCloseImport" @before="delFlag=true" api="endpoint" v-has="'project_endpoint_delete'"></delete-button>
          </div>
          <div class="pagination-top pagination-top-hide display-none"></div>
        </div>
        <!-- 自定义table列 -->
        <transition name="el-zoom-in-top">
          <element-set
            id="endpoint-list"
            v-if="tools.showCustomTableTitle"
            @close="tools.showCustomTableTitle = false"
            :custom-table-title.sync="tools.customTableTitle"
            :original-table-title="tableTitle"
            ref="customTableTitle"
          ></element-set>
        </transition>
        <el-table
          id="endpoint-list-table"
          :data="endpointTableData"
          border
          class="nz-table endpoint-table"
          :height="mainTableHeight"
          v-show="bottomBox.mainResizeShow"
          ref="endpointTable"
          :cell-class-name="messageStyle"
          v-loading="tools.loading"
          style="width: 100%;"
          @sort-change="tableDataSort"
          @row-dblclick="detailEndpoint"
          @selection-change="(selection)=>{this.batchDeleteObjs=selection}"
          @header-dragend="()=>{this.$refs.endpointTable.doLayout();}"
        >
          <el-table-column
            :resizable="false"
            type="selection"
            width="40"
            align="center">
          </el-table-column>
          <el-table-column
            :resizable="true"
            v-for="(item, index) in tools.customTableTitle"
            v-if="item.show"
            :key="`col-${index}`"
            :label="item.label"
            :min-width="item.width || item.minWidth"
            :sortable="$tableSet.sortableShow(item.prop,'project')"
            :prop="$tableSet.propTitle(item.prop,'project')"
            :sort-orders="['ascending', 'descending']"
          >
            <template slot-scope="scope" :column="item">
              <span v-if="item.prop == 'asset' && scope.row[item.prop]" class="link" @click="detailEndpoint(scope.row)">
                {{scope.row[item.prop].sn}} :
                ({{scope.row[item.prop].host}})
              </span>
              <span v-else-if="item.prop == 'param'">
              <template v-if="scope.row.paramObj">
                <span v-for="(p,i) in scope.row.paramObj">{{p.key}}={{p.value}}<span
                  v-if="i < scope.row.paramObj.length-1">，</span></span>
              </template>
              <template v-else>-</template>
            </span>
              <span v-else-if="item.prop == 'labels'">
                <template v-if="scope.row.labelModule">
                  <span v-for="(p,i) in scope.row.labelModule">{{p.key}}={{p.value}}<span
                    v-if="i < scope.row.labelModule.length-1">，</span></span>
                </template>
                <template v-else>-</template>
              </span>
              <template v-else-if="item.prop=='alerts'">
                <el-tooltip :content="scope.row.alertNum+' '+$t('overall.active')" placement="top" effect="light"
                            :disabled=" scope.row.alertNum < 99">
                  <span :id="'endpoint-alerts-'+scope.row.id" @click="jumpToAlertMsg(scope.row)" class="link">
                    {{(scope.row.alertNum < 99 ? scope.row.alertNum : 99)}}
                      <sup class="linkSup" v-if="scope.row.alertNum > 99">+</sup>
                    {{' ' + $t('overall.active')}}
                  </span>
                </el-tooltip>
              </template>
              <template v-else-if="item.prop == 'type'">{{currentModule.type}}</template>
              <div v-else-if="item.prop == 'option'" class="content-right-options">
                <span :title="$t('overall.view')" @click="detailEndpoint(scope.row)" class="content-right-option"
                      :id="'edp-detail-'+scope.row.id"><i class="nz-icon nz-icon-view"></i></span>
                &nbsp;
                <span :title="$t('overall.query')" @click="query(scope.row)" class="content-right-option"
                      :id="'edp-query-'+scope.row.id"><i class="nz-icon nz-icon-search"></i></span>
                &nbsp;
                <span :title="$t('overall.edit')" @click="editEndpoint(scope.row)" class="content-right-option" v-has="'project_endpoint_toEdit'"
                      :id="'edp-edit-'+scope.row.id"><i class="nz-icon nz-icon-edit"></i></span>

                <span :title="$t('overall.delete')" @click.stop="delEndpoint(scope.row)" class="content-right-option" v-has="'project_endpoint_delete'"
                      :id="'asset-del-'+scope.row.id"><i class="nz-icon nz-icon-delete"></i></span>
              </div>
              <span v-else-if="item.prop == 'state'">
              <el-popover placement="right" width="50" trigger="hover"
                          :popper-class="scope.row.state == '1'?'small-pop':''">
                <div slot="reference" style="width: 20px">
                  <div :class="{'active-icon green':scope.row.state == '1', 'active-icon red':scope.row.state == '0', 'active-icon gray':scope.row.state == '2'}"></div>
                </div>
                <div>
                  <div v-if="scope.row.state == '1'">up</div>
                  <div v-else-if="scope.row.state == '0'">down:<br/>{{getStateErrorMsg(scope.row)}}</div>
                  <div v-else-if="scope.row.state == '2'">suspended</div>
                </div>
              </el-popover>
            </span>
              <span v-else-if="scope.row[item.prop]">{{scope.row[item.prop]}}</span>
              <template v-else>-</template>
            </template>
          </el-table-column>
          <el-table-column width="28" :resizable="true">
            <template slot="header" slot-scope="scope">
            <span @mousedown.stop="!tools.showCustomTableTitle && (tools.showCustomTableTitle = true)"
                  class="nz-table-gear">
              <i class="nz-icon nz-icon-gear"></i>
            </span>
            </template>
            <template v-slot="scope">
            </template>
          </el-table-column>
        </el-table>
        <button class="to-top" :style="{top: tools.toTopBtnTop}" id="endpoint-list-totop"
                :class="{'to-top-is-hover': tools.tableHover}"
                @click="toTop(scrollbarWrap)" v-show="tools.showTopBtn && bottomBox.mainResizeShow"><i
          class="nz-icon nz-icon-top"></i></button>
        <div class="pagination-bottom" v-show="!bottomBox.showSubList">
          <Pagination :tableId="tableId" v-cloak :pageObj="endpointPageObj" @pageNo='endpointPageNo'
                      @pageSize='endpointPageSize' ref="endpointPagination"></Pagination>
        </div>
      </div>
    </template>
    <template v-else-if="pageType == 'project'">
      <!--<panel-tab from="project" :obj="currentProject" targetTab.sync="panel"></panel-tab>-->
      <!--<facade :obj="currentProject" targetTab.sync="panel" ref="facade" v-if="reloadFacade"/>-->
      <topologyL5 :obj="currentProject" targetTab.sync="panel" ref="facade" v-if="reloadFacade"/>
    </template>

    <transition name="el-zoom-in-bottom">
      <bottom-box v-if="bottomBox.showSubList"
                  :sub-resize-show="bottomBox.subResizeShow"
                  :is-full-screen="bottomBox.isFullScreen"
                  :from="$CONSTANTS.fromRoute.endpoint"
                  :target-tab.sync="bottomBox.targetTab"
                  :detail="bottomBox.endpointDetail"
                  :obj="endpoint"
                  :detail-list="bottomBox.alertList"
                  :asset-detail="bottomBox.assetDetail"
                  @closeSubList="bottomBox.showSubList = false"
                  @fullScreen="fullScreen"
                  @exitFullScreen="exitFullScreen"
                  @listResize="listResize"></bottom-box>
    </transition>
    <transition name="right-box">
      <add-endpoint-box v-if="rightBox.addEndpoint.show" :current-project="currentProject"
                        :current-module="currentModule" @close="closeAddEndpointRightBox"
                        ref="addEndpointBox"></add-endpoint-box>
    </transition>
    <transition name="right-box">
      <edit-endpoint-box v-if="rightBox.editEndpoint.show" :project="currentProject" :module="currentModule"
                         :endpoint="endpoint" @close="closeEditEndpointRightBox"
                         ref="editEndpointBox"></edit-endpoint-box>
    </transition>
  </div>
</template>

<script>
  import exportXLSX from "../../common/exportXLSX";
  import loading from "../../common/loading";
  import panelTab from '../../common/bottomBox/tabs/panelTab'
  import bus from '../../../libs/bus'
  import facade from '@/components/common/project/projectFacade'
  import topologyL5 from '@/components/common/project/topologyL5'
  import deleteButton from "../../common/deleteButton";

  export default {
    name:"project2",
    components:{
      'export-excel':exportXLSX,
      'loading':loading,
      'panel-tab':panelTab,
      facade,
      topologyL5,
      'delete-button':deleteButton,
    },
    computed:{
      currentProjectChange() {
        return this.$store.state.currentProject;
      }
    },
    data(){
      return {
        rightBox:{
          module:{show:false},
          addEndpoint:{show:false},
          editEndpoint:{show:false},
        },
        /*二级页面相关*/
        bottomBox:{
          endpoint:{}, //asset详情
          endpointDetail:null,
          mainResizeShow:true, //dom高度改变时部分内容是否展示
          subResizeShow:true,
          isFullScreen:false, //是否是全屏，用来控制拖动条是否展示,
          showSubList:false,
          targetTab:'',
        },

        mainTableHeight:this.$tableHeight.normal, //主列表table高度
        ready:false,

        /*工具参数*/
        tools:{
          loading:false, //是否显示table加载动画
          toTopBtnTop:this.$tableHeight.toTopBtnTop, //to-top按钮的top属性
          tableHover:false, //控制滚动条和top按钮同时出现
          showTopBtn:false, //显示To top按钮
          showCustomTableTitle:false, //自定义列弹框是否显示
          customTableTitle:[], //自定义列工具的数据
        },
        batchDeleteObjs:[],

        tableId:'projectTable', //需要分页的table的id，用于记录每页数量
        userData:[],

        endpoint:{
          id:'',
          host:'',
          port:'',
          param:'',
          path:'',
          asset:{},
          project:{},
          module:{},
          moduleId:'',
          assetId:'',
          paramObj:[]
        },
        tableTitle:[
          {
            label:this.$t("project.endpoint.endpointId"),
            prop:'id',
            show:true,
            width:150
          },{
            label:this.$t("project.endpoint.asset"),
            prop:'asset',
            show:true,
            minWidth:400,
          },{
            label:this.$t("project.endpoint.host"),
            prop:'host',
            show:true,
            width:200,
          },{
            label:this.$t("project.endpoint.port"),
            prop:'port',
            show:true,
            width:100,
          },{
            label:this.$t("overall.type"),
            prop:'type',
            show:false,
            width:200,
          },{
            label:this.$t("project.endpoint.labels"),
            prop:'labels',
            show:true,
            width:200,
          },{
            label:this.$t("project.endpoint.param"),
            prop:'param',
            show:true,
            width:200,
          },{
            label:this.$t("project.endpoint.path"),
            prop:'path',
            show:true,
            width:200,
          },{
            label:this.$t("alert.list.state"),
            prop:'state',
            show:true,
            width:80,
          },{
            label:this.$t("project.endpoint.alerts"),
            prop:'alerts',
            show:true,
            width:150,
          },
          // {
          //   label: this.$t("project.endpoint.lastUpdate"),
          //   prop: 'lastUpdate',
          //   show: true,
          // },
          {
            label:this.$t('config.account.option'),
            prop:'option',
            show:true,
            width:120
          }
        ],
        endpointTableData:[],
        endpointPageObj:{
          pageNo: 1,
          pageSize: this.$CONSTANTS.defaultPageSize,
          total: 0
        },

        currentProjectTitle:'',
        moduleList:[],
        projectList:[],
        pageType:'project', //project endpoint
        currentProject:{id:'',name:'',remark:''}, //endpoint弹框、module列表用来回显project
        module:{}, //编辑的module
        blankModule:{id:'',type:'',name:'',project:{},port:'',path:'',param:'',paramObj:[],snmpParam:''}, //空白module
        currentModule:{id:'',type:'',name:'',project:{},port:'',path:'',param:'',paramObj:[],snmpParam:''}, //用来回显的module
        endpointSearchLabel:{moduleId:''}, //endpoint搜索参数
        endpointSearchMsg:{ //给搜索框子组件传递的信息
          zheze_none:true,
          searchLabelList:[{
            id:1,
            name:"ID",
            type:'input',
            label:'id',
            disabled:false
          },{
            id:11,
            name:this.$t('asset.asset'),
            // name: this.$t('asset.asset'),
            type:'query',
            label:'query',
            disabled:false
          },{
            id:33,
            name:this.$t('asset.state'),
            // name: this.$t('asset.asset'),
            type:'select',
            label:'endpointState',
            disabled:false,
            readonly:true,
          }],
        },
        scrollbarWrap: null,
        delFlag:false,
      }
    },
    methods:{
      // 全屏
      fullScreen(){
        let vm=this;
        this.$bottomBoxWindow.fullScreen(vm);
      },
      // 退出全屏
      exitFullScreen(){
        let vm=this;
        this.$bottomBoxWindow.exitFullScreen(vm);
      },
      // 鼠标拖动二级列表
      listResize(e){
        let vm=this;
        this.$bottomBoxWindow.listResize(vm,e);
      },
      getEndpointTableData(){
        if(this.currentModule&&this.currentModule.id){
          this.pageType='endpoint';
          this.endpointSearchLabel.moduleId=this.currentModule.id;
          this.$set(this.endpointSearchLabel,'pageNo',this.endpointPageObj.pageNo);
          this.$set(this.endpointSearchLabel,'pageSize',this.endpointPageObj.pageSize);
          this.tools.loading=true;
          this.$get('endpoint',this.endpointSearchLabel).then(response=>{
            this.tools.loading=false;
            if(response.code===200){
              for(let i=0; i<response.data.list.length; i++){
                try{
                  let param=response.data.list[i].param ||  '{}'
                  let tempObj=JSON.parse(param);
                  let labels=response.data.list[i].labels|| '{}';
                  let tempObj1=JSON.parse(labels);
                  response.data.list[i].paramObj=[];
                  response.data.list[i].labelModule=[];
                  for(let k in tempObj){
                    response.data.list[i].paramObj.push({key:k,value:tempObj[k]})
                  }
                  for(let k in tempObj1){
                    response.data.list[i].labelModule.push({key:k,value:tempObj1[k]})
                  }
                }catch(err){
                  // console.error(response.data.list[i], err);
                }
              }
              this.endpointTableData=response.data.list;
              this.endpointPageObj.total=response.data.total;
              if (!this.scrollbarWrap) {
                this.$nextTick(() => {
                  this.scrollbarWrap = this.$refs.endpointTable.bodyWrapper;
                  this.toTopBtnHandler(this.scrollbarWrap);
                });
              }
            }
          });
        }
      },
      afterCloseImport:function(){
        this.getEndpointTableData();
        bus.$emit('module-list-change')
      },
      endpointPageNo(val){
        this.endpointPageObj.pageNo=val;
        this.getEndpointTableData();
      },
      endpointPageSize(val){
        this.endpointPageObj.pageSize=val;
        localStorage.setItem('nz-pageSize-'+localStorage.getItem('nz-username')+'-'+this.tableId,val);
        this.getEndpointTableData();
      },

      getProjectList(){
        this.$get('project',{pageSize:-1}).then(response=>{
          if(response.code==200){
            this.projectList=response.data.list;
          }
        })
      },
      getProjectModule(projectId){
        let moduleList=JSON.parse(JSON.stringify(this.moduleList));
        return moduleList.filter((item,index)=>{
          return item.project.id==projectId;
        })
      },
      detailProject(project){
        this.pageType='project';
        if(project){
          this.currentProject=project;
          this.currentProjectTitle=project.id+"";
        }
        this.currentModule={};
      },
      closeAddEndpointRightBox(refresh){
        this.rightBox.addEndpoint.show=false;
        if(refresh){
          this.getEndpointTableData();
        }
      },
      closeEditEndpointRightBox(refresh){
        this.rightBox.editEndpoint.show=false;
        if(refresh){
          this.getEndpointTableData();
        }
      },
      getModuleList(){
        this.$get('module',{pageSize:-1,pageNo:1}).then(response=>{
          if(response.code===200){
            this.moduleList=response.data.list;
            for(let i=0; i<this.moduleList.length; i++){
              try{
                let param= this.moduleList[i].param || '{}';
                let tempObj=JSON.parse(param);
                this.$set(this.moduleList[i],'paramObj',[]);
                for(let k in tempObj){
                  this.moduleList[i].paramObj.push({key:k,value:tempObj[k]});
                }
                let labels= this.moduleList[i].labels || '{}';
                let tempObj1=JSON.parse(labels);
                this.$set(this.moduleList[i],'labelModule',[]);
                for(let k in tempObj1){
                  this.moduleList[i].labelModule.push({key:k,value:tempObj1[k]});
                }
              }catch(err){
                console.error(response.data.list[i], err);
              }
            }
          }
        });
      },
      //左侧module列表选中切换
      changeModule(project,module){
        this.currentModule=module;
        this.endpointSearchLabel={moduleId:''};
        this.$refs.projectSearch.clearSearch();
        this.bottomBox.showSubList=false;
        this.currentProject=project;
      },
      //弹出endpoint编辑页
      editEndpoint(endpoint){
        this.endpoint=JSON.parse(JSON.stringify(endpoint));
        this.$set(this.endpoint,'projectId',this.currentModule.project.id)
        this.$set(this.endpoint,'moduleId',this.currentModule.id)

        this.rightBox.editEndpoint.show=true;
        if(!this.endpoint.paramObj){
          this.$set(this.endpoint,'paramObj',[]);
        }
        if(!this.endpoint.labelModule){
          this.$set(this.endpoint,'labelModule',[]);
        }
      },

      addEndpoint(){
        this.endpoint.project=Object.assign({},this.currentModule.project);
        this.endpoint.module=Object.assign({},this.currentModule);
        this.rightBox.addEndpoint.show=true;
      },

      //查看endpoint详情
      detailEndpoint(endpoint){
        this.endpoint=Object.assign({},endpoint);
        this.bottomBox.targetTab="panel";
        this.bottomBox.showSubList=true;
      },
      delEndpoint(endpoint){
        this.$confirm(this.$t("tip.confirmDelete"),{
          confirmButtonText:this.$t("tip.yes"),
          cancelButtonText:this.$t("tip.no"),
          type:'warning'
        }).then(()=>{
          this.$delete("endpoint?ids="+endpoint.id).then(response=>{
            if(response.code===200){
              this.delFlag=true;
              this.$message({duration:1000,type:'success',message:this.$t("tip.deleteSuccess")});
              this.getEndpointTableData();
            }else{
              this.$message.error(response.msg);
            }
          });
        });
      },
      jumpToAlertMsg(endpoint){
        if (!this.hasButton('project_endpoint_alerts_view')) {
          return;
        }
        this.endpoint=Object.assign({},endpoint);
        this.bottomBox.targetTab='alertMessage';
        this.bottomBox.showSubList=true;
      },
      addModule(){
        this.module=this.newModule();
        this.rightBox.module.show=true;
        this.$nextTick(()=>{
          this.$refs.moduleBox.initWalk();
        });
      },
      newModule(){
        return JSON.parse(JSON.stringify(this.blankModule));
      },

      //搜索
      endpointSearch(searchObj){
        let orderBy='';
        if(this.endpointSearchLabel.orderBy){
          orderBy=this.endpointSearchLabel.orderBy
        }
        this.endpointSearchLabel={};
        this.endpointPageObj.pageNo=1;
        for(let item in searchObj){
          if(searchObj[item] || searchObj[item] === 0){
            if (item === "endpointState") {
              this.$set(this.endpointSearchLabel, 'state', searchObj[item]);
            } else {
              this.$set(this.endpointSearchLabel,item,searchObj[item]);
            }
          }
        }
        if(orderBy){
          this.$set(this.endpointSearchLabel,'orderBy',orderBy);
        }
        if(this.$refs.endpointTable&&this.$refs.endpointTable.bodyWrapper){
          this.$refs.endpointTable.bodyWrapper.scrollTop = 0;
        }
        this.getEndpointTableData();
      },

      dateFormat(time){
        if(!time){
          return '-';
        }
        let date=new Date(time*1000);
        let year=date.getFullYear();
        let month=date.getMonth()+1<10?"0"+(date.getMonth()+1):date.getMonth()+1;
        let day=date.getDate()<10?"0"+date.getDate():date.getDate();
        let hours=date.getHours()<10?"0"+date.getHours():date.getHours();
        let minutes=date.getMinutes()<10?"0"+date.getMinutes():date.getMinutes();
        let seconds=date.getSeconds()<10?"0"+date.getSeconds():date.getSeconds();

        return year+"-"+month+"-"+day+" "+hours+":"+minutes+":"+seconds;
      },
      viewAsset(endpoint){
        this.endpoint=Object.assign({},endpoint);
        this.bottomBox.targetTab='assetDetail';
        this.bottomBox.showSubList=true;
      },
      query(endpoint){
        this.endpoint=Object.assign({},endpoint);
        this.bottomBox.targetTab='endpointQuery';
        this.bottomBox.showSubList=true;
      },
      getStateContent:function(row){
        if(row){
          if(row.state==1){
            return 'up';
          }else{
            return `down:${this.getStateErrorMsg(row)}`
          }
        }
      },
      convertToDetail(obj){
        let detail={
          project:obj.project.name,
          module:obj.module.name,
          asset:obj.asset.host,
          host:obj.host,
          port:obj.port,
          path:obj.path,
          param:obj.param
        };
        return detail;
      },
      formatUpdateTime:function(date){
        let time=new Date(date);
        let hours=time.getHours()>9?time.getHours():'0'+time.getHours();
        let minutes=time.getMinutes()>9?time.getMinutes():'0'+time.getMinutes();

        return hours+':'+minutes;
      },
      getStateErrorMsg(row){
        let errCodes=[230009,230010,230011];
        if(row){
          if(row.state==0){
            if(errCodes.find((item)=>{
              return row.stateInfo.code==item
            })){
              return this.$t('project.endpoint.stateInfo_'+row.stateInfo.code)
            }else{
              return row.stateInfo.msg;
              this.$message.error('state code error');
            }
          }
        }
      },
      assetConvertToDetail(obj){
        let detail=JSON.parse(JSON.stringify(obj));
        detail.state=obj.state==1?this.$t('asset.inStock'):this.$t('asset.notInStock');
        detail.assetType=obj.model.type.value;
        detail.vendorModel=obj.model.vendor.value+" "+obj.model.name;
        detail.dataCenter=obj.idc?obj.idc.name:"";
        detail.location=obj.idc?obj.idc.location:"";
        detail.principal=obj.idc?this.getPrincipalName(obj.idc.principal):"";
        detail.tel=obj.idc?obj.idc.tel:"";
        detail.cabinet=obj.cabinet?obj.cabinet.name:"";
        detail.uSize=obj.cabinet?obj.cabinet.uSize:"";
        detail.remark=obj.idc?obj.idc.remark:"";
        !obj.accounts&&(obj.accounts=[]);
        if(obj.accounts.length>0){
          let account=obj.accounts[0];
          detail.protocol=account.protocol;
          detail.account=account.user;
          let loginType="";
          if(account.authType==1){
            loginType=this.$t('asset.password');
          }else if(account.authType==2){
            loginType=this.$t('asset.ssh');
          }
          detail.loginType=loginType;
          detail.port=account.port;
        }
        return detail;
      },
      getPrincipalName(data){
        for(let item in this.userData){
          if(this.userData[item].userId===data){
            return this.userData[item].username
          }
        }
      },
      getUserData(){
        this.$get('sys/user/list').then(response=>{
          if(response.code===200){
            this.userData=response.data.list
          }
        })
      },
      //刷新拓扑图
      visNetworkReload(){
        this.$refs['facade'].$refs['visNetwork'].reload()
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
        this.$set(this.endpointSearchLabel,"orderBy",orderBy);
        this.getEndpointTableData();
      },
      initEvent(){
        bus.$on("project-page-type",pageType=>{
          this.pageType=pageType;
        });
        bus.$on("current-project-change",project=>{
          this.currentProject=project;
        });
        bus.$on("current-module-change",module=>{
          this.currentModule=module;
          this.bottomBox.showSubList=false;
        });
        bus.$on("project-list-change",()=>{
          this.getProjectList();
        });
        bus.$on("module-list-change",menu=>{
          this.getModuleList();
        });
        bus.$on("endpoint-list-change",menu=>{
          this.getEndpointTableData();
        });
        bus.$on('alert-message-change',()=>{
          this.getEndpointTableData()
        })
      },
      messageStyle(e){
        if(e.column.label=='Alerts'||e.column.label==this.$t("project.endpoint.alerts")){
          if(e.row.alertNum>0){
            return 'danger';
          }else{
            return 'success';
          }
        }
        return '';
      },
    },
    created(){
      this.currentProject=this.$store.state.currentProject;
      //是否存在分页缓存
      let pageSize=localStorage.getItem('nz-pageSize-'+localStorage.getItem('nz-username')+'-'+this.tableId);
      if(pageSize){
        this.endpointPageObj.pageSize=pageSize
      }
      this.getModuleList();
      this.getUserData();
      this.getProjectList();
    },
    mounted(){
      //初始化表头
      this.tools.customTableTitle=localStorage.getItem("nz-tableTitle-"+localStorage.getItem("nz-username")+"-"+this.$route.path)
        ?JSON.parse(localStorage.getItem("nz-tableTitle-"+localStorage.getItem("nz-username")+"-"+this.$route.path))
        :this.tableTitle;
      this.tableTitleReset(this.tableTitle,this.tools.customTableTitle);
      setTimeout(()=>{
        this.ready=true;
      },300);

      this.initEvent();
    },
    computed:{
      itemTip(){
        return function(id,content,ready){
          let className="item-tip-show";
          this.$nextTick(()=>{
            if(ready){
              let cellDom=document.querySelector(`#module-${id}`);
              let spanDom=document.querySelector(`#module-${id}>span`);
              if(cellDom.offsetWidth-16<=spanDom.offsetWidth){
                document.querySelector(`#module-${id}>.el-popover`).classList.add(className);
              }else{
                document.querySelector(`#module-${id}>.el-popover`).classList.remove(className);
              }
            }
          });
          return "";
        }
      },
      reloadFacade(){
        return this.$store.getters.getReloadFacade
      },
    },
    watch:{
      currentModule(n,o){
        this.endpointPageObj.pageNo=1;
        if(n&&n.id){
          this.getEndpointTableData();
        }else{
          this.endpointTableData=[];
        }
      },

      "bottomBox.showSubList":function(n){
        let vm=this;
        this.$bottomBoxWindow.showSubListWatch(vm,n);
      },
      endpoint:{
        deep:true,
        handler(n){
          this.bottomBox.endpointDetail=this.convertToDetail(n);
          this.$get('asset',{id:n.assetId}).then(response=>{
            if(response.code===200){
              this.bottomBox.assetDetail=this.assetConvertToDetail(response.data.list[0]);
            }
          });
        }
      },
      endpointTableData: {
        deep: true,
        handler(n) {
          if (n.length === 0 && this.endpointPageObj.pageNo > 1) {
            this.endpointPageNo(this.endpointPageObj.pageNo-1);
          }
          if(!this.delFlag&&this.pageType==='endpoint'){ // 不是删除时回到顶部 以及修改时
            this.$refs.endpointTable.bodyWrapper.scrollTop = 0
          }else{
            this.delFlag=false;
          }
        }
      },
    },
    beforeDestroy() {
      bus.$off("project-page-type");
      bus.$off("current-project-change");
      bus.$off("current-module-change");
      bus.$off("project-list-change");
      bus.$off("module-list-change");
      bus.$off("endpoint-list-change");
      bus.$off('alert-message-change');
      if(this.scrollbarWrap){
        this.scrollbarWrap.removeEventListener('scroll', bus.debounce);
      };
    },
  }
</script>

<style scoped lang="scss">
  .project {
    height: 100%;
  }

  /*  .content-right-option {
      cursor: pointer;
      display: inline-block;
      margin-right: 6px;
    }
    .content-right-option .nz-icon-delete {
      color: #F98D9A;
    }
    .content-right-option .nz-icon-delete:hover {
      color: #D96D7A;
    }
    .content-right-option .nz-icon-view {
      color: #60BEFF;
    }
    .content-right-option .nz-icon-view:hover {
      color: #409EFF;
    }*/
  /* start--param*/
  .param-btn {
    float: right;
    height: 27px;
    margin-top: -3px;
  }

  .param-btn-active {
    background-color: #656565;
    color: white;
    border: 1px solid #656565;
  }

  .param-btn-active:hover, .param-btn-active:focus {
    background-color: #656565;
    color: white;
  }

  .param-btn-clear {
    background-color: #D4D4D4;
    border: 1px solid #D4D4D4;
    color: white;
  }

  .param-btn-clear:hover, .param-btn-clear:focus {
    background-color: #D4D4D4;
    color: white;
  }

  .param-box {
    border: 1px solid #DCDFE6;
    border-radius: 4px;
    padding: 0 10px;
  }

  .param-box-endpoint {
    height: 325px;
  }

  .param-box-module {
    height: 227px;
  }

  .param-box-row {
    padding: 7px 0 0 0;
    position: relative;
  }

  .param-box-row:last-of-type {
    padding-bottom: 7px;
  }

  .param-box-row-key, .param-box-row-value {
    display: inline-block;
    width: 41.5%;
  }

  .param-box-row-eq {
    display: inline-block;
    width: 22px;
    text-align: center;
    height: 32px;
    line-height: 32px;
    color: #c4c7cF;
  }

  .param-box-row-symbol {
    font-size: 12px;
    color: #c4c7cF;
    border: 1px solid #c4c7cF;
    text-align: center;
    height: 12px;
    width: 14px;
    display: inline-block;
    position: absolute;
    top: 17px;
    right: 25px;
    cursor: pointer;
  }

  .param-box-row-symbol > i {
    position: absolute;
    top: 1px;
    right: 1px;
  }

  /* end--param*/

  /* begin--子弹框*/
  .right-sub-box {
    width: 380px;
    height: 520px;
    position: absolute;
    top: 380px;
    right: 100px;
    z-index: 2;
    padding: 0 10px;
  }

  .right-sub-box .el-input-group {
    width: 227px;
    float: right;
    margin: 7px 0 0 0;
  }

  /* begin--搜索框*/
  .endpoint-asset-prepend {
    border-radius: 4px 0 0 4px;
  }

  .endpoint-asset-label {
    line-height: 26px;
    height: 26px;
  }

  .endpoint-asset-dropdown {
    position: absolute;
    top: 27px;
    background-color: #656565;
    border-radius: 4px;
    width: 52px;
    left: 0;
  }

  .endpoint-asset-dropdown-item {
    text-align: center;
    line-height: 22px;
    height: 22px;
    cursor: default;
  }

  .endpoint-asset-label-txt {
    display: inline-block;
    width: 19px;
    text-align: center;
  }

  .endpoint-asset-dropdown-item:first-of-type {
    border-radius: 4px 4px 0 0;
  }

  .endpoint-asset-dropdown-item:last-of-type {
    border-radius: 0 0 4px 4px;
  }

  .endpoint-asset-dropdown-item:hover {
    background-color: #3a8ee6;
  }

  /* end--搜索框*/
  /* begin--table*/
  .endpoint-sub-table {
    margin-top: 25px;
  }

  .line-100 {
    margin-bottom: 3px;
  }

  .endpoint-sub-table-head {
    line-height: 28px;
    height: 30px;
  }

  .endpoint-sub-table-row {
    line-height: 28px;
    height: 30px;
    color: #656565;
  }

  .endpoint-sub-table-row-active {
    background-color: #dadada;
  }

  .endpoint-sub-table-col {
    display: inline-block;
    width: 45%;
    padding-left: 10px;
  }

  .endpoint-sub-table-paginate-all {
    position: absolute;
    left: 10px;
    bottom: 17px;
    color: #5a5a5a;
  }

  .endpoint-sub-table-body {
    font-size: 15px;
  }

  /* end--table*/

  /* end--子弹框*/

  .item-tip-hide {
    display: none;
    position: absolute;
    bottom: 34px;
    min-width: 50px;
    white-space: normal;
  }

  .item-tip:hover > .item-tip-show {
    display: block;
  }
</style>
<style>
  /* begin--覆盖分页组件样式*/
  .right-sub-box .el-pagination.is-background .btn-next, .right-sub-box .el-pagination.is-background .btn-prev, .right-sub-box .el-pagination.is-background .el-pager li {
    margin: 0 3px;
    min-width: 25px;
  }

  .right-sub-box .el-pagination button, .right-sub-box .el-pagination span:not([class*=suffix]) {
    margin: 0 3px;
    height: 25px;
    line-height: 25px;
  }

  .right-sub-box .el-pager li {
    height: 25px;
    line-height: 25px;
  }

  .right-sub-box .el-pagination.is-background .el-pager li:not(.disabled).active {
    background-color: #656565;
    border: 1px solid #656565;
  }

  .right-sub-box .el-pagination.is-background .btn-next, .right-sub-box .el-pagination.is-background .btn-prev, .right-sub-box .el-pagination.is-background .el-pager li {
    background-color: white;
  }

  .right-sub-box .el-pagination button, .right-sub-box .el-pager li {
    border: 1px solid #DADADA;
  }

  .right-sub-box .el-pager li.active + li {
    border: 1px solid #DADADA;
  }

  .right-sub-box .el-pagination.is-background .el-pager li:not(.disabled):hover {
    color: black;
  }

  .right-sub-box .el-pagination.is-background .el-pager li.active:hover {
    color: white;
  }

  .endpoint-sub-table-paginate .el-pagination {
    position: absolute;
    right: 10px;
    bottom: 13px;
  }

  .el-input-group__append > i {
    cursor: pointer;
  }

  .el-table .disabledCheck .cell .el-checkbox__inner {
    display: none !important;
  }

  .el-table .disabledCheck .cell::before {
    /*content: '\e627';*/
    /*font-family: 'nz-icon';*/
    text-align: center;
    line-height: 37px;
  }

  /* end--覆盖分页组件样式*/

  /* 列表搜索框 样式重写*/
  .relative-position {
    position: relative;
  }

  .query-input-inactive {
    left: 213px;
    width: 18%;
  }

  .query-input-inactive .el-input__inner {
    height: 26px;
    line-height: 26px;
  }

  .metric-tip-icon {
    vertical-align: middle;
    transform: scale(0.6);
    display: inline-block;
  }

  .metirc-tip-list {
    line-height: 26px;
    font-weight: bold;
  }

  .table-header-inner {
    position: absolute;
    z-index: 1;
    top: 38px;
    left: 11px;
    cursor: pointer;
  }

  .control-icon-unchecked {
    color: #d1d1d1;
  }

  .control-icon-checked {
    color: #666;
  }
</style>
