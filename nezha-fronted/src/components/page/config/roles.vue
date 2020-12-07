<style scoped>
  .roles {
    height: 100%;
  }
</style>
<template>
  <div class="roles">
    <!-- 主页面 -->
    <div class="main-list" >
      <!-- 顶部工具栏 -->
      <div class="main-modal"></div>
      <div class="top-tools" >
        <div class="top-tool-main-right" >
          <div class="top-tool-search">
            <search-input ref="searchInput" :searchMsg="searchMsg" @search="search" ></search-input>
          </div>
          <button type="button" @click="add" :title="$t('overall.createRoles')"
                  class="nz-btn nz-btn-size-normal nz-btn-style-light margin-l-20" id="roles-add">
            <i class="nz-icon-create-square nz-icon"></i>
          </button>
          <delete-button :delete-objs="batchDeleteObjs" api="sys/role" @after="getTableData" :filter-function="(arr)=>{return '?ids='+arr.map(t=>t.id).join(',')}"></delete-button>
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
        ref="rolesTable"
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
              <span :title="$t('overall.edit')" @click="edit(scope.row)" class="content-right-option" :id="'roles-edit-'+scope.row.id"><i class="nz-icon nz-icon-edit" :class="{'gray-filter':scope.row.buildIn == 1}"></i></span>
              &nbsp;
              <span :title="$t('overall.delete')" @click="del(scope.row)" class="content-right-option" :id="'roles-del-'+scope.row.id"><i class="nz-icon nz-icon-delete" :class="{'gray-filter':scope.row.buildIn == 1}"></i></span>
            </div>
            <template v-if="item.prop == 'name'">
              <template v-if="scope.row.i18n">
                <span>{{$t(scope.row.i18n)}}</span>
              </template>
              <template v-else-if="scope.row.name">
                <span>{{scope.row.name}}</span>
              </template>
              <template v-else>
                <span>-</span>
              </template>
            </template>
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
      <button class="to-top" :style="{top: tools.toTopBtnTop}" :class="{'to-top-is-hover': tools.tableHover}" v-show="tools.showTopBtn " @click="$toTop('ps', 0)"><i class="nz-icon nz-icon-top"></i></button>
    </div>
    <transition name="right-box">
      <role-box v-if="rightBox.show" :role="role" @close="closeRightBox"></role-box>
    </transition>
  </div>
</template>
<script>
  import deleteButton from "../../common/deleteButton";
  import roleBox from '../../common/rightBox/roleBox';

  export default {
    name: "roles",
    components: {
      'role-box': roleBox,
      'delete-button':deleteButton,
    },
    data() {
      return {
        //侧滑
        rightBox: {
          show: false,
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
        role: {},

        tableId: 'rolesTable', //需要分页的table的id，用于记录每页数量
        blankRole: { //空白对象

        },
        pageObj: { //分页对象
          pageNo: 1,
          pageSize: 50,
          total: 0
        },
        tableTitle: [ //原table列
          {
            label: 'ID',
            prop: 'id',
            show: true,
            width: 80
          }, {
            label: this.$t("config.roles.name"),
            prop: 'name',
            show: true,
          }, {
            label: this.$t("config.roles.remark"),
            prop: 'remark',
            show: true,
          }, {
            label: this.$t('config.roles.option'),
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
            name: this.$t('config.roles.name'),
            type: 'input',
            label: this.$t('config.roles.name'),
            disabled: false
          }],
        },
        searchLabel: {}, //搜索参数
      }
    },
    methods: {
      closeRightBox(refresh) {
        this.rightBox.show = false;
        if (refresh) {
          this.getTableData();
        }
      },
      edit(u) {
        if(u.buildIn == 1){
          return ;
        }
        this.role = JSON.parse(JSON.stringify(u));
        this.rightBox.show = true;
      },
      del(u) {
        if(u.buildIn == 1){
          return ;
        }
        this.$confirm(this.$t("tip.confirmDelete"), {
          confirmButtonText: this.$t("tip.yes"),
          cancelButtonText: this.$t("tip.no"),
          type: 'warning'
        }).then(() => {
          this.$delete("sys/role?ids=" + u.id).then(response => {
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
        this.$get('sys/role', this.searchLabel).then(response => {
          this.tools.loading = false;
          if (response.code === 200) {
            this.tableData = response.data.list;
            this.pageObj.total = response.data.total
            this.tools.loading = false;
          }
        })
      },
      add() {
        this.role = this.newRole();
        this.rightBox.show = true;
      },
      esc() {
        this.rightBox.show = false;
      },
      newRole() {
        return JSON.parse(JSON.stringify(this.blankRole));
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
        if(this.$refs.rolesTable){
          this.$refs.rolesTable.bodyWrapper.scrollTop = 0;
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

    },
    computed: {
    },
    watch: {
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
      this.getTableData();
      this.$nextTick(() => {
        //绑定滚动条事件，控制top按钮
        let el = this.$refs.rolesTable.$el.querySelector(".el-table__body-wrapper");
        if (el._ps_) {
          el.addEventListener("ps-scroll-y", this.plpsscrolly.bind('',el,this));
        }
      });
    },
    beforeDestroy(){
      let el = this.$refs.rolesTable.$el.querySelector(".el-table__body-wrapper");
      if (el._ps_) {
        el.removeEventListener("ps-scroll-y", this.plpsscrolly.bind('',el,this));
        el._ps_.destroy();
      }
    }
  }
</script>
