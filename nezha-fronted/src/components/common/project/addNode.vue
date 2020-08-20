<template>
  <div class="right-box right-box-edit-endpoint" v-clickoutside="clickOutside">
    <!-- begin--顶部按钮-->
    <div class="right-box-top-btns">
      <!--<button id="edit-ep-del" type="button" @click="del" class="nz-btn nz-btn-size-normal nz-btn-size-alien nz-btn-style-light ">-->
        <!--<span class="right-box-top-btn-icon"><i class="el-icon-delete"></i></span>-->
        <!--<span class="right-box-top-btn-txt">{{$t('overall.delete')}}</span>-->
      <!--</button>-->
    </div>
    <!-- end--顶部按钮-->

    <!-- begin--标题-->
    <div class="right-box-title">
      <!--{{$t("project.endpoint.editEndpoint") + "  ID：" + nodeData.id}}-->
      Add Module
    </div>
    <!-- end--标题-->

    <!-- begin--表单-->
    <el-scrollbar class="right-box-form-box">
      <el-form class="right-box-form  right-box-form-left" ref="form" :model="form" label-width="160px" :rules="rules">
        <el-form-item label="Module Name" prop="modelId">
          <el-select v-model="form.modelId" placeholder=""  popper-class="asset-dropdown">
            <el-option
              v-for="item in moduleDataS.module"
              :key="item.id"
              :label="item.name"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="Label" prop="imgId">
          <el-select v-model="form.imgId" placeholder=""  popper-class="asset-dropdown">
            <el-option
              v-for="item in iconArray"
              :key="item.id"
              :label="item.label"
              :value="item.id">
              <span style="float: left;width: 50%">
                <img :src="item.image" />
              </span>
              <span style="float: right; color: #8492a6; font-size: 13px">{{ item.imageName }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <!--<div  class="right-box-sub-title">-->
          <!--<span>{{$t('alert.config.expr')}}</span>-->
          <!--<span class="float-right" @click="addExpression"><i style="font-size: 16px; cursor: pointer;" class="nz-icon nz-icon-create-square"></i></span>-->
        <!--</div>-->
        <!--<el-row class="element-item" style="" v-for="index of promqlKeys.length" :key="'ele' + index">-->
          <!--<promql-input-->
            <!--:ref="'promql-'+(index-1)"-->
            <!--:id="promqlKeys[index-1]"-->
            <!--:key="promqlKeys[index-1]"-->
            <!--:expression-list="expressions"-->
            <!--:index="index-1"-->
            <!--:styleType="2"-->
            <!--:plugins="['metric-selector', 'metric-input', 'remove']"-->
            <!--@change="expressionChange"-->
            <!--@removeExpression="removeExpression"-->
          <!--&gt;</promql-input>-->
          <!--<el-row>-->
            <!--<template>-->
              <!--<el-col style="width: 120px; padding-right: 20px; text-align: right; color: #666">-->
                <!--{{$t('dashboard.panel.chartForm.legend')}}&nbsp;-->
                <!--<el-popover :content="$t('dashboard.panel.chartForm.legendTip')" placement="top" width="150" trigger="hover">-->
                  <!--<i slot="reference" class="nz-icon nz-icon-info-normal" style="font-size: 12px; -webkit-transform:scale(0.75);display:inline-block;" @mouseover="rz"></i>-->
                <!--</el-popover>-->
              <!--</el-col>-->
              <!--<el-col style="width: calc(100% - 120px);">-->
                <!--<el-input v-model="legends[index-1]" type="text" size="small"></el-input>-->
              <!--</el-col>-->
            <!--</template>-->
          <!--</el-row>-->
        <!--</el-row>-->
      </el-form>
    </el-scrollbar>

    <!-- end--表单-->

    <!--底部按钮-->
    <div class="right-box-bottom-btns">
      <button @click="esc" id="ep-edit-esc" class="nz-btn nz-btn-size-normal nz-btn-style-light nz-btn-min-width-100">
        <span>{{$t('overall.cancel')}}</span>
      </button>
      <button @click="onSubmit" id="ep-edit-save" class="nz-btn nz-btn-size-normal nz-btn-style-normal nz-btn-min-width-100">
        <span>{{$t('overall.save')}}</span>
      </button>
    </div>
  </div>
</template>

<script>
  import promqlInput from "@/components/page/dashboard/explore/promqlInput";
  import {getUUID,resetZIndex} from "@/components/common/js/common";
  import  a from './a.png'
  import  b from './b.png'
  import  c from './c.png'
  import  d from './d.png'
  import  e from './e.png'
  import  f from './f.png'
  var rz = {
    methods: {
      rz(e) {
        resetZIndex(e);
      }
    }
  };
	export default {
		name:"addNode",
    components:{
      'promql-input': promqlInput,
    },
    props:{
      nodeData:{},
      moduleDataS:{}
    },
    watch:{
      nodeData:{
        handler(n){
         for(let key in this.form){
           this.form[key]=n[key]
         }
         this.form.modelId=n.id;
       },
       immediate: true,
       deep: true,
      },
      moduleDataS:{
        handler(n){
          console.log(n)
        },
        immediate: true,
        deep: true,
      }
    },
    data(){
		  return{
        form:{
          modelId:'',
          imgId:'',
        },
        promqlKeys:[],
        expressions: [],
        promqlCount:0,
        elementIds:[],
        legends:[],
        rules:{
          modelId:[
            { required: true, message: '请选择module', trigger: 'blur' },
          ],
          imgId:[
            { required: true, message: '请选择module', trigger: 'blur' },
          ],
        },
        nodesArray:[
          { id: 1, label: "model1",
            image: 'https://ss0.bdstatic.com/70cFuHSh_Q1YnxGkpoWK1HF6hhy/it/u=1906469856,4113625838&fm=26&gp=0.jpg',
            shape:'image',shapeProperties:{useImageSize:false},
            x:1,y:-63,
          },
          {id: 2, label: "model2", },
          {id: 3, label: "model3",},
          {id: 4, label: "model4", },
          {id: 5, label: "model5",},
          {id: 6, label: "model6",},
          {id: 7, label: "model7",},

          {id: 9, label: "model9", },
          {id: 10, label: "model10", },
          {id: 11, label: "model11",},
          {id: 12, label: "model12",},
          {id: 13, label: "model13",},
          {id: 14, label: "model14",},
        ],
        iconArray:[
          {id:1,image:a,imageName:"module1"},
          {id:2,image:b,imageName:"module1"},
          {id:3,image:c,imageName:"module1"},
          {id:4,image:d,imageName:"module1"},
          {id:5,image:e,imageName:"module1"},
          {id:6,image:f,imageName:"module1"},
          // {id:7,img:'./a.png',label:'model',},
        ],
      }
    },
    methods:{
      onSubmit(){
        this.$refs['form'].validate((valid) => {
          if (valid) {
            let module=this.moduleDataS.module.find(item=>item.id===this.form.modelId);
            let img=this.iconArray.find(item=>item.id===this.form.imgId);
            let model=Object.assign({...this.form},{...module},{...img},{id:this.form.modelId,shape:'image',shapeProperties:{useImageSize:false}},);
            model.label=model.name
            this.$emit('addModel',model)
          }
        });

      },
      expressionChange: function () {

      },
      addExpression() {
        this.expressions.push('');
        this.legends.push('');
        this.promqlKeys.push(getUUID());
        this.elementIds.push("");
        this.promqlCount++;
      },
      removeExpression(index) {
        if (this.promqlCount > 1) {
          this.expressions.splice(index, 1);
          this.legends.splice(index, 1);
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
      }
    },

	}
</script>

<style scoped>
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


  .el-row {
    margin-bottom: 20px;
  }
  .el-row:last-child  {
    margin-bottom: 0;
  }
  .el-col {
    border-radius: 4px;
  }
  .bg-purple {
    background: white;
  }
  .grid-content {
    border-radius: 4px;
    min-height: 36px;
  }

  .common-float-left {
    float: left;
    display:inline-block;
  }

  .el-inner {
    width: 200px;
    border-top-width: 0px;
    border-left-width: 0px;
    border-right-width: 0px;
    border-bottom-width: 10px;
    border-color:red;
    /*outline: medium;*/
  }

  .element-bottom-border {
    padding-bottom: 5px;
    border-bottom: 1px solid #dfe7f2;
    margin-top: 15px;
  }
  /*metric样式--begin*/
  .element-item {
    padding: 20px 0;
    border-bottom: 1px dashed #dfe7f2;
    width: 100%;
  }
  /*metric样式--end*/
  .label-center{
    vertical-align: middle;
    line-height: 34px;
  }

  .z-top {
    z-index: 2900;
  }
</style>

<style lang="scss">
  .right-box-edit-endpoint .el-pagination__total {
    float: left;
  }
  right-box-edit-endpoint .pagination {
    padding-top: 12px;
    text-align: center;
  }

  .endpoint-sub-table-paginate .el-pager li, .endpoint-sub-table-paginate .el-pagination .btn-next, .endpoint-sub-table-paginate .el-pagination .btn-prev {
    font-size: 13px;
    min-width: 20px !important;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    text-align: center;
    border: 1px solid rgba(154,154,154,0.20);
    border-radius: 2px;
    border-radius: 2px;
  }
  .endpoint-sub-table-paginate  .el-pagination.is-background .el-pager li:not(.disabled).active {
    color: white !important;
  }
  .endpoint-sub-table-paginate .el-pagination.is-background .el-pager li:not(.disabled):hover {
    color: #666;
  }
  .right-box-edit-endpoint .el-pagination .el-pager li.btn-quicknext, .right-box-edit-endpoint .el-pager li.btn-quickprev {
    line-height: 20px;
  }
  .right-box-edit-endpoint .el-pagination .el-pager .more::before {
    line-height: 20px;
  }
  .right-box-edit-endpoint .el-pager li.number{
    font-family: NotoSansSC-Regular;
    color: #666666;
    letter-spacing: 0;
    font-weight:normal;
  }
  .right-box-edit-endpoint .el-pager li.number.active{
    font-family: NotoSansSC-Regular;
    color: #FFFFFF;
    letter-spacing: 0;
  }

  .endpoint-sub-table-paginate .el-pagination.is-background .el-pager li:not(.disabled).active {
    background-color: $global-text-color-active;
    border-radius: 2px;
    border-radius: 2px;
  }
  .right-box-edit-endpoint .el-pager li:hover, .right-box-edit-endpoint .el-pagination .btn-next:hover, .right-box-edit-endpoint .el-pagination .btn-prev:hover {
    font-family: NotoSansSC-Regular;
    color: #666666;
    letter-spacing: 0;
    font-weight:normal;
  }
  .right-box-edit-endpoint .el-pagination__sizes .el-input .el-input__inner, .right-box-edit-endpoint .el-pagination__editor.el-input .el-input__inner{
    height: 20px;
    border-color: rgba(154,154,154,0.20);
  }
  .right-box-edit-endpoint .el-pagination__sizes .el-input .el-input__inner:hover{
    border-color: rgba(154,154,154,0.20);
  }
</style>
