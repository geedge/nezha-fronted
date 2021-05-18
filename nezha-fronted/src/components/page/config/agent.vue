<template>
  <div>
    <nz-data-list
      ref="dataList"
      :api="url"
      :custom-table-title.sync="tools.customTableTitle"
      :from="fromRoute.agent"
      :layout="['searchInput', 'elementSet']"
      :search-msg="searchMsg"
      @search="search"
    >
      <template v-slot:top-tool-right>
        <button id="prom-add" v-has="'agent_add'" :title="$t('overall.createPrometheusServer')" class="top-tool-btn margin-r-10"
                type="button" @click="add">
          <i class="nz-icon-create-square nz-icon"></i>
        </button>
        <button id="load-agent" class="top-tool-btn margin-r-10" type="button" @click="toDownloadAgent" v-has="'agent_add'">
          <i class="nz-icon-download nz-icon"></i>
        </button>
        <delete-button id="promserver-list-batch-delete" v-has="'agent_delete'" :delete-objs="batchDeleteObjs" api="agent" @after="getTableData" @before="delFlag=true"></delete-button>
      </template>
      <template v-slot:default="slotProps">
        <agent-table
          ref="dataTable"
          v-loading="tools.loading"
          :api="url"
          :custom-table-title="tools.customTableTitle"
          :height="mainTableHeight"
          :table-data="tableData"
          @del="del"
          @edit="edit"
          @orderBy="tableDataSort"
          @reload="getTableData"
          @selectionChange="selectionChange"
          @showBottomBox="(targetTab, object) => { $refs.dataList.showBottomBox(targetTab, object) }"></agent-table>
      </template>
      <!-- 分页组件 -->
      <template v-slot:pagination>
        <Pagination ref="Pagination" :pageObj="pageObj" :tableId="tableId" @pageNo='pageNo' @pageSize='pageSize'></Pagination>
      </template>
    </nz-data-list>
    <transition name="right-box">
      <agent-box v-if="rightBox.show" :agent="object" @close="closeRightBox"></agent-box>
    </transition>
    <el-dialog :title="$t('config.agent.agent.title')" :visible.sync="showAgentDownload" append-to-body class="nz-dialog agent-dialog" width="800px" @close="closeDialog">
      <div v-if="showAgentDownload" class="agent-box">
        <el-form v-model="agentParam" class="right-box-form  right-box-form-left" label-position = "top" label-width="120px" size="small" style="width: 100%">
          <div class="right-box-sub-title">{{$t('config.agent.agent.download')}}</div>
          <div style="margin-bottom: 20px;width: 100%"></div>
          <el-form-item :label="$t('config.agent.agent.osType')" class="half-form-item" prop="osType">
            <el-select v-model="agentParam.osType" class="right-box-row-with-btn" placeholder="">
              <el-option v-for="item in osTypes" :key="item.name" :label="item.label" :value="item.name">
                <span class="panel-dropdown-label-txt" >{{item.label}}</span>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item   class="half-form-item">
            <button class="nz-btn nz-btn-size-normal-new nz-btn-style-normal-new" type="button" @click="downloadAgent">{{$t('config.agent.agent.download')}}</button>
          </el-form-item>
          <div class="right-box-sub-title">{{$t('config.agent.agent.autoScript')}}</div>
          <div style="margin-bottom: 20px;width: 100%"></div>

          <el-form-item :label="$t('config.dc.dc')" class="half-form-item" prop="dc">
            <el-select v-model="agentParam.dc" class="right-box-row-with-btn" placeholder="">
              <el-option v-for="item in allDc" :key="item.id" :label="item.name" :value="item.id">
                <span class="panel-dropdown-label-txt" >{{item.name}}</span>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('config.agent.agent.type')" class="half-form-item" prop="type">
            <el-select v-model="agentParam.type" class="right-box-row-with-btn" placeholder="">
              <el-option v-for="item in agent2.theData" :key="item.value" :label="item.label" :value="item.value" :disabled="federationEnabled && item.value == 2">
                <span class="panel-dropdown-label-txt" >{{item.label}}</span>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="cURL"  v-if="loadFinish" class="download-url">
            <el-input id="download-url-curl" :disabled="true" v-model="curlUrl">
              <el-popover :content="$t('tip.copySuccess')" placement="top" trigger="manual" v-model="curlVisible" popper-class="small-pop" slot="suffix" @after-enter="popShow('curl')">
                <i slot="reference" class="nz-icon nz-icon-override" @click="copyUrl('download-url-curl')"></i>
              </el-popover>
            </el-input>
          </el-form-item>
          <el-form-item label="Wget"  v-if="loadFinish" class="download-url">
            <el-input id="download-url-wget" :disabled="true" v-model="wgetUrl">
              <el-popover :content="$t('tip.copySuccess')" placement="top" trigger="manual" v-model="wgetVisible" popper-class="small-pop" slot="suffix" @after-enter="popShow('wget')">
                <i slot="reference" class="nz-icon nz-icon-override" @click="copyUrl('download-url-wget')"></i>
              </el-popover>
            </el-input>
          </el-form-item>
        </el-form>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import deleteButton from '@/components/common/deleteButton'
