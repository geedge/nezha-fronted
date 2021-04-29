<template>
  <div v-clickoutside="{obj:editExprTemp,func:clickOutside}" class="right-box right-box-alert-config">
    <!-- begin--顶部按钮-->
    <div class="right-box-top-btns right-box-form-delete">
      <button v-if="editExprTemp.id" id="alert-box-del" v-has="'alert_silence_delete'" class="nz-btn nz-btn-size-normal nz-btn-size-alien"
              type="button" @click="del">
        <span class="right-box-top-btn-icon"><i class="nz-icon nz-icon-delete"></i></span>
        <span class="right-box-top-btn-txt">{{$t('overall.delete')}}</span>
      </button>
    </div>
    <!-- end--顶部按钮-->

    <!-- begin--标题-->
    <div class="right-box__header">{{editExprTemp.id ? $t("config.exprTemp.edit") + " ID：" + editExprTemp.id :
      $t("config.exprTemp.create")}}
    </div>
    <!-- end--标题-->

    <!-- begin--表单-->
    <div class="right-box__container">
      <el-form ref="ExprTempForm" :model="editExprTemp" :rules="rules"
               class="right-box-form right-box-form-left" label-position="top" label-width="120px">
        <el-form-item :label="$t('config.exprTemp.name')" prop="name">
          <el-input v-model="editExprTemp.name" :placeholder="$t('overall.placeHolder')" size="small"></el-input>
        </el-form-item>
        <el-form-item :label="$t('config.exprTemp.gname')" prop="gname">
          <!--<el-input v-model="editExprTemp.gname" size="small" :placeholder="$t('overall.placeHolder')"></el-input>-->
          <el-autocomplete
            v-model="editExprTemp.gname"
            :fetch-suggestions="querySearch"
            :placeholder="$t('overall.placeHolder')"
            class="inline-input"
            size="small"
            style="width: 100%;"
          ></el-autocomplete>
        </el-form-item>
        <el-form-item :label="$t('config.exprTemp.expression')" prop="expression">
          <!--<el-input v-model="editExprTemp.expression" size="small" :placeholder="$t('overall.placeHolder')"></el-input>-->
          <promql-input
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
        </el-form-item>
        <el-form-item :label="$t('config.exprTemp.remark')" prop="remark">
          <el-input
            v-model="editExprTemp.remark"
            :placeholder="$t('alert.description')"
            maxlength="512"
            show-word-limit
            size="small"
            type="textarea"
          ></el-input>
        </el-form-item>
      </el-form>

    </div>
    <!-- end--表单-->

    <!--底部按钮-->
    <div class="right-box-bottom-btns">
      <button id="alert-box-esc" v-cancel="{obj:editExprTemp,func:esc}"
              class="nz-btn nz-btn-size-normal-new nz-btn-style-light-new">
        <span>{{$t('overall.cancel')}}</span>
      </button>
      <button id="alert-box-save" :class="{'nz-btn-disabled':prevent_opt.save}" :disabled="prevent_opt.save"
              class="nz-btn nz-btn-size-normal-new nz-btn-style-normal-new" @click="save">
        <span>{{$t('overall.save')}}</span>
      </button>
    </div>
  </div>
</template>

<script>
import promqlInput from '../../page/dashboard/explore/promqlInput'
export default {
  name: 'exprTempBox',
  components: {
    'promql-input': promqlInput
  },
  props: {
    exprTemp: Object
  },
  watch: {
    exprTemp: {
      deep: true,
      immediate: true,
      handler (n, o) {
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
      rules: {
        name: [
          { required: true, message: this.$t('validate.required'), trigger: 'change' }
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

<style lang="scss" scoped>
/deep/ .metric-selector-title{
  margin-left: 0 !important;
}
</style>
