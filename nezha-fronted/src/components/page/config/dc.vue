<template>
  <div style="height: 100%">
    <nz-data-list
      ref="dataList"
      :components="['searchInput', 'elementSet']"
      :custom-table-title.sync="tools.customTableTitle"
      :from="fromRoute.dc"
      :search-msg="searchMsg"
      :table-id="tableId"
      :table-title="tableTitle">
      <template v-slot:top-tool-right>
        <button id="dc-add" v-has="'dc_toAdd'" :title="$t('overall.createDatacenter')" class="top-tool-btn margin-l-20"
                type="button" @click="add">
          <i class="nz-icon-create-square nz-icon"></i>
        </button>
        <delete-button id="account-list-batch-delete" v-has="'dc_delete'" :delete-objs="batchDeleteObjs" api="dc" @after="getTableData" @before="delFlag=true"></delete-button>
      </template>
      <template v-slot:default="slotProps">
        <el-table
          id="dc-list-table"
          ref="dataTable"
          v-loading="tools.loading"
          :data="tableData"
          :height="mainTableHeight"
          :cell-class-name="assetStatClassName"
          border
          @header-dragend="dragend"
          @sort-change="tableDataSort"
          @selection-change="(selection)=>{batchDeleteObjs=selection}"
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
            :fixed="item.fixed"
            :label="item.label"
            :prop="item.prop"
            :resizable="true"
            :sort-orders="['ascending', 'descending']"
            :sortable="sortableShow(item.prop, fromRoute.dc)"
            :width="`${item.width}`"
            class="data-column"
          >
            <template slot="header">
              <span>
                <span>{{item.label}}</span>
                <div class="col-resize-area"></div>
              </span>
            </template>
            <template slot-scope="scope" :column="item">
              <template v-if="item.prop === 'principal'">
                <template v-if="scope.row.principal">
                  <template v-for="item in userData">
                    <template v-if="scope.row.principal == item.userId">{{item.username}}</template>
                  </template>
                </template>
                <template v-else>-</template>
              </template>
              <template v-else-if="item.prop === 'state'">
                <el-switch
                  v-model="scope.row.state"
                  :disabled="!hasButton('dc_toEdit') || !hasButton('dc_toEdit')"
                  active-color="#ee9d3f"
                  active-value="ON"
                  inactive-value="OFF"
                  @change="(val)=>{statusChange(scope.row)}"
                />
              </template>
              <template v-else-if="item.prop === 'longitude'">
                <template v-if="regNumTest(scope.row.longitude)">{{scope.row.longitude}}</template>
                <template v-else>-</template>
              </template>
              <template v-else-if="item.prop === 'latitude'">
                <template v-if="regNumTest(scope.row.latitude)">{{scope.row.latitude}}</template>
                <template v-else>-</template>
              </template>
              <template v-else-if="item.prop === 'assetStat' && scope.row.assetStat">
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
              <template v-else-if="item.prop === 'cabinetNum'">
                <span class="link" @click="$refs.dataList.showBottomBox('cabinet', scope.row)">{{scope.row[item.prop]}}</span>
              </template>
              <template v-else-if="scope.row[item.prop]">{{scope.row[item.prop]}}</template>
              <template v-else>-</template>
            </template>
          </el-table-column>
          <el-table-column
            :resizable="false"
            :width="operationWidth"
            fixed="right">
            <div slot="header" class="table-operation-title">{{$t('overall.option')}}</div>
            <div slot-scope="scope" class="table-operation-items">
              <button class="table-operation-item" @click="$refs.dataList.showBottomBox('operationLog', scope.row)"><i class="nz-icon nz-icon-view1"></i></button>
              <el-dropdown size="medium" trigger="hover" @command="tableOperation">
                <div class="table-operation-item table-operation-item--more">
                  <span>…</span><i class="nz-icon nz-icon-arrow-down"></i>
                </div>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item :command="['edit', scope.row]" :disabled="isBuildIn(scope.row)"><i class="nz-icon nz-icon-edit"></i><span class="operation-dropdown-text">{{$t('overall.edit')}}</span></el-dropdown-item>
                  <el-dropdown-item :command="['delete', scope.row, `dc?ids=${scope.row.id}`]" :disabled="isBuildIn(scope.row)"><i class="nz-icon nz-icon-delete"></i><span class="operation-dropdown-text">{{$t('overall.delete')}}</span></el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </div>
          </el-table-column>
        </el-table>
        <!-- 回到table顶部的按钮 -->
        <button v-show="tools.showTopBtn && slotProps.mainResizeShow" id="dc-list-totop" :class="{'to-top-is-hover': tools.tableHover}" :style="{top: tools.toTopBtnTop}" class="to-top" @click="toTop(scrollbarWrap)"><i class="nz-icon nz-icon-top"></i></button>
      </template>
      <!-- 分页组件 -->
      <template v-slot:pagination>
        <Pagination ref="Pagination" :pageObj="pageObj" :tableId="tableId" @pageNo='pageNo' @pageSize='pageSize'></Pagination>
      </template>
    </nz-data-list>
    <transition name="right-box">
      <dc-box v-if="rightBox.dc.show" :dc="object" :user-data="userData" @close="closeDcBox" @reload="getTableData"></dc-box>
    </transition>
    <transition name="right-box">
      <traffic-setting-box v-if="rightBox.trafficSetting.show" ref="trafficBox" :dc="object" @close="closeTrafficBox"></traffic-setting-box>
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
import bus from '@/libs/bus'
import dcBox from '@/components/common/rightBox/dcBox' // dc弹框
import trafficSettingBox from '@/components/common/rightBox/trafficSetting/trafficSettingBox'
import deleteButton from '@/components/common/deleteButton'
import nzDataList from '@/components/common/table/nzDataList'
import tableMixin from '@/components/common/mixin/table'
const regNum = /^[0-9]+.?[0-9]*/
export default {
  name: 'dc',
  components: {
    trafficSettingBox,
    dcBox,
    deleteButton,
    nzDataList
  },
  mixins: [tableMixin],
  data () {
    return {
      tableId: 'dcTable', // 需要分页的table的id，用于记录每页数量
      object: {},
      blankObject: {
        id: '',
        name: '',
        location: '',
        tel: '',
        principal: '',
        state: 'ON',
        longitude: undefined,
        latitude: undefined
      },
      rightBox: {
        dc: { show: false },
        trafficSetting: { show: false }
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
      tabShow: 1, // 控制显示一级页面和二级页面 1 dc 2cabinet
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
      },
      userData: []
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
    detail (u) {
      this.bottomBox.object = JSON.parse(JSON.stringify(u))
      if (!this.bottomBox.object.area) {
        this.$set(this.bottomBox.object, 'area', { id: '', name: '' })
      }
      this.bottomBox.targetTab = 'detail'
      this.bottomBox.showSubList = true
    },
    add () {
      this.object = this.newObject()
      this.rightBox.dc.show = true
    },
    closeDcBox (refresh) {
      this.rightBox.dc.show = false
      if (refresh) {
        this.delFlag = true
        this.getTableData()
      }
    },
    closeTrafficBox (refresh) {
      this.rightBox.trafficSetting.show = false
      if (refresh) {
        this.delFlag = true
        this.getTableData()
      }
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
      this.$get('dc', this.searchLabel).then(response => {
        this.tools.loading = false
        if (response.code === 200) {
          this.tableData = response.data.list
          this.pageObj.total = response.data.total
          if (!this.scrollbarWrap) {
            this.$nextTick(() => {
              this.scrollbarWrap = this.$refs.dataTable.bodyWrapper
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
    regNumTest (val) { // 校验是否是数字
      return regNum.test(val)
    },
    initEvent () {
      bus.$on('dc-list-change', () => {
        this.getTableData()
      })
    }
  },
  beforeDestroy () {
    bus.$off('dc-list-change')
  },
  mounted () {
    this.getUserData()
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
