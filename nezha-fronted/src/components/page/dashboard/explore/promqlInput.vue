<template>
    <div class="promqlInput" :style="{height:(errorMsg || appendMsg)?'50px':'auto'}">
      <div class="query-row">
        <div class="query-input">
          <!--explore页面的样式-->
          <template v-if="styleType == 1">
            <div class="metric-btn" v-if="plugins.indexOf('metric-selector') > -1">
              <el-dropdown class="metric-selector">
                <el-dropdown-menu style="display: none"></el-dropdown-menu>
                <el-button class="metric-btn nz-btn nz-btn-size-normal nz-btn-style-light" @click="toggleDropdown">Metric &nbsp;<i class="el-icon-arrow-down"></i></el-button>
                <el-cascader-panel v-show="dropDownVisible" v-model="cascaderValue"  slot="dropdown" ref="metricSelector" :props="{emitPath:false}" :options="metricOptions"  @change="metricChange" ></el-cascader-panel>
              </el-dropdown>
            </div>
            <div class="input-box" @click="dropDownVisible=false" v-if="plugins.indexOf('metric-input') > -1">
              <!--            <el-autocomplete :placeholder="$t('dashboard.metricPreview.inputTip')" :fetch-suggestions="filterInput" clearable @clear="clearExpression" :trigger-on-focus="false" v-model="expressionList[index]" @blur="expressionChange" style="width: 100%;height:36px"></el-autocomplete>-->
              <editor :styleType="styleType" :metric-list="metricStore" :history-param="historyParam" v-model="expressionList[index]" ref="editor" @on-enter="expressionChange" @on-blur="expressionChange" ></editor>
              <div class="append-msg error" v-if="errorMsg"><span>{{errorMsg}}</span></div>
              <div class="append-msg error" v-if="appendMsg"><span>{{appendMsg}}</span></div>
            </div>
          </template>
          <!--right-box里的样式-->
          <template v-if="styleType == 2">
            <el-row v-if="plugins.indexOf('metric-input') > -1 || plugins.indexOf('metric-selector') > -1" style="width: 100%;">
              <el-col style="width: 120px; padding-right: 20px; text-align: right; color: #666">
                <el-dropdown class="metric-selector" v-if="plugins.indexOf('metric-selector') > -1">
                  <el-dropdown-menu style="display: none"></el-dropdown-menu>
                  <span style="cursor: pointer;" @click="toggleDropdown">Metric&nbsp;<i class="el-icon-arrow-down" style="font-size: 14px; -webkit-transform:scale(0.75);display:inline-block;"></i></span>
                  <el-cascader-panel v-show="dropDownVisible" v-model="cascaderValue" style="text-align: left;" slot="dropdown" ref="metricSelector" :props="{emitPath:false}" :options="metricOptions"  @change="metricChange"></el-cascader-panel>
                </el-dropdown>
                <label style="line-height: 30px;" v-else>{{$t("alert.config.expr")}}</label>
              </el-col>
              <el-col style="width: calc(100% - 120px); height: 100%;">
                <div class="input-box" @click="dropDownVisible=false" v-if="plugins.indexOf('metric-input') > -1">
                  <editor :styleType="styleType" :metric-list="metricStore" :historyParam="historyParam" v-model="expressionList[index]" ref="editor" @on-enter="expressionChange" @on-blur="expressionChange" ></editor>
                  <div class="append-msg error" v-if="errorMsg"><span>{{errorMsg}}</span></div>
                  <div class="append-msg error" v-if="appendMsg"><span>{{appendMsg}}</span></div>
                </div>
              </el-col>
            </el-row>
          </template>
        </div>
      </div>
      <div v-if="styleType == 1">
        <div class="query-options nz-btn-group nz-btn-group-size-normal nz-btn-group-light">
          <div class="option nz-btn nz-btn-size-normal nz-btn-style-light" @click="addExpression" v-if="plugins.indexOf('add') > -1"><i class="el-icon-plus"></i></div>
          <div class="option nz-btn nz-btn-size-normal nz-btn-style-light" @click="removeExpression" v-if="plugins.indexOf('remove') > -1"><i class="el-icon-minus"></i></div>
        </div>
      </div>
      <div v-if="styleType == 2">
        <div class="option" @click="addExpression" v-if="plugins.indexOf('add') > -1"><i class="el-icon-plus"></i></div>
        <div class="option" style="margin-left: 5px; line-height: 32px;" @click="removeExpression" v-if="plugins.indexOf('remove') > -1"><i class="el-icon-minus"></i></div>
      </div>
    </div>
</template>

<script>
  import editor from './editor'
    export default {
      name: "promqlInput",
      components:{
        'editor':editor
      },
      props:{
        index:{type:Number},
        expressionList:{},
        plugins: {type: Array},
        styleType: Number,
        historyParam:{type:Object}
      },
      data(){
        return {
          dropDownVisible:false,
          metricStore:[],
          metricOptions:[],
          cascaderValue:'',
          errorMsg:null,
          appendMsg:null,
          editorValue:'',
        }
      },
      created() {
        this.queryMetrics();
      },
      methods:{
        clearExpression:function(){
          this.expressionChange();
          this.cascaderValue='';
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
                this.metricStore.push({label:item,value:item,insertText:item})
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
          this.$refs.editor.setContent(value)
          this.dropDownVisible=false;
          this.$emit('change')
        },
        expressionChange:function(){
          this.$emit('change')
        },
        setError:function(errMsg){
          console.log(errMsg)
          this.errorMsg=errMsg;
        },
        setMsg:function(){
          this.appendMsg
        }
      },
      watch:{
        dropDownVisible:function(n,o){
          if(this.$refs.metricSelector){
            this.$refs.metricSelector.dropDownVisible=n;
            console.log(this.cascaderValue)
            if(!this.expressionList[this.index]||this.expressionList[this.index] == ''){
              this.cascaderValue="";
            }
          }
        },

      }
    }
</script>

<style scoped lang="scss">
  .promqlInput{
    position: relative;
    height: 36px;
    width: 100%;
    display: flex;
    margin-bottom: 18px;
  }
  .promqlInput .query-row{
    width: 100%;
  }
  .input-box .append-msg{
    font-size: 12px;
    line-height: 1;
    padding-top: 4px;
  }
  .input-box .error{
    color: #F56C6C;
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
  .query-input .metric-btn {
    width: 100px;
    margin-right: 10px;
  }
  .query-input .input-box{
    width: 100%;
    height: 100%;
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
  .input-box .el-input__inner{
    height: 36px;
  }
</style>
