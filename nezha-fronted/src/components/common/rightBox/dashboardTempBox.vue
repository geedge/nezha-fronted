<template>
  <div v-clickoutside="{obj: editDashboard, func: esc}" class="right-box right-box-dashboard-temp">
    <div class="right-box__header">
      <div class="header__title">{{$t("dashboard.dashboard.createPanelTitle")}}</div>
      <div class="header__operation">
        <span v-cancel="{obj: editDashboard, func: esc}"><i class="nz-icon nz-icon-close" :title="$t('overall.close')"></i></span>
      </div>
    </div>
    <div class="right-box__container">
      <div class="container__form">
        <el-form ref="form" :model="editDashboard" :rules="rules" label-position="top" label-width="120px">
          <!-- name -->
          <el-form-item :label='$t("overall.name")' prop="name">
            <el-input v-model="editDashboard.name" maxlength="64" placeholder="" show-word-limit size="small"></el-input>
          </el-form-item>
          <!-- dashboardTemplate -->
          <el-form-item :label="$t('upload.template')" prop="tmplId">
            <v-selectpage
              :disabled="from==='integration'"
              :data="templateList"
              :tb-columns="ChartSearchShowFields"
              :multiple="false"
              :language="language"
              key-field="id"
              show-field="name"
              :width="640"
              v-model="editDashboard.tmplId"
              class="form-control"
              :result-format="resultFormat"
              @values="tempChange"
            ></v-selectpage>
          </el-form-item>
          <!-- link -->
          <el-form-item v-if="templateType" :label="templateType==1?$t('asset.asset'):$t('asset.endpoint')" prop="link" key="link">
            <v-selectpage
              :data="dataList"
              :tb-columns="templateType==1?assetColumns:endpointColumns"
              :multiple="false"
              :language="language"
              key-field="id"
              show-field="name"
              :width="640"
              v-model="editDashboard.link"
              class="form-control"
              :result-format="resultFormat"
              @values="linkChange"
            ></v-selectpage>
          </el-form-item>
          <!--description-->
          <el-form-item :label='$t("overall.remark")' prop="description">
            <el-input
              v-model="editDashboard.description"
              maxlength="256"
              :rows="2"
              show-word-limit
              size="small"
              type="textarea">
            </el-input>
          </el-form-item>
        </el-form>
      </div>
    </div>
    <div class="right-box__footer">
      <button id="asset-edit-cancel" v-cancel="{obj: editDashboard, func: esc}" class="footer__btn footer__btn--light">
        <span>{{$t('overall.cancel')}}</span>
      </button>
      <button id="asset-edit-save" :class="{'footer__btn--disabled': prevent_opt.save}" :disabled="prevent_opt.save" class="footer__btn" @click="save">
        <span>{{$t('overall.save')}}</span>
      </button>
    </div>
  </div>
</template>

