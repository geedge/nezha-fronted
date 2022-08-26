<template>
  <div style="height: 100%">
    <div class="sub-top-tools">
      <div class="sub-list-tabs" v-if="from===fromRoute.asset">
        <div class="sub-list-tab-title">{{obj.host}}</div>
        <div class="sub-list-tab" @click="changeTab('panel')" id="endpoint-tab-change-panel">{{$t("overall.detail")}}</div>
        <div @click="changeTab('alertMessage')" class="sub-list-tab" v-has="'asset_alerts_view'" id="endpoint-tab-change-alertmsg">{{$t("alert.alertMessage")}}</div>
        <div class="sub-list-tab sub-list-tab-active">{{$t("asset.endpoint")}}</div>
      </div>
      <div class="sub-list-tabs" v-if="from===fromRoute.module">
        <div class="sub-list-tab-title">{{obj.name}}</div>
        <div class="sub-list-tab sub-list-tab-active">{{$t("asset.endpoint")}}</div>
        <div @click="changeTab('alertMessage')" class="sub-list-tab" id="endpoint-tab-change-alertmsg">{{$t("alert.alertMessage")}}</div>
      </div>
      <div class="top-tool-right">
        <div class="top-tool-search">
          <search-input :searchMsg="searchMsg" @search="search" position="endpoint-bottom"></search-input>
        </div>
        <export-excel
          id="endpoint-sub-list"
          export-file-name="endpoint"
          export-url="/endpoint/export"
          import-url="/endpoint/import"
          :params="endpointSearchLabel"
          :permissions="{import: 'monitor_endpoint_add', export: 'monitor_endpoint_edit'}"
          @afterImport="getTableData"
          class="margin-l-20"
        >
          <template slot="optionZone">
            <button :title="$t('overall.createEndpoint')" @click.stop="add" class="nz-btn nz-btn-size-normal nz-btn-style-light" id="project-create-project" v-has="'asset_endpoint_toAdd'">
              <i class="nz-icon nz-icon-create-square"></i>
            </button>
          </template>
        </export-excel>
        <delete-button
          ref="deleteButton"
          :from="'endpoint'"
          :forceDeleteShow="false"
          :delete-objs="batchDeleteObjs"
          @after="getTableData"
          api="endpoint"
          v-has="'asset_endpoint_delete'"
          id="endpoint-tab-batch-delete"></delete-button>
      </div>
    </div>
    <!-- 自定义table列 -->
      <transition name="el-zoom-in-top">
        <element-set
          id="endpoint-sub-list"
          v-if="tools.showCustomTableTitle"
          @close="tools.showCustomTableTitle = false"
          :custom-table-title.sync="tools.customTableTitle"
          :original-table-title="tableTitle"
          ref="customTableTitle"
          :path="'/projectBottom'"
        ></element-set>
      </transition>
    <el-table
      id="endpoint-sub-list-table"
      :data="tableData"
      border
      v-my-loading="tools.loading"
      :loading="tools.loading"
      class="nz-table endpoint-table"
      :height="$tableHeight.noPagination"
      :cell-class-name="messageStyle"
      ref="endpointTable"
      style="width: 100%;height: 100%"
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
        :label="item.label"
        :sortable="$tableSet.sortableShow(item.prop,'endpointTab')"
        :prop="$tableSet.propTitle(item.prop,'endpointTab')"
        :sort-orders="['ascending', 'descending']"
        :min-width="item.minWidth || item.width"
      >
        <template slot-scope="scope" :column="item">
          <span v-if="item.prop === 'asset' && scope.row[item.prop]" class="link">
            {{scope.row[item.prop].sn}} :
            ({{scope.row[item.prop].host}})
          </span>
          <span v-else-if="item.prop === 'project' && scope.row[item.prop]">{{scope.row.project.name}}</span>
          <span v-else-if="item.prop === 'module' && scope.row[item.prop]">{{scope.row.module.name}}</span>
          <span v-else-if="item.prop === 'param'">
            <template v-if="scope.row.paramObj">
              <span v-for="(p, i) in scope.row.paramObj" :key="i">{{p.key}}={{p.value}}<span v-if="i < scope.row.paramObj.length-1">，</span></span>
            </template>
            <template v-else>-</template>
          </span>
          <span v-else-if="item.prop === 'labels'">
            <template v-if="scope.row.labelModule">
              <span v-for="(p, i) in scope.row.labelModule" :key="i">{{p.key}}={{p.value}}<span v-if="i < scope.row.labelModule.length-1">，</span></span>
            </template>
            <template v-else>-</template>
          </span>
          <template v-else-if="item.prop === 'type'">{{scope.row.module.type}}</template>
          <div v-else-if="item.prop === 'option'">&nbsp;
            <span
              :id="'edp-edit-'+scope.row.id"
              :title="$t('overall.edit')"
              @click="editEndpoint(scope.row)"
              class="content-right-option"
              v-has="'asset_endpoint_toEdit'">
              <i class="nz-icon nz-icon-edit"></i>
            </span>
            <span :id="'asset-del-'+scope.row.id" :title="$t('overall.delete')" @click.stop="delEndpoint(scope.row)" class="content-right-option" v-has="'asset_endpoint_delete'"><i class="nz-icon nz-icon-delete"></i></span>
          </div>
          <span v-else-if="item.prop === 'lastUpdate'">{{dateFormat(scope.row.lastUpdate)}}</span>
          <span v-else-if="item.prop === 'state'" >
            <el-popover placement="right" trigger="hover" :content="getStateContent(scope.row)" popper-class="small-pop">
              <div slot="reference" style="width: 20px">
                <div :class="{'active-icon green':scope.row.state == '1','active-icon red':scope.row.state == '0', 'active-icon gray':scope.row.state == '2'}"></div>
              </div>
            </el-popover>
          </span>
          <template v-else-if="item.prop === 'alerts'">
                <el-tooltip :content="scope.row.alertNum+' '+$t('overall.active')" placement="top" effect="light" :disabled=" scope.row.alertNum < 99">
                  <span :id="'endpoint-alerts-'+scope.row.id" >
                    {{(scope.row.alertNum < 99 ? scope.row.alertNum : 99)}}
                      <sup class="linkSup" v-if="scope.row.alertNum > 99">+</sup>
                    {{' ' + $t('overall.active')}}
                  </span>
                </el-tooltip>
              </template>
          <span v-else-if="scope.row[item.prop]">{{scope.row[item.prop]}}</span>
          <template v-else>-</template>
        </template>
      </el-table-column>
      <el-table-column width="28" :resizable="false">
        <template slot="header">
          <span @mousedown.stop="!tools.showCustomTableTitle && (tools.showCustomTableTitle = true)" class="nz-table-gear" :title="$t('overall.selectColumns')">
            <i class="nz-icon nz-icon-gear"></i>
          </span>
        </template>
        <template v-slot="scope">
          <button v-if="scope.$index == 0" class="to-top" :style="{top: tools.toTopBtnTop}" :class="{'to-top-is-hover': tools.tableHover}" v-show="tools.showTopBtn" @click="$toTop('ps', 1)" :title="$t('overall.backToTop')"><i class="nz-icon nz-icon-top"></i></button>
        </template>
      </el-table-column>
    </el-table>

    <transition name="right-box">
      <add-endpoint-box v-if="rightBox.add.show" :current-project="currentProject" :current-module="currentModule" @close="closeRightBox" ref="addEndpointBox"></add-endpoint-box>
    </transition>
    <transition name="right-box">
      <edit-endpoint-box v-if="rightBox.edit.show" :current-project="currentProject" :current-module="currentModule" :endpoint="endpoint" @close="closeRightBox" ref="editEndpointBox"></edit-endpoint-box>
    </transition>
    <transition name="right-box">
      <edit-endpoint-box v-if="rightBox.editEndpoint.show" :project="currentProject" :module="currentModule" :endpoint="endpoint" @close="closeEditEndpointRightBox" ref="editEndpointBox"></edit-endpoint-box>
    </transition>
  </div>
