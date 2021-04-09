<template>
  <div style="height: 100%">
    <nz-data-list
      ref="dataList"
      :components="['searchInput', 'elementSet']"
      :custom-table-title.sync="tools.customTableTitle"
      :from="fromRoute.promServer"
      :search-msg="searchMsg"
      :table-id="tableId"
      :table-title="tableTitle">
      <template v-slot:top-tool-right>
        <button id="prom-add" v-has="'prom_toAdd'" :title="$t('overall.createPrometheusServer')" class="top-tool-btn margin-l-20"
                type="button" @click="add">
          <i class="nz-icon-create-square nz-icon"></i>
        </button>
        <button :title="$t('overall.createDatacenter')" @click="toDownloadAgent" type="button" id="load-agent" class="top-tool-btn margin-l-20">
          <i class="nz-icon-download nz-icon"></i>
        </button>
        <delete-button id="promserver-list-batch-delete" v-has="'prom_delete'" :delete-objs="batchDeleteObjs" api="agent" @after="getTableData" @before="delFlag=true"></delete-button>
      </template>
      <template v-slot:default="slotProps">
        <el-table ref="dataTable"
                  v-loading="tools.loading"
                  :data="tableData"
                  :height="mainTableHeight"
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
          <el-table-column v-for="(item, index) in tools.customTableTitle" v-if="item.show"
                           :key="`col-${index}`"
                           :label="item.label"
                           :prop="propTitle(item.prop, fromRoute.promServer)"
                           :resizable="true"
                           :sort-orders="['ascending', 'descending']"
                           :sortable="sortableShow(item.prop, fromRoute.promServer)">
            <template slot="header">
              <span>
                <span>{{item.label}}</span>
                <div class="col-resize-area"></div>
              </span>
            </template>
            <template slot-scope="scope" :column="item">
              <span v-if="item.prop === 'idc'" >{{scope.row[item.prop]?scope.row[item.prop].name:'-'}}</span>

              <span v-else-if="item.prop === 'type'">
                {{findServerType(scope.row[item.prop]).text}}
              </span>
              <span v-else-if="item.prop === 'checkTime'">{{utcTimeToTimezoneStr(scope.row[item.prop])}}</span>
              <span v-else-if="item.prop === 'status'">
                <el-popover :content="$t('asset.assetStatPre')+(scope.row.checkTime?utcTimeToTimezoneStr(scope.row.checkTime):$t('asset.assetStatDown'))" placement="right" trigger="hover" width="200">
                  <div slot="reference" style="width: 20px">
                    <div :class="{'active-icon green':scope.row[item.prop] == '1','active-icon red':scope.row[item.prop] == '0' || scope.row[item.prop] == '-1' || scope.row[item.prop] == '-2'}"></div>
                  </div>
                </el-popover>
              </span>
              <span v-else-if="scope.row[item.prop]">{{scope.row[item.prop]}}</span>
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
                  <el-dropdown-item :command="['delete', scope.row, `agent?ids=${scope.row.id}`]" :disabled="isBuildIn(scope.row)"><i class="nz-icon nz-icon-delete"></i><span class="operation-dropdown-text">{{$t('overall.delete')}}</span></el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </div>
          </el-table-column>
        </el-table>
        <!-- 回到table顶部的按钮 -->
        <button v-show="tools.showTopBtn && slotProps.mainResizeShow" id="account-list-totop" :class="{'to-top-is-hover': tools.tableHover}" :style="{top: tools.toTopBtnTop}" class="to-top" @click="toTop(scrollbarWrap)"><i class="nz-icon nz-icon-top"></i></button>
      </template>
      <!-- 分页组件 -->
      <template v-slot:pagination>
        <Pagination ref="Pagination" :pageObj="pageObj" :tableId="tableId" @pageNo='pageNo' @pageSize='pageSize'></Pagination>
      </template>
    </nz-data-list>
    <transition name="right-box">
      <prom-server-box v-if="rightBox.show" :prom-server="object" @close="closeRightBox"></prom-server-box>
    </transition>
    <el-dialog :visible.sync="showAgentDownload" width="620px" append-to-body class="nz-dialog agent-dialog" @close="closeDialog" :title="$t('config.promServer.agent.title')">
      <div class="agent-box" v-if="showAgentDownload">
        <el-form size="small" v-model="agentParam" class="right-box-form  right-box-form-left" label-position = "top" label-width="120px" style="width: 100%">
          <div class="right-box-sub-title">{{$t('config.promServer.agent.download')}}</div>
          <div style="margin-bottom: 20px;width: 100%"></div>
          <el-form-item :label="$t('config.promServer.agent.osType')" prop="osType" class="half-form-item">
            <el-select class="right-box-row-with-btn" placeholder="" v-model="agentParam.osType">
              <el-option :key="item.name" :label="item.label" :value="item.name" v-for="item in osTypes">
                <span class="panel-dropdown-label-txt" >{{item.label}}</span>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item   class="half-form-item">
            <button type="button" class="nz-btn nz-btn-size-normal-new nz-btn-style-normal-new" @click="downloadAgent">{{$t('config.promServer.agent.download')}}</button>
          </el-form-item>
          <div class="right-box-sub-title">{{$t('config.promServer.agent.autoScript')}}</div>
          <div style="margin-bottom: 20px;width: 100%"></div>

          <el-form-item :label="$t('config.dc.dc')" prop="dc" class="half-form-item">
            <el-select class="right-box-row-with-btn" placeholder="" v-model="agentParam.dc">
              <el-option :key="item.id" :label="item.name" :value="item.id" v-for="item in allDc">
                <span class="panel-dropdown-label-txt" >{{item.name}}</span>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('config.promServer.agent.type')" prop="type" class="half-form-item">
            <el-select class="right-box-row-with-btn" placeholder="" v-model="agentParam.type">
              <el-option :key="item.value" :label="item.label" :value="item.value" v-for="item in $CONSTANTS.promServer2.theData">
                <span class="panel-dropdown-label-txt" >{{item.label}}</span>
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>
        <div class="download-url" v-if="loadFinish">
          <el-input id="download-url-curl" :disabled="true" v-model="curlUrl">
            <el-popover :content="$t('tip.copySuccess')" placement="top" trigger="manual" v-model="curlVisible" popper-class="small-pop" slot="suffix" @after-enter="popShow('curl')">
              <i slot="reference" class="nz-icon nz-icon-override" @click="copyUrl('download-url-curl')"></i>
            </el-popover>
          </el-input>
        </div>
        <div class="download-url" v-if="loadFinish">
          <el-input id="download-url-wget" :disabled="true" v-model="wgetUrl">
            <el-popover :content="$t('tip.copySuccess')" placement="top" trigger="manual" v-model="wgetVisible" popper-class="small-pop" slot="suffix" @after-enter="popShow('wget')">
              <i slot="reference" class="nz-icon nz-icon-override" @click="copyUrl('download-url-wget')"></i>
            </el-popover>
          </el-input>
        </div>
      </div>
    </el-dialog>
  </div>

