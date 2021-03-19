<template>
  <div class="right-box right-box-asset-type" v-clickoutside="{obj: editAssetType, func: clickOutside}">
    <!-- begin--顶部按钮-->
    <div class="right-box-top-btns right-box-form-delete">
      <button @click="del" class="nz-btn nz-btn-size-normal nz-btn-size-alien" id="asset-type-edit-del"
              type="button" v-has="'assetType_delete'"
              v-if="editAssetType.buildIn !== 1 && editAssetType.id">
        <span class="right-box-top-btn-icon"><i class="nz-icon nz-icon-delete"></i></span>
        <span class="right-box-top-btn-txt">{{$t('overall.delete')}}</span>
      </button>
    </div>
    <!-- end--顶部按钮-->

    <!-- begin--标题-->
    <div class="right-box-title">{{editAssetType.id ? ($t("config.assetType.editAssetType") + "  ID：" + editAssetType.id) : $t("config.assetType.createAssetType")}}</div>
    <!-- end--标题-->

    <!-- begin--表单-->
    <div class="right-box-form-box">
      <el-form :model="editAssetType" :rules="rules" class="right-box-form right-box-form-left" label-position="top" label-width="120px" ref="assetTypeForm">
        <!--name-->
        <el-form-item :label="$t('overall.name')" prop="name">
          <el-input id="asset-type-input-name" placeholder="" size="small" type="text" v-model="editAssetType.name"></el-input>
        </el-form-item>
        <!--parent-->
        <el-form-item :label="$t('config.assetType.parent')" prop="pid">
          <select-asset-type :asset-type-data="assetTypeData2" :show-parent="showParentAssetType" @selectAssetType="selectParent" id="asset-type-parent"
                              size="small">
            <template v-slot:trigger>
              <el-input :clearable="true" :readonly="true" placeholder="" size="small" v-model="showParentAssetType.name">
                <i @click.stop="clearParent" class="el-icon-circle-close" slot="suffix" style="padding-right: 5px; cursor: pointer;"></i>
              </el-input>
            </template>
          </select-asset-type>
        </el-form-item>
        <!--vm-->
        <el-form-item label="VM">
          <el-switch :active-value="1" :disabled="editAssetType.buildIn == 1" :inactive-value="0" active-color="#ee9d3f" id="asset-type-vm-status"
                     v-model="editAssetType.vm">
          </el-switch>
        </el-form-item>
        <!--vm host-->
        <el-form-item label="VM host">
          <el-switch :active-value="1" :disabled="editAssetType.buildIn == 1" :inactive-value="0" active-color="#ee9d3f" id="asset-type-vmh-status"
                     v-model="editAssetType.vmh">
          </el-switch>
        </el-form-item>
        <!--ssh-->
        <el-form-item label="SSH">
          <el-switch :active-value="1" :disabled="editAssetType.buildIn == 1" :inactive-value="0" active-color="#ee9d3f" id="asset-type-ssh-status"
                     v-model="editAssetType.ssh">
          </el-switch>
        </el-form-item>
        <!--telnet-->
        <el-form-item label="Telnet">
          <el-switch :active-value="1" :disabled="editAssetType.buildIn == 1" :inactive-value="0" active-color="#ee9d3f" id="asset-type-telnet-status"
                     v-model="editAssetType.telnet">
          </el-switch>
        </el-form-item>
        <!--descrption-->
        <el-form-item :label="$t('overall.remark')" prop="remark">
          <el-input id="asset-type-input-description" placeholder="" size="small" type="textarea" v-model="editAssetType.remark"></el-input>
        </el-form-item>
      </el-form>
    </div>
    <!-- end--表单-->
    <!--底部按钮-->
    <div class="right-box-bottom-btns">
      <button class="nz-btn nz-btn-size-normal-new nz-btn-style-light-new" id="asset-type-esc"
              v-cancel="{obj:editAssetType, func:esc}">
        <span>{{$t('overall.cancel')}}</span>
      </button>
      <button @click="save" class="nz-btn nz-btn-size-normal-new nz-btn-style-normal-new"
              id="asset-type-save"
      >
        <span>{{$t('overall.save')}}</span>
      </button>
    </div>
  </div>
</template>
<script>
import selectAssetType from '../popBox/selectAssetType'
export default {
  name: 'asset-type-right-box',
  props: {
    assetType: Object,
    assetTypeData: Array // 所有数据，用于选择下拉框显示内容
  },
  components: {
    selectAssetType
  },
  mounted () {
    this.assetTypeData2 = [...this.assetTypeData]
    this.setDisabled(this.assetTypeData2)
  },
  data () {
    return {
      rules: { // 表单校验规则
        name: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ]
      },
      assetTypeData2: [],
      editAssetType: {},
      showParentAssetType: {}
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
    setDisabled (data, flag) {
      data.forEach(t => {
        if (t.id == this.assetType.id || flag) {
          this.$set(t, 'disabled', true)
          this.setDisabled(t.children, true)
        } else {
          this.$set(t, 'disabled', false)
          this.setDisabled(t.children)
        }
      })
    },
    clearParent () {
      this.showParentAssetType = { name: '', id: '' }
    },
    /* 保存 */
    save () {
      this.$refs.assetTypeForm.validate((valid) => {
        if (valid) {
          this.showParentAssetType.id && (this.editAssetType.pid = this.showParentAssetType.id)
          if (this.assetType.id) {
            this.$put('/asset/typeConf', this.editAssetType).then(response => {
              if (response.code === 200) {
                this.esc(true)
                this.$message({ duration: 1000, type: 'success', message: this.$t('tip.saveSuccess') })
              } else {
                this.$message.error(response.msg)
              }
            })
          } else {
            this.$post('/asset/typeConf', this.editAssetType).then(response => {
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
    selectParent (val) {
      if (!val) {
        return false
      }
      this.showParentAssetType = val
    },
    /* 删除 */
    del () {
      this.$confirm(this.$t('tip.confirmDelete'), {
        confirmButtonText: this.$t('tip.yes'),
        cancelButtonText: this.$t('tip.no'),
        type: 'warning'
      }).then(() => {
        this.$delete('/asset/typeConf?ids=' + this.editAssetType.id).then(response => {
          if (response.code === 200) {
            this.$message({ duration: 1000, type: 'success', message: this.$t('tip.deleteSuccess') })
            this.esc(true)
          } else {
            this.$message.error(response.msg)
          }
        })
      }).catch(() => {
      })
    },
    findParent (data, pid) {
      // eslint-disable-next-line no-unreachable-loop
      for (let i = 0; i < data.length; i++) {
        return data[i].id == pid ? { ...data[i] } : this.findParent(data[i].children, pid)
      }
    }
  },
  watch: {
    assetType: {
      immediate: true,
      deep: true,
      handler (n) {
        if (n) {
          this.editAssetType = JSON.parse(JSON.stringify(n))
          if (this.editAssetType.pid != 0) {
            this.showParentAssetType = this.findParent(this.assetTypeData, this.editAssetType.pid)
          }
        }
      }
    }
  }
}
</script>
<style lang="scss">
  .right-box-asset-type {
    .right-box-sub-title {
      #add-notification {
        border: none;
        outline: none;
        cursor: pointer;

        i {
          font-size: 17px;
          background-color: #f6f6f6;
        }
      }
    }
  }

  .notification-item {
    .el-select {
      width: 100px;

    }
  }
</style>
<style scoped>
  .form-item-title{
    position: absolute;
    left: -120px;
  }
</style>
