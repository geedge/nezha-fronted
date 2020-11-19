<template>
  <div class="mc" @click.self="clickOutside">
    <div class="right-box right-box-edit-endpoint">
      <!-- begin--顶部按钮-->
      <div class="right-box-top-btns right-box-form-delete" v-if="lineData.lineId">
        <button id="edit-ep-del" type="button" @click="del" class="nz-btn nz-btn-size-normal nz-btn-size-alien">
        <span class="right-box-top-btn-icon"><i class="nz-icon nz-icon-delete"></i></span>
        <span class="right-box-top-btn-txt">{{$t('overall.delete')}}</span>
        </button>
      </div>
      <!-- end--顶部按钮-->

      <!-- begin--标题-->
      <div class="right-box-title" v-if="!lineData.lineId">
        {{$t('project.topology.addLine')}}
      </div>
      <div class="right-box-title" v-if="lineData.lineId">
        {{$t("project.topology.editLine") + "  ID：" + lineData.lineId}}
      </div>
      <!-- end--标题-->

      <!-- begin--表单-->
      <el-scrollbar class="right-box-form-box" ref="scrollbar">
        <el-form class="right-box-form  right-box-form-left" ref="form" :model="form" label-width="120px" :rules="rules">
          <el-form-item :label="$t('project.topology.lineName')" prop="lineName" class="line-name">
            <el-input v-model="form.lineName"  size="small"></el-input>
          </el-form-item>
          <div class="right-box-sub-title" style="margin-bottom: 20px">{{$t('project.topology.option')}}</div>
          <div class="line-option">
            <!--<el-form-item :label="$t('project.topology.width')" prop="width" class="line-width">-->
              <!--<el-input v-model="form.width"  size="small"></el-input>-->
            <!--</el-form-item>-->
            <el-form-item :label="$t('project.topology.width')" prop="width" class="line-width">
              <el-select v-model="form.width" placeholder="" :popper-append-to-body="false"  size="small">
                <div slot="prefix">
                  <div class="width-option">
                    <div :style="{height:0,width:'80%',borderTop:form.width+'px'+' solid' +' #899FB7'}"></div>
                  </div>
                </div>
                <el-option v-for="(item,index) in widthOption" :label="item+'px'" :value="item" :key="index">
                  <div class="width-option">
                    <span style="marginRight:5px">{{item}}px</span><div class="width-option-line" :style="{height:0,width:'80%',borderTop:item+'px solid #899FB7'}"></div>
                  </div>
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item :label="$t('project.topology.dashes')" prop="dashes" class="line-width">
              <el-select v-model="form.dashes" placeholder="" :popper-append-to-body="false"  size="small">
                <div slot="prefix">
                  <div class="width-option">
                    <div class="width-option-line" v-if="!form.dashes" :style="{height:0,width:'80%',borderTop:'1px solid #899FB7'}"></div>
                    <div class="dashes-box" v-if="form.dashes">
                      <div class="width-option-line"
                           v-for="count in dashesCount(form.dashes)"
                           :key="count"
                           :style="{
                           height:0,
                           width:dashesWidth(form.dashes)+'px',
                           borderTop:'1px solid #899FB7',
                           display:'inline-block'
                         }">

                      </div>
                    </div>
                  </div>
                </div>
                <el-option v-for="(item,index) in dashesOption" :label="item+'px'" :value="item" :key="index">
                  <div class="width-option">
                    <div class="width-option-line" v-if="!item" :style="{height:0,width:'80%',borderTop:'1px solid #899FB7'}"></div>
                    <div class="dashes-box" v-if="item">
                      <div class="width-option-line"
                           v-for="count in dashesCount(item)"
                           :key="count"
                           :style="{
                           height:0,
                           width:dashesWidth(item)+'px',
                           borderTop:'1px solid #899FB7',
                           display:'inline-block'
                         }">

                      </div>
                    </div>
                  </div>
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item :label="$t('project.topology.arrows')" prop="arrows" class="arrows">
              <el-select v-model="form.arrows" placeholder="" :popper-append-to-body="false"  size="small">
                <div slot="prefix">
                  <div class="width-option">
                    <div v-if='form.arrows==="from"' class="width-option-line" :style="{height:0,width:'80%',borderTop:'1px solid #899FB7'}">
                      <i class="nz-icon nz-icon-sanjiaoxing position-right" style="top: -15px;"></i>
                    </div>
                    <div  v-if='form.arrows==="to"' class="width-option-line" :style="{height:0,width:'80%',borderTop:'1px solid #899FB7'}">
                      <i class="nz-icon nz-icon-sanjiaoxing position-left" style="top: -15px;"></i>
                    </div>
                    <div v-if='form.arrows==="from;to"' class="width-option-line" :style="{height:0,width:'80%',borderTop:'1px solid #899FB7'}">
                      <i class="nz-icon nz-icon-sanjiaoxing position-left" style="top: -15px;"></i>
                      <i class="nz-icon nz-icon-sanjiaoxing position-right" style="top: -15px;"></i>
                    </div>
                    <div v-if='form.arrows==="0"' class="width-option-line" :style="{height:0,width:'80%',borderTop:'1px solid #899FB7'}"></div>
                  </div>
                </div>
                <el-option label="from" value="from">
                  <div class="width-option">
                    <div class="width-option-line" :style="{height:0,width:'80%',borderTop:'1px solid #899FB7'}">
                      <i class="nz-icon nz-icon-sanjiaoxing position-right"></i>
                    </div>
                  </div>
                </el-option>
                <el-option label="to" value="to">
                  <div class="width-option">
                    <div class="width-option-line" :style="{height:0,width:'80%',borderTop:'1px solid #899FB7'}">
                      <i class="nz-icon nz-icon-sanjiaoxing position-left"></i>
                    </div>
                  </div>
                </el-option>
                <el-option label="from;to" value="from;to">
                  <div class="width-option">
                    <div class="width-option-line" :style="{height:0,width:'80%',borderTop:'1px solid #899FB7'}">
                      <i class="nz-icon nz-icon-sanjiaoxing position-left"></i>
                      <i class="nz-icon nz-icon-sanjiaoxing position-right"></i>
                    </div>
                  </div>
                </el-option>
                <el-option label="" value="0">
                  <div class="width-option">
                    <div class="width-option-line" :style="{height:0,width:'80%',borderTop:'1px solid #899FB7'}"></div>
                  </div>
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item :label="$t('project.topology.color')" class="color">
              <div class="color-show" @click="colorPickerClick" v-clickoutside="colorOut">
                <div class="color-show-left" :style="{background:form.color}"></div>
                <span> {{form.color}}</span>
                <span class="color-arrows">
                  <i class="nz-icon nz-icon-arrow-down" v-show="!showPicker"></i>
                  <i class="nz-icon nz-icon-arrow-up" v-show="showPicker"></i>
                </span>
              </div>
              <div class="color-content" ref="color-content">
                <el-color-picker
                  v-model="form.color"
                  :predefine="predefineColors"
                  ref="colorPicker"
                  @active-change="colorChange"
                >
                </el-color-picker>
              </div>
            </el-form-item>
            <el-form-item :label="$t('project.topology.lineType')" prop="type" class="type">
              <el-select v-model="form.type" placeholder="" :popper-append-to-body="false"  size="small">
                <el-option :label="$t('project.topology.straight')" :value="false">
                  {{$t('project.topology.straight')}}
                </el-option>
                <!--<el-option label="continuous" value="continuous">-->
                  <!--continuous-->
                <!--</el-option>-->
                <!--<el-option label="discrete" value="discrete">-->
                  <!--discrete-->
                <!--</el-option>-->
                <!--<el-option label="diagonalCross" value="diagonalCross">-->
                  <!--diagonalCross-->
                <!--</el-option>-->
                <!--<el-option label="straightCross" value="straightCross">-->
                  <!--straightCross-->
                <!--</el-option>-->
                <!--<el-option label="horizontal" value="horizontal">-->
                  <!--horizontal-->
                <!--</el-option>-->
                <!--<el-option label="vertical" value="vertical">-->
                  <!--vertical-->
                <!--</el-option>-->
                <el-option :label="$t('project.topology.curve')" value="curvedCW">
                  {{$t('project.topology.curve')}}
                </el-option>
              </el-select>
            </el-form-item>
          </div>
          <div  class="right-box-sub-title" style="margin-bottom: 20px">
            <span>{{$t('alert.config.expr')}}</span>
            <span class="float-right" @click="addExpression"><i style="font-size: 16px; cursor: pointer;" class="nz-icon nz-icon-create-square"></i></span>
          </div>
          <el-row class="element-item expr form-row-item" style="" v-for="index of promqlKeys.length" :key="'ele' + index">
            <span class="nz-icon-minus-medium nz-icon-minus-position" style="padding: 0 8px"><i class="nz-icon nz-icon-minus" @click="removeExpression(index-1)"></i></span>
            <el-form-item  :rules="{required: true,message: '名称不能为空', trigger: 'blur'}" :prop="'name.' + (index-1)">
              <el-row>
                <template>
                  <el-col class="expr-title" style="">
                    {{$t('project.topology.chartName')}}
                  </el-col>
                  <el-col style="width: calc(100% - 122px);">
                    <el-input
                      v-model="form.name[index-1]"
                      type="text"
                      size="small"
                    ></el-input>
                  </el-col>
                </template>
              </el-row>
            </el-form-item>
            <el-row>
              <el-col class="expr-title">
                {{$t('project.topology.unit')}}
              </el-col>
              <el-col style="width: calc(100% - 120px);">
                <el-cascader filterable placeholder="" popper-class="no-style-class unit-popper-class" size="small" style="width: 100%"
                             :options="unitOptions"
                             :props="{ expandTrigger: 'click',emitPath:false }"
                             :show-all-levels="false"
                             v-model="unit[index-1]"
                ></el-cascader>
              </el-col>
            </el-row>
            <div>
              <promql-input
                :ref="'promql-'+(index-1)"
                :id="promqlKeys[index-1]"
                :key="promqlKeys[index-1]"
                :expression-list="expressions"
                :index="index-1"
                :styleType="2"
                :plugins="['metric-selector', 'metric-input', 'remove']"
                @change="expressionChange"
                @removeExpression="removeExpression"
                :showRemove="false"
                :projectRightBox="true"
              ></promql-input>
            </div>
            <el-row>
              <template>
                <el-col class="expr-title">
                  {{$t('dashboard.panel.chartForm.legend')}}&nbsp;
                  <el-popover :content="$t('dashboard.panel.chartForm.legendTip')" placement="top" width="150" trigger="hover">
                    <i slot="reference" class="nz-icon nz-icon-info-normal" @mouseover="rz"></i>
                  </el-popover>
                </el-col>
                <el-col style="width: calc(100% - 120px);">
                  <el-input v-model="legends[index-1]" type="text" size="small"></el-input>
                </el-col>
              </template>
            </el-row>
          </el-row>
        </el-form>
      </el-scrollbar>

      <!-- end--表单-->

      <!--底部按钮-->
      <div class="right-box-bottom-btns">
        <button @click="esc" id="ep-edit-esc" class="nz-btn nz-btn-size-normal-new nz-btn-style-light-new">
          <span>{{$t('overall.cancel')}}</span>
        </button>
        <button @click="onSubmit" id="ep-edit-save" class="nz-btn nz-btn-size-normal-new nz-btn-style-normal-new">
          <span>{{$t('overall.save')}}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
  import promqlInput from "@/components/page/dashboard/explore/promqlInput";
  import chartDataFormat from "@/components/charts/chartDataFormat";
  import {getUUID,resetZIndex} from "@/components/common/js/common";
  var rz = {
    methods: {
      rz(e) {
        resetZIndex(e);
      }
    }
  };
  export default {
    name:"addLine",
    props:{
      lineData:{},
    },
    components:{
      'promql-input': promqlInput,
    },
    mixins: [rz],
    watch:{
      lineData:{
        handler(n){
          this.form={
            arrows:n.arrows,
            color:n.color,
            lineId:n.id,
            width:n.width,
            lineName:n.name,
            name:[],
            dashes:!n.dashes?n.dashes:JSON.stringify(n.dashes),
            type:n.smooth.type?n.smooth.type:false,
            // dashes:!n.dashes?n.dashes:JSON.stringify([n.dashes[2],n.dashes[2]]),
          };
         if( n.expressions){
           n.expressions.forEach((item,index)=>{
             this.addExpression();
             this.form.name[index]=item.name;
             this.unit[index]=item.unit;
             this.expressions[index]=item.metric;
             this.legends[index]=item.legend;
           })
         }

        },
        immediate: true,
        deep: true,
      }
    },
    data(){
      return{
        form:{
          arrows:'0',
          label:'',
          color:'#1e90ff',
          lineName:'',
          lineId:'',
          width:'',
          type:'',
          roundness:'',
          name:[],
          dashes:''
        },
        predefineColors: [
          '#ff4500',
          '#ff8c00',
          '#ffd700',
          '#90ee90',
          '#00ced1',
          '#1e90ff',
          '#c71585',
        ],
        showPicker:false,
        unitOptions: chartDataFormat.unitOptions(),
        promqlKeys:[],
        expressions: [],
        promqlCount:0,
        elementIds:[],
        legends:[],
        widthOption:['1','2','3','4'],
        dashesOption:[false,'[3,3]','[9,9]','[15,15]','[21,21]'],
        unit:[],
        rules:{
          // arrows: [
          //   { required: true, message: '', trigger: 'change' },
          // ],
          lineName: [
            { required: true, message: '', trigger: 'change' },
          ],
        }
      }
    },
    mounted(){
      // this.addExpression();
      if( this.lineData.expressions){
        this.lineData.expressions.forEach((item,index)=>{
          this.$refs['promql-'+(index)][0].metricChange(this.expressions[index]);
        })
      }
    },
    methods:{
      onSubmit(){
        this.$refs['form'].validate((valid) => {
          if (valid) {
            let model=Object.assign({id:this.form.lineId?this.form.lineId:undefined},{...this.form},{color: {color:this.form.color,highlight:this.form.color,hover:this.form.color,opacity:1.0}});
            // model.label=this.form.lineName;
            model.name=this.form.lineName;
            model.width = parseInt(model.width) || 4;
            if(!this.form.type){
              model.smooth={
                enabled:false,
              };
            } else{
              model.smooth={
                roundness:0.5 ,// (Math.random()*8 +1)/10 获取0.1-0.9之间的随机数
                type:this.form.type,
              };
            }
            model.dashes=!model.dashes?model.dashes:JSON.parse(model.dashes);
            model.expressions=[];
            this.promqlKeys.forEach((item,index)=>{
              model.expressions.push({
                "name": this.form.name[index],
                "unit": this.unit[index],
                "metric": this.expressions[index],
                "legend": this.legends[index],
              })
            });
            this.$emit('addLine',model);
          }
        });
      },
      expressionChange: function () {

      },
      addExpression() {
        this.expressions.push('');
        this.legends.push('');
        this.form.name.push('');
        this.unit.push(1);
        this.promqlKeys.push(getUUID());
        this.elementIds.push("");
        this.promqlCount++;
        this.$nextTick(() => {
          this.$refs.scrollbar.update();
        });
      },
      removeExpression(index) {
        if (this.promqlCount >= 1) {
          this.expressions.splice(index, 1);
          this.legends.splice(index, 1);
          this.form.name.splice(index, 1);
          this.unit.splice(index, 1);
          this.promqlKeys.splice(index, 1);
          this.elementIds.splice(index, 1);
          this.promqlCount--;
          this.$nextTick(() => {
            this.expressions.forEach((ex, index) => {
              if (ex) {
                this.$refs[`promql-${index}`][0].metricChange(ex);
              }
            });
          });
        }
        this.$nextTick(() => {
          this.$refs.scrollbar.update();
        });
      },
      /*关闭弹框*/
      esc(refresh) {
        this.$emit("close", refresh);
      },
      clickOutside() {
        this.esc(false);
      },
      del(){
        this.$emit('del');
        this.esc();
      },
      colorPickerClick(){
        this.showPicker=true;
        this.$refs['colorPicker'].showPicker=true;
      },
      colorChange(val){
        this.form.color=this.colorRGBtoHex(val)
      },
      colorRGBtoHex(color) {
        let rgb = color.split(',');
        let r = parseInt(rgb[0].split('(')[1]);
        let g = parseInt(rgb[1]);
        let b = parseInt(rgb[2].split(')')[0]);
        let hex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
        return hex;
      },
      colorOut(){
        this.showPicker=false;
      },
      //返回dashes的第一項
      dashesWidth(item){
        return JSON.parse(item)[0]
      },
      // 返回應該遍历的次数
      dashesCount(item){
        if(!item){
          return 0;
        }
        return Math.floor(190/this.dashesWidth(item)/2);
      }

    },

  }
