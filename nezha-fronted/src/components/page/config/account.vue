<style scoped>
  .account {
    height: 100%;
  }
</style>
<template>
  <div class="account">
    <!-- 主页面 -->
    <div class="main-list" :class="{'main-list-with-sub': bottomBox.showSubList}">
      <!-- 顶部工具栏 -->
      <div class="main-modal"></div>
      <div class="top-tools" v-show="bottomBox.mainResizeShow">
        <div class="top-tool-main-right" :class="{'top-tool-main-right-to-left': bottomBox.showSubList}">
          <div class="top-tool-search">
            <search-input ref="searchInput" :searchMsg="searchMsg" @search="search" :inTransform="bottomBox.inTransform"></search-input>
          </div>
          <button type="button" @click="add" :title="$t('overall.createAccount')"
                  class="nz-btn nz-btn-size-normal nz-btn-style-light margin-l-20" id="account-add">
            <i class="nz-icon-create-square nz-icon"></i>
          </button>
          <delete-button :delete-objs="batchDeleteObjs" api="sys/user/delete" @after="getTableData" :filter-function="(arr)=>{return '?userIds='+arr.map(t=>t.userId).join(',')}"></delete-button>
        </div>
        <!-- 顶部分页组件，当打开底部上滑框时出现 -->
        <div class="pagination-top pagination-top-hide display-none"></div>
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
      <el-table
        class="nz-table"
        :data="tableData"
        border
        v-show="bottomBox.mainResizeShow"
        ref="accountTable"
        :height="mainTableHeight"
        v-loading="tools.loading"
        v-scrollBar:el-table="'large'"
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
          :fixed="item.fixed"
          :label="item.label"
          :prop="item.prop"
          :sort-orders="['ascending', 'descending']"
        >
          <template slot-scope="scope" slot="header">
            <span v-if="item.type == 'tag'" class="tag-header" :title="item.label"><span class="tag-value">{{item.label}}</span><span style="color:orange;">&nbsp;[Notification]</span></span>
            <span v-else><span>{{item.label}}</span></span>
          </template>
          <template slot-scope="scope" :column="item">
            <div v-if="item.prop == 'option'" class="content-right-options">
              <!--<span :title="$t('overall.view')" @click="detail(scope.row)" class="content-right-option" :id="'account-detail-'+scope.row.id"><i class="nz-icon nz-icon-view"></i></span>
              &nbsp;-->
              <span :title="$t('overall.edit')" @click="edit(scope.row)" class="content-right-option" :id="'account-edit-'+scope.row.id"><i class="nz-icon nz-icon-edit"></i></span>
              &nbsp;
              <span :title="$t('overall.delete')" @click="del(scope.row)" class="content-right-option" :id="'account-del-'+scope.row.id"><i class="nz-icon nz-icon-delete"></i></span>
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
            <template v-else-if="item.prop == 'tags'">
              <span>{{filterTags(item, scope)}}</span>
            </template>
            <span v-else-if="item.prop == 'createTime'">{{utcTimeToTimezoneStr(scope.row[item.prop])}}</span>
            <span v-else>{{scope.row[item.prop]}}</span>
          </template>
        </el-table-column>
        <el-table-column width="28" fixed="right">
          <template slot="header" slot-scope="scope" :resizable="false">
            <span @mousedown.stop="!tools.showCustomTableTitle && (tools.showCustomTableTitle = true)" class="nz-table-gear">
              <i class="nz-icon nz-icon-gear"></i>
            </span>
          </template>
        </el-table-column>
      </el-table>
      <button class="to-top" :style="{top: tools.toTopBtnTop}" :class="{'to-top-is-hover': tools.tableHover}" v-show="tools.showTopBtn && bottomBox.mainResizeShow" @click="$toTop('ps', 0)"><i class="nz-icon nz-icon-top"></i></button>
      <div class="pagination-bottom" v-show="!bottomBox.showSubList">
        <Pagination :tableId="tableId" :pageObj="pageObj" @pageNo='pageNo' @pageSize='pageSize' ref="Pagination"></Pagination>
      </div>
    </div>
    <!-- 底部上滑框 -->
    <transition name="el-zoom-in-bottom">
      <bottom-box v-if="bottomBox.showSubList" :sub-resize-show="bottomBox.subResizeShow" :obj="bottomBox.user" :is-full-screen="bottomBox.isFullScreen" :from="'account'" :target-tab.sync="bottomBox.targetTab" :detail="bottomBox.userDetail"
                  @closeSubList="bottomBox.showSubList = false" @fullScreen="fullScreen" @exitFullScreen="exitFullScreen" @listResize="listResize" ></bottom-box>
    </transition>
    <transition name="right-box">
      <account-box v-if="rightBox.show" :user="user" @close="closeRightBox"></account-box>
    </transition>
  </div>
