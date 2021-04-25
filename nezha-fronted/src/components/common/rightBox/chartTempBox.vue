<template>
  <div v-clickoutside="{obj: editChartTemp, func: esc}" class="right-box right-box-asset">
    <div class="right-box__header">
      <div class="header__title">{{editChartTemp.id ? $t('config.user.editChartTemp') : $t('config.user.createUser')}}</div>
      <div class="header__operation">
        <span v-cancel="{obj: editChartTemp, func: esc}"><i class="nz-icon nz-icon-close"></i></span>
      </div>
    </div>
    <div class="right-box__container">
      <div class="container__form">
        <el-form ref="userForm" :model="editChartTemp" :rules="editChartTemp.id ? rules2 : rules" class="right-box-form right-box-form-left" label-position="top" label-width="120px">
          <!--type-->
          <el-form-item :label="$t('dashboard.panel.chartForm.varType')">
            <el-select class="right-box-row-with-btn" placeholder="" clearable popper-class="chart-box-dropdown-small" size="mini" v-model="editChartTemp.varType" value-key="chartType" id="chart-box-group">
              <el-option :key="item.id" :label="item.name" :value="item.id" v-for="item in varTypeArr">
                <span class="panel-dropdown-label-txt" >{{item.name}}</span>
              </el-option>
            </el-select>
          </el-form-item>
          <!--chartTemp list-->
          <el-form-item :label="$t('dashboard.panel.chartForm.varType')">
            <el-select class="right-box-row-with-btn" placeholder="" clearable popper-class="chart-box-dropdown-small" size="mini" v-model="editChartTemp.pid" value-key="chartType" id="chart-box-group">
              <el-option :key="item.id" :label="item.name" :value="item.id" v-for="item in chartTempArr">
                <span class="panel-dropdown-label-txt" >{{item.name}}</span>
              </el-option>
            </el-select>
          </el-form-item>

          <!-- 选择资产，穿梭框 -->
          <div class="form__sub-title">{{$t('overall.select')}}</div>
          <nz-transfer ref="transfer"
                       :page-obj="transfer.pageObj"
                       :search-msg="transfer.searchMsg"
                       :table-data="transfer.tableData"
                       style="margin-bottom: 20px;"
                       @leftToRight="addAsset"
                       @search="search"
                       @rightToLeft="removeAsset">
            <template v-slot:title>Selected</template>
          </nz-transfer>
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
export default {
  name: 'chartTemp',
  components: {
    nzTransfer
  },
  props: {
    obj: {
      type: Object
    }
  },
  computed: {
    isCurrentUser () {
      return function (username) {
        return localStorage.getItem('nz-username') == username
      }
    }
  },
  data () {
    return {
      editChartTemp: {},
      url: 'visual/panel/chart/fromTmpl',
      rightBox: { model: { show: false } },
      rules: { // 表单校验规则
        name: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ]
      },
      varTypeArr: [
        { name: 'Asset', id: 1 },
        { name: 'Endpoint', id: 2 }
      ],
      chartTempArr: [],
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
              name: this.$t('asset.state'),
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
      }
    }
  },
  watch: {
    obj: {
      deep: true,
      immediate: true,
      handler (n) {
        this.editChartTemp = JSON.parse(JSON.stringify(n))
      }
    }
  },
  mounted () {
    this.getChartTempData()
    this.getAssetData()
  },
  methods: {
    clickOutside () {
      this.esc(false)
    },
    /* 关闭弹框 */
    esc (refresh) {
      this.prevent_opt.save = false
      this.$emit('close', refresh)
    },
    save () {
      if (this.prevent_opt.save) { return } ;
      this.prevent_opt.save = true
      if (!this.transfer.selectedData.length) {
        this.prevent_opt.save = false
        if (this.editChartTemp.varType === 1) {
          this.$message.error('请选择Asset')
        } else {
          this.$message.error('请选择Endpoint')
        }
        return
      }
      this.editChartTemp.varIds = this.transfer.selectedData.map(item => item.id)
      this.$refs.userForm.validate((valid) => {
        if (valid) {
          if (this.editChartTemp.id) {
            this.$put(this.url, this.editChartTemp).then(res => {
              this.prevent_opt.save = false
              if (res.code === 200) {
                this.$message({ duration: 2000, type: 'success', message: this.$t('tip.saveSuccess') })
                this.esc(true)
              } else {
                this.$message.error(res.msg)
              }
            })
          } else {
            this.$post(this.url, this.editChartTemp).then(res => {
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
      this.getAssetData()
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
      this.$get('visual/panel/chart', { pageSize: -1, panelId: 0, returnChildren: 0, varType: this.editChartTemp.varType }).then(response => {
        if (response.code === 200) {
          this.chartTempArr = response.data.list
        }
      })
    },
    getAssetData () {
      this.$refs.transfer.startLoading()
      this.$get('asset/asset', { ...this.transfer.searchLabel, ...this.transfer.pageObj }).then(response => {
        this.$refs.transfer.endLoading()
        if (response.code === 200) {
          this.transfer.tableData = response.data.list
          this.transfer.pageObj.total = response.data.total
        }
      })
    },
    getEndpointData () {
      this.$refs.transfer.startLoading()
      this.$get('monitor/endpoint', { ...this.transfer.searchLabel, ...this.transfer.pageObj }).then(response => {
        this.$refs.transfer.endLoading()
        if (response.code === 200) {
          this.transfer.tableData = response.data.list
          this.transfer.pageObj.total = response.data.total
        }
      })
    },
    varTypeChange () {

    }
  }
}
</script>
<style lang="scss">
  @import '@/assets/css/common/rightBoxCommon.scss';
</style>
