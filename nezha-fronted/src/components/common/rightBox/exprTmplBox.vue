<template>
  <div v-clickoutside="{obj:editExprTemp,func:clickOutside}" class="right-box right-box-alert-expr">
    <!-- begin--标题-->
    <div class="right-box__header">
      <div class="header__title">{{editExprTemp.id ? $t("config.exprTemp.edit"):
      $t("config.exprTemp.create")}}
    </div>
      <div class="header__operation">
        <span v-cancel="{obj: editExprTemp, func: esc}"><i class="nz-icon nz-icon-close" :title="$t('overall.close')"></i></span>
      </div>
    </div>
    <!-- begin--表单-->
    <div class="right-box__container">
      <div class="container__form container__form-width">
        <el-form ref="ExprTempForm" :model="editExprTemp" :rules="rules" label-position="top" label-width="120px">
          <el-form-item :label="$t('overall.name')" prop="name">
            <el-input :maxlength="64" show-word-limit v-model="editExprTemp.name" :placeholder="$t('overall.placeHolder')" size="small"></el-input>
          </el-form-item>
          <el-form-item :label="$t('dashboard.panel.chartForm.group')" prop="gname">
            <!--<el-input v-model="editExprTemp.gname" size="small" :placeholder="$t('overall.placeHolder')"></el-input>-->
            <el-autocomplete
              v-model="editExprTemp.gname"
              :fetch-suggestions="querySearch"
              :placeholder="$t('overall.placeHolder')"
              :maxlength="64"
              class="inline-input"
              popper-class="right-box-select-top right-public-box-dropdown-top"
              size="small"
              style="width: 100%;"
            ></el-autocomplete>
          </el-form-item>
          <el-form-item :label="$t('config.exprTemp.expression')" prop="expression">
            <el-row style="line-height: 32px;">
              <promql-input
                :from-father-data="true"
                :metricOptionsParent="metricOptions"
                :id="'promqlKeys0'"
                :key="'promqlKeys0'"
                :expression-list="editExprTemp.expression"
                :index="0"
                :plugins="['metric-selector', 'metric-input', 'remove']"
                :show-temp="false"
                :showRemove="false"
                :styleType="2"
                @change="expressionChange"
              ></promql-input>
            </el-row>
          </el-form-item>
          <el-form-item :label="$t('overall.remark')" prop="remark">
            <el-input
              v-model="editExprTemp.remark"
              maxlength="256"
              show-word-limit
              size="small" :rows="2"
              type="textarea"
            ></el-input>
          </el-form-item>
        </el-form>
      </div>
    </div>
    <!-- end--表单-->
    <!--底部按钮-->
    <div class="right-box__footer">
      <button id="alert-box-esc" v-cancel="{obj:editExprTemp,func:esc}"
              class="footer__btn footer__btn--light">
        <span>{{$t('overall.cancel')}}</span>
      </button>
      <button id="alert-box-save" :class="{'nz-btn-disabled':prevent_opt.save}" :disabled="prevent_opt.save"
              class="footer__btn" @click="save">
        <span>{{$t('overall.save')}}</span>
      </button>
    </div>
  </div>
</template>

<script>
import promqlInput from '../../page/dashboard/explore/promqlInput'
import editRigthBox from '../mixin/editRigthBox'
import { checkExpressionAge } from '@/components/common/js/validate'
import promqlInputMixin from '@/components/common/mixin/promqlInput'

export default {
  name: 'exprTempBox',
  components: {
    'promql-input': promqlInput
  },
  props: {
    exprTemp: Object
  },
  mixins: [editRigthBox, promqlInputMixin],
  watch: {
    exprTemp: {
      deep: true,
      immediate: true,
      handler (n, o) {
        this.isEdit = true
        const obj = { ...n }
        obj.expression = [obj.expression]
        this.editExprTemp = Object.assign(this.editExprTemp, obj)
      }
    }
  },
  data () {
    return {
      editExprTemp: {
        id: '',
        name: '',
        gname: '',
        expression: '',
        remark: ''
      },
      gnameList: [],
      showTemp: false,
      rules: {
        name: [
          { required: true, message: this.$t('validate.required'), trigger: 'change' },
          { validator: checkExpressionAge, trigger: true }
        ],
        gname: [
          { required: true, message: this.$t('validate.required'), trigger: 'change' }
        ]
        // remark:[
        //   { required: true,message: this.$t('validate.required'), trigger: 'change'},
        // ]
      }
    }
  },
  mounted () {
    this.getGnameList()
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
      if (this.prevent_opt.save) {
        return
      }
      ;
      this.prevent_opt.save = true
      this.$refs.ExprTempForm.validate((valid) => {
        const params = { ...this.editExprTemp }
        params.expression = params.expression[0]
        if (!params.expression[0]) {
          this.prevent_opt.save = false
          this.$message.error(this.$t('config.exprTemp.expressionError'))
          return
        }
        if (valid) {
          if (this.editExprTemp.id) {
            this.$put('expression/tmpl', params).then(response => {
              this.prevent_opt.save = false
              if (response.code === 200) {
                this.$message({ duration: 1000, type: 'success', message: this.$t('tip.saveSuccess') })
                this.esc(true)
              } else {
                this.$message.error(response.msg)
              }
            })
          } else {
            this.$post('expression/tmpl', params).then(response => {
              this.prevent_opt.save = false
              if (response.code === 200) {
                this.$message({ duration: 1000, type: 'success', message: this.$t('tip.saveSuccess') })
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
    del () {
      if (this.prevent_opt.save) {
        return
      }
      ;
      this.prevent_opt.save = true
      this.$confirm(this.$t('tip.confirmDelete'), {
        confirmButtonText: this.$t('tip.yes'),
        cancelButtonText: this.$t('tip.no'),
        type: 'warning'
      }).then(() => {
        this.$delete('/alert/silence?ids=' + this.editExprTemp.id).then(response => {
          this.prevent_opt.save = false
          if (response.code === 200) {
            this.$message({ type: 'success', message: this.$t('tip.deleteSuccess') })
            this.esc(true)
          } else {
            this.$message.error(response.msg)
          }
        })
      }).catch(() => {
        this.prevent_opt.save = false
      })
    },
    getGnameList () {
      this.$get('/expression/tmpl/gname').then(res => {
        if (res.code === 200) {
          this.gnameList = res.data.list.map(item => {
            return {
              value: item
            }
          })
        }
      })
    },
    querySearch (queryString, cb) {
      const restaurants = this.gnameList
      const results = queryString ? restaurants.filter(this.createFilter(queryString)) : restaurants
      // 调用 callback 返回建议列表的数据
      cb(results)
    },
    createFilter (queryString) {
      return (restaurant) => {
        return (restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0)
      }
    },
    expressionChange (val) {
      this.editExprTemp.expression[0] = val
    }
  }
}
</script>

<style scoped>
/deep/ .metric-selector-title{
  margin-left: 0 !important;
}
/deep/ .query-row  .metric-selector-input-box {
  width: calc(100% - 120px);
}
</style>
