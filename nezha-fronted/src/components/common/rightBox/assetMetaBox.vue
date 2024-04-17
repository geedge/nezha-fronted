<template>
  <transition name="right-box-580">
    <div class="right-box right-box-asset-meta" v-clickoutside="{obj:editAssetMeta,func:clickOutside}">
      <!-- begin--标题-->
      <div class="right-box__header">
        <div class="header__title">{{editAssetMeta.id ? $t("config.assetLabel.editMeta"): $t("config.assetLabel.addMeta")}}
        </div>
        <div class="header__operation">
          <span v-cancel="{obj: editAssetMeta, func: esc}"><i class="nz-icon nz-icon-close" :title="$t('overall.close')"></i></span>
        </div>
      </div>
      <!-- begin--表单-->
      <div class="right-box__container">
        <div class="container__form">
          <el-form label-width="120px" :model="editAssetMeta" label-position = "top" ref="editAssetMetaForm" :rules="rules">
            <el-form-item :label='$t("overall.name")' prop="name">
              <el-input placeholder="" maxlength="64" show-word-limit v-model="editAssetMeta.name" size="small" id="editAssetMeta-box-input-name"></el-input>
            </el-form-item>
            <el-form-item :label='$t("overall.key")' prop="metaKey">
              <el-input :disabled="!!(editAssetMeta.id)" placeholder="" maxlength="128" show-word-limit v-model="editAssetMeta.metaKey" size="small" id="editAssetMeta-box-input-key"></el-input>
            </el-form-item>
            <el-form-item :label='$t("dashboard.dashboard.chartForm.group")' prop="groupId">
              <el-select v-model="editAssetMeta.groupId" size="small" class="right-box__select" :placeholder="$t('el.select.placeholder')" popper-class="right-box-select-top prevent-clickoutside" :popper-append-to-body="false">
                <el-option v-for="(item, index) in groupData" :key="index" :value="item.id" :label="item.name"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item :label='$t("overall.search")' prop="search">
              <el-switch
                @change="switchSearch"
                v-model="editAssetMeta.search"
                active-value="1"
                inactive-value="0">
              </el-switch>
            </el-form-item>
            <el-form-item :label='$t("config.assetLabel.display")' prop="display">
              <el-switch
                v-model="editAssetMeta.display"
                active-value="1"
                inactive-value="0">
              </el-switch>
            </el-form-item>
            <el-form-item :label='$t("overall.type")' prop="type">
              <el-select v-model="editAssetMeta.type" :popper-append-to-body="false" class="right-box__select" popper-class="right-box-select-top prevent-clickoutside right-box-select-width" size="small" @change="selectType">
                <el-option v-for="(item, index) in typeData" :key="index" :value="item.value" :disabled="item.disabled" :label="item.name">
                  <div><i :class="item.icon"></i>&nbsp;&nbsp;<span>{{item.name}}</span></div>
                </el-option>
              </el-select>
            </el-form-item>
            <div class="right-box-sub-title" style="margin-bottom: 20px" v-if="showParam">
              <span>{{$t('config.assetLabel.params')}}</span>
              <span v-if="editAssetMeta.type.toUpperCase()!=='DATETIME'&&editAssetMeta.type.toUpperCase()!=='DOUBLE'&&editAssetMeta.type.toUpperCase()!=='TEXT'&&editAssetMeta.type.toUpperCase()!=='TEXTAREA'&&editAssetMeta.type.toUpperCase()!=='INTEGER'&&editAssetMeta.type.toUpperCase()!=='PASSWORD'" class="float-right" style="height: 19px;display: inline-block;line-height: 1;" @click="addParam">
                <span class="create-square-box" :title="$t('tip.add')">
                  <i style="font-size: 17px; cursor: pointer;" class="nz-icon nz-icon-create-square"></i>
                </span>
              </span>
            </div>
            <el-form-item prop="param" v-if="showParam" class="asset-meta-param">
              <div v-if="editAssetMeta.type.toUpperCase()==='RADIO' || editAssetMeta.type.toUpperCase()==='CHECKBOX' || editAssetMeta.type.toUpperCase()==='SELECT'" class="meta-option-box">
                <el-row class="asset-meta-param-row asset-meta-param-header">
                  <el-col :span="12">
                    {{$t('config.assetLabel.option')}}
                  </el-col>
                  <el-col :span="6">
                    {{$t('config.assetLabel.isCheck')}}
                  </el-col>
                  <el-col :span="6">
                    {{$t('config.assetLabel.operate')}}
                  </el-col>
                </el-row>
                <el-row v-for="(item,index) in editAssetMeta.param.items" :key="index" class="asset-meta-param-row">
                  <el-col :span="12">
                    <el-form-item :prop="'param.items.'+ index + '.name'" :rules="[{ required: true, message: $t('validate.required'), trigger: 'blur'},{ validator: checkItems, trigger: 'blur' }]">
                      <el-input v-model = "item.name" size="small" @input="(val)=>{inputChange(index, val)}" :ref="'metaNameOption'+index"></el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :span="6">
                    <el-radio v-if="editAssetMeta.type.toUpperCase()==='RADIO' || editAssetMeta.type.toUpperCase()==='SELECT'" v-model = "item.check" :label="true" @change="radioChange(index)">{{$t('config.assetLabel.default')}}</el-radio>
                    <el-checkbox v-else v-model="item.check" @change="checkBoxChange"> {{$t('config.assetLabel.default')}}</el-checkbox>
                  </el-col>
                  <el-col :span="6">
                    <div class="">
                  <span class="nz-icon-minus-medium" :title="$t('overall.delete')">
                    <i @click="deleteParam(index)" class="nz-icon nz-icon-minus"></i>
                  </span>
                      <span class="nz-icon-copy" :title="$t('overall.duplicate')">
                    <i @click="copyParam(index)" class="nz-icon nz-icon-override"></i>
                  </span>
                    </div>
                  </el-col>
                </el-row>
              </div>
              <div v-if="editAssetMeta.type.toUpperCase()==='DATETIME'">
                <el-row style="margin-bottom: 10px">
                  <span class="datetime-header">{{$t('config.assetLabel.dateType')}}: </span>
                  <el-radio-group v-model="editAssetMeta.param.subType">
                    <el-radio :label="'date'">{{$t('config.assetLabel.date')}}</el-radio>
                    <el-radio :label="'time'">{{$t('overall.time')}}</el-radio>
                    <el-radio :label="'datetime'">{{$t('config.assetLabel.datetimes')}}</el-radio>
                  </el-radio-group>
                </el-row>
                <el-row>
                  <span class="datetime-header">{{$t('config.assetLabel.interval')}}: </span>
                  <el-switch
                    v-model="editAssetMeta.param.interval"
                    @change="$forceUpdate()">
                  </el-switch>
                </el-row>
              </div>
              <div v-if="editAssetMeta.type.toUpperCase()==='DOUBLE'">
                <el-row>
                  <el-col :span="12" style="display: flex;align-items: center">
                    <span class="datetime-header">{{$t('config.assetLabel.decimals')}}: </span>
                    <el-input-number v-model="editAssetMeta.param.decimals" @change="$forceUpdate()" :min="0" :max="10" :controls="false" size="small" style="flex: 1"></el-input-number>
                  </el-col>
                  <el-col :span="12" style="display: flex;align-items: center">
                    <span class="datetime-header">{{$t('config.assetLabel.default')}}: </span>
                    <el-input-number v-model="editAssetMeta.param.default" @change="$forceUpdate()" :controls="false" :precision="editAssetMeta.param.decimals" size="small" style="flex: 1"></el-input-number>
                  </el-col>
                </el-row>
              </div>
              <div v-if="editAssetMeta.type.toUpperCase()==='TEXT'">
                <el-row style="display: flex">
                    <span class="datetime-header">{{$t('config.assetLabel.default')}}: </span>
                    <el-input v-model="editAssetMeta.param.default" @change="$forceUpdate()" :controls="false" size="small" style="flex: 1"></el-input>
                </el-row>
              </div>
              <div v-if="editAssetMeta.type.toUpperCase()==='TEXTAREA'">
                <el-row style="display: flex">
                  <span class="datetime-header">{{$t('config.assetLabel.default')}}: </span>
                  <el-input type="textarea" v-model="editAssetMeta.param.default" @change="$forceUpdate()" :controls="false" size="small" style="flex: 1"></el-input>
                </el-row>
              </div>
              <div v-if="editAssetMeta.type.toUpperCase()==='INTEGER'">
                <el-row style="display: flex">
                  <span class="datetime-header">{{$t('config.assetLabel.default')}}: </span>
                  <el-input-number v-model="editAssetMeta.param.default" @change="$forceUpdate()" :precision="0" :controls="false" size="small" style="flex: 1"></el-input-number>
                </el-row>
              </div>
