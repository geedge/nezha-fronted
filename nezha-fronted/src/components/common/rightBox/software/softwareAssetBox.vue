<template>
  <div v-clickoutside="{obj: editSoftwareAsset, func: esc}" class="right-box right-box-editSoftwareAsset right-box-edit-endpoint ">
    <div class="right-box__header">
      <div class="header__title">{{editSoftwareAsset.id ? $t('softwareAsset.edit') : $t('softwareAsset.create')}}</div>
      <div class="header__operation">
        <span v-cancel="{obj: editSoftwareAsset, func: esc}"><i class="nz-icon nz-icon-close" :title="$t('overall.close')"></i></span>
      </div>
    </div>
    <div class="right-box__container">
      <div class="container__form">
        <el-form ref="modelForm" :model="editSoftwareAsset" :rules="rules" label-position="top" label-width="120px">
          <!--name-->
          <el-form-item :label="$t('config.model.name')" prop="name">
            <el-input maxlength="128" show-word-limit v-model="editSoftwareAsset.name" size="small" type="text"></el-input>
          </el-form-item>
          <!--type-->
          <el-form-item :label="$t('softwareType.text')" prop="typeId" class="select-warp">
<!--            <el-input maxlength="128" show-word-limit v-model="editSoftwareAsset.type" size="small" type="text"></el-input>-->
            <el-select v-model="editSoftwareAsset.typeId" size="small" class="right-box__select" popper-class="right-box-select-top prevent-clickoutside" @change="renderParams">
              <el-option v-for="item in softwareTypeArr" :key="item.id" :value="item.id" :label="item.name"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item :label='$t("asset.asset")' label-width="125px" prop="assetId" v-if="!disabled">
            <!--            <el-select id="module-box-input-asset"  @change="renderEndpoint" v-model="editEndpoint.assetId" :disabled="disabled" class="right-box__select" placeholder="" popper-class="right-box-select-top right-public-box-dropdown-top prevent-clickoutside" size="small" value-key="id">-->
            <!--              <el-option v-for="item in assetList" :id="'asset-'+item.id" :key="item.id" :label="item.name" :value="item.id"></el-option>-->
            <!--            </el-select>-->
            <v-selectpage
              :data="assetList"
              :tb-columns="columns"
              :params="{
                varType: 2, dashboardId: 0,
                returnChildren:0,groupId:0,
              }"
              :multiple="false"
              :language="language"
              title="ChartSearch"
              key-field="id"
              show-field="name"
              :width="626"
              v-model="editSoftwareAsset.assetId"
              class="form-control"
              ref="sp"
              :result-format="resultFormat"
            ></v-selectpage>
          </el-form-item>
          <!--project-->
          <el-form-item :label='$t("project.project.projectName")' class="select-warp" prop="projectId">
            <el-select id="add-endpoint-project" v-model="editSoftwareAsset.projectId" class="right-box__select" placeholder="" popper-class="right-box-select-top prevent-clickoutside" size="small" value-key="id">
              <el-option v-for="item in projectList" :id="'project-'+item.id" :key="item.id" :label="item.name" :value="item.id"></el-option>
            </el-select>
          </el-form-item>
          <!--remark-->
          <el-form-item :label="$t('overall.remark')" prop="remark">
            <el-input maxlength="256" show-word-limit v-model="editSoftwareAsset.remark" size="small" :rows="2" type="textarea"></el-input>
          </el-form-item>
          <!--params-->
          <div class="form__sub-title" >
            <span>{{$t('softwareAsset.Connector')}}</span>
          </div>
        </el-form>
      </div>
    </div>
    <div class="right-box__footer">
      <button id="asset-edit-cancel" v-cancel="{obj: editSoftwareAsset, func: esc}" class="footer__btn footer__btn--light">
        <span>{{$t('overall.cancel')}}</span>
      </button>
      <button id="asset-edit-save" :class="{'footer__btn--disabled': prevent_opt.save}" :disabled="prevent_opt.save" class="footer__btn" @click="save">
        <span>{{$t('overall.save')}}</span>
      </button>
    </div>
  </div>
