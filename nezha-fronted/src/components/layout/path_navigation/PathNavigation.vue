<template>
  <div class="navigation">
    <el-dialog title="Get started in 6 steps" :visible.sync="show" center>
      <el-tabs type="border-card">
        <el-tab-pane>
          <span slot="label"
            ><i class="nz-icon nz-icon-datacenter1"></i>Datacenter</span
          >
          <div>
            <div>1</div>
            <div>2</div>
          </div>
          <el-button @click="addDatacenter">Add Datacenter</el-button>
          <el-button @click="addCabinet">Add Cabinet</el-button>
        </el-tab-pane>
        <el-tab-pane>
          <span slot="label"
            ><i class="nz-icon nz-icon-agent"></i>Agent</span
          >
          <div>
            <div>1</div>
            <div>2</div>
          </div>
          <el-button @click="addAgent">Add Agent</el-button>
          <el-button @click="DownloadAgent">Download agent</el-button>
        </el-tab-pane>
        <el-tab-pane>
          <span slot="label"
            ><i class="nz-icon nz-icon-menu-assets"></i>Asset</span
          >
          <div>
            <div>1</div>
            <div>2</div>
          </div>
          <el-button @click="addAsset">Add Asset</el-button>
          <el-button @click="importAsset">Import asset</el-button>
          <el-button @click="webTerminal">Web terminal</el-button>
        </el-tab-pane>
        <el-tab-pane>
          <span slot="label"
            ><i class="nz-icon nz-icon-menu-project"></i> Monitor</span
          >
          <div>
            <div>1</div>
            <div>2</div>
          </div>
          <el-button @click="addPeoject">Add Peoject</el-button>
          <el-button @click="addModule">Add Module</el-button>
          <el-button @click="addEndpoint">Add Endpoint</el-button>
          <el-button @click="importEndpoint">Import Endpoint</el-button>
        </el-tab-pane>
        <el-tab-pane>
          <span slot="label"
            ><i class="nz-icon nz-icon-visualization"></i>Visualization</span
          >
          <div>
            <div>1</div>
            <div>2</div>
          </div>
          <el-button @click="addPanel">Add panel</el-button>
          <el-button @click="addCharts">Add chart</el-button>
        </el-tab-pane>
        <el-tab-pane>
          <span slot="label"
            ><i class="nz-icon nz-icon-terminal-log"></i>Alert</span
          >
          <div>
            <div>1</div>
            <div>2</div>
          </div>
          <el-button @click="addAlertRule">Add alert rule</el-button>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>
    <!-- dc -->
    <transition name="right-box">
      <dc-box v-if="rightBox.dc.show" :dc="dc" :user-data="userData" @close="closeDcBox" @refresh="getTableData"></dc-box>
    </transition>
    <!-- cabinet -->
    <transition name="right-box">
      <cabinet-box v-if="rightBox.cabinet.show" :cabinet="cabinet" ref="cabinetEditBox" @close="closeCabinetBox"></cabinet-box>
    </transition>
    <!-- agent -->
    <transition name="right-box">
      <agent-box v-if="rightBox.agents.show" :agents="agents" @close="closeAgentBox"></agent-box>
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
    <!-- asset -->
    <transition name="right-box">
      <asset-box
        v-if="rightBox.asset.show"
        ref="assetBox"
        :asset="asset"
        :dc-data="dcData"
        :field-group-data="fieldGroupData"
        :from="fromRoute.asset"
        :snmp-credential-data="snmpCredentialData"
        :state-data="stateData"
        :type-data="typeData"
        @close="closeAssetBox"></asset-box>
    </transition>
    <!-- project -->
    <transition name="right-box">
      <projectBox v-if="rightBox.project.show" :project="project" @close="closeProjectBox"></projectBox>
    </transition>
    <transition name="right-box">
      <moduleBox v-if="rightBox.module.show" :module="moduleList" @close="closeModuleBox"></moduleBox>
    </transition>
    <transition name="right-box">
      <addEndpointBox v-if="rightBox.endpoint.show" :endpoint="endpoint" @close="closeEndpointBox"></addEndpointBox>
    </transition>
    <transition name="right-box">
      <chart-box
      :charts="charts"
      :from="$CONSTANTS.fromRoute.panel"
      :panel-data="panelData"
      :show-panel="showPanel"
      @close="closeChartsBox"
      @delete-chart="delChart"
      @on-create-success="createSuccess"
      @on-delete-success="delChartOk"
      @reload="panelReload"
      @reloadOnlyPanel="panelReloadOnlyPanel"
      ref="addChartModal"
      v-if="rightBox.charts.show"></chart-box>
    </transition>
    <transition name="right-box">
      <alert-rule-box v-if="rightBox.alert.show" ref="alertConfigBox" :alert="alert" @close="closeAlertBox"></alert-rule-box>
    </transition>
    <!--web-->
    <el-dropdown>
      <div id="header-open-cli" @click="cli">
      </div>
    </el-dropdown>
    <!--import-->
    <el-dialog :close-on-click-modal="importBox.type!=3" :show-close="true" :title="importBox.title" :visible.sync="importBox.show" :width="importBox.width" append-to-body class="nz-dialog" @close="closeDialog">
      <div v-if="importBox.type == 1">
        <div class="upload-body">
          <el-upload drag class="upload-demo" ref="uploadExcel"  action="" :file-list="importFileList" :on-change="importChange"  :auto-upload="false" accept=".xlsx,.xls" :id="id+'-xlsx-input-file'">
            <div slot="tip" class="el-upload__tip" >{{$t('overall.importTip')}}</div>
            <i class="nz-icon nz-icon-upload"></i>
            <div class="el-upload__text">{{$t('overall.dragFileTip')}}，{{$t('overall.or')}}&nbsp;<em>{{$t('overall.clickUpload')}}</em></div>
          </el-upload>
        </div>
        <div slot="footer" class="footer">
          <div class="el-message-box__btns" style="text-align: right;">
            <button :id="id+'-xlsx-import-template'" class="el-button el-button--default el-button--small" @click="downloadTemplate">
              <span>{{$t('overall.template')}}</span>
            </button>
            <button  :id="id+'-xlsx-import-add'" :class="{'nz-btn-disabled':prevent_opt.import}" :disabled="prevent_opt.import" class="nz-btn el-button el-button--default el-button--small" @click="importExcel">
              <span>{{$t('overall.importExcel')}}</span>
            </button>
            <button :id="id+'-xlsx-import-esc'" class="el-button el-button--default el-button--small" @click="closeDialog">
              <span>{{$t('overall.cancel')}}</span>
            </button>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import DcBox from "@/components/common/rightBox/dcBox";
