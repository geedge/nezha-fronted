<template>
  <div class="license-gen">
    <div class="license-gen-form system-config-form">
      <el-form :model="licenseGen" :rules="rules" label-width="180px" size="small" label-position="top" ref="licenseGenFrom">
        <el-form-item :label="$t('license.id')" prop="supportID">
          <el-input v-model="licenseGen.supportID"></el-input>
        </el-form-item>
        <el-form-item :label="$t('license.organization')" prop="organization">
          <el-input v-model="licenseGen.organization"></el-input>
        </el-form-item>
        <!-- type -->
        <el-form-item :label="$t('overall.type')" prop="type">
          <el-select
            class="right-box__select"
            v-model="licenseGen.type"
            :placeholder="$t('overall.select')"
            popper-class="right-box-select-top right-public-box-dropdown-top prevent-clickoutside"
            size="small">
            <template v-for="item in typeList">
              <el-option :key="item.value" :label="item.label" :value="item.value"></el-option>
            </template>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('licenseGen.comment')" prop="comment">
          <el-input id="alert-box-input-description"  placeholder="" size="small" :rows="2" type="textarea" v-model="licenseGen.comment" show-word-limit maxlength="256"></el-input>
        </el-form-item>
        <el-form-item class="license-gen-error" prop="file">
          <div class="license-gen-form__upload">
            <el-upload
              ref="upload"
              class="upload-demo"
              action=""
              multiple
              :auto-upload="false"
              :on-change="handleChange"
              :on-remove="handleRemove"
              :file-list="uploadFileList">
              <el-button size="small" type="primary">{{$t('overall.upload')}}</el-button>
            </el-upload>
          </div>
        </el-form-item>
        <el-form-item class="license-gen-btn"><el-button size="small" type="primary" @click="upload">{{$t('overall.generate')}}</el-button></el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import vm from '../../../entrance/app/main'

export default {
  name: 'licenseGen',
  data () {
    const licenseFile = (rule, value, callback) => {
      if (this.uploadFile.file.length > 0) {
        callback()
      } else {
        return callback(vm.$t('licenseGen.document'))
      }
    }
    return {
      licenseGen: {
        supportID: '',
        organization: '',
        type: '',
        comment: ''
      },
      uploadFile: { file: '' },
      uploadList: [],
      uploadFileList: [],
      typeList: [
        { label: 'Evaluation', value: 'Evaluation' },
        { label: 'Commercial', value: 'Commercial' },
        { label: 'Test', value: 'Test' }
      ],
      rules: {
        supportID: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ],
        organization: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ],
        type: [
          { required: true, message: this.$t('validate.required'), trigger: 'change' }
        ],
        file: [
          { validator: licenseFile, trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    getTimeString () {
      const split = '-'
      const date = new Date()
      const year = date.getFullYear()
      const month = this.formatNum(date.getMonth() + 1)
      const day = this.formatNum(date.getDate())
      const hours = this.formatNum(date.getHours())
      const minutes = this.formatNum(date.getMinutes())
      const seconds = this.formatNum(date.getSeconds())
      return year + split + month + split + day + ' ' + hours + split + minutes + split + seconds
    },
    formatNum (num) {
      return num > 9 ? num : '0' + num
    },
    handleChange (file, fileList) {
      if (fileList.length > 0) {
        this.uploadFileList = fileList
      }
      this.uploadFile.file = this.uploadFileList
    },
    handleRemove (file, fileList) {
      this.uploadFile.file = fileList
    },
    upload () {
      this.$refs.licenseGenFrom.validate((valid) => {
        if (valid) {
          const form = new FormData()
          if (this.uploadFile.file.length > 0) {
            this.uploadFile.file.forEach(item => {
              form.append('files', item.raw)
            })
          } else {
            return ''
          }
          form.append('supportID', this.licenseGen.supportID)
          form.append('organization', this.licenseGen.organization)
          form.append('type', this.licenseGen.type)
          form.append('comment', this.licenseGen.comment)
          this.$post('/sys/license/gen', form).then(res => {
            let fileName = this.licenseGen.supportID + '-' + this.getTimeString() + '.xml'
            const resFileName = res.headers['content-disposition'].split('=')[1]
            if (resFileName) {
              fileName = resFileName
            }
            if (window.navigator.msSaveOrOpenBlob) {
              // 兼容ie11
              const blobObject = new Blob([res.data])
              window.navigator.msSaveOrOpenBlob(blobObject, fileName)
            } else {
              const url = URL.createObjectURL(new Blob([res.data]))
              const a = document.createElement('a')
              document.body.appendChild(a) // 此处增加了将创建的添加到body当中
              a.href = url
              a.download = fileName
              a.target = '_blank'
              a.click()
              a.remove() // 将a标签移除
            }
          }, error => {
            const $self = this
            const reader = new FileReader()
            reader.onload = function (event) {
              const responseText = reader.result
              const exception = JSON.parse(responseText)
              if (exception.message) {
                $self.$message.error(exception.message)
              } else {
                console.error(error)
              }
            }
            reader.readAsText(error.response.data)
          })
        }
      })
    }
  }
}
</script>
