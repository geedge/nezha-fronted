<template>
  <div class="right-box right-box-mib" v-clickoutside="{obj:editMib,func:clickOutside}" >
    <!-- begin--标题-->
   <div class="right-box__header">
      <div class="header__title">{{editMib.id ? ($t("config.mib.editMib")) : $t("overall.createMib")}}</div>
      <div class="header__operation">
        <span v-cancel="{obj: editMib, func: esc}"><i class="nz-icon nz-icon-close" :title="$t('overall.close')"></i></span>
      </div>
    </div>
    <!-- begin--表单-->
    <div class="right-box__container">
      <div class="container__form">
        <el-form :model="editMib" label-position = "top" label-width="120px" :rules="rules" ref="mibForm">
          <el-form-item :label='$t("overall.models")' prop="models" :rules="[{validator:checkModels,trigger:'change'}]" >
            <el-cascader
              id="mib-input-selected-models"
              :options="modelOptions"
              :props="modelProps"
              v-model="selectedModels"
              @change="selectedModelChange"
              ref="modelSelector"
              size="small"
              class="right-box__select"
              popper-class="prevent-clickoutside limit-height right-box-select-top right-public-box-dropdown-top"
              clearable></el-cascader>
          </el-form-item>
          <el-form-item :label="$t('overall.remark')" prop="remark">
            <el-input maxlength="256" rows="2" show-word-limit type="textarea" placeholder="" v-model="editMib.remark" size="small" id="mib-box-input-remark"></el-input>
          </el-form-item>
          <el-form-item :label="$t('config.mib.mibFiles')" prop="file" :rules="[{validator:checkMibFile,trigger:'change'}]" :class="{'add-required':!editMib.id}">
            <el-upload drag :multiple="false" action="" :file-list="uploadFileList" :on-change="uploadChange" :auto-upload="false" accept="" :on-remove="afterClearFile" ref="mibFileUpload" class="mib-upload right-box-form-row" id="mib-box-input-file">
              <div slot="tip" class="el-upload__tip" >
                <span v-if="editMib.fileName">{{editMib.fileName}}</span>
                <span v-if="uploadErrorMsg" style="color: #F56C6C"><br>{{uploadErrorMsg}}</span>
              </div>
              <i class="nz-icon nz-icon-upload"></i>
              <div class="el-upload__text">{{$t('overall.dragFileTip')}}，{{$t('overall.or')}}&nbsp;<em>{{$t('overall.clickUpload')}}</em></div>
            </el-upload>
          </el-form-item>
        </el-form>
      </div>
    </div>

    <!--底部按钮-->
    <div class="right-box__footer">
      <button v-cancel="{obj:editMib,func:esc}" id="model-box-esc" class="footer__btn footer__btn--light">
        <span>{{$t('overall.cancel')}}</span>
      </button>
      <button :class="{'nz-btn-disabled':prevent_opt.save}" :disabled="prevent_opt.save" @click="save" class="footer__btn" id="model-box-save">
        <span>{{$t('overall.save')}}</span>
      </button>
    </div>

  </div>
</template>

<script>
import editRigthBox from '../mixin/editRigthBox'

