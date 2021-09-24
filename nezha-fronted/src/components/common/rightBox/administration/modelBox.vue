<template>
  <div v-clickoutside="{obj: editModel, func: esc}" class="right-box right-box-model">
    <div class="right-box__header">
      <div class="header__title">{{editModel.id ? $t('config.model.editModel') : $t('config.model.createModel')}}</div>
      <div class="header__operation">
        <span v-cancel="{obj: editModel, func: esc}"><i class="nz-icon nz-icon-close"></i></span>
      </div>
    </div>
    <div class="right-box__container">
      <div class="container__form">
        <el-form ref="modelForm" :model="editModel" :rules="rules" label-position="top" label-width="120px">
          <!--name-->
          <el-form-item :label="$t('config.model.name')" prop="name">
            <el-input maxlength="64" show-word-limit v-model="editModel.name" size="small" type="text"></el-input>
          </el-form-item>
          <!--brand-->
          <el-form-item :label='$t("config.model.brand")' prop="brandId">
            <el-select value-key="id" allow-create  class="right-box__select" popper-class="right-box-select-dropdown right-public-box-dropdown prevent-clickoutside" :filterable="true" v-model="editModel.brandId" placeholder="" size="small" id="module-box-input-project">
              <el-option :id="'module-project-'+item.id" v-for="item in brandList" :key="item.id" :label="item.name" :value="item.id"></el-option>
            </el-select>
          </el-form-item>
          <!-- ChartTemplate -->
          <el-form-item :label="$t('config.model.ChartTemplate')" prop="ChartTemplate">
            <v-selectpage
            :data="chartlList"
            :tb-columns="ChartSearchShowFields"
            :params="{
              varType: 1, panelId: 0,
               returnChildren:0,groupId:0,
            }"
            :multiple="true"
           :language="language"
            title="ChartSearch"
            key-field="id"
            v-model="editModel.chartIds"
            show-field="name"
            class="form-control"
            @values="(data) => {editModel.chartIds = data.map(d => d.id).join(',')}"
            :result-format="resultFormat"
          ></v-selectpage>
          </el-form-item>
          <!--remark-->
          <el-form-item :label="$t('overall.remark')" prop="remark">
            <el-input maxlength="256" show-word-limit v-model="editModel.remark" size="small" type="text"></el-input>
          </el-form-item>
        </el-form>
      </div>
    </div>
    <div class="right-box__footer">
      <button id="asset-edit-cancel" v-cancel="{obj: editModel, func: esc}" class="footer__btn footer__btn--light">
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
import selectWalk from '../../popBox/selectWalk'
import editRigthBox from '../../mixin/editRigthBox'

export default {
  name: 'modelBox',
  components: {
    'select-walk': selectWalk
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
  mixins: [editRigthBox],
  data () {
    return {
      language: localStorage.getItem('nz-language'),
      editModel: {},
      brandList: [], // brand 列表数据
      editModule: {},
      chartlList: [], // chart 列表数据
      ChartSearchShowFields: [ // ChartSearch 下拉搜索表头
        { title: 'ID', data: 'id' },
        { title: this.$t('config.model.titleName'), data: 'name' },
        { title: this.$t('config.model.titleType'), data: 'type' },
        { title: this.$t('overall.remark'), data: 'remark' }
      ],
      url: 'asset/model',
      brandUrl: 'asset/brand',
      rightBox: { model: { show: false } },
      roles: [],
      rules: {
        name: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ],
        brandId: [
          { required: true, message: this.$t('validate.required'), trigger: 'change' }
        ]
      }
    }
  },
  watch: {
    obj: {
      deep: true,
      immediate: true,
      handler (n) {
        this.isEdit = true
        this.editModel = JSON.parse(JSON.stringify(n))
      }
    }
  },
  created () {
    this.getBrandList()
    this.ChartTemplateList()
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
    saveModel () {
      this.$refs.modelForm.validate((valid) => {
        if (valid) {
          if (this.editModel.id) {
            this.$put(this.url, this.editModel).then(res => {
              this.prevent_opt.save = false
              if (res.code === 200) {
                this.$message({ duration: 2000, type: 'success', message: this.$t('tip.saveSuccess') })
                this.esc(true)
              } else {
                this.$message.error(res.msg)
              }
            })
          } else {
            this.$post(this.url, this.editModel).then(res => {
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
    save () {
      if (typeof this.editModel.brandId === 'string') { // 判断是否是新增的
        this.$post(this.brandUrl, { name: this.editModel.brandId }).then(res => {
          if (res.code === 200) { // 新增成功
            this.getBrandList().then(res2 => { // 新增成功后，重新调用getBrandList，刷新brandList
              const newBrand = this.brandList.find(b => b.name === this.editModel.brandId) // 取出刚新增的brand对象
              if (newBrand) {
                this.editModel.brandId = newBrand.id
                this.saveModel()
              }
            })
          }
        })
      } else {
        this.saveModel()
      }
    },
    selectWalk (walk) {
      if (this.editModule.walk.indexOf(walk) != -1) {
        this.editModule.walk.splice(this.editModule.walk.indexOf(walk), 1)
      } else {
        this.editModule.walk.push(walk)
      }
    },
    /* 获取brandList列表 */
    getBrandList () {
      return new Promise((resolve, reject) => {
        this.$get('asset/brand', { pageSize: -1, pageNo: 1 }).then(response => {
          if (response.code === 200) {
            this.brandList = response.data.list
            resolve()
          }
        })
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
    /* 获取chart列表数据 */
    ChartTemplateList () {
      this.$get('visual/panel/chart', { pageSize: -1, varType: 1, panelId: 0, groupId: 0 }).then(res => {
        this.chartlList = res.data.list
      })
    }
  }
}
</script>
<style lang="scss">
  @import '@/assets/css/common/rightBoxCommon.scss';
</style>