import agentBox from '@/components/common/rightBox/agentBox'
import { agent, agent2 } from '@/components/common/js/constants'
import nzDataList from '@/components/common/table/nzDataList'
import dataListMixin from '@/components/common/mixin/dataList'
import agentTable from '@/components/common/table/settings/agentTable'
import axios from 'axios'
export default {
  name: 'agent',
  components: {
    nzDataList,
    agentBox,
    agentTable,
    deleteButton
  },
  mixins: [dataListMixin],
  computed: {
    wgetUrl () {
      return 'wget -qO- --header="Authorization:' + this.token + '" ' + this.ipAddr + '/agent/' + this.agentParam.dc + '/' + this.agentParam.type + '/install.sh | bash'
    },
    curlUrl () {
      return 'curl -o- -H "Authorization:' + this.token + '" ' + this.ipAddr + '/agent/' + this.agentParam.dc + '/' + this.agentParam.type + '/install.sh | bash'
    }
  },
  data () {
    return {
      url: 'agent',
      tableId: 'promTable', // 需要分页的table的id，用于记录每页数量
      blankObject: {
        id: '',
        host: '',
        port: 9090,
        dc: { id: '', name: '', location: '' }
      },
      agent: agent,
      agent2: agent2,
      dcData: [],
      searchMsg: { // 给搜索框子组件传递的信息
        zheze_none: true,
        searchLabelList: [{
          name: 'ID',
          type: 'input',
          label: 'ids',
          disabled: false
        }, {
          name: this.$t('config.agent.dataCenter'),
          type: 'dc',
          label: 'dc',
          disabled: false
        }, {
          name: this.$t('config.agent.type'),
          type: 'select',
          label: 'promType',
          disabled: false
        }, {
          name: this.$t('state.state'),
          type: 'select',
          label: 'promState',
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
      }
      //   {
        //   label: 'Ubuntu',
        //   name: 'ubuntu'
        // }
      ],
      agentParam: {
        osType: 'centos',
        dc: '',
        type: 1
      },
      wgetVisible: false,
      curlVisible: false,
      federationEnabled: !Number(localStorage.getItem('nz-prometheus-federation-enabled'))
    }
  },
  methods: {
    toDownloadAgent: function () {
      this.getAllDc()
      this.showAgentDownload = true
      this.token = sessionStorage.getItem('nz-token')
      axios.get('/healthy').then(response => {
        const url = response.request.responseURL
        this.ipAddr = url.split('/healthy')[0]
      })
    },
    closeDialog: function () {
      this.showAgentDownload = false
    },
    getAllDc () {
      this.$get('dc?pageSize=-1').then(response => {
        this.tools.loading = false
        if (response.code === 200) {
          this.allDc = response.data.list
          if (this.allDc && this.allDc.length > 0) {
            this.loadFinish = true
            this.agentParam.dc = this.allDc[0].id
          }
        }
      })
    },
    copyUrl (id) {
      const input = document.createElement('input')
      const text = document.getElementById(id).value
      document.body.appendChild(input)
      input.setAttribute('value', text)
      input.select()
      if (document.execCommand('copy')) {
        document.execCommand('copy')
      }
      document.body.removeChild(input)

      if (id.indexOf('curl') != -1) {
        this.curlVisible = true
        // let timeout = setTimeout(()=>{
        //   this.curlVisible = false;
        //   clearTimeout(timeout)
        // },1000)
      } else {
        this.wgetVisible = true
        // let timeout = setTimeout(()=>{
        //   this.wgetVisible = false;
        //   clearTimeout(timeout)
        // },1000)
      }
    },
    popShow: function (where) {
      const self = this
      if (where == 'curl') {
        const timeout = setTimeout(() => {
          self.curlVisible = false
          clearTimeout(timeout)
        }, 1000)
      } else {
        const timeout = setTimeout(() => {
          self.wgetVisible = false
          clearTimeout(timeout)
        }, 1000)
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
    }
  },
  mounted () {
  },
  watch: {
    $route: {
      immediate: true,
      handler () {
        // 是否弹出侧滑
        const add = this.$route.query.add
        const download = this.$route.query.download
        if (add) {
          if (add === 'agent') {
            this.add()
          }
        }
        if (download) {
          this.toDownloadAgent()
        }
      }
    }
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
      margin-left: 12px !important;
  }
  .agent-box .download-url .url-copy{

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
  .download-url  .el-input.is-disabled .el-input__inner{
    background-color: #F6F8FA;;
    border-color: #E4E7ED;
    color: #333;
    cursor: text;
  }
  .download-url  .el-input__suffix {
    position: absolute;
    -webkit-transition: all .3s;
    height: 100%;
    color: #333;
    text-align: center;
  }
</style>
