<template>
  <div class="right-box right-box-cabinet" v-clickoutside="{obj:editCabinet,func:clickOutside}">

    <!-- begin--标题-->
    <div class="right-box__header">
      <div class="header__title">{{editCabinet.id ? $t("config.dc.editCabinet") : $t("overall.createCabinet")}}</div>
      <div class="header__operation">
        <span v-cancel="{obj: editCabinet, func: esc}"><i class="nz-icon nz-icon-close" :title="$t('overall.close')"></i></span>
      </div>
    </div>
    <!-- end--标题-->

    <!-- begin--表单-->
    <div class="right-box-form-box">
      <el-form class="right-box-form right-box-form-left" label-width="120px" label-position = "top" :model="editCabinet" ref="cabinetForm" :rules="rules">
        <el-form-item :label="$t('overall.name')" prop="name">
          <el-input size='mini' maxlength="64" show-word-limit v-model="editCabinet.name" id="cabinet-box-input-name"/>
        </el-form-item>
        <el-form-item :label="$t('overall.dc')" prop="idcId">
          <el-input v-if="dcDisabled" size='mini' v-model="currentDc.name" disabled id="cabinet-box-input-dc"/>
          <el-select v-if="!dcDisabled" size='mini' v-model="editCabinet.idcId" :placeholder="$t('overall.select')" id="cabinet-box-input-dc" :popper-class="'no-style-class'">
            <el-option v-for="dc in dcData" :key="dc.id" :value="dc.id" :label="dc.name"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('config.cab.uSize')" prop="uSize">
          <el-input v-model.number="editCabinet.uSize" :max="47" size="small" id="cabinet-box-input-uSize"></el-input>
        </el-form-item>
        <el-form-item :label="$t('overall.remark')">
          <el-input size='small' maxlength="256" show-word-limit v-model="editCabinet.remark" type="textarea" :rows="2" id="cabinet-box-input-remark"/>
        </el-form-item>
      </el-form>
    </div>

    <!--底部按钮-->
    <div class="right-box__footer">
      <button v-cancel="{obj:editCabinet,func:esc}" id="cab-box-esc" class="footer__btn footer__btn--light">
        <span>{{$t('overall.cancel')}}</span>
      </button>
      <button :class="{'nz-btn-disabled':prevent_opt.save}" :disabled="prevent_opt.save" @click="save" class="footer__btn" id="cab-box-save">
        <span>{{$t('overall.save')}}</span>
      </button>
    </div>
  </div>
</template>

<script>
import editRigthBox from '../mixin/editRigthBox'
export default {
  name: 'cabinetBox',
  props: {
    obj: { type: Object },
    currentDc: { type: Object },
    dcDisabled: {
      type: Boolean,
      default: true
    }
  },
  mixins: [editRigthBox],
  data () {
    return {
      editCabinet: {},
      dcData: '',
      rules: {
        name: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ],
        idcId: [
          { required: true, message: this.$t('validate.required'), trigger: 'change' }
        ],
        uSize: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' },
          { type: 'number', min: 1, max: 47, message: this.$t('validate.uSize'), trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    clickOutside () {
      this.esc(false)
    },
    esc (refresh) {
      this.prevent_opt.save = false
      this.$emit('close', refresh)
    },
    save () {
      if (this.prevent_opt.save) { return } ;
      this.prevent_opt.save = true
      if (!this.editCabinet.idcId) {
        this.editCabinet.idcId = this.currentDc.id
      }
      this.$refs.cabinetForm.validate(valid => {
        if (valid) {
          this.editCabinet.dcId = this.currentDc.id || this.editCabinet.idcId
          if (this.editCabinet.id) {
            this.$put('/dc/cabinet', this.editCabinet).then(res => {
              this.prevent_opt.save = false
              if (res.code === 200) {
                this.$message({ duration: 2000, type: 'success', message: this.$t('tip.saveSuccess') })
                this.esc(true)
              } else {
                this.$message.error(res.msg)
              }
            })
          } else {
            this.$post('/dc/cabinet', this.editCabinet).then(res => {
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
    del () {
      if (this.prevent_opt.save) { return } ;
      this.prevent_opt.save = true
      this.$confirm(this.$t('tip.confirmDelete'), {
        confirmButtonText: this.$t('tip.yes'),
        cancelButtonText: this.$t('tip.no'),
        type: 'warning'
      }).then(() => {
        this.$delete('dc/cabinet?ids=' + this.editCabinet.id).then(response => {
          this.prevent_opt.save = false
          if (response.code == 200) {
            this.$message({ duration: 2000, type: 'success', message: this.$t('tip.saveSuccess') })
            this.esc(true)
          } else {
            this.$message.error(response.msg)
          }
        })
      }).catch(() => {
        this.prevent_opt.save = false
      })
    },
    getDcData () {
      this.$get('dc', { pageSize: -1 }).then(res => {
        this.dcData = res.data.list
      })
    }
  },
  watch: {
    obj: {
      deep: true,
      immediate: true,
      handler: function (n, o) {
        this.isEdit = true
        if (n) {
          this.editCabinet = JSON.parse(JSON.stringify(n))
        }
      }
    }
  },
  mounted () {
    if (!this.dcDisabled) {
      this.getDcData()
    }
  }
}
</script>
