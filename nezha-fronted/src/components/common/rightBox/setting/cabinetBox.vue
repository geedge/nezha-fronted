<template>
  <div v-clickoutside="{obj: editCabinet, func: esc}" class="right-box right-box-asset">
    <div class="right-box__header">
      <div class="header__title">{{editCabinet.id ? $t('config.cabinet.editCabinet') : $t('config.cabinet.createCabinet')}}</div>
      <div class="header__operation">
        <span v-cancel="{obj: editCabinet, func: esc}"><i class="nz-icon nz-icon-close"></i></span>
      </div>
    </div>
    <div class="right-box__container">
      <div class="container__form">
        <el-form class="right-box-form right-box-form-left" label-width="120px" label-position = "top" :model="editCabinet" ref="cabinetForm" :rules="rules">
          <el-form-item :label="$t('overall.name')" prop="name">
            <el-input size='mini' v-model="editCabinet.name" id="cabinet-box-input-name"/>
          </el-form-item>
          <el-form-item :label="$t('config.dc.dc')" prop="idcId">
            <el-input size='mini' v-model="currentDc.name" disabled id="cabinet-box-input-dc"/>
          </el-form-item>
          <el-form-item :label="$t('asset.uSize')" prop="uSize">
            <el-input v-model.number="editCabinet.uSize" :max="47" id="cabinet-box-input-uSize"></el-input>
          </el-form-item>
          <el-form-item :label="$t('config.dc.remark')">
            <el-input size='mini' v-model="editCabinet.remark" type="textarea" :rows="2" id="cabinet-box-input-remark"/>
          </el-form-item>
        </el-form>
      </div>
    </div>
    <div class="right-box__footer">
      <button id="asset-edit-cancel" v-cancel="{obj: editCabinet, func: esc}" class="footer__btn footer__btn--light">
        <span>{{$t('overall.cancel')}}</span>
      </button>
      <button id="asset-edit-save" :class="{'footer__btn--disabled': prevent_opt.save}" :disabled="prevent_opt.save" class="footer__btn" @click="save">
        <span>{{$t('overall.save')}}</span>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'cabinetBox',
  props: {
    obj: { type: Object },
    currentDc: { type: Object }
  },
  data () {
    return {
      editCabinet: {},
      rules: {
        name: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ],
        uSize: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' },
          { type: 'number', min: 1, max: 47, message: this.$t('validate.uSize'), trigger: 'blur' }
        ]
      }
    }
  },
  created() {

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
      this.$refs.cabinetForm.validate(valid => {
        if (valid) {
          this.editCabinet.dcId = this.currentDc.id
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
    }
  },
  watch: {
    obj: {
      deep: true,
      immediate: true,
      handler: function (n, o) {
        console.info(n)
        if (n) {
          this.editCabinet = JSON.parse(JSON.stringify(n))
        }
      }
    }
  }
}
</script>

<style lang="scss">
  @import '@/assets/css/common/rightBoxCommon.scss';
</style>
