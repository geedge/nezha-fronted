<style scoped>
  .mib {
    height: 100%;
  }
</style>
<template>
  <div class="mib">
    <template v-if="showTab == 'file'">
      <div class="top-tools">
        <div class="nz-tab top-tool-main-right top-tool-main-right-to-left-little" style="width: 300px">
          <div class="nz-tab-item-box" id="module-type-1">
            <div class="nz-tab-item nz-tab-item-active">{{$t("config.mib.mibFiles")}}</div>
          </div>
          <div @click="showTab = 'browser'" class="nz-tab-item-box" id="module-type-2">
            <div class="nz-tab-item">{{$t("config.mib.mibBrowser")}}</div>
          </div>
        </div>
        <div class="top-tool-main-right">
          <div class="top-tool-search">
            <search-input :searchMsg="searchMsg" @search="search"></search-input>
          </div>
          <button type="button" @click="add" class="nz-btn nz-btn-size-normal nz-btn-style-light  margin-l-20"  :title="$t('overall.createMib')"
                  id="mib-add">
            <i class="nz-icon-create-square nz-icon"></i>
          </button>
          <delete-button :delete-objs="batchDeleteObjs" api="mib" @after="getTableData"></delete-button>
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
        ></element-set>
      </transition>
      <el-table :data="tableData" border :height="$tableHeight.normal" style="width: 100%;" ref="mibTable" class="nz-table mib-table" v-scrollBar:el-table="'large'" v-loading="tools.loading" @sort-change="tableDataSort"
                @selection-change="(selection)=>{this.batchDeleteObjs=selection}"
      >
        <el-table-column
          :resizable="false"
          type="selection"
          width="40"
          align="center">
        </el-table-column>
        <el-table-column :resizable="false" v-for="(item, index) in tools.customTableTitle" v-if="item.show" :width="item.width" :class-name="item.prop == 'modelsDetail'?'detail-column':''"
                         :key="`col-${index}`" :label="item.label" :sortable="$tableSet.sortableShow(item.prop,'mib')"
                         :prop="$tableSet.propTitle(item.prop,'mib')"
                         :sort-orders="['ascending', 'descending']">
          <template slot-scope="scope" :column="item">
            <template v-if="item.prop == 'updateUser'" >{{scope.row[item.prop].name}}</template>
            <template v-else-if="item.prop == 'fileName' && scope.row[item.prop]" >
              <span class="link" @click="downloadMib(scope.row)">{{scope.row[item.prop]}}</span>
            </template>
            <template v-else-if="item.prop == 'modelsDetail' && scope.row['modelsDetail'] && scope.row['modelsDetail'].length >0" >
              <div style="height: 100%">
                <el-scrollbar style="height: 100%">
                  <div v-for="(n,i) in scope.row['modelsDetail']" :key="n.name+'-'+n.id+'-'+i" class="detail-item-content">
                    <el-popover trigger="hover" placement="top" >
                      <div>
                        <div>
                          <span>{{$t('overall.name')}}:</span>
                          <span>{{n.name}}</span>
                        </div>
                        <div>
                          <span>{{$t('config.mib.vendor')}}:</span>
                          <span>{{n.vendor}}</span>
                        </div>
                        <div>
                          <span>{{$t('config.mib.type')}}:</span>
                          <span>{{n.type}}</span>
                        </div>
                      </div>
                      <template slot="reference">
                        <div  class="detail-item-content" v-if="i < scope.row['modelsDetail'].length-1">{{n.name}},</div>
                        <div  class="detail-item-content" v-else>{{n.name}}</div>
                      </template>
                    </el-popover>
                  </div>
                </el-scrollbar>
              </div>
            </template>
            <span v-else-if="item.prop == 'updateAt'">{{utcTimeToTimezoneStr(scope.row[item.prop])}}</span>
            <div v-else-if="item.prop == 'option'" class="content-right-options">
              <span :title="$t('overall.download')" @click="downloadMib(scope.row)" class="content-right-option" :id="'mib-download-'+scope.row.id"><i class="nz-icon nz-icon-download1"></i></span>
              &nbsp;
              <span :title="$t('overall.edit')" @click="edit(scope.row)" class="content-right-option" :id="'mib-edit-'+scope.row.id"><i class="nz-icon nz-icon-edit"></i></span>
              &nbsp;
              <span :title="$t('overall.delete')" @click="del(scope.row)" class="content-right-option" :id="'mib-del-'+scope.row.id"><i class="nz-icon nz-icon-delete"></i></span>
            </div>
            <template v-else-if="scope.row[item.prop]">{{scope.row[item.prop]}}</template>
            <template v-else>-</template>
          </template>
        </el-table-column>
        <el-table-column :resizable="false" width="28">
          <template slot="header" slot-scope="scope">
            <span @mousedown.stop="!tools.showCustomTableTitle && (tools.showCustomTableTitle = true)" class="nz-table-gear">
              <i class="nz-icon nz-icon-gear"></i>
            </span>
          </template>
          <template v-slot="scope">
            <button v-if="scope.$index == 0" class="to-top" :style="{top: tools.toTopBtnTop}" :class="{'to-top-is-hover': tools.tableHover}" v-show="tools.showTopBtn" @click="$toTop('ps', 0)"><i class="nz-icon nz-icon-top"></i></button>
          </template>
        </el-table-column>
      </el-table>
      <Pagination :tableId="tableId" :pageObj="pageObj" @pageNo='pageNo' @pageSize='pageSize' ref="Pagination"></Pagination>
    </template>
    <mib-browser :show-tab="showTab" v-if="showTab == 'browser'" @toFileTab="showTab = 'file'"></mib-browser>
    <transition name="right-box">
      <mib-box v-if="rightBox.show" ref="mibBox" :mib="mib" @reload="getTableData" @close="closeRightBox"></mib-box>
    </transition>
  </div>

