<template>
    <div class="promqlInput">
      <div class="query-row">
        <div class="query-input">
          <div class="metricBtn">
            <el-dropdown class="metric-selector">
              <el-dropdown-menu style="display: none"></el-dropdown-menu>
              <el-button class="metric-btn nz-btn nz-btn-size-normal nz-btn-style-light" @click="toggleDropdown">Metric &nbsp;<i class="el-icon-arrow-down"></i></el-button>
              <el-cascader-panel v-show="dropDownVisible"  slot="dropdown" ref="metricSelector" :props="{emitPath:false}" :options="metricOptions"  @change="metricChange"></el-cascader-panel>
            </el-dropdown>

          </div>
          <div class="inputBox">
            <el-autocomplete :placeholder="$t('dashboard.metricPreview.inputTip')" :fetch-suggestions="filterInput" clearable @clear="clearExpression" :trigger-on-focus="false" v-model="expressionList[index]" @blur="expressionChange" style="width: 100%;height:36px"></el-autocomplete>
          </div>
        </div>
      </div>
      <div style="margin-left: 5px">
        <div class="query-options nz-btn-group nz-btn-group-size-normal nz-btn-group-light">
          <div class="option nz-btn nz-btn-size-normal nz-btn-style-light" @click="addExpression"><i class="el-icon-plus"></i></div>
          <div class="option nz-btn nz-btn-size-normal nz-btn-style-light" @click="removeExpression"><i class="el-icon-minus"></i></div>
        </div>
      </div>
    </div>
</template>

<script>
    export default {
      name: "promqlInput",
      props:{
        index:{type:Number},
        expressionList:{}
      },
      data(){
        return {
          dropDownVisible:false,
          metricStore:[],
          metricOptions:[],
        }
      },
      created() {
        this.queryMetrics();

      },
      methods:{
        clearExpression:function(){
          this.expressionChange();
        },
        addExpression:function(){
          this.$emit('addExpression',this.index);
        },
        removeExpression:function(){
          this.$emit('removeExpression',this.index);
        },
        toggleDropdown:function(){
          this.dropDownVisible=!this.dropDownVisible;
          if(this.dropDownVisible == true){
            let $temp=this;
            document.addEventListener('click',function(e){
              e.stopPropagation ? e.stopPropagation() : e.cancelBubble = true;
              $temp.dropDownVisible=false;
            },false)
            this.$el.addEventListener('click',function(e){
              e.stopPropagation ? e.stopPropagation() : e.cancelBubble = true;
            },false)
          }
        },
        queryMetrics:function(){
          this.metricOptions=[];
          this.$get('prom/api/v1/label/__name__/values').then(response=>{
            if(response.status == 'success'){
              let metrics=response.data.sort();
              let metricMap=new Map();
              metrics.forEach((item)=>{
                let key='';
                if(/^[a-zA-Z]+?_[a-zA-Z]*/.test(item)){
                  key=item.split('_')[0];
                }else if(/^_\w*/.test(item)){
                  key='      ';
                }else{
                  key=item;
                }
                if(metricMap.get(key)){
                  let values=metricMap.get(key);
                  values.push({label:item,value:item});
                }else{
                  let values=[{label:item,value:item}];
                  metricMap.set(key,values);
                }
                this.metricStore.push({label:item,value:item})
              })
              for(let key of metricMap.keys()){
                let option={
                  label:key,
                  value:key,
                }
                if(metricMap.get(key) && metricMap.get(key).length>1){
                  option.children=metricMap.get(key);
                }
                this.metricOptions.push(option);
              }
            }
          })
        },
        filterInput:function(queryString, cb){
          let metrics=Object.assign([],this.metricStore);
          let result=queryString?metrics.filter((item)=>{
            return item.value.toLowerCase().indexOf(queryString.toLowerCase()) != -1;
          }):metrics;
          cb(result)
        },
        metricChange:function(value){
          this.expressionList[this.index]=value;
          this.dropDownVisible=false;
          this.$emit('change')
        },
        expressionChange:function(){
          this.$emit('change')
        }
      },
      watch:{
        dropDownVisible:function(n,o){
          if(this.$refs.metricSelector){
            this.$refs.metricSelector.dropDownVisible=n;
          }
        },
      }
    }
</script>

<style scoped>
  .promqlInput{
    position: relative;
    height: 36px;
    width: 100%;
    display: flex;
    margin-bottom: 10px;
  }
  .promqlInput .query-row{
    width: 100%;
  }
  .query-row .query-input{
    display: flex;
    justify-content: flex-start;
  }
  .promqlInput .query-options{
    /*display: flex;*/
    /*justify-content: flex-start;*/
    /*width: 84px;*/
  }
  .query-options .option{
    /*border-right: 1px solid #dde4ed;*/
    /*border-radius: 3px;*/
    /*background-color: #dde4ed;*/
    width: 34px;
    height: 34px !important;
    line-height: 34px;
    text-align: center;
  }
  .query-options .option:focus,.query-options .option:hover{
    background-color: #CCD7E4;
  }
  .query-input .metricBtn{
    width: 100px;
    margin-right: 10px;
  }
  .query-input .inputBox{
    width: 100%;
  }
  .metric-btn{
    height: 36px !important;
    width: 105px;
    margin-left: 1px;
  }
  .metric-btn:hover ,.metric-btn:focus {
    background-color: #CCD7E4;
    color:#606266;
  }
  .metric-selector .el-cascader-panel{
    height: 300px;
    position: absolute;
    z-index: 2100;
    background-color: #FFF;
  }
</style>
<style>
  .metric-selector-pop{
    position:relative;
    z-index: 2100;
  }
  .inputBox .el-input__inner{
    height: 36px;
  }
</style>
