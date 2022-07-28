<template>
  <div class="right-box right-box-ipam" v-clickoutside="{obj:editipDetails,func:clickOutside}" >
    <!-- begin--标题-->
    <div class="right-box__header">
      <div class="header__title">{{editipDetails.id ? ($t("overall.ipamIp.edit")) : $t("overall.ipamIp.create")}}</div>
      <div class="header__operation">
        <span v-cancel="{obj: editipDetails, func: esc}"><i class="nz-icon nz-icon-close" :title="$t('overall.close')"></i></span>
      </div>
    </div>
    <!-- begin--表单-->
    <div class="right-box__container">
      <div class="container__form">
        <el-form :model="editipDetails" label-position="top" label-width="120px" :rules="rules" ref="ipDetailsForm">
          <el-form-item :label="$t('overall.name')" prop="name">
            <el-input maxlength="64" rows="4" show-word-limit placeholder="" v-model="editipDetails.name" size="small"></el-input>
          </el-form-item>
          <el-form-item label="IP" prop="addr">
            <el-input maxlength="256" rows="4" show-word-limit placeholder="" v-model="editipDetails.addr" size="small"></el-input>
          </el-form-item>
          <el-form-item label="MAC" prop="mac">
            <el-input maxlength="256" rows="4" show-word-limit placeholder="" v-model="editipDetails.mac" size="small"></el-input>
          </el-form-item>
          <el-form-item :label="$t('overall.state')" prop="state">
<!--            <el-input maxlength="256" rows="4" show-word-limit placeholder="" v-model="editipDetails.state" size="small"></el-input>-->
            <el-select
              v-model="editipDetails.state"
              class="right-box__select"
              popper-class="right-box-select-top prevent-clickoutside"
              size="small"
              :placeholder="$t('el.select.placeholder')"
              value-key="id">
              <el-option v-for="p in options.ipDetailsState" :key="p.value" :label="p.label" :value="p.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('overall.remark')" prop="remark">
            <el-input maxlength="256" rows="2" show-word-limit type="textarea" placeholder="" v-model="editipDetails.remark" size="small" id="mib-box-input-remark"></el-input>
          </el-form-item>
        </el-form>
      </div>
    </div>
    <!--底部按钮-->
    <div class="right-box__footer">
      <button v-cancel="{obj:editipDetails,func:esc}" id="model-box-esc" class="footer__btn footer__btn--light">
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
import vm from '../../../entrance/app/main'

export default {
  name: 'ipDetailsBox',
  props: {
    obj: Object,
    detailsType: Number
  },
  mixins: [editRigthBox],
  data () {
    const detailsIpv = (rule, value, callback) => {
      const ipvVerify = /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^([\da-fA-F]{1,4}:){6}((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^::([\da-fA-F]{1,4}:){0,4}((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^([\da-fA-F]{1,4}:):([\da-fA-F]{1,4}:){0,3}((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^([\da-fA-F]{1,4}:){2}:([\da-fA-F]{1,4}:){0,2}((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^([\da-fA-F]{1,4}:){3}:([\da-fA-F]{1,4}:){0,1}((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^([\da-fA-F]{1,4}:){4}:((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^([\da-fA-F]{1,4}:){7}[\da-fA-F]{1,4}$|^:((:[\da-fA-F]{1,4}){1,6}|:)$|^[\da-fA-F]{1,4}:((:[\da-fA-F]{1,4}){1,5}|:)$|^([\da-fA-F]{1,4}:){2}((:[\da-fA-F]{1,4}){1,4}|:)$|^([\da-fA-F]{1,4}:){3}((:[\da-fA-F]{1,4}){1,3}|:)$|^([\da-fA-F]{1,4}:){4}((:[\da-fA-F]{1,4}){1,2}|:)$|^([\da-fA-F]{1,4}:){5}:([\da-fA-F]{1,4})?$|^([\da-fA-F]{1,4}:){6}:$/
      setTimeout(() => {
        if (ipvVerify.test(value)) {
          callback()
        } else {
          callback(new Error(vm.$t('validate.address')))
        }
      }, 100)
    }
    return {
      editipDetails: {},
      options: {
        ipDetailsState: [
          {
            label: this.$t('overall.ipam.available'),
            value: 1
          },
          {
            label: this.$t('overall.ipam.transient'),
            value: 2
          },
          {
            label: this.$t('overall.ipam.used'),
            value: 3
          }
        ]
      },
      rules: {
        addr: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' },
          { validator: detailsIpv, trigger: 'blur' }
        ]
      }
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
    /* 保存 */
    save () {
      this.$refs.ipDetailsForm.validate((valid) => {
        if (valid) {
          this.prevent_opt.save = true
          if (!this.editipDetails.id) {
            this.$post('/ipam/ip', this.editipDetails).then(response => {
              if (response.code == 200 && response.msg == 'success') {
                this.$message({ duration: 1000, type: 'success', message: this.$t('tip.saveSuccess') })
                this.esc(true)
              } else {
                this.$message.error(response.msg)
              }
              this.prevent_opt.save = false
            })
          } else {
            this.$put('/ipam/ip', this.editipDetails).then(response => {
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
    }
  },
  watch: {
    obj: {
      immediate: true,
      deep: true,
      handler (n, o) {
        this.isEdit = true
        this.editipDetails = JSON.parse(JSON.stringify(n))
      }
    }
  }
}
</script>