</template>

<script>
// import { host, port } from '@/components/common/js/validate'
import editRigthBox from '../../mixin/editRigthBox'
import { sysObjectIdInput } from '@/components/common/js/validate'
import iconList from '@/components/common/js/iconList'
import { asset as assetConstants } from '@/components/common/js/constants'

export default {
  name: 'softwareAssetBox',
  components: {
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
    },
    language () { return this.$store.getters.getLanguage }
  },
  mixins: [editRigthBox],
  data () {
    const vm = this
    return {
      assetConstants,
      editSoftwareAsset: {
        id: '',
        name: '',
        typeId: '',
        assetId: '',
        projectId: '',
        params: {},
        remark: ''
      },
      DashboardSearchShowparamObj: [ // DashboardSearch 下拉搜索表头
        { title: 'ID', data: 'id' },
        { title: this.$t('overall.name'), data: 'name', key: 'name' },
        { title: this.$t('overall.remark'), data: 'remark', key: 'remark' }
      ],
      url: '/asset/software',
      roles: [],
      rules: {
        name: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ],
        typeId: [
          { required: true, message: this.$t('validate.required'), trigger: 'change' }
        ]
      },
      projectList: [],
      softwareTypeArr: [],
      assetList: [],
      columns: [
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
        { title: this.$t('asset.manageIp'), data: 'manageIp' },
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
    }
  },
  watch: {
    obj: {
      deep: true,
      immediate: true,
      handler (n) {
        this.isEdit = true
        const editSoftwareAsset = JSON.parse(JSON.stringify(n))
        this.editSoftwareAsset = editSoftwareAsset
      }
    },
  },
  created () {
    this.getProjectList()
    this.getAsset()
    this.getSoftwareTypeList()
  },
  mounted () {
  },
  methods: {
    clickOutside () {
      this.esc(false)
    },
    iconActive (subItem) {
      console.log(subItem, this.editSoftwareAsset.icon)
      if (this.editSoftwareAsset.icon === subItem.value) {
        this.editSoftwareAsset.icon = undefined
        this.$set(this.editSoftwareAsset, 'icon', '')
      } else {
        this.editSoftwareAsset.icon = subItem.value
        this.$set(this.editSoftwareAsset, 'icon', subItem.value)
      }
    },
    /* 关闭弹框 */
    esc (refresh) {
      this.prevent_opt.save = false
      this.$emit('close', refresh)
    },
    save () {
      this.$refs.modelForm.validate((valid) => {
        if (valid) {
          const params = {
            ...this.editSoftwareAsset
          }
          params.icon = this.imageUrl
          params.params = {}
          params.paramObj.forEach(item => {
            params.params[item.name] = item
          })
          if (this.editSoftwareAsset.id) {
            this.$put(this.url, params).then(res => {
              this.prevent_opt.save = false
              if (res.code === 200) {
                this.$message({ duration: 2000, type: 'success', message: this.$t('tip.saveSuccess') })
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
    /* 获取project列表 */
    getProjectList () {
      this.$get('monitor/project', { pageSize: -1, pageNo: 1 }).then(response => {
        if (response.code === 200) {
          this.projectList = response.data.list
        }
      })
    },
    /* 获取asset列表 */
    getAsset () {
      this.$get('asset/asset', { pageSize: -1 }).then(res => {
        this.assetList = res.data.list
      })
    },
    /* 获取softwareType列表 */
    getSoftwareTypeList () {
      this.$get('asset/software/type', { pageSize: -1, pageNo: 1 }).then(response => {
        if (response.code === 200) {
          this.softwareTypeArr = response.data.list
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
    renderParams () {
      this.editSoftwareAsset.params = {}
    }
  }
}
</script>
