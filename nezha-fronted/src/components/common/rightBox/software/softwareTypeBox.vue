<template>
  <div v-clickoutside="{obj: editSoftwareType, func: esc}" class="right-box right-box-editSoftwareType right-box-edit-endpoint ">
    <div class="right-box__header">
      <div class="header__title">{{editSoftwareType.id ? $t('softwareType.edit') : $t('softwareType.create')}}</div>
      <div class="header__operation">
        <span v-cancel="{obj: editSoftwareType, func: esc}"><i class="nz-icon nz-icon-close" :title="$t('overall.close')"></i></span>
      </div>
    </div>
    <div class="right-box__container">
      <div class="container__form">
        <el-form ref="modelForm" :model="editSoftwareType" :rules="rules" label-position="top" label-width="120px">
          <!--name-->
          <el-form-item :label="$t('config.model.name')" prop="name">
            <el-input maxlength="128" show-word-limit v-model="editSoftwareType.name" size="small" type="text"></el-input>
          </el-form-item>
          <!--category-->
          <el-form-item :label="$t('softwareType.category')" prop="category">
            <el-input maxlength="128" show-word-limit v-model="editSoftwareType.category" size="small" type="text"></el-input>
          </el-form-item>
          <!--icon-->
<!--          <el-form-item :label="$t('config.menus.icon')" prop="icon">-->
<!--            <el-upload-->
<!--              class="avatar-uploader"-->
<!--              action="#"-->
<!--              :show-file-list="false"-->
<!--              :on-change="beforeAvatarUpload"-->
<!--              :auto-upload="false"-->
<!--              accept=".jpg,.png"-->
<!--              :limit="1"-->
<!--              :on-remove="handleRemove"-->
<!--              ref="avatarUploader"-->
<!--              :fileList="fileList"-->
<!--            >-->
<!--              <img v-if="imageUrl" :src="imageUrl" class="avatar">-->
<!--              <i v-else class="nz-icon nz-icon-create-square avatar-uploader-icon"></i>-->
<!--              <i class="nz-icon nz-icon-circle-close" v-if="imageUrl" @click.stop="removeIcon" :title="$t('overall.delete')"/>-->
<!--            </el-upload>-->
<!--          </el-form-item>-->
          <!--remark-->
          <el-form-item :label="$t('overall.remark')" prop="remark">
            <el-input maxlength="256" show-word-limit v-model="editSoftwareType.remark" size="small" :rows="2" type="textarea"></el-input>
          </el-form-item>
          <!--params-->
          <div class="form__sub-title" >
            <span>{{$t('softwareType.params')}}</span>
          </div>
          <el-form-item prop="paramObj">
            <div v-for="(label, i) in editSoftwareType.paramObj" :key="i" class="form__dotted-item form__dotted-item-required">
              <el-form-item :prop="'paramObj.' + i + '.value.0'" :rules="[]">
                <template v-slot:label>
                  <div class="form__labels-label">
                    <span>{{label.name}}</span>
                    <div>
                      <span @click="removeLabel(label)" class="form__labels-label__span" :title="$t('overall.delete')"><i class="nz-icon nz-icon-minus"></i></span>
                    </div>
                  </div>
                </template>
                <template v-if="label.action !== 1">
                  <template v-if="label.type.toUpperCase() === assetConstants.labelTypeData.TEXT">
                    <el-input v-model="label.value[0]" size="small"/>
                  </template>
                  <template v-else-if="label.type.toUpperCase() === assetConstants.labelTypeData.PASSWORD">
                    <el-input v-model="label.value[0]" type="password" size="small"/>
                  </template>
                  <template v-else-if="label.type.toUpperCase() === assetConstants.labelTypeData.MULTITEXT">
                    <div v-for="(value, i) in label.value" :key="i" class="label__multi-text">
                      <el-input v-model="label.value[i]" size="small"/>
                      <span @click="addMultiTextRow(label)" style="margin: 0 5px" :title="$t('tip.add')"><i class="nz-icon nz-icon-plus"></i></span>
                      <span @click="removeMultiTextRow(label, i)" :title="$t('overall.delete')"><i class="nz-icon nz-icon-minus"></i></span>
                    </div>
                  </template>
                  <template v-else-if="label.type.toUpperCase() === assetConstants.labelTypeData.TEXTAREA">
                    <el-input v-model="label.value[0]" :maxlength="4096" show-word-limit size="small" :rows="2" type="textarea"/>
                  </template>
                  <template v-else-if="label.type.toUpperCase() === assetConstants.labelTypeData.RADIO">
                    <el-radio-group v-model="label.value[0]">
                      <el-radio v-for="item in JSON.parse(label.param).items" :key="item.name" :label="item.name">{{item.name}}</el-radio>
                    </el-radio-group>
                  </template>
                  <template v-else-if="label.type.toUpperCase() === assetConstants.labelTypeData.CHECKBOX">
                    <el-checkbox-group v-model="label.value">
                      <el-checkbox v-for="item in JSON.parse(label.param).items" :key="item.name" :label="item.name" :value="item.name"></el-checkbox>
                    </el-checkbox-group>
                  </template>
                  <template v-else-if="label.type.toUpperCase() === assetConstants.labelTypeData.SELECT">
                    <el-select v-model="label.value[0]" class="right-box__select" :placeholder="$t('el.select.placeholder')" popper-class="right-box-select-top prevent-clickoutside" size="small">
                      <el-option v-for="item in JSON.parse(label.param).items" :key="item.name" :label="item.name" :value="item.name"></el-option>
                    </el-select>
                  </template>
                  <template v-else-if="label.type.toUpperCase() === assetConstants.labelTypeData.INTEGER">
                    <el-input v-model="label.value[0]" oninput="value=value.replace(/[^\d]/g,'')" size="small"></el-input>
                  </template>
                  <template v-else-if="label.type.toUpperCase() === assetConstants.labelTypeData.DOUBLE">
                    <el-input-number v-model="label.value[0]" :controls="false" size="small" :precision="JSON.parse(label.param).decimals" style="width: 100%;text-align: left" :max="10000000000000000000" :min="-10000000000000000000"></el-input-number>
                  </template>
                  <template v-else-if="label.type.toUpperCase() === assetConstants.labelTypeData.DATETIME">
                    <template v-if="JSON.parse(label.param).subType === assetConstants.labelSubTypeData.time">
                      <div v-if="JSON.parse(label.param).interval" style="display: flex; justify-content: space-between">
                        <el-time-select v-model="label.value[0]" size="small"></el-time-select>
                        <el-time-select v-model="label.value[1]" size="small"></el-time-select>
                      </div>
                      <template v-else>
                        <el-time-select v-model="label.value[0]" size="small" style="width: 100%"></el-time-select>
                      </template>
                    </template>
                    <template v-else>
                      <template v-if="JSON.parse(label.param).interval">
                        <my-date-picker
                          id="asset-box-input-purchase-date"
                          v-model="label.value"
                          :type="JSON.parse(label.param).subType === assetConstants.labelSubTypeData.date ? 'daterange' : 'datetimerange'"
                          placeholder=""
                          popper-class="right-box-select-top"
                          size="small"
                          :format="timeFormatStrToDatePickFormat(timeFormatMain,JSON.parse(label.param).subType === assetConstants.labelSubTypeData.date)"
                          style="width: 100%">
                        </my-date-picker>
                      </template>
                      <template v-else>
                        <my-date-picker
                          id="asset-box-input-parchase-date"
                          v-model="label.value[0]"
                          :type="JSON.parse(label.param).subType"
                          placeholder=""
                          popper-class="right-box-select-top"
                          size="small"
                          style="width: 100%"
                          :format="timeFormatStrToDatePickFormat(timeFormatMain, JSON.parse(label.param).subType === assetConstants.labelSubTypeData.date)">
                        </my-date-picker>
                      </template>
                    </template>
                  </template>
                  <template v-else-if="label.type.toUpperCase() === assetConstants.labelTypeData.EMAIL">
                    <el-input v-model="label.value[0]" size="small"/>
                  </template>
                </template>
              </el-form-item>
            </div>
            <!-- label的新增按钮 -->
            <div class="form__flex-container hide-casc-input">
              <button class="form__create-btn" type="button" @click.stop :title="$t('tip.add')"><i class="nz-icon nz-icon-create-square"></i></button>
              <el-cascader
                v-if="labelCascShow"
                :options="options.fieldGroupOptions"
                :props="labelCascProp"
                class="hide-input"
                :title="$t('tip.add')"
                popper-class="prevent-clickoutside right-box-select-top limit-height"
                size="small"
                @change="addLabel"
              ></el-cascader>
            </div>
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
import editRigthBox from '../../mixin/editRigthBox'
import { sysObjectIdInput } from '@/components/common/js/validate'
import iconList from '@/components/common/js/iconList'
import { asset as assetConstants } from '@/components/common/js/constants'

