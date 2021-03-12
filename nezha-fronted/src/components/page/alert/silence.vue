<template>
  <div class="main-list main-and-sub-transition" :class="{'main-list-with-sub': bottomBox.showSubList}">
    <!--工具组-->
    <div class="top-tools" v-show="bottomBox.mainResizeShow">
      <div class="top-tool-main-right" :class="{'top-tool-main-right-to-left': bottomBox.showSubList}">
        <div class="top-tool-search margin-r-20">
          <search-input :searchMsg="searchMsg" @search="search"
                        :bottomBox.inTransform="bottomBox.inTransform" :single="true"></search-input>
        </div>
        <button :title="$t('overall.exportExcelLower')" @click="addSilence" type="button" v-has="'alertsilence_save'"
                class="nz-btn nz-btn-size-normal nz-btn-style-light" id="alert-list-export">
          <i class="nz-icon nz-icon-create-square"></i>
        </button>
        <delete-button :delete-objs="batchDeleteObjs" @after="getAlertSilence"
                       :api="'alert/silence'" v-has="'alert_silence_delete'" id="alert-msg-batch-delete"></delete-button>
      </div>
      <div class="pagination-top pagination-top-hide display-none"></div>
    </div>
    <!--表格开始-->
    <transition name="el-zoom-in-top">
      <element-set
        id="alert-rule-element-set"
        v-if="tools.showCustomTableTitle"
        @close="tools.showCustomTableTitle = false"
        :custom-table-title.sync="tools.customTableTitle"
        :original-table-title="tableTitle"
        ref="customTableTitle"
      ></element-set>
    </transition>
    <el-table
      id="alert-rule-table"
      class="nz-table"
      :data="tableData"
      border
      v-show="bottomBox.mainResizeShow"
      ref="alertSilenceTable"
      tooltip-effect="light"
      :height="mainTableHeight"
      v-loading="tools.loading"
      style="width: 100%;"
      @sort-change="tableDataSort"
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
        v-for="(item, index) in tools.customTableTitle"
        v-if="item.show"
        :key="`col-${index}`"
        :label="item.label"
        :show-overflow-tooltip="item.prop!=='matchers'"
        :sort-orders="['ascending', 'descending']"
        :sortable="$tableSet.sortableShow(item.prop,'alertSilence')"
        :prop="$tableSet.propTitle(item.prop,'alertSilence')"
        :width="item.width"
      >
        <template slot-scope="scope" :column="item">
          <div v-if="item.prop == 'option'" class="content-right-options">
            <span :id="'alert-edit-'+scope.row.id" :title="$t('overall.edit')" @click.stop="edit(scope.row)"
                  class="content-right-option" v-has="'alert_silence_modify'" v-if="scope.row.state!==3">
              <i class="nz-icon nz-icon-edit"></i>
            </span>
            <span
              :id="'alert-del-'+scope.row.id"
              :title="$t('overall.delete')"
              @click="overtime(scope.row)"
              class="content-right-option"
              v-if="scope.row.state!==3"
              v-has="'alert_silence_delete'">
              <i  class="nz-icon nz-icon-chaoshi"></i>
            </span>
            <span
              :id="'alert-copy-'+scope.row.id"
              :title="$t('overall.copy')"
              @click="copyRow(scope.row,'alertSilence')"
              class="content-right-option"
              v-if="scope.row.state===3"
              v-has="'alertsilence_save'">
              <i  class="nz-icon nz-icon-override"></i>
            </span>
          </div>
          <template v-else-if="item.prop == 'duration'">
            <el-tooltip placement="right" effect="light" :disabled="!scope.row.endAt">
              <div slot="content">
                {{$t('config.terminallog.endTime')}}<br/>
                {{scope.row.endAt}}
              </div>
              <span>{{getDuration(scope.row)}}</span>
            </el-tooltip>
          </template>
          <template v-else-if="item.prop == 'matchers'">
            <div class="nz-silence-tag-box">
              <span class="nz-silence-tag blue" v-if="scope.row.linkId!==-1">
              <span class="nz-silence-tag-title">{{scope.row.type}}</span>
              <span class="nz-silence-tag-content" :title="scope.row.linkName">{{scope.row.linkName}}</span>
            </span>
              <span class="nz-silence-tag rule-gray" v-if="scope.row.ruleId!==-1">
              <span class="nz-silence-tag-title">Alert rule</span>
              <span class="nz-silence-tag-content" :title="scope.row.ruleName">{{scope.row.ruleName}}</span>
            </span>
            </div>
          </template>
          <template v-else-if="item.prop == 'state'">
            <span v-if="scope.row.state===1" class="silence-pending">pending</span>
            <span v-if="scope.row.state===2" class="silence-active">active</span>
            <span v-if="scope.row.state===3" class="silence-expired">expired</span>
          </template>
          <span v-else-if="scope.row[item.prop]">{{scope.row[item.prop] || '-'}}</span>
          <template v-else>-</template>
        </template>
      </el-table-column>


      <el-table-column width="28" :resizable="false">
        <template slot="header" slot-scope="scope">
          <span @mousedown.stop="!tools.showCustomTableTitle && (tools.showCustomTableTitle = true)"
                class="nz-table-gear">
            <i class="nz-icon nz-icon-gear"></i>
          </span>
        </template>
      </el-table-column>
    </el-table>
    <button :class="{'to-top-is-hover': tools.tableHover}" :style="{top: tools.toTopBtnTop}"
            @click="toTop(scrollbarWrap)" class="to-top" v-show="tools.showTopBtn && bottomBox.mainResizeShow"
            id="alert-rule-toTop"><i class="nz-icon nz-icon-top"></i></button>
    <!--表格结束-->
    <!--分页部分-->
    <div class="pagination-bottom" v-show="!bottomBox.showSubList">
      <Pagination :tableId="tableId" :pageObj="pageObj" @pageNo='pageNo' @pageSize='pageSize'
                  ref="Pagination"></Pagination>
    </div>
    <!--导出-->
    <div class="export-xlsx">
      <el-dialog :visible.sync="importBox.show" :title="importBox.title" :modal-append-to-body='false'
                 :show-close="true" width="300px" @close="closeDialog" class="nz-dialog">
        <div class="upload-body">
          <button @click="exportCur" class="el-button el-button--default el-button--small" id="alert-msg-exportcur">
            <span>{{$t('overall.exportCur')}}</span>
          </button>
          <button @click="exportAll" class="el-button el-button--default el-button--small" id="alert-msg-exportall">
            <span>{{$t('overall.exportAll')}}</span>
          </button>
        </div>
      </el-dialog>
    </div>
    <!--侧滑-->
    <transition name="right-box">
      <alert-silence-box v-if="rightBox.show" :alert-silence="alertSilence" @close="closeRightBox"
                        ref="alertSilenceBox"></alert-silence-box>
    </transition>
  </div>
