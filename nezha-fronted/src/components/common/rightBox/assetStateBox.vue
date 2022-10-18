<template>
  <div class="right-box right-box-asset-state" v-clickoutside="{obj: editAssetState, func: clickOutside}">
    <!-- begin--顶部按钮-->
    <div class="right-box-top-btns right-box-form-delete">
      <button @click="del" class="nz-btn nz-btn-size-normal nz-btn-size-alien" id="asset-state-edit-del"
              type="button"
              v-if="editAssetState.id">
        <span class="right-box-top-btn-icon"><i class="nz-icon nz-icon-delete"></i></span>
        <span class="right-box-top-btn-txt">{{$t('overall.delete')}}</span>
      </button>
    </div>
    <!-- end--顶部按钮-->

    <!-- begin--标题-->
    <div class="right-box-title">{{editAssetState.id ? ($t("config.assetState.editAssetState")) : $t("config.assetState.createAssetState")}}</div>
    <!-- end--标题-->

    <!-- begin--表单-->
    <div class="right-box-form-box">
      <el-form :model="editAssetState" :rules="rules" class="right-box-form right-box-form-left" label-position="top" label-width="120px" ref="assetStateForm">
        <!--name-->
        <el-form-item :label="$t('overall.name')" prop="name">
          <el-input id="asset-state-input-name" placeholder="" size="small" type="text" v-model.trim="editAssetState.name"></el-input>
        </el-form-item>
        <!--ping-->
        <el-form-item label="Ping">
          <el-switch :active-value="1" :inactive-value="0" id="asset-state-ping-status"
                     v-model="editAssetState.ping">
          </el-switch>
        </el-form-item>
        <!--monitor-->
        <el-form-item :label="$t('config.system.monitor.monitor')">
          <el-switch :active-value="1" :inactive-value="0" id="asset-state-monitor-status"
                     v-model="editAssetState.monitor">
          </el-switch>
        </el-form-item>
        <!--alert-->
        <el-form-item :label="$t('overall.alert')">
          <el-switch :active-value="1" :inactive-value="0" id="asset-state-alert-status"
                     v-model="editAssetState.alert">
          </el-switch>
        </el-form-item>
        <!--descrption-->
        <el-form-item :label="$t('overall.remark')" prop="remark">
          <el-input id="asset-state-input-description" placeholder="" size="small" :rows="2" type="textarea" show-word-limit maxlength="256" v-model="editAssetState.remark"></el-input>
        </el-form-item>
      </el-form>
    </div>
    <!-- end--表单-->
    <!--底部按钮-->
    <div class="right-box__footer">
      <button class="footer__btn footer__btn--light" id="asset-state-esc"
              v-cancel="{obj: editAssetState, func: esc}">
        <span>{{$t('overall.cancel')}}</span>
      </button>
      <button @click="save" class="footer__btn"
              id="asset-state-save"
      >
        <span>{{$t('overall.save')}}</span>
      </button>
    </div>
  </div>
</template>
<script>
import editRigthBox from '../mixin/editRigthBox'
export default {
  name: 'asset-state-right-box',
  props: {
    assetState: Object,
    assetStateData: Array // 所有数据，用于选择下拉框显示内容
  },
  mixins: [editRigthBox],
  data () {
    return {
      rules: { // 表单校验规则
        name: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ]
      },
      editAssetState: {}
    }
  },
  methods: {
    /* 关闭弹框 */
    esc (refresh) {
      this.$emit('close', refresh)
    },
    clickOutside () {
      this.esc(false)
    },
    /* 保存 */
    save () {
      this.$refs.assetStateForm.validate((valid) => {
        if (valid) {
          if (this.assetState.id) {
            this.$put('/asset/stateConf', this.editAssetState).then(response => {
              if (response.code === 200) {
                this.esc(true)
                this.$message({ duration: 1000, type: 'success', message: this.$t('tip.saveSuccess') })
              } else {
                this.$message.error(response.msg)
              }
            })
          } else {
            this.$post('/asset/stateConf', this.editAssetState).then(response => {
              if (response.code === 200) {
                this.esc(true)
                this.$message({ duration: 1000, type: 'success', message: this.$t('tip.saveSuccess') })
              } else {
                this.$message.error(response.msg)
              }
            })
          }
        } else {
          return false
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
        this.$delete('/asset/stateConf?ids=' + this.editAssetState.id).then(response => {
          if (response.code === 200) {
            this.$message({ duration: 1000, type: 'success', message: this.$t('tip.deleteSuccess') })
            this.esc(true)
          } else {
            this.$message.error(response.msg)
          }
        })
      }).catch(() => {
      })
    }
  },
  watch: {
    assetState: {
      immediate: true,
      deep: true,
      handler (n) {
        this.isEdit = true
        if (n) {
          this.editAssetState = JSON.parse(JSON.stringify(n))
        }
      }
    }
  }
}
</script>
