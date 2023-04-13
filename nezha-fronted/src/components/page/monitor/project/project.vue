<template>
  <div class="project">
<!--    <topologyL5 v-if="reloadFacade" ref="facade" :obj="currentProject" :topologyIndexF="topologyIndexF" targetTab.sync="panel" @changeTopologyIndexF="changeTopologyIndexF"/>-->
    <meta2dMain :meta2dId="'projectId'" :topoData="topoData" :querysArray="querysArray" :project="currentProject" :params="params" :iconArray="iconArray" @reload="reload"/>
    <transition name="el-zoom-in-bottom">
      <bottom-box
        v-if="bottomBox.showSubList"
        :sub-resize-show="bottomBox.subResizeShow"
        :is-full-screen="bottomBox.isFullScreen"
        :from="$CONSTANTS.fromRoute.endpoint"
        :target-tab.sync="bottomBox.targetTab"
        :detail="bottomBox.endpointDetail"
        :obj="endpoint"
        :detail-list="bottomBox.alertList"
        :asset-detail="bottomBox.assetDetail"
        @closeSubList="bottomBox.showSubList = false"
        @fullScreen="fullScreen"
        @exitFullScreen="exitFullScreen"
        @listResize="listResize">
    </bottom-box>
    </transition>
    <transition name="right-box">
      <add-endpoint-box
        v-if="rightBox.addEndpoint.show"
        :current-project="currentProject"
        :current-module="currentModule"
        @close="closeAddEndpointRightBox"
        ref="addEndpointBox">
      </add-endpoint-box>
    </transition>
    <transition name="right-box">
      <edit-endpoint-box
        v-if="rightBox.editEndpoint.show"
        :project="currentProject"
        :module="currentModule"
        :endpoint="endpoint"
        @close="closeEditEndpointRightBox"
        ref="editEndpointBox">
      </edit-endpoint-box>
    </transition>
    <el-dialog
      :title="'123'"
      :visible.sync="isPreview.show"
      fullscreen
      class="no-transform-dialog"
      custom-class="nz-new-dialog meta2d-preview"
      :append-to-body="true"
      :modal-append-to-body="false"
      @close="isPreview.show = false"
      destroy-on-close
    >
      <div v-if="isPreview.show" style="width: 100%;height: 100%">
        <meta2dMain
          :meta2dId="'projectIdIsPreview'"
          :is-preview="true"
          :name="'preview'"
          :topoData="isPreview.topoData"
          :querysArray="isPreview.querysArray"
          :project="isPreview.currentProject"
          :params="isPreview.params"
          :iconArray="iconArray"
        />
      </div>
    </el-dialog>
  </div>
</template>

<script>
import bus from '@/libs/bus'
import topologyL5 from '@/components/common/project/topologyL5'
import meta2dMain from '@/components/common/project/meta2d/meta2dMain'
import beforeMeta2d from '@/components/common/mixin/beforeMeta2d'
import { clearTopology } from '@/components/common/js/common'

