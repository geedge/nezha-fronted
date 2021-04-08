<style lang="scss">
@import '@/assets/css/common/tableCommon.scss';
</style>
<template>
  <div class="dc list-page">
    <!--dc table start-->
    <div class="main-list" :class="{'main-list-with-sub': bottomBox.showSubList}">
      <div class="main-modal"></div>
      <div class="top-tools" v-show="bottomBox.mainResizeShow">
        <div class="top-tool-main-right" :class="{'top-tool-main-right-to-left-small': bottomBox.showSubList}">
          <div class="top-tool-search">
            <search-input ref="searchInput" :searchMsg="searchMsg" @search="search" :inTransform="bottomBox.inTransform"></search-input>
          </div>
          <button :title="$t('overall.createDatacenter')" @click="add" type="button" v-has="'dc_toAdd'"
                  id="dc-add" class="top-tool-btn margin-l-20">
            <i class="nz-icon-create-square nz-icon"></i>
          </button>
          <button :title="$t('overall.createDatacenter')" @click="toDownloadAgent" type="button" id="load-agent" class="top-tool-btn margin-l-20">
            <i class="nz-icon-download nz-icon"></i>
          </button>
          <delete-button :delete-objs="batchDeleteObjs" @before="delFlag=true" @after="getTableData" api="idc" v-has="'dc_delete'" id="dc-list-batch-delete"></delete-button>
          <button id="account-column-setting" class="top-tool-btn margin-l-10"
                  type="button" @click="!tools.showCustomTableTitle && (tools.showCustomTableTitle = true)">
            <i class="nz-icon-gear nz-icon"></i>
          </button>
        </div>
        <div class="pagination-top pagination-top-hide display-none"></div>
      </div>
      <!-- 自定义table列 -->
      <transition name="el-zoom-in-top">
        <element-set
          id="dc-list"
          v-if="tools.showCustomTableTitle"
          @close="tools.showCustomTableTitle = false"
          :custom-table-title.sync="tools.customTableTitle"
          :original-table-title="tableTitle"
          ref="customTableTitle"
        ></element-set>
      </transition>
      <div class="nz-table2">
        <el-table
          v-show="bottomBox.mainResizeShow"
          id="dc-list-table"
          ref="dcTable"
          v-loading="tools.loading"
          :cell-class-name="assetStatClassName"
          :data="tableData"
          :height="mainTableHeight"
          border
          tooltip-effect="light"
          @sort-change="tableDataSort"
          @selection-change="(selection)=>{this.batchDeleteObjs=selection}"
        >
          <el-table-column
            :resizable="false"
            align="center"
            type="selection"
            width="55">
          </el-table-column>
          <el-table-column
            v-for="(item, index) in tools.customTableTitle"
            v-if="item.show"
            :key="`col-${index}`"
            :label="item.label"
            :prop="$tableSet.propTitle(item.prop,'dc')"
            :resizable="true"
            :sortable="sortableShow(item.prop,'dc')"
            show-overflow-tooltip
          >
            <template slot-scope="scope" :column="item">
              <template v-if="item.prop == 'principal'">
                <template v-if="scope.row.principal">
                  <template v-for="item in userData">
                    <template v-if="scope.row.principal == item.userId">{{item.username}}</template>
                  </template>
                </template>
                <template v-else>-</template>
              </template>
              <template v-else-if="item.prop == 'state'">
                <el-switch
                  v-model="scope.row.state"
                  :disabled="!hasButton('dc_toEdit') || !hasButton('dc_toEdit')"
                  active-color="#ee9d3f"
                  active-value="ON"
                  inactive-value="OFF"
                  @change="(val)=>{statusChange(scope.row)}"
                />
              </template>
              <template v-else-if="item.prop == 'longitude'">
                <template v-if="regNumTest(scope.row.longitude)">{{scope.row.longitude}}</template>
                <template v-else>-</template>
              </template>
              <template v-else-if="item.prop == 'latitude'">
                <template v-if="regNumTest(scope.row.latitude)">{{scope.row.latitude}}</template>
                <template v-else>-</template>
              </template>
              <template v-else-if="item.prop == 'assetStat' && scope.row.assetStat">
                <el-popover
                  :content="$t('overall.result.total') + '：' + scope.row.assetStat.total + '，' + $t('asset.inStock') + '：' + scope.row.assetStat.inStock + '，' + $t('asset.notInStock') + '：' + scope.row.assetStat.outStock + '，' + $t('asset.suspended') + '：' + scope.row.assetStat.suspended"
                  placement="top"
                  trigger="hover">
                  <div slot="reference" class="dc-asset-states">
                    <span class="dc-asset-state dc-asset-state-total">{{scope.row.assetStat.total}}</span>
                    <span class="dc-asset-state dc-asset-state-in">{{scope.row.assetStat.inStock}}</span>
                    <span class="dc-asset-state dc-asset-state-out">{{scope.row.assetStat.outStock}}</span>
                    <span class="dc-asset-state dc-asset-state-suspended">{{scope.row.assetStat.suspended}}</span>
                  </div>
                </el-popover>

              </template >
              <template v-else-if="item.prop == 'cabinetNum'">
                <span class="link" @click="showCabinet(scope.row)">{{scope.row[item.prop]}}</span>
              </template>
              <template v-else-if="scope.row[item.prop]">{{scope.row[item.prop]}}</template>
              <template v-else>-</template>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <button :class="{'to-top-is-hover': tools.tableHover}" :style="{top: tools.toTopBtnTop}" @click="toTop(scrollbarWrap)" class="to-top" v-show="tools.showTopBtn && bottomBox.mainResizeShow" id="dc-list-totop"><i class="nz-icon nz-icon-top"></i></button>
      <div class="pagination-bottom" v-show="!bottomBox.showSubList">
        <Pagination :tableId="tableId" :pageObj="pageObj" @pageNo='pageNo' @pageSize='pageSize' ref="Pagination"></Pagination>
      </div>
    </div>
    <transition name="el-zoom-in-bottom">
      <bottom-box :detail="bottomBox.dcDetail" :from="$CONSTANTS.fromRoute.dc" :is-full-screen="bottomBox.isFullScreen" :obj="bottomBox.dc" :sub-resize-show="bottomBox.subResizeShow" :target-tab.sync="bottomBox.targetTab" v-if="bottomBox.showSubList"
                  @closeSubList="bottomBox.showSubList = false" @fullScreen="fullScreen" @exitFullScreen="exitFullScreen" @listResize="listResize" ></bottom-box>
    </transition>
    <!--dc table end-->
    <transition name="right-box">
      <dc-box @close="closeDcBox" :dc="dc" :user-data="userData" @reload="getTableData" v-if="rightBox.dc.show"></dc-box>
    </transition>
    <transition name="right-box">
      <traffic-setting-box @close="closeTrafficBox" :dc="dc" ref="trafficBox" v-if="rightBox.trafficSetting.show"></traffic-setting-box>
    </transition>
    <span v-if="dcDataRefresh" style="display: none"></span>
    <el-dialog :visible.sync="showAgentDownload" width="620px" append-to-body class="nz-dialog agent-dialog" @close="closeDialog" :title="$t('config.dc.agent.title')">
      <div class="agent-box" v-if="showAgentDownload">
        <el-form size="small" v-model="agentParam" class="right-box-form  right-box-form-left" label-position = "top" label-width="120px" style="width: 100%">
          <div class="right-box-sub-title">{{$t('config.dc.agent.download')}}</div>
          <div style="margin-bottom: 20px;width: 100%"></div>
          <el-form-item :label="$t('config.dc.agent.osType')" prop="osType" class="half-form-item">
            <el-select class="right-box-row-with-btn" placeholder="" v-model="agentParam.osType">
              <el-option :key="item.name" :label="item.label" :value="item.name" v-for="item in osTypes">
                <span class="panel-dropdown-label-txt" >{{item.label}}</span>
              </el-option>
            </el-select>
          </el-form-item>
          <div class="right-box-sub-title">{{$t('config.dc.agent.autoScript')}}</div>
          <div style="margin-bottom: 20px;width: 100%"></div>

          <el-form-item :label="$t('config.dc.agent.dc')" prop="dc" class="half-form-item">
            <el-select class="right-box-row-with-btn" placeholder="" v-model="agentParam.dc">
              <el-option :key="item.id" :label="item.name" :value="item.id" v-for="item in allDc">
                <span class="panel-dropdown-label-txt" >{{item.name}}</span>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('config.dc.agent.type')" prop="type" class="half-form-item">
            <el-select class="right-box-row-with-btn" placeholder="" v-model="agentParam.type">
              <el-option :key="item.value" :label="item.label" :value="item.value" v-for="item in $CONSTANTS.promServer2.theData">
                <span class="panel-dropdown-label-txt" >{{item.label}}</span>
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>
        <div class="download-url" v-if="loadFinish">
          <el-scrollbar class="el-scrollbar-small" style="width: calc(100% - 40px); height: 100%;">
            <pre><code id="download-url-curl">curl -o- -H "Authorization:{{token}}" http://{{ipAddr}}/agent/{{agentParam.dc}}/{{agentParam.type}}/install.sh | bash</code></pre>
          </el-scrollbar>
          <span @click="copyUrl('download-url-curl')" class="url-copy"><i class="nz-icon nz-icon-override"></i></span>
        </div>
        <div class="download-url" v-if="loadFinish">
          <el-scrollbar class="el-scrollbar-small" style="width: calc(100% - 40px);height: 100%;">
            <pre><code id="download-url-wget">wget -qO- --header="Authorization:{{token}}" http://{{ipAddr}}/agent/{{agentParam.dc}}/{{agentParam.type}}/install.sh | bash</code></pre>
          </el-scrollbar>
          <span @click="copyUrl('download-url-wget')" class="url-copy"><i class="nz-icon nz-icon-override"></i></span>
        </div>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import bus from '../../../libs/bus'
