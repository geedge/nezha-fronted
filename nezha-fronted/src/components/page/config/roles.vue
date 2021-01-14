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
            <search-input :searchMsg="searchMsg" @search="search" ref="searchInput" ></search-input>
          </div>
          <button :title="$t('overall.createRole')" @click="add" class="nz-btn nz-btn-size-normal nz-btn-style-light margin-l-20" v-has="'role_toAdd'"
                  id="roles-add" type="button">
            <i class="nz-icon-create-square nz-icon"></i>
          </button>
          <delete-button :delete-objs="batchDeleteObjs" :filter-function="(arr)=>{return '?ids='+arr.map(t=>t.id).join(',')}" @after="getTableData" @before="delFlag=true" api="sys/role" v-has="'role_delete'"></delete-button>
        </div>
        <!-- 顶部分页组件，当打开底部上滑框时出现 -->
        <div class="pagination-top pagination-top-hide display-none"></div>
      </div>
      <!-- 自定义table列 -->
      <transition name="el-zoom-in-top">
        <element-set
          :custom-table-title.sync="tools.customTableTitle"
          :original-table-title="tableTitle"
          @close="tools.showCustomTableTitle = false"
          ref="customTableTitle"
          v-if="tools.showCustomTableTitle"
        ></element-set>
      </transition>
      <el-table
        :data="tableData"
        :height="mainTableHeight"
        @selection-change="(selection)=>{this.batchDeleteObjs=selection}"
        @sort-change="tableDataSort"
        border
        class="nz-table"
        ref="rolesTable"
        style="width: 100%;"
        v-loading="tools.loading"
      >
        <el-table-column
          :resizable="false"
          align="center"
          type="selection"
          width="40">
        </el-table-column>
        <el-table-column
          :fixed="item.fixed"
          :key="`col-${index}`"
          :label="item.label"
          :prop="item.prop"
          :resizable="true"
          :sort-orders="['ascending', 'descending']"
          v-for="(item, index) in tools.customTableTitle"
          v-if="item.show"
        >
          <template slot="header" slot-scope="scope">
          <span :title="item.label" class="tag-header" v-if="item.type == 'tag'"><span class="tag-value">{{item.label}}</span><span style="color:orange;">&nbsp;[Notification]</span></span>
          <span v-else><span>{{item.label}}</span></span>
        </template>
          <template :column="item" slot-scope="scope">
            <div class="content-right-options" v-if="item.prop == 'option'">
              <template v-if="scope.row.buildIn != 1">
                <span :id="'roles-edit-'+scope.row.id" :title="$t('overall.edit')" @click="edit(scope.row)" class="content-right-option" v-has="'role_toEdit'"><i :class="{'gray-filter':scope.row.buildIn == 1}" class="nz-icon nz-icon-edit"></i></span>
                &nbsp;
                <span :id="'roles-del-'+scope.row.id" :title="$t('overall.delete')" @click="del(scope.row)" class="content-right-option" v-has="'role_delete'"><i :class="{'gray-filter':scope.row.buildIn == 1}" class="nz-icon nz-icon-delete"></i></span>
              </template>
              <template v-else>
                <span :id="'roles-detail-'+scope.row.id" :title="$t('overall.view')" @click="detail(scope.row)" class="content-right-option"><i class="nz-icon nz-icon-view"></i></span>
              </template>
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
        <el-table-column fixed="right" width="28">
          <template :resizable="false" slot="header" slot-scope="scope">
            <span @mousedown.stop="!tools.showCustomTableTitle && (tools.showCustomTableTitle = true)" class="nz-table-gear">
              <i class="nz-icon nz-icon-gear"></i>
            </span>
          </template>
        </el-table-column>
      </el-table>
      <button :class="{'to-top-is-hover': tools.tableHover}" :style="{top: tools.toTopBtnTop}" @click="toTop(scrollbarWrap)" class="to-top" v-show="tools.showTopBtn && bottomBox.mainResizeShow"><i class="nz-icon nz-icon-top"></i></button>
      <div class="pagination-bottom" >
        <Pagination :tableId="tableId" :pageObj="pageObj" @pageNo='pageNo' @pageSize='pageSize' ref="Pagination"></Pagination>
      </div>
    </div>
    <transition name="right-box">
      <role-box :detail="rightBox.detail" :role="role" @close="closeRightBox" v-if="rightBox.show"></role-box>
    </transition>
  </div>