export default {
  name: 'softwareTypeBox',
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
      imageUrl: '',
      fileList: [],
      iconList: iconList,
      labelCascShow: true, // 用来控制label的cascader的重新渲染
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
      options: {
        fieldGroupOptions: []
      },
      brandList: [], // brand 列表数据
      editModule: {},
      typeDataList: [],
      // chartlList: [], // chart 列表数据
      dashboardList: [], // dashboard 列表数据
      DashboardSearchShowparamObj: [ // DashboardSearch 下拉搜索表头
        { title: 'ID', data: 'id' },
        { title: this.$t('overall.name'), data: 'name', key: 'name' },
        { title: this.$t('overall.remark'), data: 'remark', key: 'remark' }
      ],
      url: '/asset/software/type',
      rightBox: { model: { show: false } },
      roles: [],
      rules: {
        name: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ],
        category: [
          { required: true, message: this.$t('validate.required'), trigger: 'change' }
        ]
      },
      labelCascProp: {
        lazy: true,
        value: 'id',
        label: 'name',
        lazyLoad (node, resolve) {
          const { level } = node
          if (node && node.data) {
            vm.$get('asset/field/meta', { groupIds: node.data.id, pageSize: -1 }).then(response => {
              if (response.code === 200) {
                const meta = response.data.list.map(item => ({
                  ...item,
                  leaf: level >= 1,
                  disabled: vm.editSoftwareType.paramObj.some(a => a.id === item.id)
                }))
                vm.options.metaOptions = meta
                resolve(meta)
              }
            })
          }
        }
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
        this.imageUrl = editSoftwareType.icon
        editSoftwareType.paramObj = []
        if (editSoftwareType.params) {
          Object.keys(editSoftwareType.params).forEach(key => {
            editSoftwareType.paramObj.push(editSoftwareType.params[key])
          })
        }
        this.editSoftwareType = editSoftwareType
      }
    }
  },
  created () {
  },
  mounted () {
    this.getFieldGroupData()
  },
  methods: {
    clickOutside () {
      this.esc(false)
    },
    getFieldGroupData () {
      return new Promise(resolve => {
        this.$get('asset/field/group', { pageSize: -1 }).then(response => {
          if (response.code === 200) {
            this.options.fieldGroupOptions = response.data.list
          }
          resolve()
        })
      })
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
          params.icon = this.imageUrl
          params.params = {}
          params.paramObj.forEach(item => {
            params.params[item.name] = item
          })
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
    removeLabel (label) {
      let index = 0
      this.editSoftwareType.paramObj.find((f, i) => {
        if (label.id === f.id) {
          index = i
          return true
        }
        return false
      })
      this.editSoftwareType.paramObj.splice(index, 1)
      this.labelCascShow = false
      this.$nextTick(() => {
        this.labelCascShow = true
      })
    },
    addMultiTextRow (label) {
      label.value.push('')
    },
    removeMultiTextRow (label, index) {
      if (label.value.length === 1) {
        return
      }
      label.value.splice(index, 1)
    },
    blankLabelValue (label) {
      const defaultValue = JSON.parse(label.param).default || ''
      if (label.type.toUpperCase() === this.assetConstants.labelTypeData.CHECKBOX) {
        const arr = []
        if (label.param && JSON.parse(label.param).items) {
          JSON.parse(label.param).items.forEach(item => {
            if (item.check) {
              arr.push(item.name)
            }
          })
        }
        return arr
      } else if (label.type.toUpperCase() === this.assetConstants.labelTypeData.MULTITEXT || label.type.toUpperCase() === assetConstants.labelTypeData.TEXT || label.type.toUpperCase() === assetConstants.labelTypeData.TEXTAREA) {
        return [defaultValue]
      } else if (label.type.toUpperCase() === this.assetConstants.labelTypeData.RADIO || label.type.toUpperCase() === assetConstants.labelTypeData.SELECT) {
        const arr = ['']
        if (label.param && JSON.parse(label.param).items) {
          JSON.parse(label.param).items.forEach(item => {
            if (item.check) {
              arr[0] = item.name
            }
          })
        }
        return arr
      } else {
        return [defaultValue]
      }
    },
    addLabel ([groupId, metaId]) {
      const label = this.options.metaOptions.find(m => m.id === metaId)
      this.editSoftwareType.paramObj.push({ ...label, value: this.blankLabelValue(label), action: 0 })
      this.labelCascShow = false
      this.$nextTick(() => {
        this.labelCascShow = true
      })
    },
    beforeAvatarUpload (file, fileList) {
      const this_ = this
      const isJPG = (file.raw.type === 'image/jpeg' || file.raw.type === 'image/png')
      const isLt2M = (file.size / 1024 / 1024) < 2
      if (!isJPG) {
        this.$message.error(this_.$t('project.topology.imgFormat'))
        fileList = fileList.splice(fileList.length - 1, 1)
        return false
      }
      if (!isLt2M) {
        this.$message.error(this_.$t('project.topology.imgSize'))
        fileList = fileList.splice(fileList.length - 1, 1)
        return false
      }
      new Promise(function (resolve, reject) {
        const width = 0
        const height = 0
        const _URL = window.URL || window.webkitURL
        const img = new Image()
        img.onload = function () {
          const valid = img.width > width && img.height > height
          this_.imgWidth = img.width
          this_.imgHeight = img.height
          valid ? resolve() : reject()
        }
        img.src = _URL.createObjectURL(file.raw)
      }).then(() => {
        if (isJPG) {
          console.log(file.raw)
          this.getBase64(file.raw).then(base64Str => {
            this.imageUrl = base64Str
          })
        }
        return file.raw
      }, () => {
        this.$message.error(this_.$t('project.topology.imgMeasure'))
        return Promise.reject()
      })
      return false
    },
    handleRemove () {
      this.imageUrl = ''
    },
    removeIcon (e) {
      this.fileList = []
      this.imageUrl = ''
    },
    getBase64 (file) {
      return new Promise(function (resolve, reject) {
        const reader = new FileReader()
        let imgResult = ''
        reader.readAsDataURL(file)
        reader.onload = function () {
          imgResult = reader.result
        }
        reader.onerror = function (error) {
          reject(error)
        }
        reader.onloadend = function () {
          resolve(imgResult)
        }
      })
    }
  }
}
</script>
