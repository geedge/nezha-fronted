<template>
  <div v-clickoutside="{obj: apiKeyBox, func: esc}" class="right-box right-box-profile">
    <div class="right-box__header">
      <div class="header__title">{{$t('profile.box.newApiKey')}}</div>
      <div class="header__operation">
        <span v-cancel="{obj: apiKeyBox, func: esc}"><i class="nz-icon nz-icon-close" :title="$t('overall.close')"></i></span>
      </div>
    </div>
    <div class="right-box__container">
      <div class="container__form">
        <el-form ref="apiKeyBoxForm" :model="apiKeyBox" :rules="rules" label-position="top" label-width="120px">
          <el-form-item :label="$t('overall.name')" prop="name">
            <el-input maxlength="64" show-word-limit v-model.trim="apiKeyBox.name" size="small" type="text"></el-input>
          </el-form-item>
           <el-form-item
            :label="$t('config.system.apiKey.expireAt')"
            class="start_at"
          >
            <my-date-picker
              v-model="apiKeyBox.expireAt"
              class="my-datetime-picker"
              id="my-datetime-picker"
              type="datetime"
              prefix-icon="el-icon-date"
              :format="timeFormatStrToDatePickFormat(dateFormatStr)"
            >
            </my-date-picker>
          </el-form-item>
          <el-form-item :label="$t('overall.remark')">
            <el-input  size='small' show-word-limit maxlength="256" v-model="apiKeyBox.remark" type="textarea"  :rows="2"></el-input>
          </el-form-item>
        </el-form>
      </div>
    </div>
    <div class="right-box__footer">
      <button id="asset-edit-cancel" v-cancel="{obj: apiKeyBox, func: esc}" class="footer__btn footer__btn--light">
        <span>{{$t('overall.cancel')}}</span>
      </button>
      <button id="asset-edit-save" :class="{'footer__btn--disabled': prevent_opt.save}" :disabled="prevent_opt.save" class="footer__btn" @click="save">
        <span>{{$t('overall.save')}}</span>
      </button>
    </div>
  </div>
</template>

<script>
import editRigthBox from '@/components/common/mixin/editRigthBox'
import bus from '@/libs/bus'

export default {
  name: 'apiKeyBox',
  components: {
  },
  props: {
    obj: {
      type: Object
    }
  },
  computed: {},
  mixins: [editRigthBox],
  data () {
    return {
      apiKeyBox: { name: '', expireAt: '', remark: '' },
      rules: {
        name: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ]
      },
      dateFormatStr: localStorage.getItem('nz-default-dateFormat')
        ? localStorage.getItem('nz-default-dateFormat')
        : 'YYYY-MM-DD HH:ss:mm'
    }
  },
  watch: {
    'apiKeyBox.expireAt': {
      deep: true,
      handler (n) {
        this.apiKeyBox.expireAt = bus
          .timeFormate(new Date(n), 'YYYY-MM-DD HH:mm:ss')
      }
    }
  },
  created () {
    const dateFormatStr = localStorage.getItem('nz-default-dateFormat')
    this.dateFormatStr = 'YYYY-MM-DD HH:mm:ss'
  },
  methods: {
    clickoutside () {
      this.esc(false)
    },
    /* 关闭弹框 */
    esc (refresh) {
      this.prevent_opt.save = false
      this.$emit('close', refresh)
    },
    save () {
      if (this.prevent_opt.save) {
        return
      }
      this.prevent_opt.save = true
      this.$refs.apiKeyBoxForm.validate((valid) => {
        if (valid) {
          if (this.apiKeyBox.name) {
            this.apiKeyBox.expireAt = this.timezoneToUtcTimeStr(this.apiKeyBox.expireAt, 'YYYY-MM-DD HH:mm:ss')
            this.$post('sys/apiKey/self', { ...this.apiKeyBox }).then(res => {
              this.prevent_opt.save = false
              if (res.code === 200) {
                bus.$emit('apiKey-tab2')
                this.$message.success(this.$t('tip.addSuccess'))
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
    }

  }
}

</script>
