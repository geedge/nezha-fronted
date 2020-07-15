<style scoped>
  .operationlog {
    height: 100%;
  }
</style>
<template>
  <div class="operationlog">
    <left-menu >
      <div slot="content-left" class="slot-content">
      <div class="sidebar-title">{{$t('overall.config')}}</div>
      <div class="sidebar-info">
        <div class="sidebar-info-item sidebar-info-top" @click="jumpTo('account')" id="prom-jump-account">
          {{$t('config.account.account')}}
        </div>
        <div class="sidebar-info-item" @click="jumpTo('promServer')" id="account-jump-promserver">
          {{$t('config.promServer.promServerList')}}
        </div>
        <div class="sidebar-info-item" @click="jumpTo('dc')" id="operation-jump-dc">
          {{$t('config.dc.dc')}}
        </div>
        <div class="sidebar-info-item" @click="jumpTo('model')" id="operation-jump-model">
          {{$t('config.model.model')}}
        </div>
        <div class="sidebar-info-item" @click="jumpTo('mib')" id="operation-jump-mib">
          {{$t('config.mib.mib')}}
        </div>
        <div class="sidebar-info-item" @click="jumpTo('system')" id="operation-jump-system">
          {{$t('config.system.system')}}
        </div>
        <div class="sidebar-info-item" @click="jumpTo('terminallog')" id="operation-jump-terminallog">
          {{$t('config.terminallog.terminallog')}}
        </div>
        <div class="sidebar-info-item sidebar-info-item-active" @click="jumpTo('operationlog')" id="operation-jump-operation">
          {{$t('config.operationlog.operationlog')}}
        </div>
      </div>
    </div>
    <div slot="content-right" class="slot-content">
      <div class="top-tools">
        <div></div>
        <div>
          <div class="top-tool-search float-right">
            <search-input :searchMsg="searchMsg" @search="search"></search-input>
          </div>
        </div>
      </div>
      <el-table
        class="nz-table"
        :data="tableData"
        border
        ref="operationLogTable"
        :height="$tableHeight.normal"
        v-loading="loading"
        v-scrollBar:el-table="'large'"
        :cell-class-name="messageStyle"
        style="width: 100%;"
        @sort-change="tableDataSort"
      >
        <el-table-column
          :resizable="false"
          v-for="(item, index) in tablelable"
          v-if="item.show"
          :width="item.width"
          :key="`col-${index}`"
          :label="item.label"
          :sortable="sortableShow(item.prop)"
          :prop="propTitle(item.prop)"
        >
          <template slot-scope="scope" :column="item">
            <span v-if="item.prop == 'time'">
              {{scope.row[item.prop]}} ms
            </span>
            <span v-else>{{scope.row[item.prop]}}</span>
          </template>
        </el-table-column>
        <el-table-column width="28">
          <template slot="header" slot-scope="scope">
            <span @click.stop="elementsetShow('shezhi',$event)" class="nz-table-gear">
              <i class="nz-icon nz-icon-gear"></i>
            </span>
          </template>
          <template v-slot="scope">
            <button v-if="scope.$index == 0" class="to-top" :style="{top: toTopBtnTop}" :class="{'to-top-is-hover': tableHover}" v-show="showTopBtn" @click="$toTop('ps', 0)"><i class="nz-icon nz-icon-top"></i></button>
          </template>
        </el-table-column>
      </el-table>
      <Pagination :tableId="tableId" :pageObj="pageObj" @pageNo='pageNo' @pageSize='pageSize' ref="Pagination"></Pagination>
    </div>
    </left-menu>
    <element-set
      v-clickoutside="elementsetHide"
      :dropCol="dropCol"
      @tablelable="tablelabelEmit"
      :table-title="tableTitle"
      ref="elementset"
    ></element-set>
  </div>
