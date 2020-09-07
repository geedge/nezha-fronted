<template>
  <div class="mc" @click.self="clickOutside">
    <div class="right-box right-box-edit-endpoint">
    <!-- begin--顶部按钮-->
    <div class="right-box-top-btns" v-if="nodeData.id">
      <button id="edit-ep-del" type="button" @click="del" class="nz-btn nz-btn-size-normal nz-btn-size-alien nz-btn-style-light ">
        <span class="right-box-top-btn-icon"><i class="el-icon-delete"></i></span>
        <span class="right-box-top-btn-txt">{{$t('overall.delete')}}</span>
      </button>
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
        <el-form-item label="Module Name" prop="moduleId">
          <el-select v-model="form.moduleId" placeholder=""  popper-class="asset-dropdown" size="small">
            <el-option
              v-for="item in moduleDataS.module"
              :key="item.id"
              :label="item.name"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="Icon" prop="iconId" class="icon">
          <el-select v-model="form.iconId" placeholder=""  popper-class="asset-dropdown" size="small" :loading="imgageLoading">
            <div slot="prefix" class="sel-image">
              <img v-if="form.iconId" :src="selImage.image" style="height: 28px"/>
              <span v-if="form.iconId" class="sel-image-name">{{selImage.imageName}}</span>
            </div>
            <el-option
              v-for="item in iconArray"
              :key="item.id"
              :label="item.label"
              :value="item.id">
              <span style="float: left;width: 50%">
                <img :src="item.image" style="width: 24px;height: 32px"/>
              </span>
              <span style="float: right; color: #8492a6; font-size: 13px">{{ item.imageName }}</span>
            </el-option>
          </el-select>
          <el-upload
            class="avatar-uploader"
            action=" "
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
            :auto-upload="true"
          >
           上传文件
          </el-upload>
        </el-form-item>
        <div  class="right-box-sub-title">
          <span>{{$t('alert.config.expr')}}</span>
          <span class="float-right" @click="addExpression"><i style="font-size: 16px; cursor: pointer;" class="nz-icon nz-icon-create-square"></i></span>
        </div>
        <el-row class="element-item expr" style="" v-for="index of promqlKeys.length" :key="'ele' + index">
          <el-form-item  :rules="{required: true,message: '名称不能为空', trigger: 'blur'}" :prop="'name.' + (index-1)">
            <el-row>
              <template>
                <el-col class="expr-title" style="">
                  {{$t('project.topology.chartName')}}
                </el-col>
                <el-col style="width: calc(100% - 140px);">
                  <el-input
                    v-model="form.name[index-1]"
                    type="text"
                    size="small"
                  ></el-input>
                </el-col>
                <el-col  style="width: 20px"> <i class="el-icon-minus" @click="removeExpression(index-1)"></i></el-col>
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
          <el-row>
            <template>
              <el-col class="expr-title">
                {{$t('dashboard.panel.chartForm.legend')}}&nbsp;
                <el-popover :content="$t('dashboard.panel.chartForm.legendTip')" placement="top" width="150" trigger="hover">
                  <i slot="reference" class="nz-icon nz-icon-info-normal" style="font-size: 12px; -webkit-transform:scale(0.75);display:inline-block;" @mouseover="rz"></i>
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
      <button @click="esc" id="ep-edit-esc" class="nz-btn nz-btn-size-normal nz-btn-style-light nz-btn-min-width-100">
        <span>{{$t('overall.cancel')}}</span>
      </button>
      <button @click="onSubmit" id="ep-edit-save" class="nz-btn nz-btn-size-normal nz-btn-style-normal nz-btn-min-width-100">
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
		name:"addNode",
    components:{
      'promql-input': promqlInput,
    },
    props:{
      nodeData:{},
      moduleDataS:{},
    },
    mixins: [rz],
    watch:{
      nodeData:{
        handler(n){
         this.form.moduleId=n.id;
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
      },
      moduleDataS:{
        handler(n){
          // console.log(n)
        },
        immediate: true,
        deep: true,
      },
      'form.iconId':{
        handler(n){
          if(n){
            this.selImage=this.iconArray.find(item=>item.id===n)
          }
        },
        immediate: true,
        deep: true,
      }
    },
    data(){
		  return{
        form:{
          moduleId:'',
          iconId:'',
          name:[],
        },
        selImage:'',
        file:'',
        uploadFileList:[],
        unitOptions: chartDataFormat.unitOptions(),
        promqlKeys:[],
        expressions: [],
        promqlCount:0,
        elementIds:[],
        legends:[],
        unit:[],
        imgageLoading:false,
        rules:{
          moduleId:[
            { required: true, message: '请选择module', trigger: 'blur' },
          ],
          iconId:[
            { required: true, message: '请选择icon', trigger: 'blur' },
          ],
        },
        iconArray:[],
      }
    },
    mounted(){
      // this.addExpression();
      this.addNodeInit();
      if( this.nodeData.expressions){
        this.nodeData.expressions.forEach((item,index)=>{
          this.$refs['promql-'+(index)][0].metricChange(this.expressions[index]);
        })
      }
    },
    methods:{
      addNodeInit(selImageId){
        this.$get('/project/topo/icon').then(res=>{
          this.imgageLoading=true;
          this.iconArray=res.data.list;
          this.iconArray.forEach((item,index)=>{
            item.imageName=item.name;
            delete item.name;
            this.dealImg(`/project/topo/icon/${item.id}`).then((data)=>{
              item.image=data;
              if(index===this.iconArray.length-1){
                setTimeout(()=>{
                  this.iconArray=[...this.iconArray];
                  this.imgageLoading=false;
                  if(selImageId || this.nodeData.iconId){
                    this.form.iconId=selImageId || this.nodeData.iconId;
                  }
                },100)
              }
            })
          });
        })
      },
      dealImg(url) {
        // 处理后端传过来的图片流乱码问题
        if (url) {
          return new Promise((resolve,reject)=>{
            this.$axios
              .get(url, {
                responseType: "arraybuffer"
              })
              .then(res => {
                return ("data:image/jpeg;base64," +btoa(new Uint8Array(res.data).reduce((data, byte) => data + String.fromCharCode(byte), "")));
              })
              .then(data => {
                resolve(data)
              })
              .catch(err => {
              });
          })
        }
      },
      onSubmit(){
        this.$refs['form'].validate((valid) => {
          if (valid) {
            let module=this.moduleDataS.module.find(item=>item.id===this.form.moduleId);
            let img=this.iconArray.find(item=>item.id===this.form.iconId);
            let model=Object.assign({...this.form},{...module},{...img},{id:this.form.moduleId,shape:'image',shapeProperties:{useImageSize:false}},);
            model.label=model.name;
            model.expressions=[];
            this.promqlKeys.forEach((item,index)=>{
              model.expressions.push({
                "name": this.form.name[index],
                "unit": this.unit[index],
                "metric": this.expressions[index],
                "legend": this.legends[index],
              })
            });
            console.log(this.form.name,this.unit,model);
            this.$emit('addModel',model);
          }
        });

      },
      expressionChange: function () {

      },
      addExpression() {
        this.expressions.push('');
        this.legends.push('');
        this.form.name.push('');
        this.unit.push('');
        this.promqlKeys.push(getUUID());
        this.elementIds.push("");
        this.promqlCount++;
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
      beforeAvatarUpload(file){
        let isJPG = (file.type === 'image/jpeg' || file.type === 'image/png');

        const isLt2M = file.size / 1024 / 1024 < 2;

        if (!isJPG) {
          this.$message.error('上传图片只能是 JPG/png 格式!');
        }
        if (!isLt2M) {
          this.$message.error('上传图片大小不能超过 2MB!');
        }
        this.file=file;
        this.upload();
        return false;
      },
      handleAvatarSuccess(file,res){
        console.log(res);
      },
      upload() {
        let form = new FormData();
        form.append("file",this.file);
        let fileName=this.file.name;
        form.append("name", fileName.substring(0, fileName.lastIndexOf(".")));
        this.$post('/project/topo/icon',form,{'Content-Type': 'multipart/form-data'}).then(res => {
          if(res.code ==  200 ){
            this.$message({duration: 2000, type: 'success', message: this.$t("tip.saveSuccess")});
            this.addNodeInit(res.data.id);
          }else{
            this.$message.error(res.msg);
          }
        })
      },
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
  /deep/ .avatar-uploader{
    display: inline-block;
    color: #1989fa;
    vertical-align: top;
  }
  /deep/.right-box-form .icon  .el-select{
    width: 60%;
  }
  .el-icon-minus{
    vertical-align: middle;
    margin-left: 5px;
  }
  .sel-image{
    height: 28px;
    line-height: 28px;
    width: 300px;
    text-align: left;
  }
  .sel-image-name{
    float: right;
    display: inline-block;
    height: 28px;
    line-height: 28px;
    color: #333333;
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
  .icon /deep/ .el-input.el-input--prefix.el-input--suffix{
    border: 1px solid #DCDFE6;
    height: 28px;
    width: calc(100% - 10px);
  }
  .icon /deep/ .el-input__inner{
    display: none;
  }
  .icon /deep/ .el-input__prefix{
    height: 28px;
    line-height: 28px;
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
    line-height: 32px;
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