</template>

<script>
import exportXLSX from '../../exportXLSX'
import bus from '@/libs/bus'
import deleteButton from '../../deleteButton'
import { fromRoute } from '@/components/common/js/constants'
import detailViewRightMixin from '@/components/common/mixin/detailViewRightMixin'
export default {
  name: 'endpointTab',
  components: {
    'export-excel': exportXLSX,
    'delete-button': deleteButton
  },
  props: {
    obj: Object, // 关联的实体对象
    from: { type: String }
  },
  mixin: [detailViewRightMixin],
  data () {
    return {
      fromRoute: fromRoute,
      rightBox: {
        add: { show: false },
        edit: { show: false },
        editEndpoint: { show: false }
      },
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
      endpoint: {}, // 用来查看详情和编辑的对象
      tableTitle: [
        {
          label: this.$t('project.endpoint.endpointId'),
          prop: 'id',
          show: true
        }, {
          label: this.$t('project.project.projectName'),
          prop: 'project',
          show: true,
          width: '120'
        }, {
          label: this.$t('project.module.module'),
          prop: 'module',
          show: true,
          width: '120'
        }, {
          label: this.$t('asset.asset'),
          prop: 'asset',
          show: true,
          minWidth: '400'
        }, {
          label: this.$t('asset.host'),
          prop: 'host',
          show: true,
          width: 120
        }, {
          label: this.$t('asset.port'),
          prop: 'port',
          show: true,
          width: '120'
        }, {
          label: this.$t('overall.type'),
          prop: 'type',
          show: false,
          width: 120
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
          width: '80'
        }, {
          label: this.$t('overall.alert'),
          prop: 'alerts',
          show: true,
          width: 180
        },
        /* {
            label: this.$t("project.endpoint.lastUpdate"),
            prop: 'lastUpdate',
            show: true,
          }, */
        {
          label: this.$t('config.account.option'),
          prop: 'option',
          show: true,
          width: 120
        }
      ],
      tablelable: [],
      dropCol: [],
      currentProject: { id: '', name: '', remark: '' }, // endpoint弹框、module列表用来回显project
      currentModule: { id: '', name: '', project: {}, port: '', path: '', param: '', paramObj: [] }, // endpoint弹框用来回显module
      searchMsg: { // 给搜索框子组件传递的信息
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
        }, {
          id: 34,
          name: this.$t('project.project.projectName'),
          // name: this.$t('asset.asset'),
          type: 'input',
          label: 'projectName',
          disabled: false
        }, {
          id: 35,
          name: this.$t('project.module.module'),
          // name: this.$t('asset.asset'),
          type: 'input',
          label: 'moduleName',
          disabled: false
        }]
      },
      endpointSearchLabel: { // 搜索参数
      },
      tableData: []
    }
  },
  methods: {
    // 切换tab
    changeTab (tab) {
      this.$emit('changeTab', tab)
    },
    getTableData () {
      this.tools.loading = true
      if (this.from === fromRoute.asset) {
        this.$set(this.endpointSearchLabel, 'assetId', this.asset.id)
      } else if (this.from === fromRoute.module) {
        this.$set(this.endpointSearchLabel, 'moduleIds', this.module.id)
      }
      this.$set(this.endpointSearchLabel, 'pageSize', '-1')
      this.tools.loading = true
      this.$get('monitor/endpoint', this.endpointSearchLabel).then(response => {
        this.tools.loading = false
        if (response.code === 200) {
          for (let i = 0; i < response.data.list.length; i++) {
            try {
              const param = response.data.list[i].param || '{}'
              const tempObj = JSON.parse(param)
              response.data.list[i].paramObj = []
              const labels = response.data.list[i].labels || '{}'
              const tempObj1 = JSON.parse(labels)
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
          this.tableData = response.data.list
          this.$emit('reload')
        }
      })
    },
    closeRightBox (refresh) {
      this.rightBox.add.show = false
      this.rightBox.edit.show = false
      if (refresh) {
        this.getTableData()
      }
    },
    delEndpoint (endpoint) {
      this.$confirm(this.$t('tip.confirmDelete'), {
        confirmButtonText: this.$t('tip.yes'),
        cancelButtonText: this.$t('tip.no'),
        type: 'warning'
      }).then(() => {
        this.$delete('endpoint?ids=' + endpoint.id).then(response => {
          if (response.code === 200) {
            this.$message({ duration: 1000, type: 'success', message: this.$t('tip.deleteSuccess') })
            this.getTableData()
          } else {
            this.$message.error(response.msg)
          }
        })
      })
    },
    toEdit (endpoint) {
      this.endpoint = JSON.parse(JSON.stringify(endpoint))
      if (!this.endpoint.paramObj) {
        this.$set(this.endpoint, 'paramObj', [])
      }
      this.rightBox.edit = true
      this.$nextTick(() => {
        this.$refs.editEndpointBox.show(true)
        this.$refs.editEndpointBox.toEdit(true, this.endpoint.id)
      })
    },
    editEndpoint (endpoint) {
      this.endpoint = JSON.parse(JSON.stringify(endpoint))
      this.$set(this.endpoint, 'projectId', this.endpoint.project.id)
      this.$set(this.endpoint, 'moduleId', this.endpoint.moduleId)

      this.rightBox.editEndpoint.show = true
      if (!this.endpoint.paramObj) {
        this.$set(this.endpoint, 'paramObj', [])
      }
      if (!this.endpoint.labelModule) {
        this.$set(this.endpoint, 'labelModule', [])
      }
    },
    closeEditEndpointRightBox (refresh) {
      this.rightBox.editEndpoint.show = false
      if (refresh) {
        this.getTableData()
      }
    },
    add () {
      this.rightBox.add.show = true
    },
    search (searchObj) {
      let orderBy = ''
      if (this.endpointSearchLabel.orderBy) {
        orderBy = this.endpointSearchLabel.orderBy
      }
      this.endpointSearchLabel = {}
      // this.pageObj.pageNo = 1;
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
      this.getTableData()
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
    getStateContent: function (row) {
      if (row) {
        if (row.state == 1) {
          return 'up'
        } else if (row.state == 0) {
          return 'down'
        } else if (row.state == 2) {
          return 'suspended'
        }
      }
    },
    formatUpdateTime: function (date) {
      const time = new Date(date)
      const hours = time.getHours() > 9 ? time.getHours() : '0' + time.getHours()
      const minutes = time.getMinutes() > 9 ? time.getMinutes() : '0' + time.getMinutes()

      return hours + ':' + minutes
    },
    getStateErrorMsg: function (row) {
      const errCodes = [230009, 230010, 230011]
      if (row) {
        if (row.state == 0) {
          if (errCodes.find((item) => { return row.stateInfo.code == item })) {
            return this.$t('project.endpoint.stateInfo_' + row.stateInfo.code)
          } else {
            this.$message.error('state code error')
            return row.stateInfo.msg
          }
        }
      }
    },
    initEvent () {
      bus.$on('current-project-change', project => {
        this.currentProject = project
      })
      bus.$on('current-module-change', module => {
        this.currentModule = module
      })
      // bus.$on("endpoint-list-change", menu => {
      //   this.getEndpointTableData();
      // });
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
      this.getTableData()
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
    }
  },
  watch: {
    obj: {
      immediate: true,
      deep: true,
      handler (n) {
        if (n) {
          this.searchLabel = {}
          if (this.from === fromRoute.asset) {
            this.asset = JSON.parse(JSON.stringify(n))
            this.$nextTick(() => {
              this.getTableData()
            })
          } else if (this.from === fromRoute.module) {
            this.module = JSON.parse(JSON.stringify(n))
            this.$nextTick(() => {
              this.getTableData()
            })
          }
        }
      }
    }
  },
  mounted () {
    // 初始化表头
    this.tools.customTableTitle = localStorage.getItem('nz-tableTitle-' + localStorage.getItem('nz-username') + '-/projectBottom')
      ? JSON.parse(localStorage.getItem('nz-tableTitle-' + localStorage.getItem('nz-username') + '-/projectBottom'))
      : this.tableTitle
    this.tableTitleReset(this.tableTitle, this.tools.customTableTitle)
    this.initEvent()
  },
  beforeDestroy () {
    bus.$off('current-project-change', project => {
      this.currentProject = project
    })
    bus.$on('current-module-change', module => {
      this.currentModule = module
    })
    // bus.$on("endpoint-list-change", menu => {
    //   this.getEndpointTableData();
    // });
  }
}
</script>