export default {
  name: 'modelBox',
  props: {
    mib: Object
  },
  mixins: [editRigthBox],
  data () {
    const $temp = this
    return {
      editMib: {},
      rules: {
        name: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ]
      },
      checkMibFile: (rule, value, callback) => {
        setTimeout(() => {
          if (!$temp.editMib.id) {
            if (!$temp.uploadFile || !$temp.uploadFile.raw) {
              $temp.uploadErrorMsg = $temp.$t('config.mib.requiredMibFile')
              return callback(new Error(' '))
            } else {
              $temp.uploadErrorMsg = null
              return callback()
            }
          } else {
            $temp.uploadErrorMsg = null
            return callback()
          }
        }, 200)
      },
      checkModels: (rule, value, callback) => {
        setTimeout(() => {
          if (!$temp.editMib.models || $temp.editMib.models == '') {
            // return callback(new Error($temp.$t('validate.required')))
            return callback()
          } else {
            return callback()
          }
        }, 200)
      },
      selectedModels: [],
      modelOptions: [],
      modelProps: { multiple: true, emitPath: false },
      uploadFileList: [],
      uploadFile: null,
      uploadErrorMsg: null
    }
  },
  methods: {
    clickOutside () {
      this.esc(false)
    },
    /* 关闭弹框 */
    esc (refresh) {
      this.$emit('close', refresh)
    },
    queryModelInfos: function () {
      this.$get('asset/model?pageSize=-1').then(response => {
        if (response.code == 200) {
          const modelInfos = response.data.list
          const sortModels = {}
          modelInfos.forEach((item) => {
            if (!sortModels[item.brand.name]) { // 没有这个assetType
              sortModels[item.brand.name] = []
            }
            item.label = item.name
            item.value = item.id
            sortModels[item.brand.name].push(item)
          })
          for (const brand of Object.keys(sortModels)) {
            const option = {
              label: brand,
              value: brand,
              children: sortModels[brand]
            }
            this.modelOptions.push(option)
          }
        }
      })
    },
    selectedModelChange: function (nodes) {
      const selectedNodes = this.selectedModels
      if (selectedNodes && selectedNodes.length > 0) {
        let models = ''
        for (const node of selectedNodes) {
          models += node + ','
        }
        this.editMib.models = models.substr(0, models.length - 1)
      } else {
        this.editMib.models = ''
      }
      this.$refs.mibForm.validateField('models')
    },
    uploadChange (file, fileList) {
      if (fileList.length > 0) {
        this.uploadFileList = [fileList[fileList.length - 1]]
        this.uploadFile = this.uploadFileList[0]
      }
      this.validateFile()
    },
    afterClearFile (file, fileList) {
      this.uploadFileList = []
      this.uploadFile = null
      this.validateFile()
    },
    validateFile: function () {
      this.$refs.mibForm.validateField('file')
    },
    /* 保存 */
    save () {
      this.$refs.mibForm.validate((valid) => {
        if (valid) {
          this.prevent_opt.save = true
          const form = new FormData()
          form.append('name', this.editMib.name)
          form.append('remark', this.editMib.remark)
          form.append('models', this.editMib.models)
          form.append('file', this.uploadFile && this.uploadFile.raw ? this.uploadFile.raw : null)
          if (!this.editMib.id) {
            this.$post('/mib', form, { 'Content-Type': 'multipart/form-data' }).then(response => {
              if (response.code == 200 && response.msg == 'success') {
                this.$message({ duration: 1000, type: 'success', message: this.$t('tip.saveSuccess') })
                this.esc(true)
              } else {
                this.$message.error(response.msg)
              }
              this.prevent_opt.save = false
            })
          } else {
            form.append('id', this.editMib.id)
            this.$put('/mib', form, { 'Content-Type': 'multipart/form-data' }).then(response => {
              if (response.code == 200 && response.msg == 'success') {
                this.$message({ duration: 1000, type: 'success', message: this.$t('tip.saveSuccess') })
                this.esc(true)
              } else {
                this.$message.error(response.msg)
              }
              this.prevent_opt.save = false
            })
          }
        } else {
          this.prevent_opt.save = false
        }
      })
    },
    /* 删除 */
    del () {
      this.$confirm(this.$t('tip.confirmDelete'), {
        confirmButtonText: this.$t('tip.yes'),
        cancelButtonText: this.$t('tip.no'),
        type: 'warning'
      }).then(() => {
        this.$delete('mib?ids=' + this.editMib.id).then(response => {
          if (response.code === 200) {
            this.$message({ duration: 1000, type: 'success', message: this.$t('tip.deleteSuccess') })
            this.esc(true)
          } else {
            this.$message.error(response.msg)
          }
        })
      })
    }
  },
  mounted () {
    this.queryModelInfos()
  },
  computed: {
  },
  watch: {
    mib: {
      immediate: true,
      deep: true,
      handler (n, o) {
        this.isEdit = true
        this.editMib = JSON.parse(JSON.stringify(n))
        if (this.editMib.models) {
          this.selectedModels = this.editMib.models.split(',')
        } else {
          this.selectedModels = []
        }
      }
    }
  }
}
</script>
