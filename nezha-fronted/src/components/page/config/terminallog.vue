<style scoped>
  .terminallog {
    height: 100%;
  }
</style>
<template>
  <div class="terminallog">
    <div class="content-left">
      <div class="sidebar-title">{{$t('overall.config')}}</div>
      <div class="sidebar-info">
        <div class="sidebar-info-item sidebar-info-top" @click="jumpTo('account')" id="prom-jump-account">
          {{$t('config.account.account')}}
        </div>
        <div class="sidebar-info-item" @click="jumpTo('promServer')" id="account-jump-promserver">
          {{$t('config.promServer.promServerList')}}
        </div>
        <div class="sidebar-info-item" @click="jumpTo('dc')" id="terminallog-jump-dc">
          {{$t('config.dc.dc')}}
        </div>
        <div class="sidebar-info-item" @click="jumpTo('model')" id="terminallog-jump-model">
          {{$t('config.model.model')}}
        </div>
        <div class="sidebar-info-item" @click="jumpTo('mib')" id="terminal-jump-mib">
          {{$t('config.mib.mib')}}
        </div>
        <div class="sidebar-info-item" @click="jumpTo('system')" id="terminal-jump-system">
          {{$t('config.system.system')}}
        </div>
        <div class="sidebar-info-item sidebar-info-item-active" @click="jumpTo('terminallog')" id="terminallog-jump-terminallog">
          {{$t('config.terminallog.terminallog')}}
        </div>
      </div>
    </div>
    <div class="content-right">
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
        v-scrollBar:el-table
        style="width: 100%;">
        <el-table-column
          :resizable="false"
          v-for="(item, index) in tablelable"
          v-if="item.show"
          :width="item.width"
          :key="`col-${index}`"
          :label="item.label"
        >
          <template slot-scope="scope" :column="item">
            <span v-if="item.prop == 'lang'">
                            {{scope.row[item.prop] == 'en' ? 'English' : ''}}
                            {{scope.row[item.prop] == 'zh' ? '中文' : ''}}
                            {{scope.row[item.prop] == 'ru' ? 'русский' : ''}}
                        </span>
            <span v-else-if="item.prop == 'status'">
                            <el-tag v-if="scope.row.status==='1'"
                                    type="success"
                                    disable-transitions>{{$t("config.terminallog.success")}}</el-tag>
                            <el-tag v-else
                    type="danger"
                    disable-transitions>
                              {{$t("config.terminallog.fail")}}</el-tag>
                        </span>
            <span v-else>{{scope.row[item.prop]}}</span>
          </template>
        </el-table-column>
<!--        <el-table-column width="28">-->
<!--          <template slot="header" slot-scope="scope">-->
<!--            <span @click.stop="elementsetShow('shezhi',$event)" class="nz-table-gear">-->
<!--              <i class="nz-icon nz-icon-gear"></i>-->
<!--            </span>-->
<!--          </template>-->
<!--        </el-table-column>-->
      </el-table>
      <Pagination :tableId="tableId" :pageObj="pageObj" @pageNo='pageNo' @pageSize='pageSize' ref="Pagination"></Pagination>
      <button class="to-top" v-show="showTopBtn" @click="$toTop"><i class="nz-icon nz-icon-top"></i></button>
    </div>
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
        tableId: 'terminalLogTable', //需要分页的table的id，用于记录每页数量
        showTopBtn: false,
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
          pageSize: 20,
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
      // elementsetShow(s, e) {
      //   var eventfixed = {
      //     shezhi: 0,
      //     screen: 0
      //   };
      //   eventfixed[s] = 1;
      //   e.preventDefault();
      //   this.$store.commit('setHeaderTable', this.tablelable);
      //   this.$store.commit('setEventfixed', eventfixed);
      //   const h = document.documentElement.clientHeight;
      //   const w = document.documentElement.clientWidth;
      //   const dw = this.$refs.elementset.$el.offsetWidth;
      //   const dh = this.$refs.elementset.$el.offsetHeight;
      //   let positionx =
      //     e.clientX + dw <= w - 10 ? e.clientX + 14 : e.clientX + 14 - dw;
      //   let positiony =
      //     e.clientY + dh <= h - 10
      //       ? e.clientY + 20
      //       : e.clientY + 20 - (e.clientY + dh - h);
      //   this.$store.commit('setPosition', {positionx, positiony});
      // },
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
        this.$get('terminal/log', this.searchLabel).then(response => {
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
        this.searchLabel = {};
        this.pageObj.pageNo = 1;
        for (let item in searchObj) {
          if (searchObj[item]) {
            this.$set(this.searchLabel, item, searchObj[item]);
          }
        }
        this.getTableData();
      }
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
