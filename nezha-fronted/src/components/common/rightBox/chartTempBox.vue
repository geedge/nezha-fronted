<template>
  <div v-clickoutside="{obj: editChartTemp, func: esc}" class="right-box right-box-chart-temp">
    <div class="right-box__header">
      <div class="header__title">{{editChartTemp.id ? $t('dashboard.panel.createChartByTemp') :$t('dashboard.panel.createChartByTemp')}}</div>
      <div class="header__operation">
        <span v-cancel="{obj: editChartTemp, func: esc}"><i class="nz-icon nz-icon-close" :title="$t('overall.close')"></i></span>
      </div>
    </div>
    <div class="right-box__container">
      <div class="container__form">
        <el-form ref="userForm" :model="editChartTemp" :rules="rules" label-position="top" label-width="120px">
          <!--type-->
          <el-form-item v-if="from !== fromRoute.endpoint" :label="$t('dashboard.panel.chartForm.varType')" prop="varType">
            <el-select id="chart-box-group"
              v-model="editChartTemp.varType"
              class="right-box__select"
              clearable
              placeholder=""
              popper-class="prevent-clickoutside right-box-select-top"
              size="small"
              value-key="chartType"
              @change="varTypeChange">
              <el-option :key="item.id" :label="item.name" :value="item.id" v-for="item in varTypeArr">
                <span class="panel-dropdown-label-txt" >{{item.name}}</span>
              </el-option>
            </el-select>
          </el-form-item>
          <!--chartTemp list-->
          <el-form-item :label="$t('overall.chartTemplate')" prop="pid">
<!--            <el-select id="chart-box-group"-->
<!--                       v-model="v"-->
<!--                       filterable-->
<!--                       class="right-box__select" clearable-->
<!--                       placeholder=""-->
<!--                       popper-class="prevent-clickoutside right-box-select-top"-->
<!--                       size="small"-->
<!--                       value-key="chartType" >-->
<!--              <el-option :key="item.id" :label="item.name" :value="item.id" v-for="item in chartTempArr">-->
<!--                <span class="panel-dropdown-label-txt" >{{item.name}}</span>-->
<!--              </el-option>-->
<!--            </el-select>-->
            <v-selectpage
              :data="chartTempArr"
              :tb-columns="ChartSearchShowFields"
              :params="{
                varType: 2, panelId: 0,
                returnChildren:0,groupId:0,
              }"
              :multiple="false"
              :language="language"
              title="ChartSearch"
              key-field="id"
              show-field="name"
              :width="626"
              v-model="editChartTemp.pid"
              class="form-control"
              :result-format="resultFormat"
            ></v-selectpage>
          </el-form-item>

          <!-- 选择资产，穿梭框 -->
          <template v-if="showTransfer">
            <div class="form__sub-title">{{editChartTemp.varType === 1 ? $t('overall.asset') : $t('project.endpoint.endpoint')}}</div>
            <nz-transfer
              ref="transfer"
              :from="from"
              :page-obj="transfer.pageObj"
              :search-msg="transfer.searchMsg"
              :table-data="transfer.tableData"
              :tableTitle="transferTableTitle"
              style="margin-bottom: 20px;"
              @pageNo="pageNoChange"
              @leftToRight="addAsset"
              @rightToLeft="removeAsset"
              @search="search">
              <template v-slot:title>{{$t('overall.selected')}}</template>
            </nz-transfer>
          </template>
        </el-form>
      </div>
    </div>
    <div class="right-box__footer">
      <button id="asset-edit-cancel" v-cancel="{obj: editChartTemp, func: esc}" class="footer__btn footer__btn--light">
        <span>{{$t('overall.cancel')}}</span>
      </button>
      <button id="asset-edit-save" :class="{'footer__btn--disabled': prevent_opt.save}" :disabled="prevent_opt.save" class="footer__btn" @click="save">
        <span>{{$t('overall.save')}}</span>
      </button>
    </div>
  </div>
</template>

<script>
import nzTransfer from '@/components/common/nzTransfer'
import { fromRoute } from '@/components/common/js/constants'
import editRigthBox from '../mixin/editRigthBox'