</template>

<script>
  import bus from '../../../libs/bus';
  import axios from 'axios';
  import deleteButton from "../../common/deleteButton";
  import alertSilenceBox from'../../common/rightBox/alertSilenceBox';
  import {calcDurationByStringTimeB} from "../../common/js/tools";
  export default {
    name:"silence",
    components:{
      deleteButton,
      alertSilenceBox
    },
    data(){
      return {
        tableId:'silence',
        //侧滑
        rightBox:{
          show:false,
        },
        /*二级列表相关*/
        mainTableHeight:this.$tableHeight.normal, //主列表table高度
        /*二级页面相关*/
        bottomBox:{
          tabList:[], //二级列表的标签
          tabDetailList:[], //多个详情
          mainResizeShow:true, //dom高度改变时是否展示|隐藏
          subResizeShow:true,
          isFullScreen:false, //全屏状态
          showSubList:false, //是否显示二级列表
          targetTab:'', //显示二级列表中的哪个页签
          inTransform:false, //搜索框相关，搜索条件下拉框是否在transform里
        },
        /*工具参数*/
        tools:{
          loading:false, //是否显示table加载动画
          toTopBtnTop:this.$tableHeight.toTopBtnTop, //to-top按钮的top属性
          tableHover:false, //控制滚动条和top按钮同时出现
          showTopBtn:false, //显示To top按钮
          showCustomTableTitle:false, //自定义列弹框是否显示
          customTableTitle:[], //自定义列工具的数据
        },
        /*批量删除相关*/
        batchDeleteObjs:[],
        /*搜素相关*/
        searchMsg:{ //给搜索框子组件传递的信息
          zheze_none:true,
          searchLabelList:[
            {
              id:11,
              name:this.$t('alert.silence.datacenter'),
              type:'input',
              label:'datacenter',
              disabled:false
            },{
              id:12,
              name:this.$t('alert.silence.project'),
              type:'input',
              label:'project',
              disabled:false
            },{
              id:13,
              name:this.$t('alert.silence.module'),
              type:'input',
              label:'module',
              disabled:false
            },{
              id:14,
              name:this.$t('alert.silence.endpoint'),
              type:'input',
              label:'endpoint',
              disabled:false
            },{
              id:15,
              name:this.$t('alert.silence.asset'),
              type:'input',
              label:'asset ',
              disabled:false
            }
          ],
        },
        searchLabel:{}, //搜索参数
        pageObj:{
          pageNo:1,
          pageSize:this.$CONSTANTS.defaultPageSize,
          total:0
        },
        /*表格相关*/
        tableTitle:[
          {
            label:'ID',
            prop:'id',
            show:true,
            width:80
          },{
            label:'matchers',
            prop:'matchers',
            show:true,
            width:600,
          },{
            label:'Start time',
            prop:'startAt',
            show:true,
            width:300,
          },{
            label: this.$t('config.terminallog.duration'),
            prop: 'duration',
            show: true,
          },{
            label: 'Reason',
            prop: 'reason',
            show: true,
          },{
            label: 'Update time',
            prop: 'utime',
            show: true,
          },{
            label:'State',
            prop:'state',
            show:true,
            width:120,
          },{
            label:this.$t('alert.config.option'),
            prop:'option',
            show:true,
            width:120
          }
        ],
        tableData:[],
        //导出相关
        importBox:{show:false,title:this.$t('overall.exportExcel')},
        deleteBox:{show:false,ids:"",remark:'',state:2},
        //创建修改相关
        blackSilence:{
          id:'',
          startAt:'',
          endAt:'',
          ruleId:'',
          matcher:'',
          type:'asset',
          linkId:'',
          reason:'',
        },
        alertSilence:{

        },
        nowTime:''
      }
    },
    computed:{
      getDuration(){
        return function(record) {
          if (record.endAt) {
            return calcDurationByStringTimeB(record.startAt, record.endAt);
          }
          return calcDurationByStringTimeB(record.startAt, this.nowTime);
        }
      },
    },
    created(){

    },
    mounted(){
      //初始化表头
      this.tools.customTableTitle=localStorage.getItem("nz-tableTitle-"+localStorage.getItem("nz-username")+"-"+this.$route.path)
        ?JSON.parse(localStorage.getItem("nz-tableTitle-"+localStorage.getItem("nz-username")+"-"+this.$route.path))
        :this.tableTitle;
      console.log(this.tools.customTableTitle,this.tableTitle);
      this.tableTitleReset(this.tableTitle,this.tools.customTableTitle);
      this.initEvent();
      this.getAlertSilence();
    },
    methods:{
      initEvent(){
        bus.$on("alert-rule-list-change",()=>{
          this.getAlertSilence();
        });
        bus.$on("dc-list-change",()=>{
          this.getAlertSilence();
        });
        bus.$on('alert-message-change',()=>{
          this.getAlertSilence();
        })
      },
      getAlertSilence(){
        if(!this.hasButton('rule_view')){
          this.$message.error(this.$t("tip.noAccess"));
          return;
        }
        this.$set(this.searchLabel,"pageNo",this.pageObj.pageNo);
        this.$set(this.searchLabel,"pageSize",this.pageObj.pageSize);
        this.tools.loading=true;
        this.$get('alert/silence',this.searchLabel).then(response=>{
          this.tools.loading=false;
          if(response.code==200){
            this.tableData=response.data.list;
            this.pageObj.total=response.data.total;
            this.nowTime=response.time;
            console.info(this.$refs.alertSilenceTable)
            if(!this.scrollbarWrap){
              this.$nextTick(()=>{
                this.scrollbarWrap=this.$refs.alertSilenceTable.bodyWrapper;
                this.toTopBtnHandler(this.scrollbarWrap);
              });
            }
          }
        })
      },
      pageNo(val){
        this.pageObj.pageNo=val;
        this.getAlertSilence();
      },
      pageSize(val){
        this.pageObj.pageSize=val;
        localStorage.setItem('nz-pageSize-'+localStorage.getItem('nz-username')+'-'+this.tableId,val);
        this.getAlertSilence();
      },
      search(searchObj){
        let orderBy='';
        if(this.searchLabel.orderBy){
          orderBy=this.searchLabel.orderBy
        }
        this.searchLabel={};
        this.pageObj.pageNo=1;
        for(let item in searchObj){
          if(searchObj[item]){
            this.$set(this.searchLabel,'type',item);
            this.$set(this.searchLabel,'query',searchObj[item]);
          }
        }
        if(orderBy){
          this.$set(this.searchLabel,'orderBy',orderBy);
        }
        this.$refs.alertSilenceTable.bodyWrapper.scrollTop=0;
        this.getAlertSilence();
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
        this.$set(this.searchLabel,"orderBy",orderBy);
        this.getAlertSilence();
      },
      openDelMessageBox:function(){
        if(this.batchDeleteObjs.length<1) return;
        console.log(this.batchDeleteObjs);
      },
      showExportDialog(){
        this.importBox.show=true;
      },
      closeDialog(){
        this.importBox.show=false;
        this.deleteBox.show=false;
      },
      exportCur:function(){
        let searchLabel=Object.assign({},this.searchLabel)
        this.$set(searchLabel,'language',localStorage.getItem("nz-language")?localStorage.getItem("nz-language"):'en')
        this.exportExcel(searchLabel);
        this.closeDialog();
      },
      exportAll:function(){
        let temp=JSON.parse(JSON.stringify(this.searchLabel));
        temp.pageSize= -1;
        this.$set(temp,'language',localStorage.getItem("nz-language")?localStorage.getItem("nz-language"):'en')
        this.exportExcel(temp);
        this.closeDialog();
      },
      addSilence(){
        this.blackSilence.startAt=bus.timeFormate(bus.getOffsetTimezoneData(),'yyyy-MM-dd hh:mm:ss');
        this.blackSilence.endAt=bus.timeFormate(bus.getOffsetTimezoneData(1),'yyyy-MM-dd hh:mm:ss');
        this.alertSilence=JSON.parse(JSON.stringify(this.blackSilence));
        this.rightBox.show=true;
      },
      edit(row){
        console.log(123123123123);
        this.$get('alert/silence/'+row.id).then(res=>{
          this.alertSilence={...res.data};
          this.rightBox.show=true;
        })
      },
      del(row){
        if(this.prevent_opt.save){
          return
        }
        ;
        this.prevent_opt.save=true;
        this.$confirm(this.$t("tip.confirmDelete"),{
          confirmButtonText:this.$t("tip.yes"),
          cancelButtonText:this.$t("tip.no"),
          type:'warning'
        }).then(()=>{
          this.$delete("alert/silence?ids="+row.id).then(response=>{
            this.prevent_opt.save=false;
            if(response.code===200){
              this.$message({type:'success',message:this.$t("tip.deleteSuccess")});
              this.getAlertSilence();
            }else{
              this.$message.error(response.msg);
            }
          })
        }).catch(()=>{
          this.prevent_opt.save=false;
        });
      },
      overtime(row){
        if(this.prevent_opt.save){
          return
        }
        ;
        this.prevent_opt.save=true;
        this.$confirm(this.$t("tip.confirmOvertime"),{
          confirmButtonText:this.$t("tip.yes"),
          cancelButtonText:this.$t("tip.no"),
          type:'warning'
        }).then(()=>{
          this.$delete("alert/silence?ids="+row.id).then(response=>{
            this.prevent_opt.save=false;
            if(response.code===200){
              this.$message({type:'success',message:this.$t("tip.deleteSuccess")});
              this.getAlertSilence();
            }else{
              this.$message.error(response.msg);
            }
          })
        }).catch(()=>{
          this.prevent_opt.save=false;
        });
      },
      closeRightBox(refresh) {
        this.rightBox.show = false;
        if (refresh) {
          this.delFlag=true;
          this.getAlertSilence();
        }
      },
    }
  }
