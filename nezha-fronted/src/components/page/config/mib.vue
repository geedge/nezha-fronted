<style scoped>
  .mib {
    height: 100%;
  }
</style>
<template>
  <div class="mib">
    <left-menu >
      <div slot="content-left" class="slot-content">
      <div class="sidebar-title">{{$t('overall.config')}}</div>
      <div class="sidebar-info">
        <div class="sidebar-info-item sidebar-info-top" @click="jumpTo('account')" id="mib-jump-account">
          {{$t('config.account.account')}}
        </div>
        <div class="sidebar-info-item" @click="jumpTo('promServer')" id="mib-jump-prom">{{$t('config.promServer.promServerList')}}</div>
        <div class="sidebar-info-item" @click="jumpTo('dc')" id="mib-jump-dc">
          {{$t('config.dc.dc')}}
        </div>
        <div class="sidebar-info-item " id="mib-jump-model" @click="jumpTo('model')">
          {{$t('config.model.model')}}
        </div>
        <div class="sidebar-info-item sidebar-info-item-active" id="mib-jump-mib">
          {{$t('config.mib.mib')}}
        </div>
        <div class="sidebar-info-item" @click="jumpTo('system')" id="mib-jump-system">
          {{$t('config.system.system')}}
        </div>
        <div class="sidebar-info-item" @click="jumpTo('terminallog')" id="mib-jump-terminallog">
          {{$t('config.terminallog.terminallog')}}
        </div>
        <div class="sidebar-info-item" @click="jumpTo('operationlog')" id="account-jump-operation">
          {{$t('config.operationlog.operationlog')}}
        </div>
      </div>
    </div>
    <div slot="content-right" class="slot-content">
      <template v-if="showTab == 'file'">
        <div class="top-tools">
          <div class="nz-tab top-tool-main-right top-tool-main-right-to-left" style="width: 300px">
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
            <button @click="add" class="nz-btn nz-btn-size-normal nz-btn-style-light  margin-l-20"  :title="$t('overall.createMib')"
                    id="mib-add">
              <i class="nz-icon-create-square nz-icon"></i>
            </button>
          </div>
        </div>
        <el-table :data="tableData" border :height="$tableHeight.normal" style="width: 100%;" ref="mibTable" class="nz-table mib-table" v-scrollBar:el-table="'large'" v-loading="tools.loading" @sort-change="tableDataSort">
          <el-table-column :resizable="false" v-for="(item, index) in tools.tablelable" v-if="item.show" :width="item.width" :class-name="item.prop == 'modelsDetail'?'detail-column':''"
                           :key="`col-${index}`" :label="item.label" :sortable="sortableShow(item.prop)"
                           :prop="propTitle(item.prop)">
            <template slot-scope="scope" :column="item">
              <template v-if="item.prop == 'updateUser'" >{{scope.row[item.prop].name}}</template>
              <template v-else-if="item.prop == 'fileName' && scope.row[item.prop]" >
                <span class="link" @click="downloadMib(scope.row.id)">{{scope.row[item.prop]}}</span>
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
              <div v-else-if="item.prop == 'option'" class="content-right-options">
                <span :title="$t('overall.download')" @click="downloadMib(scope.row)" class="content-right-option" :id="'mib-download-'+scope.row.id"><i class="el-icon-download"></i></span>
                &nbsp;
                <span :title="$t('overall.edit')" @click="edit(scope.row)" class="content-right-option" :id="'mib-edit-'+scope.row.id"><i class="nz-icon nz-icon-edit"></i></span>
                &nbsp;
                <span :title="$t('overall.delete')" @click="del(scope.row)" class="content-right-option" :id="'mib-del-'+scope.row.id"><i class="el-icon-delete"></i></span>
              </div>
              <template v-else-if="scope.row[item.prop]">{{scope.row[item.prop]}}</template>
              <template v-else>-</template>
            </template>
          </el-table-column>
          <el-table-column :resizable="false" width="28">
            <template slot="header" slot-scope="scope">
              <span @click.stop="elementsetShow('shezhi',$event)" class="nz-table-gear">
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
    </div>
    </left-menu>
    <element-set
      v-if="tools.showElementSet"
      v-clickoutside="elementsetHide"
      :table-title="tableTitle"
      :dropCol="tools.dropCol"
      @tablelable="tablelabelEmit"
      ref="elementset"
    ></element-set>
    <transition name="right-box">
      <mib-box v-if="rightBox.show" ref="mibBox" :mib="mib" @reload="getTableData" @close="closeRightBox"></mib-box>
    </transition>
  </div>

</template>
<script>
  import axios from 'axios'
  import bus from '../../../libs/bus';
  import mibBrowser from './mibBrowser';

  export default {
    name: "mib",
    components: {
      'mib-browser': mibBrowser
    },
    data() {
      return {
        showTab: 'file', //file/browser
        rightBox: {show: false},
        tools: {
          loading: false, //是否显示table加载动画
          toTopBtnTop: this.$tableHeight.toTopBtnTop, //to-top按钮的top属性
          tableHover: false, //控制滚动条和top按钮同时出现
          showElementSet: false, //自定义列弹框是否显示
          showTopBtn: false, //显示To top按钮
          tablelable: [], //从缓存中加载的table header
          dropCol: [], //自定义列工具的数据
        },
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
      elementsetShow(s, e) {
        this.tools.showElementSet = true;
        this.$nextTick(() => {
          var eventfixed = {
            shezhi: 0,
            screen: 0
          };
          eventfixed[s] = 1;
          e.preventDefault();
          this.$store.commit('setHeaderTable', this.tools.tablelable);
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
        });
      },
      elementsetHide() {
        //悬浮点击空白隐藏
        this.$refs.elementset.elementsetHide();
      },
      tablelabelEmit(data) {
        //获取子组件传过来的参数
        this.$store.commit('setHeaderTable', data);
        this.tools.tablelable = data;
      },
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
      //是否需要排序
      sortableShow(prop){
        switch(prop){
          case 'id':
          case 'name':
          case 'filename':
          case 'updateAt':
            return'custom';
          default : return false;
        }
      },
      // prop字段
      propTitle(prop){
        switch(prop){
          case 'id': return'sm.id';
          case 'name': return'sm.name';
          case 'filename': return'sm.file_name';
          case 'updateAt': return'sm.update_at';
          default : return prop;
        }
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
      this.tools.tablelable = localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-" + this.$route.path)
        ? JSON.parse(localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-" + this.$route.path))
        : this.tableTitle;
      this.tools.dropCol = localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-" + this.$route.path)
        ? JSON.parse(localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-" + this.$route.path))
        : this.tableTitle;
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
