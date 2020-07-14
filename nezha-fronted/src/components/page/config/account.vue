<style scoped>
  .account {
    height: 100%;
  }
</style>
<template>
  <div class="account">
    <left-menu >
    <div slot="content-left" class="slot-content">
      <div class="sidebar-title">{{$t('overall.config')}}</div>
      <div class="sidebar-info">
        <div class="sidebar-info-item sidebar-info-top sidebar-info-item-active">{{$t('config.account.account')}}</div>
        <div class="sidebar-info-item" @click="jumpTo('promServer')" id="account-jump-promserver">
          {{$t('config.promServer.promServerList')}}
        </div>
        <div class="sidebar-info-item" @click="jumpTo('dc')" id="account-jump-dc">
          {{$t('config.dc.dc')}}
        </div>
        <div class="sidebar-info-item" @click="jumpTo('model')" id="account-jump-model">
          {{$t('config.model.model')}}
        </div>
        <div class="sidebar-info-item" @click="jumpTo('mib')" id="account-jump-mib">
          {{$t('config.mib.mib')}}
        </div>
        <div class="sidebar-info-item" @click="jumpTo('system')" id="account-jump-system">
          {{$t('config.system.system')}}
        </div>
        <div class="sidebar-info-item" @click="jumpTo('terminallog')" id="account-jump-terminallog">
          {{$t('config.terminallog.terminallog')}}
        </div>
        <div class="sidebar-info-item" @click="jumpTo('operationlog')" id="account-jump-operation">
          {{$t('config.operationlog.operationlog')}}
        </div>
      </div>
    </div>
    <div slot="content-right" class="slot-content">
      <!-- 主页面 -->
      <div class="main-list main-and-sub-transition" :class="{'main-list-with-sub': showSubList}">
        <!-- 顶部工具栏 -->
        <div class="top-tools" v-show="mainResizeShow">
          <div class="top-tool-main-right" :class="{'top-tool-main-right-to-left': showSubList}">
            <div class="top-tool-search">
              <search-input ref="searchInput" :searchMsg="searchMsg" @search="search" :inTransform="inTransform"></search-input>
            </div>
            <button type="button" @click="toAdd" :title="$t('overall.createAccount')"
                    class="nz-btn nz-btn-size-normal nz-btn-style-light margin-l-20" id="account-add">
              <i class="nz-icon-create-square nz-icon"></i>
            </button>
          </div>
          <!-- 顶部分页组件，当打开底部上滑框时出现 -->
          <div class="pagination-top pagination-top-hide display-none"></div>
        </div>
        <el-table
          class="nz-table"
          :data="tableData"
          border
          v-show="mainResizeShow"
          ref="accountTable"
          :height="mainTableHeight"
          v-loading="loading"
          v-scrollBar:el-table="'large'"
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
              <div v-if="item.prop == 'option'" class="content-right-options">
                <span :title="$t('overall.view')" @click="detail(scope.row)" class="content-right-option" :id="'account-detail-'+scope.row.id"><i class="nz-icon nz-icon-view"></i></span>
                &nbsp;
                <span :title="$t('overall.edit')" @click="edit(scope.row)" class="content-right-option" :id="'account-edit-'+scope.row.id"><i class="nz-icon nz-icon-edit"></i></span>
                &nbsp;
                <span :title="$t('overall.delete')" @click="del(scope.row)" class="content-right-option" :id="'account-del-'+scope.row.id"><i class="el-icon-delete"></i></span>
              </div>
              <span v-else-if="item.prop == 'lang'">
                              {{scope.row[item.prop] == 'en' ? 'English' : ''}}
                              {{scope.row[item.prop] == 'zh' ? '中文' : ''}}
                              {{scope.row[item.prop] == 'ru' ? 'русский' : ''}}
                          </span>
              <span v-else-if="item.prop == 'receiver'">
                              <template v-for="rec in scope.row[item.prop]">{{rec.name}}&nbsp;&nbsp;</template>
                          </span>
              <span v-else-if="item.prop == 'status'">
                              <el-switch
                                v-model="scope.row.status"
                                active-value="1"
                                inactive-value="0"
                                active-color="#ee9d3f"
                                :disabled="isCurrentUser(scope.row.username)"
                                @change="(val)=>{statusChange(scope.row)}">
                              </el-switch>
                          </span>
              <span v-else>{{scope.row[item.prop]}}</span>
            </template>
          </el-table-column>
          <el-table-column width="28">
            <template slot="header" slot-scope="scope" :resizable="false">
              <span @click.stop="elementsetShow('shezhi',$event)" class="nz-table-gear">
                <i class="nz-icon nz-icon-gear"></i>
              </span>
            </template>
            <template v-slot="scope">
              <button v-if="scope.$index == 0" class="to-top" :style="{top: toTopBtnTop}" :class="{'to-top-is-hover': tableHover}" v-show="showTopBtn && mainResizeShow" @click="$toTop('ps', 0)"><i class="nz-icon nz-icon-top"></i></button>
            </template>
          </el-table-column>
        </el-table>
        <div class="pagination-bottom" v-show="!showSubList">
          <Pagination :tableId="tableId" :pageObj="pageObj" @pageNo='pageNo' @pageSize='pageSize' ref="Pagination"></Pagination>
        </div>
      </div>
      <!-- 底部上滑框 -->
      <bottom-box v-if="showSubList" :show-sub-list="showSubList" :subResizeShow="subResizeShow" :obj="user" :isFullScreen="isFullScreen" :from="'account'" :targetTab.sync="targetTab" :detail="userDetail"
                  @closeSubList="showSubList = false" @fullScreen="fullScreen" @exitFullScreen="exitFullScreen" @listResize="listResize" ></bottom-box>
    </div>
    </left-menu>
    <transition name="right-box">
      <account-box v-if="rightBox.show" :user="user" @close="closeRightBox"></account-box>
    </transition>
    <!-- 自定义table列 -->
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
  import accountBox from '../../common/rightBox/accountBox';

  export default {
    name: "account",
    components: {
      'account-box': accountBox
    },
    data() {
      return {
        loading: false,
        //底部上滑框相关
        mainListHeight: '', //主列表高度
        mainTableHeight: this.$tableHeight.normal, //主列表table高度
        showSubList: false, //是否展示二级列表
        targetTab: '', //展示二级列表中的哪个页签
        showElementSet: false, //控制自定义列弹框
        inTransform: false, //搜索框相关，搜索条件下拉框是否在transform里
        mainResizeShow: true, //dom高度改变时部分内容是否展示
        subResizeShow: true, //二级列表拖动时，用于控制主列表内容展示
        isFullScreen: false, //是否全屏
        userDetail: [],
        //底部上滑框相关end

        toTopBtnTop: this.$tableHeight.toTopBtnTop, //to-top按钮的top属性
        tableHover: false, //控制滚动条和top按钮同时出现

        tableId: 'accountTable', //需要分页的table的id，用于记录每页数量
        showTopBtn: false, //是否显示回到顶部按钮
        rightBox: { //弹出框相关
          show: false,
        },
        blankUser: {
          userId: '',
          username: '',
          email: '',
          status: '1',
          createTime: '',
          receiver: [],
          lang: ''
        },
        pageObj: { //分页对象
          pageNo: 1,
          pageSize: 20,
          total: 0
        },
        tableTitle: [ //原table列
          {
            label: 'ID',
            prop: 'userId',
            show: true,
            width: 80
          }, {
            label: this.$t("config.account.account"),
            prop: 'username',
            show: true,
          }, {
            label: 'E-mail',
            prop: 'email',
            show: true,
          }, /*{
          label: this.$t('config.account.receiver'),
          prop: 'receiver',
          show: false,
        }, */{
            label: this.$t('config.account.createTime'),
            prop: 'createTime',
            show: true,
          }, {
            label: this.$t('config.account.enable'),
            prop: 'status',
            show: true,
            width: 100
          }, {
            label: this.$t('config.account.option'),
            prop: 'option',
            show: true,
            width: 120
          }
        ],
        tablelable: [], //实际显示的列
        dropCol: [], //用于element-set组件显示
        tableData: [],
        searchMsg: { //给搜索框子组件传递的信息
          zheze_none: true,
          searchLabelList: [{
            id: 10,
            name: this.$t('config.account.account'),
            type: 'input',
            label: 'username',
            disabled: false
          }],
        },
        searchLabel: {}, //搜索参数
      }
    },
    methods: {
      // 全屏
      fullScreen() {
        let vm = this;
        this.$bottomBoxWindow.fullScreen(vm);
      },
      // 退出全屏
      exitFullScreen() {
        let vm = this;
        this.$bottomBoxWindow.exitFullScreen(vm);
      },
      // 鼠标拖动二级列表
      listResize(e) {
        let vm = this;
        this.$bottomBoxWindow.listResize(vm, e);
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
      convertToDetail(obj) {
        let detail = [];
        detail.push({label: this.$t("config.account.account"), value: obj.username});
        detail.push({label: "E-mail", value: obj.email});
        let available = obj.status == 1 ? this.$t("tip.yes") : this.$t("tip.no");
        detail.push({label: this.$t("config.account.enable"), value: available});
        detail.push({label: this.$t("config.account.createTime"), value: obj.createTime});
        return detail;
      },
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
      closeRightBox(refresh) {
        this.rightBox.show = false;
        if (refresh) {
          this.getTableData();
        }
      },
      clickos() {
        this.rightBox.show = false;
      },
      edit(u) {
        this.user = JSON.parse(JSON.stringify(u));
        this.rightBox.show = true;
      },
      detail(u) {
        this.user = JSON.parse(JSON.stringify(u));
        this.targetTab = "detail";
        this.showSubList = true;
      },
      getTableData: function () {
        this.$set(this.searchLabel, "pageNo", this.pageObj.pageNo);
        this.$set(this.searchLabel, "pageSize", this.pageObj.pageSize);
        this.loading = true;
        this.$get('sys/user/list', this.searchLabel).then(response => {
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
      toAdd() {
        this.cleanUser();
        this.rightBox.show = true;
      },
      tabSave: function () {
        this.$put('sys/user/update', this.user).then(response => {
          if (response.code === 200) {
            this.rightBox.show = false;
            this.$message({duration: 1000, type: 'success', message: this.$t("tip.saveSuccess")});
          } else {
            this.$message.error(response.msg);
          }
          this.getTableData();
        });
      },
      save: function () {
        this.$refs.accountForm.validate((valid) => {
          if (valid) {
            if (this.user.userId) {
              this.$put('sys/user/update', this.user).then(response => {
                if (response.code === 200) {
                  this.rightBox.show = false;
                  this.$message({duration: 1000, type: 'success', message: this.$t("tip.saveSuccess")});
                } else {
                  this.$message.error(response.msg);
                }
                this.getTableData();
              });
            } else {
              this.$post('sys/user/save', this.user).then(response => {
                if (response.code === 200) {
                  this.rightBox.show = false;
                  this.$message({duration: 1000, type: 'success', message: this.$t("tip.saveSuccess")});
                  this.getTableData();
                } else {
                  this.$message.error(response.msg);
                }
              });
            }
          } else {
            return false;
          }
        })
      },
      saveOrToEdit: function () {
        if (!this.rightBox.isEdit) {
          this.rightBox.isEdit = true;
          this.rightBox.title = this.$t("config.account.editAccount") + "  ID：" + this.user.userId;
        } else {
          this.save();
        }
      },
      statusChange: function (user) {
        this.user = user;
        this.tabSave();
      },
      jumpTo(data, id) {
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
      blurEditReceiver: function () {
        for (let i = 0; i < this.receiverData.length; i++) {
          if (this.receiverData[i].isEdit) {
            this.receiverData[i].name = this.receiverData[i].oldName;
            this.receiverData[i].isEdit = false;
            this.receiverData[i].errorMessage = '';
            break;
          }
        }
      },
      toDelReceiver: function (item) {
        this.blurEditReceiver();
        //TODO 请求后台，删除用户组
      },
      esc: function () {
        this.rightBox.show = false;
      },
      cleanUser: function () {
        this.user = {
          userId: '',
          username: '',
          email: '',
          status: '1',
          createTime: '',
          receiver: [],
          lang: 'en'
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
      search(searchObj) {
        this.searchLabel = {};
        this.pageObj.pageNo = 1;
        for (let item in searchObj) {
          if (searchObj[item]) {
            this.$set(this.searchLabel, item, searchObj[item]);
          }
        }
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
    watch: {
      user: {
        deep: true,
        handler(n) {
          this.userDetail = this.convertToDetail(n);
        }
      },
      showSubList(n) {
        this.$bottomBoxWindow.showSubListWatch(vm, n);
      }
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
        let el = this.$refs.accountTable.$el.querySelector(".el-table__body-wrapper");
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
