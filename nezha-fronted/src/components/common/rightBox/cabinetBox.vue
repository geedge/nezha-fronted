<template>
  <div class="right-box right-box-cabinet" v-clickoutside="{obj:editCabinet,func:clickOutside}">
    <!-- begin--顶部按钮-->
    <div class="right-box-top-btns right-box-form-delete">
      <button @click="del" class="nz-btn nz-btn-size-normal nz-btn-size-alien" id="cab-del" type="button" v-has="'dc_cabinet_delete'" v-if="!editCabinet.id">
        <span class="right-box-top-btn-icon"><i class="nz-icon nz-icon-delete"></i></span>
        <span class="right-box-top-btn-txt">{{$t('overall.delete')}}</span>
      </button>
    </div>
    <!-- end--顶部按钮-->

    <!-- begin--标题-->
    <div class="right-box-title">{{editCabinet.id ? $t("config.dc.editCabinet") + " ID: " + editCabinet.id : $t("overall.createCabinet")}}</div>
    <!-- end--标题-->

    <!-- begin--表单-->
    <div class="right-box-form-box">
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

    <!--底部按钮-->
    <div class="right-box-bottom-btns">
      <button v-cancel="{obj:editCabinet,func:esc}" id="cab-box-esc" class="nz-btn nz-btn-size-normal-new nz-btn-style-light-new">
        <span>{{$t('overall.cancel')}}</span>
      </button>
      <button :class="{'nz-btn-disabled':prevent_opt.save}" :disabled="prevent_opt.save" @click="save" class="nz-btn nz-btn-size-normal-new nz-btn-style-normal-new" id="cab-box-save">
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
          this.editCabinet.idcId = this.currentDc.id
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
        if (n) {
          this.editCabinet = JSON.parse(JSON.stringify(n))
        }
      }
    }
  }
}
</script>
<style >
</style>
