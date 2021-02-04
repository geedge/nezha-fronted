<template>
    <el-form :model="parameters" ref="alertChartParam" size="small" label-position="left" label-width="80px" class="alert-chart-param-form">
      <el-form-item :label="$t('dashboard.panel.chartForm.alertParam.select')" >
        <el-cascader
          id="alert-param-select"
          v-model="parameters.select"
          :options="options"
          :props="props"
          class="form-item"
          popper-class="alert-form-pop no-style-class"
          clearable></el-cascader>
      </el-form-item>
      <el-form-item :label="$t('dashboard.panel.chartForm.alertParam.alertRule')">
        <el-select class="form-item" size="small" popper-class="alert-form-pop no-style-class" v-model="parameters.alertRule" clearable id="alert-param-alertrule">
          <el-option v-for="(rule,index) in alertRules" :key="rule.id" :label="rule.alertName" :value="rule.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('dashboard.panel.chartForm.alertParam.level')">
        <el-select class="form-item" size="small" popper-class="alert-form-pop no-style-class" v-model="parameters.level" clearable id="alert-param-level">
          <el-option v-for="(item,index) in levels" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('dashboard.panel.chartForm.alertParam.state')">
        <el-select class="form-item" size="small" popper-class="alert-form-pop no-style-class" v-model="parameters.state" clearable id="alert-param-state">
          <el-option v-for="(item,index) in states" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
      </el-form-item>
    </el-form>
</template>

<script>
  export default {
    name: "alertChartParam",
    props:{

    },
    data(){
      return{
        parameters:{
          select:[],
          alertRule:'',
          level:'',
          state:'',
        },
        options:[],
        props:{
          checkStrictly: true,
          // lazy:true,
          // lazyLoad:$temp.lazyLoadFunc,
        },
        alertRules:[],
        levels: this.$CONSTANTS.alertMessage.levels,
        states: this.$CONSTANTS.alertMessage.states,
      }
    },
    created() {
      this.queryAlertRules();
      this.queryOptionsData();
    },
    methods:{
      saveParam:function(opType='save'){
        let param={
          projectId:'',
          moduleId:'',
          endpointId:'',
          severity:this.parameters.level,
          state:this.parameters.state,
          ruleId:this.parameters.alertRule,
        }
        switch (this.parameters.select.length) {
          case 1:
            param.projectId=this.parameters.select[0];
            param.moduleId='';
            param.endpointId='';
            break;
          case 2:
            param.projectId=this.parameters.select[0];
            param.moduleId=this.parameters.select[1];
            param.endpointId='';
            break;
          case 3:
            param.projectId=this.parameters.select[0];
            param.moduleId=this.parameters.select[1];
            param.endpointId=this.parameters.select[2];
            break;
          default:
            param.projectId='';
            param.moduleId='';
            param.endpointId='';
            break;
        }
        this.$emit('on-enter-complate',param,opType);
      },
      setData:function(responseData){
        if(responseData&&responseData.param){
          let param=responseData.param;
          let projectId=param.projectId;
          let moduleId=param.moduleId;
          let endpointId=param.endpointId;

          let temp=[];

          if(projectId&&projectId!=''){
            temp[0]=projectId;
            if(moduleId&&moduleId !=''){
              temp[1]=moduleId;
              if(endpointId&&endpointId!=''){
                temp[2]=endpointId
              }
            }
          }
          this.parameters={
            select: temp,
            alertRule:param.ruleId,
            level:param.severity,
            state:param.state
          }

        }
      },
      queryOptionsData:function(){
        let param={
          pageSize:-1
        }
        this.$get('endpoint',param).then(response=>{
          /*
          * {
          * project-1:{
          * data:{},
          * module-1:{
          *   data:{},
          *   endpoints:[]
          * }
          * }
          * }
          * */
          if(response.code==200){
            const data=response.data.list;
            let result=new Map();
            data.forEach(item=>{
              let project=result.get('project-'+item.project.id);
              if(!project){
                project=new Map();
                project.set('data',item.project)
                let module=new Map();
                module.set('data',item.module)
                module.set('endpoints',[item])
                project.set('module-'+item.module.id,module)
                result.set('project-'+item.project.id,project);
              }else{
                let module=project.get('module-'+item.module.id);
                if(!module){
                  module=new Map();
                  module.set('data',item.module)
                  module.set('endpoints',[item])
                  project.set('module-'+item.module.id,module)
                  result.set('project-'+item.project.id,project);
                }else{
                  let endpoints=module.get('endpoints');
                  endpoints.push(item);
                  module.set('endpoints',endpoints);
                  project.set('module-'+item.module.id,module);
                  result.set('project-'+item.project.id,project);
                }
              }
            })

            result.forEach((project,projectKey)=>{
              let option={};
              project.forEach((value,moduleKey)=>{
                if(moduleKey ==  'data'){
                  option.label=value.name;
                  option.value=value.id;
                }else{
                  let module=value;
                  let moduleData=module.get('data');
                  let endpoints=module.get('endpoints');
                  endpoints=endpoints.map(item=>{
                    return {label: item.asset.host, value: item.id}
                  });
                  /*//测试代码
                  for (let i = 1; i < 16; i++) {
                    endpoints.push({label: '114.51.41.' + i, value: i+8887});
                  }*/
                  if(!option.children){
                    option.children=[];
                  }
                  option.children.push({
                    label:moduleData.name,
                    value:moduleData.id,
                    children:endpoints
                  })
                }
              })
              this.options.push(option)
            });
          }else{
            console.error(response.msg)
            this.$message.error(response.msg)
          }
        })
      },
      queryAlertRules:function(){
        let param={
          pageSize:-1
        }
        this.$get('alert/rule',param).then(response=>{
          if(response.code == 200){
            this.alertRules=response.data.list;
          }else{
            console.error(response.msg)
            this.$message.error(response.msg)
          }
        })
      }
    },
    mounted() {

    },
    watch:{
      parameters:{
        immediate:true,
        deep:true,
        handler(n,o){
        }
      }
    },
    beforeDestroy(){

    }
  }
</script>

<style scoped>
.alert-chart-param-form .form-item{
  width: 100%;
}
</style>
<style>
  .alert-form-pop{
    z-index:3000 !important;
  }
  .alert-form-pop .el-cascader-panel {
    max-height: 350px;
  }
</style>