</template>
<script>
import deleteButton from '@/components/common/deleteButton'
import promServerBox from '@/components/common/rightBox/promServerBox'
import { promServer } from '@/components/common/js/constants'
import nzDataList from '@/components/common/table/nzDataList'
import tableMixin from '@/components/common/mixin/table'
import axios from 'axios'
import Vue from 'vue'
export default {
  name: 'promServer',
  components: {
    nzDataList,
    promServerBox,
    deleteButton
  },
  mixins: [tableMixin],
  computed:{
    wgetUrl:function(){
      return 'wget -qO- --header="Authorization:'+this.token+'" http://'+this.ipAddr+'/agent/'+this.agentParam.dc+'/'+this.agentParam.type+'/install.sh | bash'
    },
    curlUrl:function(){
      return 'curl -o- -H "Authorization:'+this.token+'" http://'+this.ipAddr+'/agent/'+this.agentParam.dc+'/'+this.agentParam.type+'/install.sh | bash'
    }
  },
  data () {
    return {
      tableId: 'promTable', // 需要分页的table的id，用于记录每页数量
      blankObject: {
        id: '',
        host: '',
        port: 9090,
        idc: { id: '', name: '', location: '' }
      },
      tableTitle: [
        {
          label: 'ID',
          prop: 'id',
          show: true,
          width: 80
        }, {
          label: this.$t('config.dc.dc'),
          prop: 'idc',
          show: true
        }, {
          label: 'Host',
          prop: 'host',
          show: true
        }, {
          label: 'Port',
          prop: 'port',
          show: true
        }, {
          label: this.$t('config.promServer.type'),
          prop: 'type',
          show: true
        }, {
          label: this.$t('asset.state'),
          prop: 'status',
          show: true
        }, {
          label: this.$t('config.promServer.checkTime'),
          prop: 'checkTime',
          show: false
        }
      ],
      tableData: [],
      dcData: [],
      searchMsg: { // 给搜索框子组件传递的信息
        zheze_none: true,
        searchLabelList: [{
          id: 1,
          name: 'ID',
          type: 'input',
          label: 'id',
          disabled: false
        }, {
          id: 5,
          name: this.$t('config.promServer.dataCenter'),
          type: 'dc',
          label: 'dc',
          disabled: false
        }, {
          id: 6,
          name: this.$t('config.promServer.type'),
          type: 'select',
          label: 'promType',
          disabled: false
        }, {
          id: 8,
          name: this.$t('project.endpoint.host'),
          type: 'input',
          label: 'host',
          disabled: false
        }, {
          id: 9,
          name: this.$t('project.endpoint.port'),
          type: 'input',
          label: 'port',
          disabled: false
        }]
      },
      promServerType: null,
      showAgentDownload: false,
      token: '',
      ipAddr: '',
      allDc: [],
      loadFinish: false,
      osTypes: [{
        label: 'Centos',
        name: 'centos'
      },
      {
        label: 'Ubuntu',
        name: 'ubuntu'
      }],
      agentParam: {
        osType: 'centos',
        dc: '',
        type: 1
      },
      wgetVisible:false,
      curlVisible:false,
    }
  },
  methods: {
    toDownloadAgent: function () {
      this.showAgentDownload = true
      this.token = sessionStorage.getItem('nz-token')
      const reg = /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/
      const configUrl = 'static/config.json?Timestamp=' + new Date().getTime()
      Vue.http.get(configUrl).then(res => {
        if(reg.test(res.body.baseUrl)){
          this.ipAddr = reg.exec(res.body.baseUrl)[0]
        }else{
          this.ipAddr = reg.exec(window.location.href)[0]
        }
      })
    },
    closeDialog: function () {
      this.showAgentDownload = false
    },
    getAllDc: function () {
      this.$get('idc?pageSize=-1').then(response => {
        this.tools.loading = false
        if (response.code === 200) {
          this.allDc = response.data.list
          this.loadFinish = true
          this.agentParam.dc = this.allDc[0].id
        }
      })
    },
    copyUrl: function (id) {

      const input = document.createElement('input')
      const text = document.getElementById(id).value;
      document.body.appendChild(input)
      input.setAttribute('value', text)
      input.select()
      if (document.execCommand('copy')) {
        document.execCommand('copy')
      }
      document.body.removeChild(input)

      if(id.indexOf('curl') != -1){
        this.curlVisible = true
        console.log("open curl")
        // let timeout = setTimeout(()=>{
        //   this.curlVisible = false;
        //   clearTimeout(timeout)
        // },1000)
      }else{
        this.wgetVisible = true
        // let timeout = setTimeout(()=>{
        //   this.wgetVisible = false;
        //   clearTimeout(timeout)
        // },1000)

      }
    },
    popShow:function(where){
      const self = this
      if(where == 'curl'){
        let timeout = setTimeout(()=>{
          self.curlVisible = false;
          clearTimeout(timeout)
        },1000)
      }else{
        let timeout = setTimeout(()=>{
          self.wgetVisible = false;
          clearTimeout(timeout)
        },1000)
      }
    },
    downloadAgent: function () {
      axios.get('agent/download?os=' + this.agentParam.osType, { responseType: 'blob' }).then(data => {
        let fileName = 'confagent'
        const disposition = data.headers['content-disposition']
        if (disposition) {
          fileName = disposition.split(';')[1].split('filename=')[1]
        }
        // 由于ie不支持download属性，故需要做兼容判断
        if (navigator.appVersion.toString().indexOf('.NET') > 0) {
          // ie独有的msSaveBlob属性，data.data为Blob文件流
          window.navigator.msSaveBlob(data.data, fileName)
        } else {
          // 以下流程即为文章开始的下载流程
          const url = window.URL.createObjectURL(data.data)
          const link = document.createElement('a')
          link.style.display = 'none'
          link.href = url
          link.download = fileName
          document.body.appendChild(link)
          link.click()
          window.URL.revokeObjectURL(link.href)
        }
      })
    },
    propShow:function(){

    },
    getTableData () {
      if (!this.hasButton('prom_view')) {
        this.$message.error(this.$t('tip.noAccess'))
        return
      }
      this.$set(this.searchLabel, 'pageNo', this.pageObj.pageNo)
      this.$set(this.searchLabel, 'pageSize', this.pageObj.pageSize)
      this.loading = true
      this.$get('agent', this.searchLabel).then(response => {
        this.loading = false
        if (response.code === 200) {
          for (let i = 0; i < response.data.list.length; i++) {
            for (let j = 0; j < this.dcData.length; j++) {
              if (response.data.list[i].idcId == this.dcData[j].id) {
                response.data.list[i].idc = this.dcData[j]
                break
              }
            }
          }
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
    // 获取dc数据
    getDcData () {
      return new Promise(resolve => {
        this.$get('idc', { pageSize: -1 }).then(response => {
          if (response.code === 200) {
            this.dcData = response.data.list
          }
          resolve()
        })
      })
    },
    findServerType (type) {
      if (!this.promServerType) {
        this.promServerType = []
        promServer.theData.forEach(item => {
          this.promServerType = this.promServerType.concat(item.children)
        })
      }
      return this.promServerType.find(item => {
        return item.value == type
      })
    }
  },
  mounted () {
    // 初始化数据
    Promise.all([this.getDcData()]).then(response => {
      this.getTableData()
    })
    this.getAllDc()
  }
}
</script>
<style scoped>
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
    margin-bottom: 10px;
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
    padding: 5px 20px 5px 5px;
    white-space: nowrap;
    background-color: #F6F8FA;;
    color: #333;
  }

  .agent-box .download-url code {
    color: #333;
  }

</style>
<style>
  .download-url > .el-input.is-disabled .el-input__inner{
    background-color: #F6F8FA;;
    border-color: #E4E7ED;
    color: #333;
    cursor: text;
  }
  .download-url  .el-input__suffix {
    position: absolute;
    top: 8px;
    -webkit-transition: all .3s;
    height: 100%;
    color: #333;
    text-align: center;
  }
</style>
