<template>
  <div class="right-box right-box-edit-endpoint">
    <!-- begin--顶部按钮-->
    <div class="right-box-top-btns">
      <button id="edit-ep-del" type="button" @click="del" class="nz-btn nz-btn-size-normal nz-btn-size-alien nz-btn-style-light ">
        <span class="right-box-top-btn-icon"><i class="el-icon-delete"></i></span>
        <span class="right-box-top-btn-txt">{{$t('overall.delete')}}</span>
      </button>
    </div>
    <!-- end--顶部按钮-->

    <!-- begin--标题-->
    <div class="right-box-title">{{$t("project.endpoint.editEndpoint") + "  ID：" + lineData.id}}</div>
    <!-- end--标题-->

    <!-- begin--表单-->
    <el-scrollbar class="right-box-form-box">
      <el-form ref="form" :model="form" label-width="120px" :rules="rules">
        <el-form-item label="Id">
          <el-input v-model="form.lineId"></el-input>
        </el-form-item>
        <el-form-item label="箭头方向" prop="arrows">
          <el-select v-model="form.arrows" placeholder="请选择活动区域">
            <el-option label="from" value="from"></el-option>
            <el-option label="to" value="to"></el-option>
            <el-option label="from;to" value="from;to"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="color">
          <el-color-picker
            v-model="form.color"
            :predefine="predefineColors">
          </el-color-picker>
        </el-form-item>
        <el-form-item label="Label">
          <el-input v-model="form.label"></el-input>
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
            label:n.label,
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
          lineId:'',
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
            { required: true, message: '请输入活动名称', trigger: 'change' },
          ],
        }
      }
    },
    methods:{
      onSubmit(){
        let model=Object.assign({id:this.form.lineId},{...this.form},{color: {color:this.form.color,highlight:this.form.color,hover:this.form.color,opacity:1.0}});
        this.$emit('addLine',model)
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

