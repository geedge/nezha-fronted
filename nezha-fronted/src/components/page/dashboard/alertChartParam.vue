<template>
  <div id="alertChartParam">
    <el-form :model="parameters" ref="alertChartParam" size="small" label-position="top" label-width="200px" class="alert-chart-param-form alert-chart__padding-top">
      <el-form-item :label="$t('overall.select')" >
        <el-cascader
          id="alert-param-select"
          v-model="parameters.select"
          :options="options"
          :props="props"
          class="form-item"
          popper-class="alert-form-pop right-box-select-top right-public-box-dropdown-top no-style-class"
          clearable></el-cascader>
      </el-form-item>
      <el-form-item :label="$t('alert.rule')">
        <el-select class="form-item" size="small" :placeholder="$t('el.select.placeholder')" popper-class="alert-form-pop right-box-select-top right-public-box-dropdown-top no-style-class" v-model="parameters.alertRule" clearable id="alert-param-alertrule">
          <el-option v-for="(rule, index) in alertRules" :key="index" :label="rule.name" :value="rule.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('alert.severity')" prop="level" class="severity-box">
        <el-select class="form-item" size="small" :placeholder="$t('el.select.placeholder')" popper-class="alert-form-pop right-box-select-top right-public-box-dropdown-top no-style-class" v-model="parameters.level" clearable id="alert-param-level">
          <el-option v-for="item in alertPriority" :id="'alert-severity-'+item.value" :key="item.id" :label="item.name" :value="item.id">
              <span>
                 <i class="nz-icon nz-icon-circle" :style="{color:item.color,'font-size':'12px'}"></i> {{item.name}}
              </span>
          </el-option>
        </el-select>
        <i class="nz-icon nz-icon-circle severity-circle" v-if="parameters.level" :style="{color: alertPriority.length > 0 && alertPriority.find(severity => severity.id ===  parameters.level).color,'font-size':'12px'}"></i>
      </el-form-item>
      <el-form-item :label="$t('overall.state')">
        <el-select class="form-item" size="small" popper-class="alert-form-pop right-box-select-top right-public-box-dropdown-top no-style-class" v-model="parameters.state" clearable id="alert-param-state">
          <el-option v-for="(item, index) in states" :key="index" :label="$t(item.label)" :value="item.value"></el-option>
        </el-select>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: 'alertChartParam',
  props: {

  },
  data () {
    return {
      alertPriority: [],
      parameters: {
        select: [],
        alertRule: '',
        level: '',
        state: '1'
      },
      options: [],
      props: {
        checkStrictly: true,
        label: 'name',
        value: 'id'
        // lazy:true,
        // lazyLoad:$temp.lazyLoadFunc,
      },
      alertRules: [],
      levels: this.$CONSTANTS.alertMessage.levels,
      states: this.$CONSTANTS.alertMessage.states
    }
  },
  created () {
    this.queryAlertRules()
    this.queryOptionsData()
    this.queryPriority()
  },
  methods: {
    saveParam: function (opType = 'save') {
      const param = {
        projectId: '',
        moduleId: '',
        endpointId: '',
        severity: this.parameters.level,
        state: this.parameters.state,
        ruleId: this.parameters.alertRule
      }
      switch (this.parameters.select.length) {
        case 1:
          param.projectId = this.parameters.select[0]
          param.moduleId = ''
          param.endpointId = ''
          break
        case 2:
          param.projectId = this.parameters.select[0]
          param.moduleId = this.parameters.select[1]
          param.endpointId = ''
          break
        case 3:
          param.projectId = this.parameters.select[0]
          param.moduleId = this.parameters.select[1]
          param.endpointId = this.parameters.select[2]
          break
        default:
          param.projectId = ''
          param.moduleId = ''
          param.endpointId = ''
          break
      }
      this.$emit('on-enter-complate', param, opType)
    },
    setData: function (responseData) {
      if (responseData && responseData.param) {
        const param = responseData.param
        const projectId = param.projectId
        const moduleId = param.moduleId
        const endpointId = param.endpointId

        const temp = []

        if (projectId && projectId != '') {
          temp[0] = projectId
          if (moduleId && moduleId != '') {
            temp[1] = moduleId
            if (endpointId && endpointId != '') {
              temp[2] = endpointId
            }
          }
        }
        this.parameters = {
          select: temp,
          alertRule: param.ruleId,
          level: param.severity,
          state: param.state
        }
      }
    },
    queryOptionsData: function () {
      this.$get('/monitor/endpoint/tree').then(response => {
        if (response.code == 200) {
          this.options = response.data.list
        } else {
          console.error(response.msg)
          this.$message.error(response.msg)
        }
      })
    },
    queryAlertRules: function () {
      const param = {
        pageSize: -1
      }
      this.$get('alert/rule', param).then(response => {
        if (response.code == 200) {
          this.alertRules = response.data.list
        } else {
          console.error(response.msg)
          this.$message.error(response.msg)
        }
      })
    },
    queryPriority: function () {
      const param = {
        pageSize: -1
      }
      this.$get('alert/severity', param).then(response => {
        if (response.code == 200) {
          this.alertPriority = response.data.list
        } else {
          console.error(response.msg)
          this.$message.error(response.msg)
        }
      })
    }
  },
  mounted () {

  },
  watch: {
    parameters: {
      immediate: true,
      deep: true,
      handler (n, o) {
      }
    }
  },
  beforeDestroy () {

  }
}
</script>

<style>
#alertChartParam .alert-chart-param-form .form-item{
  width: 100%;
}
#alertChartParam .alert-chart__padding-top.alert-chart-param-form {
  padding-top: 0;
}
#alertChartParam .severity-circle{
  position: absolute;
  left: 10px;
  top: 0;
}
#alertChartParam .severity-box{
  position: relative;
}
#alertChartParam .severity-box /deep/ .el-select .el-input__inner{
  padding-left: 25px;
}
.alert-form-pop{
    z-index:3000 !important;
  }
  .alert-form-pop .el-cascader-panel {
    max-height: 350px;
  }
</style>
