<style scoped>
  .mib {
    height: 100%;
  }
</style>
<template>
  <div class="mib">
    <div class="content-left">
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
      </div>
    </div>
    <div class="content-right">
      <div class="top-tools">
        <div class="top-tool-main-right">
          <div class="top-tool-search">
            <search-input :searchMsg="searchMsg" @search="search"></search-input>
          </div>
          <button @click="toAdd" class="nz-btn nz-btn-size-normal nz-btn-style-light  margin-l-20"  :title="$t('overall.createMib')"
                  id="mib-add">
            <i class="nz-icon-create-square nz-icon"></i>
          </button>
        </div>
      </div>
      <el-table :data="tableData" border :height="$tableHeight.normal" style="width: 100%;" ref="mibTable" class="nz-table mib-table" v-scrollBar:el-table>
        <el-table-column :resizable="false" v-for="(item, index) in tablelable" v-if="item.show" :width="item.width" :class-name="item.prop == 'modelsDetail'?'detail-column':''"
                         :key="`col-${index}`" :label="item.label">
          <template slot-scope="scope" :column="item">
            <template v-if="item.prop == 'updateUser'" >{{scope.row[item.prop].name}}</template>
            <template v-else-if="item.prop == 'fileName' && scope.row[item.prop]" >
              <span class="clickable" @click="downloadMib(scope.row.id)">{{scope.row[item.prop]}}</span>
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
<!--              <span :title="$t('overall.view')" @click="detail(scope.row)" class="content-right-option" :id="'mib-detail-'+scope.row.id"><i class="nz-icon nz-icon-view"></i></span>-->
<!--              &nbsp;-->
              <span :title="$t('overall.edit')" @click="toEdit(scope.row)" class="content-right-option" :id="'mib-edit-'+scope.row.id"><i class="nz-icon nz-icon-edit"></i></span>
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
        </el-table-column>
      </el-table>
      <Pagination :tableId="tableId" :pageObj="pageObj" @pageNo='pageNo' @pageSize='pageSize' ref="Pagination"></Pagination>
      <button class="to-top" v-show="showTopBtn" @click="$toTop"><i class="nz-icon nz-icon-top"></i></button>
    </div>

    <element-set
      v-clickoutside="elementsetHide"
      :table-title="tableTitle"
      :dropCol="dropCol"
      @tablelable="tablelabelEmit"
      ref="elementset"
    ></element-set>
    <mib-box ref="mibBox" :mib="mib" @reload="getTableData" @after="getTableData()"></mib-box>
  </div>

</template>
<script>
  import axios from 'axios'
  import bus from '../../../libs/bus';
  export default {
    name: "mib",
    data() {
      return {
        tableId: 'mibTable', //需要分页的table的id，用于记录每页数量
        showTopBtn: false,
        mib: {
          id: null,
          name: '',
          remark:'',
          models:'',
          file:null,
        },
        pageObj: {
          pageNo: 1,
          pageSize: 20,
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
        tablelable: [],
        dropCol: [],
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
      clickos() {
        this.rightBox.show = false;
      },
      toEdit: function (u) {
        this.mib = Object.assign({}, u);
        this.$refs.mibBox.show(true, true);
      },
      del: function (u) {
        this.$confirm(this.$t("tip.confirmDelete"), {
          confirmButtonText: this.$t("tip.yes"),
          cancelButtonText: this.$t("tip.no"),
          type: 'warning'
        }).then(() => {
          this.$delete("mib?ids=" + u.id).then(response => {
            if (response.code === 200) {
              this.$message({duration: 1000, type: 'success', message: this.$t("tip.deleteSuccess")});
              this.getTableData();
              this.rightBox.show = false;
            } else {
              this.$message.error(response.msg);
            }
          })
        });
      },
      detail: function (u) {
        this.mib = Object.assign({}, u);
        this.$refs.mibBox.show(true, false);
      },
      toAdd: function () {
        this.cleanMib();
        this.$refs.mibBox.show(true, true);
      },
      esc: function () {
        this.rightBox.show = false;
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
      getTableData: function () {
        this.tableData = [];
        this.$set(this.searchLabel, "pageNo", this.pageObj.pageNo);
        this.$set(this.searchLabel, "pageSize", this.pageObj.pageSize);
        this.$get('mib', this.searchLabel).then(response => {
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
      search: function (searchObj) {
        this.pageObj.pageNo = 1;
        this.searchLabel = {};
        for (let item in searchObj) {
          if (searchObj[item]) {
            this.$set(this.searchLabel, item, searchObj[item]);
          }
        }
        this.getTableData();
      },
      downloadMib:function(mibId){
        axios.get('/mib/download?id='+mibId,{responseType: 'blob'}).then(data=>{
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
      cleanMib() {
        this.mib = {
          id: null,
          name: '',
          remark:'',
          file:'',
          models:'',
          file:null,
        };
        this.$refs.mibBox.clearData();
      }
    },
    mounted: function () {
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
              this.showTopBtn = true;
            } else {
              this.showTopBtn = false;
            }
          });
        }
      });
      this.tablelable = localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-" + this.$route.path)
        ? JSON.parse(localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-" + this.$route.path))
        : this.tableTitle;
      this.dropCol = localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-" + this.$route.path)
        ? JSON.parse(localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-" + this.$route.path))
        : this.tableTitle;
    },
    watch: {

    }
  }
</script>
<style >
  .mib-table .el-divider--horizontal{
    margin:2px 0 !important;
  }
  .mib-table td .cell{
    min-height: 60px !important;
    padding-bottom: 3px;
  }
  .mib-table td .cell .detail-item-content{
    height: 20px;
    line-height: 20px;
    display: inline-block;
  }
  .mib-table.el-table td .cell{
    height: 20px !important;
    line-height: 20px !important;
  }

</style>