</template>
<script>
  import bus from '../../../libs/bus';
  export default {
    name: "oparetionlog",
    data() {
      return {
        loading: false,
        tableId: 'operationLogTable', //需要分页的table的id，用于记录每页数量
        showTopBtn: false,
        toTopBtnTop: this.$tableHeight.toTopBtnTop, //to-top按钮的top属性
        tableHover: false, //控制滚动条和top按钮同时出现

        rightBox: { //弹出框相关
          show: false,
          isEdit: false, //false查看，true编辑
          title: ''
        },
        rightBoxResize: { //resize弹出框相关
          show: false,
          isAdd: false, //false，true：resize
          title: ''
        },
        rightBoxDownload: { //下载弹出框相关
          show: false,
          isAdd: false, //false，true：resize
          title: ''
        },
        rightBoxUpload: { //上传弹出框相关
          show: false,
          isAdd: false, //false，true：resize
          title: ''
        },
        pageObj: {
          pageNo: 1,
          pageSize: 50,
          total: 0
        },
        tableTitle: [
          {
            label: this.$t("config.operationlog.id"),
            prop: 'id',
            show: true,
            width: 80
          }, {
            label: this.$t('config.operationlog.username'),
            prop: 'username',
            show: true,
          },
          {
            label: this.$t('config.operationlog.ip'),
            prop: 'ip',
            show: true,
          },
          {
            label: this.$t('config.operationlog.operation'),
            prop: 'operation',
            show: true,
          },
          {
            label: this.$t('config.operationlog.type'),
            prop: 'type',
            show: true,
          },
          {
            label: this.$t('config.operationlog.state'),
            prop: 'state',
            show: true,
          },
          // {
          //   label: this.$t('config.operationlog.userId'),
          //   prop: 'userId',
          //   show: false,
          // },
          {
            label: this.$t('config.operationlog.operaId'),
            prop: 'operaId',
            show: false,
          },
          {
            label: this.$t('config.operationlog.createDate'),
            prop: 'createDate',
            show: true,
          },
          {
            label: this.$t('config.operationlog.time'),
            prop: 'time',
            show: false,
          },
          {
            label: this.$t('config.operationlog.params'),
            prop: 'params',
            show: false,
          },
          {
            label: this.$t('config.operationlog.response'),
            prop: 'response',
            show: false,
          },
        ],
        tablelable: [],
        dropCol: [],
        tableData: [],
        searchMsg: { //给搜索框子组件传递的信息
          zheze_none: true,
          searchLabelList: [
            {
            id: 11,
            name: this.$t('config.operationlog.type'),
            type: 'input',
            label: 'type',
            disabled: false
          },{
            id: 12,
            name: this.$t('config.operationlog.username'),
            type: 'input',
            label: 'username',
            disabled: false
          },{
            id: 13,
            name: this.$t('config.operationlog.operation'),
            type: 'selectString',
            label: 'operation',
            disabled: false
          }
          ],
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
      messageStyle(e) {
        if (e.column.label == this.$t('config.operationlog.state')) {
          if (e.row.state == 'success') {
            return 'success';
          } else {
            return 'danger';
          }
        }
        return '';
      },
      getTableData: function () {
        this.$set(this.searchLabel, "pageNo", this.pageObj.pageNo);
        this.$set(this.searchLabel, "pageSize", this.pageObj.pageSize);
        this.loading = true;
        this.$get('sys/log/list', this.searchLabel).then(response => {
          this.loading = false;
          if (response.code === 200) {
            // for (let i = 0; i < response.data.list.length; i++) {
            //   response.data.list[i].status = response.data.list[i].status + "";
            // }
            this.tableData = response.data.list;
            this.pageObj.total = response.data.total
          }
        })
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
      toEditReceiver: function (item) {
        if (!item.isEdit) {
          //如果不在编辑状态，那么其他项如果有改动，则还原改动，最后开始编辑
          this.blurEditReceiver();
          item.isEdit = true;
        } else {
          //如果已在编辑状态，判断name是否有变更，有变更则发请求
          if (item.name != item.oldName) {
            if (this.updateReceiverName(item) == 200) {
              item.isEdit = false;
            }
          } else {
            item.errorMessage = '';
            item.isEdit = false;
          }
        }
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
        let orderBy='';
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
      //是否需要排序
      sortableShow(prop){
        switch(prop){
          case 'id':
          case 'username':
          case 'ip':
          case 'operation':
          case 'type':
          case 'createDate':
          case 'time':
            return'custom';
          default : return false;
        }
      },
      // prop字段
      propTitle(prop){
        switch(prop){
          case 'id': return 'sl.id';
          case 'username': return 'su.username';
          case 'ip': return 'sl.ip';
          case 'operation': return 'sl.operation';
          case 'type': return 'sl.type';
          case 'createDate': return 'sl.create_date';
          case 'time': return 'sl.time';
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
    computed: {
      isCurrentUser() {
        return function(username) {
          return localStorage.getItem('nz-username') == username;
        }
      }
    },
    mounted() {
      //是否存在分页缓存
      let pageSize = localStorage.getItem('nz-pageSize-' + localStorage.getItem('nz-username') + '-' + this.tableId);
      if (pageSize && pageSize != 'undefined') {
        this.pageObj.pageSize = pageSize
      }

      this.getTableData();
      this.$nextTick(() => {
        //绑定滚动条事件，控制top按钮
        let el = this.$refs.operationLogTable.$el.querySelector(".el-table__body-wrapper");
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
      this.tablelable = localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-" + this.$route.path)
        ? JSON.parse(localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-" + this.$route.path))
        : this.tableTitle;
      this.dropCol = localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-" + this.$route.path)
        ? JSON.parse(localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-" + this.$route.path))
        : this.tableTitle;
    }
  }
</script>
