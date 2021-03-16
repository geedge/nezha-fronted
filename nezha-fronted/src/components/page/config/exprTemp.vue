<template>
  <div class="main-list main-and-sub-transition" :class="{'main-list-with-sub': bottomBox.showSubList}">
    <!--工具组-->
    <div class="top-tools" v-show="bottomBox.mainResizeShow">
      <div class="top-tool-main-right" :class="{'top-tool-main-right-to-left': bottomBox.showSubList}">
        <div class="top-tool-search margin-r-20">
          <search-input :searchMsg="searchMsg" @search="search"
                        :bottomBox.inTransform="bottomBox.inTransform" :single="true"></search-input>
        </div>
        <export-excel
          id="asset-list"
          export-file-name="asset"
          export-url="expression/tmpl/export"
          import-url="expression/tmpl/import"
          :params="searchLabel"
          :permissions="{import: 'asset_import', export: 'asset_export'}"
          @afterImport="afterTableListChange"
          v-has="'expr_temp_save'"
        >
          <template slot="optionZone">
            <button :title="$t('overall.exportExcelLower')" @click="addTemp" type="button" v-has="'expr_temp_save'"
                    class="nz-btn nz-btn-size-normal nz-btn-style-light" id="alert-list-export">
              <i class="nz-icon nz-icon-create-square"></i>
            </button>
          </template>
        </export-excel>

        <delete-button :delete-objs="batchDeleteObjs" @after="getexprTemp"
                       :api="'expression/tmpl'" v-has="'expr_temp_delete'" id="alert-msg-batch-delete"></delete-button>
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
      ref="exprTempTable"
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
        :sortable="$tableSet.sortableShow(item.prop,'exprTemp')"
        :prop="$tableSet.propTitle(item.prop,'exprTemp')"
        :width="item.width"
      >
        <template slot-scope="scope" :column="item">
          <div v-if="item.prop == 'option'" class="content-right-options">
            <span :id="'alert-edit-'+scope.row.id" :title="$t('overall.edit')" @click.stop="edit(scope.row)"
                  class="content-right-option" v-has="'expr_temp_update'">
              <i class="nz-icon nz-icon-edit"></i>
            </span>
            <span
              :id="'alert-del-'+scope.row.id"
              :title="$t('overall.delete')"
              @click="del(scope.row)"
              class="content-right-option"
              v-has="'expr_temp_delete'">
              <i  class="nz-icon nz-icon-delete"></i>
            </span>
            <span
              :id="'alert-copy-'+scope.row.id"
              :title="$t('overall.copy')"
              @click="copyRow(scope.row,'exprTemp')"
              class="content-right-option"
              v-has="'expr_temp_save'">
              <i  class="nz-icon nz-icon-override"></i>
            </span>
          </div>
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
      <exprTempBox v-if="rightBox.show" :exprTemp="exprTemp" @close="closeRightBox"
                         ref="exprTempBox"></exprTempBox>
    </transition>
  </div>
</template>

<script>
  import bus from '../../../libs/bus';
  import axios from 'axios';
  import exportXLSX from "../../common/exportXLSX";
  import deleteButton from "../../common/deleteButton";
  import exprTempBox from'../../common/rightBox/exprTempBox';
  import {calcDurationByStringTimeB} from "../../common/js/tools";
  export default {
    name:"exprTemp",
    components:{
      deleteButton,
      exprTempBox,
      'export-excel':exportXLSX
    },
    data(){
      return {
        tableId:'exprTemp',
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
              id: 11,
              name: 'Id',
              type: 'input',
              label: 'id',
              disabled: false
            },{
              id: 12,
              name: this.$t('config.exprTemp.name'),
              type: 'input',
              label: 'name',
              disabled: false
            },{
              id: 13,
              name: this.$t('config.exprTemp.gname'),
              type: 'selectTemp',
              label: 'gname',
              disabled: false
            },
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
            label:'Name',
            prop:'name',
            show:true,
          },{
            label:'Group',
            prop:'gname',
            show:true,
          },{
            label:'Expression',
            prop:'expression',
            show:true,
          },{
            label:'Remark',
            prop:'remark',
            show:true,
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
        blackExprTemp:{
          "id": '',
          "name": "",
          "gname": "default",
          "expression": "",
          "remark": "",
        },
        exprTemp:{},
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
      this.getexprTemp();
    },
    methods:{
      initEvent(){
        bus.$on("alert-rule-list-change",()=>{
          this.getexprTemp();
        });
        bus.$on("dc-list-change",()=>{
          this.getexprTemp();
        });
        bus.$on('alert-message-change',()=>{
          this.getexprTemp();
        })
      },
      getexprTemp(){
        if(!this.hasButton('rule_view')){
          this.$message.error(this.$t("tip.noAccess"));
          return;
        }
        this.$set(this.searchLabel,"pageNo",this.pageObj.pageNo);
        this.$set(this.searchLabel,"pageSize",this.pageObj.pageSize);
        this.tools.loading=true;
        this.$get('expression/tmpl',this.searchLabel).then(response=>{
          this.tools.loading=false;
          if(response.code==200){
            this.tableData=response.data.list;
            this.pageObj.total=response.data.total;
            this.nowTime=this.utcTimeToTimezoneStr(response.time);
            console.info(this.$refs.exprTempTable)
            if(!this.scrollbarWrap){
              this.$nextTick(()=>{
                this.scrollbarWrap=this.$refs.exprTempTable.bodyWrapper;
                this.toTopBtnHandler(this.scrollbarWrap);
              });
            }
          }
        })
      },
      pageNo(val){
        this.pageObj.pageNo=val;
        this.getexprTemp();
      },
      pageSize(val){
        this.pageObj.pageSize=val;
        localStorage.setItem('nz-pageSize-'+localStorage.getItem('nz-username')+'-'+this.tableId,val);
        this.getexprTemp();
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
            this.$set(this.searchLabel,item,searchObj[item]);
          }
        }
        if(orderBy){
          this.$set(this.searchLabel,'orderBy',orderBy);
        }
        this.$refs.exprTempTable.bodyWrapper.scrollTop=0;
        this.getexprTemp();
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
        this.getexprTemp();
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
      afterTableListChange(){
        this.getexprTemp();
      },
      addTemp(){
        this.exprTemp=JSON.parse(JSON.stringify(this.blackExprTemp));
        this.rightBox.show=true;
      },
      edit(row){
        console.log(123123123123);
        this.$get('expression/tmpl/'+row.id).then(res=>{
          this.exprTemp={...res.data};
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
          this.$delete("expression/tmpl?ids="+row.id).then(response=>{
            this.prevent_opt.save=false;
            if(response.code===200){
              this.$message({type:'success',message:this.$t("tip.deleteSuccess")});
              this.getexprTemp();
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
          this.$delete("expression/tmpl?ids="+row.id).then(response=>{
            this.prevent_opt.save=false;
            if(response.code===200){
              this.$message({type:'success',message:this.$t("tip.deleteSuccess")});
              this.getexprTemp();
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
          this.getexprTemp();
        }
      },
    }
  }
</script>

<style scoped lang="scss">

</style>
