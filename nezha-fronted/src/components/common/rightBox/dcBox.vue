<template>
  <div v-clickoutside="{obj:editDc, func: esc}" class="right-box right-box-dc">
      <!-- begin--标题-->
      <div class="right-box__header">
        <div class="header__title">{{editDc.id ? ($t("config.dc.editDc")) : $t("overall.createDatacenter")}}</div>
        <div class="header__operation">
          <span v-cancel="{obj: editDc, func: esc}"><i class="nz-icon nz-icon-close" :title="$t('overall.close')"></i></span>
        </div>
      </div>
      <!-- begin--表单-->
      <div class="right-box__container">
        <div class="container__form">
          <el-form label-width="120px" size="small" :model="editDc" label-position = "top" :rules="rules" ref="dcForm">
            <el-form-item :label='$t("overall.name")' prop="name">
              <el-input placeholder="" maxlength="64" show-word-limit v-model.trim="editDc.name" size="small" id="dc-box-input-name"></el-input>
            </el-form-item>
            <el-form-item :label='$t("asset.location")' prop="location">
              <el-input placeholder="" maxlength="256" show-word-limit v-model="editDc.location" size="small" id="dc-box-input-location"></el-input>
            </el-form-item>
            <el-form-item :label='$t("config.dc.tel")' prop="tel">
              <el-input placeholder="" maxlength="128" show-word-limit v-model="editDc.tel" size="small" id="dc-box-input-tel"></el-input>
            </el-form-item>
            <el-form-item :label='$t("config.dc.principal")' prop="principal">
              <el-select value-key="id" class="right-box__select" popper-class="right-box-select-top right-public-box-dropdown-top prevent-clickoutside" v-model="editDc.principal" placeholder="" size="small" id="dc-box-input-principal">
                <el-option v-for="item in userData" :key="item.id" :label="item.name" :value="item.id" style="width: 620px">
                  <span class="user-name" :title="item.name">{{item.name}}</span><span class="user-username" :title="item.username">@{{item.username}}</span>
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item :label="$t('config.system.basic.lnglat')" prop="lnglat">
              <div style="display: flex">
                <el-input v-model="editDc.lnglat" maxlength="256" placeholder="" size="small" style="width: calc(100% - 50px);margin-right: 20px;"></el-input>
                <latlng-picker
                  ref="latlngPicker"
                  :append-to-body="false"
                  :init-data='editDc.lnglat'
                  :show-zoom="false"
                  @lnglatChange="lnglatChange"
                ></latlng-picker>
              </div>
            </el-form-item>
            <el-form-item :label='$t("overall.state")' prop="state">
              <el-switch
                id="dc-box-input-name"
                v-model="editDc.state"
                active-value="ON"
                inactive-value="OFF">
              </el-switch>
            </el-form-item>
          </el-form>
        </div>
      </div>
      <!--底部按钮-->
      <div class="right-box__footer">
        <button v-cancel="{obj:editDc,func:esc}" id="dc-box-esc" class="footer__btn footer__btn--light">
          <span>{{$t('overall.cancel')}}</span>
        </button>
        <button :class="{'nz-btn-disabled':prevent_opt.save}" :disabled="prevent_opt.save" @click="save" class="footer__btn" id="dc-box-save">
          <span>{{$t('overall.save')}}</span>
        </button>
      </div>

    </div>
</template>

<script>
import latlngPicker from '../latlngPicker'
import editRigthBox from '../mixin/editRigthBox'
import { noSpecialChar, latlng } from '@/components/common/js/validate'

const latitudeNum = /^[\-\+]?([1-8]?\d{1}\.\d{1,7}|90\.0{1,7}|[1-8]?\d{1}|90)$/ // 纬度正则验证
const longitudeNum = /^[\-\+]?(0?\d{1,2}\.\d{1,7}|1[0-7]?\d{1}\.\d{1,7}|180\.0{1,7}|0?\d{1,2}|1[0-7]?\d{1}|180)$/ // 经度正则验证

export default {
  name: 'dcBox',
  components: { latlngPicker },
  props: {
    obj: {
      type: Object
    },
    userData: Array
  },
  mixins: [editRigthBox],
  data () {
    return {
      editDc: {},
      rules: {
        name: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' },
          { validator: noSpecialChar, trigger: 'blur' }
        ],
        lnglat: [
          { required: true, message: this.$t('validate.required'), trigger: 'change' },
          { validator: latlng, trigger: 'change' }
        ]
      },
      areaData: [],
      coordinateFlag: false
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

    /* 保存 */
    save () {
      if (this.prevent_opt.save) {
        return
      }
      this.prevent_opt.save = true
      this.$refs.dcForm.validate((valid) => {
        if (valid) {
          if (this.editDc.id) {
            const param = { ...this.editDc }
            const attr = this.$refs.latlngPicker.getAttribute()
            param.latitude = attr.latitude
            param.longitude = attr.longitude
            this.$put('/dc', param).then(response => {
              this.prevent_opt.save = false
              if (response.code === 200) {
                this.messageShow(this.$t('tip.saveSuccess'), '', { dcId: response.data.id, cabinetBoxShow: true }, false, 'tip.cabinet', 'addCabinet')
                this.esc(true)
              } else {
                this.$message.error(response.msg)
              }
            })
          } else {
            const param = { ...this.editDc }
            if (param.area) {
              param.areaId = param.area.id
            }
            const attr = this.$refs.latlngPicker.getAttribute()
            param.latitude = attr.latitude
            param.longitude = attr.longitude
            if (!longitudeNum.test(param.longitude)) {
              param.longitude = null
            }
            if (!latitudeNum.test(param.latitude)) {
              param.latitude = null
            }
            this.$post('/dc', param).then(response => {
              this.prevent_opt.save = false
              if (response.code === 200) {
                this.messageShow(this.$t('tip.saveSuccess'), '', { dcId: response.data.id, cabinetBoxShow: true }, true, 'tip.cabinet', 'addCabinet')
                this.esc(true)
              } else {
                this.$message.error(response.msg)
              }
            })
          }
        } else {
          this.prevent_opt.save = false
          return false
        }
      })
    },
    lnglatChange (lnglat) {
      this.editDc.lnglat = lnglat
    },
    /* 删除 */
    del () {
      if (this.prevent_opt.save) { return }
      this.prevent_opt.save = true
      this.$confirm(this.$t('tip.confirmDelete'), {
        confirmButtonText: this.$t('tip.yes'),
        cancelButtonText: this.$t('tip.no'),
        type: 'warning'
      }).then(() => {
        this.$delete('/dc' + this.editDc.id).then(response => {
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
    },
    selectArea (area) {
      this.editDc.area.id = area.id
      this.editDc.area.name = area.name
    }
  },
  watch: {
    obj: {
      immediate: true,
      deep: true,
      handler (n, o) {
        this.isEdit = true
        if (!n.id) {
          this.editDc = { ...JSON.parse(JSON.stringify(n)), lnglat: `${n.longitude},${n.latitude}` }
          this.$nextTick(() => {
            this.$refs.latlngPicker.setLnglat(this.editDc.latitude, this.editDc.longitude)
          })
        } else {
          this.editDc = { ...JSON.parse(JSON.stringify(n)), lnglat: `${n.longitude},${n.latitude}` }
          this.$nextTick(() => {
            this.$refs.latlngPicker.setLnglat(this.editDc.latitude, this.editDc.longitude)
          })
        }
      }
    }
  }
}
</script>
