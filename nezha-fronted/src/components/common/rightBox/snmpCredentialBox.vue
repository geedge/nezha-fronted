<template>
  <div class="right-box right-box-credential" v-clickoutside="{obj:editCredential,func:clickOutside}">
      <!-- begin--标题-->
      <div class="right-box__header">
        <div class="header__title">{{editCredential.id ? ($t("config.mib.credential.edit")) : $t("config.mib.credential.create")}}</div>
        <div class="header__operation">
          <span v-cancel="{obj: editCredential, func: esc}"><i class="nz-icon nz-icon-close" :title="$t('overall.close')"></i></span>
        </div>
      </div>
      <!-- begin--表单-->
      <div class="right-box__container">
        <div class="container__form">
          <el-form label-width="120px" size="small" :model="editCredential" label-position = "top" :rules="rules" ref="credentialForm">
            <el-form-item :label='$t("overall.name")' prop="name">
              <el-input placeholder="" maxlength="64" show-word-limit v-model="editCredential.name" size="small" id="credential-box-input-name"></el-input>
            </el-form-item>
            <el-form-item :label='$t("overall.remark")' prop="remark">
              <el-input placeholder="" maxlength="256"  rows="2" show-word-limit size="small" type="textarea" v-model="editCredential.remark"  id="credential-box-input-remark"></el-input>
            </el-form-item>
            <el-form-item :label='$t("config.mib.credential.type")' prop="type">
              <el-select v-model="editCredential.type" placeholder="" id="credential-box-input-type" class="right-box__select" popper-class="right-box-select-top right-public-box-dropdown-top prevent-clickoutside" @change="typeChange">
                <el-option v-for="item in $CONSTANTS.snmpProtocolTypes" :key="item.value" :label="$t(item.label)" :value="item.value">
                  <span class="panel-dropdown-label-txt" >{{item.label}}</span>
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item :label='$t("asset.port")' prop="port" >
              <el-input placeholder=""   v-model.number="editCredential.port" size="small" id="credential-box-input-port"></el-input>
            </el-form-item>
            <el-form-item :label='$t("config.mib.credential.ReadCommunity")' prop="readCommunity" v-if="editCredential.type ===1 || editCredential.type === 2">
              <el-input placeholder="" autocomplete="new-password" maxlength="64" show-word-limit v-model="editCredential.config.readCommunity" size="small" id="credential-box-input-readCommunity"></el-input>
            </el-form-item>
            <el-form-item :label='$t("config.mib.credential.writeCommunity")' prop="writeCommunity" v-if="editCredential.type ===1 || editCredential.type === 2">
              <el-input placeholder="" autocomplete="new-password" maxlength="64" show-word-limit v-model="editCredential.config.writeCommunity" size="small" id="credential-box-input-writeCommunity" type="password" auto-complete="new-password"  show-password></el-input>
            </el-form-item>
            <el-form-item :label='$t("profile.username")' prop="config.username" v-if="editCredential.type === 3">
              <el-input placeholder="" maxlength="64" show-word-limit v-model="editCredential.config.username" size="small" id="credential-box-input-username"></el-input>
            </el-form-item>
            <el-form-item :label='$t("config.mib.credential.contextName")' prop="contextname"  v-if="editCredential.type === 3">
              <el-input placeholder="" maxlength="64" show-word-limit v-model="editCredential.config.contextname" size="small" id="credential-box-input-contextname"></el-input>
            </el-form-item>

            <div class="right-box-sub-title" v-if="editCredential.type === 3">{{$t('config.mib.credential.auth')}}</div>
            <div style="margin-bottom: 20px;width: 100%"></div>

            <el-form-item :label='$t("config.mib.credential.method")' prop="authProtocol"  v-if="editCredential.type === 3">
              <el-select v-model="editCredential.config.authProtocol" placeholder="" id="credential-box-input-type" class="right-box__select" popper-class="right-box-select-top prevent-clickoutside">
                <el-option v-for="item in $CONSTANTS.snmpAuthMethod" :key="item.value" :label="$t(item.label)" :value="item.value">
                  <span class="panel-dropdown-label-txt" >{{item.label}}</span>
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item :label='$t("login.pin")' prop="config.authPin" v-if="editCredential.type === 3" :rules="[ { required: editCredential.config.authProtocol, message: this.$t('validate.required'), trigger: 'blur' }]">
              <el-input placeholder=""  autocomplete="new-password"  v-model="editCredential.config.authPin" size="small" id="credential-box-input-authPin" type="password" auto-complete="new-password"  show-password></el-input>
            </el-form-item>

            <div class="right-box-sub-title" v-if="editCredential.type === 3">{{$t('config.mib.credential.encryption')}}</div>
            <div style="margin-bottom: 20px;width: 100%"></div>

            <el-form-item :label='$t("config.mib.credential.method")' prop="privProtocol"  v-if="editCredential.type === 3">
              <el-select v-model="editCredential.config.privProtocol" placeholder="" id="credential-box-input-type" class="right-box__select" popper-class="right-box-select-top prevent-clickoutside" :disabled="!editCredential.config.authProtocol || editCredential.config.authProtocol === ''">
                <el-option v-for="item in $CONSTANTS.snmpEncryptionMethod" :key="item.value" :label="$t(item.label)" :value="item.value">
                  <span class="panel-dropdown-label-txt" >{{item.label}}</span>
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item :label='$t("login.pin")' prop="config.privPin"  v-if="editCredential.type === 3" :rules="[ { required: editCredential.config.privProtocol, message: this.$t('validate.required'), trigger: 'blur' }]">
              <el-input placeholder=""  autocomplete="new-password"  v-model="editCredential.config.privPin" size="small" id="credential-box-input-privPin" :disabled="!editCredential.config.authProtocol || editCredential.config.authProtocol === ''" type="password" auto-complete="new-password"  show-password></el-input>
            </el-form-item>
          </el-form>
        </div>
      </div>
      <!--底部按钮-->
      <div class="right-box__footer">
        <button v-cancel="{obj:editCredential,func:esc}" id="credential-box-esc" class="footer__btn footer__btn--light">
          <span>{{$t('overall.cancel')}}</span>
        </button>
        <button :class="{'nz-btn-disabled':prevent_opt.save}" :disabled="prevent_opt.save" @click="save" class="footer__btn" id="credential-box-save">
          <span>{{$t('overall.save')}}</span>
        </button>
      </div>

    </div>
