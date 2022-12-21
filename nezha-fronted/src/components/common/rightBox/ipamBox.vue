<template>
  <div class="right-box right-box-ipam" v-clickoutside="{obj:editipam,func:clickOutside}" >
    <!-- begin--标题-->
    <div class="right-box__header">
      <div class="header__title">{{editipam.id ? ($t("overall.ipam.edit")) : $t("overall.ipam.create")}}</div>
      <div class="header__operation">
        <span v-cancel="{obj: editipam, func: esc}"><i class="nz-icon nz-icon-close" :title="$t('overall.close')"></i></span>
      </div>
    </div>
    <!-- begin--表单-->
    <div class="right-box__container">
      <div class="container__form">
        <el-form :model="editipam" label-position = "top" label-width="120px" :rules="rules" ref="ipamForm">
          <el-form-item :label="$t('overall.name')" prop="name">
            <el-input maxlength="64" rows="4" show-word-limit placeholder="" v-model="editipam.name" size="small"></el-input>
          </el-form-item>
          <el-form-item :label="$t('overall.type')" prop="type">
            <el-select id="account-input-language"
                       class="right-box__select"
                       v-model="editipam.type"
                       placeholder=""
                       @change="validValueType"
                       :disabled="!!editipam.id"
                       popper-class="right-box-select-top prevent-clickoutside"
                       size="small">
              <template v-for="item in typeList">
                <el-option :key="item.value" :label="item.label" :value="item.value"></el-option>
              </template>
            </el-select>
          </el-form-item>
          <div class="cidr-title">CIDR</div>
          <div class="cidr">
            <el-form-item class="cidr-addr" prop="addr">
              <el-input maxlength="256" rows="4" show-word-limit :placeholder="$t('overall.address')" v-model="editipam.addr" size="small"></el-input>
            </el-form-item>
            <el-form-item prop="mask">
              <el-select id="account-input-language"
                         class="right-box__select"
                         v-model="editipam.mask"
                         placeholder="mask"
                         popper-class="right-box-select-top right-box__select-width prevent-clickoutside"
                         size="small">
                <template v-for="(item, index) in maskList">
                  <el-option :key="item" :label="item" :value="item" :title="'/'+item+'\('+2 ** index+'\)'">
                    <span>/{{item}}({{2 ** index}})</span>
                  </el-option>
                </template>
              </el-select>
            </el-form-item>
          </div>
          <el-form-item :label="$t('overall.dc')" prop="dc.name">
            <div class="right-box-form-content">
              <el-select id="prom-box-input-dc" v-model="editipam.dc" placeholder="" class="right-box__select" popper-class="right-box-select-top right-public-box-dropdown-top prevent-clickoutside" size="small" value-key="id">
                <el-option v-for="item in dcData" :id="'prom-edit-dc-op-'+item.id" :key="item.id" :label="item.name" :value="item">
                  <span class="config-dropdown-label-txt">{{item.name}}</span>
                </el-option>
              </el-select>
            </div>
          </el-form-item>
          <el-form-item :label="$t('overall.vlan')" prop="vlan">
            <el-input maxlength="128" rows="4" show-word-limit placeholder="" v-model="editipam.vlan" size="small"></el-input>
          </el-form-item>
          <el-form-item :label="$t('overall.remark')" prop="remark">
            <el-input maxlength="256" rows="2" show-word-limit type="textarea" placeholder="" v-model="editipam.remark" size="small" id="mib-box-input-remark"></el-input>
          </el-form-item>
        </el-form>
      </div>
    </div>

    <!--底部按钮-->
    <div class="right-box__footer">
      <button v-cancel="{obj:editipam,func:esc}" id="model-box-esc" class="footer__btn footer__btn--light">
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
  name: 'ipamBox',
  props: {
    obj: Object
  },
  mixins: [editRigthBox],
  data () {
    const inputIpv = (rule, value, callback) => {
      const Ipv4 = /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/
      const Ipv6 = /^([\da-fA-F]{1,4}:){6}((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^::([\da-fA-F]{1,4}:){0,4}((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^([\da-fA-F]{1,4}:):([\da-fA-F]{1,4}:){0,3}((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^([\da-fA-F]{1,4}:){2}:([\da-fA-F]{1,4}:){0,2}((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^([\da-fA-F]{1,4}:){3}:([\da-fA-F]{1,4}:){0,1}((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^([\da-fA-F]{1,4}:){4}:((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^([\da-fA-F]{1,4}:){7}[\da-fA-F]{1,4}$|^:((:[\da-fA-F]{1,4}){1,6}|:)$|^[\da-fA-F]{1,4}:((:[\da-fA-F]{1,4}){1,5}|:)$|^([\da-fA-F]{1,4}:){2}((:[\da-fA-F]{1,4}){1,4}|:)$|^([\da-fA-F]{1,4}:){3}((:[\da-fA-F]{1,4}){1,3}|:)$|^([\da-fA-F]{1,4}:){4}((:[\da-fA-F]{1,4}){1,2}|:)$|^([\da-fA-F]{1,4}:){5}:([\da-fA-F]{1,4})?$|^([\da-fA-F]{1,4}:){6}:$/
      setTimeout(() => {
        if (this.editipam.type === 4) {
          if (Ipv4.test(value)) {
            callback()
          } else {
            callback(new Error(vm.$t('validate.address')))
          }
        } else if (this.editipam.type === 6) {
          if (Ipv6.test(value)) {
            callback()
          } else {
            callback(new Error(vm.$t('validate.address')))
          }
        }
      }, 100)
    }
    return {
      editipam: {},
      typeList: [
        { label: 'IPV4', value: 4 },
        { label: 'IPV6', value: 6 }
      ],
      maskList: [],
      rules: {
        name: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ],
        type: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ],
        addr: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' },
          { validator: inputIpv, trigger: 'blur' }
        ],
        mask: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ],
        'dc.name': [
          { required: true, message: this.$t('validate.required'), trigger: 'change' }
        ]
      },
      dcData: []
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
      this.$refs.ipamForm.validate((valid) => {
        if (valid) {
          this.prevent_opt.save = true
          if (!this.editipam.id) {
            this.$post('/ipam/subnet', this.editipam).then(response => {
              if (response.code == 200 && response.msg == 'success') {
                this.$message({ duration: 1000, type: 'success', message: this.$t('tip.saveSuccess') })
                this.esc(true)
              } else {
                this.$message.error(response.msg)
              }
              this.prevent_opt.save = false
            })
          } else {
            this.$put('/ipam/subnet', this.editipam).then(response => {
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
    },
    // 获取dc下拉列表数据
    getDcData () {
      this.$get('dc', { pageSize: -1 }).then(response => {
        if (response.code === 200) {
          this.dcData = response.data.list
        }
      })
    },
    validValueType (e) {
      const mask = []
      let maskArray = []
      if (e === 4) {
        for (let i = 1; i <= 32; i++) {
          mask.push(i)
        }
        maskArray = Array.from(new Set(mask))
        maskArray.sort(function (a, b) { return b - a })
        this.editipam.mask = 24
      } else if (e === 6) {
        for (let i = 1; i <= 128; i++) {
          mask.push(i)
        }
        maskArray = Array.from(new Set(mask))
        maskArray.sort(function (a, b) { return b - a })
        this.editipam.mask = 24
      }
      this.maskList = maskArray
    }
  },
  mounted () {
    this.getDcData()
  },
  watch: {
    obj: {
      immediate: true,
      deep: true,
      handler (n, o) {
        this.isEdit = true
        this.editipam = JSON.parse(JSON.stringify(n))
        const mask = []
        let maskArray = []
        if (this.editipam.type === 4) {
          for (let i = 1; i <= 32; i++) {
            mask.push(i)
          }
          maskArray = Array.from(new Set(mask))
          maskArray.sort(function (a, b) { return b - a })
          this.maskList = maskArray
        } else if (this.editipam.type === 6) {
          for (let i = 1; i <= 128; i++) {
            mask.push(i)
          }
          maskArray = Array.from(new Set(mask))
          maskArray.sort(function (a, b) { return b - a })
        }
        this.maskList = maskArray
      }
    },
    'editipam.dc': function (n, o) {
      this.editipam.dcId = n.id
    }
  }
}
</script>