export default {
  name: 'project2',
  mixins: [beforeMeta2d],
  components: {
    topologyL5,
    meta2dMain
  },
  data () {
    return {
      meta2dType: 'project',
      rightBox: {
        module: { show: false },
        addEndpoint: { show: false },
        editEndpoint: { show: false }
      },
      isPreview: {
        show: false,
        topoData: {},
        querysArray: {},
        currentProject: {},
        params: {},
      },
      /* 二级页面相关 */
      bottomBox: {
        endpoint: {}, // asset详情
        endpointDetail: null,
        mainResizeShow: true, // dom高度改变时部分内容是否展示
        subResizeShow: true,
        isFullScreen: false, // 是否是全屏，用来控制拖动条是否展示,
        showSubList: false,
        targetTab: ''
      },

      mainTableHeight: this.$tableHeight.normal, // 主列表table高度
      ready: false,

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

      tableId: 'projectTable', // 需要分页的table的id，用于记录每页数量
      userData: [],

      endpoint: {
        id: '',
        host: '',
        port: '',
        param: '',
        path: '',
        asset: {},
        project: {},
        module: {},
        moduleId: '',
        assetId: '',
        paramObj: []
      },
      tableTitle: [
        {
          label: this.$t('project.endpoint.endpointId'),
          prop: 'id',
          show: true,
          width: 150
        }, {
          label: this.$t('asset.asset'),
          prop: 'asset',
          show: true,
          minWidth: 400
        }, {
          label: this.$t('asset.host'),
          prop: 'host',
          show: true,
          width: 200
        }, {
          label: this.$t('asset.port'),
          prop: 'port',
          show: true,
          width: 100
        }, {
          label: this.$t('overall.type'),
          prop: 'type',
          show: false,
          width: 200
        }, {
          label: this.$t('alert.list.labels'),
          prop: 'labels',
          show: true,
          width: 200
        }, {
          label: this.$t('config.assetLabel.params'),
          prop: 'param',
          show: true,
          width: 200
        }, {
          label: this.$t('config.terminallog.path'),
          prop: 'path',
          show: true,
          width: 200
        }, {
          label: this.$t('overall.state'),
          prop: 'state',
          show: true,
          width: 80
        }, {
          label: this.$t('overall.alert'),
          prop: 'alerts',
          show: true,
          width: 180
        },
        // {
        //   label: this.$t("project.endpoint.lastUpdate"),
        //   prop: 'lastUpdate',
        //   show: true,
        // },
        {
          label: this.$t('config.account.option'),
          prop: 'option',
          show: true,
          width: 120
        }
      ],
      endpointTableData: [],
      endpointPageObj: {
        pageNo: 1,
        pageSize: this.$CONSTANTS.defaultPageSize,
        total: 0
      },

      currentProjectTitle: '',
      moduleList: [],
      projectList: [],
      pageType: 'project', // project endpoint
      currentProject: { id: '', name: '', remark: '' }, // endpoint弹框、module列表用来回显project
      module: {}, // 编辑的module
      blankModule: { id: '', type: '', name: '', project: {}, port: '', path: '', param: '', paramObj: [], snmpParam: '' }, // 空白module
      currentModule: { id: '', type: '', name: '', project: {}, port: '', path: '', param: '', paramObj: [], snmpParam: '' }, // 用来回显的module
      endpointSearchLabel: { moduleId: '' }, // endpoint搜索参数
      endpointSearchMsg: { // 给搜索框子组件传递的信息
        zheze_none: true,
        searchLabelList: [{
          id: 1,
          name: 'ID',
          type: 'input',
          label: 'id',
          disabled: false
        }, {
          id: 11,
          name: this.$t('asset.asset'),
          // name: this.$t('asset.asset'),
          type: 'query',
          label: 'query',
          disabled: false
        }, {
          id: 33,
          name: this.$t('overall.state'),
          // name: this.$t('asset.asset'),
          type: 'select',
          label: 'endpointState',
          disabled: false,
          readonly: true
        }]
      },
      scrollbarWrap: null,
      delFlag: false,
      topologyIndexF: 0
    }
  },
  methods: {
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
    getEndpointTableData () {
      if (this.currentModule && this.currentModule.id) {
        this.pageType = 'endpoint'
        this.endpointSearchLabel.moduleId = this.currentModule.id
        this.$set(this.endpointSearchLabel, 'pageNo', this.endpointPageObj.pageNo)
        this.$set(this.endpointSearchLabel, 'pageSize', this.endpointPageObj.pageSize)
        this.tools.loading = true
        this.$get('endpoint', this.endpointSearchLabel).then(response => {
          this.tools.loading = false
          if (response.code === 200) {
            for (let i = 0; i < response.data.list.length; i++) {
              try {
                const param = response.data.list[i].param || '{}'
                const tempObj = JSON.parse(param)
                const labels = response.data.list[i].labels || '{}'
                const tempObj1 = JSON.parse(labels)
                response.data.list[i].paramObj = []
                response.data.list[i].labelModule = []
                for (const k in tempObj) {
                  response.data.list[i].paramObj.push({ key: k, value: tempObj[k] })
                }
                for (const k in tempObj1) {
                  response.data.list[i].labelModule.push({ key: k, value: tempObj1[k] })
                }
              } catch (err) {
                // console.error(response.data.list[i], err);
              }
            }
            this.endpointTableData = response.data.list
            this.endpointPageObj.total = response.data.total
            if (!this.scrollbarWrap) {
              this.$nextTick(() => {
                this.scrollbarWrap = this.$refs.endpointTable.bodyWrapper
                this.toTopBtnHandler(this.scrollbarWrap)
              })
            }
          }
        })
      }
    },
    afterCloseImport: function () {
      this.getEndpointTableData()
      bus.$emit('module-list-change')
    },
    endpointPageNo (val) {
      this.endpointPageObj.pageNo = val
      this.getEndpointTableData()
    },
    endpointPageSize (val) {
      this.endpointPageObj.pageSize = val
      localStorage.setItem('nz-pageSize-' + localStorage.getItem('nz-username') + '-' + this.tableId, val)
      this.getEndpointTableData()
    },

    getProjectList () {
      this.$get('project', { pageSize: -1 }).then(response => {
        if (response.code == 200) {
          this.projectList = response.data.list
        }
      })
    },
    getProjectModule (projectId) {
      const moduleList = JSON.parse(JSON.stringify(this.moduleList))
      return moduleList.filter((item, index) => {
        return item.project.id == projectId
      })
    },
    detailProject (project) {
      this.pageType = 'project'
      if (project) {
        this.currentProject = project
        this.currentProjectTitle = project.id + ''
      }
      this.currentModule = {}
    },
    closeAddEndpointRightBox (refresh) {
      this.rightBox.addEndpoint.show = false
      if (refresh) {
        this.getEndpointTableData()
      }
    },
    closeEditEndpointRightBox (refresh) {
      this.rightBox.editEndpoint.show = false
      if (refresh) {
        this.getEndpointTableData()
      }
    },
    getModuleList () {
      this.$get('module', { pageSize: -1, pageNo: 1 }).then(response => {
        if (response.code === 200) {
          this.moduleList = response.data.list
          for (let i = 0; i < this.moduleList.length; i++) {
            try {
              const param = this.moduleList[i].param || '{}'
              const tempObj = JSON.parse(param)
              this.$set(this.moduleList[i], 'paramObj', [])
              for (const k in tempObj) {
                this.moduleList[i].paramObj.push({ key: k, value: tempObj[k] })
              }
              const labels = this.moduleList[i].labels || '{}'
              const tempObj1 = JSON.parse(labels)
              this.$set(this.moduleList[i], 'labelModule', [])
              for (const k in tempObj1) {
                this.moduleList[i].labelModule.push({ key: k, value: tempObj1[k] })
              }
            } catch (err) {
              console.error(response.data.list[i], err)
            }
          }
        }
      })
    },
    // 左侧module列表选中切换
    changeModule (project, module) {
      this.currentModule = module
      this.endpointSearchLabel = { moduleId: '' }
      this.$refs.projectSearch.clearSearch()
      this.bottomBox.showSubList = false
      this.currentProject = project
    },
    // 弹出endpoint编辑页
    editEndpoint (endpoint) {
      this.endpoint = JSON.parse(JSON.stringify(endpoint))
      this.$set(this.endpoint, 'projectId', this.currentModule.project.id)
      this.$set(this.endpoint, 'moduleId', this.currentModule.id)

      this.rightBox.editEndpoint.show = true
      if (!this.endpoint.paramObj) {
        this.$set(this.endpoint, 'paramObj', [])
      }
      if (!this.endpoint.labelModule) {
        this.$set(this.endpoint, 'labelModule', [])
      }
    },

    addEndpoint () {
      this.endpoint.project = Object.assign({}, this.currentModule.project)
      this.endpoint.module = Object.assign({}, this.currentModule)
      this.rightBox.addEndpoint.show = true
    },

    jumpToAlertMsg (endpoint) {
      if (!this.hasButton('project_endpoint_alerts_view')) {
        return
      }
      this.endpoint = Object.assign({}, endpoint)
      this.bottomBox.targetTab = 'alertMessage'
      this.bottomBox.showSubList = true
    },
    addModule () {
      this.module = this.newModule()
      this.rightBox.module.show = true
      this.$nextTick(() => {
        this.$refs.moduleBox.initWalk()
      })
    },
    newModule () {
      return JSON.parse(JSON.stringify(this.blankModule))
    },

    // 搜索
    endpointSearch (searchObj) {
      let orderBy = ''
      if (this.endpointSearchLabel.orderBy) {
        orderBy = this.endpointSearchLabel.orderBy
      }
      this.endpointSearchLabel = {}
      this.endpointPageObj.pageNo = 1
      for (const item in searchObj) {
        if (searchObj[item] || searchObj[item] === 0) {
          if (item === 'endpointState') {
            this.$set(this.endpointSearchLabel, 'state', searchObj[item])
          } else {
            this.$set(this.endpointSearchLabel, item, searchObj[item])
          }
        }
      }
      if (orderBy) {
        this.$set(this.endpointSearchLabel, 'orderBy', orderBy)
      }
      if (this.$refs.endpointTable && this.$refs.endpointTable.bodyWrapper) {
        this.$refs.endpointTable.bodyWrapper.scrollTop = 0
      }
      this.getEndpointTableData()
    },

    dateFormat (time) {
      if (!time) {
        return '-'
      }
      const date = new Date(time * 1000)
      const year = date.getFullYear()
      const month = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1
      const day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate()
      const hours = date.getHours() < 10 ? '0' + date.getHours() : date.getHours()
      const minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()
      const seconds = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds()

      return year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds
    },
    viewAsset (endpoint) {
      this.endpoint = Object.assign({}, endpoint)
      this.bottomBox.targetTab = 'assetDetail'
      this.bottomBox.showSubList = true
    },
    query (endpoint) {
      this.endpoint = Object.assign({}, endpoint)
      this.bottomBox.targetTab = 'endpointQuery'
      this.bottomBox.showSubList = true
    },
    getStateContent: function (row) {
      if (row) {
        if (row.state == 1) {
          return 'up'
        } else {
          return `down:${this.getStateErrorMsg(row)}`
        }
      }
    },
    convertToDetail (obj) {
      const detail = {
        project: obj.project.name,
        module: obj.module.name,
        asset: obj.asset.host,
        host: obj.host,
        port: obj.port,
        path: obj.path,
        param: obj.param
      }
      return detail
    },
    formatUpdateTime: function (date) {
      const time = new Date(date)
      const hours = time.getHours() > 9 ? time.getHours() : '0' + time.getHours()
      const minutes = time.getMinutes() > 9 ? time.getMinutes() : '0' + time.getMinutes()

      return hours + ':' + minutes
    },
    getStateErrorMsg (row) {
      const errCodes = [230009, 230010, 230011]
      if (row) {
        if (row.state == 0) {
          if (errCodes.find((item) => {
            return row.stateInfo.code == item
          })) {
            return this.$t('project.endpoint.stateInfo_' + row.stateInfo.code)
          } else {
            this.$message.error('state code error')
            return row.stateInfo.msg
          }
        }
      }
    },
    assetConvertToDetail (obj) {
      const detail = JSON.parse(JSON.stringify(obj))
      detail.state = obj.state == 1 ? this.$t('asset.inStock') : this.$t('asset.notInStock')
      detail.assetType = obj.model.type.value
      detail.vendorModel = obj.model.vendor.value + ' ' + obj.model.name
      detail.dataCenter = obj.idc ? obj.idc.name : ''
      detail.location = obj.idc ? obj.idc.location : ''
      detail.principal = obj.idc ? this.getPrincipalName(obj.idc.principal) : ''
      detail.tel = obj.idc ? obj.idc.tel : ''
      detail.cabinet = obj.cabinet ? obj.cabinet.name : ''
      detail.uSize = obj.cabinet ? obj.cabinet.uSize : ''
      detail.remark = obj.idc ? obj.idc.remark : ''
      !obj.accounts && (obj.accounts = [])
      if (obj.accounts.length > 0) {
        const account = obj.accounts[0]
        detail.protocol = account.protocol
        detail.account = account.user
        let loginType = ''
        if (account.authType == 1) {
          loginType = this.$t('login.pin')
        } else if (account.authType == 2) {
          loginType = this.$t('asset.ssh')
        }
        detail.loginType = loginType
        detail.port = account.port
      }
      return detail
    },
    getPrincipalName (data) {
      for (const item in this.userData) {
        if (this.userData[item].userId === data) {
          return this.userData[item].username
        }
      }
    },
    // 刷新拓扑图
    visNetworkReload () {
      this.$refs.facade.$refs.visNetwork.reload()
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
      this.$set(this.endpointSearchLabel, 'orderBy', orderBy)
      this.getEndpointTableData()
    },
    initEvent () {
      bus.$on('project-page-type', pageType => {
        this.pageType = pageType
      })
      bus.$on('current-project-change', project => {
        this.currentProject = project
      })
      bus.$on('current-module-change', module => {
        this.currentModule = module
        this.bottomBox.showSubList = false
      })
      bus.$on('project-list-change', () => {
        this.getProjectList()
      })
      bus.$on('module-list-change', menu => {
        this.getModuleList()
      })
      bus.$on('endpoint-list-change', menu => {
        this.getEndpointTableData()
      })
      bus.$on('alert-message-change', () => {
        this.getEndpointTableData()
      })
      bus.$on('showMeta2dPreview', (params) => {
        this.isPreview = params
      })
    },
    messageStyle (e) {
      if (e.column.label == 'Alerts' || e.column.label == this.$t('overall.alert')) {
        if (e.row.alertNum > 0) {
          return 'danger'
        } else {
          return 'success'
        }
      }
      return ''
    },
    changeTopologyIndexF () {
      this.topologyIndexF = 0
    }
  },
  created () {
    this.currentProject = this.$store.state.currentProject
    // 是否存在分页缓存
    const pageSize = localStorage.getItem('nz-pageSize-' + localStorage.getItem('nz-username') + '-' + this.tableId)
    if (pageSize) {
      this.endpointPageObj.pageSize = pageSize
    }
  },
  mounted () {
    // 初始化表头
    this.tools.customTableTitle = localStorage.getItem('nz-tableTitle-' + localStorage.getItem('nz-username') + '-' + this.$route.path)
      ? JSON.parse(localStorage.getItem('nz-tableTitle-' + localStorage.getItem('nz-username') + '-' + this.$route.path))
      : this.tableTitle
    setTimeout(() => {
      this.ready = true
    }, 300)
    this.$get('/topology/icon').then(res => {
      this.iconArray = [...res.data.list]
    })
    this.initEvent()
  },
  computed: {
    currentProjectChange () {
      return this.$store.state.currentProject
    },
    itemTip () {
      return function (id, content, ready) {
        const className = 'item-tip-show'
        this.$nextTick(() => {
          if (ready) {
            const cellDom = document.querySelector(`#module-${id}`)
            const spanDom = document.querySelector(`#module-${id}>span`)
            if (cellDom.offsetWidth - 16 <= spanDom.offsetWidth) {
              document.querySelector(`#module-${id}>.el-popover`).classList.add(className)
            } else {
              document.querySelector(`#module-${id}>.el-popover`).classList.remove(className)
            }
          }
        })
        return ''
      }
    },
    reloadFacade () {
      return this.$store.getters.getReloadFacade
    }
  },
  watch: {
    currentModule (n, o) {
      this.endpointPageObj.pageNo = 1
      if (n && n.id) {
        this.getEndpointTableData()
      } else {
        this.endpointTableData = []
      }
    },

    'bottomBox.showSubList': function (n) {
      const vm = this
      this.$bottomBoxWindow.showSubListWatch(vm, n)
    },
    endpoint: {
      deep: true,
      handler (n) {
        this.bottomBox.endpointDetail = this.convertToDetail(n)
        this.$get('asset', { id: n.assetId }).then(response => {
          if (response.code === 200) {
            this.bottomBox.assetDetail = this.assetConvertToDetail(response.data.list[0])
          }
        })
      }
    },
    endpointTableData: {
      deep: true,
      handler (n) {
        if (n.length === 0 && this.endpointPageObj.pageNo > 1) {
          this.endpointPageNo(this.endpointPageObj.pageNo - 1)
        }
        if (!this.delFlag && this.pageType === 'endpoint') { // 不是删除时回到顶部 以及修改时
          this.$refs.endpointTable.bodyWrapper.scrollTop = 0
        } else {
          this.delFlag = false
        }
      }
    },
    currentProjectChange: {
      deep: true,
      handler (n) {
        this.currentProject = this.$store.state.currentProject
      }
    }
  },
  beforeDestroy () {
    bus.$off('project-page-type')
    bus.$off('current-project-change')
    bus.$off('current-module-change')
    bus.$off('project-list-change')
    bus.$off('module-list-change')
    bus.$off('endpoint-list-change')
    bus.$off('alert-message-change')
    bus.$off('showMeta2dPreview')
    clearTopology()
    if (this.scrollbarWrap) {
      this.scrollbarWrap.removeEventListener('scroll', bus.debounce)
    }
  }
}
</script>