</template>
<script>
  import deleteButton from "../../common/deleteButton";
  import accountBox from '../../common/rightBox/accountBox';

  export default {
    name: "account",
    components: {
      'account-box': accountBox,
      'delete-button':deleteButton,
    },
    data() {
      return {
        //侧滑
        rightBox: {
          show: false,
        },
        /*二级页面相关*/
        bottomBox: {
          userDetail: {},
          user: {},
          mainResizeShow: true, //dom高度改变时是否展示|隐藏
          subResizeShow: true,
          isFullScreen: false, //全屏状态
          showSubList: false, //是否显示二级列表
          targetTab: '', //显示二级列表中的哪个页签
          inTransform: false, //搜索框相关，搜索条件下拉框是否在transform里
        },

        /*工具参数*/
        tools: {
          loading: false, //是否显示table加载动画
          toTopBtnTop: this.$tableHeight.toTopBtnTop, //to-top按钮的top属性
          tableHover: false, //控制滚动条和top按钮同时出现
          showTopBtn: false, //显示To top按钮
          showCustomTableTitle: false, //自定义列弹框是否显示
          customTableTitle: [], //自定义列工具的数据
        },
        mainTableHeight: this.$tableHeight.normal, //主列表table高度
        batchDeleteObjs:[],
        user: {},

        tableId: 'accountTable', //需要分页的table的id，用于记录每页数量
        blankUser: { //空白对象
          userId: '',
          username: '',
          email: '',
          status: '1',
          createTime: '',
          receiver: [],
          lang: '',
          notifications: []
        },
        pageObj: { //分页对象
          pageNo: 1,
          pageSize: 50,
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
          }, {
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
            width: 120,
            fixed: "right"
          }
        ],
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
      convertToDetail(obj) {
        let detail = [];
        detail.push({label: this.$t("config.account.account"), value: obj.username});
        detail.push({label: "E-mail", value: obj.email});
        let available = obj.status == 1 ? this.$t("tip.yes") : this.$t("tip.no");
        detail.push({label: this.$t("config.account.enable"), value: available});
        detail.push({label: this.$t("config.account.createTime"), value: obj.createTime});
        return detail;
      },
      closeRightBox(refresh) {
        this.rightBox.show = false;
        if (refresh) {
          this.getTableData();
        }
      },
      edit(u) {
        this.user = JSON.parse(JSON.stringify(u));
        this.rightBox.show = true;
      },
      detail(u) {
        this.bottomBox.user = JSON.parse(JSON.stringify(u));
        this.bottomBox.targetTab = "detail";
        this.bottomBox.showSubList = true;
      },
      del(u) {
        this.$confirm(this.$t("tip.confirmDelete"), {
          confirmButtonText: this.$t("tip.yes"),
          cancelButtonText: this.$t("tip.no"),
          type: 'warning'
        }).then(() => {
          this.$delete("sys/user/delete?userIds=" + u.userId).then(response => {
            if (response.code === 200) {
              this.$message({duration: 2000, type: 'success', message: this.$t("tip.deleteSuccess")});
              this.getTableData();
            } else {
              this.$message.error(response.msg);
            }
          })
        });
      },
      getTableData() {
        this.$set(this.searchLabel, "pageNo", this.pageObj.pageNo);
        this.$set(this.searchLabel, "pageSize", this.pageObj.pageSize);
        this.tools.loading = true;
        this.$get('sys/user/list', this.searchLabel).then(response => {
          this.tools.loading = false;
          if (response.code === 200) {
            for (let i = 0; i < response.data.list.length; i++) {
              response.data.list[i].status = response.data.list[i].status + "";
              /*response.data.list[i].notifications = [
                {scriptId: 1, account: "杀死比尔"},
                {scriptId: 2, account: "虎虎虎"},
                {scriptId: 3, account: "红海行动"},
                {scriptId: 4, account: "十面埋伏"},
                {scriptId: 5, account: "哪吒"},
              ];*/
            }
            this.tableData = response.data.list;
            this.pageObj.total = response.data.total
          }
        })
      },
      add() {
        this.user = this.newUser();
        this.rightBox.show = true;
      },
      statusChange(user) {
        this.$put('sys/user/update', user).then(response => {
          if (response.code === 200) {
            this.rightBox.show = false;
            this.$message({duration: 1000, type: 'success', message: this.$t("tip.saveSuccess")});
          } else {
            this.$message.error(response.msg);
          }
          this.getTableData();
        });
      },
      esc() {
        this.rightBox.show = false;
      },
      newUser() {
        return JSON.parse(JSON.stringify(this.blankUser));
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
        if(this.$refs.accountTable){
          this.$refs.accountTable.bodyWrapper.scrollTop = 0;
        }
        this.getTableData();
      },
      // 数据排序
      tableDataSort(item){
        let orderBy = '';
        if(item.order === 'ascending') {
          orderBy = item.prop;
        }
        if(item.order === 'descending') {
          orderBy = '-' + item.prop;
        }
        this.$set(this.searchLabel, "orderBy", orderBy);
        this.getTableData();
      },
      plpsscrolly(el,self){
        if (el._ps_.scrollbarYTop > 50) {
          self.tools.showTopBtn = true;
          self.tools.tableHover = true;
        } else {
          self.tools.showTopBtn = false;
          self.tools.tableHover = true;
        }
      },

      resetTableTitle:function(){
        let title = this.tools.customTableTitle;
        let tableTitle = title.slice(0, this.tableTitle.length);
        let tagTitle = title.slice(this.tableTitle.length, title.length);
        this.$get("/alert/script?pageNo=1&pageSize=-1").then(response => {
          let scripts = response.data.list;
          scripts = scripts.map(item => {
            return {label: item.name, prop: 'tags', show: false, allowed: true, scriptId: item.id, type: "tag"};
          });
          let newTags = scripts.filter(item=>{ return !tagTitle.find(t =>{return item.label == t.label})});
          let keepTags = tagTitle.filter(item=>{ return scripts.find(t =>{return item.label == t.label})});
          keepTags.forEach(item => {
            let script = scripts.find(t =>{return item.label == t.label});
            item.scriptId = script.scriptId;
          });
          let result = tableTitle.concat([{label: this.$t("config.account.notification"), show: false, NotSet: true, type: 'title', prop:'table-tag'}]);

          result = result.concat(keepTags).concat(newTags);
          this.tools.customTableTitle = JSON.parse(JSON.stringify(result));
        });
        /*let scripts = [
          {id: 1, name: "DOLBY"},
          {id: 2, name: "IMAX"},
          {id: 3, name: "CGS"},
          {id: 4, name: "LUXE"},
          {id: 5, name: "DST:X"},
        ];*/
      },
      filterTags(head, scope) {
        if (scope.row.notifications) {
          let notification = scope.row.notifications.find(item => {
            return head.scriptId === item.scriptId;
          });
          if (notification) {
            return notification.account;
          }
        }
      }
    },
    computed: {
      isCurrentUser() {
        return function(username) {
          return localStorage.getItem('nz-username') == username;
        }
      }
    },
    watch: {
      'bottomBox.user': {
        deep: true,
        handler(n) {
          this.bottomBox.userDetail = this.convertToDetail(n);
        }
      },
      'bottomBox.showSubList': function(n) {
        let vm = this;
        this.$bottomBoxWindow.showSubListWatch(vm, n);
      },
    },
    created(){
      //是否存在分页缓存
      let pageSize = localStorage.getItem('nz-pageSize-' + localStorage.getItem('nz-username') + '-' + this.tableId);
      if (pageSize != 'undefined' && pageSize != null) {
        this.pageObj.pageSize = pageSize
      }
    },
    mounted() {
      //初始化表头
      this.tools.customTableTitle = localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-" + this.$route.path)
        ? JSON.parse(localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-" + this.$route.path))
        : this.tableTitle;
      this.tableTitleReset(this.tableTitle,this.tools.customTableTitle);

      this.resetTableTitle();
      this.getTableData();
      this.$nextTick(() => {
        //绑定滚动条事件，控制top按钮
        let el = this.$refs.accountTable.$el.querySelector(".el-table__body-wrapper");
        if (el._ps_) {
          el.addEventListener("ps-scroll-y", this.plpsscrolly.bind('',el,this));
        }
      });
    },
    beforeDestroy(){
      let el = this.$refs.accountTable.$el.querySelector(".el-table__body-wrapper");
      if (el._ps_) {
        el.removeEventListener("ps-scroll-y", this.plpsscrolly.bind('',el,this));
        el._ps_.destroy();
      }
    }
  }
</script>