</template>
<script>
  import deleteButton from "../../common/deleteButton";
  import roleBox from '../../common/rightBox/roleBox';
  import bus from "../../../libs/bus";

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
          detail:false
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
          pageSize: this.$CONSTANTS.defaultPageSize,
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
            label: 'name',
            disabled: false
          }],
        },
        searchLabel: {}, //搜索参数
        scrollbarWrap: null,
        delFlag:false,
      }
    },
    methods: {
      closeRightBox(refresh) {
        this.rightBox.show = false;
        if (refresh) {
          this.delFlag=true;
          this.getTableData();
        }
      },
      edit(u) {
        if(u.buildIn == 1){
          return ;
        }
        this.role = JSON.parse(JSON.stringify(u));
        this.rightBox.show = true;
        this.rightBox.detail=false;
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
              this.delFlag=true;
              this.$message({duration: 2000, type: 'success', message: this.$t("tip.deleteSuccess")});
              this.getTableData();
            } else {
              this.$message.error(response.msg);
            }
          })
        });
      },
      getTableData() {
        if (!this.hasButton('role_view')) {
          this.$message.error(this.$t("tip.noAccess"));
          return;
        }
        this.$set(this.searchLabel, "pageNo", this.pageObj.pageNo);
        this.$set(this.searchLabel, "pageSize", this.pageObj.pageSize);
        this.tools.loading = true;
        this.$get('sys/role', this.searchLabel).then(response => {
          this.tools.loading = false;
          if (response.code === 200) {
            this.tableData = response.data.list;
            this.pageObj.total = response.data.total
            this.tools.loading = false;
            if (!this.scrollbarWrap) {
              this.$nextTick(() => {
                this.scrollbarWrap = this.$refs.rolesTable.bodyWrapper;
                this.toTopBtnHandler(this.scrollbarWrap);
              });
            }
          }
        })
      },
      add() {
        this.role = this.newRole();
        this.rightBox.show = true;
        this.rightBox.detail=false;
      },
      esc() {
        this.rightBox.show = false;
        this.rightBox.detail=false;
      },
      detail:function(data){
        this.role = JSON.parse(JSON.stringify(data))
        this.rightBox.show = true;
        this.rightBox.detail=true;
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
    },
    watch: {
      tableData: {
        deep: true,
        handler(n) {
          if (n.length === 0 && this.pageObj.pageNo > 1) {
            this.pageNo(this.pageObj.pageNo-1);
          }
          if(!this.delFlag){ // 不是删除时回到顶部
            this.$refs.rolesTable.bodyWrapper.scrollTop = 0
          }else{
            this.delFlag=false;
          }
        }
      }
    },
    created(){
      //是否存在分页缓存
      let pageSize = localStorage.getItem('nz-pageSize-' + localStorage.getItem('nz-username') + '-' + this.tableId);
      if (pageSize != 'undefined' && pageSize != null) {
        this.pageObj.pageSize = pageSize
      }
    },
    beforeDestroy() {
      if(this.scrollbarWrap){
        this.scrollbarWrap.removeEventListener('scroll', bus.debounce);
      };
    },
    mounted() {
      //初始化表头
      this.tools.customTableTitle = localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-" + this.$route.path)
        ? JSON.parse(localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-" + this.$route.path))
        : this.tableTitle;
      this.tableTitleReset(this.tableTitle,this.tools.customTableTitle);
      this.getTableData();
    },
  }
</script>