</script>

<style scoped>
  .mc{
    position: fixed;
    width: 100vw;
    height: 100vh;
    top: 0;
    left: 0;
    z-index: 11;
  }
  .color-content{
    height: 0;
    width: 0;
    overflow: hidden;
    position: absolute;
    top: 0;
    left: 140px;
  }
  .color{
    position: relative;
  }
  .color-show{
    border: 1px solid #E7EAED;
    border-radius: 5px;
    display: flex;
    align-items: center;
    width: calc(100% - 32px);
    height: 30px;
  }
  .color-show-left{
    width: 18px;
    height: 18px;
    border: 1px solid #E7EAED;
    border-radius: 5px;
    margin: 0 5px;
  }
  .line-name{
    width: calc(100% - 70px);
  }
  .form-title{
    font-size: 14px;
    color: #333333;
    padding-left: 28px;
    margin-bottom: 15px;
  }
  /deep/ .el-form-item__label{
    font-size: 14px;
    color: #666666;
  }
  .arrows /deep/ .el-input.el-input--prefix.el-input--suffix,.line-width /deep/ .el-input.el-input--prefix.el-input--suffix{
    border: 1px solid #DCDFE6;
    height: 28px;
    width: calc(100% - 32px);
  }
  .arrows /deep/ .el-input__inner,.line-width /deep/ .el-input__inner{
    display: none;
  }
  .arrows /deep/ .el-input__prefix,.line-width /deep/ .el-input__prefix{
    height: 28px;
    line-height: 28px;
    color: #899FB7;
  }
  .arrows /deep/ .el-input__prefix > div{
    width: 100%;
    height: 100%;
  }
  .line-width /deep/ .el-input__prefix{
    width: calc(100% - 32px);
    display: flex;
    align-items: center;
  }
  .line-width /deep/ .el-input__prefix > div{
    width: 100%;
  }
  /deep/ .el-select{
    width: 100%;
  }
  .line-option{
    display: flex;
    flex-wrap: wrap;
    margin-left: 70px;
  }
  .line-option > div{
    width: 50%;
  }
  .line-option .line-width .el-input{
    width: clac(100% - 60px);
  }
  /deep/ .el-input--small .el-input__icon{
    line-height: 28px;
  }
  .width-option-line{
    position: relative;
    color: #899FB7;
  }
  .position-left{
    position: absolute;
    left:-4px ;
    top: -18px;
    transform: rotate(180deg);
  }
  .position-right{
    position: absolute;
    right: -4px;
    top: -18px;
  }
  /deep/ .el-select-dropdown__item.selected .width-option-line {
    border-color: #ee9d3f !important;
    color: #ee9d3f !important;
  }
  /deep/ .el-dropdown-menu__item:focus .width-option-line, .el-dropdown-menu__item:not(.is-disabled):hover .width-option-line, .el-select-dropdown.is-multiple .el-select-dropdown__item.selected.hover .width-option-line, .el-select-dropdown__item.hover .width-option-line, .el-select-dropdown__item:hover .width-option-line{
    border-color: #ee9d3f !important;
    color: #ee9d3f !important;
  }
  .color-arrows{
    color: #C0C4CC;
    position: absolute;
    right: 42px;
  }
  .color-arrows .nz-icon{
    font-size: 12px;
  }
  .element-item{
    padding: 20px 0;
    border-bottom: 1px dashed #dfe7f2;
    width: 100%;
  }
  /deep/ .right-box-form  .element-item.form-row-item {
    padding: 20px 20px 20px 0;
    border: 1px dashed #dfe7f2;
    width: calc(100% - 120px);
    margin-left: 70px;
    position: relative;
  }
  .element-item.expr /deep/ .el-form-item__content{
    position: relative;
    margin-left: 0 !important;
  }
  .element-item.expr /deep/ .el-form-item__content .el-row{
    margin-bottom: 0;
  }
  .element-item.expr /deep/ .el-form-item__content .el-form-item__error{
   left: 120px;
  }
  .expr-title{
    width: 120px;
    padding-right: 20px;
    text-align: right;
    color: #666;
    font-size: 14px;
    letter-spacing: 0;
    line-height: 22px;
  }
  /deep/.promqlInput .expr-title{
    padding-right: 0;
  }
  .width-option{
    width: 190px;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    overflow: hidden;
  }
  .dashes-box{
    height:100%;
    width:80%;
    overflow: hidden;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .type /deep/ .el-input--suffix{
    width: calc(100% - 30px);
  }
  .type /deep/ .el-scrollbar__view.el-select-dropdown__list{
    width: 256px;
  }
  .el-row {
    margin-bottom: 20px;
    line-height: 32px;
  }
  .el-row:last-child  {
    margin-bottom: 0;
  }
  .nz-btn-edit-ok{
    position: absolute;
    bottom: 0;
    right:0;
  }
  .nz-btn-edit-esc{
    position: absolute;
    bottom: 0;
    left:0;
  }

  /* begin--搜索框*/
  .endpoint-asset-search {
    display: inline-block;
    position: relative;
    margin-top: -16px;
  }
  .endpoint-asset-search button {
    height: 22px !important;
  }
  .endpoint-asset-search-dropdown {
    position: absolute;
    top: 25px;
    background-color: #444;
    border-radius: 4px;
    width: 44px;
    left: 0;
  }
  .endpoint-asset-search-dropdown-item {
    text-align: center;
    line-height: 22px;
    height: 22px;
    cursor: default;
    color: white;
    font-size: 12px;
  }
  .endpoint-asset-label-txt {
    display: inline-block;
    width: 19px;
    text-align: center;
  }
  .endpoint-asset-search-dropdown-item:first-of-type {
    border-radius: 4px 4px 0 0;
  }
  .endpoint-asset-search-dropdown-item:last-of-type {
    border-radius: 0 0 4px 4px;
  }
  .endpoint-asset-search-dropdown-item:hover {
    background-color: #222;
    color: #ff9900;
  }
  .endpoint-asset-search-input {
    display: inline-block;
    width: 150px;
    vertical-align: top;
  }
  /* end--搜索框*/

  /* begin--table*/
  .endpoint-sub-table {
    padding-top: 30px;
    height: 440px;
  }
  .line-100 {
    margin-bottom: 3px;
  }
  .endpoint-sub-table-head {
    line-height: 28px;
    height: 30px;
  }
  .endpoint-sub-table-row, .endpoint-sub-table-row-disabled {
    line-height: 28px;
    height: 30px;
    color: #656565;
  }
  .endpoint-sub-table-row:hover {
    background-color: #dadada;
    cursor: default;
  }
  .endpoint-sub-table-row-active {
    background-color: #dadada;
  }
  .endpoint-sub-table-row-selected {
    background-color: #656565;
    color: white;
  }
  .endpoint-sub-table-col {
    display: inline-block;
    width: calc(50% - 15px);
    padding-left: 10px;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }
  .endpoint-sub-table-paginate-all {
    position: absolute;
    left: 10px;
    bottom: 17px;
    color: #5a5a5a;
  }
  .endpoint-sub-table-body {
    font-size: 15px;
    position: relative;
    overflow: auto;
    height: calc(100% - 34px);
  }
  .endpoint-sub-table-body-dialog {
    width: 100%;
    height: 100%;
    background-color: #e9ebec;
    position: absolute;
    opacity: 0.2;
  }
  .endpoints-clear-btn {
    margin: 6px 0 0 7px;
  }
  /* end--table*/
</style>

