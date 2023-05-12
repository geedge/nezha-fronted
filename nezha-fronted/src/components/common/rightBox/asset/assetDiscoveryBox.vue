<template>
  <div v-clickoutside="{obj:editAssetDiscovery,func:clickOutside}" class="right-box right-box-prom asset-discovery-right-box">
    <!-- begin--标题-->
    <div class="right-box__header">
      <div class="header__title">{{editAssetDiscovery.id ? ($t("config.agent.editProm")) : $t("overall.createPrometheusServer")}}</div>
      <div class="header__operation">
        <span v-cancel="{obj: editAssetDiscovery, func: esc}"><i class="nz-icon nz-icon-close" :title="$t('overall.close')"></i></span>
      </div>
    </div>
    <!-- end--标题-->
    <!-- begin--表单-->
    <div class="right-box__container">
      <div class="container__form">
        <el-form ref="agentForm" :model="editAssetDiscovery" :rules="rules" label-position = "top" label-width="120px">
          <!--          name-->
          <el-form-item :label='$t("overall.name")' prop="name">
            <el-input placeholder="" maxlength="64" show-word-limit v-model="editAssetDiscovery.name" size="small" id="asset-discovery-box-input-name"></el-input>
          </el-form-item>
          <!--          ipSubnet-->
          <el-form-item :label='$t("asset.ipSubnet")' prop="subnet">
            <el-input placeholder="" maxlength="64" show-word-limit v-model="editAssetDiscovery.subnet" size="small" id="asset-discovery-box-input-subnet"></el-input>
          </el-form-item>
          <!--          snmpCredentialIds-->
          <el-form-item :label='$t("config.mib.credentials")' prop="snmpCredentialIds">
            <el-select
              v-model="editAssetDiscovery.snmpCredentialIds"
              class="right-box__select"
              popper-class="right-box-select-top prevent-clickoutside"
              multiple placeholder="请选择"
              size="small">
              <el-option
                v-for="item in credentialData"
                :key="item.id"
                :label="item.name"
                :value="item.id">
              </el-option>
            </el-select>
          </el-form-item>
          <!--          schedule.type-->
          <el-form-item :label='$t("alert.config.schedEnable")' prop="schedule.type" class="schedule-type">
<!--            <el-input placeholder="" maxlength="64" show-word-limit v-model="editAssetDiscovery.schedule.type" size="small" id="asset-discovery-box-input-type"></el-input>-->
            <el-radio-group v-model="editAssetDiscovery.schedule.type" size="medium">
              <el-radio-button :label="1">One time only</el-radio-button>
              <el-radio-button :label="2">Daily</el-radio-button>
              <el-radio-button :label="3">Weekly</el-radio-button>
              <el-radio-button :label="4">Monthly</el-radio-button>
            </el-radio-group>
          </el-form-item>
          <!--         schedule.stime -->
          <el-form-item :label='$t(" Start at")' prop="schedule.stime">
            <el-input placeholder="" maxlength="64" show-word-limit v-model="editAssetDiscovery.schedule.stime" size="small" id="asset-discovery-box-input-stime"></el-input>
          </el-form-item>
          <!--         schedule.repeat -->
          <el-form-item :label='$t("Repeat every")' prop="schedule.repeat">
            <el-input placeholder="" maxlength="64" show-word-limit v-model="editAssetDiscovery.schedule.repeat" size="small" id="asset-discovery-box-input-repeat"></el-input>
          </el-form-item>
          <!--         schedule.nums -->
          <el-form-item :label='$t("nums")' prop="schedule.nums">
            <el-input placeholder="" maxlength="64" show-word-limit v-model="editAssetDiscovery.schedule.nums" size="small" id="asset-discovery-box-input-nums"></el-input>
          </el-form-item>
          <!--remark-->
          <el-form-item :label="$t('overall.remark')">
            <el-input  maxlength="256" show-word-limit v-model="editAssetDiscovery.remark" size="small" :rows="2" type="textarea"/>
          </el-form-item>
        </el-form>
      </div>

    </div>
    <!-- end--表单-->
    <!--底部按钮-->
    <div class="right-box__footer">
      <button id="prom-esc" v-cancel="{obj:editAssetDiscovery,func:esc}"
              class="footer__btn footer__btn--light">
        <span>{{$t('overall.cancel')}}</span>
      </button>
      <button id="prom-save" :class="{'nz-btn-disabled':prevent_opt.save}"
              :disabled="prevent_opt.save" class="footer__btn" @click="save">
        <span>{{$t('overall.save')}}</span>
      </button>
    </div>
  </div>
</template>
<script>
import { noSpecialChar } from '@/components/common/js/validate'
import editRigthBox from '@/components/common/mixin/editRigthBox'
export default {
  name: 'agentBox',
  props: {
    assetDiscovery: Object
  },
  mixins: [editRigthBox],
  data () {
    return {
      rules: {
        name: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' },
          { validator: noSpecialChar, trigger: 'blur' }
        ],
        subnet: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ],
        snmpCredentialIds: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ],
        'schedule.type': [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ],
        'schedule.stime': [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ],
        'schedule.repeat': [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ],
        'schedule.nums': [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ]
      },
      editAssetDiscovery: {},
      credentialData: []
    }
  },
  created () {
    this.getCredentialData()
  },
  methods: {
    getCredentialData () {
      this.$get('snmp/credential', { pageSize: -1 }).then(response => {
        if (response.code === 200) {
          this.credentialData = response.data.list
        }
      })
    },
    /* 关闭弹框 */
    esc (refresh) {
      this.$emit('close', refresh)
    },
    clickOutside () {
      this.esc(false)
    },
    /* 保存 */
    save () {
      this.$refs.agentForm.validate(valid => {
        if (valid) {
          this.prevent_opt.save = true
          if (this.editAssetDiscovery.id) {
            this.$put('/tool/discovery', this.editAssetDiscovery).then(response => {
              if (response.code === 200) {
                this.$message({ duration: 1000, type: 'success', message: this.$t('tip.saveSuccess') })
                this.esc(true)
              } else {
                this.$message.error(response.msg)
              }
              this.prevent_opt.save = false
            })
          } else {
            this.$post('/tool/discovery', this.editAssetDiscovery).then(response => {
              if (response.code === 200) {
                this.$message({ duration: 1000, type: 'success', message: this.$t('tip.saveSuccess') })
                this.esc(true)
              } else {
                this.$message.error(response.msg)
              }
              this.prevent_opt.save = false
            })
          }
        } else {
          return false
        }
      })
    }
  },
  watch: {
    assetDiscovery: {
      immediate: true,
      handler (n) {
        this.editAssetDiscovery = this.$loadsh.cloneDeep(n)
      }
    }
  }
}
</script>
