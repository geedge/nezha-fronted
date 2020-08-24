<template>
  <div class="mc" @click.self="clickOutside">
    <div class="right-box right-box-edit-endpoint">
      <!-- begin--顶部按钮-->
      <div class="right-box-top-btns">
        <!--<button id="edit-ep-del" type="button" @click="del" class="nz-btn nz-btn-size-normal nz-btn-size-alien nz-btn-style-light ">-->
        <!--<span class="right-box-top-btn-icon"><i class="el-icon-delete"></i></span>-->
        <!--<span class="right-box-top-btn-txt">{{$t('overall.delete')}}</span>-->
        <!--</button>-->
      </div>
      <!-- end--顶部按钮-->

      <!-- begin--标题-->
      <div class="right-box-title">Add Line</div>
      <!-- end--标题-->

      <!-- begin--表单-->
      <el-scrollbar class="right-box-form-box">
        <el-form ref="form" :model="form" label-width="120px" :rules="rules">
          <el-form-item label="Line Name" prop="lineName" class="line-name">
            <el-input v-model="form.lineName"></el-input>
          </el-form-item>
          <el-row class="form-title">Option</el-row>
          <el-form-item label="width" prop="width" class="line-name">
            <el-input v-model="form.width"></el-input>
          </el-form-item>
          <el-form-item label="roundness"  class="line-name">
            <el-input v-model="form.roundness"></el-input>
          </el-form-item>
          <el-form-item label="type" class="line-name">
            <el-select v-model="form.type" placeholder="" :popper-append-to-body="false">
              <!--'dynamic', 'continuous', 'discrete', 'diagonalCross', 'straightCross', 'horizontal', 'vertical', 'curvedCW', 'curvedCCW', 'cubicBezier'-->
              <el-option label="dynamic" value="dynamic"></el-option>
              <el-option label="continuous" value="continuous"></el-option>
              <el-option label="discrete" value="discrete"></el-option>
              <el-option label="diagonalCross" value="diagonalCross"></el-option>
              <el-option label="straightCross" value="straightCross"></el-option>
              <el-option label="horizontal" value="horizontal"></el-option>
              <el-option label="vertical" value="vertical"></el-option>
              <el-option label="curvedCW" value="curvedCW"></el-option>
              <el-option label="cubicBezier" value="cubicBezier"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="箭头方向" prop="arrows" class="arrows">
            <el-select v-model="form.arrows" placeholder="" :popper-append-to-body="false">
              <div slot="prefix">
                <img v-if="form.arrows=='from'" src="./leftArrow.png" />
                <img v-if="form.arrows=='to'" src="./rightArrow.png" />
                <img v-if="form.arrows=='from;to'" src="./LRArrow.png" />
                <img v-if="form.arrows=='0'" src="./noArrow.png" />
              </div>
              <el-option label="from" value="from"><img src="./leftArrow.png" /></el-option>
              <el-option label="to" value="to"><img src="./rightArrow.png" /></el-option>
              <el-option label="from;to" value="from;to"><img src="./LRArrow.png" /></el-option>
              <el-option label="" value="0"><img src="./noArrow.png" /></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="color" class="color">
            <div class="color-show" @click="colorPickerClick">
              <div class="color-show-left" :style="{background:form.color}"></div>
              <span> {{form.color}}</span>
            </div>
            <div class="color-content" ref="color-content">
              <el-color-picker
                v-model="form.color"
                :predefine="predefineColors"
                ref="colorPicker"
              >
              </el-color-picker>
            </div>
          </el-form-item>
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
  export default {
    name:"addLine",
    props:{
      lineData:{},
    },
    watch:{
      lineData:{
        handler(n){
          this.form={
            arrows:n.arrows,
            color:n.color,
            lineId:n.id,
          }
        },
        immediate: true,
        deep: true,
      }
    },
    data(){
      return{
        form:{
          arrows:'',
          label:'',
          color:'#1e90ff',
          lineName:'',
          lineId:'',
          width:'',
          type:'',
          roundness:'',
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
        rules:{
          arrows: [
            { required: true, message: '', trigger: 'change' },
          ],
          lineName: [
            { required: true, message: '', trigger: 'change' },
          ],
        }
      }
    },
    methods:{
      onSubmit(){

        this.$refs['form'].validate((valid) => {
          if (valid) {
            let model=Object.assign({id:undefined},{...this.form},{color: {color:this.form.color,highlight:this.form.color,hover:this.form.color,opacity:1.0}});
            model.width = parseInt(model.width) || 4;
            model.smooth={
              roundness:model.roundness,
              type:model.type ,
            };
            this.$emit('addLine',model);
          }
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
        this.$refs['colorPicker'].showPicker=true;
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
    width: calc(100% - 30px);
  }
  .color-show-left{
    width: 18px;
    height: 18px;
    border: 1px solid #E7EAED;
    border-radius: 5px;
    margin: 0 5px;
  }
  .line-name{
    width: calc(100% - 30px);
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
    opacity: 0.6;
  }
  .arrows /deep/ .el-input.el-input--prefix.el-input--suffix{
    border: 1px solid #DCDFE6;
    height: 41px;
    width: calc(100% - 30px);
  }
  .arrows /deep/ .el-input__inner{
    display: none;
  }
  /deep/ .el-select{
    width: 262px;
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