import dcBox from '../../common/rightBox/dcBox' // dc弹框
import trafficSettingBox from '../../common/rightBox/trafficSetting/trafficSettingBox'
import deleteButton from '../../common/deleteButton'
const regNum = /^[0-9]+.?[0-9]*/
export default {
  name: 'dc',
  components: {
    'traffic-setting-box': trafficSettingBox,
    'dc-box': dcBox,
    'delete-button': deleteButton
  },
  data () {
    return {
      /* 二级页面相关 */
      bottomBox: {
        dcDetail: {},
        dc: {},
        mainResizeShow: true, // dom高度改变时是否展示|隐藏
        subResizeShow: true,
        isFullScreen: false, // 全屏状态
        showSubList: false, // 是否显示二级列表
        targetTab: '', // 显示二级列表中的哪个页签
        inTransform: false // 搜索框相关，搜索条件下拉框是否在transform里
      },
      mainTableHeight: this.$tableHeight.normal, // 主列表table高度
      /* 工具参数 */
      tools: {
        loading: false, // 是否显示table加载动画
        toTopBtnTop: this.$tableHeight.toTopBtnTop, // to-top按钮的top属性
        tableHover: false, // 控制滚动条和top按钮同时出现
        showTopBtn: false, // 显示To top按钮
        showCustomTableTitle: false, // 自定义列弹框是否显示
        customTableTitle: [] // 自定义列工具的数据
      },
      batchDeleteObjs: [],
      tableId: 'dcTable', // 需要分页的table的id，用于记录每页数量
      dc: {},
      blankDc: {
        id: '',
        name: '',
        location: '',
        tel: '',
        principal: '',
        // area: {
        //   id: 0,
        //   name: ''
        // }
        state: 'ON',
        longitude: undefined,
        latitude: undefined
      },
      rightBox: {
        dc: { show: false },
        trafficSetting: { show: false }
      },
      pageObj: {
        pageNo: 1,
        pageSize: this.$CONSTANTS.defaultPageSize,
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
          show: true
        }, {
          label: this.$t('asset.location'),
          prop: 'location',
          show: true
        }, {
          label: this.$t('config.dc.cabinetNum'),
          prop: 'cabinetNum',
          show: true
        }, {
          label: this.$t('config.dc.assets'),
          prop: 'assetStat',
          show: true
        }, {
          label: this.$t('asset.tel'),
          prop: 'tel',
          show: true
        }, {
          label: this.$t('asset.principal'),
          prop: 'principal',
          show: true
        }, {
          label: this.$t('config.dc.longitude'),
          prop: 'longitude',
          show: false
        }, {
          label: this.$t('config.dc.latitude'),
          prop: 'latitude',
          show: false
        }, {
          label: this.$t('config.dc.state'),
          prop: 'state',
          show: true
        }
      ],
      tableData: [],
      userData: [],
      searchMsg: { // 给搜索框子组件传递的信息
        zheze_none: true,
        searchLabelList: [{
          id: 10,
          name: this.$t('overall.name'),
          type: 'input',
          label: 'name',
          disabled: false
        }]
      },
      searchLabel: {}, // 搜索参数
      tabShow: 1, // 控制显示一级页面和二级页面 1 dc 2cabinet
      scrollbarWrap: null,
      delFlag: false,
      showAgentDownload:false,
      token:'',
      ipAddr:'',
      allDc:[],
      loadFinish :false,
      osTypes:[{
          label:"Centos",
          name:"centos",
        },
        {
          label:"Ubuntu",
          name:"ubuntu"
        }],
      agentParam:{
        osType:"Centos",
        dc:"",
        type:1,
      }
    }
  },
  computed: {
    dcDataRefresh () { // 通过vuex更新dc   需要该属性到页面 否则不被监听
      if (this.$store.getters.getDcDataRefresh) {
        this.getTableData()
      }
      return this.$store.getters.getDcDataRefresh
    }
  },
  methods: {
    toDownloadAgent:function(){
      this.showAgentDownload = true;
      this.token = sessionStorage.getItem('nz-token');
      let reg = /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/;
      this.ipAddr = reg.exec(window.location.href)[0];
    },
    closeDialog:function(){
      this.showAgentDownload = false;
    },
    getAllDc:function(){
      this.$get('idc?pageSize=-1', ).then(response => {
        console.log('load dc data....')
        this.tools.loading = false
        if (response.code === 200) {
          this.allDc  = response.data.list
          console.log(this.allDc)
          this.loadFinish = true;
          this.agentParam.dc = this.allDc[0].id;
        }
      })
    },
    copyUrl:function(id){
      let text = document.querySelector("#"+id).innerText;
      const input = document.createElement('input');
      document.body.appendChild(input);
      input.setAttribute('value', text);
      input.select();
      if (document.execCommand('copy')) {
        document.execCommand('copy');
      }
      document.body.removeChild(input);
    },
    assetStatClassName (param) {
      if (param.column.label == this.$t('config.dc.assets')) {
        return 'asset-state'
      }
      return ''
    },
    jumpTo (data, id) {
      bus.$emit('menu-change', data)
      this.$router.push({
        path: '/' + data,
        query: {
          t: +new Date()
        }
      })
    },
    edit (u) {
      this.dc = JSON.parse(JSON.stringify(u))
      if (!regNum.test(this.dc.longitude)) {
        this.dc.longitude = undefined
      }
      if (!regNum.test(this.dc.latitude)) {
        this.dc.latitude = undefined
      }
      if (!this.dc.area) {
        this.$set(this.dc, 'area', { id: '', name: '' })
      }
      this.rightBox.dc.show = true
    },
    configTraffic (u) {
      this.dc = JSON.parse(JSON.stringify(u))
      this.rightBox.trafficSetting.show = true
    },
    detail (u) {
      this.bottomBox.dc = JSON.parse(JSON.stringify(u))
      if (!this.bottomBox.dc.area) {
        this.$set(this.bottomBox.dc, 'area', { id: '', name: '' })
      }
      this.bottomBox.targetTab = 'detail'
      this.bottomBox.showSubList = true
    },
    // 全屏
    fullScreen () {
      const vm = this
      this.$bottomBoxWindow.fullScreen(vm)
    },
    // 退出全屏
    exitFullScreen () {
      const vm = this
      this.$bottomBoxWindow.exitFullScreen(vm)
    },
    // 鼠标拖动二级列表
    listResize (e) {
      const vm = this
      this.$bottomBoxWindow.listResize(vm, e)
    },
    convertToDetail (obj) {
      const detail = JSON.parse(JSON.stringify(obj))
      return detail
      /* let detail = [];
        detail.push({label: this.$t("overall.name"), value: obj.name});
        detail.push({label: this.$t("config.dc.area"), value: obj.area.name});
        detail.push({label: this.$t("asset.location"), value: obj.location});
        detail.push({label: this.$t("config.dc.cabinetNum"), value: obj.cabinetNum});
        let assets = this.$t('overall.result.total') + ' ' + obj.assetStat.total + '，' + this.$t('asset.inStock') + ' ' + obj.assetStat.inStock + '，' + this.$t('asset.notInStock') + ' ' + obj.assetStat.outStock;
        detail.push({label: this.$t("config.dc.assets"), value: assets});
        detail.push({label: this.$t("asset.tel"), value: obj.tel});
        let principal = '';
        for (let i = 0; i < this.userData.length; i++) {
          if (this.userData[i].userId == obj.principal) {
            principal = this.userData[i].username;
            break;
          }
        }
        detail.push({label: this.$t("asset.principal"), value: principal});
        return detail; */
    },
    add () {
      this.dc = this.newDc()
      this.rightBox.dc.show = true
    },
    newDc () {
      return JSON.parse(JSON.stringify(this.blankDc))
    },
    closeDcBox (refresh) {
      this.rightBox.dc.show = false
      if (refresh) {
        this.delFlag = true
        this.getTableData()
        bus.$emit('dc-list-change')
      }
    },
    closeTrafficBox (refresh) {
      this.rightBox.trafficSetting.show = false
      if (refresh) {
        this.delFlag = true
        this.getTableData()
      }
    },
    del (u) {
      this.$confirm(this.$t('tip.confirmDelete'), {
        confirmButtonText: this.$t('tip.yes'),
        cancelButtonText: this.$t('tip.no'),
        type: 'warning'
      }).then(() => {
        this.$delete('dc?ids=' + u.id).then(response => {
          if (response.code === 200) {
            this.delFlag = true
            this.$message({ duration: 1000, type: 'success', message: this.$t('tip.deleteSuccess') })
            this.getTableData()
            bus.$emit('dc-list-change')
          } else {
            this.$message.error(response.msg)
          }
        })
      })
    },
    statusChange (idc) {
      this.$put('dc', idc).then(response => {
        if (response.code === 200) {
          this.rightBox.show = false
          this.$message({ duration: 1000, type: 'success', message: this.$t('tip.saveSuccess') })
        } else {
          this.$message.error(response.msg)
        }
        this.getTableData()
      })
    },
    getTableData () {
      if (!this.hasButton('dc_view')) {
        this.$message.error(this.$t('tip.noAccess'))
        return
      }
      this.$set(this.searchLabel, 'pageNo', this.pageObj.pageNo)
      this.$set(this.searchLabel, 'pageSize', this.pageObj.pageSize)
      this.tools.loading = true
      this.$get('idc', this.searchLabel).then(response => {
        this.tools.loading = false
        if (response.code === 200) {
          this.tableData = response.data.list
          this.pageObj.total = response.data.total
          if (!this.scrollbarWrap) {
            this.$nextTick(() => {
              this.scrollbarWrap = this.$refs.dcTable.bodyWrapper
              this.toTopBtnHandler(this.scrollbarWrap)
            })
          }
        }
      })
    },
    getUserData () {
      return new Promise(resolve => {
        this.$get('sys/user', { pageSize: -1, pageNo: 1 }).then(response => {
          if (response.code === 200) {
            this.userData = response.data.list
          }
          resolve()
        })
      })
    },
    pageNo (val) {
      this.pageObj.pageNo = val
      this.getTableData()
    },
    pageSize (val) {
      localStorage.setItem('nz-pageSize-' + localStorage.getItem('nz-username') + '-' + this.tableId, val)
      this.pageObj.pageSize = val
      this.getTableData()
    },
    search (searchObj) {
      let orderBy = ''
      if (this.searchLabel.orderBy) {
        orderBy = this.searchLabel.orderBy
      }
      this.searchLabel = {}
      this.pageObj.pageNo = 1
      for (const item in searchObj) {
        if (searchObj[item]) {
          this.$set(this.searchLabel, item, searchObj[item])
        }
      }
      if (orderBy) {
        this.$set(this.searchLabel, 'orderBy', orderBy)
      }
      if (this.$refs.dcTable && this.$refs.dcTable.bodyWrapper) {
        this.$refs.dcTable.bodyWrapper.scrollTop = 0
      }
      this.getTableData()
    },
    showCabinet (dc) {
      this.bottomBox.targetTab = 'cabinet'
      this.bottomBox.dc = JSON.parse(JSON.stringify(dc))
      this.bottomBox.showSubList = true
    },
    sortableShow (label, form) {
      if (label === 'state') {
        return false
      }
      return this.$tableSet.sortableShow(label, form)
    },
    // 数据排序
    tableDataSort (item) {
      let orderBy = ''
      if (item.order === 'ascending') {
        orderBy = item.prop
      }
      if (item.order === 'descending') {
        orderBy = '-' + item.prop
      }
      this.$set(this.searchLabel, 'orderBy', orderBy)
      this.getTableData()
    },
    regNumTest (val) { // 校验是否是数字
      return regNum.test(val)
    },
    initEvent () {
      bus.$on('dc-list-change', () => {
        this.getTableData()
      })
    }
  },
  watch: {
    'bottomBox.dc': {
      deep: true,
      handler (n) {
        if (n.id) {
          this.bottomBox.dcDetail = this.convertToDetail(n)
        }
      }
    },
    'bottomBox.showSubList': function (n) {
      const vm = this
      this.$bottomBoxWindow.showSubListWatch(vm, n)
    },
    tableData: {
      deep: true,
      handler (n) {
        if (n.length === 0 && this.pageObj.pageNo > 1) {
          this.pageNo(this.pageObj.pageNo - 1)
        }

        if (!this.delFlag) { // 不是删除时回到顶部
          this.$refs.dcTable.bodyWrapper.scrollTop = 0
        } else {
          this.delFlag = false
        }
      }
    }
  },
  beforeDestroy () {
    bus.$off('dc-list-change')
    if (this.scrollbarWrap) {
      this.scrollbarWrap.removeEventListener('scroll', bus.debounce)
    };
  },
  created () {
    // 是否存在分页缓存
    const pageSize = localStorage.getItem('nz-pageSize-' + localStorage.getItem('nz-username') + '-' + this.tableId)
    if (pageSize != 'undefined' && pageSize != null) {
      this.pageObj.pageSize = pageSize
    }
  },
  destroyed () {

  },
  mounted () {
    this.getUserData()
    // 初始化表头
    this.tools.customTableTitle = localStorage.getItem('nz-tableTitle-' + localStorage.getItem('nz-username') + '-' + this.$route.path)
      ? JSON.parse(localStorage.getItem('nz-tableTitle-' + localStorage.getItem('nz-username') + '-' + this.$route.path))
      : this.tableTitle
    // this.tableTitleReset(this.tableTitle, this.tools.customTableTitle)
    this.getTableData()
    this.getAllDc();
  }
}
</script>
<style scoped>
  /deep/ td .nz-icon-gear:before{
    color: #606266;
  }
  .agent-dialog .agent-box{
    padding:10px;
  }

  .agent-box >.right-box-form>.el-form-item.half-form-item{
    width: 220px;
  }
  .agent-box >.right-box-form>.el-form-item.half-form-item:nth-child(odd){
    width: 220px;
  }

  .agent-box .download-url{
    height: 40px;
    position: relative;
  }
  .agent-box .download-url .url-copy{
    position: absolute;
    right: 10px;
    top: 5px;
  }
  .agent-box .download-url .url-copy i{
    font-size: 20px;
  }
  .agent-box .download-url pre code {
    border: 1px solid #ddd;
    border-radius: 0;
    font-family: "Courier New", Monaco, Menlo, Consolas, monospace;
    line-height: 40px;
    padding: 5px;
    white-space: nowrap;
    background-color: #F6F8FA;;
    color: #333;
  }

  .agent-box .download-url code {
    color: #333;
  }
</style>