<!--              <div v-if="editAssetMeta.type.toUpperCase()==='PASSWORD'">-->
<!--                <el-row style="display: flex">-->
<!--                  <span class="datetime-header">{{$t('config.assetLabel.default')}}: </span>-->
<!--                  <el-input v-model="editAssetMeta.param.default" @change="$forceUpdate()" type="password" size="small" style="flex: 1"  autocomplete='off' name="PASSWORD_DEFAULT"></el-input>-->
<!--                </el-row>-->
<!--              </div>-->
              <el-row v-if="showRequired">
                <span class="datetime-header">{{$t("validate.required")}}: </span>
                <el-switch
                  v-model="editAssetMeta.param.required"
                  active-value="1"
                  inactive-value="0">
                </el-switch>
              </el-row>
            </el-form-item>
            <el-form-item :label='$t("overall.remark")' prop="remark">
              <el-input placeholder="" maxlength="256" type="textarea" show-word-limit v-model="editAssetMeta.remark" size="small" :rows="2" id="editAssetMeta-box-input-remark"></el-input>
            </el-form-item>
<!--            <el-form-item :label='$t("config.assetLabel.example")'>-->
<!--              <assetTagEx :param="editAssetMeta.param" :type="editAssetMeta.type.toUpperCase()"/>-->
<!--            </el-form-item>-->
          </el-form>
        </div>
      </div>
      <!-- end--表单-->

      <!-- begin--底部按钮-->
      <div class="right-box__footer">
        <button v-cancel="{obj:editAssetMeta,func:esc}" id="editAssetMeta-box-esc" class="footer__btn footer__btn--light">
          <span>{{$t('overall.cancel')}}</span>
        </button>
        <button :class="{'nz-btn-disabled':prevent_opt.save}" :disabled="prevent_opt.save" @click="save" class="footer__btn" id="editAssetMeta-box-save">
          <span>{{$t('overall.save')}}</span>
        </button>
      </div>
      <!-- end--底部按钮-->

    </div>
  </transition>
