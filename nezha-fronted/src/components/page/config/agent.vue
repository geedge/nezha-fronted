<template>
  <div>
    <nz-data-list
      ref="dataList"
      :api="url"
      :custom-table-title.sync="tools.customTableTitle"
      :from="fromRoute.agent"
      :layout="['searchInput', 'elementSet', 'pagination']"
      :search-msg="searchMsg"
      @search="search"
    >
      <template v-slot:top-tool-right>
        <button id="prom-add" v-has="'agent_add'" :title="$t('overall.createPrometheusServer')" class="top-tool-btn margin-r-10"
                type="button" @click="add">
          <i class="nz-icon-create-square nz-icon"></i>
        </button>
        <button id="load-agent" class="top-tool-btn margin-r-10" type="button" @click="toDownloadAgent" v-has="'agent_edit'" :title="$t('overall.download')">
          <i class="nz-icon-download nz-icon"></i>
        </button>
        <delete-button
          ref="deleteButton"
          :from="'agent'"
          :forceDeleteShow="true"
          id="promserver-list-batch-delete"
          v-has="'agent_delete'"
          :delete-objs="batchDeleteObjs"
          api="agent"
          @after="getTableData"
          @before="delFlag=true"
        ></delete-button>
      </template>
      <template v-slot:default="slotProps">
        <agent-table
          ref="dataTable"
          :orderByFa="orderBy"
          v-my-loading="tools.loading"
          :loading="tools.loading"
          :api="url"
          :custom-table-title="tools.customTableTitle"
          :height="mainTableHeight"
          :table-data="tableData"
          @del="del"
          @edit="edit"
          @copy="copy"
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
    <el-dialog :title="$t('guide.downloadAgent')" :visible.sync="showAgentDownload" append-to-body class="nz-dialog agent-dialog" width="800px" @close="closeDialog">
      <div v-if="showAgentDownload" class="agent-box">
        <el-form v-model="agentParam" class="right-box-form right-box-form-left" label-position = "top" label-width="120px" size="small" style="width: 100%">
          <div class="right-box-sub-title">{{$t('overall.download')}}</div>
          <div style="margin-bottom: 20px;width: 100%"></div>
          <el-form-item :label="$t('config.agent.agent.osType')" class="half-form-item" prop="osType">
            <el-select v-model="agentParam.osType" class="right-box-row-with-btn" popper-class="right-box-select-top right-public-box-dropdown-top agent-select" placeholder="">
              <el-option v-for="item in osTypes" :key="item.name" :label="item.label" :value="item.name">
                <span class="panel-dropdown-label-txt" >{{item.label}}</span>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item   class="half-form-item">
            <button :class="{'nz-btn-disabled':downloadAgentFlag}" :disabled="downloadAgentFlag" class="nz-btn nz-btn-size-normal nz-btn-style-normal" type="button" @click="downloadAgent">{{$t('overall.download')}}</button>
          </el-form-item>
          <div class="right-box-sub-title">{{$t('config.agent.agent.autoScript')}}</div>
          <div style="margin-bottom: 20px;width: 100%"></div>

          <el-form-item :label="$t('overall.dc')" class="half-form-item" prop="dc">
            <el-select v-model="agentParam.dc" class="right-box-row-with-btn" popper-class="right-box-select-top right-public-box-dropdown-top agent-select" placeholder="">
              <el-option v-for="item in allDc" :key="item.id" :label="item.name" :value="item.id">
                <span class="panel-dropdown-label-txt" >{{item.name}}</span>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('config.agent.agent.type')" class="half-form-item" prop="type">
            <el-select v-model="agentParam.type" class="right-box-row-with-btn" popper-class="right-box-select-top right-public-box-dropdown-top agent-select" placeholder="">
              <el-option v-for="item in agent2.theData" :key="item.value" :label="$t(item.label)" :value="item.value" :disabled="federationEnabled && item.value == 2">
                <span class="panel-dropdown-label-txt" >{{item.label}}</span>
              </el-option>
            </el-select>
          </el-form-item>
           <el-form-item label="CURL"  v-if="loadFinish" class="download-url">
            <el-input id="download-url-curl" :disabled="true" v-model="curlUrl">
              <el-popover :content="$t('overall.copySuccess')" disabled="false" placement="top" trigger="manual" v-model="curlVisible" popper-class="small-pop" slot="suffix" @after-enter="popShow('curl')"  style="cursor: pointer">
                <i v-if="curlUrl" slot="reference" class="nz-icon nz-icon-override" @click="onCopy(curlUrl)" :title="$t('overall.copyText')"></i>
              </el-popover>
            </el-input>
          </el-form-item>
          <el-form-item label="Wget"  v-if="loadFinish" class="download-url">
            <el-input id="download-url-wget" :disabled="true" v-model="wgetUrl" >
              <el-popover :content="$t('overall.copySuccess')" disabled="false" placement="top" trigger="manual" v-model="wgetVisible" popper-class="small-pop" slot="suffix" @after-enter="popShow('wget')" style="cursor: pointer">
                <i v-if="wgetUrl" slot="reference" class="nz-icon nz-icon-override" @click="onCopy(wgetUrl)" :title="$t('overall.copyText')"></i>
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
      return 'wget -qO- --no-check-certificate --header="Authorization:' + this.token + '" ' + this.ipAddr + '/agent/' + this.agentParam.dc + '/' + this.agentParam.type + '/install.sh | sudo -E bash'
    },
    curlUrl () {
      return 'curl -o- -k -H "Authorization:' + this.token + '" ' + this.ipAddr + '/agent/' + this.agentParam.dc + '/' + this.agentParam.type + '/install.sh | sudo -E bash'
    }
  },
  data () {
    return {
      url: 'agent',
      tableId: 'promTable', // 需要分页的table的id，用于记录每页数量
      blankObject: {
        id: '',
        name: '',
        host: '',
        port: 10090,
        dc: { id: '', name: '', location: '' },
        protocol: 'http'
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
        },
        {
          name: this.$t('overall.name'),
          type: 'input',
          label: 'name',
          disabled: false
        }, {
          name: this.$t('overall.dc'),
          type: 'dc',
          label: 'dcIds',
          disabled: false
        }, {
          name: this.$t('overall.type'),
          type: 'select',
          label: 'promType',
          readonly: true,
          disabled: false
        }, {
          name: this.$t('overall.state'),
          type: 'select',
          label: 'promState',
          readonly: true,
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
      federationEnabled: !Number(localStorage.getItem('nz-prometheus-federation-enabled')),
      downloadAgentFlag: false
    }
  },
  methods: {
    toDownloadAgent: function () {
      this.getAllDc()
      this.showAgentDownload = true
      this.token = localStorage.getItem('nz-token')
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
      } else {
        this.wgetVisible = true
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
      this.downloadAgentFlag = true
      axios.get('agent/download?os=' + this.agentParam.osType, { responseType: 'blob' }).then(data => {
        this.downloadAgentFlag = false
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
      }).catch(() => {
        this.downloadAgentFlag = false
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