</template>
<script>
  import axios from 'axios'
  import bus from '../../../libs/bus';
  import mibBrowser from './mibBrowser';
  import deleteButton from "../../common/deleteButton";
  export default {
    name: "mib",
    components: {
      'mib-browser': mibBrowser,
      'delete-button':deleteButton,
    },
    data() {
      return {
        showTab: 'file', //file/browser
        rightBox: {show: false},
        tools: {
          loading: false, //是否显示table加载动画
          toTopBtnTop: this.$tableHeight.toTopBtnTop, //to-top按钮的top属性
          tableHover: false, //控制滚动条和top按钮同时出现
          showTopBtn: false, //显示To top按钮
          showCustomTableTitle: false, //自定义列弹框是否显示
          customTableTitle: [], //自定义列工具的数据
        },
        batchDeleteObjs:[],
        tableId: 'mibTable', //需要分页的table的id，用于记录每页数量
        mib: {},
        blankMib: {
          id: null,
          name: '',
          remark:'',
          models:'',
          file:null,
        },
        pageObj: {
          pageNo: 1,
          pageSize: 50,
          total: 0
        },
        tableTitle: [
          {
            label: 'ID',
            prop: 'id',
            show: true,
            width: 80
          }, {
            label: this.$t('overall.name'),
            prop: 'name',
            show: true,
          },{
            label: this.$t('config.mib.fileName'),
            prop: 'fileName',
            show: true,
          },{
            label: this.$t('config.mib.models'),
            prop: 'modelsDetail',
            show: true,
          },{
            label: this.$t('config.mib.remark'),
            prop: 'remark',
            show: true,
          },{
            label: this.$t('config.mib.updateUser'),
            prop: 'updateUser',
            show: true,
          },{
            label: this.$t('config.mib.updateAt'),
            prop: 'updateAt',
            show: true,
          },{
            label: this.$t('config.account.option'),
            prop: 'option',
            show: true,
            width: 120
          }
        ],
        tableData: [],
        searchMsg: { //给搜索框子组件传递的信息
          zheze_none: true,
          searchLabelList: [{
            id: 1,
            name: 'ID',
            type: 'input',
            label: 'id',
            disabled: false
          }, {
            id: 5,
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
      clickOutside() {
        this.rightBox.show = false;
      },
      edit(u) {
        this.mib = JSON.parse(JSON.stringify(u));
        this.rightBox.show = true;
      },
      closeRightBox(refresh) {
        this.rightBox.show = false;
        if (refresh) {
          this.getTableData();
        }
      },
      del(u) {
        this.$confirm(this.$t("tip.confirmDelete"), {
          confirmButtonText: this.$t("tip.yes"),
          cancelButtonText: this.$t("tip.no"),
          type: 'warning'
        }).then(() => {
          this.$delete("mib?ids=" + u.id).then(response => {
            if (response.code === 200) {
              this.$message({duration: 1000, type: 'success', message: this.$t("tip.deleteSuccess")});
              this.getTableData();
            } else {
              this.$message.error(response.msg);
            }
          })
        });
      },
      add() {
        this.mib = this.newMib();
        this.rightBox.show = true;
      },
      newMib() {
        return JSON.parse(JSON.stringify(this.blankMib));
      },
      jumpTo(data, id) {
        bus.$emit("menu-change", data);
        this.$router.push({
          path: "/" + data,
          query: {
            t: +new Date()
          }
        });
      },
      getTableData() {
        this.tableData = [];
        this.$set(this.searchLabel, "pageNo", this.pageObj.pageNo);
        this.$set(this.searchLabel, "pageSize", this.pageObj.pageSize);
        this.tools.loading = true;
        this.$get('mib', this.searchLabel).then(response => {
          this.tools.loading = false;
          if (response.code === 200) {
            this.tableData = response.data.list;
            this.pageObj.total = response.data.total
          }
        })
      },
      pageNo(val) {
        this.pageObj.pageNo = val;
        this.getTableData();
      },
      pageSize(val) {
        this.pageObj.pageSize = val;
        localStorage.setItem('nz-pageSize-' + localStorage.getItem('nz-username') + '-' + this.tableId, val);
        this.getTableData();
      },
      search(searchObj) {
        let orderBy='';
        if(this.searchLabel.orderBy){
          orderBy=this.searchLabel.orderBy
        }
        this.pageObj.pageNo = 1;
        this.searchLabel = {};
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
      downloadMib(mib) {
        axios.get('/mib/download?id='+mib.id,{responseType: 'blob'}).then(data=>{
          let fileName = new Date().getTime()+'.txt';
          let disposition=data.headers['content-disposition'];
          if(disposition){
            fileName=disposition.split(';')[1].split('filename=')[1]
          }
          // 由于ie不支持download属性，故需要做兼容判断
          if (navigator.appVersion.toString().indexOf('.NET') > 0) {
            // ie独有的msSaveBlob属性，data.data为Blob文件流
            window.navigator.msSaveBlob(data.data, fileName)
          } else {
            // 以下流程即为文章开始的下载流程
            let url = window.URL.createObjectURL(data.data)
            let link = document.createElement('a')
            link.style.display = 'none'
            link.href = url
            link.download = fileName
            document.body.appendChild(link)
            link.click()
            window.URL.revokeObjectURL(link.href);
          }
        })
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
    },
    mounted() {
      //初始化表头
      this.tools.customTableTitle = localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-" + this.$route.path)
        ? JSON.parse(localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-" + this.$route.path))
        : this.tableTitle;
      //是否存在分页缓存
      let pageSize = localStorage.getItem('nz-pageSize-' + localStorage.getItem('nz-username') + '-' + this.tableId);
      if (pageSize != 'undefined' && pageSize != null) {
        this.pageObj.pageSize = pageSize
      }

      this.getTableData();
      this.$nextTick(() => {
        //绑定滚动条事件，控制top按钮
        let el = this.$refs.mibTable.$el.querySelector(".el-table__body-wrapper");
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
    },
  }
</script>
<style >
  .mib-table .el-divider--horizontal{
    margin:2px 0 !important;
  }
  .mib-table td .cell .detail-item-content{
    height: 20px;
    line-height: 20px;
    display: inline-block;
  }
  .mib-table.el-table td .cell{
    height: 20px !important;
  }

</style>
