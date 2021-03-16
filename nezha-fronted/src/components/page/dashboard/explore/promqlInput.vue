<template>
  <div class="promqlInput" :style="{height:(errorMsg || appendMsg)?'50px':'auto','margin-bottom':required?'0':'18px'}">
    <div class="query-row">
      <div class="query-input">
        <!--explore页面的样式-->
        <template v-if="styleType == 1">
          <div class="metric-btn" v-if="plugins.indexOf('metric-selector') > -1">
            <el-dropdown class="metric-selector">
              <el-dropdown-menu style="display: none"></el-dropdown-menu>
              <el-button class="metric-btn nz-btn nz-btn-size-normal nz-btn-style-light" @click="toggleDropdown">Metric
                &nbsp;<i class="nz-icon nz-icon-arrow-down"></i></el-button>
              <el-cascader-panel v-loading="tempBoxShowLoading" v-show="dropDownVisible" v-model="cascaderValue" v-clickoutside="closeDropdown"
                                 slot="dropdown" ref="metricSelector" :props="{emitPath:false,}"
                                 :options="metricOptions" @change="metricChange">

                <template slot-scope="{ node, data }">
                  <div :class="['nz-cascade',data.temp?'nz-cascade-temp':'']" @click="()=>{lazyLoad(node,data)}">{{
                    data.label }}
                  </div>
                </template>


              </el-cascader-panel>
            </el-dropdown>
          </div>
          <div class="input-box" @click="dropDownVisible=false" v-if="plugins.indexOf('metric-input') > -1">
            <!--            <el-autocomplete :placeholder="$t('dashboard.metricPreview.inputTip')" :fetch-suggestions="filterInput" clearable @clear="clearExpression" :trigger-on-focus="false" v-model="expressionList[index]" @blur="expressionChange" style="width: 100%;height:36px"></el-autocomplete>-->
            <!--<editor :styleType="styleType" :metric-list="metricStore" :history-param="historyParam" v-model="expressionList[index]" ref="editor" @on-enter="expressionChange" @on-blur="expressionChange" ></editor>?-->
            <el-input @keyup.enter.native="expressionChange" v-model="expressionList[index]" :id="inputId"
                      @input="metricKeyDown"></el-input>
            <div class="append-msg error" v-if="errorMsg"><span>{{errorMsg}}</span></div>
            <div class="append-msg error" v-if="appendMsg"><span>{{appendMsg}}</span></div>
          </div>
        </template>
        <!--right-box里的样式-->
        <template v-if="styleType == 2">
          <el-row v-if="plugins.indexOf('metric-input') > -1 || plugins.indexOf('metric-selector') > -1"
                  style="width: 100%;">
            <el-col
              :style="{'width':plugins.indexOf('metric-selector') > -1 ? '120px':'100%', 'padding': plugins.indexOf('metric-selector') > -1 ?'0 0 0 10px':'0 20px 0 0 ', 'text-align':'left', 'color': '#666','font-weight':plugins.indexOf('metric-selector') > -1 ?'400':'bold'}">
              <el-dropdown class="metric-selector" v-if="plugins.indexOf('metric-selector') > -1">
                <el-dropdown-menu style="display: none"></el-dropdown-menu>
                <span :class="{'expr-title':projectRightBox}" style="cursor: pointer;" @click="toggleDropdown">Metric&nbsp;<i
                  class="nz-icon nz-icon-arrow-down"
                  style="font-size: 14px; -webkit-transform:scale(0.75);display:inline-block;"></i></span>
                <el-cascader-panel v-loading="tempBoxShowLoading" v-if="dropDownVisible" v-clickoutside="closeDropdown" v-model="cascaderValue"
                                   style="text-align: left;" slot="dropdown" ref="metricSelector"
                                   :props="{emitPath:false}" :options="metricOptions" @change="metricChange">

                  <template slot-scope="{ node, data }">
                    <div :class="['nz-cascade',data.temp?'nz-cascade-temp':'']" @click="()=>{lazyLoad(node,data)}">{{
                      data.label }}
                    </div>
                  </template>


                </el-cascader-panel>
              </el-dropdown>
              <label style="line-height: 30px;" v-else>{{$t("alert.config.expr")}}<sup v-if="required"
                                                                                       style="color: #f56c6c">*</sup></label>
            </el-col>
            <el-col
              :style="{'width':plugins.indexOf('metric-selector') > -1 ? 'calc(100% - 120px)':'100%',height: '100%',}">
              <div class="input-box" @click="dropDownVisible=false" v-if="plugins.indexOf('metric-input') > -1">
                <!--<editor :styleType="styleType" :metric-list="metricStore" :historyParam="historyParam" v-model="expressionList[index]" ref="editor" @on-enter="expressionChange" @on-blur="expressionChange" ></editor>-->
                <el-input v-model="expressionList[index]" @change="metricChange" @input="metricKeyDown"></el-input>
                <div class="append-msg error" v-if="errorMsg"><span>{{errorMsg}}</span></div>
                <div class="append-msg error" v-if="appendMsg"><span>{{appendMsg}}</span></div>
              </div>
            </el-col>
          </el-row>
        </template>
      </div>
    </div>
    <div v-if="styleType == 1" style="margin-left: 10px">
      <div class="query-options nz-btn-group nz-btn-group-size-normal nz-btn-group-light">
        <div class="option nz-btn nz-btn-size-normal nz-btn-style-light" @click="addExpression"
             v-if="plugins.indexOf('add') > -1"><i class="nz-icon nz-icon-plus"></i></div>
        <div @click="copyExpression" class="option nz-btn nz-btn-size-normal nz-btn-style-light"
             v-if="plugins.indexOf('copy') > -1"><i class="nz-icon nz-icon-override"></i></div>
        <div class="option nz-btn nz-btn-size-normal nz-btn-style-light" @click="removeExpression"
             v-if="plugins.indexOf('remove') > -1"><i class="nz-icon nz-icon-minus"></i></div>
      </div>
    </div>
    <div v-if="styleType == 2&&showRemove">
      <div class="option" @click="addExpression" v-if="plugins.indexOf('add') > -1"><i class="nz-icon nz-icon-plus"></i>
      </div>
      <div class="option" style="margin-left: 5px; line-height: 32px;" @click="removeExpression"
           v-if="plugins.indexOf('remove') > -1"><i class="nz-icon nz-icon-minus"></i></div>
    </div>


    <el-dialog
      :visible.sync="tempBoxShow"
      :append-to-body="true"
      :width="'auto'"
      :custom-class="'nz-temp-box'"
      :destroy-on-close="true"
      center>
      <el-form v-model="tempBox" class="temp-form-box" ref="tempFormBox" v-if="tempBoxShow">
        <span class="temp-form-box-title">Expression</span>
        <el-form-item prop="expression">
          <el-input v-model="tempBox.expression" size="small" disabled></el-input>
        </el-form-item>
        <span class="temp-form-box-title">Variable</span>
        <el-form-item v-for="(item,index) in tempBox.vars"  :prop="item" :key="index">
          <el-row>
            <el-col :span="5" class="temp-form-box-col">
              <el-input v-model="tempBox.vars[index]" :id="'tempBox'+index"  size="small" :disabled="true"></el-input>
            </el-col>
            <el-col :span="17" v-if="format(item).key">
              <!--<el-input v-model="tempBox[item]" :id="'tempBox'+item"  size="small"></el-input>-->
              <el-select v-model="tempBox[item]" size="small" style="width: 100%">
                <el-option v-for="(item1,index) in format(item).arr" :key="index" :label="item1[format(item).value]" :value="item1[format(item).value]">
                </el-option>
              </el-select>
            </el-col>
            <el-col :span="17" v-else>
              <el-input v-model="tempBox[item]" :id="'tempBox'+item"  size="small"></el-input>
            </el-col>
          </el-row>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <button id="temp-box-esc" class="nz-btn nz-btn-size-normal-new nz-btn-style-light-new" @click="tempBoxShowChange(false)">
          <span>{{$t('overall.cancel')}}</span>
        </button>
      <button :disabled="prevent_opt.save" @click="tempBoxShowChange(true)" class="nz-btn nz-btn-size-normal-new nz-btn-style-normal-new" id="chart-box-save" v-has="`expression_template_render`" >
        <span>{{$t('overall.save')}}</span>
      </button>
      </span>
    </el-dialog>


  </div>
