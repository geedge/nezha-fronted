<template>
  <div class="license-gen">
    <div class="license-gen-form system-config-form">
      <el-form :model="licenseGen"  label-width="180px" size="small" label-position="top" ref="licenseGenFrom">
        <el-form-item :label="$t('license.id')" prop="supportID">
          <el-input v-model="licenseGen.supportID"></el-input>
        </el-form-item>
        <el-form-item :label="$t('license.organization')" prop="organization">
          <el-input v-model="licenseGen.organization"></el-input>
        </el-form-item>
        <!-- type -->
        <el-form-item :label="$t('overall.type')" prop="type">
          <el-select class="right-box__select"
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
          <el-input id="alert-box-input-description"  placeholder="" size="small" type="textarea" v-model="licenseGen.comment"></el-input>
        </el-form-item>
        <el-form-item>
          <div class="license-gen-form__upload">
            <el-upload
              ref="upload"
              accept=".xml"
              class="upload-demo"
              action=""
              multiple
              :auto-upload="false"
              :on-change="handleChange"
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
export default {
  name: 'licenseGen',
  data () {
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
      ]
    }
  },
  methods: {
    handleChange (file, fileList) {
      if (fileList.length > 0) {
        this.uploadFileList = fileList
      }
      this.uploadFile.file = this.uploadFileList
    },
    upload () {
      const form = new FormData()
      form.append('fies', this.uploadFile.file)
      form.append('supportID', this.licenseGen.supportID)
      form.append('organization', this.licenseGen.organization)
      form.append('type', this.licenseGen.type)
      form.append('comment', this.licenseGen.comment)
      this.$post('/sys/license/gen', form).then(res => {
        if (res.code == 200) {
          return ''
        } else {
          this.$message.error(res.msg)
        }
      })
    }
  }
}
</script>
