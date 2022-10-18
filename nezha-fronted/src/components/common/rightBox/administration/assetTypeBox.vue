<template>
  <div v-clickoutside="{obj: editAssetType, func: esc}" class="right-box right-box-asset-type">
    <div class="right-box__header">
      <div class="header__title">{{editAssetType.id ? $t('config.assetType.editAssetType') : $t('config.assetType.createModel')}}</div>
      <div class="header__operation">
        <span v-cancel="{obj: editAssetType, func: esc}"><i class="nz-icon nz-icon-close" :title="$t('overall.close')"></i></span>
      </div>
    </div>
    <div class="right-box__container">
      <div class="container__form">
        <el-form ref="assetTypeForm" :model="editAssetType" :rules="rules" label-position="top" label-width="120px">
          <!--name-->
          <el-form-item :label="$t('overall.name')" prop="name">
            <el-input maxlength="64" show-word-limit v-model.trim="editAssetType.name" size="small" type="text"></el-input>
          </el-form-item>
          <!--vm-->
          <el-form-item :label='$t("config.assetType.vm")' prop="vm">
            <el-switch
              v-model="editAssetType.vm"
              :active-value="1"
              :inactive-value="0">
            </el-switch>
          </el-form-item>
          <!--vmh-->
          <el-form-item :label='$t("config.assetType.vmh")' prop="vmh">
            <el-switch
              v-model="editAssetType.vmh"
              :active-value="1"
              :inactive-value="0">
            </el-switch>
          </el-form-item>
          <!--authProtocol-->
          <el-form-item :label='$t("config.assetType.authProtocol")' prop="authProtocol">
            <el-select class="right-box__select" popper-class="right-box-select-top prevent-clickoutside" v-model="editAssetType.authProtocol" placeholder="Please select">
              <el-option :key="option.value" v-for="option in assetConstants.assetType.authProtocolOptions" :value="option.value" :label="option.label"></el-option>
            </el-select>
          </el-form-item>
          <!--snmpEnable-->
          <el-form-item :label='$t("config.assetType.snmpEnable")' prop="snmpEnable">
            <el-switch
              v-model="editAssetType.snmpEnable"
              :active-value="1"
              :inactive-value="0">
            </el-switch>
          </el-form-item>
          <!--snmpCollect-->
          <el-form-item :label='$t("config.assetType.snmpCollect")' prop="snmpCollect">
            <el-switch
              v-model="editAssetType.snmpCollect"
              :active-value="1"
              :inactive-value="0">
            </el-switch>
          </el-form-item>
          <!--sshCollect-->
          <el-form-item :label='$t("config.assetType.sshCollect")' prop="sshCollect">
            <el-switch
              v-model="editAssetType.sshCollect"
              :active-value="1"
              :inactive-value="0">
            </el-switch>
          </el-form-item>
          <el-form-item :label='$t("config.assetType.sshCollectScript")' prop="sshCollectScript">
            <el-input v-model="editAssetType.sshCollectScript" size="small" type="text"></el-input>
          </el-form-item>
          <!-- ChartTemplate -->
          <!-- <el-form-item :label="$t('config.type.ChartTemplate')" prop="ChartTemplate">
            <v-selectpage
            :data="chartlList"
            :tb-columns="ChartSearchShowFields"
            :max-select-limit="3"
            :multiple="true"
            title="ChartSearch"
            placeholder="Please select item"
            key-field="id"
            v-model="editAssetType.chartIds"
            show-field="name"
            class="form-control"
            @values="(data) => {editAssetType.chartIds = data.map(d => d.id).join(',')}"
          ></v-selectpage>
          </el-form-item> -->
        </el-form>
      </div>
    </div>
    <div class="right-box__footer">
      <button id="asset-edit-cancel" v-cancel="{obj: editAssetType, func: esc}" class="footer__btn footer__btn--light">
        <span>{{$t('overall.cancel')}}</span>
      </button>
      <button id="asset-edit-save" :class="{'footer__btn--disabled': prevent_opt.save}" :disabled="prevent_opt.save" class="footer__btn" @click="save">
        <span>{{$t('overall.save')}}</span>
      </button>
    </div>
  </div>
</template>

<script>
import { asset as assetConstants } from '@/components/common/js/constants'
import selectWalk from '../../popBox/selectWalk'
import editRigthBox from '../../mixin/editRigthBox'

export default {
  name: 'assetTypeBox',
  components: {
    'select-walk': selectWalk
  },
  props: {
    obj: {
      type: Object
    }
  },
  computed: {
    isCurrentUser () {
      return function (username) {
        return localStorage.getItem('nz-username') == username
      }
    }
  },
  mixins: [editRigthBox],
  data () {
    return {
      assetConstants,
      editAssetType: {},
      editModule: {},
      assetTypeList: [
        {
          id: '',
          authProtocol: ''
        }
      ],
      value: '',
      url: 'asset/typeConf',
      // brandUrl: 'asset/brand',
      rightBox: { model: { show: false } },
      roles: [],
      rules: {
        name: [
          { required: true, message: '必填', trigger: 'blur' }
        ],
        brandId: [
          { required: true, message: this.$t('validate.required'), trigger: 'change' }
        ]
      }
    }
  },
  watch: {
    obj: {
      deep: true,
      immediate: true,
      handler (n) {
        this.isEdit = true
        this.editAssetType = JSON.parse(JSON.stringify(n))
      }
    }
  },
  created () {
    // this.getBrandList()
    // this.ChartTemplateList()
    this.assetType()
  },
  methods: {
    clickOutside () {
      this.esc(false)
    },
    /* 关闭弹框 */
    esc (refresh) {
      this.prevent_opt.save = false
      this.$emit('close', refresh)
    },
    save () {
      this.$refs.assetTypeForm.validate((valid) => {
        if (valid) {
          if (this.editAssetType.id) {
            this.$put(this.url, this.editAssetType).then(res => {
              this.prevent_opt.save = false
              if (res.code === 200) {
                this.$message({ duration: 2000, type: 'success', message: this.$t('tip.saveSuccess') })
                this.esc(true)
              } else {
                this.$message.error(res.msg)
              }
            })
          } else {
            this.$post(this.url, this.editAssetType).then(res => {
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
    selectWalk (walk) {
      if (this.editModule.walk.indexOf(walk) != -1) {
        this.editModule.walk.splice(this.editModule.walk.indexOf(walk), 1)
      } else {
        this.editModule.walk.push(walk)
      }
    },
    assetType () {
      this.$get('asset/typeConf').then(res => {
        this.assetTypeList = res.data.list
      })
    }
  }
}
</script>
