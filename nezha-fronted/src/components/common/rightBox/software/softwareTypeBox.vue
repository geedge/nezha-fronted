<template>
  <div v-clickoutside="{obj: editSoftwareType, func: esc}" class="right-box right-box-editSoftwareType right-box-edit-endpoint ">
    <div class="right-box__header">
      <div class="header__title">{{editSoftwareType.id ? $t('Edit SoftwareType') : $t('new SoftwareType')}}</div>
      <div class="header__operation">
        <span v-cancel="{obj: editSoftwareType, func: esc}"><i class="nz-icon nz-icon-close" :title="$t('overall.close')"></i></span>
      </div>
    </div>
    <div class="right-box__container">
      <div class="container__form">
        <el-form ref="modelForm" :model="editSoftwareType" :rules="rules" label-position="top" label-width="120px">
          <!--name-->
          <el-form-item :label="$t('config.model.name')" prop="name">
            <el-input maxlength="64" show-word-limit v-model="editSoftwareType.name" size="small" type="text"></el-input>
          </el-form-item>
          <!--category-->
          <el-form-item :label="$t('editSoftwareType.category')" prop="category">
            <el-input maxlength="64" show-word-limit v-model="editSoftwareType.category" size="small" type="text"></el-input>
          </el-form-item>
          <!--icon-->
          <el-form-item :label="$t('config.menus.icon')" prop="icon">
            <el-dropdown trigger="click" placement="top-start">
              <div class="el-dropdown-link">
                <i v-if="editSoftwareType.icon" class="mapping-icon" :class="editSoftwareType.icon"></i>
                <div v-else class="mapping-iconSelect" :title="$t('tip.add')">
                  <i class="nz-icon nz-icon-create-square"></i>
                </div>
              </div>
              <el-dropdown-menu slot="dropdown" class="mapping-iconPop">
                <ul class="mapping-iconList">
                  <li class="mapping-iconItem" :class="{active:editSoftwareType.icon===subItem.value}" v-for="subItem in iconList" @click="iconActive(subItem)" :key="subItem.value">
                    <i :class="subItem.value"></i>
                  </li>
                </ul>
              </el-dropdown-menu>
            </el-dropdown>
          </el-form-item>
          <!--params-->
          <el-form-item :label="$t('config.assetLabel.params')" prop="category">
            <div id="module-box-params" ref="labelBoxScrollbar" style="height: 100%; overflow-x: auto;">
              <div v-for="(item, index) in editSoftwareType.paramObj" :key="index" class="param-box-row">
                <el-form-item :prop="'paramObj.' + index + '.key'" class="param-box-row-key" :rules="[{ pattern: /[a-zA-Z_][a-zA-Z0-9_]*/, message: $t('overall.ASCIIKey') ,trigger: 'blur'}]">
                  <el-input v-model="item.key" placeholder="key" size="mini" ></el-input>
                </el-form-item>
                <span class="param-box-row-eq">=</span>
                <el-form-item :prop="'paramObj.' + index + '.value'" class="param-box-row-value">
                  <vue-tags-input
                    v-model="item.tags"
                    :maxlength="32"
                    :placeholder="$t('overall.addParameter')"
                    :tags="item.value"
                    @tags-changed="(newTags)=>{tagsChange(newTags, index)}"
                  />
                </el-form-item>
                <span :id="'moduel-remove-param-'+index" class="param-box-row-symbol" @click="removeParam(index)" :title="$t('overall.delete')"><i class="nz-icon nz-icon-shanchu1"></i></span>
              </div>
            </div>
            <div style="text-align: center">
                  <span id="module-add-param" class="right-box-form-add module-add-label" type="button" @click="addParam">
                    <span :title="$t('tip.add')"><i class="nz-icon nz-icon-plus" style="font-size: 16px;"></i></span>
                  </span>
            </div>
          </el-form-item>
          <!--remark-->
          <el-form-item :label="$t('overall.remark')" prop="remark">
            <el-input maxlength="256" show-word-limit v-model="editSoftwareType.remark" size="small" :rows="2" type="textarea"></el-input>
          </el-form-item>
        </el-form>
      </div>
    </div>
    <div class="right-box__footer">
      <button id="asset-edit-cancel" v-cancel="{obj: editSoftwareType, func: esc}" class="footer__btn footer__btn--light">
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
import { sysObjectIdInput } from '@/components/common/js/validate'
import iconList from '@/components/common/js/iconList'
import VueTagsInput from '@johmun/vue-tags-input'
import bus from '@/libs/bus'

export default {
  name: 'modelBox',
  components: {
    'select-walk': selectWalk,
    VueTagsInput
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
    return {
      iconList: iconList,
      editSoftwareType: {
        id: '',
        name: '',
        category: '',
        icon: undefined,
        params: {
        },
        paramObj: [],
        remark: ''
      },
      brandList: [], // brand 列表数据
      editModule: {},
      typeDataList: [],
      // chartlList: [], // chart 列表数据
      dashboardList: [], // dashboard 列表数据
      // ChartSearchShowFields: [ // ChartSearch 下拉搜索表头
      //   { title: 'ID', data: 'id' },
      //   { title: this.$t('overall.name'), data: 'name', key: 'name' },
      //   { title: this.$t('overall.type'), data: 'type', key: 'type' },
      //   { title: this.$t('overall.remark'), data: 'remark', key: 'remark' }
      // ],
      DashboardSearchShowFields: [ // DashboardSearch 下拉搜索表头
        { title: 'ID', data: 'id' },
        { title: this.$t('overall.name'), data: 'name', key: 'name' },
        { title: this.$t('overall.remark'), data: 'remark', key: 'remark' }
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
        ],
        typeId: [
          { required: true, message: this.$t('validate.required'), trigger: 'change' }
        ],
        sysObjectId: [
          { validator: sysObjectIdInput, trigger: 'blur' }
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
        const editSoftwareType = JSON.parse(JSON.stringify(n))
        editSoftwareType.paramObj = []
        if (editSoftwareType.params) {
          Object.keys(editSoftwareType.params).forEach(key => {
            editSoftwareType.paramObj.push({
              key,
              value: editSoftwareType.params[key]
            })
          })
        }
        if (!editSoftwareType.paramObj.length) {
          editSoftwareType.paramObj.push({ key: '', value: [] })
        }
        this.editSoftwareType = editSoftwareType
      }
    }
  },
  created () {
  },
  methods: {
    clickOutside () {
      this.esc(false)
    },
    iconActive (subItem) {
      if (this.editSoftwareType.icon === subItem.value) {
        this.editSoftwareType.icon = undefined
        this.$set(this.editSoftwareType, 'icon', '')
      } else {
        this.editSoftwareType.icon = subItem.value
        this.$set(this.editSoftwareType, 'icon', subItem.value)
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
            ...this.editSoftwareType
          }
          if (this.editSoftwareType.id) {
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
    tagsChange (newTags, index) {
      this.editSoftwareType.paramObj[index].value = newTags.map(item => item.text)
    },
    // 新增param
    addParam () {
      this.editSoftwareType.paramObj.push({ key: '', value: [] })
    },
    // 移除单个param
    removeParam (index) {
      if (this.editSoftwareType.paramObj.length === 1) {
        this.editSoftwareType.paramObj = [{ key: '', value: [] }]
      }
      this.editSoftwareType.paramObj.splice(index, 1)
    }
  }
}
</script>