</template>

<script>
import assetTagEx from '../../page/asset/components/assetTagEx'
import editRigthBox from '../mixin/editRigthBox'
export default {
  name: 'assetLabelBox',
  props: {
    obj: { type: Object }
  },
  components: { assetTagEx },
  mixins: [editRigthBox],
  computed: {
    showRequired () {
      let flag = false
      switch (this.editAssetMeta.type) {
        case 'DOUBLE' :
        case 'TEXT' :
        case 'TEXTAREA' :
        case 'INTEGER' :
        case 'PASSWORD' :
          flag = true
          break
        default:
          flag = false
          break
      }
      return flag
    }
  },
  data () {
    return {
      ready: false,
      editAssetMeta: {},
      rightBox: { // 面板弹出框相关
        show: false
      },
      groupData: [],
      rules: {
        name: [{ required: true, message: this.$t('validate.required'), trigger: 'change' }],
        metaKey: [{ required: true, message: this.$t('validate.required'), trigger: 'change' }, { pattern: /[a-zA-Z_][a-zA-Z0-9_]*/, message: this.$t('overall.ASCIIKey'), trigger: 'change' }],
        groupId: [{ required: true, message: this.$t('validate.required'), trigger: 'change' }],
        type: [{ required: true, message: this.$t('validate.required'), trigger: 'change' }]
      },
      value: '',
      checkItemsArr: [],
      typeData: [
        {
          icon: 'nz-icon nz-icon-text',
          disabled: true,
          value: 'TEXT',
          name: this.$t('config.assetLabel.text')
        },
        // {
        //   icon: 'nz-icon nz-icon-multitext',
        //   disabled: true,
        //   value: 'MULTITEXT',
        //   name: this.$t('config.assetLabel.multitext')
        // },
        {
          icon: 'nz-icon nz-icon-textarea',
          disabled: true,
          value: 'TEXTAREA',
          name: this.$t('config.assetLabel.textarea')
        },
        {
          icon: 'nz-icon nz-icon-radio',
          disabled: true,
          value: 'RADIO',
          name: this.$t('config.assetLabel.radio')
        },
        {
          icon: 'nz-icon nz-icon-checkbox',
          disabled: true,
          value: 'CHECKBOX',
          name: this.$t('config.assetLabel.checkbox')
        },
        {
          icon: 'nz-icon nz-icon-xialaxuanze',
          disabled: true,
          value: 'SELECT',
          name: this.$t('config.assetLabel.select')
        },
        {
          icon: 'nz-icon nz-icon-integer',
          disabled: true,
          value: 'INTEGER',
          name: this.$t('config.assetLabel.integer')
        },
        {
          icon: 'nz-icon nz-icon-double',
          disabled: true,
          value: 'DOUBLE',
          name: this.$t('config.assetLabel.double')
        },
        {
          icon: 'nz-icon nz-icon-password',
          disabled: true,
          value: 'PASSWORD',
          name: this.$t('login.pin')
        },
        {
          icon: 'nz-icon nz-icon-dingshishijian',
          disabled: true,
          value: 'DATETIME',
          name: this.$t('config.assetLabel.datetime')
        },
        {
          icon: 'nz-icon nz-icon-email',
          disabled: true,
          value: 'EMAIL',
          name: this.$t('config.assetLabel.email')
        }
      ],
      showParam: false
    }
  },
  watch: {
    obj: {
      deep: true,
      immediate: true,
      handler (n) {
        this.isEdit = true
        const param = n.param && ((typeof n.param) === 'string') ? JSON.parse(n.param) : {}
        if (!param.required) {
          param.required = '0'
        }
        this.editAssetMeta = {
          ...n,
          groupId: n.groupId ? Number(n.groupId) : '',
          search: `${n.search}`,
          display: `${n.display}`,
          param: param,
          type: n.type.toUpperCase()
        }

        this.selectType(this.editAssetMeta.type, true)
      }
    },
    'editAssetMeta.search': {
      deep: true,
      immediate: true,
      handler (n) {
        this.switchSearch(n)
      }
    }
  },
  mounted () {
    this.getGroupData()
    setTimeout(() => {
      this.ready = true
    }, 500)
  },
  methods: {
    switchSearch (value) {
      let flag = true
      if (value == 0) {
        this.typeData.forEach(t => {
          t.disabled = false
        })
      } else if (value == 1) {
        if (this.editAssetMeta.type !== 'RADIO' && this.editAssetMeta.type !== 'CHECKBOX' && this.editAssetMeta.type !== 'SELECT') {
          flag = false
          this.editAssetMeta.type = 'RADIO'
        }
        this.typeData.forEach(t => {
          if (t.value === 'RADIO' || t.value === 'CHECKBOX' || t.value === 'SELECT') {
            t.disabled = false
          } else {
            t.disabled = true
          }
        })
      } else {
        this.editAssetMeta.search = '0'
        this.typeData.forEach(t => {
          t.disabled = false
        })
      }
      this.selectType(this.editAssetMeta.type, flag)
    },
    clickOutside () {
      this.esc(false)
    },
    esc (refresh) {
      this.prevent_opt.save = false
      this.$emit('close', refresh)
    },
    save () {
      if (this.prevent_opt.save) {
        return
      }
      this.prevent_opt.save = true
      this.$refs.editAssetMetaForm.validate((valid) => {
        if (valid) {
          const param = { ...this.editAssetMeta }
          if (param.type === 'RADIO' || param.type === 'CHECKBOX' || param.type === 'SELECT') {
            for (let i = 0; i < param.param.items.length; i++) {
              if (!param.param.items[i].name) {
                this.$refs['metaNameOption' + i][0].focus()
                this.$message.error(this.$t('config.assetLabel.labelOptionNull'))
                this.prevent_opt.save = false
                return
              }
            }
          }
          param.param = JSON.stringify(param.param)
          if (this.editAssetMeta.id) {
            this.$put('asset/field/meta', param).then(response => {
              this.prevent_opt.save = false
              if (response.code === 200) {
                this.$message({ duration: 1000, type: 'success', message: this.$t('tip.saveSuccess') })
                this.esc(true)
              } else {
                this.$message.error(response.msg)
              }
            })
          } else {
            this.$post('asset/field/meta', param).then(response => {
              this.prevent_opt.save = false
              if (response.code === 200) {
                this.$message({ duration: 1000, type: 'success', message: this.$t('tip.saveSuccess') })
                this.esc(true)
              } else {
                this.$message.error(response.msg)
              }
            })
          }
        } else {
          this.prevent_opt.save = false
          return false
        }
      })
    },
    del () {
      if (this.prevent_opt.save) {
        return
      }
      this.prevent_opt.save = true
      this.$confirm(this.$t('tip.confirmDelete'), {
        confirmButtonText: this.$t('tip.yes'),
        cancelButtonText: this.$t('tip.no'),
        type: 'warning'
      }).then(() => {
        this.$delete('/alert/silence?ids=' + this.editAssetMeta.id).then(response => {
          this.prevent_opt.save = false
          if (response.code === 200) {
            this.$message({ type: 'success', message: this.$t('tip.deleteSuccess') })
            this.esc(true)
          } else {
            this.$message.error(response.msg)
          }
        })
      }).catch(() => {
        this.prevent_opt.save = false
      })
    },
    getGroupData () {
      this.$get('asset/field/group', { pageSize: -1 }).then(response => {
        if (response.code == 200) {
          this.groupData = response.data.list
        }
      })
    },
    selectType (val, init) {
      if (init) {
        switch (val) {
          case 'RADIO' :
          case 'CHECKBOX' :
          case 'SELECT' :
          case 'DATETIME' :
          case 'DOUBLE' :
          case 'TEXT' :
          case 'TEXTAREA' :
          case 'INTEGER' :
          case 'PASSWORD' :
            this.showParam = true
            break
          default:
            this.showParam = false
            break
        }
      } else {
        if (this.ready) {
          const required = this.editAssetMeta.param.required
          switch (val) {
            case 'RADIO' :
            case 'CHECKBOX' :
            case 'SELECT' :
              this.showParam = true
              this.editAssetMeta.param = {
                items: [],
                required: required
              }
              this.editAssetMeta.param.items = [{
                name: 'Option 1',
                check: false
              }, {
                name: 'Option 2',
                check: false
              }]
              break
            case 'DATETIME' :
              this.showParam = true
              this.editAssetMeta.param = {
                required: required,
                subType: 'date',
                interval: false
              }
              break
            case 'DOUBLE' :
              this.showParam = true
              this.editAssetMeta.param = {
                decimals: 2,
                default: undefined,
                required: required
              }
              break
            case 'TEXT' :
              this.showParam = true
              this.editAssetMeta.param = {
                default: '',
                required: required
              }
              break
            case 'TEXTAREA' :
              this.showParam = true
              this.editAssetMeta.param = {
                default: '',
                required: required
              }
              break
            case 'INTEGER' :
              this.showParam = true
              this.editAssetMeta.param = {
                default: undefined,
                required: required
              }
              break
            case 'PASSWORD' :
              this.showParam = true
              this.editAssetMeta.param = {
                required: required
              }
              break
            case 'EMAIL' :
              this.showParam = false
              this.editAssetMeta.param = {
                required: required
              }
              break
            default:
              this.showParam = false
              break
          }
        }
      }
    },
    inputChange (index, val) {
      this.$refs.editAssetMetaForm.clearValidate('param.items.' + index + '.name')
      this.$forceUpdate()
    },
    radioChange (i) {
      this.editAssetMeta.param.items.forEach((item, index) => {
        if (index === i) {
          item.check = !!item.check
        } else if (this.editAssetMeta.type.toUpperCase() !== 'CHECKBOX') {
          item.check = false
        }
      })
      this.$forceUpdate()
    },
    checkBoxChange () {
      this.$forceUpdate()
    },
    addParam () {
      if (this.editAssetMeta.param.items.length >= 100) {
        this.$message.error(this.$t('config.assetLabel.moreOptionsError'))
        return
      }
      this.editAssetMeta.param.items.push({
        name: '',
        check: false
      })
      this.$forceUpdate()
    },
    deleteParam (index) {
      if (this.editAssetMeta.param.items.length === 1) {
        this.$message.error(this.$t('config.assetLabel.onlyOptionError'))
        return
      }
      this.editAssetMeta.param.items.splice(index, 1)
      // 'param.items.'+ index + '.name'
      const arr = []
      this.editAssetMeta.param.items.forEach((item, index) => {
        arr.push('param.items.' + index + '.name')
      })
      this.$refs.editAssetMetaForm.clearValidate(arr)
      this.$forceUpdate()
    },
    copyParam (index) {
      if (this.editAssetMeta.param.items.length >= 100) {
        this.$message.error(this.$t('config.assetLabel.moreOptionsError'))
        return
      }
      if (this.editAssetMeta.type.toUpperCase() !== 'CHECKBOX') {
        this.editAssetMeta.param.items.push({
          name: this.editAssetMeta.param.items[index].name,
          check: false
        })
      } else {
        this.editAssetMeta.param.items.push({
          ...this.editAssetMeta.param.items[index]
        })
      }
      this.$forceUpdate()
    },
    checkItems (rule, value, callback) { // 校验是否有重复项
      const nowIndex = rule.field.split('.')[2]
      const findItem = this.editAssetMeta.param.items.find((item, index) => (item.name === value) && (index != nowIndex))
      if (!findItem) {
        if (!this.checkItemsArr.length) {
          setTimeout(() => {
            this.checkItemsArr = this.editAssetMeta.param.items.map((item, index) => {
              if (item.name) {
                return 'param.items.' + index + '.name'
              } else {
                return false
              }
            })
            this.checkItemsArr = this.checkItemsArr.filter(item => item)
            this.$refs.editAssetMetaForm.validateField(this.checkItemsArr)
            this.checkItemsArr = []
          })
        }
        callback()
      } else {
        callback(new Error(this.$t('error.nameDuplicate')))
      }
    }
  }
}
</script>