</script>

<style scoped lang="scss">
  .content-right-options{
    display: flex;
    justify-content: start;
    sapn:not(:first-child){
      margin-left: 10px;
    }
  }
  .nz-silence-tag-box{
    width: 100%;
    height: 100%;
    .nz-silence-tag{
      /*float: left;*/
      /*margin-top: 5px;*/
    }
  }
  .nz-silence-tag{
    min-width: 80px;
    margin-right: 5px;
    border-radius: 4px;
    display: inline-flex;
    width: auto;
    height: 20px;
    line-height: 20px;
    .nz-silence-tag-title{
      color: #fff;
      text-align: center;
      padding: 0 5px;
    }
    .nz-silence-tag-content{
      padding: 0 10px;
      max-width: 200px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      flex: 1;
    }
  }
  .nz-silence-tag.blue{
    border: 1px solid #3C92F1;
    .nz-silence-tag-title{
      background: #3C92F1;
    }
  }
  .nz-silence-tag.rule-gray{
    border: 1px solid #7F8696;
    .nz-silence-tag-title{
      background: #7F8696;
    }
  }

  .silence-active{
    background: #E3F2D9;
    border-radius: 4px;
    font-family: PingFangSC-Regular;
    font-size: 14px;
    color: #0AB000;
    line-height: 14px;
    font-weight: 400;
    padding: 0 5px;
  }
  .silence-pending{
    background: #FFECD9;
    border-radius: 4px;
    font-family: PingFangSC-Regular;
    font-size: 14px;
    color: #FA901C;
    line-height: 20px;
    font-weight: 400;
    padding: 0 5px;
  }
  .silence-expired{
    background: #9e9c98;
    border-radius: 4px;
    font-family: PingFangSC-Regular;
    font-size: 14px;
    color: #ffffff;
    line-height: 14px;
    font-weight: 400;
    padding: 0 5px;
  }
</style>