import AgentBox from '../../common/rightBox/agentBox';
import AssetBox from '../../common/rightBox/asset/assetBox';
import dataListMixin from '@/components/common/mixin/dataList';
import projectBox from '@/components/common/rightBox/projectBox';
import moduleBox from '@/components/common/rightBox/moduleBox'
import addEndpointBox from '@/components/common/rightBox/addEndpointBox'
import alertRuleBox from '@/components/common/rightBox/alertRuleBox'
import ChartBox from '../../page/dashboard/chartBox'
import table from '@/components/common/mixin/table'
import cabinetBox from '@/components/common/rightBox/setting/cabinetBox'
import exportXLSX from '@/components/common/exportXLSX'

import { agent, agent2 } from '@/components/common/js/constants'
import axios from 'axios'

export default {
  props: {
    show: Boolean,
    params: { type: Object },
    exportFileName: { type: String },
    link: { type: Object },
    permissions: { type: Object },
    showCur: { type: Boolean, default: true },
    id: { type: String, default: 'export' }
  },
  components: {
    DcBox,
    ChartBox,
    AgentBox,
    AssetBox,
    projectBox,
    moduleBox,
    addEndpointBox,
    alertRuleBox,
    cabinetBox,
    'export-excel': exportXLSX,
  },
  mixins: [dataListMixin,table],
  computed: {
    wgetUrl () {
      return 'wget -qO- --header="Authorization:' + this.token + '" ' + this.ipAddr + '/agent/' + this.agentParam.dc + '/' + this.agentParam.type + '/install.sh | bash'
    },
    curlUrl () {
      return 'curl -o- -H "Authorization:' + this.token + '" ' + this.ipAddr + '/agent/' + this.agentParam.dc + '/' + this.agentParam.type + '/install.sh | bash'
    }
  },
  data() {
    return {
      // dc
      userData: [],
      // asset
      dcData: [],
      typeData: [],
      stateData: [],
      fieldGroupData: [],
      snmpCredentialData: [],
      // panel
      panelData: [],
      showPanel: { // panel下拉列表
        id: '',
        name: '',
        type: 'panel'
      },
      // agert
      osTypes: [{
          label: 'Centos',
          name: 'centos'
      }],
      agentParam: {
        osType: 'centos',
        dc: '',
        type: 1
      },
      allDc: [],
      agent: agent,
      agent2: agent2,
      showAgentDownload: false,
      // import
      importBox: { show: false, title: this.$t('overall.importExcel') , type: 1},
      importFile: null,
      importFileList: [],
      importResult: null,
      exportShow: false,
      paramsType: '',
      assetimportUrl: '/asset/import',
      endpointimportUrl: '/monitor/endpoint/import',
      rightBox: {
        dc: {
          show: false
        },
        asset: {
          show: false
        },
        agents: {
          show: false
        },
        project: {
          show: false
        },
        module: {
          show: false
        },
        endpoint: {
          show: false
        },
        charts: {
          show: false
        },
        alert: {
          show: false
        },
        cabinet: {
          show: false
        },
        panel: {
          show: false
        }
      },
      dc: {
        id: '',
        name: '',
        location: '',
        tel: '',
        principal: '',
        state: 'ON',
        longitude: undefined,
        latitude: undefined
      },
      agents: {
        id: '',
        host: '',
        port: 9090,
        dc: { id: '', name: '', location: '' }
      },
      asset: {
        id: '',
        name: '',
        pid: '',
        sn: '',
        manageIp: '',
        stateId: '',
        purchaseDate: null,
        dcId: '',
        cabinetId: '',
        brandId: '',
        brand: { id: '', name: '' },
        modelId: '',
        model: { id: '', name: '' },
        type: { name: '', id: '' },
        brandAndModel: [],
        typeId: '',
        authProtocolPort: '',
        authType: '',
        authUsername: '',
        authPin: '',
        authPriKey: '',
        authUserTip: '',
        authPinTip: '',
        fields: [],
        accounts: []
      },
      project: {
        id: '',
        name: '',
        remark: ''
      },
      moduleList: {
        id: '',
        projectId: '',
        name: '',
        endpointNameTmpl: '{{module.name}}-{{asset.name}}',
        type: 'http',
        port: 9100,
        configs: {
          walk: [],
          snmpCredentialsId: '',
          metrics_path: '',
          port: '',
          host: '{{asset.manageIp}}',
          scrape_interval: '',
          scrape_timeout: '',
          params: '',
          labels: '',
          basic_auth: {
            username: '',
            pin: ''
          },
          bearer_token: ''
        },
        walk: [],
        labelModule: [{
          key: '',
          value: ''
        }],
        paramObj: [{
          key: '',
          value: []
        }]
      },
      endpoint: {},
      charts: {
        id: '',
        name: '',
        type: 'line',
        span: 12,
        height: '400',
        unit: 2,
        param: { url: '', threshold: '' },
        elements: [{ expression: '', legend: '', type: 'expert', id: '' }],
        panel: '',
        sync: 0,
        remark: '',
        groupId: -1
      },
      alert: {
        id: '',
        alertName: '',
        linkObject: { id: '', name: '' },
        expr: '',
        unit: 2,
        operator: '>',
        last: 60,
        severity: 'P2',
        summary: '',
        description: ''
      },
      cabinet: {
        id: '',
        idcId: '',
        name: '',
        remark: '',
        seq: '',
        uSize: 1
      },
      panel: {
        id: '',
        title: '',
        type: 'line',
        span: 12,
        height: '400',
        unit: 2,
        param: {
          url: '',
          threshold: ''
        },
      }
    };
  },
   mounted() {
    this.getStateData()
    this.getTypeTreeData()
    this.getDcData()
    this.getSnmpCredentialData()
    this.getFieldGroupData()
  },
  methods: {
    // Datacenter
    addDatacenter() {
      this.rightBox.dc.show = true
      this.$emit("update:show", false);
    },
    addCabinet() {
      this.rightBox.cabinet.show = true
      this.$emit("update:show", false);
    },
    // Angebt
    addAgent() {
      this.rightBox.agents.show = true
      this.$emit("update:show", false);
    },
    DownloadAgent() {
      this.$emit("update:show", false);
      this.toDownloadAgent()
    },
    // Asset
    addAsset() {
      this.rightBox.asset.show = true
      this.$emit("update:show", false);
    },
    importAsset() {
      this.showImportBox(1)
      this.$emit("update:show", false);
    },
    webTerminal() {
      this.cli()
      this.$emit("update:show", false);
    },
    // Monitor
    addPeoject() {
      this.rightBox.project.show = true
      this.$emit("update:show", false);
    },
    addModule() {
      this.rightBox.module.show = true
      this.$emit("update:show", false);
    },
    addEndpoint() {
      this.rightBox.endpoint.show = true
      this.$emit("update:show", false);
    },
    importEndpoint() {
      this.showImportBox(1)
      this.$emit("update:show", false);
    },
    // Visualization
    addPanel() {
      // this.rightBox.panel.show = true
      this.rightBox.charts.show = true
      this.$emit("update:show", false);
    },
    addCharts() {
      this.rightBox.charts.show = true
      this.$emit("update:show", false);
    },
    // Alert
    addAlertRule() {
      this.rightBox.alert.show = true
      this.$emit("update:show", false);
    },
    cli () {
      this.$store.commit('openConsole')
    },
    // userdata
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
    /** asset */
    // dcdata
    getDcData () {
      return new Promise(resolve => {
        this.$get('dc', { pageSize: -1 }).then(response => {
          if (response.code === 200) {
            this.dcData = response.data.list
            this.titleSearchList.dc.children = response.data.list.map(d => { return { ...d, value: d.id } })
          }
          resolve()
        })
      })
    },
    // fieldGroupData
    getFieldGroupData () {
      return new Promise(resolve => {
        this.$get('asset/field/group', { pageSize: -1 }).then(response => {
          if (response.code === 200) {
            this.fieldGroupData = response.data.list
          }
          resolve()
        })
      })
    },
    // snmpCredentialData
    getSnmpCredentialData () {
      return new Promise(resolve => {
        this.$get('snmp/credential', { pageSize: -1 }).then(response => {
          if (response.code === 200) {
            this.snmpCredentialData = response.data.list
          }
          resolve()
        })
      })
    },
    // stateData
    getStateData () {
      return new Promise(resolve => {
        this.$get('asset/stateConf?pageSize=-1').then(response => {
          if (response.code === 200) {
            this.stateData = response.data.list
          }
          resolve()
        })
      })
    },
    // typeData
    getTypeTreeData () {
      return new Promise(resolve => {
        this.$get('asset/typeConf/tree').then(response => {
          if (response.code === 200) {
            this.typeData = response.data.list
          }
          resolve()
        })
      })
    },
    // Download agent
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
      this.importBox.show = false
      this.importResult = null
      this.importFileList = []
      this.importFile = null
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
    /* project */

    /* panel */
    panelReloadOnlyPanel () { // 仅刷新panel数据
      if (!this.hasButton('panel_view')) {
        return
      }
      this.$get('visual/panel?pageSize=-1').then(response => {
        if (response.code === 200) {
          this.panelData = response.data.list
          for (let i = 0; i < this.panelData.length; i++) {
            if (this.panelData[i].id == this.showPanel.id) {
              this.showPanel.name = this.panelData[i].name
              break
            }
          }
        }
      })
    },

    getTableData (clearShowPanel) {
      const vm = this

      this.$get('visual/panel?type=dashboard&pageSize=-1').then(response => {
        if (response.code === 200) {
          this.panelData = response.data.list
          let isInitData = false
          if (response.data.list.length > 0) {
            if (this.$store.state.showPanel.id > 0 && this.$store.state.showPanel.name) {
              this.showPanel = JSON.parse(JSON.stringify(this.$store.state.showPanel))
            }
            if (clearShowPanel) {
              this.showPanel.id = ''
            }
            if (!this.showPanel.id) {
              this.showPanel = response.data.list[0]
              this.filter.panelId = this.showPanel.id
              this.getData(this.filter)
              isInitData = true
            } else {
              handler(response.data.list)
              this.filter.panelId = this.showPanel.id
            }
            this.$nextTick(() => {
              this.$refs.selectPanel.$refs.panelTree.setCurrentKey(this.showPanel)
            })
          } else {
            this.showPanel.id = ''
            this.filter.panelId = ''
          }
          this.pageObj.total = response.data.total
          if (!isInitData && (this.panel.id === '' || this.panel.id === this.showPanel.id)) {
            this.getData(this.filter)
          }
          this.$store.state.showPanel.id = 0
          this.$store.state.showPanel.name = ''
          this.$store.state.showPanel.type = 'dashboard'
        } else {
          if (response.msg) {
            this.$message.error(response.msg)
          } else if (response.error) {
            this.$message.error(response.error)
          } else {
            this.$message.error(response)
          }
        }
      }).catch((error) => {
        // console.log('error................'+JSON.stringify(error));
        if (error) {
          console.error(error)
          this.$message.error(error.toString())
        }
      })

      function handler (panelData) {
        panelData.forEach(panel => {
          if (panel.id == vm.showPanel.id) {
            vm.showPanel = panel
          } else {
            if (panel.children && panel.children.length > 0) {
              handler(panel.children)
            }
          }
        })
      }
    },
    // 面板相关操作
    panelChange (val) {
      if (!val) {
        return false
      }
      this.filter.searchName = ''
      // this.$refs.searchInput.select();
      this.showPanel = val
      this.showPanel.type = 'dashboard'
      this.filter.panelId = this.showPanel.id
      // let curTime = this.$refs.calendarPanel.getCurrentTime();
      const curTime = this.searchTime
      this.filter.start_time = bus.timeFormate(curTime[0], 'yyyy-MM-dd hh:mm:ss')
      this.filter.end_time = bus.timeFormate(curTime[1], 'yyyy-MM-dd hh:mm:ss')
      // this.$refs.chartList.initCurrentRecordNum();
      this.$refs.chartList.cleanData()
      this.getData(this.filter)
    },
        panelReloadForDel: function () {
      if (this.showPanel.id === this.panel.id) {
        this.showPanel.id = ''
      }
      this.getTableData()
    },
    /* 图表相关操作--start */
    addChart () {
      this.chart = this.newChart()
      this.chart.panelId = this.showPanel.id
      this.chart.panelName = this.showPanel.name
      this.rightBox.chart.show = true
    },
    addChartByTemp () {
      this.chart = Object.assign({}, this.blankChartTemp)
      this.chart.panelId = this.showPanel.id
      this.rightBox.chartTemp.show = true
    },
    addGroupItem (groupId) {
      this.chart = this.newChart()
      this.chart.groupId = groupId
      this.chart.panelId = this.showPanel.id
      this.chart.panelName = this.showPanel.name
      this.chart.isGroup = true
      this.rightBox.chart.show = true
    },
    // 编辑图表信息,打开编辑弹窗
    editChart (data) {
      if (!data.param) {
        data.param = { url: '', threshold: '' }
      }
      this.chart = JSON.parse(JSON.stringify(data))
      this.chart.panelId = this.showPanel.id
      this.chart.panelName = this.showPanel.name
      this.rightBox.chart.show = true
    },
     delChartOk () {
      this.filter.panelId = this.showPanel.id
      this.getData(this.filter)
    },
    // 图表创建成功，回调panel页面，进行图表的刷新
    createSuccess (msg, data, params, panel) {
      this.filter.panelId = this.showPanel.id
      this.getData(this.filter)
    },
    // 移除图表:弹出确认框询问
    delChart (data, from) {
      this.$confirm(this.$t('tip.confirmDelete'), {
        confirmButtonText: this.$t('tip.yes'),
        cancelButtonText: this.$t('tip.no'),
        type: 'warning'
      }).then(() => {
        this.$delete('visual/panel/chart?ids=' + data.id).then(response => {
          if (response.code === 200) {
            this.$message({
              duration: 2000,
              type: 'success',
              message: this.$t('tip.deleteSuccess')
            })
            this.rightBox.chart.show = false
            const chartList = this.$refs.chartList.dataList
            for (let i = 0; i < chartList.length; i++) {
              if (chartList[i].id === data.id) {
                chartList.splice(i, 1)
              }
              if (chartList[i].type === 'group') {
                chartList[i].children = chartList[i].children.filter((item) => item.id !== data.id)
              }
            }
            this.$refs.chartList.loadChartData(this.scrollbarWrap.scrollTop)
          } else {
            this.$message.error(response.msg)
          }
        })
      })
    },
    panelReload (clearShowPanel) {
      this.getTableData(clearShowPanel)
    },
    panelReloadOnlyPanel () { // 仅刷新panel数据
      if (!this.hasButton('panel_view')) {
        return
      }
      this.$get('visual/panel?pageSize=-1').then(response => {
        if (response.code === 200) {
          this.panelData = response.data.list
          for (let i = 0; i < this.panelData.length; i++) {
            if (this.panelData[i].id == this.showPanel.id) {
              this.showPanel.name = this.panelData[i].name
              break
            }
          }
        }
      })
    },
    showImportBox (type) {
      this.importBox.show = true
      this.importBox.type = type
      if (type == 1) { // import
        this.importBox.title = this.$t('overall.importExcel')
        this.importBox.width = '600px'
      }
    },
    getTimeString () {
      const split = '-'
      const date = new Date()
      const year = date.getFullYear()
      const month = this.formatNum(date.getMonth() + 1)
      const day = this.formatNum(date.getDate())
      const hours = this.formatNum(date.getHours())
      const minutes = this.formatNum(date.getMinutes())
      const seconds = this.formatNum(date.getSeconds())
      return year + split + month + split + day + ' ' + hours + split + minutes + split + seconds
    },
    formatNum (num) {
      return num > 9 ? num : '0' + num
    },
    importChange (file, fileList) {
      // console.log(file,filelist)
      if (fileList.length > 0) {
        this.importFileList = [fileList[fileList.length - 1]]
      }
      this.importFile = this.importFileList[0]
    },
    rollbackImport () {
      let url
      if (this.assetimportUrl.indexOf('asset') || this.assetimportUrl.indexOf('asset') > -1) {
        url = '/asset/cancelImport'
      } else if (this.assetimportUrl.indexOf('asset') || this.assetimportUrl.indexOf('asset') > -1) {
        url = '/monitor/endpoint/cancelImport'
      } else if (this.assetimportUrl.indexOf('asset') || this.assetimportUrl.indexOf('asset') > -1) {
        url = '/alert/rule/cancelImport'
      } else if (this.assetimportUrl.indexOf('asset') || this.assetimportUrl.indexOf('asset') > -1) {
        url = '/panel/cancelImport'
      } else if (this.assetimportUrl.indexOf('asset') || this.assetimportUrl.indexOf('asset') > -1) {
        url = '/expression/tmpl/cancelImport'
      }
      this.$delete(url + '?seq=' + this.importResult.seq).then(response => {
        if (response.code == 200) {
          this.$message({ duration: 2000, type: 'success', message: this.$t('tip.saveSuccess') })
          this.$emit('afterImport')
        } else {
          this.$message.error(response.msg)
        }
        this.closeDialog()
      })
    },
    downloadTemplate () {
      const language = localStorage.getItem('nz-language') || 'en' // 初始未选择默认 en 英文
      const fileName = this.exportFileName + '-' + this.$t('overall.template') + '-' + this.getTimeString() + '.xlsx'

      let url = null
      if (this.assetimportUrl.indexOf('asset') || this.assetimportUrl.indexOf('asset') > -1) {
        url = '/asset/template'
      } else if (this.assetimportUrl.indexOf('asset') || this.assetimportUrl.indexOf('asset') > -1) {
        url = '/alert/rule/template'
      } else if (this.assetimportUrl.indexOf('asset') || this.assetimportUrl.indexOf('asset') > -1) {
        url = '/panel/template'
      } else if (this.assetimportUrl.indexOf('asset') || this.assetimportUrl.indexOf('asset') > -1) {
        url = '/monitor/endpoint/template'
      } else if (this.assetimportUrl.indexOf('asset') || this.assetimportUrl.indexOf('asset') > -1) {
        url = '/expression/tmpl/template'
      }

      const param = { language: language }
      if (!url) {
        console.error('no interface support')
      }
      this.exportExcel(url, param, fileName)
    },
    exportExcel (url, params, fileName) {
      if (this.paramsType) {
        params.type = this.paramsType
      }
      axios.get(url, { responseType: 'blob', params: params }).then(res => {
        if (window.navigator.msSaveOrOpenBlob) {
          // 兼容ie11
          const blobObject = new Blob([res.data])
          window.navigator.msSaveOrOpenBlob(blobObject, fileName)
        } else {
          const url = URL.createObjectURL(new Blob([res.data]))
          const a = document.createElement('a')
          document.body.appendChild(a) // 此处增加了将创建的添加到body当中
          a.href = url
          a.download = fileName
          a.target = '_blank'
          a.click()
          a.remove() // 将a标签移除
        }
      }, error => {
        const $self = this
        const reader = new FileReader()
        reader.onload = function (event) {
          const responseText = reader.result
          const exception = JSON.parse(responseText)
          if (exception.message) {
            $self.$message.error(exception.message)
          } else {
            console.error(error)
          }
        }
        reader.readAsText(error.response.data)
      })
    },
    importExcel () {
      if (this.importFile && this.importFile.raw) {
        this.prevent_opt.import = true
        const form = new FormData()
        form.append('excelFile', this.importFile.raw)
        if (this.paramsType) {
          form.append('type', this.paramsType)
          if (this.paramsType === 'asset' || this.paramsType === 'model') {
            form.append('linkId', this.link ? this.link.id : '')
          }
        }
        form.append('language', localStorage.getItem('nz-language') ? localStorage.getItem('nz-language') : 'en')
        if (this.assetimportUrl){
          this.$post(this.assetimportUrl, form, { 'Content-Type': 'multipart/form-data' }).then(response => {
            if (response.code == 200 && response.msg == 'success') {
              this.importResult = response.data
              this.$emit('afterImport')
              this.importBox.type = 3
              this.importBox.width = '600px'
            } else {
              this.$message.error(response.msg)
            }
            this.prevent_opt.import = false
          })
        }else if (this.endpointimportUrl){
          this.$post(this.endpointimportUrl, form, { 'Content-Type': 'multipart/form-data' }).then(response => {
            if (response.code == 200 && response.msg == 'success') {
              this.importResult = response.data
              this.$emit('afterImport')
              this.importBox.type = 3
              this.importBox.width = '600px'
            } else {
              this.$message.error(response.msg)
            }
            this.prevent_opt.import = false
          })
        }
      } else {
        this.$message.error(this.$t('tip.noImportFile'))
      }
    },
    // Box 侧滑关闭事件
    closeDcBox (refresh) {
      this.rightBox.dc.show = false
      if (refresh) {
        this.delFlag = true
        this.getTableData()
      }
    },
    closeAgentBox (refresh) {
      this.rightBox.agents.show = false
      if (refresh) {
        this.delFlag = true
        this.getTableData()
      }
    },
    closeAssetBox (refresh) {
      this.rightBox.asset.show = false
      if (refresh) {
        this.delFlag = true
        this.getTableData()
      }
    },
    closeProjectBox (refresh) {
      this.rightBox.project.show = false
      if (refresh) {
        this.delFlag = true
        this.getTableData()
      }
    },
    closeModuleBox (refresh) {
      this.rightBox.module.show = false
      if (refresh) {
        this.delFlag = true
        this.getTableData()
      }
    },
    closeEndpointBox (refresh) {
      this.rightBox.endpoint.show = false
      if (refresh) {
        this.delFlag = true
        this.getTableData()
      }
    },
    closeChartsBox (refresh) {
      this.rightBox.charts.show = false
      if (refresh) {
        this.delFlag = true
        this.getTableData()
      }
    },
    closeAlertBox (refresh) {
      this.rightBox.alert.show = false
      if (refresh) {
        this.delFlag = true
        this.getTableData()
      }
    },
    closeCabinetBox (refresh) {
      this.rightBox.cabinet.show = false
      if (refresh) {
        this.delFlag = true
        this.getTableData()
      }
    }
  },
  watch: {

  }
};
</script>
<style lang="scss">
.el-dialog__body {
  background-color: #fff;
  .el-tab-pane {
    text-align: center;
    div {
      text-align: left;
      line-height: 20px;
    }
    .el-button {
      width: 156px;
      height: 46px;
      border-radius: 2px;
      margin-top: 40px;
      background-color: #666;
      span {
        color: #fff;
      }
    }
  }
}
.right-box{
  text-align: left;
}
</style>
