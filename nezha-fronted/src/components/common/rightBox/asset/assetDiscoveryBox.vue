<template>
  <div v-clickoutside="{obj:editAssetDiscovery,func:clickOutside}" class="right-box right-box-prom asset-discovery-right-box">
    <!-- begin--标题-->
    <div class="right-box__header">
      <div class="header__title">{{editAssetDiscovery.id ? ($t("asset.discoveryAdd")) : $t("asset.discoveryEdit")}}</div>
      <div class="header__operation">
        <span v-cancel="{obj: editAssetDiscovery, func: esc}"><i class="nz-icon nz-icon-close" :title="$t('overall.close')"></i></span>
      </div>
    </div>
    <!-- end--标题-->
    <!-- begin--表单-->
    <div class="right-box__container">
      <div class="container__form">
        <el-form ref="assetDiscoveryForm" :model="editAssetDiscovery" :rules="rules" label-position = "top" label-width="120px">
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
            <el-radio-group v-model="editAssetDiscovery.schedule.type" size="small" @change="changeType">
              <el-radio-button :label="1">{{$t('backup.only')}}</el-radio-button>
              <el-radio-button :label="2">{{$t('backup.Daily')}}</el-radio-button>
              <el-radio-button :label="3">{{$t('backup.Weekly')}}</el-radio-button>
              <el-radio-button :label="4">{{$t('backup.Monthly')}}</el-radio-button>
            </el-radio-group>
          </el-form-item>
          <!--         schedule.stime -->
          <el-form-item :label='$t("asset.discoveryStartAt")' prop="schedule.stime">
            <my-date-picker
              v-model="editAssetDiscovery.schedule.stime"
              type="datetime"
              style="width: 100%"
              size="small"
              placeholder="Start time"
              :value-format="timeFormatStrToDatePickFormat()"
              :format="timeFormatStrToDatePickFormat()"
            >
            </my-date-picker>
          </el-form-item>
          <!--         schedule.repeat -->
          <el-form-item :label='$t("asset.discoveryRepeatEvery")' prop="schedule.repeat" v-if="editAssetDiscovery.schedule.type === 2 || editAssetDiscovery.schedule.type === 3">
            <el-input placeholder="" v-model.number="editAssetDiscovery.schedule.repeat" size="small" id="asset-discovery-box-input-repeat">
              <template slot="append">{{editAssetDiscovery.schedule.type === 2? $t('backup.day') : $t('el.datepicker.week')}}</template>
            </el-input>
          </el-form-item>
          <!--         schedule.nums -->
          <el-form-item :label='$t("backup.WeekOn")' prop="schedule.nums" v-if="editAssetDiscovery.schedule.type === 3">
            <el-checkbox-group v-model="editAssetDiscovery.schedule.nums" size="medium" @change="clearNumsError()">
              <el-checkbox-button v-for="num in weeks" :label="num" :key="num">{{weekStr[num - 1]}}</el-checkbox-button>
            </el-checkbox-group>
          </el-form-item>
          <el-form-item :label='$t("backup.DayOfMonth")' prop="schedule.nums" v-if="editAssetDiscovery.schedule.type === 4">
            <div class="months-box">
              <div
                @click="checkItem(num)"
                v-for="num in months"
                :label="num"
                :key="num"
                class='days-item'
                :class="{
                 'is-checked': editAssetDiscovery.schedule.nums.indexOf(num) !== -1,
                  'line-feed': num > 7
                }"
              >
                {{num < 32 ? num : $t('asset.discoveryLast')}}
              </div>
              <div class="right-border"></div>
              <div class="bottom-border"></div>
            </div>
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
import { nameValidate, noSpecialChar, arrLength } from '@/components/common/js/validate'
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
          { validator: nameValidate, trigger: 'blur' }
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
          { required: true, message: this.$t('validate.required'), trigger: 'blur' },
          { validator: noSpecialChar, trigger: 'blur' }
        ]
      },
      editAssetDiscovery: {},
      credentialData: [],
      weeks: 7,
      weekStr: [
        this.$t('week.Mon'),
        this.$t('week.Tue'),
        this.$t('week.Wed'),
        this.$t('week.Thu'),
        this.$t('week.Fri'),
        this.$t('week.Sat'),
        this.$t('week.Sun')
      ],
      months: 32
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
    clearNumsError () {
      this.$refs.assetDiscoveryForm.clearValidate('schedule.nums')
    },
    checkItem (num) {
      this.$refs.assetDiscoveryForm.clearValidate('schedule.nums')
      if (this.editAssetDiscovery.schedule.nums.indexOf(num) !== -1) {
        this.editAssetDiscovery.schedule.nums = this.editAssetDiscovery.schedule.nums.filter(item => item != num)
      } else {
        this.editAssetDiscovery.schedule.nums.push(num)
      }
    },
    changeType () {
      this.$refs.assetDiscoveryForm.clearValidate('schedule.nums')
      this.$refs.assetDiscoveryForm.clearValidate('schedule.repeat')
      switch (this.editAssetDiscovery.schedule.type) {
        case 1:
          this.editAssetDiscovery.schedule.repeat = ''
          this.editAssetDiscovery.schedule.nums = []
          break
        case 2:
          this.editAssetDiscovery.schedule.repeat = 1
          this.editAssetDiscovery.schedule.nums = []
          break
        case 3:
          this.editAssetDiscovery.schedule.repeat = 1
          this.editAssetDiscovery.schedule.nums = []
          break
        case 4:
          this.editAssetDiscovery.schedule.repeat = ''
          this.editAssetDiscovery.schedule.nums = []
          break
      }
    },
    /* 保存 */
    save () {
      this.$refs.assetDiscoveryForm.validate(valid => {
        if (valid) {
          this.prevent_opt.save = true
          const params = this.$lodash.cloneDeep(this.editAssetDiscovery)
          params.schedule.stime = this.momentStrToTimestamp(params.schedule.stime)
          if (this.editAssetDiscovery.id) {
            this.$put('/tool/discovery', params).then(response => {
              if (response.code === 200) {
                this.$message({ duration: 1000, type: 'success', message: this.$t('tip.saveSuccess') })
                this.esc(true)
              } else {
                this.$message.error(response.msg)
              }
              this.prevent_opt.save = false
            })
          } else {
            this.$post('/tool/discovery', params).then(response => {
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
        const editAssetDiscovery = this.$lodash.cloneDeep(n)
        if (editAssetDiscovery.schedule && editAssetDiscovery.schedule.stime) {
          editAssetDiscovery.schedule.stime = this.momentTz(editAssetDiscovery.schedule.stime)
        }
        this.editAssetDiscovery = this.$lodash.cloneDeep(editAssetDiscovery)
      }
    }
  }
}
</script>