<script>
import bus from '@/libs/bus'
import editRigthBox from '../mixin/editRigthBox'
export default {
  props: {
    from: String
  },
  mixins: [editRigthBox],
  data () {
    return {
      url: '/visual/dashboard/fromTmpl',
      rules: {
        name: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ],
        tmplId: [
          { required: true, message: this.$t('validate.required'), trigger: 'change' }
        ],
        link: [
          { required: true, message: this.$t('validate.required'), trigger: 'change' }
        ]
      },
      ChartSearchShowFields: [ // ChartSearch 下拉搜索表头
        { title: 'ID', data: 'id' },
        {
          title: this.$t('overall.name'),
          data: function (row) {
            if (row.name.length > 15) {
              return row.name.substring(0, 12) + '...'
            }
            return row.name
          }
        },
        {
          title: this.$t('dashboard.dashboard.chartForm.varType'),
          data: function (row) {
            let str
            switch (row.varType) {
              case 0 : str = 'None'; break
              case 1 : str = 'Asset'; break
              case 2 : str = 'Endpoint'; break
            }
            return str
          }
        },
        {
          title: this.$t('overall.remark'),
          data: function (row) {
            if (row.remark && row.remark.length > 15) {
              return row.remark.substring(0, 12) + '...'
            }
            return row.remark
          }
        }
      ],
      // asset表头
      assetColumns: [
        { title: 'id', data: 'id' },
        {
          title: this.$t('overall.name'),
          data: function (row) {
            if (row.name.length > 15) {
              return row.name.substring(0, 12) + '...'
            }
            return row.name
          }
        },
        { title: 'Manage Ip', data: 'manageIp' },
        {
          title: this.$t('overall.type'),
          data: (row) => {
            return row.type ? row.type.name : ''
          }
        },
        {
          title: this.$t('asset.model'),
          data: (row) => {
            return row.model ? row.model.name : ''
          }
        },
        {
          title: this.$t('overall.dc'),
          data: (row) => {
            return row.dc ? row.dc.name : ''
          }
        }
      ],
      // endpoint表头
      endpointColumns: [
        { title: 'ID', data: 'id' },
        {
          title: this.$t('overall.name'),
          data: function (row) {
            if (row.name.length > 15) {
              return row.name.substring(0, 12) + '...'
            }
            return row.name
          }
        },
        {
          title: this.$t('overall.project'),
          data: (row) => {
            return row.project ? row.project.name : ''
          }
        },
        {
          title: this.$t('asset.asset'),
          data: (row) => {
            return row.asset ? row.asset.name : ''
          }
        },
        {
          title: this.$t('overall.module'),
          data: (row) => {
            return row.module ? row.module.name : ''
          }
        }
      ],
      editDashboard: {
        name: '',
        type: 'dashboard',
        tmplId: '',
        link: '',
        description: ''
      },
      templateList: [],
      dataList: [],
      templateType: undefined // 选中模板的varType
    }
  },
  computed: {
    language () { return this.$store.getters.getLanguage }
  },
  created () {
    this.isEdit = true
    this.getDashboardTempData()
  },
  methods: {
    // 选中的模板变化
    tempChange: bus.debounce(function (val) {
      const newValue = this.$loadsh.get(val, ['0', 'varType'])
      const oldValue = this.templateType
      this.templateType = newValue
      // 判断varType是否变化
      if (oldValue != newValue) {
        this.getTableData()
      }
      this.$refs.form.validateField('tmplId')
    }, 50),
    // 校验
    linkChange: bus.debounce(function () {
      this.$refs.form.validateField('link')
    }, 50),
    // 获取dashboard模板列表
    getDashboardTempData () {
      if (this.from === 'integration') {
        this.editDashboard.tmplId = String(this.$parent.tempId)
        this.templateList = this.$loadsh.cloneDeep(this.$parent.panelData)
      } else {
        this.$get('visual/dashboard', { type: 'template', pageSize: -1 }).then(response => {
          if (response.code === 200) {
            this.templateList = response.data.list
          }
        })
      }
    },
    // 根据选中模板vartype请求数据
    getTableData () {
      this.editDashboard.link = ''
      this.dataList = []
      if (this.templateType === 1) {
        this.getAssetData()
      } else if (this.templateType === 2) {
        this.getEndpointData()
      }
    },
    // 获取asset列表
    getAssetData () {
      this.$get('asset/asset', { pageSize: -1 }).then(response => {
        if (response.code === 200) {
          this.dataList = response.data.list
        }
      })
    },
    // 获取endpoint列表
    getEndpointData () {
      this.$get('monitor/endpoint', { pageSize: -1 }).then(response => {
        if (response.code === 200) {
          this.dataList = response.data.list
        }
      })
    },
    save () {
      if (this.prevent_opt.save) {
        return
      }
      this.prevent_opt.save = true
      const params = this.$loadsh.cloneDeep(this.editDashboard)
      this.$refs.form.validate((valid) => {
        if (valid) {
          // 模板varType ≠ 0时link有效且必填
          if (!this.templateType) {
            delete params.link
          }
          this.$post(this.url, params).then(response => {
            this.prevent_opt.save = false
            if (response.code === 200) {
              this.$message({ duration: 1000, type: 'success', message: this.$t('tip.saveSuccess') })
              this.esc(true)
            } else {
              this.$message.error(response.msg)
            }
          })
        } else {
          this.prevent_opt.save = false
          return false
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
    /* 关闭弹框 */
    esc (refresh) {
      this.prevent_opt.save = false
      this.$emit('close', refresh)
    },
    clickOutside () {
      this.esc(false)
    }
  }
}
</script>