</template>

<script>
import editRigthBox from '../mixin/editRigthBox'
import { port } from '../js/validate'

export default {
  name: 'snmpCredentialBox',

  props: {
    credential: Object
  },
  mixins: [editRigthBox],
  data () {
    return {
      editCredential: {},

      rules: {
        name: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ],
        'config.username': [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ],
        remark: [
          // { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ],
        type: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ],
        port: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' },
          { validator: port, trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    /* 关闭弹框 */
    esc (refresh) {
      this.prevent_opt.save = false
      this.$emit('close', refresh)
    },
    clickOutside () {
      this.esc(false)
    },

    typeChange: function (type) {
      if (type === 1 || type === 2) {
        this.$set(this.editCredential, 'config', {
          readCommunity: '',
          writeCommunity: ''
        })
      } else {
        this.$set(this.editCredential, 'config', {
          username: '',
          contextname: '',
          securityLevel: '',
          authProtocol: '',
          authPin: '',
          privProtocol: '',
          privPin: ''
        })
      }
    },
    /* 保存 */
    save: function () {
      if (this.prevent_opt.save) {
        return
      }
      this.prevent_opt.save = true
      this.$refs.credentialForm.validate((valid) => {
        if (valid) {
          if (this.editCredential.type === 3) {
            if (this.editCredential.config.authProtocol && !this.editCredential.config.privProtocol) {
              this.editCredential.config.securityLevel = 'authNoPriv'
            } else if (this.editCredential.config.authProtocol && this.editCredential.config.privProtocol) {
              this.editCredential.config.securityLevel = 'authPriv'
            } else {
              this.editCredential.config.securityLevel = 'noAuthNoPriv'
            }
          }
          const param = JSON.parse(JSON.stringify(this.editCredential))
          param.config = JSON.stringify(param.config)
          if (this.editCredential.id) {
            this.$put('/snmp/credential', param).then(response => {
              if (response.code === 200) {
                this.$message({ duration: 1000, type: 'success', message: this.$t('tip.saveSuccess') })
                this.esc(true)
              } else {
                this.$message.error(response.msg)
              }
              this.prevent_opt.save = false
            })
          } else {
            this.$post('/snmp/credential', param).then(response => {
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
          this.prevent_opt.save = false
          return false
        }
      })
    },
    /* 删除 */
    del () {
      if (this.prevent_opt.save) { return } ;
      this.prevent_opt.save = true
      this.$confirm(this.$t('tip.confirmDelete'), {
        confirmButtonText: this.$t('tip.yes'),
        cancelButtonText: this.$t('tip.no'),
        type: 'warning'
      }).then(() => {
        this.$delete('/snmp/credential?ids=' + this.editCredential.id).then(response => {
          this.prevent_opt.save = false
          if (response.code === 200) {
            this.$message({ duration: 1000, type: 'success', message: this.$t('tip.deleteSuccess') })
            this.esc(true)
          } else {
            this.$message.error(response.msg)
          }
        })
      }).catch(() => {
        this.prevent_opt.save = false
      })
    }
  },
  mounted () {

  },
  watch: {
    credential: {
      immediate: true,
      deep: true,
      handler (n, o) {
        this.isEdit = true
        this.editCredential = JSON.parse(JSON.stringify(n))
        if (this.editCredential.config && typeof this.editCredential.config === 'string') {
          this.editCredential.config = JSON.parse(this.editCredential.config)
        }
      }
    }
  }
}
</script>
<style scoped>
  .right-box-credential .half-form-item {
    width: calc(50% - 20px);
  }
  .right-box-credential .half-form-item:nth-child(odd) {
    width: calc(50% - 15px);
    margin-left: 15px;

  }
</style>