</template>

<script>
  import editor from './editor'

  export default {
    name:"promqlInput",
    components:{
      'editor':editor
    },
    props:{
      index:{type:Number},
      expressionList:{},
      plugins:{type:Array},
      styleType:Number,
      historyParam:{type:Object},
      showRemove:{type:Boolean,default:true},
      projectRightBox:{type:Boolean,default:false},
      metricOptionsParent:{type:Array},
      inputId:String,
      required:{
        type:Boolean,default:false
      },
      showTemp:{
        type:Boolean,
        default:true
      }
      //metricOptions: {type: Array},
      //metricStore: {type: Array}
    },
    data(){
      return {
        dropDownVisible:false,
        //metricStore:[],
        metricOptions:[],
        cascaderValue:'',
        errorMsg:null,
        appendMsg:null,
        editorValue:'',
        firstAddEvent:true,
        tempBoxShow:false,
        tempBox:{
          expression:'',
          vars:[],
        },
        tempBoxShowLoading:false,
        assetOption:[],
        moduleOption:[],
        endpointOption:[],
        datacenterOption:[],
        projectOption:[],
      }
    },
    created(){
      this.queryMetrics();
      this.getAllOptins();
      console.log(123123123);
    },
    methods:{
      closeDropdown(){
        this.dropDownVisible=false;
      },
      clearExpression:function(){
        this.expressionChange();
        this.cascaderValue='';
      },
      addExpression:function(){
        this.$emit('addExpression',this.index);
      },
      copyExpression(){
        this.$emit('copyExpression',this.index);
      },
      removeExpression:function(){
        this.$emit('removeExpression',this.index);
      },
      toggleDropdown(){
        this.dropDownVisible= !this.dropDownVisible;
      },
      queryMetrics:function(){
        this.$get('prom/api/v1/label/__name__/values').then(response=>{
          if(response.status=='success'){
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
              //this.metricStore.push({label:item,value:item,insertText:item})
            });
            console.log(metricMap);
            for(let key of metricMap.keys()){
              let option={
                label:key,
                value:key,
              };
              if(metricMap.get(key)&&metricMap.get(key).length>1){
                option.children=metricMap.get(key);
              }
              this.metricOptions.push(option);
            }
            if(this.showTemp){
              this.getExprTemp()
            }
          }
        })
      },
      filterInput:function(queryString,cb){
        let metrics=Object.assign([],this.metricStore);
        let result=queryString?metrics.filter((item)=>{
          return item.value.toLowerCase().indexOf(queryString.toLowerCase())!= -1;
        }):metrics;
        cb(result)
      },
      metricChange:function(value){
        console.log(value);
        if(!value) return;
        this.expressionList[this.index]=value;
        //this.$refs.editor.setContent(value)
        this.dropDownVisible=false;
        this.$emit('change',value)
      },
      metricKeyDown(val){
        if(this.required){
          this.metricChange(val);
        }
      },
      expressionChange:function(){
        this.$emit('change')
      },
      setError:function(errMsg){
        //console.log(errMsg)
        this.errorMsg=errMsg;
      },
      getExprTemp(){
        this.$get('/expression/tmpl/gname').then(res=>{
          if(res.code===200){
            res.data.list.forEach(item=>{
              this.metricOptions.unshift({
                label:item,
                value:item,
                children:[],
                temp:true,
                child:false,
              });
            })
          }
        })
      },
      lazyLoad(node,data){
        console.log(node,data);
        if(data.temp){
          if(!data.child){
            this.tempBoxShowLoading=true;
            this.$get('/expression/tmpl?pageSize=-1&gname='+data.value).then(res=>{
              this.tempBoxShowLoading=false;
              if(res.code===200){
                res.data.list.forEach(item=>{
                  item.label=item.name;
                  item.value=false;
                  item.temp=true;
                  item.child=true;
                });
                this.metricOptions.find(item=>item.value===data.value).children=res.data.list;
              }
            })
          }else{
            this.dropDownVisible=false
            this.$get('/expression/tmpl/'+data.id).then(res=>{
              if(res.code===200){
                console.log(res);
                res.data.vars.forEach(item=>{
                  res.data[item]='';
                });
                console.log(res.data);
                this.tempBox={
                  ...this.tempBox,
                  ...res.data,
                };
                setTimeout(()=>{
                  this.tempBoxShow=true;
                },100)
              }
            })
          }
        }
      },
      tempBoxShowChange(flag){
        this.tempBoxShow=flag;
        console.log(this.tempBox);
        if(flag){
          this.cascaderValue="";
          let params={};
          params.expression=this.tempBox.expression;
          params.varsVal={};
          let returnFlag=false
          let errorStr=""
          this.tempBox.vars.forEach((item)=>{
            params.varsVal[item]=this.tempBox[item];
            if(!this.tempBox[item]){
              errorStr+=item + ","
              returnFlag=true;
            }
          });


          if(returnFlag) {
            this.$message({
              message:  this.$t('config.exprTemp.errorStr',{errorStr:errorStr}),
              type: 'error'
            });
            return
          }

          this.$post('/expression/tmpl/render',params).then(res=>{
            console.log(res);
            if(res.code===200){
              this.tempBoxShow=false;
              this.expressionList[this.index]=res.data.expression;
              this.$emit('change',res.data.expression);
            }
          })
        } else{
          this.tempBox={}
        }
      },

      format(str){
        let arr=str.split('.')
        let keyword=arr[0].toLowerCase();
        if(arr.length!==1&&arr.length!==2){
          return {
            key:false
          }
        }
        switch(keyword){
          case 'asset':
          case 'module':
          case 'endpoint':
          case 'datacenter':
          case 'project':
            return {
              arr:this[keyword+'Option'],
              key:keyword,
              value:arr[1]?arr[1]:((keyword=='module'||keyword=='project'||keyword=='datacenter')?'name':'host')
            };
          default:
            return {
              key:false
            }
        }
      },
      getAllOptins(){
        this.$get('idc',{pageNo:1,pageSize:-1}).then(response=>{
          if(response.code==200){
            this.datacenterOption=response.data.list;
          }
        });
        this.$get('asset',{pageNo:1,pageSize:-1}).then(response=>{
          if(response.code==200){
            this.assetOption=response.data.list;
          }
        });
        this.$get('project',{pageNo:1,pageSize:-1}).then(response=>{
          if(response.code==200){
            this.projectOption=response.data.list;
          }
        });
        this.$get('module',{pageNo:1,pageSize:-1}).then(response=>{
          if(response.code==200){
            this.moduleOption=response.data.list;
          }
        });
        this.$get('endpoint',{pageNo:1,pageSize:-1}).then(response=>{
          if(response.code==200){
            this.endpointOption=response.data.list;
          }
        });


      }



      /*setMsg:function(){
        this.appendMsg
      }*/
    },
    watch:{
      dropDownVisible:function(n,o){
        if(this.$refs.metricSelector){
          this.$refs.metricSelector.dropDownVisible=n;
          if(!this.expressionList[this.index]||this.expressionList[this.index]==''){
            this.cascaderValue="";
          }
        }
      },
    },
  }
