<style scoped>
  .terminallog {
    height: 100%;
  }
</style>
<template>
  <div class="terminallog">
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
      ref="terminalLogTable"
      :height="$tableHeight.normal"
      v-scrollBar:el-table="'large'"
      v-loading="loading"
      :cell-class-name="messageStyle"
      style="width: 100%;"
      @sort-change="tableDataSort">
      <el-table-column
        :resizable="false"
        v-for="(item, index) in tablelable"
        v-if="item.show"
        :width="item.width"
        :key="`col-${index}`"
        :label="item.label"
        :sortable="sortableShow(item.prop)"
        :prop="propTitle(item.prop)"
        :sort-orders="['ascending', 'descending']"
      >
        <template slot-scope="scope" :column="item">
          <span v-if="item.prop == 'lang'">
                          {{scope.row[item.prop] == 'en' ? 'English' : ''}}
                          {{scope.row[item.prop] == 'zh' ? '中文' : ''}}
                          {{scope.row[item.prop] == 'ru' ? 'русский' : ''}}
                      </span>
          <template v-else-if="item.prop == 'status'">
            <span>{{scope.row.status==='1' ? $t("config.terminallog.success") : $t("config.terminallog.fail")}}</span>
          </template>
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
    name: "terminallog",
    data() {
      return {
        loading: false,
        tableId: 'terminalLogTable', //需要分页的table的id，用于记录每页数量
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
        terminallog: {
          id: '',
          host: '',
          status: '1',
          time: '',
          protocol: '',
          port: '',
          user: '',
          cmd: '',
          authType: '',
          userName: ''
        },
        pageObj: {
          pageNo: 1,
          pageSize: 50,
          total: 0
        },
        tableTitle: [
          {
            label: this.$t("config.terminallog.id"),
            prop: 'id',
            show: true,
            width: 80
          }, {
            label: this.$t('config.terminallog.host'),
            prop: 'host',
            show: true,
          }, {
            label: this.$t('config.terminallog.port'),
            prop: 'port',
            show: true,
          },
          {
            label: this.$t('config.terminallog.protocol'),
            prop: 'protocol',
            show: true,
          },
          {
            label: this.$t('config.terminallog.user'),
            prop: 'user',
            show: true,
          },
          {
            label: 'AuthType',
            prop: 'authType',
            show: false
          },
          {
            label: this.$t('config.terminallog.cmd'),
            prop: 'cmd',
            show: true,
          },
          {
            label: 'UserName',
            prop: 'userName',
            show: false,
          },
          {
            label: this.$t('config.terminallog.time'),
            prop: 'time',
            show: true
          },
          {
            label: this.$t('config.terminallog.status'),
            prop: 'status',
            show: true,
            width: 100
          }
        ],
        tablelable: [],
        dropCol: [],
        tableData: [],
        searchMsg: { //给搜索框子组件传递的信息
          zheze_none: true,
          searchLabelList: [
          //   {
          //   id: 10,
          //   name: this.$t('config.terminallog.protocol'),
          //   type: 'selectType',
          //   label: 'protocol',
          //   disabled: false
          // },
            {
            id: 11,
            name: this.$t('config.terminallog.host'),
            type: 'input',
            label: 'host',
            disabled: false
          },{
            id: 12,
            name: this.$t('config.terminallog.user'),
            type: 'input',
            label: 'user',
            disabled: false
          },{
            id: 13,
            name: this.$t('config.terminallog.cmd'),
            type: 'input',
            label: 'cmd',
            disabled: false
          },{
            id: 14,
            name: this.$t('config.terminallog.userId'),
            type: 'input',
            label: 'userId',
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
      getTableData: function () {
        this.$set(this.searchLabel, "pageNo", this.pageObj.pageNo);
        this.$set(this.searchLabel, "pageSize", this.pageObj.pageSize);
        this.loading = true;
        this.$get('terminal/log', this.searchLabel).then(response => {
          this.loading = false;
          if (response.code === 200) {
            for (let i = 0; i < response.data.list.length; i++) {
              response.data.list[i].status = response.data.list[i].status + "";
            }
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
      messageStyle(e) {
        if (e.column.label == this.$t('config.terminallog.status')) {
          if (e.row.status == '1') {
            return 'success';
          } else {
            return 'danger';
          }
        }
        return '';
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
          case 'host':
          case 'port':
          case 'protocol':
          case 'user':
          case 'cmd':
          case 'time':
            return'custom';
          default : return false;
        }
      },
      // prop字段
      propTitle(prop){
        switch(prop){
          case 'id': return 'id';
          case 'host': return 'host';
          case 'port': return 'port';
          case 'protocol': return 'protocol';
          case 'user': return 'user';
          case 'cmd': return 'cmd';
          case 'time': return 'time';
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
        let el = this.$refs.terminalLogTable.$el.querySelector(".el-table__body-wrapper");
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