export default {
  name: 'chartTempBox',
  components: {
    nzTransfer
  },
  props: {
    obj: {
      type: Object
    },
    from: String
  },
  mixins: [editRigthBox],
  data () {
    return {
      fromRoute,
      editChartTemp: {},
      url: 'visual/panel/chart/fromTmpl',
      rules: { // 表单校验规则
        varType: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ],
        pid: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ]
      },
      varTypeArr: [
        { name: 'Asset', id: 1 },
        { name: 'Endpoint', id: 2 }
      ],
      chartTempArr: [],
      ChartSearchShowFields: [ // ChartSearch 下拉搜索表头
        { title: 'ID', data: 'id' },
        {
          title: this.$t('overall.name'),
          data: function (row) {
            if (row.name.length > 15) {
              return row.name.substring(0, 12) + '...'
            }
            return row.name
          },
          key: 'name'
        },
        { title: this.$t('overall.type'), data: 'type', key: 'type' },
        {
          title: this.$t('overall.remark'),
          data: function (row) {
            if (row.remark && row.remark.length > 15) {
              return row.remark.substring(0, 12) + '...'
            }
            return row.remark
          },
          key: 'remark'
        }
      ],
      tableData: [],
      transfer: {
        tableData: [],
        selectedData: [],
        searchLabel: {},
        searchMsg: { // 给搜索框子组件传递的信息
          zheze_none: true,
          searchLabelList: [
            {
              id: 1,
              name: 'ID',
              type: 'input',
              label: 'id',
              disabled: false
            }, {
              id: 20,
              name: 'SN',
              type: 'input',
              label: 'sn',
              disabled: false
            }, {
              id: 21,
              name: 'Host',
              type: 'input',
              label: 'host',
              disabled: false
            }, {
              id: 22,
              name: this.$t('overall.state'),
              type: 'select',
              label: 'assetState',
              disabled: false
            }, {
              id: 23,
              name: 'pingStatus',
              type: 'select',
              label: 'pingStatus',
              disabled: false
            }, {
              id: 23,
              name: this.$t('asset.cabinet'),
              type: 'input',
              label: 'cabinetName',
              disabled: false
            }
          ]
        },
        pageObj: {
          pageNo: 1,
          pageSize: 10,
          pages: 1,
          total: 0
        }
      },
      transferTableTitle: [
        {
          label: this.$t('overall.name'),
          prop: 'name',
          show: true
        },
        {
          label: this.$t('asset.host'),
          prop: 'manageIp',
          show: true
        }
      ]
    }
  },
  watch: {
    obj: {
      deep: true,
      immediate: true,
      handler (n) {
        this.isEdit = true
        this.editChartTemp = JSON.parse(JSON.stringify(n))
      }
    }
  },
  mounted () {
    this.getChartTempData()
    this.getTableData()
  },
  computed: {
    showTransfer () {
      if (this.from === fromRoute.endpoint) {
        return false
      } else if (this.from === fromRoute.asset && this.editChartTemp.varType === 1) {
        return false
      }
      return true
    },
    language () { return this.$store.getters.getLanguage }
  },
  methods: {
    pageNoChange (val) {
      this.transfer.pageObj.pageNo = val
      this.getTableData()
    },
    clickOutside () {
      this.esc(false)
    },
    /* 关闭弹框 */
    esc (refresh) {
      this.prevent_opt.save = false
      this.$emit('close', refresh)
    },
    save () {
      if (this.prevent_opt.save) { return }
      this.prevent_opt.save = true
      if (!this.transfer.selectedData.length) {
        this.prevent_opt.save = false
        if (this.from !== fromRoute.endpoint) { // 来自endpoint时不校验
          if (this.editChartTemp.varType === 1) {
            if (this.from !== fromRoute.asset) { // 来自asset且type=1时不校验
              this.$message.error(this.$t('dashboard.panel.chartForm.selectAsset'))
              return
            }
          } else {
            this.$message.error(this.$t('dashboard.panel.chartForm.selectEndpoint'))
            return
          }
        }
      }
      if (this.from === fromRoute.asset && this.editChartTemp.varType === 1) { // 来自asset时取assetId
        this.editChartTemp.varIds = this.obj.varIds
      } else if (this.from === fromRoute.endpoint) { // 来自endpoint时取endpointId
        this.editChartTemp.varIds = this.obj.varIds
      } else {
        this.editChartTemp.varIds = this.$refs.transfer.selectedData.map(item => item.id)
      }
      this.$refs.userForm.validate((valid) => {
        const params = this.$loadsh.cloneDeep(this.editChartTemp)
        params.pid = Number(params.pid)
        if (valid) {
          if (params.id) {
            this.$put(this.url, params).then(res => {
              this.prevent_opt.save = false
              if (res.code === 200) {
                this.$message({ duration: 2000, type: 'success', message: this.$t('tip.saveSuccess') })
                this.$emit('on-create-success')
                this.esc(true)
              } else {
                this.$message.error(res.msg)
              }
            })
          } else {
            this.$post(this.url, params).then(res => {
              this.prevent_opt.save = false
              if (res.code === 200) {
                this.$message({ duration: 2000, type: 'success', message: this.$t('tip.saveSuccess') })
                this.esc(true)
              } else {
                this.$message.error(res.msg)
              }
            })
          }
        } else {
          this.prevent_opt.save = false
          return false
        }
      })
    },
    search (searchLabel, page) {
      this.transfer.searchLabel = JSON.parse(JSON.stringify(searchLabel))
      this.transfer.pageObj = JSON.parse(JSON.stringify(page))
      this.getTableData()
    },
    addAsset (toAdd) {
      this.transfer.selectedData = toAdd
      this.transfer.tableData.forEach(d => {
        this.$set(d, 'hide', this.transfer.selectedData.some(s => s.id === d.id))
      })
    },
    removeAsset (toRemove) {
      this.transfer.selectedData = this.transfer.selectedData.filter(d => !toRemove.find(s => d.id === s.id))
      this.transfer.tableData.forEach(d => {
        this.$set(d, 'hide', this.transfer.selectedData.some(s => s.id === d.id))
      })
      // dc, brand, model, type
    },
    getChartTempData () {
      this.$get('visual/panel/chart', { pageSize: -1, panelId: 0, returnChildren: 0, varType: this.editChartTemp.varType, groupId: 0 }).then(response => {
        if (response.code === 200) {
          this.chartTempArr = response.data.list
        }
      })
    },
    resultFormat (resp) {
      if (resp && resp.data) {
        const assetData = {}
        assetData.list = resp.data.list
        assetData.totalRow = resp.data.total
        return assetData
      }
    },
    getTableData () {
      if (this.editChartTemp.varType === 1) {
        this.getAssetData()
      } else {
        this.getEndpointData()
      }
    },
    getAssetData () {
      this.$refs.transfer && this.$refs.transfer.startLoading()
      this.$get('asset/asset', { ...this.transfer.searchLabel, ...this.transfer.pageObj }).then(response => {
        this.$refs.transfer && this.$refs.transfer.endLoading()
        if (response.code === 200) {
          this.transfer.tableData = response.data.list
          this.transfer.pageObj.total = response.data.total
          this.transfer.pageObj.pages = response.data.pages
        }
      })
    },
    getEndpointData () {
      this.$refs.transfer && this.$refs.transfer.startLoading()
      const idFilter = {}
      if (this.from === fromRoute.asset) {
        idFilter.assetIds = this.obj.varIds[0]
      }
      this.$get('monitor/endpoint', { ...this.transfer.searchLabel, ...this.transfer.pageObj, ...idFilter }).then(response => {
        this.$refs.transfer && this.$refs.transfer.endLoading()
        if (response.code === 200) {
          this.transfer.tableData = response.data.list
          this.transfer.pageObj.total = response.data.total
          this.transfer.pageObj.pages = response.data.pages
        }
      })
    },
    varTypeChange () {
      this.getChartTempData()
      this.editChartTemp.pid = ''
      // 从asset详情页进来的，varType=1时不显示asset列表，varId默认为asset的id; 从endpoint详情页进来的，varId默认为endpoint的id
      if ((this.from === fromRoute.asset && this.editChartTemp.varType === 1) || this.from === fromRoute.endpoint) {
        this.transfer.selectedData = this.obj.varIds
      } else {
        this.transfer.selectedData = []
      }
      if (this.editChartTemp.varType === 1) {
        this.transferTableTitle = [
          {
            label: this.$t('overall.name'),
            prop: 'name',
            show: true
          },
          {
            label: this.$t('asset.host'),
            prop: 'manageIp',
            show: true
          }
        ]
        this.transfer.searchMsg.searchLabelList = [
          {
            id: 1,
            name: 'ID',
            type: 'input',
            label: 'id',
            disabled: false
          }, {
            id: 20,
            name: 'SN',
            type: 'input',
            label: 'sn',
            disabled: false
          }, {
            id: 21,
            name: 'Host',
            type: 'input',
            label: 'host',
            disabled: false
          }, {
            id: 22,
            name: this.$t('overall.state'),
            type: 'select',
            label: 'assetState',
            disabled: false
          }, {
            id: 23,
            name: 'pingStatus',
            type: 'select',
            label: 'pingStatus',
            disabled: false
          }, {
            id: 23,
            name: this.$t('asset.cabinet'),
            type: 'input',
            label: 'cabinetName',
            disabled: false
          }
        ]
      } else {
        this.transferTableTitle = [
          {
            label: 'ID',
            prop: 'id',
            show: true
          },
          {
            label: this.$t('overall.name'),
            prop: 'name',
            show: true
          }
        ]
        this.transfer.searchMsg.searchLabelList = [
          {
            id: 11,
            name: 'project id',
            type: 'input',
            label: 'projectIds',
            disabled: false
          }, {
            id: 12,
            name: 'endpoint name',
            type: 'input',
            label: 'name',
            disabled: false
          },
          {
            id: 13,
            name: 'endpoint id',
            type: 'input',
            label: 'id',
            disabled: false
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
        if (this.from !== fromRoute.asset) {
          this.transfer.searchMsg.searchLabelList.push({
            id: 14,
            name: this.$t('asset.asset'),
            type: 'query',
            label: 'query',
            disabled: false
          })
        }
      }
      this.$nextTick(() => {
        this.$refs.transfer.selectedData = []
        this.getTableData()
      })
    }
  }
}
</script>