</script>

<style scoped lang="scss">
  .promqlInput {
    position: relative;
    width: 100%;
    display: flex;
    margin-bottom: 18px;
  }

  .promqlInput .query-row {
    width: 100%;
  }

  .input-box .append-msg {
    font-size: 12px;
    line-height: 1;
    padding-top: 4px;
  }

  .input-box .error {
    color: #F56C6C;
  }

  .query-row .query-input {
    display: flex;
    justify-content: flex-start;
  }

  .promqlInput .query-options {
    /*display: flex;*/
    /*justify-content: flex-start;*/
    /*width: 84px;*/
  }

  .query-options .option {
    /*border-right: 1px solid #dde4ed;*/
    /*border-radius: 3px;*/
    /*background-color: #dde4ed;*/
    width: 34px;
    height: 29px !important;
    line-height: 30px;
    text-align: center;
  }

  .query-options .option:focus, .query-options .option:hover {
    background-color: #CCD7E4;
  }

  .query-input .metric-btn {
    width: 100px;
    margin-right: 10px;
  }

  .query-input .input-box {
    width: 100%;
    height: 100%;
  }

  .metric-btn {
    height: 29px !important;
    width: 105px;
    margin-left: 1px;
  }

  .metric-btn:hover, .metric-btn:focus {
    background-color: #CCD7E4;
    color: #606266;
  }

  .metric-selector .el-cascader-panel {
    height: 300px;
    position: absolute;
    z-index: 2100;
    background-color: #FFF;
  }

  .expr-title {
    width: 120px;
    padding-right: 20px;
    text-align: right;
    color: #666;
    font-size: 14px;
    letter-spacing: 0;
    line-height: 22px;
  }

  /deep/ .el-cascader-node {
    padding: 0;
  }

  /deep/ .el-cascader-menu:last-child .el-cascader-node, /deep/ .el-cascader-node__label {
    padding: 0;
  }

  .nz-cascade {
    padding: 0 20px 0 30px;
  }

  .nz-cascade-temp {
    background: #F8F9FB;
  }
  .temp-form-box{
    width: 480px;
  }
  .temp-form-box .temp-form-box-title{
    font-family: PingFangSC-Medium;
    font-size: 14px;
    color: #666666;
    letter-spacing: 0;
    font-weight: 600;
    margin-bottom: 5px;
  }
  .temp-form-box .temp-form-box-col{
    margin-right: 10px;
  }
</style>
<style>
  .metric-selector-pop {
    position: relative;
    z-index: 2100;
  }

  .input-box .el-input__inner {
    height: 30px;
  }
  .nz-temp-box /deep/ .el-dialog__body{
    padding: 10px 20px 0 20px;
  }
  .nz-temp-box /deep/ .el-dialog__footer{
    margin-top: 0;
  }
  .nz-temp-box .nz-btn-style-light-new{
    margin-right: 10px;
  }
  .nz-temp-box .nz-btn-style-normal-new{
    margin-left: 10px;
  }
</style>
